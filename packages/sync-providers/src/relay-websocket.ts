import * as Y from 'yjs';
import { WebsocketProvider } from 'y-websocket';
import type { Awareness } from 'y-protocols/awareness';
import type { PresenceUser } from '@gv/shared';
import { BaseSyncProvider } from './interface.js';

export interface RelayOptions {
  /** Base WebSocket URL of a self-hosted relay, e.g. wss://gv-relay.fly.dev. */
  url: string;
  /** Optional auth token / params passed to the relay. */
  params?: Record<string, string>;
  /** Node only: a WebSocket implementation (e.g. `ws`). Browsers use the native one. */
  WebSocketPolyfill?: typeof WebSocket;
  user?: PresenceUser;
}

/**
 * Live + persistent collaboration via a self-hosted relay (Hocuspocus /
 * y-websocket). Always-on, survives offline, works cross-device — deployed for
 * free on Fly/Render/Oracle/NAS (see @gv/relay-server). Composes on top of the
 * local persistence base, so the app stays usable while the relay reconnects.
 */
export class RelayProvider extends BaseSyncProvider {
  readonly kind = 'relay' as const;
  private provider: WebsocketProvider | null = null;

  constructor(private readonly opts: RelayOptions) {
    super();
  }

  get awareness(): Awareness | undefined {
    return this.provider?.awareness;
  }

  async connect(doc: Y.Doc, room: string): Promise<void> {
    this.setStatus('connecting');
    this.provider = new WebsocketProvider(this.opts.url, room, doc, {
      params: this.opts.params,
      WebSocketPolyfill: this.opts.WebSocketPolyfill,
    });
    if (this.opts.user) this.provider.awareness.setLocalStateField('user', this.opts.user);
    this.provider.on('status', (e: { status: string }) => {
      if (e.status === 'connected') this.setStatus('connected');
      else if (e.status === 'connecting') this.setStatus('connecting');
      else this.setStatus('disconnected');
    });
  }

  setUser(user: PresenceUser): void {
    this.provider?.awareness.setLocalStateField('user', user);
  }

  async disconnect(): Promise<void> {
    this.provider?.destroy();
    this.provider = null;
    this.setStatus('disconnected');
  }
}
