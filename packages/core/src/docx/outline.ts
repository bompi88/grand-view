import * as Y from 'yjs';
import { ROOT_PARENT, type Label, type NodeId, type NodeType } from '@gv/shared';
import { nodesMap } from '../doc/schema.js';
import { getChildren } from '../nodes/selectors.js';

export interface OutlineItem {
  id: NodeId;
  /** Hierarchical number, e.g. "1", "1.2", "1.2.1". */
  number: string;
  /** Depth from root (0-based). */
  level: number;
  nodeType: NodeType;
  name: string;
  /** Body paragraphs (media nodes). */
  paragraphs: string[];
  tags: Label[];
  references: Label[];
  /** blobRefs of attached images, in order. */
  imageBlobRefs: string[];
}

function textOf(node: Y.XmlElement | Y.XmlText | Y.XmlHook): string {
  if (node instanceof Y.XmlText) {
    return node
      .toDelta()
      .map((op: { insert?: unknown }) => (typeof op.insert === 'string' ? op.insert : ''))
      .join('');
  }
  if (node instanceof Y.XmlElement) {
    return node.toArray().map(textOf).join('');
  }
  return '';
}

/** Extract the body of a media node's description as plain-text paragraphs. */
export function fragmentToParagraphs(frag: Y.XmlFragment | undefined): string[] {
  if (!frag) return [];
  return frag
    .toArray()
    .map((child) => textOf(child).trim())
    .filter((p) => p.length > 0);
}

/**
 * Flatten the document into a numbered outline (depth-first, by position).
 * Every node gets a hierarchical number — 1, 1.1, 1.1.1 — like the legacy DOCX.
 */
export function buildOutline(doc: Y.Doc): OutlineItem[] {
  const nodes = nodesMap(doc);
  const out: OutlineItem[] = [];

  const walk = (parentId: NodeId, prefix: string, level: number) => {
    const children = getChildren(doc, parentId);
    children.forEach((child, i) => {
      const number = prefix ? `${prefix}.${i + 1}` : `${i + 1}`;
      const node = nodes.get(child.id);
      const desc = node?.get('description');
      out.push({
        id: child.id,
        number,
        level,
        nodeType: child.nodeType,
        name: child.name,
        paragraphs:
          child.nodeType === 'media' && desc instanceof Y.XmlFragment
            ? fragmentToParagraphs(desc)
            : [],
        tags: child.tags,
        references: child.references,
        imageBlobRefs: child.files.filter((f) => f.isImage).map((f) => f.blobRef),
      });
      walk(child.id, number, level + 1);
    });
  };

  walk(ROOT_PARENT, '', 0);
  return out;
}
