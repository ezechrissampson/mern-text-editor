const revisionService = require('../services/revision.service');
const documentService = require('../services/document.service');
const { success } = require('../utils/apiResponse');
const asyncHandler = require('../utils/asyncHandler');
const AppError = require('../utils/AppError');
const { stripTags } = require('../utils/textStats');

const list = asyncHandler(async (req, res) => {
  const { page = 1, limit = 20 } = req.query;
  const result = await revisionService.list(req.params.documentId, { page: Number(page), limit: Number(limit) });
  return success(res, { data: result.items, meta: { total: result.total, page: result.page, limit: result.limit, totalPages: result.totalPages } });
});

const compare = asyncHandler(async (req, res) => {
  const { documentId } = req.params;
  const { from, to } = req.query;
  const [a, b] = await Promise.all([
    revisionService.get(documentId, Number(from)),
    revisionService.get(documentId, Number(to)),
  ]);
  if (!a || !b) throw AppError.notFound('One or both revisions not found');

  const diff = revisionService.diffText(stripTags(a.contentHtml), stripTags(b.contentHtml));
  return success(res, { data: { from: a, to: b, diff } });
});

const restore = asyncHandler(async (req, res) => {
  const { documentId, revisionNumber } = req.params;
  const revision = await revisionService.get(documentId, Number(revisionNumber));
  if (!revision) throw AppError.notFound('Revision not found');

  const updated = await documentService.updateDocument(
    documentId,
    { title: revision.title, contentHtml: revision.contentHtml, contentJson: revision.contentJson, excerpt: revision.excerpt },
    req.user.id,
    { note: `Restored from revision #${revision.revisionNumber}` }
  );
  return success(res, { message: 'Revision restored', data: updated });
});

module.exports = { list, compare, restore };
