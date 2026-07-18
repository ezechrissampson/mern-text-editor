const repo = require('../repositories/taxonomy.repository');
const { sanitizePlainText } = require('./sanitize.service');
const slugify = require('slugify');
const AppError = require('../utils/AppError');

async function createTerm(kind, payload, userId) {
  const name = sanitizePlainText(payload.name);
  if (!name) throw AppError.badRequest('Name is required');
  const slug = slugify(name, { lower: true, strict: true });
  return repo.create(kind, { name, slug, description: sanitizePlainText(payload.description || ''), createdBy: userId });
}

async function listTerms(kind) {
  return repo.list(kind);
}

async function updateTerm(kind, id, payload) {
  const update = {};
  if (payload.name) {
    update.name = sanitizePlainText(payload.name);
    update.slug = slugify(update.name, { lower: true, strict: true });
  }
  if (payload.description !== undefined) update.description = sanitizePlainText(payload.description);
  const term = await repo.updateById(kind, id, update);
  if (!term) throw AppError.notFound(`${kind} not found`);
  return term;
}

async function deleteTerm(kind, id) {
  const term = await repo.softDelete(kind, id);
  if (!term) throw AppError.notFound(`${kind} not found`);
  return term;
}

module.exports = { createTerm, listTerms, updateTerm, deleteTerm };
