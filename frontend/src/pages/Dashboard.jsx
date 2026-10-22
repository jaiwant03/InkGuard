import React, { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import {
  FileCheck2,
  ShieldAlert,
  Clock,
  TrendingUp,
  ArrowRight,
  Plus,
  BookOpen,
  Sparkles,
  CheckCircle2,
  AlertTriangle,
  FileText,
  Palette,
  ShieldCheck,
} from 'lucide-react';
import BrandReferenceOverview from '../components/BrandReferenceOverview';
import { SeverityBadge, WorkflowStatusBadge } from '../components/Badges';
import { api } from '../services/api';
import { useAuth } from '../context/AuthContext';
import { ASSET_IMAGES } from '../assets/images';

export default function Dashboard() {
  const [metrics, setMetrics] = useState(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);
  const { workspace } = useAuth();
  const navigate = useNavigate();

  useEffect(() => {
    async function loadDashboard() {
      try {
        setLoading(true);
        const res = await api.dashboard.metrics();
        if (res.success) {
          setMetrics(res.data);
        }
      } catch (err) {
        setError(err.message || 'Failed to load dashboard metrics.');
      } finally {
        setLoading(false);
      }
    }
    loadDashboard();
  }, [workspace]);

  if (loading) {
    return (
      <div style={{ display: 'flex', flexDirection: 'column', gap: 'var(--space-6)' }}>
        <div style={{ height: '380px' }} className="skeleton card" />
        <div style={{ display: 'grid', gridTemplateColumns: 'repeat(4, 1fr)', gap: 'var(--space-6)' }}>
          {[1, 2, 3, 4].map((i) => (
            <div key={i} style={{ height: '120px' }} className="skeleton card" />
          ))}
        </div>
      </div>
    );
  }

  if (error) {
    return (
      <div className="card" style={{ textAlign: 'center', padding: 'var(--space-12)' }}>
        <ShieldAlert size={48} color="var(--severity-high)" style={{ margin: '0 auto var(--space-4) auto' }} />
        <h3 style={{ fontSize: '1.25rem', fontWeight: 700, marginBottom: 'var(--space-2)' }}>Unable to Load Metrics</h3>
        <p style={{ color: 'var(--text-secondary)', marginBottom: 'var(--space-4)' }}>{error}</p>
        <button className="btn btn-primary" onClick={() => window.location.reload()}>
          Retry Loading
        </button>
      </div>
    );
  }

  const {
    totalReviews = 0,
    averageScore = 92,
    openHighRiskCount = 0,
    pendingApprovalsCount = 0,
    recentReviews = [],
    recentDrafts = [],
    complianceTrend = [],
    issuesByCategory = [],
    topRules = [],
  } = metrics || {};

  return (
    <div style={{ display: 'flex', flexDirection: 'column', gap: 'var(--space-8)' }}>
      {/* Flagship Brand Compliance Validation Engine Card (Exact Reference Screenshot Layout) */}
      <BrandReferenceOverview
        score={averageScore || 92}
        title="Brand Compliance Validation Engine"
        documentTitle={recentDrafts[0]?.title || 'Corporate Brochure & Guidelines'}
        onRunAudit={() => navigate('/review')}
      />

      {/* 4 Stat Overview Cards with 3D Motion Elements */}
      <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(220px, 1fr))', gap: 'var(--space-5)' }}>
        {/* Card 1: Total Content Reviews */}
        <div className="card" style={{ display: 'flex', alignItems: 'center', gap: 'var(--space-4)', position: 'relative', overflow: 'hidden' }}>
          <div
            style={{
              width: '52px',
              height: '52px',
              borderRadius: 'var(--radius-lg)',
              background: 'linear-gradient(135deg, #2563EB, #3B82F6)',
              color: '#FFFFFF',
              display: 'flex',
              alignItems: 'center',
              justifyContent: 'center',
              flexShrink: 0,
              boxShadow: '0 4px 12px rgba(37, 99, 235, 0.3)',
            }}
          >
            <FileCheck2 size={26} />
          </div>
          <div>
            <span style={{ fontSize: '0.8125rem', color: 'var(--text-tertiary)', fontWeight: 600, textTransform: 'uppercase' }}>
              Total Audits
            </span>
            <div style={{ fontSize: '1.75rem', fontWeight: 800, color: 'var(--text-primary)', lineHeight: 1.1 }}>
              {totalReviews}
            </div>
          </div>
        </div>

        {/* Card 2: Average Compliance Score */}
        <div className="card" style={{ display: 'flex', alignItems: 'center', gap: 'var(--space-4)' }}>
          <div
            style={{
              width: '52px',
              height: '52px',
              borderRadius: 'var(--radius-lg)',
              background: '#ECFDF5',
              color: '#10B981',
              display: 'flex',
              alignItems: 'center',
              justifyContent: 'center',
              flexShrink: 0,
              boxShadow: '0 4px 12px rgba(16, 185, 129, 0.2)',
            }}
          >
            <TrendingUp size={26} />
          </div>
          <div>
            <span style={{ fontSize: '0.8125rem', color: 'var(--text-tertiary)', fontWeight: 600, textTransform: 'uppercase' }}>
              Avg Compliance
            </span>
            <div style={{ fontSize: '1.75rem', fontWeight: 800, color: 'var(--text-primary)', lineHeight: 1.1 }}>
              {averageScore ? `${averageScore}%` : '92%'}
            </div>
          </div>
        </div>

        {/* Card 3: Open High-Risk Findings */}
        <div className="card" style={{ display: 'flex', alignItems: 'center', gap: 'var(--space-4)' }}>
          <div
            style={{
              width: '52px',
              height: '52px',
              borderRadius: 'var(--radius-lg)',
              background: 'var(--severity-high-bg)',
              color: 'var(--severity-high)',
              display: 'flex',
              alignItems: 'center',
              justifyContent: 'center',
              flexShrink: 0,
              boxShadow: '0 4px 12px rgba(239, 68, 68, 0.2)',
            }}
          >
            <ShieldAlert size={26} />
          </div>
          <div>
            <span style={{ fontSize: '0.8125rem', color: 'var(--text-tertiary)', fontWeight: 600, textTransform: 'uppercase' }}>
              High-Risk Flags
            </span>
            <div style={{ fontSize: '1.75rem', fontWeight: 800, color: openHighRiskCount > 0 ? 'var(--severity-high)' : 'var(--text-primary)', lineHeight: 1.1 }}>
              {openHighRiskCount}
            </div>
          </div>
        </div>

        {/* Card 4: Pending Approvals */}
        <div className="card" style={{ display: 'flex', alignItems: 'center', gap: 'var(--space-4)' }}>
          <div
            style={{
              width: '52px',
              height: '52px',
              borderRadius: 'var(--radius-lg)',
              background: '#FFFBEB',
              color: '#F59E0B',
              display: 'flex',
              alignItems: 'center',
              justifyContent: 'center',
              flexShrink: 0,
              boxShadow: '0 4px 12px rgba(245, 158, 11, 0.2)',
            }}
          >
            <Clock size={26} />
          </div>
          <div>
            <span style={{ fontSize: '0.8125rem', color: 'var(--text-tertiary)', fontWeight: 600, textTransform: 'uppercase' }}>
              Pending Sign-Offs
            </span>
            <div style={{ fontSize: '1.75rem', fontWeight: 800, color: 'var(--text-primary)', lineHeight: 1.1 }}>
              {pendingApprovalsCount}
            </div>
          </div>
        </div>
      </div>

      {/* Row: Compliance Trend + Issues By Category */}
      <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(360px, 1fr))', gap: 'var(--space-6)' }}>
        {/* Compliance Trend Chart */}
        <div className="card">
          <div className="card-header">
            <div>
              <h3 className="card-title">Compliance Score Trend</h3>
              <p className="card-subtitle">Historical adherence scores over consecutive audits</p>
            </div>
          </div>

          {complianceTrend.length === 0 ? (
            <div style={{ padding: 'var(--space-8)', textAlign: 'center', color: 'var(--text-tertiary)' }}>
              No audits conducted yet. Start a content review to begin recording governance trendlines.
            </div>
          ) : (
            <div style={{ marginTop: 'var(--space-4)' }}>
              <div style={{ height: '180px', display: 'flex', alignItems: 'flex-end', gap: '12px', paddingBottom: '20px', borderBottom: '1px solid var(--border-light)' }}>
                {complianceTrend.map((pt, i) => (
                  <div key={i} style={{ flex: 1, display: 'flex', flexDirection: 'column', alignItems: 'center', gap: '6px' }}>
                    <span style={{ fontSize: '0.6875rem', fontWeight: 700, color: 'var(--text-secondary)' }}>
                      {pt.score}%
                    </span>
                    <div
                      style={{
                        width: '100%',
                        maxWidth: '32px',
                        height: `${Math.max(15, (pt.score / 100) * 120)}px`,
                        background: pt.score >= 90 ? '#10B981' : pt.score >= 75 ? '#2563EB' : pt.score >= 55 ? '#F59E0B' : '#EF4444',
                        borderRadius: 'var(--radius-sm)',
                        transition: 'height 0.4s ease',
                      }}
                    />
                    <span style={{ fontSize: '0.6875rem', color: 'var(--text-tertiary)' }}>
                      {pt.date}
                    </span>
                  </div>
                ))}
              </div>
            </div>
          )}
        </div>

        {/* Issues By Category */}
        <div className="card">
          <div className="card-header">
            <div>
              <h3 className="card-title">Findings by Category</h3>
              <p className="card-subtitle">Distribution of flagged issues across rule sets</p>
            </div>
          </div>

          {issuesByCategory.length === 0 ? (
            <div style={{ padding: 'var(--space-8)', textAlign: 'center', color: 'var(--text-tertiary)' }}>
              No active findings in the workspace. Great brand compliance!
            </div>
          ) : (
            <div style={{ display: 'flex', flexDirection: 'column', gap: 'var(--space-3)', marginTop: 'var(--space-3)' }}>
              {issuesByCategory.map((cat, idx) => {
                const maxCount = Math.max(...issuesByCategory.map((c) => c.count), 1);
                const percent = Math.round((cat.count / maxCount) * 100);
                return (
                  <div key={idx}>
                    <div style={{ display: 'flex', justifyContent: 'space-between', fontSize: '0.8125rem', marginBottom: '4px' }}>
                      <span style={{ fontWeight: 600, color: 'var(--text-primary)' }}>{cat.category}</span>
                      <span style={{ color: 'var(--text-tertiary)', fontWeight: 600 }}>{cat.count} flags</span>
                    </div>
                    <div style={{ height: '8px', background: 'var(--bg-surface-secondary)', borderRadius: '4px', overflow: 'hidden' }}>
                      <div
                        style={{
                          height: '100%',
                          width: `${percent}%`,
                          background: 'var(--gradient-primary)',
                          borderRadius: '4px',
                        }}
                      />
                    </div>
                  </div>
                );
              })}
            </div>
          )}
        </div>
      </div>

      {/* Row: Most Frequently Triggered Rules + Recent Documents with 3D Visual Accents */}
      <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(360px, 1fr))', gap: 'var(--space-6)' }}>
        {/* Most Triggered Rules */}
        <div className="card">
          <div className="card-header">
            <div>
              <h3 className="card-title">Frequently Triggered Rules</h3>
              <p className="card-subtitle">Guideline rules requiring the most frequent author revision</p>
            </div>
          </div>

          {topRules.length === 0 ? (
            <div style={{ padding: 'var(--space-6)', textAlign: 'center', color: 'var(--text-tertiary)' }}>
              No rules triggered yet.
            </div>
          ) : (
            <div style={{ display: 'flex', flexDirection: 'column', gap: 'var(--space-3)' }}>
              {topRules.map((rule, idx) => (
                <div
                  key={idx}
                  style={{
                    padding: '10px 12px',
                    borderRadius: 'var(--radius-md)',
                    background: 'var(--bg-surface-secondary)',
                    display: 'flex',
                    alignItems: 'center',
                    justifyContent: 'space-between',
                  }}
                >
                  <div style={{ minWidth: 0, paddingRight: '8px' }}>
                    <div style={{ fontSize: '0.8125rem', fontWeight: 600, color: 'var(--text-primary)', overflow: 'hidden', textOverflow: 'ellipsis', whiteSpace: 'nowrap' }}>
                      {rule.title}
                    </div>
                    <div style={{ fontSize: '0.75rem', color: 'var(--text-tertiary)', display: 'flex', gap: '8px', marginTop: '2px' }}>
                      <span>{rule.category}</span>
                    </div>
                  </div>
                  <div style={{ display: 'flex', alignItems: 'center', gap: '8px', flexShrink: 0 }}>
                    <SeverityBadge severity={rule.severity} />
                    <span style={{ fontSize: '0.75rem', fontWeight: 700, color: 'var(--text-secondary)' }}>
                      {rule.triggerCount}×
                    </span>
                  </div>
                </div>
              ))}
            </div>
          )}
        </div>

        {/* Recent Documents & Drafts */}
        <div className="card">
          <div className="card-header">
            <div>
              <h3 className="card-title">Recent Content Drafts</h3>
              <p className="card-subtitle">Latest marketing and communication submissions</p>
            </div>
            <button onClick={() => navigate('/review')} className="btn btn-secondary btn-sm">
              View All
            </button>
          </div>

          {recentDrafts.length === 0 ? (
            <div style={{ padding: 'var(--space-6)', textAlign: 'center', color: 'var(--text-tertiary)' }}>
              No content drafts created yet. Click "Audit New Content" to start!
            </div>
          ) : (
            <div style={{ display: 'flex', flexDirection: 'column', gap: 'var(--space-3)' }}>
              {recentDrafts.map((draft) => (
                <div
                  key={draft._id}
                  onClick={() => navigate(`/review/${draft._id}`)}
                  style={{
                    padding: '10px 12px',
                    borderRadius: 'var(--radius-md)',
                    border: '1px solid var(--border-light)',
                    cursor: 'pointer',
                    display: 'flex',
                    alignItems: 'center',
                    justifyContent: 'space-between',
                    transition: 'all var(--transition-fast)',
                  }}
                  onMouseEnter={(e) => (e.currentTarget.style.borderColor = 'var(--color-primary)')}
                  onMouseLeave={(e) => (e.currentTarget.style.borderColor = 'var(--border-light)')}
                >
                  <div style={{ display: 'flex', alignItems: 'center', gap: 'var(--space-3)', minWidth: 0 }}>
                    <div
                      style={{
                        width: '32px',
                        height: '32px',
                        borderRadius: 'var(--radius-sm)',
                        background: 'var(--color-primary-light)',
                        color: 'var(--color-primary)',
                        display: 'flex',
                        alignItems: 'center',
                        justifyContent: 'center',
                        flexShrink: 0,
                      }}
                    >
                      <FileText size={16} />
                    </div>
                    <div style={{ minWidth: 0 }}>
                      <div style={{ fontSize: '0.8125rem', fontWeight: 600, color: 'var(--text-primary)', overflow: 'hidden', textOverflow: 'ellipsis', whiteSpace: 'nowrap' }}>
                        {draft.title}
                      </div>
                      <div style={{ fontSize: '0.75rem', color: 'var(--text-tertiary)' }}>
                        {draft.contentType} • v{draft.currentVersion}
                      </div>
                    </div>
                  </div>

                  <div style={{ display: 'flex', alignItems: 'center', gap: 'var(--space-3)', flexShrink: 0 }}>
                    <WorkflowStatusBadge status={draft.status} />
                    <ArrowRight size={14} color="var(--text-tertiary)" />
                  </div>
                </div>
              ))}
            </div>
          )}
        </div>
      </div>
    </div>
  );
}
