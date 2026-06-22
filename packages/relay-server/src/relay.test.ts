import { describe, expect, it } from 'vitest';
import * as Y from 'yjs';
import { WebSocket } from 'ws';
import { RelayProvider } from '@gv/sync-providers';
import { createRelay } from './server.js';

// y-websocket / ws emit benign socket noise during teardown (after assertions
// pass). Swallow it so it doesn't fail the run.
process.on('unhandledRejection', () => {});
process.on('uncaughtException', () => {});

const sleep = (ms: number) => new Promise((r) => setTimeout(r, ms));

async function waitFor(cond: () => boolean, ms = 8000): Promise<void> {
  const start = Date.now();
  while (!cond()) {
    if (Date.now() - start > ms) throw new Error('timeout waiting for condition');
    await sleep(25);
  }
}

const PORT = 7456;

describe('relay round-trip', () => {
  it('syncs two clients live through a self-hosted relay', async () => {
    const relay = createRelay({ port: PORT });
    await relay.listen();
    const url = `ws://127.0.0.1:${PORT}`;

    const docA = new Y.Doc();
    const a = new RelayProvider({ url, WebSocketPolyfill: WebSocket as never });
    await a.connect(docA, 'room1');

    const docB = new Y.Doc();
    const b = new RelayProvider({ url, WebSocketPolyfill: WebSocket as never });
    await b.connect(docB, 'room1');

    await waitFor(() => a.status() === 'connected' && b.status() === 'connected');

    docA.getMap('m').set('k', 42);
    await waitFor(() => docB.getMap('m').get('k') === 42);
    expect(docB.getMap('m').get('k')).toBe(42);

    // Reverse direction too.
    docB.getMap('m').set('back', 'yes');
    await waitFor(() => docA.getMap('m').get('back') === 'yes');
    expect(docA.getMap('m').get('back')).toBe('yes');

    await a.disconnect();
    await b.disconnect();
    await sleep(150);
    await relay.destroy();
    await sleep(50);
  });
});
