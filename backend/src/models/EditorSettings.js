const mongoose = require('mongoose');
const { Schema } = mongoose;

/**
 * Per-workspace/tenant editor configuration. Single doc per scope key
 * (defaults to 'global') so the host app can namespace by org/site if
 * it is multi-tenant.
 */
const EditorSettingsSchema = new Schema(
  {
    scopeKey: { type: String, default: 'global', unique: true },
    autosaveIntervalMs: { type: Number, default: 15000 },
    allowedEmbedProviders: {
      type: [String],
      default: ['youtube', 'vimeo', 'twitter', 'github_gist', 'codepen', 'spotify', 'google_maps'],
    },
    defaultLanguage: { type: String, default: 'en' },
    updatedBy: { type: Schema.Types.ObjectId, default: null },
  },
  { timestamps: true }
);

module.exports = mongoose.model('EditorSettings', EditorSettingsSchema);
