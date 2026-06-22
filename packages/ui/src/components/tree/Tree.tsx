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
      style={{ transform: CSS.Transform.toString(transform), transition, opacity: isDragging ? 0.4 : 1 }}
      className="gv-row-li"
    >
      <div
        className={`gv-row${selectedId === node.id ? ' gv-row-selected' : ''}`}
        style={{ paddingLeft: depth * 16 + 4 }}
        onClick={() => select(node.id)}
        data-testid={`node-${node.id}`}
      >
        <span className="gv-drag" {...attributes} {...listeners} aria-label="Drag">
          ⠿
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
            {hasChildren ? (node.isCollapsed ? '▸' : '▾') : '·'}
          </button>
        ) : (
          <span className="gv-twisty gv-media-dot">◆</span>
        )}
        <span className="gv-name">{node.name || (isChapter ? 'Untitled chapter' : 'Note')}</span>
        <span className="gv-actions" onClick={(e) => e.stopPropagation()}>
          {isChapter && (
            <>
              <button title="Add chapter" onClick={() => ops.insert({ parentId: node.id, nodeType: 'chapter', name: 'New chapter' })}>+Ch</button>
              <button title="Add note" onClick={() => ops.insert({ parentId: node.id, nodeType: 'media', name: 'New note' })}>+Note</button>
            </>
          )}
          <button title="Duplicate" onClick={() => ops.duplicate(node.id)}>Dup</button>
          <button title="Move to trash" onClick={() => ops.remove(node.id)}>Del</button>
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
      // Drop onto a chapter → become its (appended) child.
      ops.move(activeId, target.id, { type: 'append' });
    } else {
      // Drop onto a note → become a sibling immediately after it.
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
