import express from 'express';
import multer from 'multer';
import path from 'path';
import fs from 'fs';
import { BrandAsset } from '../models/BrandAsset.js';
import { authenticate } from '../middleware/auth.js';
import { resolveWorkspace, requireRole } from '../middleware/workspace.js';
import { logAuditEvent } from '../services/auditService.js';

const router = express.Router();

// Ensure upload directory exists
const uploadDir = path.resolve('uploads');
if (!fs.existsSync(uploadDir)) {
  fs.mkdirSync(uploadDir, { recursive: true });
}

// Multer storage configuration
const storage = multer.diskStorage({
  destination: (req, file, cb) => {
    cb(null, uploadDir);
  },
  filename: (req, file, cb) => {
    const ext = path.extname(file.originalname).toLowerCase();
    const cleanName = path.basename(file.originalname, ext).replace(/[^a-zA-Z0-9_-]/g, '_');
    const uniqueSuffix = `${Date.now()}-${Math.round(Math.random() * 1e9)}`;
    cb(null, `${cleanName}-${uniqueSuffix}${ext}`);
  },
});

const allowedMimeTypes = ['image/jpeg', 'image/png', 'image/webp', 'image/svg+xml', 'image/gif'];

const upload = multer({
  storage,
  limits: { fileSize: 5 * 1024 * 1024 }, // 5 MB max
  fileFilter: (req, file, cb) => {
    if (allowedMimeTypes.includes(file.mimetype)) {
      cb(null, true);
    } else {
      cb(new Error('Invalid file format. Only JPEG, PNG, WebP, SVG, and GIF images are permitted.'));
    }
  },
});

router.use(authenticate, resolveWorkspace);

// GET /api/brand-assets - List assets
router.get('/', async (req, res, next) => {
  try {
    const { category, approvalStatus, search } = req.query;
    const query = { workspace: req.workspace._id };

    if (category) query.category = category;
    if (approvalStatus) query.approvalStatus = approvalStatus;
    if (search && search.trim()) {
      query.$or = [
        { name: { $regex: search.trim(), $options: 'i' } },
        { description: { $regex: search.trim(), $options: 'i' } },
        { tags: { $regex: search.trim(), $options: 'i' } },
      ];
    }

    const assets = await BrandAsset.find(query).sort({ createdAt: -1 }).populate('uploadedBy', 'name email');

    return res.status(200).json({
      success: true,
      data: assets,
      meta: {
        total: assets.length,
        approvedCount: assets.filter((a) => a.approvalStatus === 'Approved').length,
      },
    });
  } catch (error) {
    next(error);
  }
});

// POST /api/brand-assets - Upload asset (Admin and Reviewer)
router.post('/', requireRole(['admin', 'reviewer']), upload.single('file'), async (req, res, next) => {
  try {
    if (!req.file) {
      return res.status(400).json({ success: false, message: 'Please select an image file to upload.' });
    }

    const { name, category, description, usageNotes, approvalStatus } = req.body;
    if (!name || !name.trim()) {
      // Clean up uploaded file if validation fails
      fs.unlinkSync(req.file.path);
      return res.status(400).json({ success: false, message: 'Asset name is required.' });
    }

    const fileUrl = `/uploads/${req.file.filename}`;

    const asset = await BrandAsset.create({
      workspace: req.workspace._id,
      name: name.trim(),
      category: category || 'Logos',
      description: description || '',
      fileUrl,
      fileName: req.file.filename,
      fileType: req.file.mimetype,
      fileSize: req.file.size,
      approvalStatus: approvalStatus || 'Approved',
      usageNotes: usageNotes || 'Follow clear space guidelines and do not distort.',
      uploadedBy: req.user._id,
    });

    await asset.populate('uploadedBy', 'name email');

    await logAuditEvent({
      workspaceId: req.workspace._id,
      actor: req.user,
      action: 'BRAND_ASSET_UPLOADED',
      entityType: 'BrandAsset',
      entityId: asset._id,
      details: { name: asset.name, category: asset.category },
      req,
    });

    return res.status(201).json({
      success: true,
      message: 'Brand asset uploaded successfully.',
      data: asset,
    });
  } catch (error) {
    if (req.file && fs.existsSync(req.file.path)) {
      fs.unlinkSync(req.file.path);
    }
    next(error);
  }
});

// PATCH /api/brand-assets/:id/status - Update approval status
router.patch('/:id/status', requireRole(['admin', 'reviewer']), async (req, res, next) => {
  try {
    const { approvalStatus } = req.body;
    if (!['Approved', 'Pending Review', 'Archived'].includes(approvalStatus)) {
      return res.status(400).json({ success: false, message: 'Invalid approval status.' });
    }

    const asset = await BrandAsset.findOne({ _id: req.params.id, workspace: req.workspace._id });
    if (!asset) {
      return res.status(404).json({ success: false, message: 'Brand asset not found.' });
    }

    asset.approvalStatus = approvalStatus;
    await asset.save();

    await logAuditEvent({
      workspaceId: req.workspace._id,
      actor: req.user,
      action: 'BRAND_ASSET_STATUS_UPDATED',
      entityType: 'BrandAsset',
      entityId: asset._id,
      details: { name: asset.name, approvalStatus },
      req,
    });

    return res.status(200).json({
      success: true,
      message: `Asset status updated to ${approvalStatus}.`,
      data: asset,
    });
  } catch (error) {
    next(error);
  }
});

// DELETE /api/brand-assets/:id - Delete asset (Admin only)
router.delete('/:id', requireRole(['admin']), async (req, res, next) => {
  try {
    const asset = await BrandAsset.findOne({ _id: req.params.id, workspace: req.workspace._id });
    if (!asset) {
      return res.status(404).json({ success: false, message: 'Brand asset not found.' });
    }

    // Try deleting local file
    const filePath = path.resolve('uploads', asset.fileName);
    if (fs.existsSync(filePath)) {
      fs.unlinkSync(filePath);
    }

    await BrandAsset.deleteOne({ _id: asset._id });

    await logAuditEvent({
      workspaceId: req.workspace._id,
      actor: req.user,
      action: 'BRAND_ASSET_DELETED',
      entityType: 'BrandAsset',
      entityId: asset._id,
      details: { name: asset.name },
      req,
    });

    return res.status(200).json({
      success: true,
      message: 'Brand asset deleted.',
    });
  } catch (error) {
    next(error);
  }
});

export default router;
