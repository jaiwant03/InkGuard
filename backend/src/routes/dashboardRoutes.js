import express from 'express';
import { ReviewRun } from '../models/ReviewRun.js';
import { ContentDraft } from '../models/ContentDraft.js';
import { Finding } from '../models/Finding.js';
import { BrandRule } from '../models/BrandRule.js';
import { BrandProfile } from '../models/BrandProfile.js';
import { ApprovedFact } from '../models/ApprovedFact.js';
import { authenticate } from '../middleware/auth.js';
import { resolveWorkspace } from '../middleware/workspace.js';

const router = express.Router();

router.use(authenticate, resolveWorkspace);

// GET /api/dashboard/metrics
router.get('/metrics', async (req, res, next) => {
  try {
    const workspaceId = req.workspace._id;

    // 1. Total content reviews & average compliance score
    const reviewRuns = await ReviewRun.find({ workspace: workspaceId }).sort({ createdAt: -1 });
    const totalReviews = reviewRuns.length;

    let averageScore = 0;
    if (totalReviews > 0) {
      const sum = reviewRuns.reduce((acc, r) => acc + (r.complianceScore || 0), 0);
      averageScore = Math.round(sum / totalReviews);
    }

    // 2. Open high-risk findings
    const openHighRiskCount = await Finding.countDocuments({
      workspace: workspaceId,
      severity: 'High',
      status: 'open',
    });

    // 3. Pending approvals (Drafts with status 'In Review' or 'Pending Review')
    const pendingApprovalsCount = await ContentDraft.countDocuments({
      workspace: workspaceId,
      status: { $in: ['In Review', 'Pending Review'] },
    });

    // 4. Reviewed this month count
    const now = new Date();
    const startOfMonth = new Date(now.getFullYear(), now.getMonth(), 1);
    const reviewedThisMonthCount = await ReviewRun.countDocuments({
      workspace: workspaceId,
      createdAt: { $gte: startOfMonth },
    });

    // 5. Recent review activity (last 5 review runs)
    const recentReviews = await ReviewRun.find({ workspace: workspaceId })
      .sort({ createdAt: -1 })
      .limit(5)
      .populate('draft', 'title contentType status')
      .populate('runBy', 'name email avatar');

    // 6. Recent documents (last 6 drafts)
    const recentDrafts = await ContentDraft.find({ workspace: workspaceId })
      .sort({ updatedAt: -1 })
      .limit(6)
      .populate('author', 'name email avatar');

    // 7. Issues by category
    const issuesByCategoryAgg = await Finding.aggregate([
      { $match: { workspace: workspaceId, status: { $ne: 'dismissed' } } },
      { $group: { _id: '$category', count: { $sum: 1 } } },
      { $sort: { count: -1 } },
      { $limit: 6 },
    ]);

    const issuesByCategory = issuesByCategoryAgg.map((item) => ({
      category: item._id,
      count: item.count,
    }));

    // 8. Most frequently triggered rules
    const topRulesAgg = await Finding.aggregate([
      { $match: { workspace: workspaceId, ruleRef: { $ne: null } } },
      { $group: { _id: '$ruleRef', count: { $sum: 1 } } },
      { $sort: { count: -1 } },
      { $limit: 5 },
    ]);

    const populatedTopRules = [];
    for (const item of topRulesAgg) {
      const rule = await BrandRule.findById(item._id).select('title category severity');
      if (rule) {
        populatedTopRules.push({
          ruleId: rule._id,
          title: rule.title,
          category: rule.category,
          severity: rule.severity,
          triggerCount: item.count,
        });
      }
    }

    // 9. Compliance trend over time (chronological review runs)
    const complianceTrend = reviewRuns
      .slice(0, 10)
      .reverse()
      .map((r, idx) => ({
        index: idx + 1,
        date: new Date(r.createdAt).toLocaleDateString(undefined, { month: 'short', day: 'numeric' }),
        score: r.complianceScore,
        engine: r.engineType,
      }));

    // Calculate period comparison if at least 2 reviews exist
    let scoreComparison = null;
    if (reviewRuns.length >= 2) {
      const latest = reviewRuns[0].complianceScore || 0;
      const previous = reviewRuns[1].complianceScore || 0;
      const diff = latest - previous;
      scoreComparison = {
        diff,
        direction: diff >= 0 ? 'up' : 'down',
        text: `${diff >= 0 ? '+' : ''}${diff}% vs previous audit`,
      };
    }

    // 10. Guideline Coverage (active rules per category)
    const guidelineCoverageAgg = await BrandRule.aggregate([
      { $match: { workspace: workspaceId, isActive: true } },
      { $group: { _id: '$category', count: { $sum: 1 } } },
      { $sort: { count: -1 } },
    ]);

    const guidelineCoverage = guidelineCoverageAgg.map((g) => ({
      category: g._id,
      count: g.count,
    }));

    const totalActiveRules = await BrandRule.countDocuments({ workspace: workspaceId, isActive: true });

    // 11. Actual Brand Profile from database
    const brandProfile = await BrandProfile.findOne({ workspace: workspaceId });

    return res.status(200).json({
      success: true,
      data: {
        totalReviews,
        averageScore,
        openHighRiskCount,
        pendingApprovalsCount,
        reviewedThisMonthCount,
        recentReviews,
        recentDrafts,
        complianceTrend,
        scoreComparison,
        issuesByCategory,
        topRules: populatedTopRules,
        guidelineCoverage,
        totalActiveRules,
        brandProfile,
      },
    });
  } catch (error) {
    next(error);
  }
});

// GET /api/dashboard/findings - Fetch real findings with filters
router.get('/findings', async (req, res, next) => {
  try {
    const workspaceId = req.workspace._id;
    const { category, severity, status, limit = 15 } = req.query;

    const query = { workspace: workspaceId };
    if (category && category !== 'All' && category !== 'all') {
      query.category = category;
    }
    if (severity && severity !== 'All' && severity !== 'all') {
      query.severity = severity;
    }
    if (status && status !== 'All' && status !== 'all') {
      query.status = status;
    }

    const findings = await Finding.find(query)
      .sort({ createdAt: -1 })
      .limit(Number(limit))
      .populate('draft', 'title contentType status')
      .populate('ruleRef', 'title category severity preferredWording')
      .populate('factRef', 'factText sourceName');

    return res.status(200).json({
      success: true,
      data: findings,
      meta: {
        total: findings.length,
      },
    });
  } catch (error) {
    next(error);
  }
});

// GET /api/dashboard/search - Global search across drafts, rules, and facts
router.get('/search', async (req, res, next) => {
  try {
    const workspaceId = req.workspace._id;
    const { q = '' } = req.query;

    if (!q.trim()) {
      return res.status(200).json({
        success: true,
        data: { drafts: [], rules: [], facts: [] },
      });
    }

    const term = q.trim();
    const regex = new RegExp(term, 'i');

    const [drafts, rules, facts] = await Promise.all([
      ContentDraft.find({
        workspace: workspaceId,
        $or: [{ title: regex }, { currentContent: regex }],
      })
        .select('title contentType status latestComplianceScore updatedAt')
        .limit(5),

      BrandRule.find({
        workspace: workspaceId,
        $or: [{ title: regex }, { description: regex }, { preferredWording: regex }],
      })
        .select('title category severity preferredWording isActive')
        .limit(5),

      ApprovedFact.find({
        workspace: workspaceId,
        $or: [{ factText: regex }, { category: regex }, { sourceName: regex }],
      })
        .select('factText category sourceName status')
        .limit(5),
    ]);

    return res.status(200).json({
      success: true,
      data: { drafts, rules, facts },
    });
  } catch (error) {
    next(error);
  }
});

export default router;
