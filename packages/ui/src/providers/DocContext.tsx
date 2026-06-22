import { createContext, useContext, type ReactNode } from 'react';
import type * as Y from 'yjs';

const DocContext = createContext<Y.Doc | null>(null);

/** Provides the currently-open Grand View Y.Doc to the component tree. */
export function DocProvider({ doc, children }: { doc: Y.Doc; children: ReactNode }) {
  return <DocContext.Provider value={doc}>{children}</DocContext.Provider>;
}

export function useDoc(): Y.Doc {
  const ctx = useContext(DocContext);
  if (!ctx) throw new Error('useDoc must be used within a <DocProvider>');
  return ctx;
}
