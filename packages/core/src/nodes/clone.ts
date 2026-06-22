import * as Y from 'yjs';
import type { NodeId } from '@gv/shared';
import type { NodeMap } from '../doc/schema.js';

/** Deep-clone an XML node (Y types must be detached to be re-attached elsewhere). */
function cloneXmlNode(src: Y.XmlElement | Y.XmlText | Y.XmlHook): Y.XmlElement | Y.XmlText {
  if (src instanceof Y.XmlText) {
    const t = new Y.XmlText();
    t.applyDelta(src.toDelta());
    return t;
  }
  const el = new Y.XmlElement((src as Y.XmlElement).nodeName);
  for (const [k, v] of Object.entries((src as Y.XmlElement).getAttributes())) {
    el.setAttribute(k, v as string);
  }
  const children = (src as Y.XmlElement).toArray().map((c) => cloneXmlNode(c));
  if (children.length) el.insert(0, children as (Y.XmlElement | Y.XmlText)[]);
  return el;
}

export function cloneXmlFragment(src: Y.XmlFragment): Y.XmlFragment {
  const frag = new Y.XmlFragment();
  const children = src.toArray().map((c) => cloneXmlNode(c));
  if (children.length) frag.insert(0, children as (Y.XmlElement | Y.XmlText)[]);
  return frag;
}

export function cloneLabelArray(
  src: Y.Array<Y.Map<unknown>> | undefined,
): Y.Array<Y.Map<unknown>> {
  const arr = new Y.Array<Y.Map<unknown>>();
  if (!src) return arr;
  const copies = src.toArray().map((m) => {
    const c = new Y.Map();
    for (const [k, v] of m.entries()) c.set(k, v);
    return c;
  });
  if (copies.length) arr.insert(0, copies);
  return arr;
}

/** Deep-clone a single value held in a node Y.Map. */
export function cloneValue(v: unknown): unknown {
  if (v instanceof Y.XmlFragment) return cloneXmlFragment(v);
  if (v instanceof Y.Array) return cloneLabelArray(v as Y.Array<Y.Map<unknown>>);
  if (v instanceof Y.Map) {
    const m = new Y.Map();
    for (const [k, val] of v.entries()) m.set(k, cloneValue(val));
    return m;
  }
  return v;
}

/** Faithful detached copy of a node Y.Map (preserves all fields incl. removedAt). */
export function deepCloneNodeMap(src: NodeMap): NodeMap {
  const node: NodeMap = new Y.Map();
  for (const [k, v] of src.entries()) node.set(k, cloneValue(v));
  return node;
}

/** Detached node copy with id/parentId/position overridden (drops removedAt). */
export function cloneNodeWith(
  src: NodeMap,
  overrides: { id: NodeId; parentId: NodeId; position?: string },
): NodeMap {
  const node = deepCloneNodeMap(src);
  node.set('id', overrides.id);
  node.set('parentId', overrides.parentId);
  if (overrides.position !== undefined) node.set('position', overrides.position);
  node.delete('removedAt');
  return node;
}
