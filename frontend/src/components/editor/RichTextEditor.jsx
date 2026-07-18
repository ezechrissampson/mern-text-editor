import React, { useEffect, useMemo } from 'react';
import { useEditor, EditorContent } from '@tiptap/react';
import { buildExtensions } from './extensions';
import Toolbar from './toolbar/Toolbar';
import { computeReadingStats } from '../../utils/textStats';

/**
 * Reusable rich text editor component - the primary export of this
 * module's frontend. Fully controlled: host page owns the HTML value
 * and receives onChange(html, json, stats).
 *
 * Props:
 *  - content: initial HTML string
 *  - onChange(html, json, stats): fired on every edit (debounce upstream if needed)
 *  - onRequestMedia(): optional, opens host app's Media Library, resolves to a URL string
 *  - editable: boolean, default true
 *  - placeholder: string
 */
export default function RichTextEditor({
  content = '',
  onChange,
  onRequestMedia,
  editable = true,
  placeholder,
}) {
  const extensions = useMemo(() => buildExtensions({ placeholder }), [placeholder]);

  const editor = useEditor({
    extensions,
    content,
    editable,
    onUpdate: ({ editor: ed }) => {
      const html = ed.getHTML();
      const json = ed.getJSON();
      onChange?.(html, json, computeReadingStats(ed.getText()));
    },
  });

  useEffect(() => {
    if (editor && content !== editor.getHTML()) {
      editor.commands.setContent(content || '', false);
    }
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [editor]);

  if (!editor) return null;

  return (
    <div className="editor-card">
      <Toolbar editor={editor} onRequestMedia={onRequestMedia} />
      <EditorContent editor={editor} />
      <div className="d-flex justify-content-between px-3 py-2 border-top small text-secondary">
        <span>{editor.storage.characterCount.words()} words</span>
        <span>{editor.storage.characterCount.characters()} characters</span>
      </div>
    </div>
  );
}
