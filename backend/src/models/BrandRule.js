import mongoose from 'mongoose';

export const RULE_CATEGORIES = [
  'Tone of voice',
  'Terminology',
  'Messaging',
  'Product naming',
  'Promotional claims',
  'Approved facts',
  'Visual identity',
  'Accessibility',
  'Required disclaimers',
];

export const RULE_SEVERITIES = ['High', 'Medium', 'Low'];

const brandRuleSchema = new mongoose.Schema(
  {
    workspace: {
      type: mongoose.Schema.Types.ObjectId,
      ref: 'Workspace',
      required: true,
      index: true,
    },
    title: {
      type: String,
      required: [true, 'Rule title is required'],
      trim: true,
      maxlength: [200, 'Title cannot exceed 200 characters'],
    },
    description: {
      type: String,
      required: [true, 'Description is required'],
      trim: true,
    },
    category: {
      type: String,
      enum: RULE_CATEGORIES,
      required: true,
      index: true,
    },
    severity: {
      type: String,
      enum: RULE_SEVERITIES,
      default: 'Medium',
      required: true,
    },
    preferredWording: {
      type: String,
      default: '',
    },
    prohibitedPhrases: {
      type: [String],
      default: [],
    },
    requiredPhrases: {
      type: [String],
      default: [],
    },
    correctExamples: {
      type: [String],
      default: [],
    },
    incorrectExamples: {
      type: [String],
      default: [],
    },
    sourceReference: {
      type: String,
      default: '',
    },
    isActive: {
      type: Boolean,
      default: true,
      index: true,
    },
    createdBy: {
      type: mongoose.Schema.Types.ObjectId,
      ref: 'User',
      required: true,
    },
    updatedBy: {
      type: mongoose.Schema.Types.ObjectId,
      ref: 'User',
      default: null,
    },
  },
  {
    timestamps: true,
  }
);

// Search index
brandRuleSchema.index({ workspace: 1, title: 'text', description: 'text', prohibitedPhrases: 'text' });

export const BrandRule = mongoose.model('BrandRule', brandRuleSchema);
