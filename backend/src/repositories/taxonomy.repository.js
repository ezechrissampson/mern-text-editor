const Category = require('../models/Category');
const Tag = require('../models/Tag');

const models = { category: Category, tag: Tag };

const create = (kind, data) => models[kind].create(data);
const list = (kind) => models[kind].find({ isDeleted: false }).sort({ name: 1 });
const findById = (kind, id) => models[kind].findOne({ _id: id, isDeleted: false });
const updateById = (kind, id, update) =>
  models[kind].findOneAndUpdate({ _id: id, isDeleted: false }, { $set: update }, { new: true, runValidators: true });
const softDelete = (kind, id) =>
  models[kind].findOneAndUpdate({ _id: id, isDeleted: false }, { $set: { isDeleted: true } }, { new: true });

module.exports = { create, list, findById, updateById, softDelete };
