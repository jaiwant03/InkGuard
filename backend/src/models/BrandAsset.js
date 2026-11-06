import mongoose from 'mongoose';

const brandAssetSchema = new mongoose.Schema(
  {
    workspace: {
      type: mongoose.Schema.Types.ObjectId,
      ref: 'Workspace',
      required: true,
      index: true,
    },
    name: {
      type: String,
      required: [true, 'Asset name is required'],
      trim: true,
      maxlength: [120, 'Name cannot exceed 120 characters'],
    },
    category: {
      type: String,
      enum: ['Logos', 'Brand images', 'Approved banners', 'Product images', 'Icons & Badges', 'Other visual assets'],
      default: 'Logos',
      required: true,
    },
    description: {
      type: String,
      default: '',
    },
    fileUrl: {
      type: String,
      required: [true, 'File URL is required'],
    },
    fileName: {
      type: String,
      required: true,
    },
    fileType: {
      type: String,
      required: true,
    },
    fileSize: {
      type: Number,
      required: true,
    },
    approvalStatus: {
      type: String,
      enum: ['Approved', 'Pending Review', 'Archived'],
      default: 'Approved',
    },
    usageNotes: {
      type: String,
      default: 'Use exclusively on white or dark surfaces with standard minimum clearance padding.',
    },
    tags: {
      type: [String],
      default: [],
    },
    uploadedBy: {
      type: mongoose.Schema.Types.ObjectId,
      ref: 'User',
      required: true,
    },
  },
  {
    timestamps: true,
  }
);

export const BrandAsset = mongoose.model('BrandAsset', brandAssetSchema);
