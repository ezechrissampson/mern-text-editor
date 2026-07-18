import { Node, mergeAttributes } from '@tiptap/core';

/**
 * Custom TipTap node that renders a sandboxed <iframe> for whitelisted
 * embed providers (YouTube, Vimeo, Twitter/X, GitHub Gist, CodePen,
 * Spotify, Google Maps). The URL is validated client-side on insert
 * (constants/embedProviders.js) AND re-validated server-side on save
 * (sanitize.service.js) - the server check is authoritative.
 */
const EmbedNode = Node.create({
  name: 'embed',
  group: 'block',
  atom: true,
  draggable: true,

  addAttributes() {
    return {
      src: { default: null },
      provider: { default: 'custom' },
      title: { default: 'Embedded content' },
    };
  },

  parseHTML() {
    return [{ tag: 'iframe[data-embed]' }];
  },

  renderHTML({ HTMLAttributes }) {
    return [
      'iframe',
      mergeAttributes(HTMLAttributes, {
        'data-embed': 'true',
        frameborder: '0',
        allow: 'accelerometer; autoplay; clipboard-write; encrypted-media; gyroscope; picture-in-picture',
        allowfullscreen: 'true',
        loading: 'lazy',
        referrerpolicy: 'no-referrer',
        width: '100%',
        height: '400',
        style: 'border-radius: 0.5rem; border: 1px solid var(--editor-border);',
      }),
    ];
  },

  addCommands() {
    return {
      setEmbed:
        (attrs) =>
        ({ commands }) =>
          commands.insertContent({ type: this.name, attrs }),
    };
  },
});

export default EmbedNode;
