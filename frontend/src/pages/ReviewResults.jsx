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
  XCircle,
  AlertCircle,
  Filter,
} from 'lucide-react';
import ComplianceScoreRing from '../components/ComplianceScoreRing';
import { SeverityBadge, ClaimStatusBadge, WorkflowStatusBadge } from '../components/Badges';
import { api } from '../services/api';
import { useAuth } from '../context/AuthContext';
import { useToast } from '../context/ToastContext';

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

  const { workspace } = useAuth();
  const toast = useToast();
  const navigate = useNavigate();

  const loadDraftData = async () => {
    try {
      setLoading(true);
      const [draftRes, findingsRes] = await Promise.all([
        api.drafts.get(draftId),
        api.findings.list({ draftId }),
      ]);

      if (draftRes.success) {
        const d = draftRes.data.draft || draftRes.data;
        setDraft(d);
        setEditableContent(d?.currentContent || '');
        const fList =
          findingsRes?.success && findingsRes.data?.length > 0
            ? findingsRes.data
            : draftRes.data?.findings || [];
        setFindings(fList);

        if (fList.length > 0) {
          const firstOpen = fList.find((f) => f.status === 'open');
          if (firstOpen) setActiveFindingId(firstOpen._id);
        }
      }
    } catch (err) {
      toast.error('Failed to load review workspace: ' + err.message);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    if (draftId) {
      loadDraftData();
    }
  }, [draftId, workspace]);

  // Handle re-running the automated checks
  const handleReRunAudit = async () => {
    try {
      setReAuditing(true);
      toast.info('Running deterministic brand governance checks...');
      const res = await api.drafts.review(draftId);
      if (res.success) {
        toast.success(`Audit completed. Score: ${res.data.complianceScore}%`);
        loadDraftData();
      }
    } catch (err) {
      toast.error('Audit failed: ' + err.message);
    } finally {
      setReAuditing(false);
    }
  };

  // Handle applying a deterministic suggestion directly into the text
  const handleApplySuggestion = async (finding) => {
    if (!finding.suggestedCorrection) return;
    try {
      setApplyingFindingId(finding._id);
      const res = await api.findings.apply(finding._id);
      if (res.success) {
        toast.success('Approved correction applied to draft!');
        loadDraftData();
      }
    } catch (err) {
      toast.error('Failed to apply suggestion: ' + err.message);
    } finally {
      setApplyingFindingId(null);
    }
  };

  // Handle resolving a finding manually
  const handleResolveFinding = async (findingId) => {
    try {
      const res = await api.findings.resolve(findingId);
      if (res.success) {
        toast.success('Finding marked as resolved.');
        loadDraftData();
      }
    } catch (err) {
      toast.error('Failed to resolve finding: ' + err.message);
    }
  };

  // Handle dismissing a finding with reason
  const handleDismissFinding = async (e) => {
    e.preventDefault();
    if (!dismissModalFinding) return;
    try {
      const res = await api.findings.dismiss(dismissModalFinding._id, {
        reason: dismissReason.trim() || 'Reviewed and approved by brand manager',
      });
      if (res.success) {
        toast.success('Finding dismissed with audit trail record.');
        setDismissModalFinding(null);
        setDismissReason('');
        loadDraftData();
      }
    } catch (err) {
      toast.error('Failed to dismiss finding: ' + err.message);
    }
  };

  // Submit draft for reviewer approval
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

  // Interactive highlighted text renderer
  const renderHighlightedContent = () => {
    if (!draft?.currentContent) return null;
    const content = draft.currentContent;

    const spansToHighlight = [];
    findings.forEach((f) => {
      if (f.textSpan && f.status === 'open') {
        const idx = content.indexOf(f.textSpan);
        if (idx !== -1) {
          spansToHighlight.push({
            finding: f,
            start: idx,
            end: idx + f.textSpan.length,
            span: f.textSpan,
            severity: f.severity.toLowerCase(),
          });
        }
      }
    });

    if (spansToHighlight.length === 0) {
      return content;
    }

    spansToHighlight.sort((a, b) => a.start - b.start);

    const parts = [];
    let lastIndex = 0;

    spansToHighlight.forEach((item, index) => {
      if (item.start >= lastIndex) {
        if (item.start > lastIndex) {
          parts.push(content.substring(lastIndex, item.start));
        }
        const isActive = activeFindingId === item.finding._id;
        parts.push(
          <span
            key={`highlight-${item.finding._id}-${index}`}
            className={`document-highlight-span ${item.severity} ${isActive ? 'active' : ''}`}
            onClick={() => {
              setActiveFindingId(item.finding._id);
              const el = document.getElementById(`finding-${item.finding._id}`);
              if (el) el.scrollIntoView({ behavior: 'smooth', block: 'nearest' });
            }}
            title={`Click to inspect finding: ${item.finding.ruleTitle || item.finding.category}`}
          >
            {item.span}
          </span>
        );
        lastIndex = item.end;
      }
    });

    if (lastIndex < content.length) {
      parts.push(content.substring(lastIndex));
    }

    return parts;
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
  const highRiskCount = findings.filter((f) => f.severity === 'High' && f.status === 'open').length;
  const mediumRiskCount = findings.filter((f) => f.severity === 'Medium' && f.status === 'open').length;
  const lowRiskCount = findings.filter((f) => f.severity === 'Low' && f.status === 'open').length;

  const wordCount = draft.currentContent ? draft.currentContent.split(/\s+/).filter(Boolean).length : 0;

  return (
    <div style={{ display: 'flex', flexDirection: 'column', gap: 'var(--space-6)' }}>
      {/* Modern Page Header Banner */}
      <div className="page-header-clean">
        <div style={{ display: 'flex', alignItems: 'center', gap: '14px', flexWrap: 'wrap' }}>
          <button
            onClick={() => navigate('/approvals')}
            className="action-icon-btn"
            title="Back to Approvals Queue"
            style={{ width: '38px', height: '38px', borderRadius: '10px' }}
          >
            <ArrowLeft size={16} />
          </button>

          <div>
            <div style={{ display: 'flex', alignItems: 'center', gap: '8px', flexWrap: 'wrap', marginBottom: '4px' }}>
              <h1 className="text-gradient-primary" style={{ fontSize: '1.25rem', fontWeight: 800, margin: 0 }}>
                {draft.title}
              </h1>
              <WorkflowStatusBadge status={draft.status} />
              <span
                style={{
                  padding: '2px 8px',
                  borderRadius: '6px',
                  background: '#F1F5F9',
                  color: '#475569',
                  fontSize: '0.75rem',
                  fontWeight: 700,
                  fontFamily: 'var(--font-mono)',
                }}
              >
                v{draft.currentVersion}
              </span>
              <span
                style={{
                  padding: '2px 8px',
                  borderRadius: '6px',
                  background: '#EFF6FF',
                  color: '#2563EB',
                  fontSize: '0.75rem',
                  fontWeight: 600,
                }}
              >
                {draft.contentType}
              </span>
            </div>

            <div style={{ fontSize: '0.75rem', color: '#64748B' }}>
              Author: <strong style={{ color: '#0F172A' }}>{draft.author?.name || 'Creator'}</strong> • Last Audited:{' '}
              {draft.lastReviewedAt ? new Date(draft.lastReviewedAt).toLocaleString() : 'Never'}
            </div>
          </div>
        </div>

        {/* Primary Header Actions */}
        <div style={{ display: 'flex', alignItems: 'center', gap: '10px', flexWrap: 'wrap' }}>
          <button
            onClick={handleReRunAudit}
            disabled={reAuditing}
            className="btn btn-secondary btn-sm"
            style={{ borderRadius: '10px', padding: '7px 16px', fontSize: '0.8125rem' }}
          >
            <RotateCcw size={14} className={reAuditing ? 'spinner' : ''} />
            <span>{reAuditing ? 'Auditing...' : 'Re-run Brand Audit'}</span>
          </button>

          {draft.status !== 'Approved' && (
            <button
              onClick={handleSubmitForApproval}
              disabled={submittingApproval}
              className="btn btn-gradient-primary btn-sm"
              style={{ borderRadius: '10px', padding: '7px 16px', fontSize: '0.8125rem' }}
            >
              <Send size={14} />
              <span>Submit for Sign-Off</span>
            </button>
          )}
        </div>
      </div>

      {/* Main Split-Pane Workspace */}
      <div
        style={{
          display: 'grid',
          gridTemplateColumns: 'minmax(0, 1.2fr) minmax(380px, 460px)',
          gap: '24px',
          alignItems: 'start',
        }}
      >
        {/* Left Column: Compliance Score Ribbon + Document Canvas */}
        <div style={{ display: 'flex', flexDirection: 'column', gap: '20px' }}>
          {/* Streamlined Compliance Score Ribbon */}
          <div
            className="card"
            style={{
              padding: '18px 22px',
              display: 'flex',
              alignItems: 'center',
              gap: '20px',
              flexWrap: 'wrap',
            }}
          >
            <div style={{ flexShrink: 0 }}>
              <ComplianceScoreRing
                score={draft.latestComplianceScore || 92}
                size={92}
                strokeWidth={9}
                showBadge={false}
              />
            </div>

            <div style={{ flex: 1, minWidth: '220px' }}>
              <div style={{ display: 'flex', alignItems: 'center', gap: '8px', marginBottom: '4px' }}>
                <h3 className="text-gradient-blue" style={{ fontSize: '1.0625rem', fontWeight: 800, margin: 0 }}>
                  Brand Alignment Score
                </h3>
                <span
                  style={{
                    padding: '2px 8px',
                    borderRadius: '999px',
                    background: '#F1F5F9',
                    color: '#475569',
                    fontSize: '0.6875rem',
                    fontWeight: 700,
                  }}
                >
                  Deterministic Rule Engine
                </span>
              </div>

              <p style={{ fontSize: '0.8125rem', color: '#64748B', margin: '0 0 10px 0', lineHeight: 1.4 }}>
                {draft.latestComplianceScore >= 90
                  ? 'Strong adherence to approved guidelines, messaging, and terminology.'
                  : draft.latestComplianceScore >= 75
                  ? 'Minor terminology adjustments or unverified claims flagged for revision.'
                  : 'Critical brand risk flags or prohibited terms must be resolved before publication.'}
              </p>

              {/* Finding Counts Breakdown Pills */}
              <div style={{ display: 'flex', gap: '8px', flexWrap: 'wrap' }}>
                <span
                  style={{
                    padding: '3px 10px',
                    borderRadius: '8px',
                    background: '#FEF2F2',
                    color: '#DC2626',
                    fontSize: '0.75rem',
                    fontWeight: 750,
                    border: '1px solid #FEE2E2',
                  }}
                >
                  {highRiskCount} High-Risk
                </span>

                <span
                  style={{
                    padding: '3px 10px',
                    borderRadius: '8px',
                    background: '#FFFBEB',
                    color: '#D97706',
                    fontSize: '0.75rem',
                    fontWeight: 750,
                    border: '1px solid #FDE68A',
                  }}
                >
                  {mediumRiskCount} Medium
                </span>

                <span
                  style={{
                    padding: '3px 10px',
                    borderRadius: '8px',
                    background: '#EFF6FF',
                    color: '#2563EB',
                    fontSize: '0.75rem',
                    fontWeight: 750,
                    border: '1px solid #DBEAFE',
                  }}
                >
                  {lowRiskCount} Low
                </span>

                <span
                  style={{
                    padding: '3px 10px',
                    borderRadius: '8px',
                    background: '#ECFDF5',
                    color: '#059669',
                    fontSize: '0.75rem',
                    fontWeight: 750,
                    border: '1px solid #A7F3D0',
                  }}
                >
                  {resolvedCount} Resolved
                </span>
              </div>
            </div>
          </div>

          {/* Document Content Canvas */}
          <div className="document-canvas">
            <div
              style={{
                display: 'flex',
                justifyContent: 'space-between',
                alignItems: 'center',
                marginBottom: '16px',
                flexWrap: 'wrap',
                gap: '8px',
              }}
            >
              <div style={{ display: 'flex', alignItems: 'center', gap: '8px' }}>
                <FileText size={18} color="var(--color-primary)" />
                <h3 style={{ fontSize: '1rem', fontWeight: 800, color: '#0F172A', margin: 0 }}>
                  Document Copy Preview
                </h3>
                <span style={{ fontSize: '0.75rem', color: '#94A3B8' }}>•</span>
                <span style={{ fontSize: '0.75rem', color: '#64748B', fontWeight: 600 }}>
                  {wordCount} words
                </span>
              </div>

              <div style={{ display: 'flex', gap: '8px' }}>
                <button
                  onClick={() => setIsEditingContent(!isEditingContent)}
                  className="btn btn-secondary btn-sm"
                  style={{ borderRadius: '8px', fontSize: '0.75rem' }}
                >
                  <Edit3 size={12} />
                  <span>{isEditingContent ? 'Cancel Edit' : 'Edit Manually'}</span>
                </button>

                {isEditingContent && (
                  <button
                    onClick={handleSaveManualEdits}
                    className="btn btn-primary btn-sm"
                    style={{ borderRadius: '8px', fontSize: '0.75rem' }}
                  >
                    <Save size={12} />
                    <span>Save New Version</span>
                  </button>
                )}
              </div>
            </div>

            {isEditingContent ? (
              <textarea
                className="form-textarea"
                rows={18}
                value={editableContent}
                onChange={(e) => setEditableContent(e.target.value)}
                style={{
                  fontSize: '0.9375rem',
                  lineHeight: 1.8,
                  padding: '18px',
                  borderRadius: '12px',
                  fontFamily: 'var(--font-sans)',
                }}
              />
            ) : (
              <div className="document-paper">
                {renderHighlightedContent()}
              </div>
            )}
          </div>
        </div>

        {/* Right Column: Sticky Findings & Suggested Corrections Sidebar */}
        <div
          style={{
            position: 'sticky',
            top: '80px',
            display: 'flex',
            flexDirection: 'column',
            gap: '14px',
            maxHeight: 'calc(100vh - 100px)',
          }}
        >
          {/* Findings Filter Bar */}
          <div className="card" style={{ padding: '16px 18px' }}>
            <div
              style={{
                display: 'flex',
                justifyContent: 'space-between',
                alignItems: 'center',
                marginBottom: '12px',
              }}
            >
              <div style={{ display: 'flex', alignItems: 'center', gap: '6px' }}>
                <span style={{ fontSize: '0.9375rem', fontWeight: 800, color: '#0F172A' }}>
                  Audit Findings
                </span>
                <span
                  style={{
                    padding: '1px 8px',
                    borderRadius: '999px',
                    background: '#F1F5F9',
                    color: '#475569',
                    fontSize: '0.75rem',
                    fontWeight: 700,
                  }}
                >
                  {filteredFindings.length}
                </span>
              </div>

              <span
                style={{
                  fontSize: '0.75rem',
                  fontWeight: 700,
                  color: activeFindings.length > 0 ? '#D97706' : '#059669',
                }}
              >
                {activeFindings.length} unresolved
              </span>
            </div>

            <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '8px' }}>
              <select
                className="form-select"
                style={{ fontSize: '0.75rem', padding: '6px 10px', height: '36px' }}
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
                style={{ fontSize: '0.75rem', padding: '6px 10px', height: '36px' }}
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

          {/* Scrollable Finding Cards List */}
          {filteredFindings.length === 0 ? (
            <div className="card" style={{ textAlign: 'center', padding: '36px 20px' }}>
              <CheckCircle2 size={36} color="#059669" style={{ margin: '0 auto 8px auto' }} />
              <h4 style={{ fontSize: '0.9375rem', fontWeight: 750, color: '#0F172A', marginBottom: '2px' }}>
                Zero Active Issues in Filter
              </h4>
              <p style={{ fontSize: '0.8125rem', color: '#64748B', margin: 0 }}>
                All evaluated rules in this selection pass established governance standards.
              </p>
            </div>
          ) : (
            <div
              style={{
                display: 'flex',
                flexDirection: 'column',
                gap: '12px',
                overflowY: 'auto',
                maxHeight: 'calc(100vh - 220px)',
                paddingRight: '4px',
              }}
            >
              {filteredFindings.map((finding) => {
                const isApplied = finding.status === 'applied';
                const isDismissed = finding.status === 'dismissed';
                const isResolved = finding.status === 'resolved';
                const isActive = activeFindingId === finding._id;

                const getFindingStripe = () => {
                  if (isApplied || isResolved) return 'resolved';
                  if (isDismissed) return 'dismissed';
                  return finding.severity.toLowerCase();
                };

                return (
                  <div
                    key={finding._id}
                    id={`finding-${finding._id}`}
                    className={`finding-card ${isActive ? 'active' : ''}`}
                    onClick={() => setActiveFindingId(finding._id)}
                  >
                    {/* Flush Left Colored Accent Stripe */}
                    <div className={`finding-accent-stripe ${getFindingStripe()}`} />

                    {/* Header info */}
                    <div
                      style={{
                        display: 'flex',
                        justifyContent: 'space-between',
                        alignItems: 'center',
                        marginBottom: '8px',
                      }}
                    >
                      <div style={{ display: 'flex', alignItems: 'center', gap: '6px' }}>
                        <SeverityBadge severity={finding.severity} />
                        <span
                          style={{
                            padding: '2px 8px',
                            borderRadius: '6px',
                            background: '#F1F5F9',
                            color: '#475569',
                            fontSize: '0.6875rem',
                            fontWeight: 600,
                          }}
                        >
                          {finding.category}
                        </span>
                      </div>

                      <span style={{ fontSize: '0.6875rem', color: '#94A3B8', fontWeight: 600 }}>
                        {finding.detectedBy === 'deterministic' ? 'Rule-Based' : 'AI-Assisted'}
                      </span>
                    </div>

                    {/* Flagged Snippet & Correction Badges */}
                    <div style={{ display: 'flex', flexDirection: 'column', gap: '6px', marginBottom: '8px' }}>
                      {finding.textSpan && (
                        <div className="mistake-prohibited">
                          <XCircle size={12} />
                          <span>"{finding.textSpan}"</span>
                        </div>
                      )}

                      {finding.suggestedCorrection && (
                        <div className="mistake-replacement">
                          <CheckCircle2 size={12} />
                          <span>Replace with: "{finding.suggestedCorrection}"</span>
                        </div>
                      )}
                    </div>

                    {/* Explanation */}
                    <p style={{ fontSize: '0.8125rem', color: '#475569', margin: '0 0 8px 0', lineHeight: 1.45 }}>
                      {finding.explanation}
                    </p>

                    {/* Linked Rule */}
                    {finding.ruleTitle && (
                      <div
                        style={{
                          fontSize: '0.75rem',
                          color: '#64748B',
                          marginBottom: '10px',
                          display: 'flex',
                          alignItems: 'center',
                          gap: '5px',
                        }}
                      >
                        <ShieldCheck size={13} color="#2563EB" />
                        <span>Rule: <strong style={{ color: '#0F172A' }}>{finding.ruleTitle}</strong></span>
                      </div>
                    )}

                    {/* Actions Row */}
                    {finding.status === 'open' ? (
                      <div
                        style={{
                          display: 'flex',
                          justifyContent: 'space-between',
                          alignItems: 'center',
                          borderTop: '1px solid #F1F5F9',
                          paddingTop: '10px',
                          marginTop: '6px',
                        }}
                      >
                        <div style={{ display: 'flex', gap: '6px' }}>
                          <button
                            onClick={(e) => {
                              e.stopPropagation();
                              setDismissModalFinding(finding);
                            }}
                            className="btn btn-secondary btn-sm"
                            style={{ fontSize: '0.75rem', padding: '3px 8px', borderRadius: '6px' }}
                          >
                            Dismiss
                          </button>

                          <button
                            onClick={(e) => {
                              e.stopPropagation();
                              handleResolveFinding(finding._id);
                            }}
                            className="btn btn-secondary btn-sm"
                            style={{ fontSize: '0.75rem', padding: '3px 8px', borderRadius: '6px' }}
                          >
                            Resolve
                          </button>
                        </div>

                        {finding.suggestedCorrection && (
                          <button
                            onClick={(e) => {
                              e.stopPropagation();
                              handleApplySuggestion(finding);
                            }}
                            disabled={applyingFindingId === finding._id}
                            className="btn btn-sm"
                            style={{
                              fontSize: '0.75rem',
                              padding: '4px 12px',
                              borderRadius: '8px',
                              background: '#2563EB',
                              color: '#FFFFFF',
                              fontWeight: 600,
                              boxShadow: '0 2px 6px rgba(37, 99, 235, 0.25)',
                            }}
                          >
                            <Check size={13} />
                            <span>Apply</span>
                          </button>
                        )}
                      </div>
                    ) : (
                      <div
                        style={{
                          display: 'flex',
                          justifyContent: 'space-between',
                          alignItems: 'center',
                          marginTop: '8px',
                          paddingTop: '8px',
                          borderTop: '1px solid #F1F5F9',
                          fontSize: '0.75rem',
                        }}
                      >
                        <span
                          style={{
                            fontWeight: 700,
                            color: isApplied || isResolved ? '#059669' : '#64748B',
                          }}
                        >
                          {isApplied ? '✓ Correction Applied' : isResolved ? '✓ Marked Resolved' : 'Dismissed'}
                        </span>

                        {finding.dismissReason && (
                          <span
                            style={{
                              color: '#94A3B8',
                              fontStyle: 'italic',
                              maxWidth: '180px',
                              overflow: 'hidden',
                              textOverflow: 'ellipsis',
                              whiteSpace: 'nowrap',
                            }}
                            title={finding.dismissReason}
                          >
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

            <form onSubmit={handleDismissFinding}>
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
                <button type="button" className="btn btn-secondary" onClick={() => setDismissModalFinding(null)}>
                  Cancel
                </button>
                <button type="submit" className="btn btn-primary">
                  Confirm Dismissal
                </button>
              </div>
            </form>
          </div>
        </div>
      )}
    </div>
  );
}
