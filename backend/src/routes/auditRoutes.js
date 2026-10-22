import express from 'express';
import { AuditEvent } from '../models/AuditEvent.js';
import { authenticate } from '../middleware/auth.js';
import { resolveWorkspace } from '../middleware/workspace.js';

const router = express.Router();

router.use(authenticate, resolveWorkspace);

// GET /api/audit - List audit trail logs
router.get('/', async (req, res, next) => {
  try {
    const { action, entityType, limit = 50 } = req.query;
    const query = { workspace: req.workspace._id };

    if (action) query.action = action;
    if (entityType) query.entityType = entityType;

    const events = await AuditEvent.find(query)
      .sort({ createdAt: -1 })
      .limit(parseInt(limit, 10))
      .populate('actor', 'name email avatar');

    return res.status(200).json({
      success: true,
      data: events,
    });
  } catch (error) {
    next(error);
  }
});

export default router;
