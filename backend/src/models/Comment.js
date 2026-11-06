import mongoose from 'mongoose';

const commentSchema = new mongoose.Schema(
  {
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
    author: {
      type: mongoose.Schema.Types.ObjectId,
      ref: 'User',
      required: true,
    },
    content: {
      type: String,
      required: [true, 'Comment content is required'],
      trim: true,
    },
    type: {
      type: String,
      enum: ['general', 'change_request', 'approval_note', 'rejection_note'],
      default: 'general',
    },
    findingRef: {
      type: mongoose.Schema.Types.ObjectId,
      ref: 'Finding',
      default: null,
    },
  },
  {
    timestamps: true,
  }
);

export const Comment = mongoose.model('Comment', commentSchema);
