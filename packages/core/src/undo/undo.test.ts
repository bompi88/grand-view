import { describe, expect, it } from 'vitest';
import { ROOT_PARENT } from '@gv/shared';
import { createDocument } from '../doc/create.js';
import { insertNode } from '../nodes/operations.js';
import { getChildren } from '../nodes/selectors.js';
import { createUndoController } from './undo.js';

describe('createUndoController', () => {
  it('undoes and redoes a local insert', () => {
    const { doc } = createDocument({ createdAt: 0 });
    const undo = createUndoController(doc);

    undo.transact(() => insertNode(doc, { nodeType: 'chapter', name: 'A' }));
    expect(getChildren(doc, ROOT_PARENT)).toHaveLength(1);
    expect(undo.canUndo()).toBe(true);

    undo.undo();
    expect(getChildren(doc, ROOT_PARENT)).toHaveLength(0);

    undo.redo();
    expect(getChildren(doc, ROOT_PARENT)).toHaveLength(1);
    undo.destroy();
  });

  it('does not undo edits made by other users (origin-scoped — fixes #74 semantics)', () => {
    const { doc } = createDocument({ createdAt: 0 });
    const undo = createUndoController(doc);

    // A collaborator's change arrives via a non-local origin.
    insertNode(doc, { nodeType: 'chapter', name: 'remote' });
    expect(undo.canUndo()).toBe(false);

    // The local user makes their own change.
    undo.transact(() => insertNode(doc, { nodeType: 'chapter', name: 'mine' }));
    expect(undo.canUndo()).toBe(true);

    undo.undo();
    // Only the local node is reverted; the collaborator's remains.
    expect(getChildren(doc, ROOT_PARENT).map((n) => n.name)).toEqual(['remote']);
    undo.destroy();
  });
});
