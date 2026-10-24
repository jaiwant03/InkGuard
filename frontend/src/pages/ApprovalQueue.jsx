import React, { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import {
  ClipboardList,
  CheckCircle2,
  XCircle,
  AlertCircle,
  Clock,
  MessageSquare,
  ArrowRight,
  Send,
  UserCheck,
  User,
  FileText,
  ShieldCheck,
  Eye,
  AlertTriangle,
  Plus,
  Sparkles,
  Check,
  X,
} from 'lucide-react';
import { WorkflowStatusBadge } from '../components/Badges';
import { api } from '../services/api';
import { useAuth } from '../context/AuthContext';
import { useToast } from '../context/ToastContext';

export default function ApprovalQueue() {
  const [allDrafts, setAllDrafts] = useState([]);
  const [loading, setLoading] = useState(true);
  const [activeTab, setActiveTab] = useState('In Review'); // 'All' | 'In Review' | 'Changes Requested' | 'Approved' | 'Rejected'
  const [selectedDraft, setSelectedDraft] = useState(null);
  const [decisionModal, setDecisionModal] = useState(null); // 'approve' | 'request_changes' | 'reject'
  const [commentText, setCommentText] = useState('');
  const [submitting, setSubmitting] = useState(false);

  // Comments state for modal
  const [comments, setComments] = useState([]);
  const [newComment, setNewComment] = useState('');

  const { workspace, isReviewer } = useAuth();
  const toast = useToast();
  const navigate = useNavigate();

  const loadQueue = async () => {
    try {
      setLoading(true);
      const res = await api.drafts.list();
      if (res.success) {
        setAllDrafts(res.data);
      }
    } catch (err) {
      toast.error('Failed to load queue: ' + err.message);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    loadQueue();
  }, [workspace]);

  const handleOpenDecision = async (draft, decision) => {
    setSelectedDraft(draft);
    setDecisionModal(decision);
    setCommentText('');

    // Fetch comments
    try {
      const cRes = await api.drafts.comments(draft._id);
      if (cRes.success) {
        setComments(cRes.data);
      }
    } catch (err) {
      // silent
    }
  };

  const handleConfirmDecision = async (e) => {
    e.preventDefault();
    if (!selectedDraft || !decisionModal) return;

    if (decisionModal === 'request_changes' && !commentText.trim()) {
      toast.error('Please specify what changes are required before requesting revisions.');
      return;
    }

    try {
      setSubmitting(true);
      const res = await api.drafts.decision(selectedDraft._id, {
        decision: decisionModal,
        comment: commentText.trim(),
      });

      if (res.success) {
        toast.success(`Content draft ${res.data.status.toLowerCase()} successfully.`);
        setDecisionModal(null);
        setSelectedDraft(null);
        loadQueue();
      }
    } catch (err) {
      toast.error('Decision failed: ' + err.message);
    } finally {
      setSubmitting(false);
    }
  };

  const inReviewCount = allDrafts.filter((d) => d.status === 'In Review').length;
  const changesRequestedCount = allDrafts.filter((d) => d.status === 'Changes Requested').length;
  const approvedCount = allDrafts.filter((d) => d.status === 'Approved').length;
  const rejectedCount = allDrafts.filter((d) => d.status === 'Rejected').length;

  const tabs = [
    { label: 'In Review', count: inReviewCount },
    { label: 'Changes Requested', count: changesRequestedCount },
    { label: 'Approved', count: approvedCount },
    { label: 'Rejected', count: rejectedCount },
    { label: 'All', count: allDrafts.length },
  ];

  const getStripeClass = (status) => {
    if (status === 'In Review') return 'in-review';
    if (status === 'Approved') return 'approved';
    if (status === 'Changes Requested') return 'changes-requested';
    if (status === 'Rejected') return 'rejected';
    return 'in-review';
  };

  const filteredDrafts =
    activeTab === 'All' ? allDrafts : allDrafts.filter((d) => d.status === activeTab);

  return (
    <div style={{ display: 'flex', flexDirection: 'column', gap: 'var(--space-6)' }}>
      {/* Clean Modern Page Header Banner */}
      <div className="page-header-clean">
        <div className="page-header-info">
          <div style={{ display: 'flex', alignItems: 'center', gap: '8px', marginBottom: '6px' }}>
            <span
              style={{
                display: 'inline-flex',
                alignItems: 'center',
                gap: '6px',
                padding: '3px 10px',
                borderRadius: '999px',
                background: '#FEF3C7',
                color: '#B45309',
                fontSize: '0.6875rem',
                fontWeight: 700,
                border: '1px solid #FDE68A',
                textTransform: 'uppercase',
                letterSpacing: '0.04em',
              }}
            >
              <ClipboardList size={12} color="#B45309" />
              Sign-Off Gatekeeper
            </span>
            <span style={{ fontSize: '0.75rem', color: '#94A3B8' }}>•</span>
            <span style={{ fontSize: '0.75rem', color: '#64748B', fontWeight: 600 }}>
              {inReviewCount} Awaiting Review
            </span>
          </div>

          <h1 className="page-header-title text-gradient-amber">
            Approval Queue & Sign-Offs
          </h1>
          <p className="page-header-subtitle">
            Multi-stakeholder sign-off workflow ensuring content meets brand tone, legal policies, and approved claims.
          </p>
        </div>

        {/* Quick Metrics Bar & CTA Button */}
        <div style={{ display: 'flex', gap: '12px', alignItems: 'center', flexWrap: 'wrap' }}>
          <div
            style={{
              background: '#FFFFFF',
              padding: '8px 16px',
              borderRadius: '12px',
              border: '1px solid #E2E8F0',
              boxShadow: '0 1px 3px rgba(0,0,0,0.02)',
              minWidth: '105px',
            }}
          >
            <span style={{ fontSize: '0.6875rem', fontWeight: 700, color: '#64748B', textTransform: 'uppercase', letterSpacing: '0.04em', display: 'block' }}>
              Awaiting Review
            </span>
            <span style={{ fontSize: '1.25rem', fontWeight: 800, color: '#D97706' }}>
              {inReviewCount}
            </span>
          </div>

          <div
            style={{
              background: '#FFFFFF',
              padding: '8px 16px',
              borderRadius: '12px',
              border: '1px solid #E2E8F0',
              boxShadow: '0 1px 3px rgba(0,0,0,0.02)',
              minWidth: '95px',
            }}
          >
            <span style={{ fontSize: '0.6875rem', fontWeight: 700, color: '#64748B', textTransform: 'uppercase', letterSpacing: '0.04em', display: 'block' }}>
              Approved
            </span>
            <span style={{ fontSize: '1.25rem', fontWeight: 800, color: '#059669' }}>
              {approvedCount}
            </span>
          </div>

          <button onClick={() => navigate('/review')} className="btn btn-gradient-primary btn-sm">
            <Plus size={16} strokeWidth={2.5} />
            <span>New Submission</span>
          </button>
        </div>
      </div>

      {/* Unified Toolbar with Segmented Filter Controls */}
      <div className="facts-toolbar">
        <div style={{ display: 'flex', alignItems: 'center', gap: '8px' }}>
          <ClipboardList size={16} color="var(--color-primary)" />
          <span style={{ fontSize: '0.875rem', fontWeight: 750, color: '#0F172A' }}>
            Queue Submissions ({filteredDrafts.length})
          </span>
        </div>

        <div className="segmented-control">
          {tabs.map((tab) => (
            <button
              key={tab.label}
              onClick={() => setActiveTab(tab.label)}
              className={`segmented-btn ${activeTab === tab.label ? 'active' : ''}`}
            >
              <span>{tab.label}</span>
              <span
                style={{
                  fontSize: '0.6875rem',
                  fontWeight: 700,
                  opacity: 0.8,
                  padding: '1px 6px',
                  borderRadius: '999px',
                  background: activeTab === tab.label ? 'rgba(37, 99, 235, 0.1)' : '#F1F5F9',
                  color: activeTab === tab.label ? 'var(--color-primary)' : '#64748B',
                }}
              >
                {tab.count}
              </span>
            </button>
          ))}
        </div>
      </div>

      {/* Drafts Queue List */}
      {filteredDrafts.length === 0 ? (
        <div style={{ display: 'flex', flexDirection: 'column', gap: '22px' }}>
          {/* Polished Empty State Card */}
          <div
            className="card"
            style={{
              textAlign: 'center',
              padding: '44px 24px',
              display: 'flex',
              flexDirection: 'column',
              alignItems: 'center',
              justifyContent: 'center',
            }}
          >
            <div
              style={{
                width: '64px',
                height: '64px',
                borderRadius: '50%',
                background: '#ECFDF5',
                border: '1px solid #A7F3D0',
                display: 'flex',
                alignItems: 'center',
                justifyContent: 'center',
                marginBottom: '16px',
                boxShadow: '0 4px 14px rgba(5, 150, 105, 0.12)',
              }}
            >
              <CheckCircle2 size={32} color="#059669" />
            </div>

            <h3 style={{ fontSize: '1.25rem', fontWeight: 800, color: '#0F172A', marginBottom: '6px' }}>
              Queue is Clear in "{activeTab}"
            </h3>
            <p style={{ color: '#64748B', fontSize: '0.875rem', maxWidth: '480px', lineHeight: 1.5, marginBottom: '22px' }}>
              There are currently no content drafts awaiting action under the "{activeTab}" filter. The governance pipeline is up to date.
            </p>

            <div style={{ display: 'flex', gap: '12px', alignItems: 'center', flexWrap: 'wrap' }}>
              <button onClick={() => navigate('/review')} className="btn btn-primary btn-sm">
                <Plus size={15} />
                <span>Submit Content for Review</span>
              </button>

              {activeTab !== 'All' && allDrafts.length > 0 && (
                <button onClick={() => setActiveTab('All')} className="btn btn-secondary btn-sm">
                  <span>Browse All Submissions ({allDrafts.length})</span>
                </button>
              )}
            </div>
          </div>

          {/* Enterprise Sign-Off Protocol Pillars Grid (No Wasted Space) */}
          <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(280px, 1fr))', gap: '18px' }}>
            <div className="card" style={{ padding: '20px' }}>
              <div
                style={{
                  width: '36px',
                  height: '36px',
                  borderRadius: '10px',
                  background: '#EFF6FF',
                  border: '1px solid #DBEAFE',
                  display: 'flex',
                  alignItems: 'center',
                  justifyContent: 'center',
                  marginBottom: '12px',
                }}
              >
                <Sparkles size={18} color="#2563EB" />
              </div>
              <h4 style={{ fontSize: '0.9375rem', fontWeight: 750, color: '#0F172A', marginBottom: '4px' }}>
                1. Automated Pre-Audit
              </h4>
              <p style={{ fontSize: '0.8125rem', color: '#64748B', margin: 0, lineHeight: 1.5 }}>
                Deterministic rule engine scans all copy for prohibited phrasing, unverified claims, and naming conventions.
              </p>
            </div>

            <div className="card" style={{ padding: '20px' }}>
              <div
                style={{
                  width: '36px',
                  height: '36px',
                  borderRadius: '10px',
                  background: '#ECFDF5',
                  border: '1px solid #A7F3D0',
                  display: 'flex',
                  alignItems: 'center',
                  justifyContent: 'center',
                  marginBottom: '12px',
                }}
              >
                <ShieldCheck size={18} color="#059669" />
              </div>
              <h4 style={{ fontSize: '0.9375rem', fontWeight: 750, color: '#0F172A', marginBottom: '4px' }}>
                2. Evidence Cross-Checking
              </h4>
              <p style={{ fontSize: '0.8125rem', color: '#64748B', margin: 0, lineHeight: 1.5 }}>
                Numeric metrics, SLAs, and performance claims are validated against the cryptographically verified Approved Facts library.
              </p>
            </div>

            <div className="card" style={{ padding: '20px' }}>
              <div
                style={{
                  width: '36px',
                  height: '36px',
                  borderRadius: '10px',
                  background: '#FFFBEB',
                  border: '1px solid #FDE68A',
                  display: 'flex',
                  alignItems: 'center',
                  justifyContent: 'center',
                  marginBottom: '12px',
                }}
              >
                <UserCheck size={18} color="#D97706" />
              </div>
              <h4 style={{ fontSize: '0.9375rem', fontWeight: 750, color: '#0F172A', marginBottom: '4px' }}>
                3. Immutable Sign-Off
              </h4>
              <p style={{ fontSize: '0.8125rem', color: '#64748B', margin: 0, lineHeight: 1.5 }}>
                Reviewers issue final sign-offs or request modifications with every decision permanently logged in the audit trail.
              </p>
            </div>
          </div>
        </div>
      ) : (
        <div style={{ display: 'flex', flexDirection: 'column', gap: '16px' }}>
          {filteredDrafts.map((draft) => {
            const score = draft.latestComplianceScore;
            const scoreColor =
              score === null ? '#64748B' : score >= 80 ? '#059669' : score >= 60 ? '#D97706' : '#DC2626';

            return (
              <div key={draft._id} className="queue-card">
                {/* Flush Left Colored Accent Stripe */}
                <div className={`queue-accent-stripe ${getStripeClass(draft.status)}`} />

                {/* Top Row: Title, Badges, and Action Button Cluster */}
                <div
                  style={{
                    display: 'flex',
                    alignItems: 'center',
                    justifyContent: 'space-between',
                    flexWrap: 'wrap',
                    gap: '12px',
                    marginBottom: '6px',
                  }}
                >
                  <div style={{ display: 'flex', alignItems: 'center', gap: '10px', flexWrap: 'wrap' }}>
                    <h4 style={{ fontSize: '1rem', fontWeight: 750, color: '#0F172A', margin: 0 }}>
                      {draft.title}
                    </h4>
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
                  </div>

                  {/* Cohesive Action Controls */}
                  <div style={{ display: 'flex', alignItems: 'center', gap: '8px' }}>
                    <button
                      onClick={() => navigate(`/review/${draft._id}`)}
                      className="btn btn-secondary btn-sm"
                      style={{
                        padding: '6px 14px',
                        fontSize: '0.8125rem',
                        borderRadius: '10px',
                      }}
                    >
                      <span>Inspect Audit</span>
                      <ArrowRight size={13} />
                    </button>

                    {isReviewer && draft.status === 'In Review' && (
                      <>
                        <button
                          onClick={() => handleOpenDecision(draft, 'request_changes')}
                          className="btn btn-sm"
                          style={{
                            padding: '6px 14px',
                            fontSize: '0.8125rem',
                            borderRadius: '10px',
                            background: '#FFFBEB',
                            color: '#B45309',
                            border: '1px solid #FDE68A',
                            fontWeight: 600,
                          }}
                        >
                          <AlertTriangle size={14} />
                          <span>Request Changes</span>
                        </button>

                        <button
                          onClick={() => handleOpenDecision(draft, 'approve')}
                          className="btn btn-sm"
                          style={{
                            padding: '6px 14px',
                            fontSize: '0.8125rem',
                            borderRadius: '10px',
                            background: '#059669',
                            color: '#FFFFFF',
                            border: '1px solid #047857',
                            fontWeight: 600,
                            boxShadow: '0 2px 6px rgba(5, 150, 105, 0.25)',
                          }}
                        >
                          <CheckCircle2 size={14} />
                          <span>Approve</span>
                        </button>
                      </>
                    )}
                  </div>
                </div>

                {/* Content Excerpt Box */}
                <div className="queue-content-box">
                  "{draft.currentContent.slice(0, 160)}..."
                </div>

                {/* Bottom Metadata Pills Row */}
                <div style={{ display: 'flex', gap: '10px', flexWrap: 'wrap', alignItems: 'center' }}>
                  <div className="queue-meta-pill">
                    <User size={13} color="#94A3B8" />
                    <span>Author: <strong style={{ color: '#0F172A' }}>{draft.author?.name || 'Creator'}</strong></span>
                  </div>

                  <div className="queue-meta-pill">
                    <FileText size={13} color="#94A3B8" />
                    <span>Type: <strong style={{ color: '#0F172A' }}>{draft.contentType}</strong></span>
                  </div>

                  <div className="queue-meta-pill">
                    <ShieldCheck size={13} color={scoreColor} />
                    <span>
                      Compliance Score:{' '}
                      <strong style={{ color: scoreColor }}>
                        {score !== null ? `${score}%` : 'Not run'}
                      </strong>
                    </span>
                  </div>

                  <div className="queue-meta-pill">
                    <Clock size={13} color="#94A3B8" />
                    <span>Updated: {new Date(draft.updatedAt).toLocaleDateString()}</span>
                  </div>
                </div>
              </div>
            );
          })}
        </div>
      )}

      {/* Reviewer Decision Modal */}
      {decisionModal && selectedDraft && (
        <div className="modal-overlay">
          <div className="modal-content" style={{ padding: 'var(--space-6)', maxWidth: '520px' }}>
            <h3 style={{ fontSize: '1.25rem', fontWeight: 700, marginBottom: 'var(--space-2)' }}>
              {decisionModal === 'approve'
                ? 'Approve Content Draft'
                : decisionModal === 'request_changes'
                ? 'Request Changes'
                : 'Reject Content Draft'}
            </h3>
            <p style={{ fontSize: '0.875rem', color: 'var(--text-secondary)', marginBottom: 'var(--space-4)' }}>
              Target Document: <strong>{selectedDraft.title}</strong>
            </p>

            <form onSubmit={handleConfirmDecision}>
              <div className="form-group">
                <label className="form-label">
                  {decisionModal === 'request_changes' ? 'Required Modifications (Required) *' : 'Reviewer Note (Optional)'}
                </label>
                <textarea
                  className="form-textarea"
                  rows={4}
                  required={decisionModal === 'request_changes'}
                  placeholder={
                    decisionModal === 'approve'
                      ? 'Approved for production publishing.'
                      : 'Provide explicit feedback on prohibited terminology or required fact updates...'
                  }
                  value={commentText}
                  onChange={(e) => setCommentText(e.target.value)}
                />
              </div>

              {/* Existing comments history */}
              {comments.length > 0 && (
                <div style={{ marginTop: 'var(--space-4)', maxHeight: '160px', overflowY: 'auto' }}>
                  <span style={{ fontSize: '0.75rem', fontWeight: 700, color: 'var(--text-tertiary)', textTransform: 'uppercase' }}>
                    Previous Review Comments ({comments.length})
                  </span>
                  <div style={{ display: 'flex', flexDirection: 'column', gap: '6px', marginTop: '6px' }}>
                    {comments.map((c) => (
                      <div key={c._id} style={{ padding: '6px 8px', borderRadius: 'var(--radius-sm)', background: 'var(--bg-surface-secondary)', fontSize: '0.75rem' }}>
                        <strong>{c.author?.name}:</strong> {c.content}
                      </div>
                    ))}
                  </div>
                </div>
              )}

              <div style={{ display: 'flex', justifyContent: 'flex-end', gap: 'var(--space-2)', marginTop: 'var(--space-5)' }}>
                <button type="button" className="btn btn-secondary" onClick={() => setDecisionModal(null)}>
                  Cancel
                </button>
                <button
                  type="submit"
                  className={decisionModal === 'approve' ? 'btn btn-primary' : 'btn btn-danger'}
                  disabled={submitting}
                >
                  {submitting
                    ? 'Submitting...'
                    : decisionModal === 'approve'
                    ? 'Confirm Approval'
                    : 'Submit Changes Request'}
                </button>
              </div>
            </form>
          </div>
        </div>
      )}
    </div>
  );
}
