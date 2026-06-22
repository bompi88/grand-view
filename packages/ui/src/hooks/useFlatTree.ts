import { useMemo } from 'react';
import { ROOT_PARENT, type NodeId, type NodeView } from '@gv/shared';
import { useNodeTree } from './useNodeTree.js';

export interface FlatRow {
  node: NodeView;
  depth: number;
  hasChildren: boolean;
}

/**
 * Flatten the tree into the list of currently-visible rows (respecting
 * collapsed chapters), in render order. This is the list dnd-kit sorts over.
 */
export function useFlatTree(): { rows: FlatRow[]; recovered: NodeView[] } {
  const tree = useNodeTree();
  return useMemo(() => {
    const rows: FlatRow[] = [];
    const walk = (parentId: NodeId, depth: number) => {
      for (const node of tree.childrenByParent.get(parentId) ?? []) {
        const children = tree.childrenByParent.get(node.id) ?? [];
        rows.push({ node, depth, hasChildren: children.length > 0 });
        if (node.nodeType === 'chapter' && !node.isCollapsed && children.length > 0) {
          walk(node.id, depth + 1);
        }
      }
    };
    walk(ROOT_PARENT, 0);
    return { rows, recovered: tree.recovered };
  }, [tree]);
}
