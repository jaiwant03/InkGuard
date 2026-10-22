import mongoose from 'mongoose';

const workspaceSchema = new mongoose.Schema(
  {
    name: {
      type: String,
      required: [true, 'Workspace name is required'],
      trim: true,
      maxlength: [100, 'Workspace name cannot exceed 100 characters'],
    },
    slug: {
      type: String,
      required: [true, 'Workspace slug is required'],
      unique: true,
      lowercase: true,
      trim: true,
    },
    description: {
      type: String,
      default: '',
      maxlength: [500, 'Description cannot exceed 500 characters'],
    },
    owner: {
      type: mongoose.Schema.Types.ObjectId,
      ref: 'User',
      required: true,
    },
    logoUrl: {
      type: String,
      default: '',
    },
    industry: {
      type: String,
      default: 'Technology & SaaS',
    },
    isDefaultDemo: {
      type: Boolean,
      default: false,
    },
  },
  {
    timestamps: true,
  }
);

export const Workspace = mongoose.model('Workspace', workspaceSchema);
