import type * as Y from 'yjs';
import type { NodeView } from '@gv/shared';
import { nodesMap } from '../doc/schema.js';
import { toNodeView } from '../nodes/selectors.js';

export type LabelKind = 'tags' | 'references';

export interface LabelUsage {
  value: string;
  label: string;
  count: number;
}

function labelArray(node: Y.Map<unknown>, kind: LabelKind): Y.Array<Y.Map<unknown>> | undefined {
  return node.get(kind) as Y.Array<Y.Map<unknown>> | undefined;
}

/** Distinct tags/references used in the document, with usage counts (derived). */
export function listLabelUsage(doc: Y.Doc, kind: LabelKind): LabelUsage[] {
  const map = new Map<string, { label: string; count: number }>();
  for (const node of nodesMap(doc).values()) {
    const arr = labelArray(node, kind);
    if (!arr) continue;
    for (const m of arr.toArray()) {
      const value = String(m.get('value'));
      const label = String(m.get('label') ?? value);
      const e = map.get(value);
      if (e) e.count++;
      else map.set(value, { label, count: 1 });
    }
  }
  return [...map.entries()]
    .map(([value, { label, count }]) => ({ value, label, count }))
    .sort((a, b) => a.label.localeCompare(b.label, undefined, { sensitivity: 'base' }));
}

/** Nodes carrying a given tag/reference value. */
export function nodesWithLabel(doc: Y.Doc, kind: LabelKind, value: string): NodeView[] {
  const out: NodeView[] = [];
  for (const node of nodesMap(doc).values()) {
    const arr = labelArray(node, kind);
    if (arr && arr.toArray().some((m) => String(m.get('value')) === value)) {
      out.push(toNodeView(node));
    }
  }
  return out;
}

/** Media nodes that have no tags / no references. */
export function nodesWithoutLabels(doc: Y.Doc, kind: LabelKind): NodeView[] {
  const out: NodeView[] = [];
  for (const node of nodesMap(doc).values()) {
    if (node.get('nodeType') !== 'media') continue;
    const arr = labelArray(node, kind);
    if (!arr || arr.length === 0) out.push(toNodeView(node));
  }
  return out;
}

/** Rename a tag/reference everywhere it appears in the document. Returns the count updated. */
export function renameLabel(doc: Y.Doc, kind: LabelKind, value: string, newLabel: string): number {
  let n = 0;
  doc.transact(() => {
    for (const node of nodesMap(doc).values()) {
      const arr = labelArray(node, kind);
      if (!arr) continue;
      for (const m of arr.toArray()) {
        if (String(m.get('value')) === value) {
          m.set('label', newLabel);
          n++;
        }
      }
    }
  });
  return n;
}

/** Remove a tag/reference from every node in the document. Returns the count removed. */
export function removeLabelEverywhere(doc: Y.Doc, kind: LabelKind, value: string): number {
  let n = 0;
  doc.transact(() => {
    for (const node of nodesMap(doc).values()) {
      const arr = labelArray(node, kind);
      if (!arr) continue;
      for (let i = arr.length - 1; i >= 0; i--) {
        if (String(arr.get(i).get('value')) === value) {
          arr.delete(i, 1);
          n++;
        }
      }
    }
  });
  return n;
}
