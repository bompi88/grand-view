import { useMemo } from 'react';
import {
  addDocumentEntry,
  deleteDocumentEntry,
  listDocumentTrash,
  listDocuments,
  listTemplates,
  restoreDocumentEntry,
  softRemoveDocumentEntry,
} from '@gv/core';
import type { DocumentId, DocumentMeta } from '@gv/shared';
import { useWorkspace } from '../../providers/WorkspaceContext.js';
import { useDocVersion } from '../../hooks/useDocVersion.js';
import { useNav } from '../../state/nav.js';

function fmtDate(ms: number): string {
  if (!ms) return '';
  return new Date(ms).toLocaleString();
}

export function LibraryScreen() {
  const ws = useWorkspace();
  const lib = ws.library;
  const version = useDocVersion(lib);
  const openDoc = useNav((s) => s.openDoc);

  const { docs, templates, trash } = useMemo(
    () => ({
      docs: listDocuments(lib),
      templates: listTemplates(lib),
      trash: listDocumentTrash(lib),
    }),
    [lib, version],
  );

  function createNew() {
    const id = addDocumentEntry(lib, { title: 'Untitled document', createdAt: Date.now() });
    openDoc(id);
  }

  async function destroy(id: DocumentId) {
    deleteDocumentEntry(lib, id);
    await ws.destroyContent(id);
  }

  return (
    <div className="gv-library">
      <div className="gv-lib-head">
        <h2>My Documents</h2>
        <button data-testid="new-document" onClick={createNew}>
          + New document
        </button>
      </div>

      {docs.length === 0 ? (
        <p className="gv-muted-text">No documents yet — create one to get started.</p>
      ) : (
        <ul className="gv-doc-list" data-testid="doc-list">
          {docs.map((d: DocumentMeta) => (
            <li key={d.id} className="gv-doc-card" data-testid={`doc-${d.id}`}>
              <button className="gv-doc-open" onClick={() => openDoc(d.id)}>
                <span className="gv-doc-title">{d.title || 'Untitled'}</span>
                <span className="gv-muted-text">edited {fmtDate(d.lastChanged)}</span>
              </button>
              <button
                title="Move to trash"
                onClick={() => softRemoveDocumentEntry(lib, d.id, Date.now())}
              >
                Del
              </button>
            </li>
          ))}
        </ul>
      )}

      {templates.length > 0 && (
        <>
          <h3>Templates</h3>
          <ul className="gv-doc-list">
            {templates.map((d) => (
              <li key={d.id} className="gv-doc-card">
                <button className="gv-doc-open" onClick={() => openDoc(d.id)}>
                  <span className="gv-doc-title">{d.title || 'Untitled'}</span>
                </button>
              </li>
            ))}
          </ul>
        </>
      )}

      {trash.length > 0 && (
        <>
          <h3>Trash</h3>
          <ul className="gv-doc-list">
            {trash.map((d) => (
              <li key={d.id} className="gv-doc-card">
                <span className="gv-doc-title">{d.title || 'Untitled'}</span>
                <button onClick={() => restoreDocumentEntry(lib, d.id)}>Restore</button>
                <button onClick={() => void destroy(d.id)}>Delete forever</button>
              </li>
            ))}
          </ul>
        </>
      )}
    </div>
  );
}
