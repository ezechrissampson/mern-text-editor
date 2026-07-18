const autosaveService = require('../services/autosave.service');
const documentService = require('../services/document.service');
const { success } = require('../utils/apiResponse');
const asyncHandler = require('../utils/asyncHandler');

const save = asyncHandler(async (req, res) => {
  const { documentId } = req.params;
  const document = await documentService.getDocument(documentId);

  const result = await autosaveService.saveWithConflictCheck(
    {
      documentId,
      editorId: req.user.id,
      title: req.body.title,
      contentHtml: req.body.contentHtml,
      contentJson: req.body.contentJson,
      clientVersion: req.body.clientVersion,
    },
    document.currentRevision
  );

  return success(res, { message: 'Autosaved', data: result });
});

const get = asyncHandler(async (req, res) => {
  const { documentId } = req.params;
  const result = await autosaveService.getAutosave(documentId, req.user.id);
  return success(res, { data: result });
});

const clear = asyncHandler(async (req, res) => {
  const { documentId } = req.params;
  await autosaveService.clearAutosave(documentId, req.user.id);
  return success(res, { message: 'Autosave cleared' });
});

module.exports = { save, get, clear };
