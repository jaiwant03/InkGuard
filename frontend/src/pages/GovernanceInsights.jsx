import React, { useState, useEffect } from 'react';
import {
  TrendingUp,
  AlertTriangle,
  Clock,
  CheckCircle2,
  FileText,
  Shield,
  HelpCircle,
  BarChart3,
  RefreshCw,
  Info,
  ChevronRight,
  BookOpen,
} from 'lucide-react';
import { api } from '../services/api';
import { useAuth } from '../context/AuthContext';
import { useToast } from '../context/ToastContext';
import { SeverityBadge } from '../components/Badges';
import { ASSET_IMAGES } from '../assets/images';

export default function GovernanceInsights() {
  const [data, setData] = useState(null);
  const [loading, setLoading] = useState(true);
  const { workspace } = useAuth();
  const toast = useToast();

  const loadInsights = async () => {
    try {
      setLoading(true);
      const res = await api.insights.get();
      if (res.success) {
        setData(res.data);
      }
    } catch (err) {
      toast.error('Failed to load governance insights: ' + err.message);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    loadInsights();
  }, [workspace]);

  const formatSeconds = (sec) => {
    if (!sec || sec < 60) return `${sec || 0} seconds`;
    if (sec < 3600) return `${Math.round(sec / 60)} minutes`;
    return `${(sec / 3600).toFixed(1)} hours`;
  };

  return (
    <div style={{ display: 'flex', flexDirection: 'column', gap: 'var(--space-6)' }}>
      {/* Modern Page Header Banner */}
      <div className="page-header-clean">
        <div style={{ display: 'flex', alignItems: 'center', gap: '20px', flexWrap: 'wrap' }}>
          <div
            className="ui-integrated-graphic motion-mascot"
            style={{ width: '56px', height: '56px', flexShrink: 0 }}
          >
            <img
              src={ASSET_IMAGES.governanceShield}
              alt="Governance Intelligence"
              className="ui-seamless-image"
              style={{ width: '100%', height: '100%' }}
            />
          </div>

          <div>
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
                  border: '1px solid #BFDBFE',
                  textTransform: 'uppercase',
                  letterSpacing: '0.04em',
                }}
              >
                <TrendingUp size={12} color="#2563EB" />
                Continuous Governance Intelligence
              </span>
              <span style={{ fontSize: '0.75rem', color: '#94A3B8' }}>•</span>
              <span style={{ fontSize: '0.75rem', color: '#64748B', fontWeight: 600 }}>
                MongoDB Aggregation Pipeline
              </span>
            </div>

            <h1 className="text-gradient-primary" style={{ fontSize: '1.75rem', fontWeight: 850, margin: 0 }}>
              Governance Insights & Analytics
            </h1>
            <p style={{ fontSize: '0.875rem', color: '#64748B', marginTop: '4px', margin: '4px 0 0 0' }}>
              Monitor real-world policy enforcement, uncover repeated terminology pitfalls, and optimize ambiguous brand guidelines with aggregated data.
            </p>
          </div>
        </div>

        {/* Action Controls & Top Right Refresh Button */}
        <div style={{ display: 'flex', alignItems: 'center', gap: '12px', flexWrap: 'wrap' }}>
          <div className="segmented-control">
            <span
              className="segmented-option active"
              style={{ display: 'inline-flex', alignItems: 'center', gap: '6px', cursor: 'default' }}
            >
              <span
                style={{
                  width: '7px',
                  height: '7px',
                  borderRadius: '50%',
                  background: '#10B981',
                  boxShadow: '0 0 8px #10B981',
                }}
              />
              <span>Live Aggregation</span>
            </span>
          </div>

          <button
            type="button"
            className="btn-refresh-analytics"
            onClick={loadInsights}
            disabled={loading}
            title="Refresh workspace intelligence"
          >
            <span className="refresh-icon-badge">
              <RefreshCw size={13} strokeWidth={2.6} className={loading ? 'spin-icon' : ''} />
            </span>
            <span>{loading ? 'Refreshing Intelligence...' : 'Refresh Analytics'}</span>
          </button>
        </div>
      </div>

      {loading ? (
        <div style={{ padding: '60px', textAlign: 'center', background: '#FFFFFF', borderRadius: '16px', border: '1px solid #E2E8F0' }}>
          <div style={{ width: '40px', height: '40px', margin: '0 auto 12px auto' }} className="spin-icon">
            <RefreshCw size={36} color="#2563EB" />
          </div>
          <div style={{ fontWeight: 600, color: '#0F172A' }}>Aggregating governance intelligence across workspace...</div>
        </div>
      ) : (
        <>
          {/* Key KPI Tiles */}
          <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(260px, 1fr))', gap: '16px' }}>
            <div className="dashboard-metric-card" style={{ background: '#FFFFFF', border: '1px solid #E2E8F0', borderRadius: '16px', padding: '20px' }}>
              <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', marginBottom: '8px' }}>
                <span style={{ fontSize: '0.8125rem', fontWeight: 600, color: '#64748B' }}>Average Turnaround Time</span>
                <Clock size={18} color="#2563EB" />
              </div>
              <div style={{ fontSize: '1.75rem', fontWeight: 800, color: '#0F172A' }}>
                {formatSeconds(data?.avgTurnaroundSeconds)}
              </div>
              <div style={{ fontSize: '0.75rem', color: '#64748B', marginTop: '4px' }}>
                Draft creation to review completion
              </div>
            </div>

            <div className="dashboard-metric-card" style={{ background: '#FFFFFF', border: '1px solid #E2E8F0', borderRadius: '16px', padding: '20px' }}>
              <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', marginBottom: '8px' }}>
                <span style={{ fontSize: '0.8125rem', fontWeight: 600, color: '#64748B' }}>Unresolved High-Risk Findings</span>
                <AlertTriangle size={18} color="#EF4444" />
              </div>
              <div style={{ fontSize: '1.75rem', fontWeight: 800, color: '#EF4444' }}>
                {data?.unresolvedHighRisk?.length || 0}
              </div>
              <div style={{ fontSize: '0.75rem', color: '#64748B', marginTop: '4px' }}>
                Critical brand violations awaiting action
              </div>
            </div>

            <div className="dashboard-metric-card" style={{ background: '#FFFFFF', border: '1px solid #E2E8F0', borderRadius: '16px', padding: '20px' }}>
              <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', marginBottom: '8px' }}>
                <span style={{ fontSize: '0.8125rem', fontWeight: 600, color: '#64748B' }}>Ambiguous / Dismissed Rules</span>
                <HelpCircle size={18} color="#F59E0B" />
              </div>
              <div style={{ fontSize: '1.75rem', fontWeight: 800, color: '#F59E0B' }}>
                {data?.frequentlyDismissedRules?.length || 0}
              </div>
              <div style={{ fontSize: '0.75rem', color: '#64748B', marginTop: '4px' }}>
                Rules with reviewer-dismissed findings
              </div>
            </div>

            <div className="dashboard-metric-card" style={{ background: '#FFFFFF', border: '1px solid #E2E8F0', borderRadius: '16px', padding: '20px' }}>
              <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', marginBottom: '8px' }}>
                <span style={{ fontSize: '0.8125rem', fontWeight: 600, color: '#64748B' }}>Historical Review Runs</span>
                <BarChart3 size={18} color="#10B981" />
              </div>
              <div style={{ fontSize: '1.75rem', fontWeight: 800, color: '#10B981' }}>
                {data?.scoreHistory?.length || 0}
              </div>
              <div style={{ fontSize: '0.75rem', color: '#64748B', marginTop: '4px' }}>
                Audited document runs on record
              </div>
            </div>
          </div>

          {/* Issue Categories & Repeated Mistakes */}
          <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(440px, 1fr))', gap: '20px' }}>
            {/* Issue Categories */}
            <div className="dashboard-card" style={{ background: '#FFFFFF', border: '1px solid #E2E8F0', borderRadius: '16px', padding: '20px' }}>
              <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', marginBottom: '16px' }}>
                <div>
                  <h3 style={{ fontSize: '1rem', fontWeight: 700, color: '#0F172A', margin: 0 }}>
                    Most Common Issue Categories
                  </h3>
                  <p style={{ fontSize: '0.75rem', color: '#64748B', margin: '2px 0 0 0' }}>
                    Distribution of findings flagged across reviews
                  </p>
                </div>
                <span style={{ fontSize: '0.6875rem', fontWeight: 700, color: '#2563EB', background: '#EFF6FF', padding: '2px 8px', borderRadius: '999px' }}>
                  Realtime Aggregation
                </span>
              </div>

              {data?.categoryDistribution && data.categoryDistribution.length > 0 ? (
                <div style={{ display: 'flex', flexDirection: 'column', gap: '12px' }}>
                  {data.categoryDistribution.map((cat) => {
                    const max = Math.max(...data.categoryDistribution.map((c) => c.total), 1);
                    const pct = Math.round((cat.total / max) * 100);
                    return (
                      <div key={cat._id} style={{ display: 'flex', flexDirection: 'column', gap: '4px' }}>
                        <div style={{ display: 'flex', justifyContent: 'space-between', fontSize: '0.8125rem' }}>
                          <span style={{ fontWeight: 600, color: '#0F172A' }}>{cat._id || 'General'}</span>
                          <span style={{ color: '#64748B' }}>
                            {cat.total} findings {cat.dismissed > 0 && `(${cat.dismissed} dismissed)`}
                          </span>
                        </div>
                        <div style={{ height: '8px', background: '#F1F5F9', borderRadius: '999px', overflow: 'hidden' }}>
                          <div
                            style={{
                              width: `${pct}%`,
                              height: '100%',
                              background: 'linear-gradient(90deg, #2563EB 0%, #7C3AED 100%)',
                              borderRadius: '999px',
                            }}
                          />
                        </div>
                      </div>
                    );
                  })}
                </div>
              ) : (
                <div style={{ padding: '30px', textAlign: 'center', color: '#64748B', fontSize: '0.875rem' }}>
                  No findings recorded yet. Run content audits to aggregate category data.
                </div>
              )}
            </div>

            {/* Repeated Terminology Mistakes */}
            <div className="dashboard-card" style={{ background: '#FFFFFF', border: '1px solid #E2E8F0', borderRadius: '16px', padding: '20px' }}>
              <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', marginBottom: '16px' }}>
                <div>
                  <h3 style={{ fontSize: '1rem', fontWeight: 700, color: '#0F172A', margin: 0 }}>
                    Repeated Terminology Mistakes
                  </h3>
                  <p style={{ fontSize: '0.75rem', color: '#64748B', margin: '2px 0 0 0' }}>
                    Phrases creators most frequently write that violate brand standards
                  </p>
                </div>
                <span style={{ fontSize: '0.6875rem', fontWeight: 700, color: '#7C3AED', background: '#F5F3FF', padding: '2px 8px', borderRadius: '999px' }}>
                  Terminology Radar
                </span>
              </div>

              {data?.repeatedMistakes && data.repeatedMistakes.length > 0 ? (
                <div style={{ display: 'flex', flexDirection: 'column', gap: '8px' }}>
                  {data.repeatedMistakes.map((m, idx) => (
                    <div
                      key={idx}
                      style={{
                        display: 'flex',
                        alignItems: 'center',
                        justifyContent: 'space-between',
                        padding: '10px 12px',
                        background: '#F8FAFC',
                        borderRadius: '10px',
                        border: '1px solid #E2E8F0',
                      }}
                    >
                      <div style={{ display: 'flex', alignItems: 'center', gap: '10px' }}>
                        <span
                          style={{
                            width: '24px',
                            height: '24px',
                            borderRadius: '6px',
                            background: '#EFF6FF',
                            color: '#2563EB',
                            display: 'flex',
                            alignItems: 'center',
                            justifyContent: 'center',
                            fontSize: '0.75rem',
                            fontWeight: 700,
                          }}
                        >
                          {idx + 1}
                        </span>
                        <div>
                          <span style={{ fontWeight: 700, color: '#EF4444', textDecoration: 'line-through' }}>
                            {m._id}
                          </span>
                          {m.sampleSuggestion && (
                            <span style={{ fontSize: '0.75rem', color: '#059669', marginLeft: '8px', fontWeight: 600 }}>
                              &rarr; {m.sampleSuggestion}
                            </span>
                          )}
                        </div>
                      </div>
                      <span
                        style={{
                          fontSize: '0.75rem',
                          fontWeight: 700,
                          padding: '2px 8px',
                          borderRadius: '999px',
                          background: '#FEE2E2',
                          color: '#DC2626',
                        }}
                      >
                        {m.count}x flagged
                      </span>
                    </div>
                  ))}
                </div>
              ) : (
                <div style={{ padding: '30px', textAlign: 'center', color: '#64748B', fontSize: '0.875rem' }}>
                  No repeated terminology errors identified yet.
                </div>
              )}
            </div>
          </div>

          {/* Frequently Triggered Rules Table */}
          <div className="dashboard-card" style={{ background: '#FFFFFF', border: '1px solid #E2E8F0', borderRadius: '16px', padding: '20px' }}>
            <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', marginBottom: '16px' }}>
              <div>
                <h3 style={{ fontSize: '1rem', fontWeight: 700, color: '#0F172A', margin: 0 }}>
                  Frequently Triggered Brand Rules
                </h3>
                <p style={{ fontSize: '0.75rem', color: '#64748B', margin: '2px 0 0 0' }}>
                  Identify rules requiring additional creator training or guideline revisions
                </p>
              </div>
              <span style={{ fontSize: '0.6875rem', fontWeight: 700, color: '#059669', background: '#ECFDF5', padding: '2px 8px', borderRadius: '999px' }}>
                Policy Optimization
              </span>
            </div>

            {data?.topRules && data.topRules.length > 0 ? (
              <div style={{ overflowX: 'auto' }}>
                <table style={{ width: '100%', borderCollapse: 'collapse', textAlign: 'left', fontSize: '0.8125rem' }}>
                  <thead>
                    <tr style={{ borderBottom: '1px solid #E2E8F0', color: '#64748B', fontWeight: 600 }}>
                      <th style={{ padding: '10px 12px' }}>Rule Title</th>
                      <th style={{ padding: '10px 12px' }}>Category</th>
                      <th style={{ padding: '10px 12px' }}>Severity</th>
                      <th style={{ padding: '10px 12px', textAlign: 'center' }}>Times Flagged</th>
                      <th style={{ padding: '10px 12px', textAlign: 'center' }}>Applied</th>
                      <th style={{ padding: '10px 12px', textAlign: 'center' }}>Dismissed</th>
                    </tr>
                  </thead>
                  <tbody>
                    {data.topRules.map((r) => (
                      <tr key={r.ruleId} style={{ borderBottom: '1px solid #F1F5F9' }}>
                        <td style={{ padding: '12px', fontWeight: 700, color: '#0F172A' }}>{r.title}</td>
                        <td style={{ padding: '12px', color: '#64748B' }}>{r.category}</td>
                        <td style={{ padding: '12px' }}>
                          <SeverityBadge severity={r.severity} />
                        </td>
                        <td style={{ padding: '12px', textAlign: 'center', fontWeight: 700, color: '#2563EB' }}>
                          {r.triggerCount}
                        </td>
                        <td style={{ padding: '12px', textAlign: 'center', fontWeight: 600, color: '#059669' }}>
                          {r.appliedCount}
                        </td>
                        <td style={{ padding: '12px', textAlign: 'center', fontWeight: 600, color: r.dismissedCount > 0 ? '#D97706' : '#94A3B8' }}>
                          {r.dismissedCount}
                        </td>
                      </tr>
                    ))}
                  </tbody>
                </table>
              </div>
            ) : (
              <div style={{ padding: '30px', textAlign: 'center', color: '#64748B', fontSize: '0.875rem' }}>
                No rule triggers recorded yet.
              </div>
            )}
          </div>
        </>
      )}
    </div>
  );
}
