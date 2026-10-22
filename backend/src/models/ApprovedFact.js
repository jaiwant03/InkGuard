import mongoose from 'mongoose';

const approvedFactSchema = new mongoose.Schema(
  {
    workspace: {
      type: mongoose.Schema.Types.ObjectId,
      ref: 'Workspace',
      required: true,
      index: true,
    },
    factText: {
      type: String,
      required: [true, 'Fact text is required'],
      trim: true,
    },
    category: {
      type: String,
      default: 'Product Capabilities',
      trim: true,
    },
    sourceName: {
      type: String,
      required: [true, 'Source name is required'],
      trim: true,
    },
    sourceUrl: {
      type: String,
      default: '',
      trim: true,
    },
    verificationDate: {
      type: Date,
      default: Date.now,
      required: true,
    },
    expiryDate: {
      type: Date,
      default: null,
    },
    ownerRole: {
      type: String,
      default: 'Product Marketing Lead',
      trim: true,
    },
    status: {
      type: String,
      enum: ['active', 'expired', 'archived'],
      default: 'active',
      index: true,
    },
    notes: {
      type: String,
      default: '',
    },
    createdBy: {
      type: mongoose.Schema.Types.ObjectId,
      ref: 'User',
      required: true,
    },
  },
  {
    timestamps: true,
  }
);

// Method to check if expired
approvedFactSchema.methods.isExpired = function () {
  if (this.status === 'expired') return true;
  if (this.expiryDate && new Date(this.expiryDate) < new Date()) {
    return true;
  }
  return false;
};

export const ApprovedFact = mongoose.model('ApprovedFact', approvedFactSchema);
