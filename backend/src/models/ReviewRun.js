import mongoose from 'mongoose';

const reviewRunSchema = new mongoose.Schema(
  {
    workspace: {
      type: mongoose.Schema.Types.ObjectId,
      ref: 'Workspace',
      required: true,
      index: true,
    },
    draft: {
      type: mongoose.Schema.Types.ObjectId,
      ref: 'ContentDraft',
      required: true,
      index: true,
    },
    versionNumber: {
      type: Number,
      required: true,
    },
    contentSnapshot: {
      type: String,
      required: true,
    },
    complianceScore: {
      type: Number,
      required: true,
      min: 0,
      max: 100,
    },
    scoreGrade: {
      type: String,
      enum: ['Excellent', 'Strong', 'Needs Revision', 'High Risk'],
      default: 'Strong',
    },
    findingsSummary: {
      high: { type: Number, default: 0 },
      medium: { type: Number, default: 0 },
      low: { type: Number, default: 0 },
      total: { type: Number, default: 0 },
    },
    rulesCheckedCount: {
      type: Number,
      default: 0,
    },
    factsCheckedCount: {
      type: Number,
      default: 0,
    },
    engineType: {
      type: String,
      enum: ['deterministic', 'ai-assisted'],
      default: 'deterministic',
    },
    aiProvider: {
      type: String,
      default: 'none',
    },
    runBy: {
      type: mongoose.Schema.Types.ObjectId,
      ref: 'User',
      required: true,
    },
  },
  {
    timestamps: true,
  }
);

export const ReviewRun = mongoose.model('ReviewRun', reviewRunSchema);
