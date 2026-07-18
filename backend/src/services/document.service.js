const documentRepo = require('../repositories/document.repository');
const revisionService = require('./revision.service');
const { sanitizeContentHtml, sanitizePlainText, isSafeMediaUrl } = require('./sanitize.service');
const { generateUniqueSlug } = require('./slug.service');
const { buildStats } = require('./stats.service');
const { STATUS_TRANSITIONS, DOCUMENT_STATUS } = require('../constants/status');
const AppError = require('../utils/AppError');
const EditorActivity = require('../models/EditorActivity');

async function logActivity(document, actor, action, meta = {}) {
  await EditorActivity.create({ document: document._id, actor, action, meta });
}

function assertValidTransition(currentStatus, nextStatus) {
  if (currentStatus === nextStatus) return;
  const allowed = STATUS_TRANSITIONS[currentStatus] || [];
  if (!allowed.includes(nextStatus)) {
    throw AppError.badRequest(`Cannot transition status from '${currentStatus}' to '${nextStatus}'`);
  }
}

function sanitizePayload(payload) {
  const clean = { ...payload };
  if (clean.title !== undefined) clean.title = sanitizePlainText(clean.title);
  if (clean.excerpt !== undefined) clean.excerpt = sanitizePlainText(clean.excerpt);
  if (clean.contentHtml !== undefined) clean.contentHtml = sanitizeContentHtml(clean.contentHtml);
  if (clean.featuredImageUrl && !isSafeMediaUrl(clean.featuredImageUrl)) {
    throw AppError.badRequest('featuredImageUrl must be a valid http(s) URL');
  }
  if (clean.seo) {
    clean.seo = {
      title: sanitizePlainText(clean.seo.title || ''),
      description: sanitizePlainText(clean.seo.description || ''),
      canonicalUrl: clean.seo.canonicalUrl || '',
    };
  }
  return clean;
}

async function createDocument(payload, userId) {
  const clean = sanitizePayload(payload);
  const slug = clean.slug ? sanitizePlainText(clean.slug) : await generateUniqueSlug(clean.title);
  const stats = buildStats(clean.contentHtml || '');

  const doc = await documentRepo.create({
    ...clean,
    slug,
    stats,
    status: DOCUMENT_STATUS.DRAFT,
    createdBy: userId,
    updatedBy: userId,
    currentRevision: 1,
  });

  await revisionService.snapshot(doc, userId, 'Initial version');
  await logActivity(doc, userId, 'created');
  return doc;
}

async function getDocument(id) {
  const doc = await documentRepo.findById(id);
  if (!doc) throw AppError.notFound('Document not found');
  return doc;
}

async function updateDocument(id, payload, userId, { note = '' } = {}) {
  const existing = await getDocument(id);
  const clean = sanitizePayload(payload);

  if (clean.status && clean.status !== existing.status) {
    assertValidTransition(existing.status, clean.status);
    if (clean.status === DOCUMENT_STATUS.PUBLISHED) clean.publishedAt = new Date();
  }

  if (clean.title && clean.title !== existing.title && !payload.slug) {
    clean.slug = await generateUniqueSlug(clean.title, { excludeId: id });
  }

  if (clean.contentHtml !== undefined) {
    clean.stats = buildStats(clean.contentHtml);
  }

  clean.updatedBy = userId;
  clean.currentRevision = (existing.currentRevision || 1) + 1;

  const updated = await documentRepo.updateById(id, clean);

  await revisionService.snapshot(updated, userId, note);
  await logActivity(updated, userId, clean.status ? 'status_changed' : 'updated', { status: clean.status });

  return updated;
}

async function deleteDocument(id, userId) {
  const doc = await documentRepo.softDelete(id);
  if (!doc) throw AppError.notFound('Document not found');
  await logActivity(doc, userId, 'deleted');
  return doc;
}

async function duplicateDocument(id, userId) {
  const original = await getDocument(id);
  const slug = await generateUniqueSlug(`${original.title} copy`);
  const copy = await documentRepo.create({
    title: `${original.title} (Copy)`,
    slug,
    contentHtml: original.contentHtml,
    contentJson: original.contentJson,
    excerpt: original.excerpt,
    seo: original.seo,
    featuredImageUrl: original.featuredImageUrl,
    tags: original.tags,
    categories: original.categories,
    language: original.language,
    status: DOCUMENT_STATUS.DRAFT,
    stats: original.stats,
    createdBy: userId,
    updatedBy: userId,
  });
  await revisionService.snapshot(copy, userId, 'Duplicated from original');
  await logActivity(copy, userId, 'duplicated', { sourceId: original._id });
  return copy;
}

async function archiveDocument(id, userId) {
  return updateDocument(id, { status: DOCUMENT_STATUS.ARCHIVED }, userId, { note: 'Archived' });
}

async function restoreDocument(id, userId) {
  return updateDocument(id, { status: DOCUMENT_STATUS.DRAFT }, userId, { note: 'Restored from archive' });
}

async function listDocuments(query) {
  return documentRepo.list(query);
}

async function searchDocuments(term, options) {
  return documentRepo.search(term, options);
}

async function dashboardCounts(userId) {
  return documentRepo.countByStatus(userId);
}

module.exports = {
  createDocument,
  getDocument,
  updateDocument,
  deleteDocument,
  duplicateDocument,
  archiveDocument,
  restoreDocument,
  listDocuments,
  searchDocuments,
  dashboardCounts,
};
