import { create } from 'zustand';
import type { DocumentId } from '@gv/shared';

interface NavState {
  openDocId: DocumentId | null;
  openDoc: (id: DocumentId) => void;
  goLibrary: () => void;
}

/** Top-level navigation: the library screen vs. an open document. */
export const useNav = create<NavState>((set) => ({
  openDocId: null,
  openDoc: (id) => set({ openDocId: id }),
  goLibrary: () => set({ openDocId: null }),
}));
