import type * as Y from 'yjs';
import type { NodeId } from '@gv/shared';
import { nodesMap } from '../doc/schema.js';
import { keysBetween } from '../ordering/fractional.js';
import { getChildren } from './selectors.js';

/**
 * Re-spread the fractional position keys of a parent's children to short,
 * evenly-distributed values. A rare maintenance op — runs only on explicit
 * user action or when a key grows past a length threshold after many inserts
 * into the same gap. Preserves current visual order.
 */
export function normalizeSiblingPositions(doc: Y.Doc, parentId: NodeId): void {
  const children = getChildren(doc, parentId);
  if (children.length === 0) return;
  const fresh = keysBetween(null, null, children.length);
  doc.transact(() => {
    const nodes = nodesMap(doc);
    children.forEach((child, i) => {
      nodes.get(child.id)?.set('position', fresh[i]);
    });
  });
}

/** Longest position-key length among a parent's children (for threshold checks). */
export function maxKeyLength(doc: Y.Doc, parentId: NodeId): number {
  return getChildren(doc, parentId).reduce((m, c) => Math.max(m, c.position.length), 0);
}
