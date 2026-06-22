import * as Y from 'yjs';
import { createDocument } from '@gv/core';
import { createWebAdapter } from '@gv/adapter-web';
import { LocalIndexeddbProvider, type SyncProvider } from '@gv/sync-providers';
import type { PlatformAdapter } from '@gv/platform-adapters';
import type { DocumentId } from '@gv/shared';

export interface BootContext {
  adapter: PlatformAdapter;
  provider: SyncProvider;
  doc: Y.Doc;
  documentId: DocumentId;
}

/**
 * Phase 0 bootstrap for the browser target: a single local-first document
 * persisted to IndexedDB. Phase 1 replaces the fixed id with a library/router,
 * and Phase 2 swaps in the chosen sync provider per document.
 */
export async function wireWeb(): Promise<BootContext> {
  const adapter = createWebAdapter();
  const documentId = 'demo' as DocumentId;
  const { doc } = createDocument({ id: documentId, title: 'Demo', createdAt: Date.now() });

  const provider = new LocalIndexeddbProvider();
  await provider.connect(doc, `gv-doc-${documentId}`);

  return { adapter, provider, doc, documentId };
}
