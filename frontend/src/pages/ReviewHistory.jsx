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
  SlidersHorizontal,
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

  const { workspace } = useAuth();
  const toast = useToast();

  useEffect(() => {
    async function loadData() {
      try {
        setLoading(true);
        const [auditRes, draftsRes] = await Promise.all([
          api.audit.list({ limit: 60 }),
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
    }
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

  const getActionBadgeClass = (action) => {
    const act = (action || '').toLowerCase();
    if (act.includes('login') || act.includes('auth')) return 'login';
    if (act.includes('review') || act.includes('approved') || act.includes('pass')) return 'review';
    if (act.includes('rule') || act.includes('guideline')) return 'rule';
    if (act.includes('fact') || act.includes('evidence')) return 'fact';
    return 'system';
  };

  const formatActionName = (action) => {
    return (action || 'Action')
      .replace(/_/g, ' ')
      .toLowerCase()
      .replace(/\b\w/g, (c) => c.toUpperCase());
  };

  // Helper to render parsed key-values as clean tag chips rather than raw JSON
  const renderDetailsPills = (details) => {
    if (!details || typeof details !== 'object' || Object.keys(details).length === 0) {
      return null;
    }

    const entries = Object.entries(details);

    return (
      <div style={{ display: 'flex', gap: '6px', flexWrap: 'wrap', marginTop: '8px' }}>
        {entries.map(([key, val]) => {
          let displayVal = typeof val === 'object' ? JSON.stringify(val) : String(val);
          let label = key === 'ip' ? 'Client IP' : key.replace(/([A-Z])/g, ' $1').toLowerCase();

          return (
            <span key={key} className="audit-tag-pill">
              <span style={{ color: '#94A3B8', textTransform: 'capitalize' }}>{label}:</span>
              <span style={{ color: '#0F172A', fontWeight: 700 }}>{displayVal}</span>
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

        {/* Tab Controls */}
        <div style={{ display: 'flex', alignItems: 'center', gap: 'var(--space-4)', flexWrap: 'wrap' }}>
          <div className="segmented-control">
            <button
              onClick={() => setActiveTab('audit')}
              className={`segmented-btn ${activeTab === 'audit' ? 'active' : ''}`}
            >
              <Shield size={14} /> Audit Trail ({auditLogs.length})
            </button>
            <button
              onClick={() => setActiveTab('versions')}
              className={`segmented-btn ${activeTab === 'versions' ? 'active' : ''}`}
            >
              <GitBranch size={14} /> Version History
            </button>
          </div>
        </div>
      </div>

      {/* TAB 1: AUDIT TRAIL TIMELINE */}
      {activeTab === 'audit' && (
        <div style={{ display: 'flex', flexDirection: 'column', gap: 'var(--space-4)' }}>
          {/* Header Bar */}
          <div className="facts-toolbar">
            <div style={{ display: 'flex', alignItems: 'center', gap: '8px' }}>
              <History size={16} color="var(--color-primary)" />
              <span style={{ fontSize: '0.875rem', fontWeight: 750, color: '#0F172A' }}>
                Governance Event Log ({auditLogs.length} Records)
              </span>
            </div>

            <span style={{ fontSize: '0.75rem', color: '#64748B', fontWeight: 600 }}>
              Showing latest verified ledger entries
            </span>
          </div>

          {auditLogs.length === 0 ? (
            <div className="card" style={{ padding: 'var(--space-12)', textAlign: 'center', color: 'var(--text-tertiary)' }}>
              <History size={40} color="#CBD5E1" style={{ margin: '0 auto 12px auto' }} />
              <h3 style={{ fontSize: '1rem', fontWeight: 700, color: '#334155', marginBottom: '4px' }}>
                No Audit Records Stored Yet
              </h3>
              <p style={{ fontSize: '0.8125rem', color: '#64748B' }}>
                Actions performed by team members and the deterministic AI engine will be permanently recorded here.
              </p>
            </div>
          ) : (
            <div style={{ display: 'flex', flexDirection: 'column', gap: '10px' }}>
              {auditLogs.map((log) => {
                const actionBadgeType = getActionBadgeClass(log.action);

                return (
                  <div key={log._id} className="audit-timeline-item">
                    {/* Action Icon Box */}
                    <div className={`audit-icon-box ${actionBadgeType}`}>
                      {actionBadgeType === 'login' ? (
                        <LogIn size={18} />
                      ) : actionBadgeType === 'review' ? (
                        <CheckCircle2 size={18} />
                      ) : actionBadgeType === 'rule' ? (
                        <GitCommit size={18} />
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
                        <div style={{ display: 'flex', alignItems: 'center', gap: '5px', fontSize: '0.75rem', color: '#64748B' }}>
                          <Clock size={12} color="#94A3B8" />
                          <span>{new Date(log.createdAt).toLocaleString()}</span>
                        </div>
                      </div>

                      {/* Actor & Entity Info */}
                      <div style={{ display: 'flex', alignItems: 'center', gap: '6px', fontSize: '0.8125rem', color: '#475569', flexWrap: 'wrap' }}>
                        <span>
                          Actor: <strong style={{ color: '#0F172A' }}>{log.actorName || log.actor?.name || 'System Engine'}</strong>
                        </span>
                        <span style={{ color: '#CBD5E1' }}>•</span>
                        <span>
                          Entity: <strong style={{ color: '#0F172A' }}>{log.entityType}</strong>{' '}
                          <span style={{ fontFamily: 'var(--font-mono)', fontSize: '0.75rem', color: '#64748B' }}>
                            ({log.entityId ? log.entityId.slice(-6) : 'system'})
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
    </div>
  );
}
