import React, { useState, useEffect } from 'react';
import {
  BarChart3,
  TrendingUp,
  AlertTriangle,
  Clock,
  CheckCircle2,
  HelpCircle,
  ShieldAlert,
  ArrowRight,
  Zap,
  XCircle,
  ShieldCheck,
  Check,
  Layers,
  Sparkles,
} from 'lucide-react';
import { SeverityBadge } from '../components/Badges';
import { api } from '../services/api';
import { useAuth } from '../context/AuthContext';
import { useToast } from '../context/ToastContext';

export default function GovernanceInsights() {
  const [insights, setInsights] = useState(null);
  const [loading, setLoading] = useState(true);
  const [timeFilter, setTimeFilter] = useState('30d'); // '30d' | 'qtd' | 'all'
  const { workspace } = useAuth();
  const toast = useToast();

  useEffect(() => {
    async function loadInsights() {
      try {
        setLoading(true);
        const res = await api.insights.get();
        if (res.success) {
          setInsights(res.data);
        }
      } catch (err) {
        toast.error('Failed to load governance insights: ' + err.message);
      } finally {
        setLoading(false);
      }
    }
    loadInsights();
  }, [workspace]);

  if (loading) {
    return (
      <div style={{ display: 'flex', flexDirection: 'column', gap: 'var(--space-6)' }}>
        <div style={{ height: '140px' }} className="skeleton card" />
        <div style={{ height: '300px' }} className="skeleton card" />
      </div>
    );
  }

  const {
    categoryBreakdown = [],
    topRules = [],
    repeatedMistakes = [],
    unresolvedHighRisk = [],
    avgTurnaroundSeconds = 0,
    frequentlyDismissedRules = [],
  } = insights || {};

  const formatTurnaround = (sec) => {
    if (!sec || sec <= 0) return 'Immediate (Instant)';
    if (sec < 60) return `${sec}s`;
    if (sec < 3600) return `${Math.round(sec / 60)} mins`;
    return `${(sec / 3600).toFixed(1)} hrs`;
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
                background: '#ECFDF5',
                color: '#059669',
                fontSize: '0.6875rem',
                fontWeight: 700,
                border: '1px solid #A7F3D0',
                textTransform: 'uppercase',
                letterSpacing: '0.04em',
              }}
            >
              <TrendingUp size={12} color="#059669" />
              Governance Intelligence
            </span>
            <span style={{ fontSize: '0.75rem', color: '#94A3B8' }}>•</span>
            <span style={{ fontSize: '0.75rem', color: '#64748B', fontWeight: 600 }}>
              Real-time Drift Detection & Analytics
            </span>
          </div>

          <h1 className="page-header-title text-gradient-primary">
            Governance Insights & Analytics
          </h1>
          <p className="page-header-subtitle">
            Data-driven intelligence to identify recurring team mistakes, refine ambiguous brand rules, and monitor enterprise compliance velocity.
          </p>
        </div>

        {/* Time Filter Segmented Control */}
        <div style={{ display: 'flex', gap: 'var(--space-3)', alignItems: 'center', flexWrap: 'wrap' }}>
          <div className="segmented-control">
            <button
              onClick={() => setTimeFilter('30d')}
              className={`segmented-btn ${timeFilter === '30d' ? 'active' : ''}`}
            >
              Last 30 Days
            </button>
            <button
              onClick={() => setTimeFilter('qtd')}
              className={`segmented-btn ${timeFilter === 'qtd' ? 'active' : ''}`}
            >
              Quarter to Date
            </button>
            <button
              onClick={() => setTimeFilter('all')}
              className={`segmented-btn ${timeFilter === 'all' ? 'active' : ''}`}
            >
              All Time
            </button>
          </div>
        </div>
      </div>

      {/* Analytics Summary Stat Ribbon */}
      <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(240px, 1fr))', gap: '18px' }}>
        {/* Turnaround Time Card */}
        <div
          className="card"
          style={{
            padding: '20px',
            display: 'flex',
            flexDirection: 'column',
            justifyContent: 'space-between',
          }}
        >
          <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', marginBottom: '8px' }}>
            <span style={{ fontSize: '0.75rem', color: '#64748B', fontWeight: 700, textTransform: 'uppercase', letterSpacing: '0.04em' }}>
              Avg Turnaround Time
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
              <Clock size={16} />
            </div>
          </div>

          <div style={{ display: 'flex', alignItems: 'baseline', gap: '8px', margin: '4px 0 6px 0' }}>
            <div style={{ fontSize: '1.5rem', fontWeight: 800, color: '#0F172A' }}>
              {formatTurnaround(avgTurnaroundSeconds)}
            </div>
          </div>

          <span style={{ fontSize: '0.75rem', color: '#94A3B8' }}>
            From draft submission to automated audit completion
          </span>
        </div>

        {/* High Risk Issues Card */}
        <div
          className="card"
          style={{
            padding: '20px',
            display: 'flex',
            flexDirection: 'column',
            justifyContent: 'space-between',
          }}
        >
          <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', marginBottom: '8px' }}>
            <span style={{ fontSize: '0.75rem', color: '#64748B', fontWeight: 700, textTransform: 'uppercase', letterSpacing: '0.04em' }}>
              Unresolved High-Risk Issues
            </span>
            <div
              style={{
                width: '32px',
                height: '32px',
                borderRadius: '8px',
                background: unresolvedHighRisk.length > 0 ? '#FEF2F2' : '#ECFDF5',
                color: unresolvedHighRisk.length > 0 ? '#DC2626' : '#059669',
                display: 'flex',
                alignItems: 'center',
                justifyContent: 'center',
              }}
            >
              <ShieldAlert size={16} />
            </div>
          </div>

          <div style={{ display: 'flex', alignItems: 'baseline', gap: '8px', margin: '4px 0 6px 0' }}>
            <div
              style={{
                fontSize: '1.75rem',
                fontWeight: 850,
                color: unresolvedHighRisk.length > 0 ? '#DC2626' : '#059669',
              }}
            >
              {unresolvedHighRisk.length}
            </div>
          </div>

          <span style={{ fontSize: '0.75rem', color: '#94A3B8' }}>
            {unresolvedHighRisk.length > 0
              ? 'Requires immediate editorial modification before approval'
              : 'Zero blocking governance violations detected'}
          </span>
        </div>

        {/* Recurring Pitfalls Card */}
        <div
          className="card"
          style={{
            padding: '20px',
            display: 'flex',
            flexDirection: 'column',
            justifyContent: 'space-between',
          }}
        >
          <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', marginBottom: '8px' }}>
            <span style={{ fontSize: '0.75rem', color: '#64748B', fontWeight: 700, textTransform: 'uppercase', letterSpacing: '0.04em' }}>
              Recurring Terminology Pitfalls
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
              <AlertTriangle size={16} />
            </div>
          </div>

          <div style={{ display: 'flex', alignItems: 'baseline', gap: '8px', margin: '4px 0 6px 0' }}>
            <div style={{ fontSize: '1.75rem', fontWeight: 850, color: '#0F172A' }}>
              {repeatedMistakes.length}
            </div>
          </div>

          <span style={{ fontSize: '0.75rem', color: '#94A3B8' }}>
            Repeated prohibited phrases detected across copy drafts
          </span>
        </div>
      </div>

      {/* Main Insights Grid */}
      <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(380px, 1fr))', gap: '22px' }}>
        {/* Repeated Terminology Mistakes */}
        <div className="card" style={{ padding: '22px' }}>
          <div style={{ marginBottom: '16px' }}>
            <h3 className="card-title text-gradient-coral" style={{ fontSize: '1.0625rem', marginBottom: '4px' }}>
              Repeated Terminology Mistakes
            </h3>
            <p className="card-subtitle" style={{ fontSize: '0.8125rem', color: '#64748B', margin: 0 }}>
              Common forbidden phrases and standard deterministic corrections
            </p>
          </div>

          {repeatedMistakes.length === 0 ? (
            <div style={{ padding: 'var(--space-8)', textAlign: 'center', color: 'var(--text-tertiary)' }}>
              <CheckCircle2 size={36} color="#10B981" style={{ margin: '0 auto 8px auto' }} />
              <p style={{ fontWeight: 600, color: '#334155' }}>No Repeated Mistakes Recorded</p>
              <p style={{ fontSize: '0.8125rem', color: '#64748B' }}>
                Content creators are adhering strictly to the approved terminology glossary.
              </p>
            </div>
          ) : (
            <div style={{ display: 'flex', flexDirection: 'column', gap: '10px' }}>
              {repeatedMistakes.map((m, idx) => (
                <div key={idx} className="mistake-card">
                  <div className="mistake-content">
                    {/* Prohibited Phrase Pill */}
                    <div className="mistake-prohibited">
                      <XCircle size={13} />
                      <span>"{m.phrase}"</span>
                    </div>

                    {/* Replacement Recommendation Pill */}
                    {m.suggestion && (
                      <div className="mistake-replacement">
                        <CheckCircle2 size={13} />
                        <span>Replace with: "{m.suggestion}"</span>
                      </div>
                    )}
                  </div>

                  {/* Occurrence Badge */}
                  <div className="mistake-counter">
                    <AlertTriangle size={13} color="#D97706" />
                    <span>{m.count} {m.count === 1 ? 'Occurrence' : 'Occurrences'}</span>
                  </div>
                </div>
              ))}
            </div>
          )}
        </div>

        {/* Rules Frequently Dismissed (Ambiguity Detector) */}
        <div className="card" style={{ padding: '22px' }}>
          <div style={{ marginBottom: '16px' }}>
            <h3 className="card-title text-gradient-amber" style={{ fontSize: '1.0625rem', marginBottom: '4px' }}>
              Potential Ambiguous Rules
            </h3>
            <p className="card-subtitle" style={{ fontSize: '0.8125rem', color: '#64748B', margin: 0 }}>
              Rules frequently dismissed by reviewers as acceptable exceptions
            </p>
          </div>

          {frequentlyDismissedRules.length === 0 ? (
            <div
              style={{
                padding: '24px',
                borderRadius: '14px',
                background: '#F8FAFC',
                border: '1px solid #E2E8F0',
                textAlign: 'center',
              }}
            >
              <ShieldCheck size={36} color="#059669" style={{ margin: '0 auto 10px auto' }} />
              <h4 style={{ fontSize: '0.9375rem', fontWeight: 700, color: '#0F172A', marginBottom: '4px' }}>
                Guideline Clarity is Strong
              </h4>
              <p style={{ fontSize: '0.8125rem', color: '#64748B', margin: 0, lineHeight: 1.5 }}>
                Zero rules frequently dismissed by reviewers. Brand governance rules have high consensus and clear definitions.
              </p>
            </div>
          ) : (
            <div style={{ display: 'flex', flexDirection: 'column', gap: '10px' }}>
              {frequentlyDismissedRules.map((rule, idx) => (
                <div
                  key={idx}
                  style={{
                    padding: '14px 16px',
                    borderRadius: '12px',
                    background: '#FFFBEB',
                    border: '1px solid #FDE68A',
                  }}
                >
                  <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
                    <span style={{ fontSize: '0.875rem', fontWeight: 750, color: '#92400E' }}>
                      {rule.title}
                    </span>
                    <span style={{ fontSize: '0.75rem', fontWeight: 700, color: '#B45309' }}>
                      {rule.dismissedCount} dismissed
                    </span>
                  </div>
                  <div style={{ fontSize: '0.8125rem', color: '#78350F', marginTop: '6px', lineHeight: 1.45 }}>
                    Recommendation: Reviewers frequently override this rule. Consider refining the scope or relaxing phrasing in Brand Guidelines.
                  </div>
                </div>
              ))}
            </div>
          )}
        </div>
      </div>

      {/* Category Breakdown Progress */}
      <div className="card" style={{ padding: '22px' }}>
        <div style={{ marginBottom: '16px' }}>
          <h3 className="card-title text-gradient-blue" style={{ fontSize: '1.0625rem', marginBottom: '4px' }}>
            Category Adherence Distribution
          </h3>
          <p className="card-subtitle" style={{ fontSize: '0.8125rem', color: '#64748B', margin: 0 }}>
            Breakdown of total flagged issues and compliance adherence by category
          </p>
        </div>

        {categoryBreakdown.length === 0 ? (
          <div style={{ padding: 'var(--space-6)', textAlign: 'center', color: 'var(--text-tertiary)' }}>
            No issue categories recorded yet.
          </div>
        ) : (
          <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(280px, 1fr))', gap: '14px' }}>
            {categoryBreakdown.map((cat, idx) => (
              <div
                key={idx}
                style={{
                  padding: '16px',
                  borderRadius: '12px',
                  background: '#F8FAFC',
                  border: '1px solid #E2E8F0',
                  transition: 'all 0.2s ease',
                }}
              >
                <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '8px' }}>
                  <span style={{ fontWeight: 750, fontSize: '0.875rem', color: '#0F172A' }}>
                    {cat.category}
                  </span>
                  <span
                    style={{
                      fontSize: '0.75rem',
                      fontWeight: 700,
                      color: '#2563EB',
                      background: '#EFF6FF',
                      padding: '2px 8px',
                      borderRadius: '6px',
                    }}
                  >
                    {cat.count} total
                  </span>
                </div>
                <div style={{ fontSize: '0.75rem', color: '#64748B' }}>
                  Dismissed exceptions: <strong>{cat.dismissed}</strong>
                </div>
              </div>
            ))}
          </div>
        )}
      </div>
    </div>
  );
}
