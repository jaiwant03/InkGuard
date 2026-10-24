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
} from 'lucide-react';
import { WorkflowStatusBadge } from '../components/Badges';
import { api } from '../services/api';
import { useAuth } from '../context/AuthContext';
import { useToast } from '../context/ToastContext';

export default function ApprovalQueue() {
  const [drafts, setDrafts] = useState([]);
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
      const res = await api.drafts.list({
        status: activeTab === 'All' ? undefined : activeTab,
      });
      if (res.success) {
        setDrafts(res.data);
      }
    } catch (err) {
      toast.error('Failed to load queue: ' + err.message);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    loadQueue();
  }, [workspace, activeTab]);

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

  const handleAddComment = async (e) => {
    e.preventDefault();
    if (!newComment.trim() || !selectedDraft) return;

    try {
      const res = await api.drafts.addComment(selectedDraft._id, {
        content: newComment.trim(),
        type: 'general',
      });
      if (res.success) {
        setComments([...comments, res.data]);
        setNewComment('');
        toast.success('Comment posted.');
      }
    } catch (err) {
      toast.error('Failed to post comment: ' + err.message);
    }
  };

  const tabs = ['In Review', 'Changes Requested', 'Approved', 'Rejected', 'All'];

  const getStripeClass = (status) => {
    if (status === 'In Review') return 'in-review';
    if (status === 'Approved') return 'approved';
    if (status === 'Changes Requested') return 'changes-requested';
    if (status === 'Rejected') return 'rejected';
    return 'in-review';
  };

  const inReviewCount = drafts.filter((d) => d.status === 'In Review').length;
  const approvedCount = drafts.filter((d) => d.status === 'Approved').length;

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
              {inReviewCount} Awaiting Approval
            </span>
          </div>

          <h1 className="page-header-title text-gradient-amber">
            Approval Queue & Sign-Offs
          </h1>
          <p className="page-header-subtitle">
            Multi-stakeholder sign-off workflow ensuring content meets brand tone, legal policies, and approved claims.
          </p>
        </div>

        {/* Quick Metrics Bar */}
        <div style={{ display: 'flex', gap: '12px', alignItems: 'center', flexWrap: 'wrap' }}>
          <div
            style={{
              background: '#FFFFFF',
              padding: '8px 18px',
              borderRadius: '12px',
              border: '1px solid #E2E8F0',
              boxShadow: '0 1px 3px rgba(0,0,0,0.02)',
              minWidth: '110px',
            }}
          >
            <span style={{ fontSize: '0.7rem', fontWeight: 700, color: '#64748B', textTransform: 'uppercase', letterSpacing: '0.04em', display: 'block' }}>
              Awaiting Review
            </span>
            <span style={{ fontSize: '1.25rem', fontWeight: 800, color: '#D97706' }}>
              {inReviewCount}
            </span>
          </div>

          <div
            style={{
              background: '#FFFFFF',
              padding: '8px 18px',
              borderRadius: '12px',
              border: '1px solid #E2E8F0',
              boxShadow: '0 1px 3px rgba(0,0,0,0.02)',
              minWidth: '100px',
            }}
          >
            <span style={{ fontSize: '0.7rem', fontWeight: 700, color: '#64748B', textTransform: 'uppercase', letterSpacing: '0.04em', display: 'block' }}>
              Approved
            </span>
            <span style={{ fontSize: '1.25rem', fontWeight: 800, color: '#059669' }}>
              {approvedCount}
            </span>
          </div>
        </div>
      </div>

      {/* Unified Toolbar with Segmented Filter Controls */}
      <div className="facts-toolbar">
        <div style={{ display: 'flex', alignItems: 'center', gap: '8px' }}>
          <ClipboardList size={16} color="var(--color-primary)" />
          <span style={{ fontSize: '0.875rem', fontWeight: 700, color: '#0F172A' }}>
            Queue Submissions ({drafts.length})
          </span>
        </div>

        <div className="segmented-control">
          {tabs.map((tab) => (
            <button
              key={tab}
              onClick={() => setActiveTab(tab)}
              className={`segmented-btn ${activeTab === tab ? 'active' : ''}`}
            >
              {tab}
            </button>
          ))}
        </div>
      </div>

      {/* Drafts Queue List */}
      {drafts.length === 0 ? (
        <div className="card" style={{ textAlign: 'center', padding: 'var(--space-12)' }}>
          <ClipboardList size={44} color="var(--text-tertiary)" style={{ margin: '0 auto var(--space-3) auto' }} />
          <h3 style={{ fontSize: '1.125rem', fontWeight: 700, marginBottom: 'var(--space-1)' }}>
            No Drafts in "{activeTab}" Queue
          </h3>
          <p style={{ color: 'var(--text-secondary)' }}>
            All content submissions for this filter are up to date.
          </p>
        </div>
      ) : (
        <div style={{ display: 'flex', flexDirection: 'column', gap: '16px' }}>
          {drafts.map((draft) => {
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
