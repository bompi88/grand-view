import type * as Y from 'yjs';
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

/** Detect which shell the same web app is running inside. */
function detectPlatform(): PlatformAdapter['platform'] {
  const w = globalThis as unknown as {
    __TAURI_INTERNALS__?: unknown;
    Capacitor?: { isNativePlatform?: () => boolean };
  };
  if (w.__TAURI_INTERNALS__) return 'tauri';
  if (w.Capacitor?.isNativePlatform?.()) return 'capacitor';
  return 'web';
}

/**
 * Phase 0 bootstrap: one local-first document persisted to IndexedDB, shared by
 * the web, Tauri (desktop) and Capacitor (mobile) shells. Phase 1 swaps the
 * fixed id for a library/router; Phase 2 swaps in native adapters + sync providers.
 */
export async function bootstrap(): Promise<BootContext> {
  const adapter = createWebAdapter(detectPlatform());
  const documentId = 'demo' as DocumentId;
  const { doc } = createDocument({ id: documentId, title: 'Demo', createdAt: Date.now() });

  const provider = new LocalIndexeddbProvider();
  await provider.connect(doc, `gv-doc-${documentId}`);

  return { adapter, provider, doc, documentId };
}
