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

  return (
    <div style={{ display: 'flex', flexDirection: 'column', gap: 'var(--space-6)' }}>
      {/* Header */}
      <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', flexWrap: 'wrap', gap: 'var(--space-4)' }}>
        <div>
          <h2 style={{ fontSize: '1.25rem', fontWeight: 800, color: 'var(--text-primary)' }}>
            Review History & Audit Trail
          </h2>
          <p style={{ fontSize: '0.875rem', color: 'var(--text-secondary)' }}>
            Immutable corporate governance log, revision comparisons, and approval timelines.
          </p>
        </div>

        <div style={{ display: 'flex', gap: 'var(--space-2)', background: 'var(--bg-surface-secondary)', padding: '4px', borderRadius: 'var(--radius-lg)' }}>
          <button
            onClick={() => setActiveTab('audit')}
            className="btn btn-sm"
            style={{
              background: activeTab === 'audit' ? 'var(--bg-surface)' : 'transparent',
              color: activeTab === 'audit' ? 'var(--color-primary)' : 'var(--text-secondary)',
              boxShadow: activeTab === 'audit' ? 'var(--shadow-sm)' : 'none',
              fontWeight: 600,
            }}
          >
            <Shield size={14} /> Audit Trail ({auditLogs.length})
          </button>
          <button
            onClick={() => setActiveTab('versions')}
            className="btn btn-sm"
            style={{
              background: activeTab === 'versions' ? 'var(--bg-surface)' : 'transparent',
              color: activeTab === 'versions' ? 'var(--color-primary)' : 'var(--text-secondary)',
              boxShadow: activeTab === 'versions' ? 'var(--shadow-sm)' : 'none',
              fontWeight: 600,
            }}
          >
            <GitBranch size={14} /> Version History
          </button>
        </div>
      </div>

      {/* TAB 1: AUDIT TRAIL TIMELINE */}
      {activeTab === 'audit' && (
        <div className="card" style={{ padding: 'var(--space-6)' }}>
          <h3 className="card-title" style={{ marginBottom: 'var(--space-4)' }}>
            <History size={18} /> Governance Event Log
          </h3>

          {auditLogs.length === 0 ? (
            <div style={{ padding: 'var(--space-8)', textAlign: 'center', color: 'var(--text-tertiary)' }}>
              No audit records stored yet.
            </div>
          ) : (
            <div style={{ display: 'flex', flexDirection: 'column', gap: 'var(--space-3)' }}>
              {auditLogs.map((log) => (
                <div
                  key={log._id}
                  style={{
                    display: 'flex',
                    alignItems: 'flex-start',
                    gap: 'var(--space-4)',
                    padding: '12px 14px',
                    borderRadius: 'var(--radius-lg)',
                    background: 'var(--bg-surface-secondary)',
                    border: '1px solid var(--border-light)',
                  }}
                >
                  <div
                    style={{
                      width: '32px',
                      height: '32px',
                      borderRadius: 'var(--radius-full)',
                      background: 'var(--color-primary-light)',
                      color: 'var(--color-primary)',
                      display: 'flex',
                      alignItems: 'center',
                      justifyContent: 'center',
                      flexShrink: 0,
                      marginTop: '2px',
                    }}
                  >
                    <GitCommit size={16} />
                  </div>

                  <div style={{ flex: 1, minWidth: 0 }}>
                    <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', flexWrap: 'wrap', gap: '4px' }}>
                      <span style={{ fontSize: '0.875rem', fontWeight: 700, color: 'var(--text-primary)' }}>
                        {log.action.replace(/_/g, ' ')}
                      </span>
                      <span style={{ fontSize: '0.75rem', color: 'var(--text-tertiary)' }}>
                        {new Date(log.createdAt).toLocaleString()}
                      </span>
                    </div>

                    <div style={{ fontSize: '0.8125rem', color: 'var(--text-secondary)', marginTop: '2px' }}>
                      Actor: <strong>{log.actorName || log.actor?.name || 'System Engine'}</strong> • Entity: {log.entityType} ({log.entityId.slice(-6)})
                    </div>

                    {log.details && Object.keys(log.details).length > 0 && (
                      <div
                        style={{
                          marginTop: '6px',
                          background: 'rgba(255, 255, 255, 0.7)',
                          padding: '6px 10px',
                          borderRadius: 'var(--radius-sm)',
                          fontSize: '0.75rem',
                          fontFamily: 'var(--font-mono)',
                          color: 'var(--text-secondary)',
                          overflowX: 'auto',
                        }}
                      >
                        {JSON.stringify(log.details)}
                      </div>
                    )}
                  </div>
                </div>
              ))}
            </div>
          )}
        </div>
      )}

      {/* TAB 2: VERSIONS COMPARISON */}
      {activeTab === 'versions' && (
        <div style={{ display: 'grid', gridTemplateColumns: '320px 1fr', gap: 'var(--space-6)', alignItems: 'start' }}>
          {/* Draft selector */}
          <div className="card">
            <h3 className="card-title" style={{ fontSize: '0.9375rem', marginBottom: 'var(--space-3)' }}>
              Select Document
            </h3>
            <div style={{ display: 'flex', flexDirection: 'column', gap: '6px' }}>
              {drafts.map((d) => (
                <div
                  key={d._id}
                  onClick={() => setSelectedDraftId(d._id)}
                  style={{
                    padding: '8px 10px',
                    borderRadius: 'var(--radius-sm)',
                    cursor: 'pointer',
                    fontSize: '0.8125rem',
                    fontWeight: d._id === selectedDraftId ? 700 : 500,
                    color: d._id === selectedDraftId ? 'var(--color-primary)' : 'var(--text-primary)',
                    background: d._id === selectedDraftId ? 'var(--color-primary-light)' : 'transparent',
                    border: '1px solid',
                    borderColor: d._id === selectedDraftId ? 'var(--color-primary-subtle)' : 'transparent',
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
          <div className="card">
            <div className="card-header">
              <h3 className="card-title">Version Snapshots ({versions.length})</h3>
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
                      border: '1px solid var(--border-light)',
                      borderRadius: 'var(--radius-lg)',
                      padding: 'var(--space-4)',
                      background: 'var(--bg-surface-secondary)',
                    }}
                  >
                    <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '6px' }}>
                      <span className="badge badge-neutral" style={{ fontWeight: 700 }}>
                        Version {v.versionNumber}
                      </span>
                      <span style={{ fontSize: '0.75rem', color: 'var(--text-tertiary)' }}>
                        {new Date(v.createdAt).toLocaleString()} by {v.createdBy?.name || 'Author'}
                      </span>
                    </div>

                    <div style={{ fontSize: '0.8125rem', fontWeight: 600, color: 'var(--color-primary)', marginBottom: '8px' }}>
                      {v.changeSummary}
                    </div>

                    <div
                      style={{
                        background: 'var(--bg-surface)',
                        padding: '10px',
                        borderRadius: 'var(--radius-md)',
                        fontSize: '0.875rem',
                        lineHeight: 1.6,
                        whiteSpace: 'pre-wrap',
                        border: '1px solid var(--border-light)',
                        maxHeight: '180px',
                        overflowY: 'auto',
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
