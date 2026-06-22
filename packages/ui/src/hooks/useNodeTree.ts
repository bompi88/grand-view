import { useMemo } from 'react';
import { buildTree, type TreeResult } from '@gv/core';
import { useDoc } from '../providers/DocContext.js';
import { useDocVersion } from './useDocVersion.js';

/** Reactively-derived, sorted, integrity-guarded tree for the active document. */
export function useNodeTree(): TreeResult {
  const doc = useDoc();
  const version = useDocVersion(doc);
  return useMemo(() => buildTree(doc), [doc, version]);
}
