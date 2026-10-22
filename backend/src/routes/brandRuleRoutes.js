import express from 'express';
import { BrandRule } from '../models/BrandRule.js';
import { authenticate } from '../middleware/auth.js';
import { resolveWorkspace, requireRole } from '../middleware/workspace.js';
import { brandRuleSchema } from '../validators/index.js';
import { logAuditEvent } from '../services/auditService.js';

const router = express.Router();

router.use(authenticate, resolveWorkspace);

// GET /api/brand-rules - List rules with search, category, active filter, sort
router.get('/', async (req, res, next) => {
  try {
    const { search, category, severity, isActive, sortBy = 'createdAt', sortOrder = 'desc' } = req.query;

    const query = { workspace: req.workspace._id };

    if (category) {
      query.category = category;
    }

    if (severity) {
      query.severity = severity;
    }

    if (isActive !== undefined && isActive !== '') {
      query.isActive = isActive === 'true';
    }

    if (search && search.trim()) {
      const term = search.trim();
      query.$or = [
        { title: { $regex: term, $options: 'i' } },
        { description: { $regex: term, $options: 'i' } },
        { preferredWording: { $regex: term, $options: 'i' } },
        { prohibitedPhrases: { $regex: term, $options: 'i' } },
      ];
    }

    const sortOption = {};
    sortOption[sortBy] = sortOrder === 'asc' ? 1 : -1;

    const rules = await BrandRule.find(query).sort(sortOption).populate('createdBy', 'name email');

    return res.status(200).json({
      success: true,
      data: rules,
      meta: {
        total: rules.length,
        activeCount: rules.filter((r) => r.isActive).length,
      },
    });
  } catch (error) {
    next(error);
  }
});

// GET /api/brand-rules/:id
router.get('/:id', async (req, res, next) => {
  try {
    const rule = await BrandRule.findOne({ _id: req.params.id, workspace: req.workspace._id }).populate(
      'createdBy',
      'name email'
    );

    if (!rule) {
      return res.status(404).json({ success: false, message: 'Brand rule not found.' });
    }

    return res.status(200).json({ success: true, data: rule });
  } catch (error) {
    next(error);
  }
});

// POST /api/brand-rules - Create new rule (Admin and Reviewer)
router.post('/', requireRole(['admin', 'reviewer']), async (req, res, next) => {
  try {
    const validated = brandRuleSchema.parse(req.body);

    // Potential conflict check: warning if a prohibited phrase is in another rule's required phrases
    let conflictWarning = null;
    if (validated.prohibitedPhrases && validated.prohibitedPhrases.length > 0) {
      const existingRules = await BrandRule.find({
        workspace: req.workspace._id,
        isActive: true,
        requiredPhrases: { $in: validated.prohibitedPhrases },
      });
      if (existingRules.length > 0) {
        conflictWarning = `Caution: The prohibited phrase is currently marked as required in rule "${existingRules[0].title}".`;
      }
    }

    const rule = await BrandRule.create({
      ...validated,
      workspace: req.workspace._id,
      createdBy: req.user._id,
    });

    await rule.populate('createdBy', 'name email');

    await logAuditEvent({
      workspaceId: req.workspace._id,
      actor: req.user,
      action: 'BRAND_RULE_CREATED',
      entityType: 'BrandRule',
      entityId: rule._id,
      details: { title: rule.title, category: rule.category, severity: rule.severity },
      req,
    });

    return res.status(201).json({
      success: true,
      message: 'Brand rule created successfully.',
      data: rule,
      conflictWarning,
    });
  } catch (error) {
    next(error);
  }
});

// PUT /api/brand-rules/:id - Update rule (Admin and Reviewer)
router.put('/:id', requireRole(['admin', 'reviewer']), async (req, res, next) => {
  try {
    const validated = brandRuleSchema.parse(req.body);

    const rule = await BrandRule.findOne({ _id: req.params.id, workspace: req.workspace._id });
    if (!rule) {
      return res.status(404).json({ success: false, message: 'Brand rule not found.' });
    }

    Object.assign(rule, validated);
    rule.updatedBy = req.user._id;
    await rule.save();
    await rule.populate('createdBy', 'name email');

    await logAuditEvent({
      workspaceId: req.workspace._id,
      actor: req.user,
      action: 'BRAND_RULE_UPDATED',
      entityType: 'BrandRule',
      entityId: rule._id,
      details: { title: rule.title },
      req,
    });

    return res.status(200).json({
      success: true,
      message: 'Brand rule updated successfully.',
      data: rule,
    });
  } catch (error) {
    next(error);
  }
});

// PATCH /api/brand-rules/:id/toggle - Toggle active status (Admin and Reviewer)
router.patch('/:id/toggle', requireRole(['admin', 'reviewer']), async (req, res, next) => {
  try {
    const rule = await BrandRule.findOne({ _id: req.params.id, workspace: req.workspace._id });
    if (!rule) {
      return res.status(404).json({ success: false, message: 'Brand rule not found.' });
    }

    rule.isActive = !rule.isActive;
    rule.updatedBy = req.user._id;
    await rule.save();

    await logAuditEvent({
      workspaceId: req.workspace._id,
      actor: req.user,
      action: 'BRAND_RULE_TOGGLED',
      entityType: 'BrandRule',
      entityId: rule._id,
      details: { title: rule.title, isActive: rule.isActive },
      req,
    });

    return res.status(200).json({
      success: true,
      message: `Rule "${rule.title}" is now ${rule.isActive ? 'active' : 'inactive'}.`,
      data: rule,
    });
  } catch (error) {
    next(error);
  }
});

// DELETE /api/brand-rules/:id - Delete rule (Admin only)
router.delete('/:id', requireRole(['admin']), async (req, res, next) => {
  try {
    const rule = await BrandRule.findOne({ _id: req.params.id, workspace: req.workspace._id });
    if (!rule) {
      return res.status(404).json({ success: false, message: 'Brand rule not found.' });
    }

    await BrandRule.deleteOne({ _id: rule._id });

    await logAuditEvent({
      workspaceId: req.workspace._id,
      actor: req.user,
      action: 'BRAND_RULE_DELETED',
      entityType: 'BrandRule',
      entityId: rule._id,
      details: { title: rule.title },
      req,
    });

    return res.status(200).json({
      success: true,
      message: 'Brand rule deleted.',
    });
  } catch (error) {
    next(error);
  }
});

export default router;
