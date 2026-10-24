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

// DELETE /api/audit - Clear all audit trail logs for the workspace
router.delete('/', async (req, res, next) => {
  try {
    const result = await AuditEvent.deleteMany({ workspace: req.workspace._id });
    return res.status(200).json({
      success: true,
      message: `Successfully cleared ${result.deletedCount} audit records.`,
      deletedCount: result.deletedCount,
    });
  } catch (error) {
    next(error);
  }
});

// DELETE /api/audit/:id - Delete a specific audit record
router.delete('/:id', async (req, res, next) => {
  try {
    const event = await AuditEvent.findOneAndDelete({
      _id: req.params.id,
      workspace: req.workspace._id,
    });

    if (!event) {
      return res.status(404).json({ success: false, message: 'Audit record not found.' });
    }

    return res.status(200).json({
      success: true,
      message: 'Audit record deleted.',
    });
  } catch (error) {
    next(error);
  }
});

export default router;
