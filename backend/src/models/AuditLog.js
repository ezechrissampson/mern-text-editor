const mongoose = require('mongoose');
const { Schema } = mongoose;

/** Immutable, append-only audit trail for security-sensitive actions. */
const AuditLogSchema = new Schema(
  {
    actor: { type: Schema.Types.ObjectId, required: true },
    action: { type: String, required: true }, // e.g. 'document.publish', 'document.delete'
    resourceType: { type: String, required: true },
    resourceId: { type: Schema.Types.ObjectId, required: true },
    ip: { type: String, default: '' },
    userAgent: { type: String, default: '' },
    meta: { type: Schema.Types.Mixed, default: {} },
    createdAt: { type: Date, default: Date.now },
  },
  { timestamps: false }
);

AuditLogSchema.index({ resourceType: 1, resourceId: 1, createdAt: -1 });

module.exports = mongoose.model('EditorAuditLog', AuditLogSchema);
