import { createDocument, createLibrary, LIBRARY_GUID } from '@gv/core';
import { LocalIndexeddbProvider } from '@gv/sync-providers';
import type { Workspace, OpenedDoc } from '@gv/ui';
import type { DocumentId } from '@gv/shared';

/**
 * Local-first workspace: the library and every document persist to IndexedDB.
 * Phase 2 will let `open` layer a live sync provider (P2P / relay / file-sync)
 * on top of the local persistence base.
 */
export async function createLocalWorkspace(): Promise<Workspace> {
  const library = createLibrary();
  const libProvider = new LocalIndexeddbProvider();
  await libProvider.connect(library, LIBRARY_GUID);

  const opened = new Map<DocumentId, OpenedDoc>();

  return {
    library,
    async open(id) {
      const existing = opened.get(id);
      if (existing) return existing;
      const { doc } = createDocument({ id, createdAt: Date.now() });
      const provider = new LocalIndexeddbProvider();
      await provider.connect(doc, `gv-doc-${id}`);
      const rec: OpenedDoc = { doc, provider };
      opened.set(id, rec);
      return rec;
    },
    async close(id) {
      const rec = opened.get(id);
      if (!rec) return;
      opened.delete(id);
      await rec.provider.disconnect();
      rec.doc.destroy();
    },
    async destroyContent(id) {
      await new Promise<void>((resolve) => {
        const req = indexedDB.deleteDatabase(`gv-doc-${id}`);
        req.onsuccess = req.onerror = req.onblocked = () => resolve();
      });
    },
  };
}
