import mongoose from 'mongoose';

export const CONTENT_TYPES = [
  'Social media post',
  'Advertisement',
  'Website copy',
  'Email campaign',
  'Product description',
  'General marketing text',
];

export const WORKFLOW_STATUSES = [
  'Draft',
  'In Review',
  'Changes Requested',
  'Approved',
  'Rejected',
];

const contentDraftSchema = new mongoose.Schema(
  {
    workspace: {
      type: mongoose.Schema.Types.ObjectId,
      ref: 'Workspace',
      required: true,
      index: true,
    },
    title: {
      type: String,
      required: [true, 'Content title is required'],
      trim: true,
      maxlength: [200, 'Title cannot exceed 200 characters'],
    },
    contentType: {
      type: String,
      enum: CONTENT_TYPES,
      default: 'General marketing text',
      required: true,
    },
    currentContent: {
      type: String,
      required: [true, 'Content text is required'],
    },
    originalContent: {
      type: String,
      required: true,
    },
    currentVersion: {
      type: Number,
      default: 1,
    },
    status: {
      type: String,
      enum: WORKFLOW_STATUSES,
      default: 'Draft',
      index: true,
    },
    author: {
      type: mongoose.Schema.Types.ObjectId,
      ref: 'User',
      required: true,
    },
    reviewer: {
      type: mongoose.Schema.Types.ObjectId,
      ref: 'User',
      default: null,
    },
    lastReviewedAt: {
      type: Date,
      default: null,
    },
    latestComplianceScore: {
      type: Number,
      default: null,
    },
    latestReviewRun: {
      type: mongoose.Schema.Types.ObjectId,
      ref: 'ReviewRun',
      default: null,
    },
    attachedAsset: {
      type: mongoose.Schema.Types.ObjectId,
      ref: 'BrandAsset',
      default: null,
    },
    imageUrl: {
      type: String,
      default: '',
    },
    imageAltText: {
      type: String,
      default: '',
    },
    detectedColors: {
      type: [String],
      default: [],
    },
    originalFileName: {
      type: String,
      default: '',
    },
    originalFileFormat: {
      type: String,
      default: '',
    },
    isOverrideApproved: {
      type: Boolean,
      default: false,
    },
    overrideReason: {
      type: String,
      default: '',
    },
  },
  {
    timestamps: true,
  }
);

export const ContentDraft = mongoose.model('ContentDraft', contentDraftSchema);
