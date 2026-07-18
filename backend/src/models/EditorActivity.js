const mongoose = require('mongoose');
const { Schema } = mongoose;

/** Lightweight activity feed entries for the dashboard's "Recent Activity". */
const EditorActivitySchema = new Schema(
  {
    document: { type: Schema.Types.ObjectId, ref: 'EditorDocument', required: true, index: true },
    actor: { type: Schema.Types.ObjectId, required: true },
    action: {
      type: String,
      enum: ['created', 'updated', 'status_changed', 'restored', 'archived', 'deleted', 'duplicated'],
      required: true,
    },
    meta: { type: Schema.Types.Mixed, default: {} },
    createdAt: { type: Date, default: Date.now },
  },
  { timestamps: false }
);

EditorActivitySchema.index({ createdAt: -1 });

module.exports = mongoose.model('EditorActivity', EditorActivitySchema);
