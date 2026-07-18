const { body, param, query } = require('express-validator');
const { DOCUMENT_STATUS_VALUES } = require('../constants/status');

const mongoId = (field) => param(field).isMongoId().withMessage(`${field} must be a valid id`);

const createDocumentRules = [
  body('title').trim().notEmpty().withMessage('Title is required').isLength({ max: 300 }),
  body('slug').optional().trim().isSlug().withMessage('Slug must be URL-safe'),
  body('contentHtml').optional().isString(),
  body('contentJson').optional(),
  body('excerpt').optional().isString().isLength({ max: 500 }),
  body('featuredImageUrl').optional().isURL({ require_protocol: true }).withMessage('featuredImageUrl must be a valid URL'),
  body('tags').optional().isArray(),
  body('tags.*').optional().isMongoId(),
  body('categories').optional().isArray(),
  body('categories.*').optional().isMongoId(),
  body('language').optional().isString().isLength({ max: 10 }),
  body('seo.title').optional().isString().isLength({ max: 70 }),
  body('seo.description').optional().isString().isLength({ max: 160 }),
  body('seo.canonicalUrl').optional().isURL({ require_protocol: true }),
];

const updateDocumentRules = [
  mongoId('id'),
  body('title').optional().trim().isLength({ max: 300 }),
  body('status').optional().isIn(DOCUMENT_STATUS_VALUES).withMessage('Invalid status value'),
  body('scheduledAt').optional().isISO8601().toDate(),
  ...createDocumentRules.map((rule) => rule.optional?.() || rule),
];

const idParamRule = [mongoId('id')];

const listQueryRules = [
  query('page').optional().isInt({ min: 1 }).toInt(),
  query('limit').optional().isInt({ min: 1, max: 100 }).toInt(),
  query('status').optional().isIn(DOCUMENT_STATUS_VALUES),
  query('search').optional().isString().trim().isLength({ max: 200 }),
  query('sortBy').optional().isIn(['updatedAt', 'createdAt', 'title', 'publishedAt']),
  query('sortDir').optional().isIn(['asc', 'desc']),
];

module.exports = { createDocumentRules, updateDocumentRules, idParamRule, listQueryRules };
