import express from 'express';
import jwt from 'jsonwebtoken';
import { User } from '../models/User.js';
import { Workspace } from '../models/Workspace.js';
import { WorkspaceMember } from '../models/WorkspaceMember.js';
import { BrandProfile } from '../models/BrandProfile.js';
import { config } from '../config/env.js';
import { authenticate } from '../middleware/auth.js';
import { authLimiter } from '../middleware/rateLimiter.js';
import { registerSchema, loginSchema } from '../validators/index.js';
import { logAuditEvent } from '../services/auditService.js';

const router = express.Router();

function createToken(userId) {
  return jwt.sign({ id: userId }, config.jwtSecret, { expiresIn: '7d' });
}

function setAuthCookie(res, token, rememberMe = false) {
  const maxAge = rememberMe ? 30 * 24 * 60 * 60 * 1000 : 7 * 24 * 60 * 1000;
  res.cookie('token', token, {
    httpOnly: true,
    secure: config.isProduction,
    sameSite: config.isProduction ? 'none' : 'lax',
    maxAge,
  });
}

// POST /api/auth/register
router.post('/register', authLimiter, async (req, res, next) => {
  try {
    const validated = registerSchema.parse(req.body);

    const existingUser = await User.findOne({ email: validated.email });
    if (existingUser) {
      return res.status(409).json({
        success: false,
        message: 'An account with this email address already exists.',
      });
    }

    const user = await User.create({
      name: validated.name,
      email: validated.email,
      password: validated.password,
    });

    // Create a personalized default workspace for the user
    const workspaceName = validated.workspaceName || `${validated.name}'s Brand Workspace`;
    const slugBase = workspaceName.toLowerCase().replace(/[^a-z0-9]/g, '-').replace(/-+/g, '-').slice(0, 40);
    const slug = `${slugBase}-${Date.now().toString(36)}`;

    const workspace = await Workspace.create({
      name: workspaceName,
      slug,
      description: 'Primary brand governance workspace for content reviews, guidelines, and assets.',
      owner: user._id,
      industry: 'Technology & SaaS',
    });

    // Assign user as Admin of their new workspace
    const membership = await WorkspaceMember.create({
      workspace: workspace._id,
      user: user._id,
      role: 'admin',
    });

    // Create default brand profile
    await BrandProfile.create({
      workspace: workspace._id,
      brandName: workspaceName.replace(' Brand Workspace', ''),
      tagline: 'Create with confidence. Publish with consistency.',
      description: 'Official brand guidelines and content governance standard.',
      preferredTone: 'Authoritative yet approachable, empathetic, and clear.',
      targetAudience: 'Enterprise decision-makers, product leaders, and creators.',
      brandColors: [
        { name: 'Royal Blue', hex: '#2563EB', rgb: '37, 99, 235', role: 'Primary', usage: 'Primary branding, interactive buttons, active links' },
        { name: 'Indigo Accent', hex: '#4F46E5', rgb: '79, 70, 229', role: 'Secondary', usage: 'Gradient highlights and metric badges' },
        { name: 'Slate Gray', hex: '#64748B', rgb: '100, 116, 139', role: 'Neutral', usage: 'Supporting body text, borders and subtle dividers' },
      ],
      typography: [
        { role: 'Heading', family: 'Inter', weight: '600, 700', usage: 'Main page titles and card headings' },
        { role: 'Body', family: 'Inter', weight: '400, 500', usage: 'General reading text and preview documentation' },
      ],
      approvedMessaging: [
        'Enterprise-grade security and governance by design.',
        'Accelerating reliable content publishing with AI assistance.',
      ],
      prohibitedTerminology: ['hack-proof', 'zero-risk', 'foolproof', 'guaranteed ROI'],
    });

    user.activeWorkspaceId = workspace._id;
    await user.save();

    const token = createToken(user._id);
    setAuthCookie(res, token);

    await logAuditEvent({
      workspaceId: workspace._id,
      actor: user,
      action: 'USER_REGISTERED',
      entityType: 'Workspace',
      entityId: workspace._id,
      details: { email: user.email, workspaceName },
      req,
    });

    return res.status(201).json({
      success: true,
      message: 'Account created successfully.',
      data: {
        user,
        workspace,
        role: membership.role,
      },
    });
  } catch (error) {
    next(error);
  }
});

// POST /api/auth/login
router.post('/login', authLimiter, async (req, res, next) => {
  try {
    const validated = loginSchema.parse(req.body);

    const user = await User.findOne({ email: validated.email }).select('+password');
    if (!user) {
      return res.status(401).json({
        success: false,
        message: 'Invalid email address or password.',
      });
    }

    const isMatch = await user.comparePassword(validated.password);
    if (!isMatch) {
      return res.status(401).json({
        success: false,
        message: 'Invalid email address or password.',
      });
    }

    user.lastLoginAt = new Date();
    await user.save();

    // Find active workspace or user's first workspace
    let workspace = null;
    let membership = null;

    if (user.activeWorkspaceId) {
      workspace = await Workspace.findById(user.activeWorkspaceId);
      if (workspace) {
        membership = await WorkspaceMember.findOne({ workspace: workspace._id, user: user._id, status: 'active' });
      }
    }

    if (!workspace || !membership) {
      membership = await WorkspaceMember.findOne({ user: user._id, status: 'active' }).populate('workspace');
      if (membership && membership.workspace) {
        workspace = membership.workspace;
        user.activeWorkspaceId = workspace._id;
        await user.save();
      }
    }

    const token = createToken(user._id);
    setAuthCookie(res, token, validated.rememberMe);

    if (workspace) {
      await logAuditEvent({
        workspaceId: workspace._id,
        actor: user,
        action: 'USER_LOGIN',
        entityType: 'User',
        entityId: user._id,
        details: { ip: req.ip },
        req,
      });
    }

    return res.status(200).json({
      success: true,
      message: 'Signed in successfully.',
      data: {
        token,
        user,
        workspace,
        role: membership ? membership.role : 'admin',
      },
    });
  } catch (error) {
    next(error);
  }
});

// POST /api/auth/logout
router.post('/logout', (req, res) => {
  res.clearCookie('token', {
    httpOnly: true,
    secure: config.isProduction,
    sameSite: config.isProduction ? 'none' : 'lax',
  });
  return res.status(200).json({
    success: true,
    message: 'Signed out successfully.',
  });
});

// GET /api/auth/me
router.get('/me', authenticate, async (req, res, next) => {
  try {
    let workspace = null;
    let membership = null;

    if (req.user.activeWorkspaceId) {
      workspace = await Workspace.findById(req.user.activeWorkspaceId);
      if (workspace) {
        membership = await WorkspaceMember.findOne({ workspace: workspace._id, user: req.user._id, status: 'active' });
      }
    }

    if (!workspace || !membership) {
      membership = await WorkspaceMember.findOne({ user: req.user._id, status: 'active' }).populate('workspace');
      if (membership && membership.workspace) {
        workspace = membership.workspace;
        req.user.activeWorkspaceId = workspace._id;
        await req.user.save();
      }
    }

    return res.status(200).json({
      success: true,
      data: {
        user: req.user,
        workspace,
        role: membership ? membership.role : 'creator',
      },
    });
  } catch (error) {
    next(error);
  }
});

// PUT /api/auth/profile
router.put('/profile', authenticate, async (req, res, next) => {
  try {
    const { name, avatar } = req.body;
    if (name) req.user.name = name.trim();
    if (avatar !== undefined) req.user.avatar = avatar;
    await req.user.save();

    return res.status(200).json({
      success: true,
      message: 'Profile updated successfully.',
      data: { user: req.user },
    });
  } catch (error) {
    next(error);
  }
});

export default router;
