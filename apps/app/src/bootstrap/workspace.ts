import {
  addDocumentEntry,
  copyDocumentContent,
  createDocument,
  createLibrary,
  LIBRARY_GUID,
} from '@gv/core';
import { LocalIndexeddbProvider, P2pProvider, type SyncProvider } from '@gv/sync-providers';
import type { Workspace, OpenedDoc } from '@gv/ui';
import { newDeviceId, type DocumentId, type PresenceUser } from '@gv/shared';

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
  live: P2pProvider;
}

/**
 * Local-first workspace: every document persists to IndexedDB (base layer) and
 * is layered with a live P2P provider for real-time collaboration + presence.
 */
export async function createLocalWorkspace(): Promise<Workspace> {
  const user = localUser();
  const library = createLibrary();
  const libProvider = new LocalIndexeddbProvider();
  await libProvider.connect(library, LIBRARY_GUID);

  const opened = new Map<DocumentId, Internal>();

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
      const existing = opened.get(id);
      const room = `gv-doc-${id}`;
      if (!existing) {
        const { doc } = createDocument({ id, createdAt: Date.now() });
        const persistence = new LocalIndexeddbProvider();
        await persistence.connect(doc, room);
        const live = new P2pProvider({ signaling: SIGNALING, user });
        await live.connect(doc, room);
        opened.set(id, { doc, persistence, live });
      }
      const rec = opened.get(id)!;
      return {
        doc: rec.doc,
        provider: rec.live,
        awareness: rec.live.awareness,
        user,
        setUser: (u) => rec.live.setUser(u),
      };
    },
    async close(id) {
      const rec = opened.get(id);
      if (!rec) return;
      opened.delete(id);
      await rec.live.disconnect();
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
  };
}
