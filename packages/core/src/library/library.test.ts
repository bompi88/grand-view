import { describe, expect, it } from 'vitest';
import {
  addDocumentEntry,
  createLibrary,
  deleteDocumentEntry,
  listDocumentTrash,
  listDocuments,
  listTemplates,
  renameDocumentEntry,
  restoreDocumentEntry,
  softRemoveDocumentEntry,
  touchDocumentEntry,
} from './library.js';

describe('document library', () => {
  it('adds, lists, and separates documents from templates', () => {
    const lib = createLibrary();
    addDocumentEntry(lib, { title: 'Doc A', createdAt: 1 });
    addDocumentEntry(lib, { title: 'Tmpl', isTemplate: true, createdAt: 2 });
    expect(listDocuments(lib).map((d) => d.title)).toEqual(['Doc A']);
    expect(listTemplates(lib).map((d) => d.title)).toEqual(['Tmpl']);
  });

  it('orders by lastChanged (newest first) and touch updates it', () => {
    const lib = createLibrary();
    const a = addDocumentEntry(lib, { title: 'A', createdAt: 1 });
    addDocumentEntry(lib, { title: 'B', createdAt: 2 });
    expect(listDocuments(lib).map((d) => d.title)).toEqual(['B', 'A']);
    touchDocumentEntry(lib, a, 99);
    expect(listDocuments(lib).map((d) => d.title)).toEqual(['A', 'B']);
  });

  it('soft-removes to trash, restores, and permanently deletes', () => {
    const lib = createLibrary();
    const id = addDocumentEntry(lib, { title: 'Doc', createdAt: 1 });

    softRemoveDocumentEntry(lib, id, 5);
    expect(listDocuments(lib)).toHaveLength(0);
    expect(listDocumentTrash(lib).map((d) => d.title)).toEqual(['Doc']);

    restoreDocumentEntry(lib, id);
    expect(listDocuments(lib).map((d) => d.title)).toEqual(['Doc']);
    expect(listDocumentTrash(lib)).toHaveLength(0);

    deleteDocumentEntry(lib, id);
    expect(listDocuments(lib)).toHaveLength(0);
    expect(listDocumentTrash(lib)).toHaveLength(0);
  });

  it('renames a document', () => {
    const lib = createLibrary();
    const id = addDocumentEntry(lib, { title: 'Old', createdAt: 1 });
    renameDocumentEntry(lib, id, 'New');
    expect(listDocuments(lib)[0]!.title).toBe('New');
  });
});
