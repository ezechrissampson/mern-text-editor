/**
 * Repository layer: the ONLY place raw Mongoose queries against
 * EditorDocument live. Services depend on this, never on the model directly.
 * Keeping this boundary makes it trivial to swap persistence later
 * or add caching without touching business logic.
 */
const Document = require('../models/Document');

const baseFilter = () => ({ isDeleted: false });

async function create(data) {
  return Document.create(data);
}

async function findById(id) {
  return Document.findOne({ _id: id, ...baseFilter() });
}

async function findBySlug(slug) {
  return Document.findOne({ slug, ...baseFilter() });
}

async function updateById(id, update) {
  return Document.findOneAndUpdate(
    { _id: id, ...baseFilter() },
    { $set: update },
    { new: true, runValidators: true }
  );
}

async function softDelete(id) {
  return Document.findOneAndUpdate(
    { _id: id, ...baseFilter() },
    { $set: { isDeleted: true, deletedAt: new Date() } },
    { new: true }
  );
}

async function list({ filter = {}, sort = { updatedAt: -1 }, page = 1, limit = 20 }) {
  const skip = (page - 1) * limit;
  const query = { ...baseFilter(), ...filter };
  const [items, total] = await Promise.all([
    Document.find(query).sort(sort).skip(skip).limit(limit).populate('tags categories', 'name slug'),
    Document.countDocuments(query),
  ]);
  return { items, total, page, limit, totalPages: Math.ceil(total / limit) };
}

async function search(term, { filter = {}, page = 1, limit = 20 }) {
  const skip = (page - 1) * limit;
  const query = { ...baseFilter(), ...filter, $text: { $search: term } };
  const [items, total] = await Promise.all([
    Document.find(query, { score: { $meta: 'textScore' } })
      .sort({ score: { $meta: 'textScore' } })
      .skip(skip)
      .limit(limit),
    Document.countDocuments(query),
  ]);
  return { items, total, page, limit, totalPages: Math.ceil(total / limit) };
}

async function countByStatus(createdBy) {
  const match = { ...baseFilter(), ...(createdBy ? { createdBy } : {}) };
  const rows = await Document.aggregate([{ $match: match }, { $group: { _id: '$status', count: { $sum: 1 } } }]);
  return rows.reduce((acc, r) => ({ ...acc, [r._id]: r.count }), {});
}

module.exports = {
  create,
  findById,
  findBySlug,
  updateById,
  softDelete,
  list,
  search,
  countByStatus,
};
