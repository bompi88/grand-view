import { describe, expect, it } from 'vitest';
import * as Y from 'yjs';
import { ROOT_PARENT } from '@gv/shared';
import { createDocument } from '../doc/create.js';
import { insertNode, moveNode } from './operations.js';
import { getChildren, getNodeViews } from './selectors.js';

/** Apply doc A's state onto doc B and vice-versa until both converge. */
function sync(a: Y.Doc, b: Y.Doc) {
  const ua = Y.encodeStateAsUpdate(a);
  const ub = Y.encodeStateAsUpdate(b);
  Y.applyUpdate(a, ub);
  Y.applyUpdate(b, ua);
}

function order(doc: Y.Doc): string[] {
  return getChildren(doc, ROOT_PARENT).map((n) => n.name);
}

describe('CRDT convergence — concurrent drags (legacy #91 regression guard)', () => {
  it('two users reordering different nodes concurrently: no loss, no duplication, identical order', () => {
    // Seed a shared document.
    const { doc } = createDocument({ id: 'shared' as never, createdAt: 0 });
    const a = insertNode(doc, { nodeType: 'chapter', name: 'A' });
    const b = insertNode(doc, { nodeType: 'chapter', name: 'B' });
    const c = insertNode(doc, { nodeType: 'chapter', name: 'C' });
    const d = insertNode(doc, { nodeType: 'chapter', name: 'D' });

    // Two replicas start from the same state.
    const docA = new Y.Doc();
    const docB = new Y.Doc();
    Y.applyUpdate(docA, Y.encodeStateAsUpdate(doc));
    Y.applyUpdate(docB, Y.encodeStateAsUpdate(doc));

    // Concurrent edits, offline:
    //  - User A drags D to the front.
    moveNode(docA, d, { parentId: ROOT_PARENT, anchor: { type: 'before', id: a } });
    //  - User B drags A to the end.
    moveNode(docB, a, { parentId: ROOT_PARENT, anchor: { type: 'after', id: c } });

    sync(docA, docB);

    // Both replicas converge to the SAME order...
    expect(order(docA)).toEqual(order(docB));
    // ...with all four nodes still present exactly once (no loss / no dup).
    const ids = getNodeViews(docA)
      .map((n) => n.id)
      .sort();
    expect(ids).toEqual([a, b, c, d].sort());
    expect(getNodeViews(docA).length).toBe(4);
  });

  it('two users dropping different nodes into the SAME gap converge deterministically', () => {
    const { doc } = createDocument({ createdAt: 0 });
    const a = insertNode(doc, { nodeType: 'chapter', name: 'A' });
    const b = insertNode(doc, { nodeType: 'chapter', name: 'B' });
    const x = insertNode(doc, { nodeType: 'chapter', name: 'X' });
    const y = insertNode(doc, { nodeType: 'chapter', name: 'Y' });

    const docA = new Y.Doc();
    const docB = new Y.Doc();
    Y.applyUpdate(docA, Y.encodeStateAsUpdate(doc));
    Y.applyUpdate(docB, Y.encodeStateAsUpdate(doc));

    // Both users drop their node into the gap between A and B simultaneously.
    moveNode(docA, x, { parentId: ROOT_PARENT, anchor: { type: 'after', id: a } });
    moveNode(docB, y, { parentId: ROOT_PARENT, anchor: { type: 'after', id: a } });

    sync(docA, docB);

    expect(order(docA)).toEqual(order(docB));
    expect(getNodeViews(docA).length).toBe(4);
    // A is still first; both moved nodes survive between A and B.
    const result = order(docA);
    expect(result[0]).toBe('A');
    expect(result).toContain('X');
    expect(result).toContain('Y');
    expect(new Set(result).size).toBe(4); // no duplicates
    void b;
  });
});
