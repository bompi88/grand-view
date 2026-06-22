import { useEffect, useState } from 'react';
import type { DocumentId } from '@gv/shared';
import { DocProvider } from '../providers/DocContext.js';
import { UndoProvider } from '../providers/UndoContext.js';
import { useWorkspace, type OpenedDoc } from '../providers/WorkspaceContext.js';
import { useNav } from '../state/nav.js';
import { useSelection } from '../state/selection.js';
import { WorkArea } from './WorkArea.js';

/** Opens a document's content (async) and hosts the editing surface. */
export function DocumentHost({ id }: { id: DocumentId }) {
  const ws = useWorkspace();
  const goLibrary = useNav((s) => s.goLibrary);
  const select = useSelection((s) => s.select);
  const [opened, setOpened] = useState<OpenedDoc | null>(null);

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
  }, [ws, id, select]);

  if (!opened) {
    return <div className="gv-loading">Opening…</div>;
  }

  return (
    <DocProvider key={id} doc={opened.doc}>
      <UndoProvider>
        <div className="gv-doc-host">
          <div className="gv-doc-bar">
            <button data-testid="back-to-library" onClick={goLibrary}>
              ← Documents
            </button>
            <span className="gv-muted-text">provider: {opened.provider.kind}</span>
          </div>
          <WorkArea />
        </div>
      </UndoProvider>
    </DocProvider>
  );
}
