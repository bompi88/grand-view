import { useEditor, EditorContent, type Extensions } from '@tiptap/react';
import StarterKit from '@tiptap/starter-kit';
import Collaboration from '@tiptap/extension-collaboration';
import CollaborationCursor from '@tiptap/extension-collaboration-cursor';
import type * as Y from 'yjs';
import { useLive } from '../../providers/LiveContext.js';

/**
 * Collaborative rich-text editor bound to a node's Y.XmlFragment via
 * y-prosemirror (TipTap's Collaboration extension). StarterKit's own history is
 * disabled — undo/redo is owned by the document's Yjs UndoManager. When a live
 * provider is attached, remote collaborators' carets/selections are shown.
 *
 * Keyed by node id at the call site so a fresh editor mounts per node; only the
 * selected node mounts an editor.
 */
export function TipTapEditor({ fragment }: { fragment: Y.XmlFragment }) {
  const { awareness, user } = useLive();

  const extensions: Extensions = [
    StarterKit.configure({ history: false }),
    Collaboration.configure({ fragment }),
  ];
  if (awareness && user) {
    extensions.push(
      CollaborationCursor.configure({
        provider: { awareness } as never,
        user: { name: user.name, color: user.color },
      }),
    );
  }

  const editor = useEditor(
    {
      extensions,
      editorProps: { attributes: { class: 'gv-prose', 'data-testid': 'node-editor' } },
    },
    [fragment, awareness],
  );

  return <EditorContent editor={editor} />;
}
