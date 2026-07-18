const mongoose = require('mongoose');
const { Schema } = mongoose;

const CategorySchema = new Schema(
  {
    name: { type: String, required: true, trim: true, maxlength: 100 },
    slug: { type: String, required: true, trim: true, lowercase: true, unique: true },
    description: { type: String, default: '', maxlength: 300 },
    parent: { type: Schema.Types.ObjectId, ref: 'EditorCategory', default: null },
    createdBy: { type: Schema.Types.ObjectId, required: true },
    isDeleted: { type: Boolean, default: false },
  },
  { timestamps: true }
);

module.exports = mongoose.model('EditorCategory', CategorySchema);
