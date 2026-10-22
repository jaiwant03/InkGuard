import mongoose from 'mongoose';

const colorSwatchSchema = new mongoose.Schema(
  {
    name: { type: String, required: true },
    hex: { type: String, required: true },
    rgb: { type: String, default: '' },
    role: { type: String, enum: ['Primary', 'Secondary', 'Accent', 'Neutral', 'Background', 'Surface'], default: 'Primary' },
    usage: { type: String, default: '' },
  },
  { _id: true }
);

const typographySchema = new mongoose.Schema(
  {
    role: { type: String, enum: ['Heading', 'Body', 'Monospace', 'Display'], default: 'Heading' },
    family: { type: String, required: true },
    weight: { type: String, default: '400, 600, 700' },
    fallback: { type: String, default: 'sans-serif' },
    usage: { type: String, default: '' },
  },
  { _id: true }
);

const brandProfileSchema = new mongoose.Schema(
  {
    workspace: {
      type: mongoose.Schema.Types.ObjectId,
      ref: 'Workspace',
      required: true,
      unique: true,
      index: true,
    },
    brandName: {
      type: String,
      required: true,
      trim: true,
    },
    tagline: {
      type: String,
      default: '',
    },
    description: {
      type: String,
      default: '',
    },
    preferredTone: {
      type: String,
      default: 'Authoritative yet approachable, concise, empathetic, and forward-looking.',
    },
    targetAudience: {
      type: String,
      default: 'Enterprise leaders, IT and marketing decision-makers, and compliance managers.',
    },
    approvedMessaging: {
      type: [String],
      default: [],
    },
    preferredTerminology: {
      type: [
        {
          term: String,
          preferred: String,
          context: String,
        },
      ],
      default: [],
    },
    prohibitedTerminology: {
      type: [String],
      default: [],
    },
    brandColors: {
      type: [colorSwatchSchema],
      default: [],
    },
    typography: {
      type: [typographySchema],
      default: [],
    },
    primaryLogoUrl: {
      type: String,
      default: '',
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

export const BrandProfile = mongoose.model('BrandProfile', brandProfileSchema);
