const service = require('../services/taxonomy.service');
const { success } = require('../utils/apiResponse');
const asyncHandler = require('../utils/asyncHandler');

const forKind = (kind) => ({
  create: asyncHandler(async (req, res) => {
    const term = await service.createTerm(kind, req.body, req.user.id);
    return success(res, { statusCode: 201, message: `${kind} created`, data: term });
  }),
  list: asyncHandler(async (req, res) => {
    const terms = await service.listTerms(kind);
    return success(res, { data: terms });
  }),
  update: asyncHandler(async (req, res) => {
    const term = await service.updateTerm(kind, req.params.id, req.body);
    return success(res, { message: `${kind} updated`, data: term });
  }),
  remove: asyncHandler(async (req, res) => {
    await service.deleteTerm(kind, req.params.id);
    return success(res, { message: `${kind} deleted` });
  }),
});

module.exports = { categories: forKind('category'), tags: forKind('tag') };
