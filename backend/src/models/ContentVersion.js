import mongoose from 'mongoose';

const contentVersionSchema = new mongoose.Schema(
  {
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
    title: {
      type: String,
      required: true,
    },
    content: {
      type: String,
      required: true,
    },
    changeSummary: {
      type: String,
      default: 'Manual update or suggested correction applied.',
    },
    complianceScore: {
      type: Number,
      default: null,
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

contentVersionSchema.index({ draft: 1, versionNumber: 1 }, { unique: true });

export const ContentVersion = mongoose.model('ContentVersion', contentVersionSchema);
