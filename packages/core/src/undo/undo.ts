import * as Y from 'yjs';
import { NODES, TRASH } from '../doc/schema.js';

/** Transaction origin tag identifying edits made by the local user. */
export const LOCAL_ORIGIN = Symbol('gv-local-user');

export interface UndoController {
  manager: Y.UndoManager;
  undo(): void;
  redo(): void;
  canUndo(): boolean;
  canRedo(): boolean;
  /** Run a mutation so it is captured by this user's undo stack. */
  transact(fn: () => void): void;
  destroy(): void;
}

/**
 * Per-document, per-user undo. Scoped to the local origin so Ctrl/Cmd-Z only
 * reverts THIS user's changes (never a collaborator's), and grouped by a short
 * timeout so undo works at word/operation granularity rather than per-character
 * (the inverse of the legacy global redux-undo behaviour — fixes #74).
 */
export function createUndoController(doc: Y.Doc, captureTimeout = 500): UndoController {
  const manager = new Y.UndoManager([doc.getMap(NODES), doc.getMap(TRASH)], {
    trackedOrigins: new Set([LOCAL_ORIGIN]),
    captureTimeout,
  });

  return {
    manager,
    undo: () => manager.undo(),
    redo: () => manager.redo(),
    canUndo: () => manager.canUndo(),
    canRedo: () => manager.canRedo(),
    transact: (fn) => doc.transact(fn, LOCAL_ORIGIN),
    destroy: () => manager.destroy(),
  };
}
