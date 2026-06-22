import { create } from 'zustand';
import type { NodeId } from '@gv/shared';

interface SelectionState {
  selectedId: NodeId | null;
  showTrash: boolean;
  select: (id: NodeId | null) => void;
  setShowTrash: (show: boolean) => void;
}

/** Ephemeral UI state (not part of the collaborative document). */
export const useSelection = create<SelectionState>((set) => ({
  selectedId: null,
  showTrash: false,
  select: (selectedId) => set({ selectedId, showTrash: false }),
  setShowTrash: (showTrash) => set({ showTrash }),
}));
