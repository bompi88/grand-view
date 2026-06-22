import { Hocuspocus } from '@hocuspocus/server';

export interface RelayConfig {
  port?: number;
  /** Optional shared secret; clients must pass it as the `token` param. */
  token?: string;
}

/**
 * A GrandView sync relay: a Hocuspocus (Yjs) WebSocket server. Stateless and
 * tiny — deploy it for free on Fly.io / Render / Oracle always-free / a NAS.
 * Documents are kept in memory and broadcast to connected peers; add the
 * @hocuspocus/extension-sqlite (or -database) for durable persistence.
 */
export function createRelay(config: RelayConfig = {}): Hocuspocus {
  const token = config.token;
  return new Hocuspocus({
    port: config.port ?? 1234,
    ...(token
      ? {
          async onAuthenticate(data: { token: string }) {
            if (data.token !== token) throw new Error('Unauthorized');
          },
        }
      : {}),
  });
}
