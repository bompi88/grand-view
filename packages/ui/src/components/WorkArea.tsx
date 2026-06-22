import { useTranslation } from 'react-i18next';
import { useNodeOps } from '../hooks/useNodeOps.js';
import { useUndo } from '../providers/UndoContext.js';
import { useSelection } from '../state/selection.js';
import { useDoc } from '../providers/DocContext.js';
import { nodesMap } from '@gv/core';
import { ROOT_PARENT, type NodeId } from '@gv/shared';
import { Tree } from './tree/Tree.js';
import { NodeDetail } from './editor/NodeDetail.js';
import { TrashPanel } from './trash/TrashPanel.js';
import { CategoryList } from './category/CategoryList.js';
import { FilteredNotes } from './category/FilteredNotes.js';
import { Icon } from './Icon.js';
import type { SidebarView } from '../state/selection.js';

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

const VIEWS: { id: SidebarView; key: string }[] = [
  { id: 'structure', key: 'view.structure' },
  { id: 'tags', key: 'view.tags' },
  { id: 'references', key: 'view.references' },
];

export function WorkArea() {
  const { t } = useTranslation();
  const ops = useNodeOps();
  const { controller, canUndo, canRedo } = useUndo();
  const showTrash = useSelection((s) => s.showTrash);
  const setShowTrash = useSelection((s) => s.setShowTrash);
  const view = useSelection((s) => s.view);
  const setView = useSelection((s) => s.setView);
  const filterValue = useSelection((s) => s.filterValue);
  const setAllCollapsed = useSetAllCollapsed();
  const kind = view === 'references' ? 'references' : 'tags';

  return (
    <div className="gv-workarea">
      <aside className="gv-sidebar">
        <div className="gv-segmented" role="tablist">
          {VIEWS.map((v) => (
            <button
              key={v.id}
              role="tab"
              aria-selected={view === v.id}
              className={`gv-seg${view === v.id ? ' gv-seg-active' : ''}`}
              data-testid={`view-${v.id}`}
              onClick={() => setView(v.id)}
            >
              {t(v.key)}
            </button>
          ))}
        </div>
        {view === 'structure' && (
          <>
        <div className="gv-toolbar">
          <button
            className="gv-btn gv-btn-primary gv-btn-sm"
            data-testid="add-chapter"
            onClick={() => ops.insert({ parentId: ROOT_PARENT, nodeType: 'chapter', name: 'New chapter' })}
          >
            <Icon name="plus" size={14} /> {t('tree.addChapter')}
          </button>
          <span className="gv-spacer" />
          <button
            className="gv-icon-btn"
            title="Undo"
            data-testid="undo"
            disabled={!canUndo}
            onClick={() => controller.undo()}
          >
            <Icon name="undo" />
          </button>
          <button
            className="gv-icon-btn"
            title="Redo"
            data-testid="redo"
            disabled={!canRedo}
            onClick={() => controller.redo()}
          >
            <Icon name="redo" />
          </button>
          <button className="gv-icon-btn" title="Collapse all" onClick={() => setAllCollapsed(true)}>
            <Icon name="collapse-all" />
          </button>
          <button className="gv-icon-btn" title="Expand all" onClick={() => setAllCollapsed(false)}>
            <Icon name="expand-all" />
          </button>
          <button
            className="gv-icon-btn"
            title="Trash"
            data-testid="show-trash"
            onClick={() => setShowTrash(true)}
          >
            <Icon name="trash" />
          </button>
        </div>
        <Tree />
          </>
        )}
        {view !== 'structure' && <CategoryList kind={kind} />}
      </aside>
      <section className="gv-content">
        {showTrash ? (
          <TrashPanel />
        ) : view !== 'structure' && filterValue != null ? (
          <FilteredNotes kind={kind} />
        ) : (
          <NodeDetail />
        )}
      </section>
    </div>
  );
}
