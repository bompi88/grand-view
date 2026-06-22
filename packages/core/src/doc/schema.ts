import * as Y from 'yjs';
import { SCHEMA_VERSION, type DocumentId, type NodeId, type NodeType } from '@gv/shared';

/**
 * One Y.Doc per Grand View document. Top-level shape:
 *   meta:  Y.Map      — title, isTemplate, schemaVersion, createdAt
 *   nodes: Y.Map<id, Y.Map>   — ALL nodes, flat, keyed by node id
 *   trash: Y.Map<id, Y.Map>   — soft-deleted subtrees (per-document trash)
 *
 * A node Y.Map holds: id, parentId, nodeType, position (fractional string),
 * isCollapsed, name, tags (Y.Array<Y.Map>), references (Y.Array<Y.Map>),
 * files (Y.Array<Y.Map>), description (Y.XmlFragment, media nodes only).
 */

export const META = 'meta';
export const NODES = 'nodes';
export const TRASH = 'trash';

export type NodeMap = Y.Map<unknown>;

export interface CreateDocumentOptions {
  id?: DocumentId;
  title?: string;
  isTemplate?: boolean;
  createdAt?: number;
}

export function metaMap(doc: Y.Doc): Y.Map<unknown> {
  return doc.getMap(META);
}

export function nodesMap(doc: Y.Doc): Y.Map<NodeMap> {
  return doc.getMap<NodeMap>(NODES);
}

export function trashMap(doc: Y.Doc): Y.Map<NodeMap> {
  return doc.getMap<NodeMap>(TRASH);
}

/** The collaborative rich-text body of a media node, or null if absent. */
export function nodeDescriptionFragment(doc: Y.Doc, nodeId: NodeId): Y.XmlFragment | null {
  const desc = nodesMap(doc).get(nodeId)?.get('description');
  return desc instanceof Y.XmlFragment ? desc : null;
}

/** Initialize a fresh document's metadata. `createdAt` must be supplied by the caller. */
export function initDocument(doc: Y.Doc, opts: CreateDocumentOptions = {}): Y.Doc {
  const meta = metaMap(doc);
  doc.transact(() => {
    if (!meta.has('schemaVersion')) meta.set('schemaVersion', SCHEMA_VERSION);
    if (opts.id !== undefined) meta.set('id', opts.id);
    if (opts.title !== undefined) meta.set('title', opts.title);
    if (opts.isTemplate !== undefined) meta.set('isTemplate', opts.isTemplate);
    if (opts.createdAt !== undefined && !meta.has('createdAt')) {
      meta.set('createdAt', opts.createdAt);
    }
  });
  return doc;
}

export interface NodeSpec {
  id: NodeId;
  parentId: NodeId;
  nodeType: NodeType;
  position: string;
  name?: string;
  isCollapsed?: boolean;
}

/** Build a fully-formed (detached) node Y.Map; integrates when set into a Y.Map. */
export function buildNodeMap(spec: NodeSpec): NodeMap {
  const node: NodeMap = new Y.Map();
  node.set('id', spec.id);
  node.set('parentId', spec.parentId);
  node.set('nodeType', spec.nodeType);
  node.set('position', spec.position);
  node.set('name', spec.name ?? '');
  node.set('isCollapsed', spec.isCollapsed ?? false);
  node.set('tags', new Y.Array());
  node.set('references', new Y.Array());
  node.set('files', new Y.Array());
  if (spec.nodeType === 'media') {
    node.set('description', new Y.XmlFragment());
  }
  return node;
}
