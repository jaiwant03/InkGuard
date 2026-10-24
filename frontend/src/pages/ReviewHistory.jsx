import React, { useState, useEffect } from 'react';
import {
  History,
  Shield,
  Clock,
  User,
  FileText,
  CheckCircle2,
  AlertTriangle,
  ArrowRight,
  GitCommit,
  GitBranch,
  LogIn,
  Check,
  Search,
  Trash2,
  X,
  ShieldAlert,
  ShieldCheck,
  Sparkles,
  Filter,
  Layers,
  Calendar,
} from 'lucide-react';
import { api } from '../services/api';
import { useAuth } from '../context/AuthContext';
import { useToast } from '../context/ToastContext';

export default function ReviewHistory() {
  const [activeTab, setActiveTab] = useState('audit'); // 'audit' | 'versions'
  const [auditLogs, setAuditLogs] = useState([]);
  const [drafts, setDrafts] = useState([]);
  const [selectedDraftId, setSelectedDraftId] = useState('');
  const [versions, setVersions] = useState([]);
  const [loading, setLoading] = useState(true);

  // Search & Filter state
  const [searchQuery, setSearchQuery] = useState('');
  const [selectedCategory, setSelectedCategory] = useState('all'); // 'all' | 'reviews' | 'drafts' | 'rules' | 'security'

  // Modals state
  const [showClearModal, setShowClearModal] = useState(false);
  const [clearing, setClearing] = useState(false);
  const [deleteConfirmItem, setDeleteConfirmItem] = useState(null);
  const [deletingSingle, setDeletingSingle] = useState(false);

  const { workspace } = useAuth();
  const toast = useToast();

  const loadData = async () => {
    try {
      setLoading(true);
      const [auditRes, draftsRes] = await Promise.all([
        api.audit.list({ limit: 100 }),
        api.drafts.list(),
      ]);
      if (auditRes.success) setAuditLogs(auditRes.data);
      if (draftsRes.success) {
        setDrafts(draftsRes.data);
        if (draftsRes.data.length > 0 && !selectedDraftId) {
          setSelectedDraftId(draftsRes.data[0]._id);
        }
      }
    } catch (err) {
      toast.error('Failed to load history: ' + err.message);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    loadData();
  }, [workspace]);

  // Load versions when a draft is selected
  useEffect(() => {
    async function loadVersions() {
      if (!selectedDraftId) return;
      try {
        const res = await api.drafts.versions(selectedDraftId);
        if (res.success) {
          setVersions(res.data);
        }
      } catch (err) {
        // silent
      }
    }
    loadVersions();
  }, [selectedDraftId]);

  // Clear all history handler
  const handleClearAllHistory = async () => {
    try {
      setClearing(true);
      const res = await api.audit.clear();
      if (res.success) {
        toast.success(res.message || 'Audit history cleared successfully.');
        setAuditLogs([]);
        setShowClearModal(false);
      } else {
        toast.error(res.message || 'Failed to clear audit history.');
      }
    } catch (err) {
      toast.error('Failed to clear history: ' + err.message);
    } finally {
      setClearing(false);
    }
  };

  // Delete single history log
  const handleDeleteSingleLog = async () => {
    if (!deleteConfirmItem) return;
    try {
      setDeletingSingle(true);
      const res = await api.audit.delete(deleteConfirmItem._id);
      if (res.success) {
        toast.success('Audit record deleted.');
        setAuditLogs((prev) => prev.filter((item) => item._id !== deleteConfirmItem._id));
        setDeleteConfirmItem(null);
      } else {
        toast.error(res.message || 'Failed to delete record.');
      }
    } catch (err) {
      toast.error('Failed to delete record: ' + err.message);
    } finally {
      setDeletingSingle(false);
    }
  };

  const getActionBadgeClass = (action, entityType) => {
    const act = (action || '').toLowerCase();
    const ent = (entityType || '').toLowerCase();
    if (act.includes('login') || act.includes('auth')) return 'login';
    if (act.includes('review') || act.includes('approved') || act.includes('pass') || ent === 'reviewrun') return 'review';
    if (act.includes('draft') || ent === 'draft') return 'draft';
    if (act.includes('rule') || act.includes('guideline') || ent === 'brandrule') return 'rule';
    if (act.includes('fact') || act.includes('evidence') || ent === 'approvedfact') return 'fact';
    return 'system';
  };

  const formatActionName = (action) => {
    return (action || 'Action')
      .replace(/_/g, ' ')
      .toLowerCase()
      .replace(/\b\w/g, (c) => c.toUpperCase());
  };

  // Metric counts
  const reviewCount = auditLogs.filter(
    (l) => (l.action || '').toLowerCase().includes('review') || l.entityType === 'ReviewRun'
  ).length;
  const draftActionCount = auditLogs.filter(
    (l) => (l.action || '').toLowerCase().includes('draft') || l.entityType === 'Draft'
  ).length;
  const policyActionCount = auditLogs.filter((l) => {
    const a = (l.action || '').toLowerCase();
    return a.includes('rule') || a.includes('fact') || a.includes('login') || a.includes('auth');
  }).length;

  // Filtered logs
  const filteredLogs = auditLogs.filter((log) => {
    const act = (log.action || '').toLowerCase();
    const ent = (log.entityType || '').toLowerCase();

    if (selectedCategory === 'reviews' && !act.includes('review') && ent !== 'reviewrun') return false;
    if (selectedCategory === 'drafts' && !act.includes('draft') && ent !== 'draft') return false;
    if (selectedCategory === 'rules' && !act.includes('rule') && !act.includes('fact') && ent !== 'brandrule' && ent !== 'approvedfact') return false;
    if (selectedCategory === 'security' && !act.includes('login') && !act.includes('auth') && !act.includes('workspace')) return false;

    if (searchQuery.trim()) {
      const q = searchQuery.toLowerCase();
      const matchAction = (log.action || '').toLowerCase().includes(q);
      const matchActor = (log.actorName || log.actor?.name || '').toLowerCase().includes(q);
      const matchEntity = (log.entityType || '').toLowerCase().includes(q) || (log.entityId || '').toLowerCase().includes(q);
      const matchDetails = JSON.stringify(log.details || {}).toLowerCase().includes(q);
      return matchAction || matchActor || matchEntity || matchDetails;
    }

    return true;
  });

  // Helper to render parsed key-values as clean tag chips
  const renderDetailsPills = (details) => {
    if (!details || typeof details !== 'object' || Object.keys(details).length === 0) {
      return null;
    }

    const entries = Object.entries(details);

    return (
      <div style={{ display: 'flex', gap: '6px', flexWrap: 'wrap', marginTop: '8px' }}>
        {entries.map(([key, val]) => {
          let displayVal = typeof val === 'object' ? JSON.stringify(val) : String(val);
          let label = key === 'ip' ? 'IP' : key.replace(/([A-Z])/g, ' $1').toLowerCase();

          // Special styling for score
          if (key.toLowerCase() === 'score') {
            const num = Number(val);
            const isHigh = num >= 80;
            const isMed = num >= 50;
            return (
              <span
                key={key}
                style={{
                  display: 'inline-flex',
                  alignItems: 'center',
                  gap: '4px',
                  padding: '2px 8px',
                  borderRadius: '6px',
                  fontSize: '0.75rem',
                  fontWeight: 700,
                  background: isHigh ? '#ECFDF5' : isMed ? '#FFFBEB' : '#FEF2F2',
                  color: isHigh ? '#059669' : isMed ? '#D97706' : '#DC2626',
                  border: `1px solid ${isHigh ? '#A7F3D0' : isMed ? '#FDE68A' : '#FECACA'}`,
                }}
              >
                Score: {displayVal}
              </span>
            );
          }

          // Special styling for grade
          if (key.toLowerCase() === 'grade') {
            const isRisk = displayVal.toLowerCase().includes('risk') || displayVal.toLowerCase().includes('high');
            return (
              <span
                key={key}
                style={{
                  display: 'inline-flex',
                  alignItems: 'center',
                  gap: '4px',
                  padding: '2px 8px',
                  borderRadius: '6px',
                  fontSize: '0.75rem',
                  fontWeight: 700,
                  background: isRisk ? '#FEF2F2' : '#ECFDF5',
                  color: isRisk ? '#DC2626' : '#059669',
                  border: `1px solid ${isRisk ? '#FECACA' : '#A7F3D0'}`,
                }}
              >
                Grade: {displayVal}
              </span>
            );
          }

          // Special styling for findings
          if (key.toLowerCase().includes('finding')) {
            return (
              <span
                key={key}
                style={{
                  display: 'inline-flex',
                  alignItems: 'center',
                  gap: '4px',
                  padding: '2px 8px',
                  borderRadius: '6px',
                  fontSize: '0.75rem',
                  fontWeight: 650,
                  background: '#EFF6FF',
                  color: '#2563EB',
                  border: '1px solid #DBEAFE',
                }}
              >
                <AlertTriangle size={11} />
                Findings: {displayVal}
              </span>
            );
          }

          // Special styling for engine
          if (key.toLowerCase() === 'engine') {
            return (
              <span
                key={key}
                style={{
                  display: 'inline-flex',
                  alignItems: 'center',
                  gap: '4px',
                  padding: '2px 8px',
                  borderRadius: '6px',
                  fontSize: '0.75rem',
                  fontWeight: 650,
                  background: '#F5F3FF',
                  color: '#7C3AED',
                  border: '1px solid #DDD6FE',
                }}
              >
                Engine: {displayVal}
              </span>
            );
          }

          return (
            <span key={key} className="audit-tag-pill">
              <span style={{ color: '#94A3B8', textTransform: 'capitalize' }}>{label}:</span>
              <span style={{ color: '#0F172A', fontWeight: 650 }}>{displayVal}</span>
            </span>
          );
        })}
      </div>
    );
  };

  return (
    <div style={{ display: 'flex', flexDirection: 'column', gap: 'var(--space-6)' }}>
      {/* Modern Page Header */}
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
                background: '#EFF6FF',
                color: '#2563EB',
                fontSize: '0.6875rem',
                fontWeight: 700,
                border: '1px solid #DBEAFE',
                textTransform: 'uppercase',
                letterSpacing: '0.04em',
              }}
            >
              <Shield size={12} color="#2563EB" />
              Governance Ledger
            </span>
            <span style={{ fontSize: '0.75rem', color: '#94A3B8' }}>•</span>
            <span style={{ fontSize: '0.75rem', color: '#64748B', fontWeight: 600 }}>
              Immutable Compliance Timeline
            </span>
          </div>

          <h1 className="page-header-title text-gradient-primary">
            Review History & Audit Trail
          </h1>
          <p className="page-header-subtitle">
            Immutable corporate governance log, revision comparisons, and approval timelines ensuring complete compliance accountability.
          </p>
        </div>

        {/* Action Controls: Tabs & Delete All History Button */}
        <div style={{ display: 'flex', alignItems: 'center', gap: '12px', flexWrap: 'wrap' }}>
          <div className="segmented-control">
            <button
              onClick={() => setActiveTab('audit')}
              className={`segmented-option ${activeTab === 'audit' ? 'active' : ''}`}
            >
              <Shield size={14} />
              <span>Audit Trail ({auditLogs.length})</span>
            </button>
            <button
              onClick={() => setActiveTab('versions')}
              className={`segmented-option ${activeTab === 'versions' ? 'active' : ''}`}
            >
              <GitBranch size={14} />
              <span>Version History</span>
            </button>
          </div>

          {/* Delete All History Button */}
          {activeTab === 'audit' && (
            <button
              onClick={() => setShowClearModal(true)}
              disabled={auditLogs.length === 0}
              className="btn btn-secondary btn-sm"
              style={{
                borderRadius: '10px',
                padding: '8px 16px',
                fontWeight: 700,
                display: 'inline-flex',
                alignItems: 'center',
                gap: '6px',
                color: auditLogs.length > 0 ? '#DC2626' : '#94A3B8',
                background: auditLogs.length > 0 ? '#FEF2F2' : '#F8FAFC',
                borderColor: auditLogs.length > 0 ? '#FECACA' : '#E2E8F0',
                cursor: auditLogs.length > 0 ? 'pointer' : 'not-allowed',
                transition: 'all 0.2s ease',
              }}
              title={auditLogs.length > 0 ? 'Clear all audit trail records' : 'No records to clear'}
            >
              <Trash2 size={14} />
              <span>Clear History</span>
            </button>
          )}
        </div>
      </div>

      {/* TAB 1: AUDIT TRAIL TIMELINE */}
      {activeTab === 'audit' && (
        <div style={{ display: 'flex', flexDirection: 'column', gap: 'var(--space-5)' }}>
          {/* Executive Metric Ribbon */}
          <div
            style={{
              display: 'grid',
              gridTemplateColumns: 'repeat(auto-fit, minmax(220px, 1fr))',
              gap: '14px',
            }}
          >
            {/* Metric 1 */}
            <div
              style={{
                background: '#FFFFFF',
                border: '1px solid #E2E8F0',
                borderRadius: '14px',
                padding: '16px 20px',
                display: 'flex',
                flexDirection: 'column',
                gap: '8px',
                boxShadow: '0 1px 3px rgba(15, 23, 42, 0.03)',
              }}
            >
              <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between' }}>
                <span style={{ fontSize: '0.75rem', fontWeight: 700, color: '#64748B', textTransform: 'uppercase', letterSpacing: '0.04em' }}>
                  Total Events
                </span>
                <div
                  style={{
                    width: '32px',
                    height: '32px',
                    borderRadius: '8px',
                    background: '#EFF6FF',
                    color: '#2563EB',
                    display: 'flex',
                    alignItems: 'center',
                    justifyContent: 'center',
                  }}
                >
                  <History size={16} />
                </div>
              </div>
              <div style={{ fontSize: '1.65rem', fontWeight: 850, color: '#0F172A', letterSpacing: '-0.02em', lineHeight: 1 }}>
                {auditLogs.length}
              </div>
              <span style={{ fontSize: '0.75rem', color: '#64748B' }}>Recorded Ledger Events</span>
            </div>

            {/* Metric 2 */}
            <div
              style={{
                background: '#FFFFFF',
                border: '1px solid #E2E8F0',
                borderRadius: '14px',
                padding: '16px 20px',
                display: 'flex',
                flexDirection: 'column',
                gap: '8px',
                boxShadow: '0 1px 3px rgba(15, 23, 42, 0.03)',
              }}
            >
              <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between' }}>
                <span style={{ fontSize: '0.75rem', fontWeight: 700, color: '#64748B', textTransform: 'uppercase', letterSpacing: '0.04em' }}>
                  AI Audit Runs
                </span>
                <div
                  style={{
                    width: '32px',
                    height: '32px',
                    borderRadius: '8px',
                    background: '#ECFDF5',
                    color: '#059669',
                    display: 'flex',
                    alignItems: 'center',
                    justifyContent: 'center',
                  }}
                >
                  <CheckCircle2 size={16} />
                </div>
              </div>
              <div style={{ fontSize: '1.65rem', fontWeight: 850, color: '#0F172A', letterSpacing: '-0.02em', lineHeight: 1 }}>
                {reviewCount}
              </div>
              <span style={{ fontSize: '0.75rem', color: '#64748B' }}>Compliance Evaluations</span>
            </div>

            {/* Metric 3 */}
            <div
              style={{
                background: '#FFFFFF',
                border: '1px solid #E2E8F0',
                borderRadius: '14px',
                padding: '16px 20px',
                display: 'flex',
                flexDirection: 'column',
                gap: '8px',
                boxShadow: '0 1px 3px rgba(15, 23, 42, 0.03)',
              }}
            >
              <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between' }}>
                <span style={{ fontSize: '0.75rem', fontWeight: 700, color: '#64748B', textTransform: 'uppercase', letterSpacing: '0.04em' }}>
                  Content & Drafts
                </span>
                <div
                  style={{
                    width: '32px',
                    height: '32px',
                    borderRadius: '8px',
                    background: '#EEF2FF',
                    color: '#4F46E5',
                    display: 'flex',
                    alignItems: 'center',
                    justifyContent: 'center',
                  }}
                >
                  <FileText size={16} />
                </div>
              </div>
              <div style={{ fontSize: '1.65rem', fontWeight: 850, color: '#0F172A', letterSpacing: '-0.02em', lineHeight: 1 }}>
                {draftActionCount}
              </div>
              <span style={{ fontSize: '0.75rem', color: '#64748B' }}>Document Lifecycles</span>
            </div>

            {/* Metric 4 */}
            <div
              style={{
                background: '#FFFFFF',
                border: '1px solid #E2E8F0',
                borderRadius: '14px',
                padding: '16px 20px',
                display: 'flex',
                flexDirection: 'column',
                gap: '8px',
                boxShadow: '0 1px 3px rgba(15, 23, 42, 0.03)',
              }}
            >
              <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between' }}>
                <span style={{ fontSize: '0.75rem', fontWeight: 700, color: '#64748B', textTransform: 'uppercase', letterSpacing: '0.04em' }}>
                  Policy & Governance
                </span>
                <div
                  style={{
                    width: '32px',
                    height: '32px',
                    borderRadius: '8px',
                    background: '#FFFBEB',
                    color: '#D97706',
                    display: 'flex',
                    alignItems: 'center',
                    justifyContent: 'center',
                  }}
                >
                  <ShieldCheck size={16} />
                </div>
              </div>
              <div style={{ fontSize: '1.65rem', fontWeight: 850, color: '#0F172A', letterSpacing: '-0.02em', lineHeight: 1 }}>
                {policyActionCount}
              </div>
              <span style={{ fontSize: '0.75rem', color: '#64748B' }}>Rules & Verification Updates</span>
            </div>
          </div>

          {/* Interactive Search & Filter Toolbar */}
          <div className="facts-toolbar" style={{ flexWrap: 'wrap', gap: '12px' }}>
            {/* Search Input */}
            <div className="facts-toolbar-search" style={{ minWidth: '280px', flex: 1 }}>
              <Search size={15} color="var(--text-tertiary)" />
              <input
                type="text"
                placeholder="Search audit records by action, actor, or entity ID..."
                value={searchQuery}
                onChange={(e) => setSearchQuery(e.target.value)}
              />
              {searchQuery && (
                <button
                  type="button"
                  onClick={() => setSearchQuery('')}
                  style={{
                    background: 'none',
                    border: 'none',
                    color: '#94A3B8',
                    cursor: 'pointer',
                    padding: '2px',
                    display: 'flex',
                  }}
                >
                  <X size={14} />
                </button>
              )}
            </div>

            {/* Category Filter Pills */}
            <div className="segmented-control" style={{ background: '#F1F5F9' }}>
              <button
                type="button"
                onClick={() => setSelectedCategory('all')}
                className={`segmented-option ${selectedCategory === 'all' ? 'active' : ''}`}
                style={{ fontSize: '0.75rem', padding: '6px 12px' }}
              >
                All ({auditLogs.length})
              </button>
              <button
                type="button"
                onClick={() => setSelectedCategory('reviews')}
                className={`segmented-option ${selectedCategory === 'reviews' ? 'active' : ''}`}
                style={{ fontSize: '0.75rem', padding: '6px 12px' }}
              >
                Reviews ({reviewCount})
              </button>
              <button
                type="button"
                onClick={() => setSelectedCategory('drafts')}
                className={`segmented-option ${selectedCategory === 'drafts' ? 'active' : ''}`}
                style={{ fontSize: '0.75rem', padding: '6px 12px' }}
              >
                Drafts ({draftActionCount})
              </button>
              <button
                type="button"
                onClick={() => setSelectedCategory('rules')}
                className={`segmented-option ${selectedCategory === 'rules' ? 'active' : ''}`}
                style={{ fontSize: '0.75rem', padding: '6px 12px' }}
              >
                Policies ({policyActionCount})
              </button>
            </div>
          </div>

          {/* Audit Records Timeline */}
          {filteredLogs.length === 0 ? (
            <div className="card" style={{ padding: 'var(--space-12)', textAlign: 'center', color: 'var(--text-tertiary)' }}>
              <History size={42} color="#CBD5E1" style={{ margin: '0 auto 12px auto' }} />
              <h3 style={{ fontSize: '1rem', fontWeight: 750, color: '#334155', marginBottom: '4px' }}>
                {auditLogs.length === 0 ? 'Audit Ledger is Empty' : 'No Matching Audit Records Found'}
              </h3>
              <p style={{ fontSize: '0.8125rem', color: '#64748B', maxWidth: '440px', margin: '0 auto' }}>
                {auditLogs.length === 0
                  ? 'All events performed by team members and deterministic AI compliance scans will be securely recorded here.'
                  : `No records match your query "${searchQuery}". Try adjusting your search or category filter.`}
              </p>
              {searchQuery && (
                <button
                  type="button"
                  onClick={() => setSearchQuery('')}
                  className="btn btn-secondary btn-sm"
                  style={{ marginTop: '16px', borderRadius: '8px' }}
                >
                  Clear Search
                </button>
              )}
            </div>
          ) : (
            <div style={{ display: 'flex', flexDirection: 'column', gap: '10px' }}>
              {filteredLogs.map((log) => {
                const actionBadgeType = getActionBadgeClass(log.action, log.entityType);

                return (
                  <div key={log._id} className="audit-timeline-item">
                    {/* Action Icon Box */}
                    <div className={`audit-icon-box ${actionBadgeType}`}>
                      {actionBadgeType === 'login' ? (
                        <LogIn size={18} />
                      ) : actionBadgeType === 'review' ? (
                        <CheckCircle2 size={18} />
                      ) : actionBadgeType === 'draft' ? (
                        <FileText size={18} />
                      ) : actionBadgeType === 'rule' ? (
                        <GitCommit size={18} />
                      ) : actionBadgeType === 'fact' ? (
                        <ShieldCheck size={18} />
                      ) : (
                        <Shield size={18} />
                      )}
                    </div>

                    {/* Timeline Content */}
                    <div style={{ flex: 1, minWidth: 0 }}>
                      <div
                        style={{
                          display: 'flex',
                          justifyContent: 'space-between',
                          alignItems: 'center',
                          flexWrap: 'wrap',
                          gap: '6px',
                          marginBottom: '3px',
                        }}
                      >
                        <span style={{ fontSize: '0.9375rem', fontWeight: 750, color: '#0F172A' }}>
                          {formatActionName(log.action)}
                        </span>

                        <div style={{ display: 'flex', alignItems: 'center', gap: '8px' }}>
                          <div style={{ display: 'flex', alignItems: 'center', gap: '5px', fontSize: '0.75rem', color: '#64748B' }}>
                            <Clock size={12} color="#94A3B8" />
                            <span>{new Date(log.createdAt).toLocaleString()}</span>
                          </div>

                          {/* Quick single delete action */}
                          <button
                            type="button"
                            onClick={() => setDeleteConfirmItem(log)}
                            style={{
                              border: 'none',
                              background: 'transparent',
                              color: '#94A3B8',
                              cursor: 'pointer',
                              padding: '3px 6px',
                              borderRadius: '6px',
                              transition: 'all 0.18s ease',
                              display: 'flex',
                              alignItems: 'center',
                            }}
                            title="Delete this record"
                            onMouseEnter={(e) => {
                              e.currentTarget.style.color = '#DC2626';
                              e.currentTarget.style.background = '#FEF2F2';
                            }}
                            onMouseLeave={(e) => {
                              e.currentTarget.style.color = '#94A3B8';
                              e.currentTarget.style.background = 'transparent';
                            }}
                          >
                            <Trash2 size={13} />
                          </button>
                        </div>
                      </div>

                      {/* Actor & Entity Info */}
                      <div style={{ display: 'flex', alignItems: 'center', gap: '6px', fontSize: '0.8125rem', color: '#475569', flexWrap: 'wrap' }}>
                        <span style={{ display: 'inline-flex', alignItems: 'center', gap: '4px' }}>
                          <span
                            style={{
                              width: '18px',
                              height: '18px',
                              borderRadius: '50%',
                              background: '#2563EB',
                              color: '#FFFFFF',
                              display: 'inline-flex',
                              alignItems: 'center',
                              justifyContent: 'center',
                              fontSize: '0.625rem',
                              fontWeight: 700,
                            }}
                          >
                            {(log.actorName || log.actor?.name || 'S')[0].toUpperCase()}
                          </span>
                          Actor: <strong style={{ color: '#0F172A' }}>{log.actorName || log.actor?.name || 'System Engine'}</strong>
                        </span>
                        <span style={{ color: '#CBD5E1' }}>•</span>
                        <span>
                          Entity: <strong style={{ color: '#0F172A' }}>{log.entityType}</strong>{' '}
                          <span style={{ fontFamily: 'var(--font-mono)', fontSize: '0.72rem', color: '#64748B', background: '#F1F5F9', padding: '1px 6px', borderRadius: '4px' }}>
                            #{log.entityId ? log.entityId.slice(-6) : 'sys'}
                          </span>
                        </span>
                      </div>

                      {/* Render Parsed Detail Chips */}
                      {renderDetailsPills(log.details)}
                    </div>
                  </div>
                );
              })}
            </div>
          )}
        </div>
      )}

      {/* TAB 2: VERSIONS COMPARISON */}
      {activeTab === 'versions' && (
        <div style={{ display: 'grid', gridTemplateColumns: 'minmax(280px, 320px) 1fr', gap: 'var(--space-6)', alignItems: 'start' }}>
          {/* Draft selector */}
          <div className="card" style={{ padding: '20px' }}>
            <h3 className="card-title text-gradient-violet" style={{ fontSize: '0.9375rem', marginBottom: 'var(--space-3)' }}>
              Select Document
            </h3>
            <div style={{ display: 'flex', flexDirection: 'column', gap: '8px' }}>
              {drafts.map((d) => (
                <div
                  key={d._id}
                  onClick={() => setSelectedDraftId(d._id)}
                  style={{
                    padding: '12px 14px',
                    borderRadius: '12px',
                    cursor: 'pointer',
                    fontSize: '0.8125rem',
                    fontWeight: d._id === selectedDraftId ? 750 : 500,
                    color: d._id === selectedDraftId ? '#1D4ED8' : '#334155',
                    background: d._id === selectedDraftId ? '#EFF6FF' : '#F8FAFC',
                    border: '1.5px solid',
                    borderColor: d._id === selectedDraftId ? '#93C5FD' : '#E2E8F0',
                    boxShadow: d._id === selectedDraftId ? '0 2px 8px rgba(37, 99, 235, 0.12)' : 'none',
                    transition: 'all 0.2s ease',
                    overflow: 'hidden',
                    textOverflow: 'ellipsis',
                    whiteSpace: 'nowrap',
                  }}
                >
                  {d.title}
                </div>
              ))}
            </div>
          </div>

          {/* Versions list */}
          <div className="card" style={{ padding: '24px' }}>
            <div className="card-header" style={{ marginBottom: '16px' }}>
              <h3 className="card-title text-gradient-emerald">Version Snapshots ({versions.length})</h3>
            </div>

            {versions.length === 0 ? (
              <div style={{ padding: 'var(--space-8)', textAlign: 'center', color: 'var(--text-tertiary)' }}>
                No version records found for this document.
              </div>
            ) : (
              <div style={{ display: 'flex', flexDirection: 'column', gap: 'var(--space-4)' }}>
                {versions.map((v) => (
                  <div
                    key={v._id}
                    style={{
                      border: '1px solid #E2E8F0',
                      borderRadius: '14px',
                      padding: '18px',
                      background: '#F8FAFC',
                    }}
                  >
                    <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '8px' }}>
                      <span
                        style={{
                          padding: '3px 10px',
                          borderRadius: '6px',
                          background: '#E2E8F0',
                          color: '#0F172A',
                          fontSize: '0.75rem',
                          fontWeight: 750,
                          fontFamily: 'var(--font-mono)',
                        }}
                      >
                        Version {v.versionNumber}
                      </span>
                      <span style={{ fontSize: '0.75rem', color: '#64748B' }}>
                        {new Date(v.createdAt).toLocaleString()} by {v.createdBy?.name || 'Author'}
                      </span>
                    </div>

                    <div style={{ fontSize: '0.8125rem', fontWeight: 700, color: '#2563EB', marginBottom: '10px' }}>
                      {v.changeSummary}
                    </div>

                    <div
                      style={{
                        background: '#FFFFFF',
                        padding: '14px',
                        borderRadius: '10px',
                        fontSize: '0.875rem',
                        lineHeight: 1.6,
                        whiteSpace: 'pre-wrap',
                        border: '1px solid #E2E8F0',
                        maxHeight: '180px',
                        overflowY: 'auto',
                        color: '#334155',
                      }}
                    >
                      {v.content}
                    </div>
                  </div>
                ))}
              </div>
            )}
          </div>
        </div>
      )}

      {/* Clear All History Confirmation Modal */}
      {showClearModal && (
        <div className="modal-overlay" onClick={() => setShowClearModal(false)}>
          <div className="modal-content" style={{ maxWidth: '460px' }} onClick={(e) => e.stopPropagation()}>
            <div className="modal-header">
              <div style={{ display: 'flex', alignItems: 'center', gap: '12px' }}>
                <div
                  style={{
                    width: '40px',
                    height: '40px',
                    borderRadius: '12px',
                    background: '#FEF2F2',
                    border: '1px solid #FECACA',
                    display: 'flex',
                    alignItems: 'center',
                    justifyContent: 'center',
                    color: '#DC2626',
                    flexShrink: 0,
                  }}
                >
                  <ShieldAlert size={22} />
                </div>
                <div>
                  <h3 className="modal-title" style={{ fontSize: '1.15rem' }}>Clear Audit History?</h3>
                  <p className="modal-subtitle">Permanent action across governance ledger</p>
                </div>
              </div>
              <button
                type="button"
                className="modal-close-btn"
                onClick={() => setShowClearModal(false)}
              >
                <X size={16} />
              </button>
            </div>

            <div className="modal-body">
              <p style={{ fontSize: '0.875rem', color: '#475569', margin: 0, lineHeight: 1.55 }}>
                Are you sure you want to permanently delete all <strong>{auditLogs.length}</strong> recorded audit events from the governance ledger?
              </p>
              <div
                style={{
                  marginTop: '12px',
                  padding: '10px 14px',
                  borderRadius: '10px',
                  background: '#FFFBEB',
                  border: '1px solid #FDE68A',
                  fontSize: '0.78rem',
                  color: '#92400E',
                  display: 'flex',
                  alignItems: 'center',
                  gap: '8px',
                }}
              >
                <AlertTriangle size={15} color="#D97706" style={{ flexShrink: 0 }} />
                <span>This action cannot be undone. Historical compliance timestamps will be wiped.</span>
              </div>
            </div>

            <div className="modal-footer">
              <button
                type="button"
                className="btn btn-secondary btn-sm"
                onClick={() => setShowClearModal(false)}
                style={{ borderRadius: '10px', padding: '8px 18px', fontWeight: 600 }}
              >
                Cancel
              </button>
              <button
                type="button"
                className="btn btn-danger btn-sm"
                onClick={handleClearAllHistory}
                disabled={clearing}
                style={{
                  borderRadius: '10px',
                  padding: '8px 20px',
                  fontWeight: 700,
                  display: 'inline-flex',
                  alignItems: 'center',
                  gap: '6px',
                }}
              >
                <Trash2 size={14} />
                <span>{clearing ? 'Clearing History...' : 'Delete All History'}</span>
              </button>
            </div>
          </div>
        </div>
      )}

      {/* Delete Single Record Modal */}
      {deleteConfirmItem && (
        <div className="modal-overlay" onClick={() => setDeleteConfirmItem(null)}>
          <div className="modal-content" style={{ maxWidth: '440px' }} onClick={(e) => e.stopPropagation()}>
            <div className="modal-header">
              <div style={{ display: 'flex', alignItems: 'center', gap: '10px', color: '#DC2626' }}>
                <Trash2 size={20} />
                <h3 className="modal-title" style={{ fontSize: '1.125rem' }}>Delete Audit Record?</h3>
              </div>
              <button
                type="button"
                className="modal-close-btn"
                onClick={() => setDeleteConfirmItem(null)}
              >
                <X size={16} />
              </button>
            </div>

            <div className="modal-body">
              <p style={{ fontSize: '0.875rem', color: '#64748B', margin: 0, lineHeight: 1.5 }}>
                Remove record <strong>"{formatActionName(deleteConfirmItem.action)}"</strong> from the ledger?
              </p>
            </div>

            <div className="modal-footer">
              <button
                type="button"
                className="btn btn-secondary btn-sm"
                onClick={() => setDeleteConfirmItem(null)}
                style={{ borderRadius: '10px', padding: '8px 18px', fontWeight: 600 }}
              >
                Cancel
              </button>
              <button
                type="button"
                className="btn btn-danger btn-sm"
                onClick={handleDeleteSingleLog}
                disabled={deletingSingle}
                style={{ borderRadius: '10px', padding: '8px 20px', fontWeight: 700 }}
              >
                {deletingSingle ? 'Deleting...' : 'Delete Record'}
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}
