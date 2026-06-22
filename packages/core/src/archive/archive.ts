import * as Y from 'yjs';
import { zipSync, unzipSync, strToU8, strFromU8 } from 'fflate';
import type { DocumentId } from '@gv/shared';
import { createDocument } from '../doc/create.js';
import { metaMap } from '../doc/schema.js';
import { documentFiles } from '../nodes/selectors.js';
import { copyDocumentContent } from '../templates/templates.js';

export const ARCHIVE_FORMAT = 'grandview-archive';
export const ARCHIVE_VERSION = 1;

export interface ArchiveManifest {
  format: string;
  version: number;
  isTemplate: boolean;
  title: string;
  /** blobRef -> mime, so attachments restore with the right content type. */
  blobs: Record<string, string>;
}

/**
 * Pack a document into a `.gvd` (or `.gvt`) archive: a zip containing a
 * manifest, the Yjs document snapshot, and the attachment blobs. `blobs` is
 * supplied by the platform layer (bytes resolved from the blob store).
 */
export function exportArchive(
  doc: Y.Doc,
  blobs: Map<string, Uint8Array>,
  opts: { isTemplate?: boolean; title?: string },
): Uint8Array {
  const blobMimes: Record<string, string> = {};
  for (const f of documentFiles(doc)) blobMimes[f.blobRef] = f.mime;

  const manifest: ArchiveManifest = {
    format: ARCHIVE_FORMAT,
    version: ARCHIVE_VERSION,
    isTemplate: Boolean(opts.isTemplate),
    title: opts.title ?? String(metaMap(doc).get('title') ?? ''),
    blobs: blobMimes,
  };

  const files: Record<string, Uint8Array> = {
    'manifest.json': strToU8(JSON.stringify(manifest)),
    'document.bin': Y.encodeStateAsUpdate(doc),
  };
  for (const [ref, bytes] of blobs) files[`blobs/${ref}`] = bytes;
  return zipSync(files);
}

export interface ParsedArchive {
  manifest: ArchiveManifest;
  snapshot: Uint8Array;
  blobs: Map<string, Uint8Array>;
}

export function parseArchive(bytes: Uint8Array): ParsedArchive {
  const entries = unzipSync(bytes);
  const manifestRaw = entries['manifest.json'];
  if (!manifestRaw) throw new Error('Not a GrandView archive (missing manifest).');
  const manifest = JSON.parse(strFromU8(manifestRaw)) as ArchiveManifest;
  if (manifest.format !== ARCHIVE_FORMAT) throw new Error('Unrecognized archive format.');
  const snapshot = entries['document.bin'] ?? new Uint8Array();
  const blobs = new Map<string, Uint8Array>();
  for (const [name, data] of Object.entries(entries)) {
    if (name.startsWith('blobs/')) blobs.set(name.slice('blobs/'.length), data);
  }
  return { manifest, snapshot, blobs };
}

/**
 * Build a fresh document from an archived snapshot: a brand-new Y.Doc (fresh
 * guid) with every node id remapped (CRDT-safe — the import is a fork, not a
 * re-join of the original's history). Returns the new doc; the caller persists
 * it and restores blobs (which keep their refs).
 */
export function documentFromSnapshot(
  snapshot: Uint8Array,
  id: DocumentId,
  createdAt: number,
): Y.Doc {
  const temp = new Y.Doc();
  if (snapshot.byteLength > 0) Y.applyUpdate(temp, snapshot);
  const { doc } = createDocument({ id, createdAt });
  copyDocumentContent(temp, doc);
  temp.destroy();
  return doc;
}
