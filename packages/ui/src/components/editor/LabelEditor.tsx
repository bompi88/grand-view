import { useState } from 'react';
import type { Label, NodeId } from '@gv/shared';
import { useNodeOps } from '../../hooks/useNodeOps.js';
import { Icon } from '../Icon.js';

/**
 * Edit a node's tags or references. Labels are {value,label}; here value==label
 * (slugified) for simplicity — the global registry / rename lands in a later step.
 */
export function LabelEditor({
  nodeId,
  kind,
  labels,
  title,
}: {
  nodeId: NodeId;
  kind: 'tags' | 'references';
  labels: Label[];
  title: string;
}) {
  const ops = useNodeOps();
  const [draft, setDraft] = useState('');

  function add() {
    const text = draft.trim();
    if (!text) return;
    const value = text.toLowerCase();
    if (labels.some((l) => l.value === value)) {
      setDraft('');
      return;
    }
    ops.setLabels(nodeId, kind, [...labels, { value, label: text }]);
    setDraft('');
  }

  function remove(value: string) {
    ops.setLabels(
      nodeId,
      kind,
      labels.filter((l) => l.value !== value),
    );
  }

  return (
    <div className="gv-field" data-testid={`labels-${kind}`}>
      <label className="gv-labels-title">
        <Icon name={kind === 'tags' ? 'template' : 'open'} size={13} />
        {title}
      </label>
      <div className="gv-chips">
        {labels.map((l) => (
          <span key={l.value} className="gv-chip">
            {l.label}
            <button aria-label={`Remove ${l.label}`} onClick={() => remove(l.value)}>
              <Icon name="x" size={12} />
            </button>
          </span>
        ))}
        <input
          className="gv-chip-input"
          value={draft}
          placeholder="Add…"
          onChange={(e) => setDraft(e.target.value)}
          onKeyDown={(e) => {
            if (e.key === 'Enter') add();
          }}
          onBlur={add}
        />
      </div>
    </div>
  );
}
