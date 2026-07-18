const MarkdownIt = require('markdown-it');
const TurndownService = require('turndown');
const { minify } = require('html-minifier-terser');
const { sanitizeContentHtml } = require('./sanitize.service');

const md = new MarkdownIt({ html: false, linkify: true, breaks: false, typographer: true });
const turndown = new TurndownService({ headingStyle: 'atx', codeBlockStyle: 'fenced' });

/** Markdown -> sanitized HTML */
function markdownToHtml(markdown = '') {
  const raw = md.render(markdown || '');
  return sanitizeContentHtml(raw);
}

/** HTML -> Markdown (content is sanitized first so exported MD can't carry XSS if re-imported) */
function htmlToMarkdown(html = '') {
  const clean = sanitizeContentHtml(html || '');
  return turndown.turndown(clean);
}

/** Clean/normalize imported raw HTML (paste cleanup, HTML import) */
function cleanImportedHtml(html = '') {
  return sanitizeContentHtml(html || '');
}

async function minifyHtml(html = '') {
  const clean = sanitizeContentHtml(html || '');
  return minify(clean, {
    collapseWhitespace: true,
    removeComments: true,
    minifyCSS: true,
    removeEmptyAttributes: true,
  });
}

module.exports = { markdownToHtml, htmlToMarkdown, cleanImportedHtml, minifyHtml };
