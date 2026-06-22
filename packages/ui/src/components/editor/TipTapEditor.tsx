import { useEditor, EditorContent } from '@tiptap/react';
import StarterKit from '@tiptap/starter-kit';
import Collaboration from '@tiptap/extension-collaboration';
import type * as Y from 'yjs';

/**
 * Collaborative rich-text editor bound to a node's Y.XmlFragment via
 * y-prosemirror (through TipTap's Collaboration extension). StarterKit's own
 * history is disabled — undo/redo is owned by the document's Yjs UndoManager.
 *
 * Keyed by node id at the call site so a fresh editor mounts per node; only the
 * selected node mounts an editor (collapsed/unselected bodies stay unmounted).
 */
export function TipTapEditor({ fragment }: { fragment: Y.XmlFragment }) {
  const editor = useEditor(
    {
      extensions: [StarterKit.configure({ history: false }), Collaboration.configure({ fragment })],
      editorProps: { attributes: { class: 'gv-prose', 'data-testid': 'node-editor' } },
    },
    [fragment],
  );

  return <EditorContent editor={editor} />;
}
