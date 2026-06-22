import { useMemo, useState } from 'react';
import { useTranslation } from 'react-i18next';
import { listLabelUsage, nodesWithoutLabels, type LabelKind } from '@gv/core';
import { useDoc } from '../../providers/DocContext.js';
import { useDocVersion } from '../../hooks/useDocVersion.js';
import { useNodeOps } from '../../hooks/useNodeOps.js';
import { useSelection, UNLABELLED } from '../../state/selection.js';
import { Icon } from '../Icon.js';

function CategoryRow({ kind, value, label, count }: { kind: LabelKind; value: string; label: string; count: number }) {
  const ops = useNodeOps();
  const filterValue = useSelection((s) => s.filterValue);
  const setFilter = useSelection((s) => s.setFilter);
  const [editing, setEditing] = useState(false);
  const [draft, setDraft] = useState(label);

  if (editing) {
    return (
      <li className="gv-cat-row">
        <input
          className="gv-chip-input"
          autoFocus
          value={draft}
          onChange={(e) => setDraft(e.target.value)}
          onKeyDown={(e) => {
            if (e.key === 'Enter') {
              if (draft.trim()) ops.renameLabel(kind, value, draft.trim());
              setEditing(false);
            } else if (e.key === 'Escape') setEditing(false);
          }}
          onBlur={() => {
            if (draft.trim() && draft.trim() !== label) ops.renameLabel(kind, value, draft.trim());
            setEditing(false);
          }}
        />
      </li>
    );
  }

  return (
    <li className={`gv-cat-row${filterValue === value ? ' gv-cat-row-active' : ''}`}>
      <button className="gv-cat-main" data-testid="category" onClick={() => setFilter(value)}>
        <span className="gv-cat-label">{label}</span>
        <span className="gv-count">{count}</span>
      </button>
      <span className="gv-actions">
        <button className="gv-icon-btn" title="Rename" onClick={() => { setDraft(label); setEditing(true); }}>
          <Icon name="note" size={13} />
        </button>
        <button className="gv-icon-btn" title="Remove everywhere" onClick={() => ops.removeLabel(kind, value)}>
          <Icon name="trash" size={13} />
        </button>
      </span>
    </li>
  );
}

export function CategoryList({ kind }: { kind: LabelKind }) {
  const { t } = useTranslation();
  const doc = useDoc();
  const version = useDocVersion(doc);
  const filterValue = useSelection((s) => s.filterValue);
  const setFilter = useSelection((s) => s.setFilter);
  const usage = useMemo(() => listLabelUsage(doc, kind), [doc, version, kind]);
  const unlabelledCount = useMemo(() => nodesWithoutLabels(doc, kind).length, [doc, version, kind]);
  const noun = kind === 'tags' ? 'tags' : 'references';

  return (
    <div className="gv-cat" data-testid={`category-list-${kind}`}>
      <ul className="gv-cat-list">
        {usage.map((u) => (
          <CategoryRow key={u.value} kind={kind} value={u.value} label={u.label} count={u.count} />
        ))}
        {usage.length === 0 && <li className="gv-muted-text gv-cat-empty">No {noun} yet.</li>}
        <li className={`gv-cat-row${filterValue === UNLABELLED ? ' gv-cat-row-active' : ''}`}>
          <button className="gv-cat-main" onClick={() => setFilter(UNLABELLED)}>
            <span className="gv-cat-label gv-muted-text">
              {kind === 'tags' ? t('common.untagged') : t('common.unreferenced')}
            </span>
            <span className="gv-count">{unlabelledCount}</span>
          </button>
        </li>
      </ul>
    </div>
  );
}
