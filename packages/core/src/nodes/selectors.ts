import type * as Y from 'yjs';
import {
  ROOT_PARENT,
  type FileMeta,
  type Label,
  type NodeId,
  type NodeType,
  type NodeView,
} from '@gv/shared';
import { nodesMap, type NodeMap } from '../doc/schema.js';
import { comparePosition } from '../ordering/fractional.js';

/** Synthetic parent under which orphaned subtrees are surfaced (never persisted). */
export const RECOVERED_ROOT = '$recovered' as NodeId;

function readLabels(arr: Y.Array<Y.Map<unknown>> | undefined): Label[] {
  if (!arr) return [];
  return arr.toArray().map((m) => ({
    value: String(m.get('value') ?? ''),
    label: String(m.get('label') ?? ''),
  }));
}

function readFiles(arr: Y.Array<Y.Map<unknown>> | undefined): FileMeta[] {
  if (!arr) return [];
  return arr.toArray().map((m) => ({
    id: m.get('id') as FileMeta['id'],
    name: String(m.get('name') ?? ''),
    mime: String(m.get('mime') ?? ''),
    size: Number(m.get('size') ?? 0),
    isImage: Boolean(m.get('isImage')),
    blobRef: String(m.get('blobRef') ?? ''),
  }));
}

/** Convert a node Y.Map into a plain view (level filled in by the tree builder). */
export function toNodeView(node: NodeMap): NodeView {
  return {
    id: node.get('id') as NodeId,
    parentId: node.get('parentId') as NodeId,
    nodeType: node.get('nodeType') as NodeType,
    position: String(node.get('position') ?? ''),
    isCollapsed: Boolean(node.get('isCollapsed')),
    name: String(node.get('name') ?? ''),
    tags: readLabels(node.get('tags') as Y.Array<Y.Map<unknown>> | undefined),
    references: readLabels(node.get('references') as Y.Array<Y.Map<unknown>> | undefined),
    files: readFiles(node.get('files') as Y.Array<Y.Map<unknown>> | undefined),
    level: 0,
  };
}

/** All live (non-trashed) nodes as plain views. */
export function getNodeViews(doc: Y.Doc): NodeView[] {
  const out: NodeView[] = [];
  for (const node of nodesMap(doc).values()) out.push(toNodeView(node));
  return out;
}

export interface TreeResult {
  /** Children keyed by parentId, each list sorted by position then id. */
  childrenByParent: Map<NodeId, NodeView[]>;
  /** Top-level nodes (children of ROOT_PARENT). */
  roots: NodeView[];
  /** Orphans/cycle-broken nodes re-rooted for display (empty in healthy docs). */
  recovered: NodeView[];
}

/**
 * Build a renderable tree with referential-integrity guards (CRDTs have no FKs):
 * - a node whose parentId chain doesn't terminate at ROOT_PARENT is re-rooted
 *   under RECOVERED_ROOT instead of vanishing;
 * - reparent cycles are broken deterministically (the lowest id in the cycle
 *   is treated as a root) so every peer derives an identical tree.
 */
export function buildTree(doc: Y.Doc): TreeResult {
  const views = getNodeViews(doc);
  const byId = new Map<NodeId, NodeView>();
  for (const v of views) byId.set(v.id, v);

  const reachesRoot = (start: NodeView): boolean => {
    const seen = new Set<NodeId>();
    let cur: NodeView | undefined = start;
    while (cur) {
      if (cur.parentId === ROOT_PARENT) return true;
      if (seen.has(cur.id)) return false; // cycle
      seen.add(cur.id);
      cur = byId.get(cur.parentId);
    }
    return false; // dangling parentId
  };

  const childrenByParent = new Map<NodeId, NodeView[]>();
  const recovered: NodeView[] = [];
  const push = (parentId: NodeId, v: NodeView) => {
    const list = childrenByParent.get(parentId);
    if (list) list.push(v);
    else childrenByParent.set(parentId, [v]);
  };

  for (const v of views) {
    const parentExists = v.parentId === ROOT_PARENT || byId.has(v.parentId);
    if (parentExists && reachesRoot(v)) {
      push(v.parentId, v);
    } else {
      recovered.push(v);
      push(RECOVERED_ROOT, v);
    }
  }

  for (const list of childrenByParent.values()) list.sort(comparePosition);

  // Fill in levels via BFS from the (real + recovered) roots.
  const assignLevels = (parentId: NodeId, level: number) => {
    for (const child of childrenByParent.get(parentId) ?? []) {
      child.level = level;
      assignLevels(child.id, level + 1);
    }
  };
  assignLevels(ROOT_PARENT, 0);
  assignLevels(RECOVERED_ROOT, 0);

  return {
    childrenByParent,
    roots: childrenByParent.get(ROOT_PARENT) ?? [],
    recovered,
  };
}

/** Sorted live children of a given parent. */
export function getChildren(doc: Y.Doc, parentId: NodeId): NodeView[] {
  return getNodeViews(doc)
    .filter((v) => v.parentId === parentId)
    .sort(comparePosition);
}
