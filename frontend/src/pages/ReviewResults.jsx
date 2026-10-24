import React, { useState, useEffect } from 'react';
import { useParams, useNavigate } from 'react-router-dom';
import {
  FileCheck2,
  Sparkles,
  ArrowLeft,
  CheckCircle2,
  AlertTriangle,
  Info,
  Clock,
  RotateCcw,
  Send,
  Save,
  Check,
  X,
  ShieldCheck,
  ExternalLink,
  Edit3,
  History,
  FileText,
  Shield,
} from 'lucide-react';
import ComplianceScoreRing from '../components/ComplianceScoreRing';
import { SeverityBadge, ClaimStatusBadge, WorkflowStatusBadge } from '../components/Badges';
import { api } from '../services/api';
import { useAuth } from '../context/AuthContext';
import { useToast } from '../context/ToastContext';
import { ASSET_IMAGES } from '../assets/images';

export default function ReviewResults() {
  const { draftId } = useParams();
  const [draft, setDraft] = useState(null);
  const [findings, setFindings] = useState([]);
  const [loading, setLoading] = useState(true);
  const [isEditingContent, setIsEditingContent] = useState(false);
  const [editableContent, setEditableContent] = useState('');
  const [activeFindingId, setActiveFindingId] = useState(null);

  // Filters
  const [severityFilter, setSeverityFilter] = useState('');
  const [categoryFilter, setCategoryFilter] = useState('');

  // Action states
  const [applyingFindingId, setApplyingFindingId] = useState(null);
  const [reAuditing, setReAuditing] = useState(false);
  const [submittingApproval, setSubmittingApproval] = useState(false);
  const [dismissModalFinding, setDismissModalFinding] = useState(null);
  const [dismissReason, setDismissReason] = useState('');

  const { workspace, user, isCreator, isReviewer } = useAuth();
  const toast = useToast();
  const navigate = useNavigate();

  const loadDraftData = async () => {
    try {
      setLoading(true);
      const res = await api.drafts.get(draftId);
      if (res.success) {
        setDraft(res.data.draft);
        setFindings(res.data.findings || []);
        setEditableContent(res.data.draft.currentContent);
      }
    } catch (err) {
      toast.error('Failed to load review results: ' + err.message);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    if (draftId) {
      loadDraftData();
    }
  }, [draftId]);

  // Apply suggested correction
  const handleApplySuggestion = async (finding) => {
    try {
      setApplyingFindingId(finding._id);
      const res = await api.drafts.applyFinding(draftId, finding._id);
      if (res.success) {
        toast.success('Applied suggested correction. New draft version created.');
        setDraft(res.data.draft);
        setEditableContent(res.data.draft.currentContent);
        const updatedFindings = await api.drafts.get(draftId);
        if (updatedFindings.success) {
          setFindings(updatedFindings.data.findings);
        }
      }
    } catch (err) {
      toast.error('Failed to apply suggestion: ' + err.message);
    } finally {
      setApplyingFindingId(null);
    }
  };

  // Dismiss finding
  const handleDismissFinding = async () => {
    if (!dismissModalFinding) return;
    try {
      const res = await api.drafts.updateFindingStatus(draftId, dismissModalFinding._id, {
        action: 'dismiss',
        dismissReason: dismissReason.trim() || 'Dismissed by reviewer as compliant in context.',
      });
      if (res.success) {
        toast.info('Finding dismissed.');
        setDismissModalFinding(null);
        setDismissReason('');
        loadDraftData();
      }
    } catch (err) {
      toast.error('Failed to dismiss finding: ' + err.message);
    }
  };

  // Resolve finding
  const handleResolveFinding = async (findingId) => {
    try {
      const res = await api.drafts.updateFindingStatus(draftId, findingId, { action: 'resolve' });
      if (res.success) {
        toast.success('Finding marked as resolved.');
        loadDraftData();
      }
    } catch (err) {
      toast.error('Failed to resolve finding: ' + err.message);
    }
  };

  // Re-run Brand Audit
  const handleReRunAudit = async () => {
    try {
      setReAuditing(true);
      const res = await api.drafts.review(draftId);
      if (res.success) {
        toast.success(`Audit re-run complete! Compliance Score: ${res.data.scoreResult.score}%`);
        loadDraftData();
      }
    } catch (err) {
      toast.error('Audit re-run failed: ' + err.message);
    } finally {
      setReAuditing(false);
    }
  };

  // Submit for Approval
  const handleSubmitForApproval = async () => {
    try {
      setSubmittingApproval(true);
      const res = await api.drafts.submit(draftId);
      if (res.success) {
        toast.success('Submitted for reviewer approval!');
        loadDraftData();
      }
    } catch (err) {
      toast.error('Failed to submit: ' + err.message);
    } finally {
      setSubmittingApproval(false);
    }
  };

  // Save manual content edits
  const handleSaveManualEdits = async () => {
    try {
      const res = await api.drafts.update(draftId, {
        content: editableContent,
        changeSummary: 'Manual edits applied in review studio.',
      });
      if (res.success) {
        toast.success('Draft content updated. New version saved.');
        setIsEditingContent(false);
        loadDraftData();
      }
    } catch (err) {
      toast.error('Failed to save manual edits: ' + err.message);
    }
  };

  if (loading) {
    return (
      <div style={{ display: 'flex', flexDirection: 'column', gap: 'var(--space-6)' }}>
        <div style={{ height: '100px' }} className="skeleton card" />
        <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: 'var(--space-6)' }}>
          <div style={{ height: '400px' }} className="skeleton card" />
          <div style={{ height: '400px' }} className="skeleton card" />
        </div>
      </div>
    );
  }

  if (!draft) {
    return (
      <div className="card" style={{ textAlign: 'center', padding: 'var(--space-12)' }}>
        <AlertTriangle size={48} color="var(--severity-high)" style={{ margin: '0 auto var(--space-4) auto' }} />
        <h3 style={{ fontSize: '1.25rem', fontWeight: 700 }}>Content Draft Not Found</h3>
        <p style={{ color: 'var(--text-secondary)', marginBottom: 'var(--space-4)' }}>
          The requested document could not be located in this workspace.
        </p>
        <button className="btn btn-primary" onClick={() => navigate('/review')}>
          Back to Review Studio
        </button>
      </div>
    );
  }

  // Filter findings
  const filteredFindings = findings.filter((f) => {
    if (severityFilter && f.severity !== severityFilter) return false;
    if (categoryFilter && f.category !== categoryFilter) return false;
    return true;
  });

  const activeFindings = findings.filter((f) => f.status === 'open');
  const resolvedCount = findings.filter((f) => f.status === 'applied' || f.status === 'resolved').length;

  return (
    <div style={{ display: 'flex', flexDirection: 'column', gap: 'var(--space-6)' }}>
      {/* Header Bar */}
      <div
        className="card"
        style={{
          padding: 'var(--space-5)',
          display: 'flex',
          justifyContent: 'space-between',
          alignItems: 'center',
          flexWrap: 'wrap',
          gap: 'var(--space-4)',
        }}
      >
        <div style={{ display: 'flex', alignItems: 'center', gap: 'var(--space-4)' }}>
          <button
            onClick={() => navigate('/review')}
            className="btn btn-secondary btn-sm"
            style={{ padding: '6px' }}
            title="Back to Review Studio"
          >
            <ArrowLeft size={16} />
          </button>

          <div>
            <div style={{ display: 'flex', alignItems: 'center', gap: '8px', flexWrap: 'wrap' }}>
              <h1 className="text-gradient-primary" style={{ fontSize: '1.35rem', fontWeight: 800 }}>
                {draft.title}
              </h1>
              <WorkflowStatusBadge status={draft.status} />
              <span className="badge badge-neutral">v{draft.currentVersion}</span>
              <span className="badge badge-neutral">{draft.contentType}</span>
            </div>
            <div style={{ fontSize: '0.75rem', color: 'var(--text-tertiary)', marginTop: '2px' }}>
              Author: {draft.author?.name || 'Creator'} • Last Audited: {draft.lastReviewedAt ? new Date(draft.lastReviewedAt).toLocaleString() : 'Never'}
            </div>
          </div>
        </div>

        {/* Primary Header Actions */}
        <div style={{ display: 'flex', alignItems: 'center', gap: 'var(--space-3)' }}>
          <button
            onClick={handleReRunAudit}
            disabled={reAuditing}
            className="btn btn-secondary btn-sm btn-pill"
          >
            <RotateCcw size={14} className={reAuditing ? 'spinner' : ''} />
            {reAuditing ? 'Auditing...' : 'Re-run Brand Audit'}
          </button>

          {draft.status !== 'Approved' && (
            <button
              onClick={handleSubmitForApproval}
              disabled={submittingApproval}
              className="btn btn-primary btn-sm btn-pill"
            >
              <Send size={14} /> Submit for Sign-Off
            </button>
          )}
        </div>
      </div>

      {/* Main Split-Pane Workspace */}
      <div style={{ display: 'grid', gridTemplateColumns: 'minmax(0, 1.15fr) minmax(0, 0.85fr)', gap: 'var(--space-6)', alignItems: 'start' }}>
        {/* Left Column: Compliance Score Breakdown + Document Preview */}
        <div style={{ display: 'flex', flexDirection: 'column', gap: 'var(--space-6)' }}>
          {/* Reference UI Score & 3D Layer Card */}
          <div className="card" style={{ display: 'flex', alignItems: 'center', gap: 'var(--space-6)', padding: 'var(--space-6)' }}>
            <ComplianceScoreRing score={draft.latestComplianceScore || 92} size={130} strokeWidth={12} showBadge={true} />

            <div style={{ flex: 1 }}>
              <div style={{ display: 'flex', alignItems: 'center', gap: '8px', marginBottom: '4px' }}>
                <h3 className="text-gradient-blue" style={{ fontSize: '1.125rem', fontWeight: 800 }}>
                  Brand Alignment Score
                </h3>
                <span className="badge badge-neutral" style={{ fontSize: '0.6875rem' }}>
                  Deterministic Rule Engine
                </span>
              </div>

              <p style={{ fontSize: '0.8125rem', color: 'var(--text-secondary)', marginBottom: 'var(--space-3)' }}>
                {draft.latestComplianceScore >= 90
                  ? 'Strong adherence to approved guidelines, messaging, and terminology.'
                  : draft.latestComplianceScore >= 75
                  ? 'Minor terminology adjustments or unverified claims flagged for revision.'
                  : 'Critical brand risk flags or prohibited terms must be resolved before publication.'}
              </p>

              {/* Finding Counts Breakdown */}
              <div style={{ display: 'flex', gap: 'var(--space-3)', fontSize: '0.75rem', fontWeight: 600 }}>
                <span style={{ color: 'var(--severity-high)' }}>
                  {findings.filter((f) => f.severity === 'High' && f.status === 'open').length} High-Risk
                </span>
                <span>•</span>
                <span style={{ color: 'var(--severity-medium)' }}>
                  {findings.filter((f) => f.severity === 'Medium' && f.status === 'open').length} Medium
                </span>
                <span>•</span>
                <span style={{ color: 'var(--severity-low)' }}>
                  {findings.filter((f) => f.severity === 'Low' && f.status === 'open').length} Low
                </span>
                <span>•</span>
                <span style={{ color: 'var(--status-success)' }}>
                  {resolvedCount} Resolved
                </span>
              </div>
            </div>
          </div>

          {/* Document Preview Area (Reference UI Style with 3D Mockup) */}
          <div className="card" style={{ padding: 'var(--space-6)' }}>
            <div className="card-header">
              <h3 className="card-title text-gradient-violet">
                <FileText size={18} /> Document Text Preview
              </h3>
              <div style={{ display: 'flex', gap: 'var(--space-2)' }}>
                <button
                  onClick={() => setIsEditingContent(!isEditingContent)}
                  className="btn btn-secondary btn-sm"
                >
                  <Edit3 size={13} /> {isEditingContent ? 'Cancel Manual Edit' : 'Edit Manually'}
                </button>
                {isEditingContent && (
                  <button onClick={handleSaveManualEdits} className="btn btn-primary btn-sm">
                    <Save size={13} /> Save New Version
                  </button>
                )}
              </div>
            </div>

            {isEditingContent ? (
              <textarea
                className="form-textarea"
                rows={16}
                value={editableContent}
                onChange={(e) => setEditableContent(e.target.value)}
                style={{ fontSize: '0.9375rem', lineHeight: 1.6, padding: 'var(--space-4)' }}
              />
            ) : (
              <div
                style={{
                  background: 'var(--bg-surface-secondary)',
                  borderRadius: 'var(--radius-lg)',
                  padding: 'var(--space-6)',
                  fontSize: '0.9375rem',
                  lineHeight: 1.7,
                  color: 'var(--text-primary)',
                  whiteSpace: 'pre-wrap',
                  border: '1px solid var(--border-light)',
                  maxHeight: '500px',
                  overflowY: 'auto',
                }}
              >
                {draft.currentContent}
              </div>
            )}
          </div>
        </div>

        {/* Right Column: Findings & Suggested Corrections */}
        <div style={{ display: 'flex', flexDirection: 'column', gap: 'var(--space-5)' }}>
          {/* Findings Filter Bar */}
          <div className="card" style={{ padding: 'var(--space-4)' }}>
            <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: 'var(--space-2)' }}>
              <span style={{ fontSize: '0.875rem', fontWeight: 700, color: 'var(--text-primary)' }}>
                Audit Findings ({filteredFindings.length})
              </span>
              <span style={{ fontSize: '0.75rem', color: 'var(--text-tertiary)' }}>
                {activeFindings.length} unresolved
              </span>
            </div>

            <div style={{ display: 'flex', gap: '8px' }}>
              <select
                className="form-select"
                style={{ fontSize: '0.75rem', padding: '4px 8px' }}
                value={severityFilter}
                onChange={(e) => setSeverityFilter(e.target.value)}
              >
                <option value="">All Severities</option>
                <option value="High">High Risk</option>
                <option value="Medium">Medium</option>
                <option value="Low">Low</option>
              </select>

              <select
                className="form-select"
                style={{ fontSize: '0.75rem', padding: '4px 8px' }}
                value={categoryFilter}
                onChange={(e) => setCategoryFilter(e.target.value)}
              >
                <option value="">All Categories</option>
                <option value="Product naming">Product Naming</option>
                <option value="Promotional claims">Promotional Claims</option>
                <option value="Terminology">Terminology</option>
                <option value="Approved facts">Approved Facts</option>
                <option value="Accessibility">Accessibility</option>
                <option value="Required disclaimers">Required Disclaimers</option>
              </select>
            </div>
          </div>

          {/* Finding Cards List */}
          {filteredFindings.length === 0 ? (
            <div className="card" style={{ textAlign: 'center', padding: 'var(--space-8)' }}>
              <CheckCircle2 size={40} color="var(--status-success)" style={{ margin: '0 auto var(--space-2) auto' }} />
              <h4 style={{ fontSize: '1rem', fontWeight: 700 }}>Zero Active Issues in Filter</h4>
              <p style={{ fontSize: '0.8125rem', color: 'var(--text-secondary)' }}>
                All evaluated rules in this selection pass established governance standards.
              </p>
            </div>
          ) : (
            <div style={{ display: 'flex', flexDirection: 'column', gap: 'var(--space-4)' }}>
              {filteredFindings.map((finding) => {
                const isApplied = finding.status === 'applied';
                const isDismissed = finding.status === 'dismissed';

                return (
                  <div
                    key={finding._id}
                    className="card"
                    style={{
                      padding: 'var(--space-4)',
                      borderLeft: `4px solid ${
                        isDismissed
                          ? '#94A3B8'
                          : finding.severity === 'High'
                          ? 'var(--severity-high)'
                          : finding.severity === 'Medium'
                          ? 'var(--severity-medium)'
                          : 'var(--color-primary)'
                      }`,
                      opacity: isDismissed ? 0.65 : 1,
                      background: activeFindingId === finding._id ? 'var(--color-primary-light)' : 'var(--bg-surface)',
                    }}
                    onClick={() => setActiveFindingId(finding._id)}
                  >
                    {/* Header info */}
                    <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '6px' }}>
                      <div style={{ display: 'flex', alignItems: 'center', gap: '6px' }}>
                        <SeverityBadge severity={finding.severity} />
                        <span className="badge badge-neutral" style={{ fontSize: '0.6875rem' }}>
                          {finding.category}
                        </span>
                      </div>

                      <span style={{ fontSize: '0.6875rem', color: 'var(--text-tertiary)', textTransform: 'capitalize' }}>
                        {finding.detectedBy === 'deterministic' ? 'Rule-Based' : 'AI-Assisted'}
                      </span>
                    </div>

                    {/* Flagged Snippet */}
                    {finding.textSpan && (
                      <div
                        style={{
                          background: '#FEF2F2',
                          color: '#991B1B',
                          padding: '4px 8px',
                          borderRadius: 'var(--radius-sm)',
                          fontSize: '0.8125rem',
                          fontFamily: 'var(--font-mono)',
                          marginBottom: '8px',
                          border: '1px solid #FCA5A5',
                        }}
                      >
                        "{finding.textSpan}"
                      </div>
                    )}

                    {/* Explanation */}
                    <p style={{ fontSize: '0.8125rem', color: 'var(--text-primary)', marginBottom: '8px', lineHeight: 1.4 }}>
                      {finding.explanation}
                    </p>

                    {/* Claim Verification Badge */}
                    <div style={{ marginBottom: '8px' }}>
                      <ClaimStatusBadge status={finding.claimStatus} />
                    </div>

                    {/* Suggested Replacement */}
                    {finding.suggestedCorrection && (
                      <div
                        style={{
                          background: '#F0FDF4',
                          border: '1px solid #BBF7D0',
                          padding: '8px',
                          borderRadius: 'var(--radius-md)',
                          marginBottom: '8px',
                        }}
                      >
                        <span style={{ display: 'block', fontSize: '0.6875rem', fontWeight: 700, color: '#166534', textTransform: 'uppercase' }}>
                          Suggested Correction:
                        </span>
                        <div style={{ fontSize: '0.8125rem', color: '#15803D', fontWeight: 600 }}>
                          "{finding.suggestedCorrection}"
                        </div>
                      </div>
                    )}

                    {/* Source or Rule reference */}
                    {finding.ruleTitle && (
                      <div style={{ fontSize: '0.6875rem', color: 'var(--text-tertiary)', marginBottom: '8px', display: 'flex', alignItems: 'center', gap: '4px' }}>
                        <ShieldCheck size={12} color="var(--color-primary)" />
                        Linked Rule: <strong>{finding.ruleTitle}</strong>
                      </div>
                    )}

                    {/* Actions: Apply Suggestion, Dismiss, Resolve */}
                    {finding.status === 'open' ? (
                      <div style={{ display: 'flex', justifyContent: 'flex-end', gap: 'var(--space-2)', marginTop: '8px', borderTop: '1px solid var(--border-subtle)', paddingTop: '8px' }}>
                        <button
                          onClick={() => setDismissModalFinding(finding)}
                          className="btn btn-secondary btn-sm"
                          style={{ fontSize: '0.75rem', padding: '3px 8px' }}
                        >
                          Dismiss
                        </button>

                        <button
                          onClick={() => handleResolveFinding(finding._id)}
                          className="btn btn-secondary btn-sm"
                          style={{ fontSize: '0.75rem', padding: '3px 8px' }}
                        >
                          Mark Resolved
                        </button>

                        {finding.suggestedCorrection && (
                          <button
                            onClick={() => handleApplySuggestion(finding)}
                            disabled={applyingFindingId === finding._id}
                            className="btn btn-primary btn-sm"
                            style={{ fontSize: '0.75rem', padding: '3px 10px' }}
                          >
                            <Check size={13} /> Apply Correction
                          </button>
                        )}
                      </div>
                    ) : (
                      <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginTop: '8px', paddingTop: '6px', borderTop: '1px solid var(--border-subtle)', fontSize: '0.75rem', color: 'var(--text-tertiary)' }}>
                        <span style={{ textTransform: 'capitalize', fontWeight: 600, color: isApplied ? 'var(--status-success)' : 'var(--text-secondary)' }}>
                          Status: {finding.status}
                        </span>
                        {finding.dismissReason && (
                          <span style={{ fontStyle: 'italic', maxWidth: '200px', overflow: 'hidden', textOverflow: 'ellipsis' }}>
                            "{finding.dismissReason}"
                          </span>
                        )}
                      </div>
                    )}
                  </div>
                );
              })}
            </div>
          )}
        </div>
      </div>

      {/* Dismiss Finding Modal */}
      {dismissModalFinding && (
        <div className="modal-overlay">
          <div className="modal-content" style={{ padding: 'var(--space-6)', maxWidth: '460px' }}>
            <h3 style={{ fontSize: '1.125rem', fontWeight: 700, marginBottom: 'var(--space-2)' }}>
              Dismiss Brand Finding
            </h3>
            <p style={{ fontSize: '0.875rem', color: 'var(--text-secondary)', marginBottom: 'var(--space-4)' }}>
              Please provide an audit justification. The finding will remain recorded in history but will not penalize the compliance score.
            </p>

            <div className="form-group">
              <label className="form-label">Justification / Exception Reason</label>
              <textarea
                className="form-textarea"
                rows={3}
                placeholder="e.g. Permissible context approved by VP of Product; quotation of customer testimony..."
                value={dismissReason}
                onChange={(e) => setDismissReason(e.target.value)}
              />
            </div>

            <div style={{ display: 'flex', justifyContent: 'flex-end', gap: 'var(--space-2)', marginTop: 'var(--space-4)' }}>
              <button className="btn btn-secondary" onClick={() => setDismissModalFinding(null)}>
                Cancel
              </button>
              <button className="btn btn-primary" onClick={handleDismissFinding}>
                Confirm Dismissal
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}
