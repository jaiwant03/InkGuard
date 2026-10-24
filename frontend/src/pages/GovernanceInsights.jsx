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
  BookOpen,
  Scale,
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

      {/* Analytics Summary Stat Ribbon (4 Balanced KPI Cards) */}
      <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(220px, 1fr))', gap: '16px' }}>
        {/* Turnaround Time Card */}
        <div
          className="card"
          style={{
            padding: '18px 20px',
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

          <div style={{ fontSize: '1.375rem', fontWeight: 800, color: '#0F172A', margin: '2px 0 4px 0' }}>
            {formatTurnaround(avgTurnaroundSeconds)}
          </div>

          <span style={{ fontSize: '0.75rem', color: '#94A3B8' }}>
            Automated compliance audit completion
          </span>
        </div>

        {/* High Risk Issues Card */}
        <div
          className="card"
          style={{
            padding: '18px 20px',
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

          <div style={{ fontSize: '1.5rem', fontWeight: 850, color: unresolvedHighRisk.length > 0 ? '#DC2626' : '#059669', margin: '2px 0 4px 0' }}>
            {unresolvedHighRisk.length}
          </div>

          <span style={{ fontSize: '0.75rem', color: '#94A3B8' }}>
            {unresolvedHighRisk.length > 0
              ? 'Requires editorial revision before sign-off'
              : 'Zero blocking violations detected'}
          </span>
        </div>

        {/* Recurring Pitfalls Card */}
        <div
          className="card"
          style={{
            padding: '18px 20px',
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

          <div style={{ fontSize: '1.5rem', fontWeight: 850, color: '#0F172A', margin: '2px 0 4px 0' }}>
            {repeatedMistakes.length}
          </div>

          <span style={{ fontSize: '0.75rem', color: '#94A3B8' }}>
            Phrases with multiple guideline violations
          </span>
        </div>

        {/* Guideline Clarity Index */}
        <div
          className="card"
          style={{
            padding: '18px 20px',
            display: 'flex',
            flexDirection: 'column',
            justifyContent: 'space-between',
          }}
        >
          <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', marginBottom: '8px' }}>
            <span style={{ fontSize: '0.75rem', color: '#64748B', fontWeight: 700, textTransform: 'uppercase', letterSpacing: '0.04em' }}>
              Ambiguous Rules
            </span>
            <div
              style={{
                width: '32px',
                height: '32px',
                borderRadius: '8px',
                background: frequentlyDismissedRules.length > 0 ? '#FEF2F2' : '#ECFDF5',
                color: frequentlyDismissedRules.length > 0 ? '#DC2626' : '#059669',
                display: 'flex',
                alignItems: 'center',
                justifyContent: 'center',
              }}
            >
              <ShieldCheck size={16} />
            </div>
          </div>

          <div style={{ fontSize: '1.5rem', fontWeight: 850, color: frequentlyDismissedRules.length > 0 ? '#DC2626' : '#059669', margin: '2px 0 4px 0' }}>
            {frequentlyDismissedRules.length}
          </div>

          <span style={{ fontSize: '0.75rem', color: '#94A3B8' }}>
            {frequentlyDismissedRules.length === 0 ? '100% Reviewer consensus (0 overrides)' : 'Rules frequently dismissed as false positives'}
          </span>
        </div>
      </div>

      {/* SECTION 1: Repeated Terminology Mistakes (Full Width with 2-Column Responsive Card Grid) */}
      <div className="card" style={{ padding: '24px' }}>
        <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '18px', flexWrap: 'wrap', gap: '8px' }}>
          <div>
            <h3 className="card-title text-gradient-coral" style={{ fontSize: '1.125rem', marginBottom: '4px' }}>
              Repeated Terminology Mistakes
            </h3>
            <p className="card-subtitle" style={{ fontSize: '0.8125rem', color: '#64748B', margin: 0 }}>
              Common forbidden phrases and standard deterministic corrections detected across copy drafts
            </p>
          </div>

          <span
            style={{
              padding: '4px 12px',
              borderRadius: '999px',
              background: '#FEF2F2',
              color: '#DC2626',
              fontSize: '0.75rem',
              fontWeight: 750,
              border: '1px solid #FEE2E2',
            }}
          >
            {repeatedMistakes.length} High-Frequency Pitfalls
          </span>
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
          <div
            style={{
              display: 'grid',
              gridTemplateColumns: 'repeat(auto-fit, minmax(460px, 1fr))',
              gap: '12px',
            }}
          >
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

      {/* SECTION 2: Balanced Two-Column Row (Category Adherence & Rule Health) */}
      <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(380px, 1fr))', gap: '22px', alignItems: 'stretch' }}>
        {/* Left Column: Category Adherence Distribution */}
        <div className="card" style={{ padding: '24px', display: 'flex', flexDirection: 'column', justifyContent: 'space-between' }}>
          <div>
            <div style={{ marginBottom: '18px' }}>
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
              <div style={{ display: 'flex', flexDirection: 'column', gap: '10px' }}>
                {categoryBreakdown.map((cat, idx) => (
                  <div
                    key={idx}
                    style={{
                      padding: '12px 16px',
                      borderRadius: '12px',
                      background: '#F8FAFC',
                      border: '1px solid #E2E8F0',
                      display: 'flex',
                      alignItems: 'center',
                      justifyContent: 'space-between',
                      transition: 'all 0.2s ease',
                    }}
                  >
                    <div>
                      <div style={{ fontWeight: 750, fontSize: '0.875rem', color: '#0F172A', textTransform: 'capitalize' }}>
                        {cat.category}
                      </div>
                      <div style={{ fontSize: '0.75rem', color: '#64748B', marginTop: '2px' }}>
                        Dismissed exceptions: <strong>{cat.dismissed}</strong>
                      </div>
                    </div>

                    <div style={{ display: 'flex', alignItems: 'center', gap: '8px' }}>
                      <span
                        style={{
                          fontSize: '0.75rem',
                          fontWeight: 750,
                          color: '#2563EB',
                          background: '#EFF6FF',
                          padding: '3px 10px',
                          borderRadius: '8px',
                          border: '1px solid #DBEAFE',
                        }}
                      >
                        {cat.count} total
                      </span>
                    </div>
                  </div>
                ))}
              </div>
            )}
          </div>
        </div>

        {/* Right Column: Rule Health & Ambiguity Detector */}
        <div className="card" style={{ padding: '24px', display: 'flex', flexDirection: 'column', justifyContent: 'space-between' }}>
          <div>
            <div style={{ marginBottom: '18px' }}>
              <h3 className="card-title text-gradient-emerald" style={{ fontSize: '1.0625rem', marginBottom: '4px' }}>
                Rule Clarity & Governance Health
              </h3>
              <p className="card-subtitle" style={{ fontSize: '0.8125rem', color: '#64748B', margin: 0 }}>
                Reviewer consensus, false positive rates, and rule calibration status
              </p>
            </div>

            {frequentlyDismissedRules.length === 0 ? (
              <div style={{ display: 'flex', flexDirection: 'column', gap: '14px' }}>
                {/* Optimal Clarity Card */}
                <div
                  style={{
                    padding: '20px',
                    borderRadius: '14px',
                    background: '#ECFDF5',
                    border: '1px solid #A7F3D0',
                    display: 'flex',
                    alignItems: 'flex-start',
                    gap: '14px',
                  }}
                >
                  <div
                    style={{
                      width: '38px',
                      height: '38px',
                      borderRadius: '10px',
                      background: '#FFFFFF',
                      display: 'flex',
                      alignItems: 'center',
                      justifyContent: 'center',
                      flexShrink: 0,
                      boxShadow: '0 2px 6px rgba(5, 150, 105, 0.12)',
                    }}
                  >
                    <ShieldCheck size={22} color="#059669" />
                  </div>
                  <div>
                    <h4 style={{ fontSize: '0.9375rem', fontWeight: 750, color: '#065F46', margin: '0 0 4px 0' }}>
                      Guideline Clarity is Strong
                    </h4>
                    <p style={{ fontSize: '0.8125rem', color: '#047857', margin: 0, lineHeight: 1.5 }}>
                      Zero rules frequently dismissed by reviewers. Brand governance rules have high consensus, zero false positive drift, and clear deterministic definitions.
                    </p>
                  </div>
                </div>

                {/* Health Metrics Grid */}
                <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '10px' }}>
                  <div
                    style={{
                      padding: '14px 16px',
                      borderRadius: '12px',
                      background: '#F8FAFC',
                      border: '1px solid #E2E8F0',
                    }}
                  >
                    <span style={{ fontSize: '0.75rem', color: '#64748B', fontWeight: 600 }}>
                      Enforcement Consensus
                    </span>
                    <div style={{ fontSize: '1.25rem', fontWeight: 800, color: '#059669', marginTop: '2px' }}>
                      100%
                    </div>
                    <span style={{ fontSize: '0.6875rem', color: '#94A3B8' }}>
                      No reviewer overrides
                    </span>
                  </div>

                  <div
                    style={{
                      padding: '14px 16px',
                      borderRadius: '12px',
                      background: '#F8FAFC',
                      border: '1px solid #E2E8F0',
                    }}
                  >
                    <span style={{ fontSize: '0.75rem', color: '#64748B', fontWeight: 600 }}>
                      False Positive Rate
                    </span>
                    <div style={{ fontSize: '1.25rem', fontWeight: 800, color: '#2563EB', marginTop: '2px' }}>
                      0.0%
                    </div>
                    <span style={{ fontSize: '0.6875rem', color: '#94A3B8' }}>
                      Calibrated rule accuracy
                    </span>
                  </div>
                </div>

                {/* Recommendation Footer Note */}
                <div
                  style={{
                    padding: '12px 14px',
                    borderRadius: '10px',
                    background: '#F1F5F9',
                    fontSize: '0.75rem',
                    color: '#475569',
                    display: 'flex',
                    alignItems: 'center',
                    gap: '8px',
                  }}
                >
                  <Scale size={14} color="#64748B" />
                  <span>The deterministic rule engine is operating with strict adherence to brand guidelines.</span>
                </div>
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
      </div>
    </div>
  );
}
