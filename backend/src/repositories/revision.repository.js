const Revision = require('../models/Revision');

async function create(data) {
  return Revision.create(data);
}

async function listByDocument(documentId, { page = 1, limit = 20 } = {}) {
  const skip = (page - 1) * limit;
  const [items, total] = await Promise.all([
    Revision.find({ document: documentId }).sort({ revisionNumber: -1 }).skip(skip).limit(limit),
    Revision.countDocuments({ document: documentId }),
  ]);
  return { items, total, page, limit, totalPages: Math.ceil(total / limit) };
}

async function findOne(documentId, revisionNumber) {
  return Revision.findOne({ document: documentId, revisionNumber });
}

async function latestNumber(documentId) {
  const latest = await Revision.findOne({ document: documentId }).sort({ revisionNumber: -1 }).select('revisionNumber');
  return latest ? latest.revisionNumber : 0;
}

module.exports = { create, listByDocument, findOne, latestNumber };
