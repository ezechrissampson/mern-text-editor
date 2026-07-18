const { body, param } = require('express-validator');

const autosaveRules = [
  param('documentId').isMongoId(),
  body('title').optional().isString(),
  body('contentHtml').optional().isString(),
  body('contentJson').optional(),
  body('clientVersion').optional().isInt({ min: 0 }),
];

module.exports = { autosaveRules };
