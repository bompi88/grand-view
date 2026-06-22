import { useMemo } from 'react';
import { nodesMap, toNodeView } from '@gv/core';
import type { NodeId, NodeView } from '@gv/shared';
import { useDoc } from '../providers/DocContext.js';
import { useDocVersion } from './useDocVersion.js';

/** Reactive plain view of a single live node (null if it doesn't exist). */
export function useNodeView(id: NodeId | null): NodeView | null {
  const doc = useDoc();
  const version = useDocVersion(doc);
  return useMemo(() => {
    if (!id) return null;
    const node = nodesMap(doc).get(id);
    return node ? toNodeView(node) : null;
  }, [doc, id, version]);
}
