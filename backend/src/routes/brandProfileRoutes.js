import express from 'express';
import { BrandProfile } from '../models/BrandProfile.js';
import { authenticate } from '../middleware/auth.js';
import { resolveWorkspace, requireRole } from '../middleware/workspace.js';
import { logAuditEvent } from '../services/auditService.js';

const router = express.Router();

router.use(authenticate, resolveWorkspace);

// GET /api/brand-profile
router.get('/', async (req, res, next) => {
  try {
    let profile = await BrandProfile.findOne({ workspace: req.workspace._id });
    if (!profile) {
      profile = await BrandProfile.create({
        workspace: req.workspace._id,
        brandName: req.workspace.name,
        tagline: 'Create with confidence. Publish with consistency.',
        description: 'Official brand guidelines and content governance standard.',
      });
    }

    return res.status(200).json({
      success: true,
      data: profile,
    });
  } catch (error) {
    next(error);
  }
});

// PUT /api/brand-profile - Update brand profile (Admin & Reviewer)
router.put('/', requireRole(['admin', 'reviewer']), async (req, res, next) => {
  try {
    let profile = await BrandProfile.findOne({ workspace: req.workspace._id });
    if (!profile) {
      profile = new BrandProfile({ workspace: req.workspace._id });
    }

    const {
      brandName,
      tagline,
      description,
      preferredTone,
      targetAudience,
      approvedMessaging,
      preferredTerminology,
      prohibitedTerminology,
      brandColors,
      typography,
      primaryLogoUrl,
    } = req.body;

    if (brandName) profile.brandName = brandName.trim();
    if (tagline !== undefined) profile.tagline = tagline.trim();
    if (description !== undefined) profile.description = description.trim();
    if (preferredTone !== undefined) profile.preferredTone = preferredTone.trim();
    if (targetAudience !== undefined) profile.targetAudience = targetAudience.trim();
    if (Array.isArray(approvedMessaging)) profile.approvedMessaging = approvedMessaging;
    if (Array.isArray(preferredTerminology)) profile.preferredTerminology = preferredTerminology;
    if (Array.isArray(prohibitedTerminology)) profile.prohibitedTerminology = prohibitedTerminology;
    if (Array.isArray(brandColors)) profile.brandColors = brandColors;
    if (Array.isArray(typography)) profile.typography = typography;
    if (primaryLogoUrl !== undefined) profile.primaryLogoUrl = primaryLogoUrl;

    profile.updatedBy = req.user._id;
    await profile.save();

    await logAuditEvent({
      workspaceId: req.workspace._id,
      actor: req.user,
      action: 'BRAND_PROFILE_UPDATED',
      entityType: 'BrandRule',
      entityId: profile._id,
      details: { brandName: profile.brandName },
      req,
    });

    return res.status(200).json({
      success: true,
      message: 'Brand profile updated successfully.',
      data: profile,
    });
  } catch (error) {
    next(error);
  }
});

export default router;
