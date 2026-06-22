import * as Y from 'yjs';
import { strFromU8 } from 'fflate';
import { ROOT_PARENT, newNodeId, type DocumentId, type NodeId } from '@gv/shared';
import { createDocument } from '../doc/create.js';
import { buildNodeMap, nodesMap } from '../doc/schema.js';
import { keysBetween } from '../ordering/fractional.js';
import { untar } from './untar.js';

interface LegacyLabel {
  value?: string;
  label?: string;
  text?: string;
}
interface LegacyNode {
  _id: string;
  parent?: string;
  position?: number;
  nodeType?: string;
  name?: string;
  description?: string;
  isCollapsed?: boolean;
  tags?: (LegacyLabel | string)[];
  references?: (LegacyLabel | string)[];
}

function normalizeLabels(arr: (LegacyLabel | string)[] | undefined): { value: string; label: string }[] {
  if (!Array.isArray(arr)) return [];
  return arr.map((l) => {
    if (typeof l === 'string') return { value: l, label: l };
    const label = l.label ?? l.text ?? l.value ?? '';
    return { value: l.value ?? label, label };
  });
}

function seedLabels(node: Y.Map<unknown>, kind: 'tags' | 'references', labels: { value: string; label: string }[]) {
  if (!labels.length) return;
  const arr = node.get(kind) as Y.Array<Y.Map<unknown>>;
  arr.insert(
    0,
    labels.map((l) => {
      const m = new Y.Map();
      m.set('value', l.value);
      m.set('label', l.label);
      return m;
    }),
  );
}

function seedDescription(node: Y.Map<unknown>, text: string) {
  const frag = node.get('description');
  if (!(frag instanceof Y.XmlFragment)) return;
  const paras = text.split('\n');
  const els = paras.map((line) => {
    const el = new Y.XmlElement('paragraph');
    if (line.length) {
      const t = new Y.XmlText();
      t.insert(0, line);
      el.insert(0, [t]);
    }
    return el;
  });
  if (els.length) frag.insert(0, els);
}

function findEntry(entries: { name: string; bytes: Uint8Array }[], file: string): unknown {
  const e = entries.find((x) => x.name === file || x.name.endsWith(`/${file}`));
  return e ? JSON.parse(strFromU8(e.bytes)) : null;
}

/**
 * Import a legacy GrandView `.gvd`/`.gvt` (tar archive with docs.json +
 * nodes.json) into a fresh document: integer positions become fractional keys,
 * plaintext descriptions become paragraphs, ids are remapped. (Legacy file
 * attachment bytes are not migrated — structure, text, tags and references are.)
 */
export function importLegacyTar(tarBytes: Uint8Array, id: DocumentId, createdAt: number): Y.Doc {
  const entries = untar(tarBytes);
  const docsRaw = findEntry(entries, 'docs.json') ?? findEntry(entries, 'documents.json');
  const nodes = (findEntry(entries, 'nodes.json') as LegacyNode[]) ?? [];
  const mainDoc = (Array.isArray(docsRaw) ? docsRaw[0] : docsRaw) as
    | { _id?: string; title?: string; isTemplate?: boolean }
    | undefined;
  const docOldId = mainDoc?._id;

  const { doc } = createDocument({
    id,
    createdAt,
    title: mainDoc?.title ?? 'Imported document',
    isTemplate: Boolean(mainDoc?.isTemplate),
  });

  const idMap = new Map<string, NodeId>();
  for (const n of nodes) idMap.set(n._id, newNodeId());

  const byParent = new Map<string, LegacyNode[]>();
  for (const n of nodes) {
    const p = n.parent ?? '';
    const group = byParent.get(p);
    if (group) group.push(n);
    else byParent.set(p, [n]);
  }

  doc.transact(() => {
    const nm = nodesMap(doc);
    for (const [parent, group] of byParent) {
      group.sort((a, b) => (a.position ?? 0) - (b.position ?? 0));
      const keys = keysBetween(null, null, group.length);
      group.forEach((n, i) => {
        const newId = idMap.get(n._id)!;
        const isRoot = parent === docOldId || parent === '' || !idMap.has(parent);
        const newParent = isRoot ? ROOT_PARENT : idMap.get(parent)!;
        const nodeType = n.nodeType === 'media' ? 'media' : 'chapter';
        const node = buildNodeMap({
          id: newId,
          parentId: newParent,
          nodeType,
          position: keys[i]!,
          name: n.name ?? '',
          isCollapsed: Boolean(n.isCollapsed),
        });
        nm.set(newId, node);
        seedLabels(node, 'tags', normalizeLabels(n.tags));
        seedLabels(node, 'references', normalizeLabels(n.references));
        if (nodeType === 'media' && typeof n.description === 'string') {
          seedDescription(node, n.description);
        }
      });
    }
  });

  return doc;
}
