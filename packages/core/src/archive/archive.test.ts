import { describe, expect, it } from 'vitest';
import { strToU8 } from 'fflate';
import { createDocument } from '../doc/create.js';
import { insertNode, setNodeLabels } from '../nodes/operations.js';
import { buildTree, getNodeViews } from '../nodes/selectors.js';
import { buildOutline } from '../docx/outline.js';
import { exportArchive, parseArchive, documentFromSnapshot } from './archive.js';
import { importLegacyTar } from './legacy.js';
import type { DocumentId } from '@gv/shared';

describe('.gvd/.gvt archive round-trip', () => {
  it('exports and re-imports a document with fresh ids', () => {
    const { doc } = createDocument({ id: 'orig' as DocumentId, title: 'Report', createdAt: 1 });
    const ch = insertNode(doc, { nodeType: 'chapter', name: 'Chapter' });
    const note = insertNode(doc, { nodeType: 'media', name: 'Note', parentId: ch });
    setNodeLabels(doc, note, 'tags', [{ value: 't', label: 'T' }]);

    const archive = exportArchive(doc, new Map(), { title: 'Report' });
    const parsed = parseArchive(archive);
    expect(parsed.manifest.title).toBe('Report');

    const imported = documentFromSnapshot(parsed.snapshot, 'copy' as DocumentId, 2);
    const tree = buildTree(imported);
    expect(tree.roots.map((r) => r.name)).toEqual(['Chapter']);
    expect(buildOutline(imported).map((o) => [o.number, o.name])).toEqual([
      ['1', 'Chapter'],
      ['1.1', 'Note'],
    ]);

    // Fresh node ids (no overlap with the original) — a fork, not a re-join.
    const origIds = new Set(getNodeViews(doc).map((n) => n.id));
    expect(getNodeViews(imported).every((n) => !origIds.has(n.id))).toBe(true);
  });
});

/** Build a minimal ustar archive from {name -> string} for the legacy test. */
function makeTar(files: Record<string, string>): Uint8Array {
  const blocks: Uint8Array[] = [];
  for (const [name, content] of Object.entries(files)) {
    const data = strToU8(content);
    const header = new Uint8Array(512);
    const enc = new TextEncoder();
    header.set(enc.encode(name), 0);
    header.set(enc.encode('0000644'), 100);
    header.set(enc.encode(data.length.toString(8).padStart(11, '0') + ' '), 124);
    header.set(enc.encode('        '), 148); // checksum spaces
    header[156] = '0'.charCodeAt(0);
    let sum = 0;
    for (const b of header) sum += b;
    header.set(enc.encode(sum.toString(8).padStart(6, '0') + '\0 '), 148);
    blocks.push(header);
    const padded = new Uint8Array(Math.ceil(data.length / 512) * 512);
    padded.set(data);
    blocks.push(padded);
  }
  blocks.push(new Uint8Array(1024)); // end
  const total = blocks.reduce((n, b) => n + b.length, 0);
  const out = new Uint8Array(total);
  let off = 0;
  for (const b of blocks) {
    out.set(b, off);
    off += b.length;
  }
  return out;
}

describe('legacy .gvd migration', () => {
  it('imports legacy docs.json + nodes.json (integer positions, plaintext)', () => {
    const tar = makeTar({
      'docs.json': JSON.stringify([{ _id: 'doc1', title: 'Old Report', isTemplate: false }]),
      'nodes.json': JSON.stringify([
        { _id: 'a', parent: 'doc1', position: 1, nodeType: 'chapter', name: 'Intro' },
        { _id: 'b', parent: 'doc1', position: 0, nodeType: 'chapter', name: 'Preface' },
        {
          _id: 'c',
          parent: 'a',
          position: 0,
          nodeType: 'media',
          name: 'Finding',
          description: 'Line one\nLine two',
          tags: [{ value: 'k', text: 'Keyword' }],
        },
      ]),
    });

    const doc = importLegacyTar(tar, 'migrated' as DocumentId, 10);
    const outline = buildOutline(doc);
    // Integer positions (0,1) become correct order: Preface before Intro.
    expect(outline.map((o) => [o.number, o.name])).toEqual([
      ['1', 'Preface'],
      ['2', 'Intro'],
      ['2.1', 'Finding'],
    ]);
    // Plaintext became paragraphs; legacy {value,text} tag normalized to {value,label}.
    const finding = outline.find((o) => o.name === 'Finding')!;
    expect(finding.paragraphs).toEqual(['Line one', 'Line two']);
    expect(finding.tags).toEqual([{ value: 'k', label: 'Keyword' }]);
  });
});
