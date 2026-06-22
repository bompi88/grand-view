import * as Y from 'yjs';
import {
  ROOT_PARENT,
  newNodeId,
  type FileId,
  type FileMeta,
  type Label,
  type NodeId,
  type NodeType,
} from '@gv/shared';
import { buildNodeMap, nodesMap, trashMap } from '../doc/schema.js';
import { keyBetween, keyForAppend } from '../ordering/fractional.js';
import { getChildren } from './selectors.js';
import { cloneNodeWith, deepCloneNodeMap } from './clone.js';

/** Where to place a node among its siblings. Defaults to appending at the end. */
export type Anchor =
  | { type: 'append' }
  | { type: 'prepend' }
  | { type: 'before'; id: NodeId }
  | { type: 'after'; id: NodeId };

const APPEND: Anchor = { type: 'append' };

/**
 * Compute a fractional position key for placing a node among `parentId`'s
 * current live siblings, honoring the anchor. `excludeId` omits a node from the
 * neighbor calculation (used when moving a node within its own parent).
 */
function positionForAnchor(
  doc: Y.Doc,
  parentId: NodeId,
  anchor: Anchor,
  excludeId?: NodeId,
): string {
  const siblings = getChildren(doc, parentId).filter((s) => s.id !== excludeId);
  const keys = siblings.map((s) => s.position);
  switch (anchor.type) {
    case 'prepend':
      return keyBetween(null, keys[0] ?? null);
    case 'before': {
      const i = siblings.findIndex((s) => s.id === anchor.id);
      if (i === -1) return keyForAppend(keys[keys.length - 1] ?? null);
      return keyBetween(keys[i - 1] ?? null, keys[i] ?? null);
    }
    case 'after': {
      const i = siblings.findIndex((s) => s.id === anchor.id);
      if (i === -1) return keyForAppend(keys[keys.length - 1] ?? null);
      return keyBetween(keys[i] ?? null, keys[i + 1] ?? null);
    }
    case 'append':
    default:
      return keyForAppend(keys[keys.length - 1] ?? null);
  }
}

export interface InsertNodeOptions {
  parentId?: NodeId;
  nodeType: NodeType;
  name?: string;
  anchor?: Anchor;
}

/** Insert a new chapter or media node. Writes only the new node — no sibling shifts. */
export function insertNode(doc: Y.Doc, opts: InsertNodeOptions): NodeId {
  const id = newNodeId();
  const parentId = opts.parentId ?? ROOT_PARENT;
  doc.transact(() => {
    const position = positionForAnchor(doc, parentId, opts.anchor ?? APPEND);
    nodesMap(doc).set(
      id,
      buildNodeMap({ id, parentId, nodeType: opts.nodeType, position, name: opts.name }),
    );
  });
  return id;
}

/** True if `maybeAncestor` is `nodeId` itself or an ancestor of it (cycle guard for moves). */
function isAncestorOrSelf(doc: Y.Doc, maybeAncestor: NodeId, nodeId: NodeId): boolean {
  const nodes = nodesMap(doc);
  let cur: NodeId | undefined = nodeId;
  const seen = new Set<NodeId>();
  while (cur && cur !== ROOT_PARENT) {
    if (cur === maybeAncestor) return true;
    if (seen.has(cur)) return false;
    seen.add(cur);
    cur = nodes.get(cur)?.get('parentId') as NodeId | undefined;
  }
  return false;
}

export interface MoveNodeOptions {
  parentId: NodeId;
  anchor?: Anchor;
}

/**
 * Move (and/or reorder) a node: set parentId + a fresh position in ONE
 * transaction. Reordering within a parent is just a move with the same parent.
 * Refuses to move a node into its own subtree. Returns false if rejected.
 */
export function moveNode(doc: Y.Doc, nodeId: NodeId, opts: MoveNodeOptions): boolean {
  const node = nodesMap(doc).get(nodeId);
  if (!node) return false;
  if (opts.parentId !== ROOT_PARENT && isAncestorOrSelf(doc, nodeId, opts.parentId)) {
    return false; // would create a cycle
  }
  doc.transact(() => {
    const position = positionForAnchor(doc, opts.parentId, opts.anchor ?? APPEND, nodeId);
    node.set('parentId', opts.parentId);
    node.set('position', position);
  });
  return true;
}

/** Collect a node and all its live descendants (depth-first). */
function collectSubtree(doc: Y.Doc, rootId: NodeId): NodeId[] {
  const nodes = nodesMap(doc);
  const out: NodeId[] = [];
  const visit = (id: NodeId) => {
    if (!nodes.has(id)) return;
    out.push(id);
    for (const node of nodes.values()) {
      if ((node.get('parentId') as NodeId) === id) visit(node.get('id') as NodeId);
    }
  };
  visit(rootId);
  return out;
}

/**
 * Duplicate a subtree under the same parent, immediately after the original,
 * with fresh ids throughout (old->new id remap, like the legacy idHashMap).
 * Returns the new root node id.
 */
export function duplicateSubtree(doc: Y.Doc, rootId: NodeId): NodeId | null {
  const nodes = nodesMap(doc);
  const root = nodes.get(rootId);
  if (!root) return null;
  const subtreeIds = collectSubtree(doc, rootId);
  const idMap = new Map<NodeId, NodeId>();
  for (const oldId of subtreeIds) idMap.set(oldId, newNodeId());
  const newRootId = idMap.get(rootId)!;
  const rootParent = root.get('parentId') as NodeId;

  doc.transact(() => {
    const rootPosition = positionForAnchor(doc, rootParent, { type: 'after', id: rootId });
    for (const oldId of subtreeIds) {
      const src = nodes.get(oldId)!;
      const newId = idMap.get(oldId)!;
      const oldParent = src.get('parentId') as NodeId;
      const newParent = oldId === rootId ? rootParent : idMap.get(oldParent)!;
      const position = oldId === rootId ? rootPosition : String(src.get('position'));
      nodes.set(newId, cloneNodeWith(src, { id: newId, parentId: newParent, position }));
    }
  });
  return newRootId;
}

/** Soft-delete: move a subtree into the per-document trash, stamping removedAt on the root. */
export function removeToTrash(doc: Y.Doc, rootId: NodeId, now: number): boolean {
  const nodes = nodesMap(doc);
  if (!nodes.has(rootId)) return false;
  const subtreeIds = collectSubtree(doc, rootId);
  doc.transact(() => {
    const trash = trashMap(doc);
    for (const id of subtreeIds) {
      const clone = deepCloneNodeMap(nodes.get(id)!);
      if (id === rootId) clone.set('removedAt', now);
      nodes.delete(id);
      trash.set(id, clone);
    }
  });
  return true;
}

/** Restore a trashed subtree back into the live tree. */
export function restoreFromTrash(doc: Y.Doc, rootId: NodeId): boolean {
  const trash = trashMap(doc);
  const root = trash.get(rootId);
  if (!root) return false;
  // Gather the subtree within the trash map.
  const ids: NodeId[] = [];
  const visit = (id: NodeId) => {
    if (!trash.has(id)) return;
    ids.push(id);
    for (const node of trash.values()) {
      if ((node.get('parentId') as NodeId) === id) visit(node.get('id') as NodeId);
    }
  };
  visit(rootId);
  doc.transact(() => {
    const nodes = nodesMap(doc);
    for (const id of ids) {
      const clone = deepCloneNodeMap(trash.get(id)!);
      if (id === rootId) clone.delete('removedAt');
      trash.delete(id);
      nodes.set(id, clone);
    }
  });
  return true;
}

/** Permanently empty the per-document trash. */
export function emptyTrash(doc: Y.Doc): void {
  doc.transact(() => trashMap(doc).clear());
}

/** Replace a node's tags (write-through to the node's Y.Array). */
export function setNodeLabels(
  doc: Y.Doc,
  nodeId: NodeId,
  kind: 'tags' | 'references',
  labels: Label[],
): boolean {
  const node = nodesMap(doc).get(nodeId);
  if (!node) return false;
  doc.transact(() => {
    const arr = node.get(kind) as Y.Array<Y.Map<unknown>>;
    arr.delete(0, arr.length);
    arr.insert(
      0,
      labels.map((l) => {
        const m = new Y.Map();
        m.set('value', l.value);
        m.set('label', l.label);
        return m;
      }),
    );
  });
  return true;
}

/** Rename a node. */
export function renameNode(doc: Y.Doc, nodeId: NodeId, name: string): boolean {
  const node = nodesMap(doc).get(nodeId);
  if (!node) return false;
  doc.transact(() => node.set('name', name));
  return true;
}

/** Collapse/expand a single chapter node. */
export function setCollapsed(doc: Y.Doc, nodeId: NodeId, collapsed: boolean): boolean {
  const node = nodesMap(doc).get(nodeId);
  if (!node) return false;
  doc.transact(() => node.set('isCollapsed', collapsed));
  return true;
}

/** Attach a file (its bytes live in the platform blob store, referenced by blobRef). */
export function addNodeFile(doc: Y.Doc, nodeId: NodeId, meta: FileMeta): boolean {
  const node = nodesMap(doc).get(nodeId);
  if (!node) return false;
  doc.transact(() => {
    const files = node.get('files') as Y.Array<Y.Map<unknown>>;
    const m = new Y.Map();
    m.set('id', meta.id);
    m.set('name', meta.name);
    m.set('mime', meta.mime);
    m.set('size', meta.size);
    m.set('isImage', meta.isImage);
    m.set('blobRef', meta.blobRef);
    files.push([m]);
  });
  return true;
}

/** Detach a file from a node. Returns the removed blobRef (for blob-store cleanup). */
export function removeNodeFile(doc: Y.Doc, nodeId: NodeId, fileId: FileId): string | null {
  const node = nodesMap(doc).get(nodeId);
  if (!node) return null;
  const files = node.get('files') as Y.Array<Y.Map<unknown>>;
  let blobRef: string | null = null;
  doc.transact(() => {
    for (let i = 0; i < files.length; i++) {
      if ((files.get(i).get('id') as FileId) === fileId) {
        blobRef = String(files.get(i).get('blobRef') ?? '');
        files.delete(i, 1);
        break;
      }
    }
  });
  return blobRef;
}
