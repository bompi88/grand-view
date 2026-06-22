import { describe, expect, it } from 'vitest';
import * as Y from 'yjs';
import { FileSyncProvider, type FileSyncFs } from './file-sync.js';

/** In-memory shared "folder" simulating a cloud-replicated directory. */
function memFs(store: Map<string, Uint8Array>): FileSyncFs {
  return {
    async list() {
      return [...store.keys()];
    },
    async read(name) {
      return store.get(name) ?? null;
    },
    async write(name, bytes) {
      store.set(name, bytes);
    },
  };
}

describe('FileSyncProvider', () => {
  it('converges two devices through a shared folder, no clobber', async () => {
    const folder = new Map<string, Uint8Array>();

    const docA = new Y.Doc();
    const a = new FileSyncProvider({ fs: memFs(folder), deviceId: 'devA', debounceMs: 0 });
    await a.connect(docA, 'doc1');
    docA.getMap('m').set('a', 1);
    await a.flush();

    const docB = new Y.Doc();
    const b = new FileSyncProvider({ fs: memFs(folder), deviceId: 'devB', debounceMs: 0 });
    await b.connect(docB, 'doc1'); // merge-on-open pulls devA's log
    expect(docB.getMap('m').get('a')).toBe(1);

    // Device B edits; device A re-merges from the folder.
    docB.getMap('m').set('b', 2);
    await b.flush();
    await a.mergeOnOpen();
    expect(docA.getMap('m').get('b')).toBe(2);

    // Each device wrote only its own log file (no shared mutable file).
    expect([...folder.keys()].sort()).toEqual(['doc1__devA.ylog', 'doc1__devB.ylog']);

    // Both fully converged.
    expect(docA.getMap('m').toJSON()).toEqual({ a: 1, b: 2 });
    expect(docB.getMap('m').toJSON()).toEqual({ a: 1, b: 2 });

    await a.disconnect();
    await b.disconnect();
  });

  it('scopes logs per room', async () => {
    const folder = new Map<string, Uint8Array>();
    const d1 = new Y.Doc();
    const p1 = new FileSyncProvider({ fs: memFs(folder), deviceId: 'dev', debounceMs: 0 });
    await p1.connect(d1, 'roomX');
    d1.getMap('m').set('k', 'x');
    await p1.flush();

    // A different room must not pick up roomX's content.
    const d2 = new Y.Doc();
    const p2 = new FileSyncProvider({ fs: memFs(folder), deviceId: 'dev', debounceMs: 0 });
    await p2.connect(d2, 'roomY');
    expect(d2.getMap('m').get('k')).toBeUndefined();
  });
});
