const slugify = require('slugify');
const Document = require('../models/Document');

async function generateUniqueSlug(title, { excludeId } = {}) {
  const base = slugify(title, { lower: true, strict: true, trim: true }) || 'untitled';
  let slug = base;
  let counter = 1;

  // eslint-disable-next-line no-await-in-loop
  while (await Document.findOne({ slug, isDeleted: false, ...(excludeId ? { _id: { $ne: excludeId } } : {}) })) {
    counter += 1;
    slug = `${base}-${counter}`;
  }
  return slug;
}

module.exports = { generateUniqueSlug };
