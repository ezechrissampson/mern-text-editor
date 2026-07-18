const mongoose = require('mongoose');
const { Schema } = mongoose;

/**
 * Immutable snapshot of a document at a point in time. Created on every
 * meaningful save (not every autosave tick - see autosave.service.js).
 */
const RevisionSchema = new Schema(
  {
    document: { type: Schema.Types.ObjectId, ref: 'EditorDocument', required: true, index: true },
    revisionNumber: { type: Number, required: true },

    title: { type: String, required: true },
    contentHtml: { type: String, default: '' },
    contentJson: { type: Schema.Types.Mixed, default: null },
    excerpt: { type: String, default: '' },
    status: { type: String, default: 'draft' },

    stats: {
      wordCount: { type: Number, default: 0 },
      characterCount: { type: Number, default: 0 },
      readingTimeMinutes: { type: Number, default: 1 },
    },

    note: { type: String, default: '', maxlength: 500 }, // optional editor note ("fixed typo", etc.)
    editor: { type: Schema.Types.ObjectId, required: true }, // host app user id

    createdAt: { type: Date, default: Date.now },
  },
  { timestamps: false }
);

RevisionSchema.index({ document: 1, revisionNumber: -1 }, { unique: true });

module.exports = mongoose.model('EditorRevision', RevisionSchema);
