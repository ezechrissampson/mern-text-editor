const mongoose = require('mongoose');
const { Schema } = mongoose;

/**
 * MongoDB fallback store for autosaves when Redis is disabled/unreachable.
 * TTL index auto-expires stale autosaves (see AUTOSAVE_TTL_SECONDS).
 */
const AutosaveSchema = new Schema(
  {
    document: { type: Schema.Types.ObjectId, ref: 'EditorDocument', required: true, index: true },
    editor: { type: Schema.Types.ObjectId, required: true },
    contentHtml: { type: String, default: '' },
    contentJson: { type: Schema.Types.Mixed, default: null },
    title: { type: String, default: '' },
    clientVersion: { type: Number, default: 0 }, // for conflict detection
    createdAt: { type: Date, default: Date.now, expires: 60 * 60 * 24 }, // default 24h TTL, overridden at index creation via env if needed
  },
  { timestamps: false }
);

AutosaveSchema.index({ document: 1, editor: 1 }, { unique: true });

module.exports = mongoose.model('EditorAutosave', AutosaveSchema);
