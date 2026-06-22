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
import { Icon } from '../Icon.js';

function fmtDate(ms: number): string {
  if (!ms) return '';
  return new Date(ms).toLocaleDateString(undefined, { dateStyle: 'medium' });
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

  async function makeTemplate(d: DocumentMeta) {
    await ws.makeTemplate(d.id, `${d.title || 'Untitled'} template`);
  }

  async function useTemplate(d: DocumentMeta) {
    const id = await ws.instantiateTemplate(d.id, (d.title || 'Untitled').replace(/ template$/, ''));
    openDoc(id);
  }

  return (
    <div className="gv-library">
      <div className="gv-lib-head">
        <h2>My Documents</h2>
        <button className="gv-btn gv-btn-primary" data-testid="new-document" onClick={createNew}>
          <Icon name="doc-plus" /> New document
        </button>
      </div>

      {docs.length === 0 ? (
        <div className="gv-empty">
          <span className="gv-empty-emoji">📚</span>
          No documents yet — create one to start structuring your information.
        </div>
      ) : (
        <ul className="gv-doc-list" data-testid="doc-list">
          {docs.map((d: DocumentMeta) => (
            <li key={d.id} className="gv-doc-card" data-testid={`doc-${d.id}`}>
              <span className="gv-doc-icon">
                <Icon name="note" size={20} />
              </span>
              <button className="gv-doc-open" onClick={() => openDoc(d.id)}>
                <span className="gv-doc-title">{d.title || 'Untitled'}</span>
                <span className="gv-muted-text">edited {fmtDate(d.lastChanged)}</span>
              </button>
              <span className="gv-card-actions">
                <button
                  className="gv-icon-btn"
                  title="Save as template"
                  data-testid="make-template"
                  onClick={() => void makeTemplate(d)}
                >
                  <Icon name="template" size={15} />
                </button>
                <button
                  className="gv-icon-btn"
                  title="Move to trash"
                  onClick={() => softRemoveDocumentEntry(lib, d.id, Date.now())}
                >
                  <Icon name="trash" size={15} />
                </button>
              </span>
            </li>
          ))}
        </ul>
      )}

      {templates.length > 0 && (
        <>
          <h3 className="gv-section-title">Templates</h3>
          <ul className="gv-doc-list" data-testid="template-list">
            {templates.map((d) => (
              <li key={d.id} className="gv-doc-card">
                <span className="gv-doc-icon">
                  <Icon name="template" size={20} />
                </span>
                <button className="gv-doc-open" onClick={() => openDoc(d.id)}>
                  <span className="gv-doc-title">{d.title || 'Untitled'}</span>
                  <span className="gv-muted-text">template</span>
                </button>
                <span className="gv-card-actions">
                  <button
                    className="gv-icon-btn"
                    title="New document from template"
                    data-testid="use-template"
                    onClick={() => void useTemplate(d)}
                  >
                    <Icon name="doc-plus" size={15} />
                  </button>
                  <button
                    className="gv-icon-btn"
                    title="Move to trash"
                    onClick={() => softRemoveDocumentEntry(lib, d.id, Date.now())}
                  >
                    <Icon name="trash" size={15} />
                  </button>
                </span>
              </li>
            ))}
          </ul>
        </>
      )}

      {trash.length > 0 && (
        <>
          <h3 className="gv-section-title">Trash</h3>
          <ul className="gv-doc-list">
            {trash.map((d) => (
              <li key={d.id} className="gv-doc-card">
                <span className="gv-doc-icon">
                  <Icon name="trash" size={18} />
                </span>
                <span className="gv-doc-open">
                  <span className="gv-doc-title">{d.title || 'Untitled'}</span>
                </span>
                <span className="gv-card-actions" style={{ opacity: 1, position: 'static' }}>
                  <button className="gv-icon-btn" title="Restore" onClick={() => restoreDocumentEntry(lib, d.id)}>
                    <Icon name="restore" size={15} />
                  </button>
                  <button className="gv-icon-btn" title="Delete forever" onClick={() => void destroy(d.id)}>
                    <Icon name="x" size={15} />
                  </button>
                </span>
              </li>
            ))}
          </ul>
        </>
      )}
    </div>
  );
}
