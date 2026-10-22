import express from 'express';
import { ApprovedFact } from '../models/ApprovedFact.js';
import { authenticate } from '../middleware/auth.js';
import { resolveWorkspace, requireRole } from '../middleware/workspace.js';
import { approvedFactSchema } from '../validators/index.js';
import { logAuditEvent } from '../services/auditService.js';

const router = express.Router();

router.use(authenticate, resolveWorkspace);

// GET /api/approved-facts - List facts with category, status, search
router.get('/', async (req, res, next) => {
  try {
    const { category, status, search, sortBy = 'createdAt', sortOrder = 'desc' } = req.query;

    const query = { workspace: req.workspace._id };

    if (category) {
      query.category = category;
    }

    if (status) {
      query.status = status;
    }

    if (search && search.trim()) {
      const term = search.trim();
      query.$or = [
        { factText: { $regex: term, $options: 'i' } },
        { sourceName: { $regex: term, $options: 'i' } },
        { category: { $regex: term, $options: 'i' } },
      ];
    }

    const sortOption = {};
    sortOption[sortBy] = sortOrder === 'asc' ? 1 : -1;

    const facts = await ApprovedFact.find(query).sort(sortOption).populate('createdBy', 'name email');

    // Dynamically flag expired facts if past expiryDate
    const now = new Date();
    const processedFacts = facts.map((fact) => {
      const obj = fact.toObject();
      if (obj.status === 'active' && obj.expiryDate && new Date(obj.expiryDate) < now) {
        obj.isAutoExpired = true;
      }
      return obj;
    });

    return res.status(200).json({
      success: true,
      data: processedFacts,
      meta: {
        total: facts.length,
        activeCount: facts.filter((f) => f.status === 'active' && (!f.expiryDate || new Date(f.expiryDate) >= now)).length,
        expiredCount: facts.filter((f) => f.status === 'expired' || (f.expiryDate && new Date(f.expiryDate) < now)).length,
      },
    });
  } catch (error) {
    next(error);
  }
});

// GET /api/approved-facts/:id
router.get('/:id', async (req, res, next) => {
  try {
    const fact = await ApprovedFact.findOne({ _id: req.params.id, workspace: req.workspace._id }).populate(
      'createdBy',
      'name email'
    );

    if (!fact) {
      return res.status(404).json({ success: false, message: 'Approved fact not found.' });
    }

    return res.status(200).json({ success: true, data: fact });
  } catch (error) {
    next(error);
  }
});

// POST /api/approved-facts - Create new fact (Admin and Reviewer)
router.post('/', requireRole(['admin', 'reviewer']), async (req, res, next) => {
  try {
    const validated = approvedFactSchema.parse(req.body);

    const fact = await ApprovedFact.create({
      ...validated,
      workspace: req.workspace._id,
      createdBy: req.user._id,
    });

    await fact.populate('createdBy', 'name email');

    await logAuditEvent({
      workspaceId: req.workspace._id,
      actor: req.user,
      action: 'APPROVED_FACT_CREATED',
      entityType: 'ApprovedFact',
      entityId: fact._id,
      details: { factText: fact.factText.slice(0, 50), sourceName: fact.sourceName },
      req,
    });

    return res.status(201).json({
      success: true,
      message: 'Approved fact added successfully.',
      data: fact,
    });
  } catch (error) {
    next(error);
  }
});

// PUT /api/approved-facts/:id - Update fact (Admin and Reviewer)
router.put('/:id', requireRole(['admin', 'reviewer']), async (req, res, next) => {
  try {
    const validated = approvedFactSchema.parse(req.body);

    const fact = await ApprovedFact.findOne({ _id: req.params.id, workspace: req.workspace._id });
    if (!fact) {
      return res.status(404).json({ success: false, message: 'Approved fact not found.' });
    }

    Object.assign(fact, validated);
    await fact.save();
    await fact.populate('createdBy', 'name email');

    await logAuditEvent({
      workspaceId: req.workspace._id,
      actor: req.user,
      action: 'APPROVED_FACT_UPDATED',
      entityType: 'ApprovedFact',
      entityId: fact._id,
      details: { factText: fact.factText.slice(0, 50) },
      req,
    });

    return res.status(200).json({
      success: true,
      message: 'Approved fact updated successfully.',
      data: fact,
    });
  } catch (error) {
    next(error);
  }
});

// DELETE /api/approved-facts/:id - Delete fact (Admin only)
router.delete('/:id', requireRole(['admin']), async (req, res, next) => {
  try {
    const fact = await ApprovedFact.findOne({ _id: req.params.id, workspace: req.workspace._id });
    if (!fact) {
      return res.status(404).json({ success: false, message: 'Approved fact not found.' });
    }

    await ApprovedFact.deleteOne({ _id: fact._id });

    await logAuditEvent({
      workspaceId: req.workspace._id,
      actor: req.user,
      action: 'APPROVED_FACT_DELETED',
      entityType: 'ApprovedFact',
      entityId: fact._id,
      details: { factText: fact.factText.slice(0, 50) },
      req,
    });

    return res.status(200).json({
      success: true,
      message: 'Approved fact deleted.',
    });
  } catch (error) {
    next(error);
  }
});

export default router;
