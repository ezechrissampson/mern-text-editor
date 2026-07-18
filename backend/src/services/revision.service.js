const revisionRepo = require('../repositories/revision.repository');

/**
 * Creates an immutable revision snapshot. Called by document.service.js
 * on create + every explicit save (not on every autosave tick).
 */
async function snapshot(doc, editorId, note = '') {
  const nextNumber = (await revisionRepo.latestNumber(doc._id)) + 1;
  return revisionRepo.create({
    document: doc._id,
    revisionNumber: nextNumber,
    title: doc.title,
    contentHtml: doc.contentHtml,
    contentJson: doc.contentJson,
    excerpt: doc.excerpt,
    status: doc.status,
    stats: doc.stats,
    note,
    editor: editorId,
  });
}

async function list(documentId, pagination) {
  return revisionRepo.listByDocument(documentId, pagination);
}

async function get(documentId, revisionNumber) {
  return revisionRepo.findOne(documentId, revisionNumber);
}

/**
 * Naive line/word-level diff between two revisions' plain text.
 * Kept dependency-free; swap for `diff`/`jsdiff` package if richer
 * diffing (char-level, HTML-aware) is needed later.
 */
function diffText(oldText = '', newText = '') {
  const oldWords = oldText.split(/\s+/);
  const newWords = newText.split(/\s+/);
  const result = [];
  let i = 0;
  let j = 0;

  while (i < oldWords.length || j < newWords.length) {
    if (oldWords[i] === newWords[j]) {
      result.push({ type: 'same', value: oldWords[i] });
      i += 1;
      j += 1;
    } else if (newWords[j] !== undefined && !oldWords.includes(newWords[j], i)) {
      result.push({ type: 'added', value: newWords[j] });
      j += 1;
    } else {
      result.push({ type: 'removed', value: oldWords[i] });
      i += 1;
    }
  }
  return result;
}

module.exports = { snapshot, list, get, diffText };
