import express from 'express';
import { ContentDraft } from '../models/ContentDraft.js';
import { ContentVersion } from '../models/ContentVersion.js';
import { ReviewRun } from '../models/ReviewRun.js';
import { Finding } from '../models/Finding.js';
import { BrandRule } from '../models/BrandRule.js';
import { ApprovedFact } from '../models/ApprovedFact.js';
import { Comment } from '../models/Comment.js';
import { authenticate } from '../middleware/auth.js';
import { resolveWorkspace, requireRole } from '../middleware/workspace.js';
import { contentDraftSchema, findingActionSchema, approvalActionSchema, commentSchema } from '../validators/index.js';
import { runDeterministicChecks } from '../services/deterministicEngine.js';
import { runAiAssistedChecks } from '../services/aiEngine.js';
import { calculateComplianceScore } from '../services/complianceScorer.js';
import { logAuditEvent } from '../services/auditService.js';

const router = express.Router();

router.use(authenticate, resolveWorkspace);

// GET /api/drafts - List drafts
router.get('/', async (req, res, next) => {
  try {
    const { status, contentType, search, sortBy = 'updatedAt', sortOrder = 'desc' } = req.query;

    const query = { workspace: req.workspace._id };
    if (status) query.status = status;
    if (contentType) query.contentType = contentType;
    if (search && search.trim()) {
      query.$or = [
        { title: { $regex: search.trim(), $options: 'i' } },
        { currentContent: { $regex: search.trim(), $options: 'i' } },
      ];
    }

    const sortOption = {};
    sortOption[sortBy] = sortOrder === 'asc' ? 1 : -1;

    const drafts = await ContentDraft.find(query)
      .sort(sortOption)
      .populate('author', 'name email avatar')
      .populate('reviewer', 'name email avatar')
      .populate('latestReviewRun');

    return res.status(200).json({
      success: true,
      data: drafts,
      meta: {
        total: drafts.length,
        inReviewCount: drafts.filter((d) => d.status === 'In Review').length,
        approvedCount: drafts.filter((d) => d.status === 'Approved').length,
      },
    });
  } catch (error) {
    next(error);
  }
});

// POST /api/drafts - Create draft
router.post('/', async (req, res, next) => {
  try {
    const validated = contentDraftSchema.parse(req.body);

    const draft = await ContentDraft.create({
      workspace: req.workspace._id,
      title: validated.title,
      contentType: validated.contentType,
      currentContent: validated.content,
      originalContent: validated.content,
      currentVersion: 1,
      status: 'Draft',
      author: req.user._id,
    });

    // Create Version 1 snapshot
    await ContentVersion.create({
      draft: draft._id,
      versionNumber: 1,
      title: draft.title,
      content: draft.currentContent,
      changeSummary: 'Initial draft created.',
      createdBy: req.user._id,
    });

    await draft.populate('author', 'name email avatar');

    await logAuditEvent({
      workspaceId: req.workspace._id,
      actor: req.user,
      action: 'DRAFT_CREATED',
      entityType: 'Draft',
      entityId: draft._id,
      details: { title: draft.title, contentType: draft.contentType },
      req,
    });

    return res.status(201).json({
      success: true,
      message: 'Draft created successfully.',
      data: draft,
    });
  } catch (error) {
    next(error);
  }
});

// GET /api/drafts/:id - Get single draft with latest findings and run
router.get('/:id', async (req, res, next) => {
  try {
    const draft = await ContentDraft.findOne({ _id: req.params.id, workspace: req.workspace._id })
      .populate('author', 'name email avatar')
      .populate('reviewer', 'name email avatar')
      .populate('latestReviewRun');

    if (!draft) {
      return res.status(404).json({ success: false, message: 'Draft not found.' });
    }

    let findings = [];
    if (draft.latestReviewRun) {
      findings = await Finding.find({ reviewRun: draft.latestReviewRun._id })
        .populate('ruleRef', 'title description category severity preferredWording')
        .populate('factRef', 'factText sourceName sourceUrl status');
    }

    return res.status(200).json({
      success: true,
      data: {
        draft,
        findings,
      },
    });
  } catch (error) {
    next(error);
  }
});

// PUT /api/drafts/:id - Update draft text or title
router.put('/:id', async (req, res, next) => {
  try {
    const draft = await ContentDraft.findOne({ _id: req.params.id, workspace: req.workspace._id });
    if (!draft) {
      return res.status(404).json({ success: false, message: 'Draft not found.' });
    }

    // Role check: Creators can edit their own draft or Admins/Reviewers can edit
    if (
      req.userRole === 'creator' &&
      draft.author.toString() !== req.user._id.toString() &&
      req.user.systemRole !== 'superadmin'
    ) {
      return res.status(403).json({ success: false, message: 'You are only allowed to edit your own drafts.' });
    }

    const { title, contentType, content, changeSummary } = req.body;
    let contentChanged = false;

    if (title && title.trim()) draft.title = title.trim();
    if (contentType) draft.contentType = contentType;

    if (content !== undefined && content !== draft.currentContent) {
      contentChanged = true;
      draft.currentContent = content;
      draft.currentVersion += 1;

      // Save version
      await ContentVersion.create({
        draft: draft._id,
        versionNumber: draft.currentVersion,
        title: draft.title,
        content: draft.currentContent,
        changeSummary: changeSummary || 'Manual content edits applied.',
        createdBy: req.user._id,
      });
    }

    await draft.save();
    await draft.populate('author', 'name email avatar');

    await logAuditEvent({
      workspaceId: req.workspace._id,
      actor: req.user,
      action: 'DRAFT_UPDATED',
      entityType: 'Draft',
      entityId: draft._id,
      details: { title: draft.title, version: draft.currentVersion, contentChanged },
      req,
    });

    return res.status(200).json({
      success: true,
      message: 'Draft saved successfully.',
      data: draft,
    });
  } catch (error) {
    next(error);
  }
});

// POST /api/drafts/:id/review - Run Brand Audit
router.post('/:id/review', async (req, res, next) => {
  try {
    const draft = await ContentDraft.findOne({ _id: req.params.id, workspace: req.workspace._id });
    if (!draft) {
      return res.status(404).json({ success: false, message: 'Draft not found.' });
    }

    // 1. Fetch active rules and facts
    const activeRules = await BrandRule.find({ workspace: req.workspace._id, isActive: true });
    const approvedFacts = await ApprovedFact.find({ workspace: req.workspace._id });

    // 2. Deterministic checks
    const deterministicFindings = await runDeterministicChecks({
      content: draft.currentContent,
      rules: activeRules,
      facts: approvedFacts,
    });

    // 3. AI-assisted checks (optional)
    const aiResult = await runAiAssistedChecks({
      content: draft.currentContent,
      rules: activeRules,
      facts: approvedFacts,
    });

    // Merge findings without duplicates
    const allFindings = [...deterministicFindings];
    if (aiResult.isAiActive && Array.isArray(aiResult.aiFindings)) {
      aiResult.aiFindings.forEach((aiF) => {
        // Only add if not duplicate textSpan
        const exists = allFindings.some((dF) => dF.textSpan && dF.textSpan === aiF.textSpan);
        if (!exists) {
          allFindings.push(aiF);
        }
      });
    }

    // 4. Calculate compliance score
    const scoreResult = calculateComplianceScore(allFindings);

    // 5. Create ReviewRun record
    const reviewRun = await ReviewRun.create({
      workspace: req.workspace._id,
      draft: draft._id,
      versionNumber: draft.currentVersion,
      contentSnapshot: draft.currentContent,
      complianceScore: scoreResult.score,
      scoreGrade: scoreResult.grade,
      findingsSummary: scoreResult.summary,
      rulesCheckedCount: activeRules.length,
      factsCheckedCount: approvedFacts.length,
      engineType: aiResult.isAiActive ? 'ai-assisted' : 'deterministic',
      aiProvider: aiResult.aiProvider,
      runBy: req.user._id,
    });

    // 6. Save Finding records in MongoDB
    const findingDocs = allFindings.map((f) => ({
      ...f,
      reviewRun: reviewRun._id,
      draft: draft._id,
      workspace: req.workspace._id,
    }));

    const savedFindings = await Finding.insertMany(findingDocs);

    // 7. Update draft with latest score and review run
    draft.latestComplianceScore = scoreResult.score;
    draft.latestReviewRun = reviewRun._id;
    draft.lastReviewedAt = new Date();
    await draft.save();

    await logAuditEvent({
      workspaceId: req.workspace._id,
      actor: req.user,
      action: 'REVIEW_RUN_COMPLETED',
      entityType: 'ReviewRun',
      entityId: reviewRun._id,
      details: {
        score: scoreResult.score,
        grade: scoreResult.grade,
        totalFindings: allFindings.length,
        engine: reviewRun.engineType,
      },
      req,
    });

    const populatedFindings = await Finding.find({ reviewRun: reviewRun._id })
      .populate('ruleRef', 'title description category severity preferredWording')
      .populate('factRef', 'factText sourceName sourceUrl status');

    return res.status(200).json({
      success: true,
      message: 'Brand governance audit completed.',
      data: {
        reviewRun,
        scoreResult,
        findings: populatedFindings,
      },
    });
  } catch (error) {
    next(error);
  }
});

// POST /api/drafts/:id/apply-finding/:findingId - Apply suggested correction
router.post('/:id/apply-finding/:findingId', async (req, res, next) => {
  try {
    const draft = await ContentDraft.findOne({ _id: req.params.id, workspace: req.workspace._id });
    if (!draft) return res.status(404).json({ success: false, message: 'Draft not found.' });

    const finding = await Finding.findOne({ _id: req.params.findingId, draft: draft._id });
    if (!finding) return res.status(404).json({ success: false, message: 'Finding not found.' });

    if (!finding.suggestedCorrection) {
      return res.status(400).json({ success: false, message: 'This finding does not contain an automated text replacement.' });
    }

    let updatedContent = draft.currentContent;
    if (finding.textSpan && updatedContent.includes(finding.textSpan)) {
      updatedContent = updatedContent.replace(finding.textSpan, finding.suggestedCorrection);
    } else {
      // Append correction if missing phrase
      updatedContent = `${updatedContent}\n\n${finding.suggestedCorrection}`;
    }

    draft.currentContent = updatedContent;
    draft.currentVersion += 1;

    // Save version snapshot
    await ContentVersion.create({
      draft: draft._id,
      versionNumber: draft.currentVersion,
      title: draft.title,
      content: draft.currentContent,
      changeSummary: `Applied suggested correction for: "${finding.explanation.slice(0, 70)}"`,
      createdBy: req.user._id,
    });

    await draft.save();

    // Mark finding as applied
    finding.status = 'applied';
    finding.actionTakenBy = req.user._id;
    finding.actionTakenAt = new Date();
    await finding.save();

    // Recompute compliance score
    const findings = await Finding.find({ reviewRun: finding.reviewRun });
    const scoreResult = calculateComplianceScore(findings);

    if (draft.latestReviewRun) {
      await ReviewRun.findByIdAndUpdate(draft.latestReviewRun, {
        complianceScore: scoreResult.score,
        scoreGrade: scoreResult.grade,
        findingsSummary: scoreResult.summary,
      });
      draft.latestComplianceScore = scoreResult.score;
      await draft.save();
    }

    await logAuditEvent({
      workspaceId: req.workspace._id,
      actor: req.user,
      action: 'FINDING_APPLIED',
      entityType: 'Finding',
      entityId: finding._id,
      details: { textSpan: finding.textSpan, suggestion: finding.suggestedCorrection },
      req,
    });

    return res.status(200).json({
      success: true,
      message: 'Correction applied successfully. New draft version created.',
      data: {
        draft,
        finding,
        newScore: scoreResult.score,
      },
    });
  } catch (error) {
    next(error);
  }
});

// PATCH /api/drafts/:id/findings/:findingId/status - Dismiss, resolve, or verify finding
router.patch('/:id/findings/:findingId/status', async (req, res, next) => {
  try {
    const validated = findingActionSchema.parse(req.body);

    const finding = await Finding.findOne({ _id: req.params.findingId, workspace: req.workspace._id });
    if (!finding) return res.status(404).json({ success: false, message: 'Finding not found.' });

    let newStatus = 'open';
    if (validated.action === 'dismiss') {
      newStatus = 'dismissed';
      finding.dismissReason = validated.dismissReason || 'Dismissed by reviewer as permissible context.';
    } else if (validated.action === 'resolve') {
      newStatus = 'resolved';
    }

    finding.status = newStatus;
    finding.actionTakenBy = req.user._id;
    finding.actionTakenAt = new Date();
    await finding.save();

    // Recompute score
    const allFindings = await Finding.find({ reviewRun: finding.reviewRun });
    const scoreResult = calculateComplianceScore(allFindings);

    const draft = await ContentDraft.findById(finding.draft);
    if (draft) {
      draft.latestComplianceScore = scoreResult.score;
      await draft.save();
    }

    await ReviewRun.findByIdAndUpdate(finding.reviewRun, {
      complianceScore: scoreResult.score,
      scoreGrade: scoreResult.grade,
      findingsSummary: scoreResult.summary,
    });

    await logAuditEvent({
      workspaceId: req.workspace._id,
      actor: req.user,
      action: `FINDING_${validated.action.toUpperCase()}`,
      entityType: 'Finding',
      entityId: finding._id,
      details: { action: validated.action, reason: validated.dismissReason },
      req,
    });

    return res.status(200).json({
      success: true,
      message: `Finding marked as ${newStatus}.`,
      data: {
        finding,
        newScore: scoreResult.score,
      },
    });
  } catch (error) {
    next(error);
  }
});

// POST /api/drafts/:id/submit - Submit draft for review (Creator action)
router.post('/:id/submit', async (req, res, next) => {
  try {
    const draft = await ContentDraft.findOne({ _id: req.params.id, workspace: req.workspace._id });
    if (!draft) return res.status(404).json({ success: false, message: 'Draft not found.' });

    draft.status = 'In Review';
    await draft.save();

    await logAuditEvent({
      workspaceId: req.workspace._id,
      actor: req.user,
      action: 'DRAFT_SUBMITTED_FOR_REVIEW',
      entityType: 'Draft',
      entityId: draft._id,
      details: { title: draft.title },
      req,
    });

    return res.status(200).json({
      success: true,
      message: 'Draft submitted for governance review.',
      data: draft,
    });
  } catch (error) {
    next(error);
  }
});

// POST /api/drafts/:id/decision - Approve, Request Changes, or Reject (Reviewer & Admin only)
router.post('/:id/decision', requireRole(['reviewer', 'admin']), async (req, res, next) => {
  try {
    const validated = approvalActionSchema.parse(req.body);

    const draft = await ContentDraft.findOne({ _id: req.params.id, workspace: req.workspace._id });
    if (!draft) return res.status(404).json({ success: false, message: 'Draft not found.' });

    let newStatus = 'In Review';
    let commentType = 'general';

    if (validated.decision === 'approve') {
      newStatus = 'Approved';
      commentType = 'approval_note';
    } else if (validated.decision === 'request_changes') {
      newStatus = 'Changes Requested';
      commentType = 'change_request';
    } else if (validated.decision === 'reject') {
      newStatus = 'Rejected';
      commentType = 'rejection_note';
    }

    draft.status = newStatus;
    draft.reviewer = req.user._id;
    await draft.save();

    // Add decision comment if provided
    if (validated.comment && validated.comment.trim()) {
      await Comment.create({
        draft: draft._id,
        workspace: req.workspace._id,
        author: req.user._id,
        content: validated.comment.trim(),
        type: commentType,
      });
    }

    await logAuditEvent({
      workspaceId: req.workspace._id,
      actor: req.user,
      action: `DRAFT_${validated.decision.toUpperCase()}`,
      entityType: 'Approval',
      entityId: draft._id,
      details: { decision: validated.decision, comment: validated.comment },
      req,
    });

    return res.status(200).json({
      success: true,
      message: `Draft status updated to ${newStatus}.`,
      data: draft,
    });
  } catch (error) {
    next(error);
  }
});

// GET /api/drafts/:id/versions - List versions
router.get('/:id/versions', async (req, res, next) => {
  try {
    const versions = await ContentVersion.find({ draft: req.params.id })
      .sort({ versionNumber: -1 })
      .populate('createdBy', 'name email avatar');

    return res.status(200).json({
      success: true,
      data: versions,
    });
  } catch (error) {
    next(error);
  }
});

// GET /api/drafts/:id/comments - List comments
router.get('/:id/comments', async (req, res, next) => {
  try {
    const comments = await Comment.find({ draft: req.params.id })
      .sort({ createdAt: 1 })
      .populate('author', 'name email avatar');

    return res.status(200).json({
      success: true,
      data: comments,
    });
  } catch (error) {
    next(error);
  }
});

// POST /api/drafts/:id/comments - Add comment
router.post('/:id/comments', async (req, res, next) => {
  try {
    const validated = commentSchema.parse(req.body);

    const comment = await Comment.create({
      draft: req.params.id,
      workspace: req.workspace._id,
      author: req.user._id,
      content: validated.content,
      type: validated.type,
      findingRef: validated.findingRef || null,
    });

    await comment.populate('author', 'name email avatar');

    return res.status(201).json({
      success: true,
      message: 'Comment posted.',
      data: comment,
    });
  } catch (error) {
    next(error);
  }
});

// DELETE /api/drafts/:id - Delete draft (Author or Admin)
router.delete('/:id', async (req, res, next) => {
  try {
    const draft = await ContentDraft.findOne({ _id: req.params.id, workspace: req.workspace._id });
    if (!draft) return res.status(404).json({ success: false, message: 'Draft not found.' });

    if (
      req.userRole === 'creator' &&
      draft.author.toString() !== req.user._id.toString() &&
      req.user.systemRole !== 'superadmin'
    ) {
      return res.status(403).json({ success: false, message: 'You can only delete your own drafts.' });
    }

    await ContentDraft.deleteOne({ _id: draft._id });
    await ContentVersion.deleteMany({ draft: draft._id });
    await Finding.deleteMany({ draft: draft._id });
    await ReviewRun.deleteMany({ draft: draft._id });
    await Comment.deleteMany({ draft: draft._id });

    await logAuditEvent({
      workspaceId: req.workspace._id,
      actor: req.user,
      action: 'DRAFT_DELETED',
      entityType: 'Draft',
      entityId: draft._id,
      details: { title: draft.title },
      req,
    });

    return res.status(200).json({
      success: true,
      message: 'Draft deleted.',
    });
  } catch (error) {
    next(error);
  }
});

export default router;
