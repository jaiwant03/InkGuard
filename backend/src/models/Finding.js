import mongoose from 'mongoose';

export const CLAIM_STATUSES = [
  'Supported by an approved source',
  'Potentially inconsistent',
  'Needs verification',
];

const findingSchema = new mongoose.Schema(
  {
    reviewRun: {
      type: mongoose.Schema.Types.ObjectId,
      ref: 'ReviewRun',
      required: true,
      index: true,
    },
    draft: {
      type: mongoose.Schema.Types.ObjectId,
      ref: 'ContentDraft',
      required: true,
      index: true,
    },
    workspace: {
      type: mongoose.Schema.Types.ObjectId,
      ref: 'Workspace',
      required: true,
      index: true,
    },
    category: {
      type: String,
      required: true,
      index: true,
    },
    severity: {
      type: String,
      enum: ['High', 'Medium', 'Low'],
      required: true,
      index: true,
    },
    textSpan: {
      type: String,
      default: '',
    },
    startIndex: {
      type: Number,
      default: -1,
    },
    endIndex: {
      type: Number,
      default: -1,
    },
    explanation: {
      type: String,
      required: true,
    },
    suggestedCorrection: {
      type: String,
      default: '',
    },
    ruleRef: {
      type: mongoose.Schema.Types.ObjectId,
      ref: 'BrandRule',
      default: null,
    },
    ruleTitle: {
      type: String,
      default: '',
    },
    factRef: {
      type: mongoose.Schema.Types.ObjectId,
      ref: 'ApprovedFact',
      default: null,
    },
    factSource: {
      type: String,
      default: '',
    },
    claimStatus: {
      type: String,
      enum: CLAIM_STATUSES,
      default: 'Potentially inconsistent',
    },
    detectedBy: {
      type: String,
      enum: ['deterministic', 'ai-assisted'],
      default: 'deterministic',
    },
    confidenceScore: {
      type: Number,
      min: 0,
      max: 100,
      default: 95,
    },
    status: {
      type: String,
      enum: ['open', 'applied', 'dismissed', 'resolved'],
      default: 'open',
      index: true,
    },
    dismissReason: {
      type: String,
      default: '',
    },
    actionTakenBy: {
      type: mongoose.Schema.Types.ObjectId,
      ref: 'User',
      default: null,
    },
    actionTakenAt: {
      type: Date,
      default: null,
    },
  },
  {
    timestamps: true,
  }
);

export const Finding = mongoose.model('Finding', findingSchema);
