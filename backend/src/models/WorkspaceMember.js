import mongoose from 'mongoose';

const workspaceMemberSchema = new mongoose.Schema(
  {
    workspace: {
      type: mongoose.Schema.Types.ObjectId,
      ref: 'Workspace',
      required: true,
      index: true,
    },
    user: {
      type: mongoose.Schema.Types.ObjectId,
      ref: 'User',
      required: true,
      index: true,
    },
    role: {
      type: String,
      enum: ['creator', 'reviewer', 'admin'],
      default: 'creator',
      required: true,
    },
    invitedBy: {
      type: mongoose.Schema.Types.ObjectId,
      ref: 'User',
      default: null,
    },
    status: {
      type: String,
      enum: ['active', 'invited', 'suspended'],
      default: 'active',
    },
  },
  {
    timestamps: true,
  }
);

// Compound index to ensure a user is in a workspace only once
workspaceMemberSchema.index({ workspace: 1, user: 1 }, { unique: true });

export const WorkspaceMember = mongoose.model('WorkspaceMember', workspaceMemberSchema);
