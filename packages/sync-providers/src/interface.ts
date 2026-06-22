import type * as Y from 'yjs';
import type { Awareness } from 'y-protocols/awareness';
import type { ConnectionStatus, SyncProviderKind } from '@gv/shared';

export type StatusListener = (status: ConnectionStatus) => void;

/**
 * SyncProvider — operates on a Y.Doc and nothing else. Providers compose:
 * a local-persistence provider is always underneath, optionally layered with
 * a live/sync provider (p2p / relay / file-sync / cloud). The app picks one
 * per document and never knows which concrete implementation it got.
 */
export interface SyncProvider {
  readonly kind: SyncProviderKind;
  connect(doc: Y.Doc, room: string): Promise<void>;
  disconnect(): Promise<void>;
  /** Live providers expose presence; persistence-only providers do not. */
  readonly awareness?: Awareness;
  status(): ConnectionStatus;
  onStatus(listener: StatusListener): () => void;
  /** File-sync: flush pending updates to disk. */
  flush?(): Promise<void>;
  /** File-sync: apply all peer logs found on disk. */
  mergeOnOpen?(): Promise<void>;
}

/** Small base that manages status listeners; concrete providers extend it. */
export abstract class BaseSyncProvider implements SyncProvider {
  abstract readonly kind: SyncProviderKind;
  private _status: ConnectionStatus = 'disconnected';
  private readonly listeners = new Set<StatusListener>();

  abstract connect(doc: Y.Doc, room: string): Promise<void>;
  abstract disconnect(): Promise<void>;

  status(): ConnectionStatus {
    return this._status;
  }

  onStatus(listener: StatusListener): () => void {
    this.listeners.add(listener);
    return () => this.listeners.delete(listener);
  }

  protected setStatus(status: ConnectionStatus): void {
    if (status === this._status) return;
    this._status = status;
    for (const l of this.listeners) l(status);
  }
}
