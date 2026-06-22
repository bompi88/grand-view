import type * as Y from 'yjs';
import {
  Document,
  HeadingLevel,
  ImageRun,
  Packer,
  Paragraph,
  TextRun,
} from 'docx';
import { metaMap } from '../doc/schema.js';
import { buildOutline, type OutlineItem } from './outline.js';

/** Resolved image bytes keyed by blobRef, supplied by the platform layer. */
export type ImageMap = Map<string, Uint8Array>;

const HEADINGS = [
  HeadingLevel.HEADING_1,
  HeadingLevel.HEADING_2,
  HeadingLevel.HEADING_3,
  HeadingLevel.HEADING_4,
  HeadingLevel.HEADING_5,
];

function metaLine(item: OutlineItem): Paragraph[] {
  const bits: string[] = [];
  if (item.tags.length) bits.push(`Tags: ${item.tags.map((t) => t.label).join(', ')}`);
  if (item.references.length)
    bits.push(`References: ${item.references.map((r) => r.label).join(', ')}`);
  if (!bits.length) return [];
  return [new Paragraph({ children: [new TextRun({ text: bits.join('   •   '), italics: true, color: '808080' })] })];
}

function itemParagraphs(item: OutlineItem, images: ImageMap): Paragraph[] {
  const heading = HEADINGS[Math.min(item.level, HEADINGS.length - 1)];
  const out: Paragraph[] = [
    new Paragraph({
      heading,
      children: [new TextRun({ text: `${item.number}  ${item.name || 'Untitled'}` })],
    }),
    ...item.paragraphs.map((p) => new Paragraph({ children: [new TextRun(p)] })),
  ];
  for (const ref of item.imageBlobRefs) {
    const bytes = images.get(ref);
    if (bytes) {
      out.push(
        new Paragraph({
          children: [
            new ImageRun({ type: 'png', data: bytes, transformation: { width: 480, height: 320 } }),
          ],
        }),
      );
    }
  }
  out.push(...metaLine(item));
  return out;
}

/**
 * Export the document to a .docx file. Pure (no filesystem): returns the bytes;
 * the platform layer saves them. Numbered chapters (1, 1.1, 1.1.1), embedded
 * images (bytes resolved by the caller from the blob store), and tag/reference
 * metadata. Byte-stable across platforms.
 */
export async function exportDocx(doc: Y.Doc, images: ImageMap = new Map()): Promise<Uint8Array> {
  const title = String(metaMap(doc).get('title') ?? 'GrandView document');
  const outline = buildOutline(doc);

  const children: Paragraph[] = [
    new Paragraph({ heading: HeadingLevel.TITLE, children: [new TextRun(title)] }),
  ];
  for (const item of outline) children.push(...itemParagraphs(item, images));

  const document = new Document({ sections: [{ children }] });
  const blob = await Packer.toBlob(document);
  return new Uint8Array(await blob.arrayBuffer());
}

/** blobRefs of every image referenced by the document (to pre-resolve bytes). */
export function imageBlobRefs(doc: Y.Doc): string[] {
  return [...new Set(buildOutline(doc).flatMap((o) => o.imageBlobRefs))];
}
