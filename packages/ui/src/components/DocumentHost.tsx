import { useEffect, useState } from 'react';
import { exportDocx, getDocumentMeta, imageBlobRefs, renameDocumentEntry } from '@gv/core';
import type { DocumentId } from '@gv/shared';
import { DocProvider, useDoc } from '../providers/DocContext.js';
import { usePlatform } from '../providers/PlatformContext.js';
import { UndoProvider } from '../providers/UndoContext.js';
import { LiveProvider } from '../providers/LiveContext.js';
import { useWorkspace, type OpenedDoc } from '../providers/WorkspaceContext.js';
import { useNav } from '../state/nav.js';
import { useSelection } from '../state/selection.js';
import { usePresence } from '../hooks/usePresence.js';
import { PresenceBar } from './presence/PresenceBar.js';
import { SyncMenu } from './SyncMenu.js';
import { WorkArea } from './WorkArea.js';
import { Icon } from './Icon.js';

const DOCX_MIME =
  'application/vnd.openxmlformats-officedocument.wordprocessingml.document';

function ExportButton({ id }: { id: DocumentId }) {
  const doc = useDoc();
  const platform = usePlatform();
  const ws = useWorkspace();
  const [busy, setBusy] = useState(false);

  async function onExport() {
    setBusy(true);
    try {
      const images = new Map<string, Uint8Array>();
      for (const ref of imageBlobRefs(doc)) {
        try {
          images.set(ref, await platform.blobStore.get(ref));
        } catch {
          /* skip missing blob */
        }
      }
      const bytes = await exportDocx(doc, images);
      const title = getDocumentMeta(ws.library, id)?.title || 'document';
      await platform.picker.saveFile({ suggestedName: `${title}.docx`, mime: DOCX_MIME, bytes });
    } finally {
      setBusy(false);
    }
  }

  return (
    <button
      className="gv-icon-btn"
      title="Export to Word (.docx)"
      data-testid="export-docx"
      disabled={busy}
      onClick={() => void onExport()}
    >
      <Icon name="download" />
    </button>
  );
}

function ArchiveExportButton({ id }: { id: DocumentId }) {
  const platform = usePlatform();
  const ws = useWorkspace();
  async function onExport() {
    const { bytes, filename } = await ws.exportArchive(id);
    await platform.picker.saveFile({ suggestedName: filename, mime: 'application/zip', bytes });
  }
  return (
    <button
      className="gv-icon-btn"
      title="Export as GrandView file (.gvd)"
      data-testid="export-gvd"
      onClick={() => void onExport()}
    >
      <Icon name="share" />
    </button>
  );
}

function DocTitle({ id }: { id: DocumentId }) {
  const ws = useWorkspace();
  const [title, setTitle] = useState(() => getDocumentMeta(ws.library, id)?.title ?? '');
  return (
    <input
      className="gv-doc-name-inline"
      data-testid="doc-title"
      value={title}
      onChange={(e) => setTitle(e.target.value)}
      onBlur={() => renameDocumentEntry(ws.library, id, title || 'Untitled document')}
      placeholder="Untitled document"
    />
  );
}

/** Opens a document's content (async) and hosts the editing surface. */
export function DocumentHost({ id }: { id: DocumentId }) {
  const ws = useWorkspace();
  const goLibrary = useNav((s) => s.goLibrary);
  const select = useSelection((s) => s.select);
  const [opened, setOpened] = useState<OpenedDoc | null>(null);
  const [epoch, setEpoch] = useState(0);
  const presence = usePresence(opened?.awareness);

  useEffect(() => {
    let active = true;
    setOpened(null);
    select(null);
    void ws.open(id).then((rec) => {
      if (active) setOpened(rec);
      else void ws.close(id);
    });
    return () => {
      active = false;
      void ws.close(id);
    };
  }, [ws, id, select, epoch]);

  if (!opened) {
    return <div className="gv-loading">Opening…</div>;
  }

  return (
    <DocProvider key={id} doc={opened.doc}>
      <LiveProvider value={{ awareness: opened.awareness, user: opened.user }}>
        <UndoProvider>
        <div className="gv-doc-host">
          <div className="gv-doc-bar">
            <div className="gv-doc-bar-left">
              <button
                className="gv-icon-btn"
                title="Back to documents"
                data-testid="back-to-library"
                onClick={goLibrary}
              >
                <Icon name="back" />
              </button>
              <DocTitle id={id} />
            </div>
            <div className="gv-doc-bar-right">
              <ArchiveExportButton id={id} />
              <ExportButton id={id} />
              <PresenceBar users={presence} />
              <SyncMenu
                id={id}
                provider={opened.provider}
                onReload={() => setEpoch((e) => e + 1)}
              />
            </div>
          </div>
          <WorkArea />
        </div>
        </UndoProvider>
      </LiveProvider>
    </DocProvider>
  );
}
