import StarterKit from '@tiptap/starter-kit';
import Underline from '@tiptap/extension-underline';
import Superscript from '@tiptap/extension-superscript';
import Subscript from '@tiptap/extension-subscript';
import TextStyle from '@tiptap/extension-text-style';
import Color from '@tiptap/extension-color';
import Highlight from '@tiptap/extension-highlight';
import FontFamily from '@tiptap/extension-font-family';
import TextAlign from '@tiptap/extension-text-align';
import Link from '@tiptap/extension-link';
import Image from '@tiptap/extension-image';
import Table from '@tiptap/extension-table';
import TableRow from '@tiptap/extension-table-row';
import TableCell from '@tiptap/extension-table-cell';
import TableHeader from '@tiptap/extension-table-header';
import TaskList from '@tiptap/extension-task-list';
import TaskItem from '@tiptap/extension-task-item';
import CodeBlockLowlight from '@tiptap/extension-code-block-lowlight';
import Placeholder from '@tiptap/extension-placeholder';
import CharacterCount from '@tiptap/extension-character-count';
import { createLowlight, common } from 'lowlight';
import EmbedNode from './EmbedNode';

const lowlight = createLowlight(common);

/**
 * Builds the full extension set. `imageValidator` should be the same
 * (or an equivalent) URL-safety check used server-side, applied
 * client-side purely for immediate UX feedback - the server remains
 * the authoritative gate.
 */
export function buildExtensions({ placeholder = 'Start writing, or press "/" for commands...' } = {}) {
  return [
    StarterKit.configure({
      heading: { levels: [1, 2, 3, 4, 5, 6] },
      codeBlock: false, // replaced by CodeBlockLowlight
    }),
    Underline,
    Superscript,
    Subscript,
    TextStyle,
    Color,
    Highlight.configure({ multicolor: true }),
    FontFamily,
    TextAlign.configure({ types: ['heading', 'paragraph'] }),
    Link.configure({
      openOnClick: false,
      autolink: true,
      HTMLAttributes: { rel: 'noopener noreferrer nofollow', target: '_blank' },
    }),
    Image.configure({ inline: false, allowBase64: false }).extend({
      // Extra attributes for caption/alignment/link - rendered as data-* attrs
      addAttributes() {
        return {
          ...this.parent?.(),
          alt: { default: '' },
          title: { default: '' },
          'data-align': { default: 'center' },
          'data-caption': { default: '' },
          width: { default: null },
        };
      },
    }),
    Table.configure({ resizable: true }),
    TableRow,
    TableHeader,
    TableCell,
    TaskList,
    TaskItem.configure({ nested: true }),
    CodeBlockLowlight.configure({ lowlight }),
    Placeholder.configure({ placeholder }),
    CharacterCount,
    EmbedNode,
  ];
}
