import * as Y from 'yjs';
import { newDocumentId, type DocumentId } from '@gv/shared';
import { initDocument, type CreateDocumentOptions } from './schema.js';

/**
 * Create a fresh Grand View Y.Doc. `createdAt` defaults to caller-supplied time;
 * pass it explicitly in deterministic contexts (tests, import).
 */
export function createDocument(opts: CreateDocumentOptions = {}): {
  id: DocumentId;
  doc: Y.Doc;
} {
  const id = opts.id ?? newDocumentId();
  const doc = new Y.Doc({ guid: id });
  initDocument(doc, { ...opts, id });
  return { id, doc };
}
