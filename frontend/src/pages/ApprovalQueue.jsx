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
      {/* Reference UI Hero Showcase Card with 3D Motion */}
      <div
        style={{
          background: '#FFFFFF',
          borderRadius: 'var(--radius-2xl)',
          padding: 'var(--space-6)',
          border: '1px solid #E2E8F0',
          boxShadow: '0 20px 50px -10px rgba(15, 23, 42, 0.08)',
          display: 'grid',
          gridTemplateColumns: '260px minmax(0, 1fr) 280px',
          gap: 'var(--space-6)',
          alignItems: 'center',
        }}
      >
        {/* Left: 3D Governance Mascot Shield with Motion */}
        <div style={{ textAlign: 'center' }}>
          <span style={{ fontSize: '0.75rem', fontWeight: 700, color: '#64748B', textTransform: 'uppercase', letterSpacing: '0.05em', display: 'block', marginBottom: '8px' }}>
            Governance Gatekeeper
          </span>
          <div
            className="motion-mascot"
            style={{
              width: '140px',
              height: '140px',
              margin: '0 auto',
              borderRadius: '50%',
              overflow: 'hidden',
              boxShadow: '0 16px 36px -6px rgba(37, 99, 235, 0.3)',
              border: '2px solid #DBEAFE',
              background: 'radial-gradient(circle, #EFF6FF 0%, #DBEAFE 100%)',
            }}
          >
            <img
              src={ASSET_IMAGES.governanceShield}
              alt="Governance Mascot 3D"
              style={{ width: '100%', height: '100%', objectFit: 'cover', display: 'block' }}
            />
          </div>
          <div style={{ marginTop: '8px', display: 'inline-flex', alignItems: 'center', gap: '6px', fontSize: '0.75rem', color: '#10B981', fontWeight: 600, background: '#ECFDF5', padding: '3px 10px', borderRadius: '999px' }}>
            <span className="motion-pulse-check" style={{ width: '7px', height: '7px', borderRadius: '50%', background: '#10B981', display: 'inline-block' }} />
            Tier-2 Approval Active
          </div>
        </div>

        {/* Center: Queue Overview & Metrics */}
        <div>
          <div style={{ display: 'flex', alignItems: 'center', gap: '8px', marginBottom: '6px' }}>
            <span className="badge" style={{ background: '#EFF6FF', color: '#2563EB', border: '1px solid #BFDBFE' }}>
              Workflow Governance
            </span>
            <span style={{ fontSize: '0.8125rem', color: '#64748B' }}>
              {drafts.length} Documents in Current View
            </span>
          </div>
          <h1 style={{ fontSize: '1.5rem', fontWeight: 800, color: '#0F172A', letterSpacing: '-0.02em', marginBottom: '6px' }}>
            Human Review & Approval Queue
          </h1>
          <p style={{ fontSize: '0.875rem', color: '#475569', lineHeight: 1.5, marginBottom: 'var(--space-4)' }}>
            Collaborative sign-off workflow ensuring all public content meets brand consistency, regulatory compliance, and accuracy standards.
          </p>

          {/* Quick Metrics Bar */}
          <div style={{ display: 'flex', gap: 'var(--space-4)', flexWrap: 'wrap' }}>
            <div style={{ background: '#F8FAFC', padding: '8px 14px', borderRadius: 'var(--radius-lg)', border: '1px solid #E2E8F0' }}>
              <span style={{ fontSize: '0.75rem', color: '#64748B', display: 'block' }}>Awaiting Review</span>
              <span style={{ fontSize: '1.125rem', fontWeight: 800, color: '#F59E0B' }}>
                {drafts.filter(d => d.status === 'In Review').length}
              </span>
            </div>
            <div style={{ background: '#F8FAFC', padding: '8px 14px', borderRadius: 'var(--radius-lg)', border: '1px solid #E2E8F0' }}>
              <span style={{ fontSize: '0.75rem', color: '#64748B', display: 'block' }}>Approved This Cycle</span>
              <span style={{ fontSize: '1.125rem', fontWeight: 800, color: '#10B981' }}>
                {drafts.filter(d => d.status === 'Approved').length}
              </span>
            </div>
            <div style={{ background: '#F8FAFC', padding: '8px 14px', borderRadius: 'var(--radius-lg)', border: '1px solid #E2E8F0' }}>
              <span style={{ fontSize: '0.75rem', color: '#64748B', display: 'block' }}>SLA Compliance</span>
              <span style={{ fontSize: '1.125rem', fontWeight: 800, color: '#2563EB' }}>100% On-Time</span>
            </div>
          </div>
        </div>

        {/* Right: Extracted Guidelines & Compliance Badges */}
        <div style={{ background: '#F8FAFC', padding: 'var(--space-4)', borderRadius: 'var(--radius-xl)', border: '1px solid #E2E8F0' }}>
          <div style={{ fontSize: '0.75rem', fontWeight: 700, color: '#475569', textTransform: 'uppercase', marginBottom: '8px' }}>
            Extracted Guidelines
          </div>
          <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', background: '#FFFFFF', padding: '6px 10px', borderRadius: 'var(--radius-md)', marginBottom: '8px', border: '1px solid #E2E8F0' }}>
            <span style={{ fontSize: '0.8125rem', fontWeight: 600, color: '#0F172A' }}>Logo Usage</span>
            <span style={{ fontSize: '0.75rem', color: '#2563EB', fontWeight: 700 }}>Dolorow</span>
          </div>
          <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', background: '#FFFFFF', padding: '6px 10px', borderRadius: 'var(--radius-md)', marginBottom: '8px', border: '1px solid #E2E8F0' }}>
            <span style={{ fontSize: '0.8125rem', color: '#475569' }}>Messaging Tone</span>
            <span style={{ fontSize: '0.6875rem', background: '#EFF6FF', color: '#2563EB', padding: '2px 8px', borderRadius: '999px', fontWeight: 600 }}>Setew</span>
          </div>

          <div style={{ fontSize: '0.75rem', fontWeight: 700, color: '#475569', textTransform: 'uppercase', margin: '10px 0 6px 0' }}>
            Typography Checker
          </div>
          <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', background: '#FFFFFF', padding: '6px 10px', borderRadius: 'var(--radius-md)', border: '1px solid #E2E8F0' }}>
            <span style={{ fontSize: '0.75rem', fontWeight: 700, color: '#0F172A' }}>Lato Bold</span>
            <div className="motion-pulse-check" style={{ width: '18px', height: '18px', borderRadius: '50%', background: '#10B981', color: '#FFFFFF', display: 'flex', alignItems: 'center', justifyContent: 'center' }}>
              <Check size={11} strokeWidth={3} />
            </div>
          </div>
        </div>
      </div>

      {/* Header */}
      <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', flexWrap: 'wrap', gap: 'var(--space-4)' }}>
        <div>
          <h2 style={{ fontSize: '1.25rem', fontWeight: 800, color: 'var(--text-primary)' }}>
            Review Queue Submissions
          </h2>
          <p style={{ fontSize: '0.875rem', color: 'var(--text-secondary)' }}>
            Collaborative sign-off workflow for brand managers, legal reviewers, and content authors.
          </p>
        </div>

        <div style={{ display: 'flex', gap: 'var(--space-2)', background: 'var(--bg-surface-secondary)', padding: '4px', borderRadius: 'var(--radius-lg)' }}>
          {tabs.map((tab) => (
            <button
              key={tab}
              onClick={() => setActiveTab(tab)}
              className="btn btn-sm"
              style={{
                background: activeTab === tab ? 'var(--bg-surface)' : 'transparent',
                color: activeTab === tab ? 'var(--color-primary)' : 'var(--text-secondary)',
                boxShadow: activeTab === tab ? 'var(--shadow-sm)' : 'none',
                fontWeight: 600,
              }}
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
