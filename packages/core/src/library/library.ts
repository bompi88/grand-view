import * as Y from 'yjs';
import { newDocumentId, type DocumentId, type DocumentMeta } from '@gv/shared';

/**
 * The library Y.Doc holds metadata for every Grand View document and template
 * (and the whole-document trash). The documents' *content* lives in separate
 * per-document Y.Docs (one per id) — see @gv/core createDocument. Keeping the
 * list separate means opening the library never loads document bodies.
 */
export const LIBRARY_GUID = 'gv-library';
const DOCS = 'documents';

export function createLibrary(): Y.Doc {
  return new Y.Doc({ guid: LIBRARY_GUID });
}

export function libraryDocs(doc: Y.Doc): Y.Map<Y.Map<unknown>> {
  return doc.getMap<Y.Map<unknown>>(DOCS);
}

function toMeta(entry: Y.Map<unknown>): DocumentMeta {
  const removedAt = entry.get('removedAt');
  return {
    id: entry.get('id') as DocumentId,
    title: String(entry.get('title') ?? ''),
    isTemplate: Boolean(entry.get('isTemplate')),
    createdAt: Number(entry.get('createdAt') ?? 0),
    lastChanged: Number(entry.get('lastChanged') ?? 0),
    ...(typeof removedAt === 'number' ? { removedAt } : {}),
  };
}

export interface AddDocumentInput {
  id?: DocumentId;
  title: string;
  isTemplate?: boolean;
  createdAt: number;
}

/** Register a new document/template in the library. Returns its id. */
export function addDocumentEntry(lib: Y.Doc, input: AddDocumentInput): DocumentId {
  const id = input.id ?? newDocumentId();
  lib.transact(() => {
    const entry = new Y.Map();
    entry.set('id', id);
    entry.set('title', input.title);
    entry.set('isTemplate', Boolean(input.isTemplate));
    entry.set('createdAt', input.createdAt);
    entry.set('lastChanged', input.createdAt);
    libraryDocs(lib).set(id, entry);
  });
  return id;
}

export function renameDocumentEntry(lib: Y.Doc, id: DocumentId, title: string): boolean {
  const entry = libraryDocs(lib).get(id);
  if (!entry) return false;
  lib.transact(() => entry.set('title', title));
  return true;
}

/** Bump lastChanged (called when a document's content is modified). */
export function touchDocumentEntry(lib: Y.Doc, id: DocumentId, when: number): void {
  const entry = libraryDocs(lib).get(id);
  if (entry) lib.transact(() => entry.set('lastChanged', when));
}

/** Soft-delete: move a document to the library trash. */
export function softRemoveDocumentEntry(lib: Y.Doc, id: DocumentId, when: number): boolean {
  const entry = libraryDocs(lib).get(id);
  if (!entry) return false;
  lib.transact(() => entry.set('removedAt', when));
  return true;
}

export function restoreDocumentEntry(lib: Y.Doc, id: DocumentId): boolean {
  const entry = libraryDocs(lib).get(id);
  if (!entry) return false;
  lib.transact(() => entry.delete('removedAt'));
  return true;
}

/**
 * Permanently remove a document entry. The caller is responsible for also
 * dropping the document's persisted content (its IndexedDB store / files).
 */
export function deleteDocumentEntry(lib: Y.Doc, id: DocumentId): boolean {
  if (!libraryDocs(lib).has(id)) return false;
  lib.transact(() => libraryDocs(lib).delete(id));
  return true;
}

function listBy(lib: Y.Doc, pred: (m: DocumentMeta) => boolean): DocumentMeta[] {
  const out: DocumentMeta[] = [];
  for (const entry of libraryDocs(lib).values()) {
    const meta = toMeta(entry);
    if (pred(meta)) out.push(meta);
  }
  return out.sort((a, b) => b.lastChanged - a.lastChanged);
}

/** Active (non-trashed) documents. */
export function listDocuments(lib: Y.Doc): DocumentMeta[] {
  return listBy(lib, (m) => !m.isTemplate && m.removedAt === undefined);
}

/** Active (non-trashed) templates. */
export function listTemplates(lib: Y.Doc): DocumentMeta[] {
  return listBy(lib, (m) => m.isTemplate && m.removedAt === undefined);
}

/** Documents/templates currently in the library trash. */
export function listDocumentTrash(lib: Y.Doc): DocumentMeta[] {
  return listBy(lib, (m) => m.removedAt !== undefined);
}

export function getDocumentMeta(lib: Y.Doc, id: DocumentId): DocumentMeta | null {
  const entry = libraryDocs(lib).get(id);
  return entry ? toMeta(entry) : null;
}
