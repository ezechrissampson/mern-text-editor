/**
 * Publishing workflow states.
 * Extendable for future multi-step approval flows (e.g. add 'IN_REVIEW_L2').
 */
const DOCUMENT_STATUS = Object.freeze({
  DRAFT: 'draft',
  REVIEW: 'review',
  APPROVED: 'approved',
  SCHEDULED: 'scheduled',
  PUBLISHED: 'published',
  ARCHIVED: 'archived',
  REJECTED: 'rejected',
});

const DOCUMENT_STATUS_VALUES = Object.values(DOCUMENT_STATUS);

// Allowed status transitions - enforced in document.service.js
const STATUS_TRANSITIONS = Object.freeze({
  draft: ['review', 'published', 'archived'],
  review: ['approved', 'rejected', 'draft'],
  approved: ['scheduled', 'published', 'draft'],
  scheduled: ['published', 'draft', 'archived'],
  published: ['archived', 'draft'],
  archived: ['draft'],
  rejected: ['draft'],
});

module.exports = { DOCUMENT_STATUS, DOCUMENT_STATUS_VALUES, STATUS_TRANSITIONS };
