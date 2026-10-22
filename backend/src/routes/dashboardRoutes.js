import express from 'express';
import { ReviewRun } from '../models/ReviewRun.js';
import { ContentDraft } from '../models/ContentDraft.js';
import { Finding } from '../models/Finding.js';
import { BrandRule } from '../models/BrandRule.js';
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

    // 3. Pending approvals (Drafts with status 'In Review')
    const pendingApprovalsCount = await ContentDraft.countDocuments({
      workspace: workspaceId,
      status: 'In Review',
    });

    // 4. Recent review activity (last 5 review runs)
    const recentReviews = await ReviewRun.find({ workspace: workspaceId })
      .sort({ createdAt: -1 })
      .limit(5)
      .populate('draft', 'title contentType status')
      .populate('runBy', 'name email avatar');

    // 5. Recent documents (last 5 drafts)
    const recentDrafts = await ContentDraft.find({ workspace: workspaceId })
      .sort({ updatedAt: -1 })
      .limit(6)
      .populate('author', 'name email avatar');

    // 6. Issues by category
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

    // 7. Most frequently triggered rules
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

    // 8. Compliance trend over time (chronological review runs)
    const complianceTrend = reviewRuns
      .slice(0, 10)
      .reverse()
      .map((r, idx) => ({
        index: idx + 1,
        date: new Date(r.createdAt).toLocaleDateString(undefined, { month: 'short', day: 'numeric' }),
        score: r.complianceScore,
        engine: r.engineType,
      }));

    return res.status(200).json({
      success: true,
      data: {
        totalReviews,
        averageScore,
        openHighRiskCount,
        pendingApprovalsCount,
        recentReviews,
        recentDrafts,
        complianceTrend,
        issuesByCategory,
        topRules: populatedTopRules,
      },
    });
  } catch (error) {
    next(error);
  }
});

export default router;
