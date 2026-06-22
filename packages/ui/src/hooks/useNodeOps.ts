import { useMemo } from 'react';
import {
  duplicateSubtree,
  emptyTrash,
  insertNode,
  moveNode,
  removeToTrash,
  renameNode,
  restoreFromTrash,
  setCollapsed,
  setNodeLabels,
  type Anchor,
  type InsertNodeOptions,
} from '@gv/core';
import type { Label, NodeId } from '@gv/shared';
import { useDoc } from '../providers/DocContext.js';
import { useUndo } from '../providers/UndoContext.js';

/**
 * Document mutations bound to the local user's undo controller, so every edit
 * is captured on the per-user undo stack (and tagged with the local origin).
 */
export function useNodeOps() {
  const doc = useDoc();
  const { controller } = useUndo();

  return useMemo(() => {
    const tx = controller.transact;
    return {
      insert: (opts: InsertNodeOptions): NodeId => {
        let id!: NodeId;
        tx(() => {
          id = insertNode(doc, opts);
        });
        return id;
      },
      move: (id: NodeId, parentId: NodeId, anchor?: Anchor) => {
        let ok = false;
        tx(() => {
          ok = moveNode(doc, id, { parentId, anchor });
        });
        return ok;
      },
      duplicate: (id: NodeId) => tx(() => duplicateSubtree(doc, id)),
      remove: (id: NodeId) => tx(() => removeToTrash(doc, id, Date.now())),
      restore: (id: NodeId) => tx(() => restoreFromTrash(doc, id)),
      emptyTrash: () => tx(() => emptyTrash(doc)),
      rename: (id: NodeId, name: string) => tx(() => renameNode(doc, id, name)),
      setCollapsed: (id: NodeId, collapsed: boolean) =>
        tx(() => setCollapsed(doc, id, collapsed)),
      setLabels: (id: NodeId, kind: 'tags' | 'references', labels: Label[]) =>
        tx(() => setNodeLabels(doc, id, kind, labels)),
    };
  }, [doc, controller]);
}

export type NodeOps = ReturnType<typeof useNodeOps>;
