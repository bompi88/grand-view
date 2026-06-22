import * as Y from 'yjs';
import { ROOT_PARENT, newNodeId, type NodeId } from '@gv/shared';
import { nodesMap } from '../doc/schema.js';
import { cloneNodeWith } from '../nodes/clone.js';

/**
 * Copy all node content from one document Y.Doc into another, with a fresh id
 * for every node (old->new remap, like the legacy idHashMap). Used for
 * make-template-from-document and create-document-from-template. The target
 * gets an independent CRDT history (it is a fork, not a re-join).
 */
export function copyDocumentContent(source: Y.Doc, target: Y.Doc): void {
  const srcNodes = nodesMap(source);
  const idMap = new Map<NodeId, NodeId>();
  for (const id of srcNodes.keys()) idMap.set(id as NodeId, newNodeId());

  target.transact(() => {
    const tNodes = nodesMap(target);
    for (const [oldId, node] of srcNodes.entries()) {
      const newId = idMap.get(oldId as NodeId)!;
      const oldParent = node.get('parentId') as NodeId;
      const newParent =
        oldParent === ROOT_PARENT ? ROOT_PARENT : (idMap.get(oldParent) ?? ROOT_PARENT);
      tNodes.set(newId, cloneNodeWith(node, { id: newId, parentId: newParent }));
    }
  });
}
