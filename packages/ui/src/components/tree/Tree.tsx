import {
  DndContext,
  KeyboardSensor,
  PointerSensor,
  closestCenter,
  useSensor,
  useSensors,
  type DragEndEvent,
} from '@dnd-kit/core';
import {
  SortableContext,
  sortableKeyboardCoordinates,
  useSortable,
  verticalListSortingStrategy,
} from '@dnd-kit/sortable';
import { CSS } from '@dnd-kit/utilities';
import type { NodeId, NodeView } from '@gv/shared';
import { useFlatTree, type FlatRow } from '../../hooks/useFlatTree.js';
import { useNodeOps } from '../../hooks/useNodeOps.js';
import { useSelection } from '../../state/selection.js';
import { Icon } from '../Icon.js';

function Row({ row }: { row: FlatRow }) {
  const { node, depth, hasChildren } = row;
  const ops = useNodeOps();
  const selectedId = useSelection((s) => s.selectedId);
  const select = useSelection((s) => s.select);
  const { attributes, listeners, setNodeRef, transform, transition, isDragging } = useSortable({
    id: node.id,
  });
  const isChapter = node.nodeType === 'chapter';

  return (
    <li
      ref={setNodeRef}
      style={{
        transform: CSS.Transform.toString(transform),
        transition,
        opacity: isDragging ? 0.4 : 1,
      }}
      className="gv-row-li"
    >
      <div
        className={`gv-row${selectedId === node.id ? ' gv-row-selected' : ''}`}
        style={{ paddingLeft: depth * 16 + 6 }}
        onClick={() => select(node.id)}
        data-testid={`node-${node.id}`}
      >
        <span className="gv-drag" {...attributes} {...listeners} aria-label="Drag to reorder">
          <Icon name="grip" size={15} />
        </span>
        {isChapter ? (
          <button
            className="gv-twisty"
            aria-label={node.isCollapsed ? 'Expand' : 'Collapse'}
            onClick={(e) => {
              e.stopPropagation();
              ops.setCollapsed(node.id, !node.isCollapsed);
            }}
            disabled={!hasChildren}
          >
            {hasChildren ? (
              <Icon name={node.isCollapsed ? 'chevron-right' : 'chevron-down'} size={14} />
            ) : (
              <span style={{ width: 14 }} />
            )}
          </button>
        ) : (
          <span className="gv-twisty" />
        )}
        <span className={`gv-node-icon${isChapter ? ' gv-node-icon-chapter' : ''}`}>
          <Icon name={isChapter ? 'folder' : 'note'} size={15} />
        </span>
        <span className="gv-name">{node.name || (isChapter ? 'Untitled chapter' : 'Note')}</span>
        <span className="gv-actions" onClick={(e) => e.stopPropagation()}>
          {isChapter && (
            <>
              <button
                className="gv-icon-btn"
                title="Add sub-chapter"
                data-testid="add-subchapter"
                onClick={() => ops.insert({ parentId: node.id, nodeType: 'chapter', name: 'New chapter' })}
              >
                <Icon name="folder" size={14} />
              </button>
              <button
                className="gv-icon-btn"
                title="Add note"
                data-testid="add-note"
                onClick={() => ops.insert({ parentId: node.id, nodeType: 'media', name: 'New note' })}
              >
                <Icon name="plus" size={14} />
              </button>
            </>
          )}
          <button
            className="gv-icon-btn"
            title="Duplicate"
            data-testid="dup-node"
            onClick={() => ops.duplicate(node.id)}
          >
            <Icon name="copy" size={14} />
          </button>
          <button
            className="gv-icon-btn"
            title="Move to trash"
            data-testid="del-node"
            onClick={() => ops.remove(node.id)}
          >
            <Icon name="trash" size={14} />
          </button>
        </span>
      </div>
    </li>
  );
}

export function Tree() {
  const { rows, recovered } = useFlatTree();
  const ops = useNodeOps();
  const sensors = useSensors(
    useSensor(PointerSensor, { activationConstraint: { distance: 4 } }),
    useSensor(KeyboardSensor, { coordinateGetter: sortableKeyboardCoordinates }),
  );

  function handleDragEnd(e: DragEndEvent) {
    const activeId = e.active.id as NodeId;
    const overId = e.over?.id as NodeId | undefined;
    if (!overId || overId === activeId) return;
    const overRow = rows.find((r) => r.node.id === overId);
    if (!overRow) return;
    const target = overRow.node;
    if (target.nodeType === 'chapter') {
      ops.move(activeId, target.id, { type: 'append' });
    } else {
      ops.move(activeId, target.parentId, { type: 'after', id: target.id });
    }
  }

  return (
    <DndContext sensors={sensors} collisionDetection={closestCenter} onDragEnd={handleDragEnd}>
      <SortableContext items={rows.map((r) => r.node.id)} strategy={verticalListSortingStrategy}>
        <ul className="gv-tree">
          {rows.map((row) => (
            <Row key={row.node.id} row={row} />
          ))}
        </ul>
      </SortableContext>
      {recovered.length > 0 && (
        <p className="gv-recovered">⚠ {recovered.length} recovered node(s)</p>
      )}
    </DndContext>
  );
}

export type { NodeView };
