import { describe, expect, it } from 'vitest';
import * as Y from 'yjs';
import { ROOT_PARENT, type NodeId } from '@gv/shared';
import { createDocument } from '../doc/create.js';
import {
  duplicateSubtree,
  emptyTrash,
  insertNode,
  moveNode,
  removeToTrash,
  restoreFromTrash,
} from './operations.js';
import { buildTree, getChildren, getNodeViews } from './selectors.js';
import { nodesMap, trashMap } from '../doc/schema.js';

function names(doc: Y.Doc, parentId: NodeId) {
  return getChildren(doc, parentId).map((n) => n.name);
}

describe('insertNode + ordering', () => {
  it('appends children in insertion order', () => {
    const { doc } = createDocument({ createdAt: 0 });
    insertNode(doc, { nodeType: 'chapter', name: 'A' });
    insertNode(doc, { nodeType: 'chapter', name: 'B' });
    insertNode(doc, { nodeType: 'chapter', name: 'C' });
    expect(names(doc, ROOT_PARENT)).toEqual(['A', 'B', 'C']);
  });

  it('honors before/after/prepend anchors', () => {
    const { doc } = createDocument({ createdAt: 0 });
    const a = insertNode(doc, { nodeType: 'chapter', name: 'A' });
    insertNode(doc, { nodeType: 'chapter', name: 'C' });
    insertNode(doc, { nodeType: 'chapter', name: 'B', anchor: { type: 'after', id: a } });
    insertNode(doc, { nodeType: 'chapter', name: 'Z', anchor: { type: 'prepend' } });
    expect(names(doc, ROOT_PARENT)).toEqual(['Z', 'A', 'B', 'C']);
  });
});

describe('moveNode', () => {
  it('reorders within a parent by writing only the moved node', () => {
    const { doc } = createDocument({ createdAt: 0 });
    const a = insertNode(doc, { nodeType: 'chapter', name: 'A' });
    const b = insertNode(doc, { nodeType: 'chapter', name: 'B' });
    const c = insertNode(doc, { nodeType: 'chapter', name: 'C' });
    moveNode(doc, c, { parentId: ROOT_PARENT, anchor: { type: 'before', id: a } });
    expect(names(doc, ROOT_PARENT)).toEqual(['C', 'A', 'B']);
    expect([a, b, c].every((id) => nodesMap(doc).has(id))).toBe(true);
  });

  it('reparents a node under a chapter', () => {
    const { doc } = createDocument({ createdAt: 0 });
    const ch = insertNode(doc, { nodeType: 'chapter', name: 'Chapter' });
    const m = insertNode(doc, { nodeType: 'media', name: 'Note' });
    expect(moveNode(doc, m, { parentId: ch })).toBe(true);
    expect(names(doc, ch)).toEqual(['Note']);
    expect(names(doc, ROOT_PARENT)).toEqual(['Chapter']);
  });

  it('refuses to move a node into its own descendant (cycle guard)', () => {
    const { doc } = createDocument({ createdAt: 0 });
    const parent = insertNode(doc, { nodeType: 'chapter', name: 'P' });
    const child = insertNode(doc, { nodeType: 'chapter', name: 'C', parentId: parent });
    expect(moveNode(doc, parent, { parentId: child })).toBe(false);
  });
});

describe('duplicateSubtree', () => {
  it('deep-copies a subtree with fresh ids, placed after the original', () => {
    const { doc } = createDocument({ createdAt: 0 });
    const ch = insertNode(doc, { nodeType: 'chapter', name: 'Chap' });
    insertNode(doc, { nodeType: 'media', name: 'm1', parentId: ch });
    insertNode(doc, { nodeType: 'media', name: 'm2', parentId: ch });

    const copyId = duplicateSubtree(doc, ch)!;
    expect(copyId).not.toBe(ch);
    expect(names(doc, ROOT_PARENT)).toEqual(['Chap', 'Chap']);
    // The copy has its own two children with fresh ids.
    const copyChildren = getChildren(doc, copyId);
    expect(copyChildren.map((c) => c.name)).toEqual(['m1', 'm2']);
    expect(copyChildren.every((c) => !nodesMap(doc).get(ch)?.has(c.id))).toBe(true);
    // Total nodes doubled (3 -> 6).
    expect(getNodeViews(doc).length).toBe(6);
  });
});

describe('trash', () => {
  it('soft-removes a subtree and restores it', () => {
    const { doc } = createDocument({ createdAt: 0 });
    const ch = insertNode(doc, { nodeType: 'chapter', name: 'Chap' });
    insertNode(doc, { nodeType: 'media', name: 'm1', parentId: ch });

    removeToTrash(doc, ch, 1234);
    expect(getNodeViews(doc).length).toBe(0);
    expect(trashMap(doc).size).toBe(2);
    expect(trashMap(doc).get(ch)?.get('removedAt')).toBe(1234);

    restoreFromTrash(doc, ch);
    expect(getNodeViews(doc).length).toBe(2);
    expect(trashMap(doc).size).toBe(0);
    expect(nodesMap(doc).get(ch)?.has('removedAt')).toBe(false);
  });

  it('empties the trash permanently', () => {
    const { doc } = createDocument({ createdAt: 0 });
    const ch = insertNode(doc, { nodeType: 'chapter', name: 'Chap' });
    removeToTrash(doc, ch, 1);
    emptyTrash(doc);
    expect(trashMap(doc).size).toBe(0);
  });
});

describe('orphan recovery (referential-integrity guard)', () => {
  it('re-roots a node whose parent no longer exists instead of dropping it', () => {
    const { doc } = createDocument({ createdAt: 0 });
    const ch = insertNode(doc, { nodeType: 'chapter', name: 'Chap' });
    const m = insertNode(doc, { nodeType: 'media', name: 'orphan', parentId: ch });
    // Hard-delete the parent only (simulating a concurrent delete).
    nodesMap(doc).delete(ch);

    const tree = buildTree(doc);
    expect(tree.roots.map((r) => r.name)).toEqual([]);
    expect(tree.recovered.map((r) => r.id)).toContain(m);
  });
});
