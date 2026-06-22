import * as Y from 'yjs';
import { BaseSyncProvider } from './interface.js';

/**
 * Minimal filesystem surface for the file-sync provider, implemented by the app
 * over PlatformAdapter.fs (a folder replicated by iCloud / Dropbox / Drive /
 * OneDrive / Syncthing / Git). Keeps this package platform-agnostic.
 */
export interface FileSyncFs {
  /** Names of files in the sync folder. */
  list(): Promise<string[]>;
  read(name: string): Promise<Uint8Array | null>;
  write(name: string, bytes: Uint8Array): Promise<void>;
  /** Optional: notify when the folder's contents change (other devices synced). */
  watch?(onChange: () => void): Promise<() => void>;
}

export interface FileSyncOptions {
  fs: FileSyncFs;
  /** Stable per-device id; this device writes only its own log file. */
  deviceId: string;
  debounceMs?: number;
}

const ORIGIN = 'gv-file-sync';

/**
 * Asynchronous, server-less sync via a cloud-replicated folder. Each device
 * writes ONLY its own per-device log (`<room>__<deviceId>.ylog`, a Yjs state
 * update), so concurrent devices never clobber a shared file; merge-on-open and
 * on every folder change applies all peers' logs (idempotent, order-independent
 * — Yjs converges). Async, not live: pair with P2P/relay for live cursors.
 */
export class FileSyncProvider extends BaseSyncProvider {
  readonly kind = 'file-sync' as const;
  private doc: Y.Doc | null = null;
  private prefix = '';
  private own = '';
  private timer: ReturnType<typeof setTimeout> | null = null;
  private unwatch: (() => void) | null = null;
  private readonly debounceMs: number;

  constructor(private readonly opts: FileSyncOptions) {
    super();
    this.debounceMs = opts.debounceMs ?? 800;
  }

  async connect(doc: Y.Doc, room: string): Promise<void> {
    this.setStatus('connecting');
    this.doc = doc;
    this.prefix = `${room}__`;
    this.own = `${this.prefix}${this.opts.deviceId}.ylog`;
    await this.mergeOnOpen();
    doc.on('update', this.onUpdate);
    if (this.opts.fs.watch) {
      this.unwatch = await this.opts.fs.watch(() => void this.mergeOnOpen());
    }
    await this.flush();
    this.setStatus('connected');
  }

  /** Apply every device's log found in the folder onto the doc. */
  mergeOnOpen = async (): Promise<void> => {
    if (!this.doc) return;
    const names = await this.opts.fs.list();
    for (const name of names) {
      if (!name.startsWith(this.prefix) || !name.endsWith('.ylog')) continue;
      const bytes = await this.opts.fs.read(name);
      if (bytes && bytes.byteLength > 0) Y.applyUpdate(this.doc, bytes, ORIGIN);
    }
  };

  private onUpdate = (_update: Uint8Array, origin: unknown): void => {
    if (origin === ORIGIN) return; // don't echo merges back to disk in a loop
    if (this.timer) clearTimeout(this.timer);
    this.timer = setTimeout(() => void this.flush(), this.debounceMs);
  };

  /** Write this device's current full state to its own log file. */
  flush = async (): Promise<void> => {
    if (!this.doc) return;
    await this.opts.fs.write(this.own, Y.encodeStateAsUpdate(this.doc));
  };

  async disconnect(): Promise<void> {
    if (this.timer) clearTimeout(this.timer);
    this.doc?.off('update', this.onUpdate);
    this.unwatch?.();
    this.unwatch = null;
    await this.flush();
    this.doc = null;
    this.setStatus('disconnected');
  }
}
