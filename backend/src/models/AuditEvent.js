import mongoose from 'mongoose';

const auditEventSchema = new mongoose.Schema(
  {
    workspace: {
      type: mongoose.Schema.Types.ObjectId,
      ref: 'Workspace',
      required: true,
      index: true,
    },
    actor: {
      type: mongoose.Schema.Types.ObjectId,
      ref: 'User',
      required: true,
    },
    actorName: {
      type: String,
      default: '',
    },
    action: {
      type: String,
      required: true,
      index: true,
    },
    entityType: {
      type: String,
      enum: ['Draft', 'ReviewRun', 'Finding', 'BrandRule', 'ApprovedFact', 'BrandAsset', 'Workspace', 'Member', 'Approval'],
      required: true,
      index: true,
    },
    entityId: {
      type: String,
      required: true,
    },
    details: {
      type: mongoose.Schema.Types.Mixed,
      default: {},
    },
    ipAddress: {
      type: String,
      default: '',
    },
  },
  {
    timestamps: { createdAt: true, updatedAt: false }, // Audit records are immutable
  }
);

export const AuditEvent = mongoose.model('AuditEvent', auditEventSchema);
