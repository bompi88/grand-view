import { Fragment } from 'react';
import {
  insertNode,
  removeToTrash,
  setCollapsed,
  duplicateSubtree,
  type TreeResult,
} from '@gv/core';
import type { NodeId, NodeView } from '@gv/shared';
import { useDoc } from '../providers/DocContext.js';
import { useNodeTree } from '../hooks/useNodeTree.js';

function Row({ node, tree }: { node: NodeView; tree: TreeResult }) {
  const doc = useDoc();
  const children = tree.childrenByParent.get(node.id) ?? [];
  const isChapter = node.nodeType === 'chapter';
  const hasChildren = children.length > 0;

  return (
    <li>
      <div className="gv-row" style={{ paddingLeft: node.level * 16 }}>
        {isChapter ? (
          <button
            className="gv-twisty"
            aria-label={node.isCollapsed ? 'Expand' : 'Collapse'}
            onClick={() => setCollapsed(doc, node.id, !node.isCollapsed)}
            disabled={!hasChildren}
          >
            {hasChildren ? (node.isCollapsed ? '▸' : '▾') : '·'}
          </button>
        ) : (
          <span className="gv-twisty gv-media-dot">◆</span>
        )}
        <span className="gv-name">{node.name || (isChapter ? 'Untitled chapter' : 'Note')}</span>
        <span className="gv-actions">
          {isChapter && (
            <>
              <button onClick={() => insertNode(doc, { parentId: node.id, nodeType: 'chapter', name: 'New chapter' })}>+Ch</button>
              <button onClick={() => insertNode(doc, { parentId: node.id, nodeType: 'media', name: 'New note' })}>+Note</button>
            </>
          )}
          <button onClick={() => duplicateSubtree(doc, node.id)}>Dup</button>
          <button onClick={() => removeToTrash(doc, node.id, Date.now())}>Del</button>
        </span>
      </div>
      {isChapter && !node.isCollapsed && hasChildren && (
        <ul className="gv-children">
          {children.map((c) => (
            <Row key={c.id} node={c} tree={tree} />
          ))}
        </ul>
      )}
    </li>
  );
}

export function TreeView() {
  const doc = useDoc();
  const tree = useNodeTree();
  return (
    <Fragment>
      <div className="gv-toolbar">
        <button onClick={() => insertNode(doc, { nodeType: 'chapter', name: 'New chapter' })}>
          + Chapter
        </button>
      </div>
      <ul className="gv-tree">
        {tree.roots.map((r: NodeView) => (
          <Row key={r.id} node={r} tree={tree} />
        ))}
      </ul>
      {tree.recovered.length > 0 && (
        <p className="gv-recovered">⚠ {tree.recovered.length} recovered node(s)</p>
      )}
    </Fragment>
  );
}

export type { NodeId };
