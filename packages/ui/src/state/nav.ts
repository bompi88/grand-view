import { create } from 'zustand';
import type { DocumentId } from '@gv/shared';

const KEY = 'gv-open-doc';

function load(): DocumentId | null {
  try {
    return (sessionStorage.getItem(KEY) as DocumentId | null) ?? null;
  } catch {
    return null;
  }
}

function save(id: DocumentId | null): void {
  try {
    if (id) sessionStorage.setItem(KEY, id);
    else sessionStorage.removeItem(KEY);
  } catch {
    /* ignore */
  }
}

interface NavState {
  openDocId: DocumentId | null;
  openDoc: (id: DocumentId) => void;
  goLibrary: () => void;
}

/**
 * Top-level navigation: the library screen vs. an open document. The current
 * document is remembered per tab (sessionStorage) so a reload returns you to
 * where you were rather than the library.
 */
export const useNav = create<NavState>((set) => ({
  openDocId: load(),
  openDoc: (id) => {
    save(id);
    set({ openDocId: id });
  },
  goLibrary: () => {
    save(null);
    set({ openDocId: null });
  },
}));
