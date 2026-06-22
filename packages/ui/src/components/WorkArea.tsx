import { useNodeOps } from '../hooks/useNodeOps.js';
import { useUndo } from '../providers/UndoContext.js';
import { useSelection } from '../state/selection.js';
import { useDoc } from '../providers/DocContext.js';
import { nodesMap } from '@gv/core';
import { ROOT_PARENT, type NodeId } from '@gv/shared';
import { Tree } from './tree/Tree.js';
import { NodeDetail } from './editor/NodeDetail.js';
import { TrashPanel } from './trash/TrashPanel.js';

/** Set every chapter's collapsed flag (collapse-all / expand-all). */
function useSetAllCollapsed() {
  const doc = useDoc();
  const ops = useNodeOps();
  return (collapsed: boolean) => {
    const ids: NodeId[] = [];
    for (const node of nodesMap(doc).values()) {
      if (node.get('nodeType') === 'chapter') ids.push(node.get('id') as NodeId);
    }
    ids.forEach((id) => ops.setCollapsed(id, collapsed));
  };
}

export function WorkArea() {
  const ops = useNodeOps();
  const { controller, canUndo, canRedo } = useUndo();
  const showTrash = useSelection((s) => s.showTrash);
  const setShowTrash = useSelection((s) => s.setShowTrash);
  const setAllCollapsed = useSetAllCollapsed();

  return (
    <div className="gv-workarea">
      <aside className="gv-sidebar">
        <div className="gv-toolbar">
          <button
            data-testid="add-chapter"
            onClick={() => ops.insert({ parentId: ROOT_PARENT, nodeType: 'chapter', name: 'New chapter' })}
          >
            + Chapter
          </button>
          <button data-testid="undo" disabled={!canUndo} onClick={() => controller.undo()}>
            ↶
          </button>
          <button data-testid="redo" disabled={!canRedo} onClick={() => controller.redo()}>
            ↷
          </button>
          <span className="gv-spacer" />
          <button title="Collapse all" onClick={() => setAllCollapsed(true)}>⊟</button>
          <button title="Expand all" onClick={() => setAllCollapsed(false)}>⊞</button>
          <button data-testid="show-trash" onClick={() => setShowTrash(true)}>🗑</button>
        </div>
        <Tree />
      </aside>
      <section className="gv-content">{showTrash ? <TrashPanel /> : <NodeDetail />}</section>
    </div>
  );
}
