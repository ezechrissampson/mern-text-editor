import React, { useState } from 'react';
import {
  BsTypeBold, BsTypeItalic, BsTypeUnderline, BsTypeStrikethrough,
  BsCodeSlash, BsBlockquoteLeft, BsListUl, BsListOl, BsListCheck,
  BsLink45Deg, BsImage, BsTable, BsTextLeft, BsTextCenter, BsTextRight,
  BsJustify, BsArrowCounterclockwise, BsArrowClockwise, BsHr,
  BsChevronDown, BsCameraVideo,
} from 'react-icons/bs';
import ImagePickerModal from '../modals/ImagePickerModal';
import EmbedModal from '../modals/EmbedModal';
import LinkModal from '../modals/LinkModal';

/**
 * Floating/sticky formatting toolbar. Context-aware: each button
 * reflects `editor.isActive(...)` state. `onRequestMedia` is provided
 * by the host app to open ITS existing Media Library picker; if
 * omitted, a plain URL-entry fallback is used.
 */
export default function Toolbar({ editor, onRequestMedia }) {
  const [showImageModal, setShowImageModal] = useState(false);
  const [showEmbedModal, setShowEmbedModal] = useState(false);
  const [showLinkModal, setShowLinkModal] = useState(false);

  if (!editor) return null;

  const Btn = ({ active, onClick, title, children, disabled }) => (
    <button
      type="button"
      className={`btn btn-sm ${active ? 'btn-editor-primary' : 'btn-outline-secondary'} border-0 me-1`}
      onClick={onClick}
      title={title}
      disabled={disabled}
      aria-pressed={active}
    >
      {children}
    </button>
  );

  return (
    <div className="editor-card border-bottom rounded-bottom-0 p-2 d-flex flex-wrap align-items-center gap-1 sticky-top">
      <div className="dropdown me-1">
        <button className="btn btn-sm btn-outline-secondary dropdown-toggle" data-bs-toggle="dropdown" title="Heading">
          {editor.isActive('heading') ? `H${editor.getAttributes('heading').level}` : 'Paragraph'} <BsChevronDown />
        </button>
        <ul className="dropdown-menu">
          <li><button className="dropdown-item" onClick={() => editor.chain().focus().setParagraph().run()}>Paragraph</button></li>
          {[1, 2, 3, 4, 5, 6].map((lvl) => (
            <li key={lvl}>
              <button className="dropdown-item" onClick={() => editor.chain().focus().toggleHeading({ level: lvl }).run()}>
                Heading {lvl}
              </button>
            </li>
          ))}
        </ul>
      </div>

      <div className="vr mx-1" />

      <Btn active={editor.isActive('bold')} onClick={() => editor.chain().focus().toggleBold().run()} title="Bold (Ctrl+B)"><BsTypeBold /></Btn>
      <Btn active={editor.isActive('italic')} onClick={() => editor.chain().focus().toggleItalic().run()} title="Italic (Ctrl+I)"><BsTypeItalic /></Btn>
      <Btn active={editor.isActive('underline')} onClick={() => editor.chain().focus().toggleUnderline().run()} title="Underline (Ctrl+U)"><BsTypeUnderline /></Btn>
      <Btn active={editor.isActive('strike')} onClick={() => editor.chain().focus().toggleStrike().run()} title="Strikethrough"><BsTypeStrikethrough /></Btn>
      <Btn active={editor.isActive('code')} onClick={() => editor.chain().focus().toggleCode().run()} title="Inline code"><BsCodeSlash /></Btn>

      <div className="vr mx-1" />

      <Btn active={editor.isActive({ textAlign: 'left' })} onClick={() => editor.chain().focus().setTextAlign('left').run()} title="Align left"><BsTextLeft /></Btn>
      <Btn active={editor.isActive({ textAlign: 'center' })} onClick={() => editor.chain().focus().setTextAlign('center').run()} title="Align center"><BsTextCenter /></Btn>
      <Btn active={editor.isActive({ textAlign: 'right' })} onClick={() => editor.chain().focus().setTextAlign('right').run()} title="Align right"><BsTextRight /></Btn>
      <Btn active={editor.isActive({ textAlign: 'justify' })} onClick={() => editor.chain().focus().setTextAlign('justify').run()} title="Justify"><BsJustify /></Btn>

      <div className="vr mx-1" />

      <Btn active={editor.isActive('bulletList')} onClick={() => editor.chain().focus().toggleBulletList().run()} title="Bulleted list"><BsListUl /></Btn>
      <Btn active={editor.isActive('orderedList')} onClick={() => editor.chain().focus().toggleOrderedList().run()} title="Numbered list"><BsListOl /></Btn>
      <Btn active={editor.isActive('taskList')} onClick={() => editor.chain().focus().toggleTaskList().run()} title="Task list"><BsListCheck /></Btn>
      <Btn active={editor.isActive('blockquote')} onClick={() => editor.chain().focus().toggleBlockquote().run()} title="Blockquote"><BsBlockquoteLeft /></Btn>
      <Btn onClick={() => editor.chain().focus().setHorizontalRule().run()} title="Horizontal rule"><BsHr /></Btn>

      <div className="vr mx-1" />

      <Btn active={editor.isActive('link')} onClick={() => setShowLinkModal(true)} title="Insert link"><BsLink45Deg /></Btn>
      <Btn onClick={() => setShowImageModal(true)} title="Insert image from Media Library"><BsImage /></Btn>
      <Btn onClick={() => setShowEmbedModal(true)} title="Embed video/social/code"><BsCameraVideo /></Btn>
      <Btn onClick={() => editor.chain().focus().insertTable({ rows: 3, cols: 3, withHeaderRow: true }).run()} title="Insert table"><BsTable /></Btn>

      <div className="vr mx-1" />

      <Btn onClick={() => editor.chain().focus().undo().run()} disabled={!editor.can().undo()} title="Undo (Ctrl+Z)"><BsArrowCounterclockwise /></Btn>
      <Btn onClick={() => editor.chain().focus().redo().run()} disabled={!editor.can().redo()} title="Redo (Ctrl+Shift+Z)"><BsArrowClockwise /></Btn>

      {showImageModal && (
        <ImagePickerModal
          onClose={() => setShowImageModal(false)}
          onRequestMedia={onRequestMedia}
          onInsert={({ url, alt, caption, align }) => {
            editor.chain().focus().setImage({ src: url, alt }).run();
            editor.chain().updateAttributes('image', { 'data-caption': caption, 'data-align': align }).run();
            setShowImageModal(false);
          }}
        />
      )}
      {showEmbedModal && (
        <EmbedModal
          onClose={() => setShowEmbedModal(false)}
          onInsert={(attrs) => { editor.chain().focus().setEmbed(attrs).run(); setShowEmbedModal(false); }}
        />
      )}
      {showLinkModal && (
        <LinkModal
          editor={editor}
          onClose={() => setShowLinkModal(false)}
        />
      )}
    </div>
  );
}
