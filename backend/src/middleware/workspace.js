import mongoose from 'mongoose';
import { Workspace } from '../models/Workspace.js';
import { WorkspaceMember } from '../models/WorkspaceMember.js';

export async function resolveWorkspace(req, res, next) {
  try {
    let workspaceId = req.headers['x-workspace-id'] || req.params.workspaceId || req.query.workspaceId;

    if (!workspaceId && req.user && req.user.activeWorkspaceId) {
      workspaceId = req.user.activeWorkspaceId;
    }

    if (!workspaceId) {
      // Find the first workspace this user is a member of
      const membership = await WorkspaceMember.findOne({ user: req.user._id, status: 'active' }).populate('workspace');
      if (membership && membership.workspace) {
        req.workspace = membership.workspace;
        req.membership = membership;
        req.userRole = membership.role;
        return next();
      }

      return res.status(400).json({
        success: false,
        message: 'No active workspace found for this user. Please select or create a workspace.',
      });
    }

    if (!mongoose.Types.ObjectId.isValid(workspaceId)) {
      return res.status(400).json({
        success: false,
        message: 'Invalid workspace identifier.',
      });
    }

    const workspace = await Workspace.findById(workspaceId);
    if (!workspace) {
      return res.status(404).json({
        success: false,
        message: 'Workspace not found.',
      });
    }

    // Check membership
    const membership = await WorkspaceMember.findOne({
      workspace: workspace._id,
      user: req.user._id,
      status: 'active',
    });

    if (!membership && req.user.systemRole !== 'superadmin') {
      return res.status(403).json({
        success: false,
        message: 'You are not a member of this workspace.',
      });
    }

    req.workspace = workspace;
    req.membership = membership;
    req.userRole = membership ? membership.role : 'admin';
    next();
  } catch (error) {
    next(error);
  }
}

export function requireRole(allowedRoles = []) {
  return (req, res, next) => {
    if (req.user && req.user.systemRole === 'superadmin') {
      return next();
    }

    if (!req.userRole || !allowedRoles.includes(req.userRole)) {
      return res.status(403).json({
        success: false,
        message: `Action restricted. Required role(s): ${allowedRoles.join(', ')}. Your role: ${req.userRole || 'None'}`,
      });
    }
    next();
  };
}
