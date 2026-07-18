const mongoose = require('mongoose');
const { DOCUMENT_STATUS_VALUES, DOCUMENT_STATUS } = require('../constants/status');

const { Schema } = mongoose;

/**
 * Core content document (post/page/article). Author/editor identity
 * (createdBy/updatedBy) is stored as opaque ObjectIds referencing the
 * HOST application's existing User collection - this module does not
 * define or own a User model.
 */
const DocumentSchema = new Schema(
  {
    title: { type: String, required: true, trim: true, maxlength: 300 },
    slug: { type: String, required: true, trim: true, lowercase: true, index: true },

    contentHtml: { type: String, default: '' }, // sanitized HTML, source of truth
    contentJson: { type: Schema.Types.Mixed, default: null }, // TipTap/ProseMirror JSON doc

    excerpt: { type: String, maxlength: 500, default: '' },

    seo: {
      title: { type: String, maxlength: 70, default: '' },
      description: { type: String, maxlength: 160, default: '' },
      canonicalUrl: { type: String, default: '' },
    },

    featuredImageUrl: { type: String, default: '' },

    tags: [{ type: Schema.Types.ObjectId, ref: 'EditorTag' }],
    categories: [{ type: Schema.Types.ObjectId, ref: 'EditorCategory' }],

    language: { type: String, default: 'en' },

    status: {
      type: String,
      enum: DOCUMENT_STATUS_VALUES,
      default: DOCUMENT_STATUS.DRAFT,
      index: true,
    },
    scheduledAt: { type: Date, default: null },
    publishedAt: { type: Date, default: null },

    stats: {
      wordCount: { type: Number, default: 0 },
      characterCount: { type: Number, default: 0 },
      readingTimeMinutes: { type: Number, default: 1 },
    },

    // Host application identifiers - never populated/joined by this module,
    // just stored and returned as-is.
    createdBy: { type: Schema.Types.ObjectId, required: true, index: true },
    updatedBy: { type: Schema.Types.ObjectId, required: true },

    currentRevision: { type: Number, default: 1 },

    isDeleted: { type: Boolean, default: false, index: true }, // soft delete
    deletedAt: { type: Date, default: null },
  },
  { timestamps: true }
);

DocumentSchema.index({ title: 'text', excerpt: 'text', 'seo.description': 'text' });
DocumentSchema.index({ slug: 1, isDeleted: 1 }, { unique: true, partialFilterExpression: { isDeleted: false } });
DocumentSchema.index({ status: 1, createdBy: 1, updatedAt: -1 });

// Default query scope excludes soft-deleted docs unless explicitly requested
DocumentSchema.query.notDeleted = function notDeleted() {
  return this.where({ isDeleted: false });
};

module.exports = mongoose.model('EditorDocument', DocumentSchema);
