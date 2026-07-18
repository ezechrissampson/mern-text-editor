const documentService = require('../services/document.service');
const { success } = require('../utils/apiResponse');
const asyncHandler = require('../utils/asyncHandler');
const AppError = require('../utils/AppError');

const create = asyncHandler(async (req, res) => {
  const doc = await documentService.createDocument(req.body, req.user.id);
  return success(res, { statusCode: 201, message: 'Document created', data: doc });
});

const getOne = asyncHandler(async (req, res) => {
  const doc = await documentService.getDocument(req.params.id);
  return success(res, { data: doc });
});

const update = asyncHandler(async (req, res) => {
  const existing = await documentService.getDocument(req.params.id);

  // Owner-or-permission enforcement (set by permitOwnerOr middleware)
  const overridePerm = req._editorPermitOwnerOr;
  if (overridePerm) {
    const isOwner = String(existing.createdBy) === String(req.user.id);
    const hasOverride =
      typeof req.user.hasPermission === 'function'
        ? req.user.hasPermission(overridePerm)
        : (req.user.permissions || []).includes(overridePerm);
    if (!isOwner && !hasOverride) throw AppError.forbidden('You can only edit your own content');
  }

  const updated = await documentService.updateDocument(req.params.id, req.body, req.user.id, {
    note: req.body.note || '',
  });
  return success(res, { message: 'Document updated', data: updated });
});

const remove = asyncHandler(async (req, res) => {
  await documentService.deleteDocument(req.params.id, req.user.id);
  return success(res, { message: 'Document deleted' });
});

const duplicate = asyncHandler(async (req, res) => {
  const copy = await documentService.duplicateDocument(req.params.id, req.user.id);
  return success(res, { statusCode: 201, message: 'Document duplicated', data: copy });
});

const archive = asyncHandler(async (req, res) => {
  const doc = await documentService.archiveDocument(req.params.id, req.user.id);
  return success(res, { message: 'Document archived', data: doc });
});

const restore = asyncHandler(async (req, res) => {
  const doc = await documentService.restoreDocument(req.params.id, req.user.id);
  return success(res, { message: 'Document restored', data: doc });
});

const list = asyncHandler(async (req, res) => {
  const { page = 1, limit = 20, status, sortBy = 'updatedAt', sortDir = 'desc', mine } = req.query;
  const filter = {};
  if (status) filter.status = status;
  if (mine === 'true') filter.createdBy = req.user.id;

  const result = await documentService.listDocuments({
    filter,
    sort: { [sortBy]: sortDir === 'asc' ? 1 : -1 },
    page: Number(page),
    limit: Number(limit),
  });
  return success(res, { data: result.items, meta: { total: result.total, page: result.page, limit: result.limit, totalPages: result.totalPages } });
});

const search = asyncHandler(async (req, res) => {
  const { q, page = 1, limit = 20, status } = req.query;
  if (!q) throw AppError.badRequest('Query parameter "q" is required');
  const filter = status ? { status } : {};
  const result = await documentService.searchDocuments(q, { filter, page: Number(page), limit: Number(limit) });
  return success(res, { data: result.items, meta: { total: result.total, page: result.page, limit: result.limit, totalPages: result.totalPages } });
});

const dashboard = asyncHandler(async (req, res) => {
  const { mine } = req.query;
  const counts = await documentService.dashboardCounts(mine === 'true' ? req.user.id : undefined);
  return success(res, { data: counts });
});

module.exports = { create, getOne, update, remove, duplicate, archive, restore, list, search, dashboard };
