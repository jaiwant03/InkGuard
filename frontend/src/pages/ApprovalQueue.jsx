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
} from 'lucide-react';
import { WorkflowStatusBadge } from '../components/Badges';
import { api } from '../services/api';
import { useAuth } from '../context/AuthContext';
import { useToast } from '../context/ToastContext';
import { ASSET_IMAGES } from '../assets/images';
import { Check } from 'lucide-react';

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

  return (
    <div style={{ display: 'flex', flexDirection: 'column', gap: 'var(--space-6)' }}>
      {/* Clean Modern Page Header Banner */}
      <div className="page-header-clean">
        <div className="page-header-info">
          <div style={{ display: 'flex', alignItems: 'center', gap: '8px', marginBottom: '4px' }}>
            <span className="badge badge-warning">
              <ClipboardList size={12} style={{ display: 'inline', marginRight: '4px' }} />
              Sign-off Gatekeeper
            </span>
            <span style={{ fontSize: '0.8125rem', color: 'var(--text-tertiary)' }}>
              {drafts.filter((d) => d.status === 'In Review').length} Awaiting Approval
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
        <div style={{ display: 'flex', gap: '10px', flexWrap: 'wrap', alignItems: 'center' }}>
          <div style={{ background: '#FFFFFF', padding: '8px 14px', borderRadius: '12px', border: '1px solid #E2E8F0', boxShadow: '0 1px 3px rgba(0,0,0,0.02)' }}>
            <span style={{ fontSize: '0.75rem', color: '#64748B', display: 'block' }}>Awaiting Review</span>
            <span style={{ fontSize: '1.125rem', fontWeight: 800, color: '#D97706' }}>
              {drafts.filter((d) => d.status === 'In Review').length}
            </span>
          </div>
          <div style={{ background: '#FFFFFF', padding: '8px 14px', borderRadius: '12px', border: '1px solid #E2E8F0', boxShadow: '0 1px 3px rgba(0,0,0,0.02)' }}>
            <span style={{ fontSize: '0.75rem', color: '#64748B', display: 'block' }}>Approved</span>
            <span style={{ fontSize: '1.125rem', fontWeight: 800, color: '#059669' }}>
              {drafts.filter((d) => d.status === 'Approved').length}
            </span>
          </div>
        </div>
      </div>

      {/* Tabs */}
      <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', flexWrap: 'wrap', gap: 'var(--space-4)' }}>
        <div>
          <h2 className="text-gradient-blue" style={{ fontSize: '1.25rem', fontWeight: 800, margin: 0 }}>
            Review Queue Submissions
          </h2>
          <p style={{ fontSize: '0.875rem', color: '#64748B', marginTop: '2px', margin: '2px 0 0 0' }}>
            Collaborative sign-off workflow for brand managers, legal reviewers, and content authors.
          </p>
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
        <div style={{ display: 'flex', flexDirection: 'column', gap: 'var(--space-4)' }}>
          {drafts.map((draft) => (
            <div
              key={draft._id}
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
              <div style={{ minWidth: 0, flex: 1 }}>
                <div style={{ display: 'flex', alignItems: 'center', gap: '8px', marginBottom: '6px' }}>
                  <h4 style={{ fontSize: '1rem', fontWeight: 700, color: 'var(--text-primary)' }}>
                    {draft.title}
                  </h4>
                  <WorkflowStatusBadge status={draft.status} />
                  <span className="badge badge-neutral">v{draft.currentVersion}</span>
                </div>

                <div style={{ fontSize: '0.8125rem', color: 'var(--text-secondary)', marginBottom: '8px', lineHeight: 1.4 }}>
                  {draft.currentContent.slice(0, 140)}...
                </div>

                <div style={{ display: 'flex', gap: 'var(--space-4)', fontSize: '0.75rem', color: 'var(--text-tertiary)' }}>
                  <span>Author: <strong>{draft.author?.name}</strong></span>
                  <span>Type: <strong>{draft.contentType}</strong></span>
                  <span>
                    Compliance Score:{' '}
                    <strong>{draft.latestComplianceScore !== null ? `${draft.latestComplianceScore}%` : 'Not run'}</strong>
                  </span>
                  <span>Updated: {new Date(draft.updatedAt).toLocaleDateString()}</span>
                </div>
              </div>

              {/* Action Controls */}
              <div style={{ display: 'flex', alignItems: 'center', gap: 'var(--space-2)' }}>
                <button
                  onClick={() => navigate(`/review/${draft._id}`)}
                  className="btn btn-secondary btn-sm"
                >
                  Inspect Audit <ArrowRight size={13} />
                </button>

                {isReviewer && draft.status === 'In Review' && (
                  <>
                    <button
                      onClick={() => handleOpenDecision(draft, 'request_changes')}
                      className="btn btn-secondary btn-sm"
                      style={{ color: '#B45309' }}
                    >
                      <AlertCircle size={14} /> Request Changes
                    </button>
                    <button
                      onClick={() => handleOpenDecision(draft, 'approve')}
                      className="btn btn-primary btn-sm"
                    >
                      <CheckCircle2 size={14} /> Approve
                    </button>
                  </>
                )}
              </div>
            </div>
          ))}
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
