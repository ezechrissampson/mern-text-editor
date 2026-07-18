/**
 * Central HTML sanitization pipeline. Every piece of user-authored HTML
 * (editor content, imported HTML, imported Markdown-to-HTML output)
 * MUST pass through sanitizeContentHtml() before it is persisted or
 * ever echoed back to a client.
 *
 * Defense in depth:
 *  - sanitize-html on the server (source of truth, cannot be bypassed by client)
 *  - isomorphic-dompurify as a second pass (belt & suspenders against
 *    parser differential attacks)
 *  - explicit iframe src whitelist (see constants/embeds.js / env ALLOWED_IFRAME_HOSTS)
 *  - no inline event handlers, no javascript: URLs, no <script>, no <style>
 */
const sanitizeHtml = require('sanitize-html');
const createDOMPurify = require('isomorphic-dompurify');
const env = require('../config/env');
const AppError = require('../utils/AppError');

const DOMPurify = createDOMPurify;

const ALLOWED_TAGS = [
  'h1', 'h2', 'h3', 'h4', 'h5', 'h6',
  'p', 'br', 'hr',
  'strong', 'b', 'em', 'i', 'u', 's', 'strike', 'sup', 'sub', 'mark', 'code', 'pre',
  'blockquote',
  'ul', 'ol', 'li',
  'a', 'img', 'figure', 'figcaption',
  'table', 'thead', 'tbody', 'tfoot', 'tr', 'th', 'td',
  'span', 'div',
  'iframe',
  'video', 'source',
];

const ALLOWED_ATTRIBUTES = {
  a: ['href', 'target', 'rel', 'title'],
  img: ['src', 'alt', 'title', 'width', 'height', 'loading', 'class', 'data-align', 'data-caption'],
  span: ['class', 'style', 'data-*'],
  div: ['class', 'data-*'],
  td: ['colspan', 'rowspan'],
  th: ['colspan', 'rowspan'],
  code: ['class'],
  pre: ['class'],
  iframe: ['src', 'width', 'height', 'frameborder', 'allow', 'allowfullscreen', 'title', 'loading', 'referrerpolicy'],
  video: ['src', 'controls', 'width', 'height', 'poster'],
  source: ['src', 'type'],
  '*': ['id'],
};

// Only these inline style properties survive (color/highlight/alignment/font-size)
const ALLOWED_STYLE_PROPS = /^(color|background-color|text-align|font-size)$/;

function hostnameOf(url) {
  try {
    return new URL(url).hostname.toLowerCase();
  } catch {
    return null;
  }
}

function isSafeHref(href = '') {
  if (!href) return false;
  const trimmed = href.trim();
  // Explicitly block dangerous schemes
  if (/^\s*(javascript|data|vbscript):/i.test(trimmed)) return false;
  // Allow relative/app-internal links, mailto, and http(s)
  if (trimmed.startsWith('/') || trimmed.startsWith('#')) return true;
  if (/^mailto:/i.test(trimmed)) return true;
  return /^https?:\/\//i.test(trimmed);
}

function isWhitelistedIframeSrc(src = '') {
  const host = hostnameOf(src);
  if (!host) return false;
  if (!/^https:\/\//i.test(src.trim())) return false; // iframes must be https
  return env.ALLOWED_IFRAME_HOSTS.some((allowed) => host === allowed || host.endsWith(`.${allowed}`));
}

/**
 * Primary sanitization entry point for rich text/editor HTML.
 * Throws AppError(400) if content contains a disallowed iframe host
 * (rather than silently stripping, so the author gets clear feedback).
 */
function sanitizeContentHtml(rawHtml = '') {
  if (typeof rawHtml !== 'string') return '';

  // Pre-check: any iframe present must resolve to a whitelisted host.
  const iframeSrcRegex = /<iframe[^>]+src=["']([^"']+)["']/gi;
  let match;
  // eslint-disable-next-line no-cond-assign
  while ((match = iframeSrcRegex.exec(rawHtml)) !== null) {
    if (!isWhitelistedIframeSrc(match[1])) {
      throw AppError.badRequest('Embed source is not in the allowed provider whitelist', {
        src: match[1],
      });
    }
  }

  const firstPass = sanitizeHtml(rawHtml, {
    allowedTags: ALLOWED_TAGS,
    allowedAttributes: ALLOWED_ATTRIBUTES,
    allowedSchemes: ['http', 'https', 'mailto'],
    allowedSchemesByTag: { img: ['http', 'https'] },
    allowVulnerableTags: false,
    allowProtocolRelative: false,
    disallowedTagsMode: 'discard',
    exclusiveFilter: (frame) => {
      // Strip <a>/<img> with unsafe hrefs/srcs early
      if (frame.tag === 'a' && frame.attribs.href && !isSafeHref(frame.attribs.href)) return true;
      if (frame.tag === 'img' && frame.attribs.src && !/^https?:\/\//i.test(frame.attribs.src)) return true;
      if (frame.tag === 'iframe' && frame.attribs.src && !isWhitelistedIframeSrc(frame.attribs.src)) return true;
      return false;
    },
    transformTags: {
      a: (tagName, attribs) => ({
        tagName: 'a',
        attribs: { ...attribs, rel: 'noopener noreferrer nofollow', target: attribs.target === '_blank' ? '_blank' : attribs.target },
      }),
      img: (tagName, attribs) => ({
        tagName: 'img',
        attribs: { ...attribs, loading: attribs.loading || 'lazy' },
      }),
      iframe: (tagName, attribs) => ({
        tagName: 'iframe',
        attribs: {
          ...attribs,
          sandbox: 'allow-scripts allow-same-origin allow-presentation',
          referrerpolicy: 'no-referrer',
          loading: 'lazy',
        },
      }),
    },
    allowedStyles: {
      '*': {
        color: [/.*/],
        'background-color': [/.*/],
        'text-align': [/.*/],
        'font-size': [/.*/],
      },
    },
    parser: { lowerCaseAttributeNames: true },
  });

  // Second pass: DOMPurify as a redundant guard against any residual
  // event-handler attributes, <script>, or style-based injection.
  const secondPass = DOMPurify.sanitize(firstPass, {
    ALLOWED_TAGS,
    ALLOWED_ATTR: Object.values(ALLOWED_ATTRIBUTES).flat().concat(['style', 'class', 'id']),
    FORBID_TAGS: ['script', 'style', 'object', 'embed', 'form', 'input', 'link', 'meta', 'base'],
    FORBID_ATTR: [
      'onerror', 'onload', 'onclick', 'onmouseover', 'onfocus', 'onblur',
      'onchange', 'onsubmit', 'onkeydown', 'onkeyup', 'srcdoc', 'formaction',
    ],
  });

  return secondPass;
}

/** Sanitize a single plain-text field (title, excerpt, seo fields, etc.) */
function sanitizePlainText(value = '') {
  if (typeof value !== 'string') return '';
  return sanitizeHtml(value, { allowedTags: [], allowedAttributes: {} }).trim();
}

/** Validate a standalone image/media URL selected from the Media Library. */
function isSafeMediaUrl(url = '') {
  if (typeof url !== 'string') return false;
  return /^https?:\/\//i.test(url.trim()) && !/^\s*javascript:/i.test(url);
}

module.exports = {
  sanitizeContentHtml,
  sanitizePlainText,
  isSafeHref,
  isSafeMediaUrl,
  isWhitelistedIframeSrc,
};
