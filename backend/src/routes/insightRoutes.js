import express from 'express';
import { ReviewRun } from '../models/ReviewRun.js';
import { Finding } from '../models/Finding.js';
import { BrandRule } from '../models/BrandRule.js';
import { ContentDraft } from '../models/ContentDraft.js';
import { authenticate } from '../middleware/auth.js';
import { resolveWorkspace } from '../middleware/workspace.js';

const router = express.Router();

router.use(authenticate, resolveWorkspace);

// GET /api/insights
router.get('/', async (req, res, next) => {
  try {
    const workspaceId = req.workspace._id;

    // 1. Most common issue categories
    const categoryAgg = await Finding.aggregate([
      { $match: { workspace: workspaceId } },
      { $group: { _id: '$category', total: { $sum: 1 }, dismissed: { $sum: { $cond: [{ $eq: ['$status', 'dismissed'] }, 1, 0] } } } },
      { $sort: { total: -1 } },
    ]);

    // 2. Frequently triggered rules
    const topRulesAgg = await Finding.aggregate([
      { $match: { workspace: workspaceId, ruleRef: { $ne: null } } },
      {
        $group: {
          _id: '$ruleRef',
          count: { $sum: 1 },
          appliedCount: { $sum: { $cond: [{ $eq: ['$status', 'applied'] }, 1, 0] } },
          dismissedCount: { $sum: { $cond: [{ $eq: ['$status', 'dismissed'] }, 1, 0] } },
        },
      },
      { $sort: { count: -1 } },
      { $limit: 8 },
    ]);

    const rulesWithDetails = [];
    for (const item of topRulesAgg) {
      const rule = await BrandRule.findById(item._id);
      if (rule) {
        rulesWithDetails.push({
          ruleId: rule._id,
          title: rule.title,
          category: rule.category,
          severity: rule.severity,
          triggerCount: item.count,
          appliedCount: item.appliedCount,
          dismissedCount: item.dismissedCount,
          preferredWording: rule.preferredWording,
        });
      }
    }

    // 3. Repeated terminology mistakes (frequent textSpan findings)
    const repeatedMistakes = await Finding.aggregate([
      { $match: { workspace: workspaceId, textSpan: { $ne: '' } } },
      { $group: { _id: { $toLower: '$textSpan' }, count: { $sum: 1 }, sampleSuggestion: { $first: '$suggestedCorrection' } } },
      { $sort: { count: -1 } },
      { $limit: 6 },
    ]);

    // 4. Unresolved high-risk findings
    const unresolvedHighRisk = await Finding.find({
      workspace: workspaceId,
      severity: 'High',
      status: 'open',
    })
      .limit(10)
      .populate('draft', 'title contentType');

    // 5. Review turnaround time (difference between createdAt and lastReviewedAt on drafts)
    const reviewedDrafts = await ContentDraft.find({
      workspace: workspaceId,
      lastReviewedAt: { $ne: null },
    }).select('createdAt lastReviewedAt status');

    let avgTurnaroundSeconds = 0;
    if (reviewedDrafts.length > 0) {
      const totalSeconds = reviewedDrafts.reduce((acc, d) => {
        const diff = Math.max(0, (new Date(d.lastReviewedAt).getTime() - new Date(d.createdAt).getTime()) / 1000);
        return acc + diff;
      }, 0);
      avgTurnaroundSeconds = Math.round(totalSeconds / reviewedDrafts.length);
    }

    // 6. Rules frequently dismissed as unclear or false positives
    const frequentlyDismissedRules = rulesWithDetails
      .filter((r) => r.dismissedCount > 0)
      .sort((a, b) => b.dismissedCount - a.dismissedCount)
      .slice(0, 5);

    // 7. Compliance trend overview
    const runs = await ReviewRun.find({ workspace: workspaceId }).sort({ createdAt: 1 }).limit(15);
    const scoreHistory = runs.map((r) => ({
      date: new Date(r.createdAt).toLocaleDateString(undefined, { month: 'short', day: 'numeric' }),
      score: r.complianceScore,
      highCount: r.findingsSummary?.high || 0,
      totalFindings: r.findingsSummary?.total || 0,
    }));

    const categoryBreakdown = categoryAgg.map((c) => ({ category: c._id, count: c.total, total: c.total, _id: c._id, dismissed: c.dismissed }));

    return res.status(200).json({
      success: true,
      data: {
        categoryBreakdown,
        categoryDistribution: categoryBreakdown,
        topRules: rulesWithDetails,
        repeatedMistakes: repeatedMistakes.map((m) => ({ _id: m._id, phrase: m._id, count: m.count, suggestion: m.sampleSuggestion, sampleSuggestion: m.sampleSuggestion })),
        unresolvedHighRisk,
        avgTurnaroundSeconds,
        frequentlyDismissedRules,
        scoreHistory,
      },
    });
  } catch (error) {
    next(error);
  }
});

export default router;
