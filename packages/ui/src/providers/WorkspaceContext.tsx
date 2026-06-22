import { createContext, useContext, type ReactNode } from 'react';
import type * as Y from 'yjs';
import type { DocumentId } from '@gv/shared';
import type { SyncProvider } from '@gv/sync-providers';

export interface OpenedDoc {
  doc: Y.Doc;
  provider: SyncProvider;
}

/**
 * The Workspace owns document lifecycle and is constructed by the app (the
 * composition root), which decides the concrete persistence/sync providers.
 * The UI consumes this interface without knowing which provider it got.
 */
export interface Workspace {
  /** The library Y.Doc (document/template list + trash). */
  library: Y.Doc;
  /** Open (and start syncing) a document's content. Idempotent per id. */
  open(id: DocumentId): Promise<OpenedDoc>;
  /** Stop syncing and release a document. */
  close(id: DocumentId): Promise<void>;
  /** Permanently drop a document's persisted content + attachments. */
  destroyContent(id: DocumentId): Promise<void>;
}

const WorkspaceContext = createContext<Workspace | null>(null);

export function WorkspaceProvider({
  workspace,
  children,
}: {
  workspace: Workspace;
  children: ReactNode;
}) {
  return <WorkspaceContext.Provider value={workspace}>{children}</WorkspaceContext.Provider>;
}

export function useWorkspace(): Workspace {
  const ctx = useContext(WorkspaceContext);
  if (!ctx) throw new Error('useWorkspace must be used within a <WorkspaceProvider>');
  return ctx;
}
