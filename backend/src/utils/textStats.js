/**
 * Word count / character count / reading time, computed from sanitized
 * plain text (HTML tags stripped upstream by sanitize.service.js).
 */
const WORDS_PER_MINUTE = 200;

function stripTags(html = '') {
  return html.replace(/<[^>]*>/g, ' ').replace(/\s+/g, ' ').trim();
}

function computeStats(html = '') {
  const plain = stripTags(html);
  const words = plain.length ? plain.split(' ').filter(Boolean) : [];
  const wordCount = words.length;
  const characterCount = plain.length;
  const readingTimeMinutes = Math.max(1, Math.ceil(wordCount / WORDS_PER_MINUTE));
  return { wordCount, characterCount, readingTimeMinutes };
}

module.exports = { computeStats, stripTags };
