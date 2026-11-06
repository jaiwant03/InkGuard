import express from 'express';
import { Workspace } from '../models/Workspace.js';
import { WorkspaceMember } from '../models/WorkspaceMember.js';
import { User } from '../models/User.js';
import { BrandProfile } from '../models/BrandProfile.js';
import { authenticate } from '../middleware/auth.js';
import { resolveWorkspace, requireRole } from '../middleware/workspace.js';
import { logAuditEvent } from '../services/auditService.js';

const router = express.Router();

router.use(authenticate);

// GET /api/workspaces - List all workspaces user is a member of
router.get('/', async (req, res, next) => {
  try {
    const memberships = await WorkspaceMember.find({ user: req.user._id, status: 'active' })
      .populate('workspace')
      .sort({ createdAt: -1 });

    const workspaces = memberships
      .filter((m) => m.workspace)
      .map((m) => ({
        ...m.workspace.toObject(),
        role: m.role,
        isActive: req.user.activeWorkspaceId && req.user.activeWorkspaceId.toString() === m.workspace._id.toString(),
      }));

    return res.status(200).json({
      success: true,
      data: workspaces,
    });
  } catch (error) {
    next(error);
  }
});

// POST /api/workspaces - Create a new workspace
router.post('/', async (req, res, next) => {
  try {
    const { name, description, industry } = req.body;
    if (!name || !name.trim()) {
      return res.status(400).json({ success: false, message: 'Workspace name is required.' });
    }

    const slugBase = name.toLowerCase().replace(/[^a-z0-9]/g, '-').replace(/-+/g, '-').slice(0, 40);
    const slug = `${slugBase}-${Date.now().toString(36)}`;

    const workspace = await Workspace.create({
      name: name.trim(),
      slug,
      description: description || '',
      industry: industry || 'Technology & SaaS',
      owner: req.user._id,
    });

    const membership = await WorkspaceMember.create({
      workspace: workspace._id,
      user: req.user._id,
      role: 'admin',
    });

    // Create default brand profile
    await BrandProfile.create({
      workspace: workspace._id,
      brandName: workspace.name,
      tagline: 'Create with confidence. Publish with consistency.',
      description: 'Official brand guidelines and content governance standard.',
    });

    req.user.activeWorkspaceId = workspace._id;
    await req.user.save();

    await logAuditEvent({
      workspaceId: workspace._id,
      actor: req.user,
      action: 'WORKSPACE_CREATED',
      entityType: 'Workspace',
      entityId: workspace._id,
      details: { name: workspace.name },
      req,
    });

    return res.status(201).json({
      success: true,
      message: 'Workspace created successfully.',
      data: {
        ...workspace.toObject(),
        role: membership.role,
      },
    });
  } catch (error) {
    next(error);
  }
});

// POST /api/workspaces/switch/:workspaceId - Switch active workspace
router.post('/switch/:workspaceId', async (req, res, next) => {
  try {
    const { workspaceId } = req.params;
    const membership = await WorkspaceMember.findOne({
      workspace: workspaceId,
      user: req.user._id,
      status: 'active',
    }).populate('workspace');

    if (!membership) {
      return res.status(403).json({ success: false, message: 'You are not a member of this workspace.' });
    }

    req.user.activeWorkspaceId = membership.workspace._id;
    await req.user.save();

    return res.status(200).json({
      success: true,
      message: 'Switched workspace.',
      data: {
        workspace: membership.workspace,
        role: membership.role,
      },
    });
  } catch (error) {
    next(error);
  }
});

// The following endpoints resolve the active workspace
router.use(resolveWorkspace);

// GET /api/workspaces/current
router.get('/current', async (req, res) => {
  return res.status(200).json({
    success: true,
    data: {
      ...req.workspace.toObject(),
      userRole: req.userRole,
    },
  });
});

// PUT /api/workspaces/current - Update workspace settings (Admin only)
router.put('/current', requireRole(['admin']), async (req, res, next) => {
  try {
    const { name, description, industry } = req.body;
    if (name) req.workspace.name = name.trim();
    if (description !== undefined) req.workspace.description = description.trim();
    if (industry) req.workspace.industry = industry;

    await req.workspace.save();

    await logAuditEvent({
      workspaceId: req.workspace._id,
      actor: req.user,
      action: 'WORKSPACE_UPDATED',
      entityType: 'Workspace',
      entityId: req.workspace._id,
      details: { name: req.workspace.name },
      req,
    });

    return res.status(200).json({
      success: true,
      message: 'Workspace settings updated.',
      data: req.workspace,
    });
  } catch (error) {
    next(error);
  }
});

// GET /api/workspaces/members - List members
router.get('/members', async (req, res, next) => {
  try {
    const members = await WorkspaceMember.find({ workspace: req.workspace._id })
      .populate('user', 'name email avatar')
      .populate('invitedBy', 'name email')
      .sort({ createdAt: 1 });

    return res.status(200).json({
      success: true,
      data: members,
    });
  } catch (error) {
    next(error);
  }
});

// POST /api/workspaces/members - Add or invite member (Admin only)
router.post('/members', requireRole(['admin']), async (req, res, next) => {
  try {
    const { email, role = 'creator', name } = req.body;
    if (!email) {
      return res.status(400).json({ success: false, message: 'Email is required.' });
    }

    if (!['creator', 'reviewer', 'admin'].includes(role)) {
      return res.status(400).json({ success: false, message: 'Invalid role specified.' });
    }

    let user = await User.findOne({ email: email.toLowerCase().trim() });
    if (!user) {
      // Create user placeholder with random password
      user = await User.create({
        name: name || email.split('@')[0],
        email: email.toLowerCase().trim(),
        password: `TempPass_${Math.random().toString(36).slice(2, 10)}!1A`,
      });
    }

    // Check existing membership
    const existing = await WorkspaceMember.findOne({ workspace: req.workspace._id, user: user._id });
    if (existing) {
      return res.status(409).json({ success: false, message: 'User is already a member of this workspace.' });
    }

    const membership = await WorkspaceMember.create({
      workspace: req.workspace._id,
      user: user._id,
      role,
      invitedBy: req.user._id,
    });

    await membership.populate('user', 'name email avatar');

    await logAuditEvent({
      workspaceId: req.workspace._id,
      actor: req.user,
      action: 'MEMBER_ADDED',
      entityType: 'Member',
      entityId: membership._id,
      details: { email: user.email, role },
      req,
    });

    return res.status(201).json({
      success: true,
      message: `Added ${user.name} as ${role}.`,
      data: membership,
    });
  } catch (error) {
    next(error);
  }
});

// PATCH /api/workspaces/members/:memberId - Update member role (Admin only)
router.patch('/members/:memberId', requireRole(['admin']), async (req, res, next) => {
  try {
    const { role } = req.body;
    if (!['creator', 'reviewer', 'admin'].includes(role)) {
      return res.status(400).json({ success: false, message: 'Invalid role.' });
    }

    const membership = await WorkspaceMember.findOne({
      _id: req.params.memberId,
      workspace: req.workspace._id,
    }).populate('user', 'name email');

    if (!membership) {
      return res.status(404).json({ success: false, message: 'Member not found.' });
    }

    // Prevent removing the workspace owner's admin role
    if (req.workspace.owner.toString() === membership.user._id.toString() && role !== 'admin') {
      return res.status(400).json({ success: false, message: 'Cannot demote the workspace owner.' });
    }

    membership.role = role;
    await membership.save();

    await logAuditEvent({
      workspaceId: req.workspace._id,
      actor: req.user,
      action: 'MEMBER_ROLE_UPDATED',
      entityType: 'Member',
      entityId: membership._id,
      details: { user: membership.user.name, newRole: role },
      req,
    });

    return res.status(200).json({
      success: true,
      message: `Updated role for ${membership.user.name} to ${role}.`,
      data: membership,
    });
  } catch (error) {
    next(error);
  }
});

// DELETE /api/workspaces/members/:memberId - Remove member (Admin only)
router.delete('/members/:memberId', requireRole(['admin']), async (req, res, next) => {
  try {
    const membership = await WorkspaceMember.findOne({
      _id: req.params.memberId,
      workspace: req.workspace._id,
    });

    if (!membership) {
      return res.status(404).json({ success: false, message: 'Member not found.' });
    }

    if (req.workspace.owner.toString() === membership.user.toString()) {
      return res.status(400).json({ success: false, message: 'Cannot remove the workspace owner.' });
    }

    await WorkspaceMember.deleteOne({ _id: membership._id });

    await logAuditEvent({
      workspaceId: req.workspace._id,
      actor: req.user,
      action: 'MEMBER_REMOVED',
      entityType: 'Member',
      entityId: membership._id,
      details: { memberId: membership._id },
      req,
    });

    return res.status(200).json({
      success: true,
      message: 'Member removed from workspace.',
    });
  } catch (error) {
    next(error);
  }
});

export default router;
