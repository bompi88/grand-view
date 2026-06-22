import { useEffect, useState } from 'react';
import { nodeDescriptionFragment } from '@gv/core';
import { useDoc } from '../../providers/DocContext.js';
import { useNodeOps } from '../../hooks/useNodeOps.js';
import { useNodeView } from '../../hooks/useNodeView.js';
import { useSelection } from '../../state/selection.js';
import { TipTapEditor } from './TipTapEditor.js';
import { LabelEditor } from './LabelEditor.js';

export function NodeDetail() {
  const doc = useDoc();
  const ops = useNodeOps();
  const selectedId = useSelection((s) => s.selectedId);
  const node = useNodeView(selectedId);
  const [name, setName] = useState('');

  useEffect(() => {
    setName(node?.name ?? '');
  }, [node?.id, node?.name]);

  if (!node || !selectedId) {
    return <div className="gv-detail gv-detail-empty">Select a chapter or note to edit.</div>;
  }

  const fragment = node.nodeType === 'media' ? nodeDescriptionFragment(doc, selectedId) : null;

  return (
    <div className="gv-detail" data-testid="node-detail">
      <input
        className="gv-detail-name"
        data-testid="detail-name"
        value={name}
        onChange={(e) => setName(e.target.value)}
        onBlur={() => ops.rename(selectedId, name)}
        placeholder={node.nodeType === 'chapter' ? 'Chapter title' : 'Note title'}
      />

      {fragment && (
        <div className="gv-detail-body">
          <TipTapEditor fragment={fragment} />
        </div>
      )}

      <LabelEditor nodeId={selectedId} kind="tags" labels={node.tags} title="Tags" />
      <LabelEditor
        nodeId={selectedId}
        kind="references"
        labels={node.references}
        title="References"
      />
    </div>
  );
}
