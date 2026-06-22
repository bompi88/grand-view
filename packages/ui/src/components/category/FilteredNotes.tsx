import { useMemo } from 'react';
import { listLabelUsage, nodesWithLabel, nodesWithoutLabels, type LabelKind } from '@gv/core';
import { useDoc } from '../../providers/DocContext.js';
import { useDocVersion } from '../../hooks/useDocVersion.js';
import { useSelection, UNLABELLED } from '../../state/selection.js';
import { Icon } from '../Icon.js';

/** Content-area browser: the notes matching the active tag/reference filter. */
export function FilteredNotes({ kind }: { kind: LabelKind }) {
  const doc = useDoc();
  const version = useDocVersion(doc);
  const filterValue = useSelection((s) => s.filterValue)!;
  const select = useSelection((s) => s.select);

  const { notes, heading } = useMemo(() => {
    if (filterValue === UNLABELLED) {
      return {
        notes: nodesWithoutLabels(doc, kind),
        heading: kind === 'tags' ? 'Untagged notes' : 'Unreferenced notes',
      };
    }
    const label = listLabelUsage(doc, kind).find((u) => u.value === filterValue)?.label ?? filterValue;
    return { notes: nodesWithLabel(doc, kind, filterValue), heading: label };
  }, [doc, version, kind, filterValue]);

  return (
    <div className="gv-detail" data-testid="filtered-notes">
      <div className="gv-detail-head">
        <h2>
          <Icon name={kind === 'tags' ? 'template' : 'open'} size={16} /> {heading}
        </h2>
        <span className="gv-muted-text">{notes.length} note(s)</span>
      </div>
      {notes.length === 0 ? (
        <div className="gv-empty">Nothing here.</div>
      ) : (
        <ul className="gv-doc-list">
          {notes.map((n) => (
            <li key={n.id} className="gv-doc-card" data-testid="filtered-note">
              <span className="gv-doc-icon">
                <Icon name={n.nodeType === 'chapter' ? 'folder' : 'note'} size={18} />
              </span>
              <button className="gv-doc-open" onClick={() => select(n.id)}>
                <span className="gv-doc-title">{n.name || 'Untitled'}</span>
                <span className="gv-muted-text">
                  {[...n.tags, ...n.references].map((l) => l.label).join(' · ') || '—'}
                </span>
              </button>
            </li>
          ))}
        </ul>
      )}
    </div>
  );
}
