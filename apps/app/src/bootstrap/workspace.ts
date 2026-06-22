import * as Y from 'yjs';
import {
  addDocumentEntry,
  copyDocumentContent,
  createDocument,
  createLibrary,
  documentFiles,
  documentFromSnapshot,
  exportArchive,
  getDocumentMeta,
  importLegacyTar,
  metaMap,
  parseArchive,
  LIBRARY_GUID,
} from '@gv/core';
import {
  LocalIndexeddbProvider,
  P2pProvider,
  RelayProvider,
  type SyncProvider,
} from '@gv/sync-providers';
import type { BlobStoreAdapter } from '@gv/platform-adapters';
import type { Workspace, OpenedDoc, SyncMode } from '@gv/ui';
import { newDeviceId, newDocumentId, type DocumentId, type PresenceUser } from '@gv/shared';

const sleep = (ms: number) => new Promise<void>((r) => setTimeout(r, ms));

/**
 * Signaling servers for cross-device WebRTC. Empty by default → same-origin
 * tabs collaborate over BroadcastChannel with zero infrastructure. Set
 * VITE_GV_SIGNALING (comma-separated) to a self-hosted signaling URL to enable
 * cross-device, zero-cost collaboration.
 */
const SIGNALING = String(import.meta.env.VITE_GV_SIGNALING ?? '')
  .split(',')
  .map((s: string) => s.trim())
  .filter(Boolean);

/** Self-hosted relay URL (enables 'relay' sync mode), e.g. wss://gv-relay.fly.dev */
const RELAY_URL = String(import.meta.env.VITE_GV_RELAY ?? '').trim();

function syncModeKey(id: DocumentId): string {
  return `gv-sync-mode:${id}`;
}

const NAMES = ['Otter', 'Falcon', 'Birch', 'Cedar', 'Heron', 'Lynx', 'Fjord', 'Aurora'];
const COLORS = ['#3b5bdb', '#2f9e44', '#e8590c', '#9c36b5', '#0c8599', '#c2255c'];

/**
 * Presence identity: a stable name/color per browser (persisted), but a fresh
 * deviceId each session so two tabs/windows appear as two collaborators.
 */
function localUser(): PresenceUser {
  const KEY = 'gv-identity';
  const pick = <T,>(a: T[]) => a[Math.floor(Math.random() * a.length)]!;
  let name = pick(NAMES);
  let color = pick(COLORS);
  try {
    const saved = localStorage.getItem(KEY);
    if (saved) {
      const parsed = JSON.parse(saved) as { name: string; color: string };
      name = parsed.name;
      color = parsed.color;
    } else {
      localStorage.setItem(KEY, JSON.stringify({ name, color }));
    }
  } catch {
    /* ignore */
  }
  return { name, color, deviceId: newDeviceId() };
}

interface Internal {
  doc: import('yjs').Doc;
  persistence: SyncProvider;
  /** The live provider (absent in local-only mode). */
  live?: SyncProvider & { setUser?: (u: PresenceUser) => void };
}

/**
 * Local-first workspace: every document persists to IndexedDB (base layer) and
 * is layered with a live P2P provider for real-time collaboration + presence.
 */
export async function createLocalWorkspace(blobStore: BlobStoreAdapter): Promise<Workspace> {
  const user = localUser();
  const library = createLibrary();
  const libProvider = new LocalIndexeddbProvider();
  await libProvider.connect(library, LIBRARY_GUID);

  const opened = new Map<DocumentId, Internal>();

  function getMode(id: DocumentId): SyncMode {
    try {
      const v = localStorage.getItem(syncModeKey(id)) as SyncMode | null;
      if (v === 'local' || v === 'p2p' || v === 'relay') return v;
    } catch {
      /* ignore */
    }
    return 'p2p';
  }

  /** Load a document's content with its own provider, not tracked in `opened`. */
  async function loadDetached(id: DocumentId): Promise<{ doc: import('yjs').Doc; dispose: () => Promise<void> }> {
    const { doc } = createDocument({ id, createdAt: Date.now() });
    const provider = new LocalIndexeddbProvider();
    await provider.connect(doc, `gv-doc-${id}`);
    return {
      doc,
      dispose: async () => {
        await provider.disconnect();
        doc.destroy();
      },
    };
  }

  /** Persist a freshly-built document (with content) under its id. */
  async function persistBuilt(newId: DocumentId, built: Y.Doc): Promise<void> {
    const update = Y.encodeStateAsUpdate(built);
    built.destroy();
    const { doc } = createDocument({ id: newId, createdAt: Date.now() });
    const provider = new LocalIndexeddbProvider();
    await provider.connect(doc, `gv-doc-${newId}`);
    Y.applyUpdate(doc, update); // fires updates → persisted by the provider
    await sleep(700);
    await provider.disconnect();
    doc.destroy();
  }

  /** Copy source content into a freshly-registered library entry. */
  async function fork(sourceId: DocumentId, title: string, isTemplate: boolean): Promise<DocumentId> {
    const targetId = addDocumentEntry(library, { title, isTemplate, createdAt: Date.now() });
    const src = await loadDetached(sourceId);
    const tgt = await loadDetached(targetId);
    copyDocumentContent(src.doc, tgt.doc);
    await sleep(700); // let IndexedDB persist the copied content
    await src.dispose();
    await tgt.dispose();
    return targetId;
  }

  return {
    library,
    async open(id): Promise<OpenedDoc> {
      const room = `gv-doc-${id}`;
      if (!opened.get(id)) {
        const { doc } = createDocument({ id, createdAt: Date.now() });
        const persistence = new LocalIndexeddbProvider();
        await persistence.connect(doc, room);

        const mode = getMode(id);
        let live: Internal['live'];
        if (mode === 'relay' && RELAY_URL) {
          live = new RelayProvider({ url: RELAY_URL, user });
        } else if (mode !== 'local') {
          live = new P2pProvider({ signaling: SIGNALING, user });
        }
        if (live) await live.connect(doc, room);
        opened.set(id, { doc, persistence, live });
      }
      const rec = opened.get(id)!;
      const active = rec.live ?? rec.persistence;
      return {
        doc: rec.doc,
        provider: active,
        awareness: rec.live?.awareness,
        user,
        setUser: (u) => rec.live?.setUser?.(u),
      };
    },
    async close(id) {
      const rec = opened.get(id);
      if (!rec) return;
      opened.delete(id);
      await rec.live?.disconnect();
      await rec.persistence.disconnect();
      rec.doc.destroy();
    },
    async destroyContent(id) {
      await new Promise<void>((resolve) => {
        const req = indexedDB.deleteDatabase(`gv-doc-${id}`);
        req.onsuccess = req.onerror = req.onblocked = () => resolve();
      });
    },
    makeTemplate(sourceId, title) {
      return fork(sourceId, title, true);
    },
    instantiateTemplate(templateId, title) {
      return fork(templateId, title, false);
    },
    async exportArchive(id) {
      const meta = getDocumentMeta(library, id);
      const src = await loadDetached(id);
      const blobs = new Map<string, Uint8Array>();
      for (const f of documentFiles(src.doc)) {
        try {
          blobs.set(f.blobRef, await blobStore.get(f.blobRef));
        } catch {
          /* skip missing blob */
        }
      }
      const isTemplate = Boolean(meta?.isTemplate);
      const bytes = exportArchive(src.doc, blobs, { isTemplate, title: meta?.title ?? '' });
      await src.dispose();
      const ext = isTemplate ? 'gvt' : 'gvd';
      return { bytes, filename: `${meta?.title || 'document'}.${ext}` };
    },
    async importArchive(bytes) {
      const parsed = parseArchive(bytes);
      const newId = newDocumentId();
      const now = Date.now();
      addDocumentEntry(library, {
        id: newId,
        title: parsed.manifest.title || 'Imported document',
        isTemplate: parsed.manifest.isTemplate,
        createdAt: now,
      });
      const built = documentFromSnapshot(parsed.snapshot, newId, now);
      await persistBuilt(newId, built);
      for (const [ref, blob] of parsed.blobs) {
        await blobStore.putAt(ref, blob, parsed.manifest.blobs[ref] ?? 'application/octet-stream');
      }
      return newId;
    },
    async importLegacy(bytes) {
      const newId = newDocumentId();
      const now = Date.now();
      const built = importLegacyTar(bytes, newId, now);
      const title = String(metaMap(built).get('title') ?? 'Imported document');
      const isTemplate = Boolean(metaMap(built).get('isTemplate'));
      addDocumentEntry(library, { id: newId, title, isTemplate, createdAt: now });
      await persistBuilt(newId, built);
      return newId;
    },
    getSyncMode: getMode,
    setSyncMode(id, mode) {
      try {
        localStorage.setItem(syncModeKey(id), mode);
      } catch {
        /* ignore */
      }
    },
    relayConfigured: RELAY_URL.length > 0,
  };
}
