import { useMemo } from 'react';
import { getTrashRoots } from '@gv/core';
import { useDoc } from '../../providers/DocContext.js';
import { useDocVersion } from '../../hooks/useDocVersion.js';
import { useNodeOps } from '../../hooks/useNodeOps.js';
import { useSelection } from '../../state/selection.js';

export function TrashPanel() {
  const doc = useDoc();
  const version = useDocVersion(doc);
  const ops = useNodeOps();
  const setShowTrash = useSelection((s) => s.setShowTrash);
  const entries = useMemo(() => getTrashRoots(doc), [doc, version]);

  return (
    <div className="gv-detail" data-testid="trash-panel">
      <div className="gv-detail-head">
        <h2>Trash</h2>
        <div style={{ display: 'flex', gap: 8 }}>
          <button
            className="gv-btn gv-btn-outline gv-btn-sm"
            disabled={entries.length === 0}
            onClick={() => ops.emptyTrash()}
          >
            Empty trash
          </button>
          <button className="gv-btn gv-btn-sm" onClick={() => setShowTrash(false)}>
            Close
          </button>
        </div>
      </div>
      {entries.length === 0 ? (
        <div className="gv-empty">
          <span className="gv-empty-emoji">🗑️</span>
          Trash is empty.
        </div>
      ) : (
        <ul className="gv-trash-list">
          {entries.map((e) => (
            <li key={e.node.id}>
              <span className="gv-name">
                {e.node.name || (e.node.nodeType === 'chapter' ? 'Untitled chapter' : 'Note')}
              </span>
              <span className="gv-muted-text">{e.count} item(s)</span>
              <button className="gv-btn gv-btn-outline gv-btn-sm" onClick={() => ops.restore(e.node.id)}>
                Restore
              </button>
            </li>
          ))}
        </ul>
      )}
    </div>
  );
}
