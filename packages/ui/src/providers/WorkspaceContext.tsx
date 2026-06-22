import { createContext, useContext, type ReactNode } from 'react';
import type * as Y from 'yjs';
import type { DocumentId, PresenceUser } from '@gv/shared';
import type { Awareness, SyncProvider } from '@gv/sync-providers';

/** Per-document live sync transport. */
export type SyncMode = 'local' | 'p2p' | 'relay';

export interface OpenedDoc {
  doc: Y.Doc;
  /** The live provider whose kind is surfaced in the UI. */
  provider: SyncProvider;
  /** Presence/awareness, when a live provider is attached. */
  awareness?: Awareness;
  /** This client's presence identity. */
  user?: PresenceUser;
  /** Update this client's presence identity. */
  setUser?: (user: PresenceUser) => void;
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
  /** Create a template from an existing document. Returns the new template's id. */
  makeTemplate(sourceId: DocumentId, title: string): Promise<DocumentId>;
  /** Create a new document from a template. Returns the new document's id. */
  instantiateTemplate(templateId: DocumentId, title: string): Promise<DocumentId>;
  /** This device's chosen sync mode for a document (default 'p2p'). */
  getSyncMode(id: DocumentId): SyncMode;
  /** Set this device's sync mode for a document (applied on next open). */
  setSyncMode(id: DocumentId, mode: SyncMode): void;
  /** Whether a relay URL is configured (enables the 'relay' mode). */
  readonly relayConfigured: boolean;
  /** Pack a document into a `.gvd`/`.gvt` archive (bytes + suggested filename). */
  exportArchive(id: DocumentId): Promise<{ bytes: Uint8Array; filename: string }>;
  /** Import a GrandView `.gvd`/`.gvt` archive. Returns the new document id. */
  importArchive(bytes: Uint8Array): Promise<DocumentId>;
  /** Import a legacy (tar) `.gvd`/`.gvt`. Returns the new document id. */
  importLegacy(bytes: Uint8Array): Promise<DocumentId>;
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
