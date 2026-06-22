import * as Y from 'yjs';
import { WebrtcProvider } from 'y-webrtc';
import type { Awareness } from 'y-protocols/awareness';
import type { PresenceUser } from '@gv/shared';
import { BaseSyncProvider } from './interface.js';

export interface P2pOptions {
  /**
   * Signaling servers for cross-device WebRTC discovery. Leave empty (default)
   * for zero-infra same-origin collaboration over BroadcastChannel only — set
   * your own self-hosted signaling URL(s) to enable cross-device collaboration.
   */
  signaling?: string[];
  /** Optional shared secret gating the room (end-to-end encrypts the room). */
  password?: string;
  /** This client's presence identity. */
  user?: PresenceUser;
}

/**
 * Live collaboration via y-webrtc. Peers in the same room sync the Y.Doc and
 * share awareness (presence/cursors). Same-origin tabs always sync through
 * BroadcastChannel — no server needed; cross-device peers connect over WebRTC
 * once a signaling server is configured. Composes on top of a local
 * persistence provider on the same doc.
 */
export class P2pProvider extends BaseSyncProvider {
  readonly kind = 'p2p' as const;
  private provider: WebrtcProvider | null = null;

  constructor(private readonly opts: P2pOptions = {}) {
    super();
  }

  get awareness(): Awareness | undefined {
    return this.provider?.awareness;
  }

  async connect(doc: Y.Doc, room: string): Promise<void> {
    this.setStatus('connecting');
    this.provider = new WebrtcProvider(room, doc, {
      signaling: this.opts.signaling ?? [],
      ...(this.opts.password ? { password: this.opts.password } : {}),
    });
    if (this.opts.user) this.provider.awareness.setLocalStateField('user', this.opts.user);
    this.provider.on('synced', () => this.setStatus('connected'));
    // BroadcastChannel sync is effectively immediate for same-origin peers.
    this.setStatus('connected');
  }

  /** Update this client's presence identity. */
  setUser(user: PresenceUser): void {
    this.provider?.awareness.setLocalStateField('user', user);
  }

  async disconnect(): Promise<void> {
    this.provider?.destroy();
    this.provider = null;
    this.setStatus('disconnected');
  }
}
