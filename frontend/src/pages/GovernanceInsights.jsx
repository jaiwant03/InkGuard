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
} from 'lucide-react';
import { SeverityBadge } from '../components/Badges';
import { api } from '../services/api';
import { useAuth } from '../context/AuthContext';
import { useToast } from '../context/ToastContext';
import { ASSET_IMAGES } from '../assets/images';
import { Check } from 'lucide-react';

export default function GovernanceInsights() {
  const [insights, setInsights] = useState(null);
  const [loading, setLoading] = useState(true);
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
    if (!sec || sec <= 0) return 'Immediate (automated)';
    if (sec < 60) return `${sec}s`;
    if (sec < 3600) return `${Math.round(sec / 60)} mins`;
    return `${(sec / 3600).toFixed(1)} hrs`;
  };

  return (
    <div style={{ display: 'flex', flexDirection: 'column', gap: 'var(--space-6)' }}>
      {/* Modern Page Header */}
      <div className="page-header-clean">
        <div className="page-header-info">
          <div style={{ display: 'flex', alignItems: 'center', gap: '8px', marginBottom: '4px' }}>
            <span className="badge badge-primary">
              <TrendingUp size={12} style={{ display: 'inline', marginRight: '4px' }} />
              Governance Intelligence
            </span>
            <span style={{ fontSize: '0.8125rem', color: 'var(--text-tertiary)' }}>
              Real-time Drift Detection
            </span>
          </div>
          <h1 className="page-header-title text-gradient-primary">
            Governance Insights & Analytics
          </h1>
          <p className="page-header-subtitle">
            Data-driven intelligence to identify recurring team mistakes, refine ambiguous brand rules, and monitor enterprise compliance velocity.
          </p>
        </div>

        <div style={{ display: 'flex', gap: 'var(--space-3)', alignItems: 'center', flexWrap: 'wrap' }}>
          <div className="segmented-control">
            <span className="segmented-btn active">
              Last 30 Days
            </span>
            <span className="segmented-btn">
              Quarter to Date
            </span>
            <span className="segmented-btn">
              All Time
            </span>
          </div>
        </div>
      </div>

      {/* Analytics Summary Stat Ribbon */}
      <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(220px, 1fr))', gap: 'var(--space-5)' }}>
        <div className="card">
          <span style={{ fontSize: '0.75rem', color: 'var(--text-tertiary)', fontWeight: 700, textTransform: 'uppercase' }}>
            Avg Turnaround Time
          </span>
          <div style={{ fontSize: '1.625rem', fontWeight: 800, color: 'var(--text-primary)', marginTop: '4px' }}>
            {formatTurnaround(avgTurnaroundSeconds)}
          </div>
          <span style={{ fontSize: '0.75rem', color: 'var(--text-tertiary)' }}>
            From draft creation to reviewer audit
          </span>
        </div>

        <div className="card">
          <span style={{ fontSize: '0.75rem', color: 'var(--text-tertiary)', fontWeight: 700, textTransform: 'uppercase' }}>
            Unresolved High-Risk Issues
          </span>
          <div style={{ fontSize: '1.625rem', fontWeight: 800, color: unresolvedHighRisk.length > 0 ? 'var(--severity-high)' : 'var(--text-primary)', marginTop: '4px' }}>
            {unresolvedHighRisk.length}
          </div>
          <span style={{ fontSize: '0.75rem', color: 'var(--text-tertiary)' }}>
            Requires immediate editor revision
          </span>
        </div>

        <div className="card">
          <span style={{ fontSize: '0.75rem', color: 'var(--text-tertiary)', fontWeight: 700, textTransform: 'uppercase' }}>
            Recurring Terminology Pitfalls
          </span>
          <div style={{ fontSize: '1.625rem', fontWeight: 800, color: 'var(--text-primary)', marginTop: '4px' }}>
            {repeatedMistakes.length}
          </div>
          <span style={{ fontSize: '0.75rem', color: 'var(--text-tertiary)' }}>
            Repeated prohibited phrases detected
          </span>
        </div>
      </div>

      {/* Main Insights Grid */}
      <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(360px, 1fr))', gap: 'var(--space-6)' }}>
        {/* Repeated Terminology Mistakes */}
        <div className="card">
          <div className="card-header">
            <div>
              <h3 className="card-title">Repeated Terminology Mistakes</h3>
              <p className="card-subtitle">Common forbidden phrases and standard corrections</p>
            </div>
          </div>

          {repeatedMistakes.length === 0 ? (
            <div style={{ padding: 'var(--space-6)', textAlign: 'center', color: 'var(--text-tertiary)' }}>
              No repeated mistakes recorded. Creators adhere to approved glossary.
            </div>
          ) : (
            <div style={{ display: 'flex', flexDirection: 'column', gap: 'var(--space-3)' }}>
              {repeatedMistakes.map((m, idx) => (
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
                  <div>
                    <span style={{ fontSize: '0.8125rem', fontWeight: 700, color: '#B91C1C' }}>
                      "{m.phrase}"
                    </span>
                    {m.suggestion && (
                      <div style={{ fontSize: '0.75rem', color: '#047857', marginTop: '2px' }}>
                        → Replace with: "{m.suggestion}"
                      </div>
                    )}
                  </div>
                  <span className="badge badge-neutral" style={{ fontWeight: 700 }}>
                    {m.count} occurrences
                  </span>
                </div>
              ))}
            </div>
          )}
        </div>

        {/* Rules Frequently Dismissed (Ambiguity Detector) */}
        <div className="card">
          <div className="card-header">
            <div>
              <h3 className="card-title">Potential Ambiguous Rules</h3>
              <p className="card-subtitle">Rules frequently dismissed by reviewers as acceptable</p>
            </div>
          </div>

          {frequentlyDismissedRules.length === 0 ? (
            <div style={{ padding: 'var(--space-6)', textAlign: 'center', color: 'var(--text-tertiary)' }}>
              No rules frequently dismissed. Guideline clarity is strong.
            </div>
          ) : (
            <div style={{ display: 'flex', flexDirection: 'column', gap: 'var(--space-3)' }}>
              {frequentlyDismissedRules.map((rule, idx) => (
                <div
                  key={idx}
                  style={{
                    padding: '10px 12px',
                    borderRadius: 'var(--radius-md)',
                    background: '#FFFBEB',
                    border: '1px solid #FDE68A',
                  }}
                >
                  <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
                    <span style={{ fontSize: '0.8125rem', fontWeight: 700, color: '#92400E' }}>
                      {rule.title}
                    </span>
                    <span style={{ fontSize: '0.6875rem', fontWeight: 700, color: '#B45309' }}>
                      {rule.dismissedCount} dismissed
                    </span>
                  </div>
                  <div style={{ fontSize: '0.75rem', color: '#78350F', marginTop: '4px' }}>
                    Recommendation: Reviewers frequently override this rule. Consider refining the scope or relaxing phrasing in Brand Guidelines.
                  </div>
                </div>
              ))}
            </div>
          )}
        </div>
      </div>

      {/* Category Breakdown Progress */}
      <div className="card">
        <div className="card-header">
          <div>
            <h3 className="card-title">Category Adherence Distribution</h3>
            <p className="card-subtitle">Breakdown of total flagged issues and resolutions</p>
          </div>
        </div>

        {categoryBreakdown.length === 0 ? (
          <div style={{ padding: 'var(--space-6)', textAlign: 'center', color: 'var(--text-tertiary)' }}>
            No issue categories recorded yet.
          </div>
        ) : (
          <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(280px, 1fr))', gap: 'var(--space-4)' }}>
            {categoryBreakdown.map((cat, idx) => (
              <div
                key={idx}
                style={{
                  padding: 'var(--space-4)',
                  borderRadius: 'var(--radius-md)',
                  background: 'var(--bg-surface-secondary)',
                  border: '1px solid var(--border-light)',
                }}
              >
                <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '6px' }}>
                  <span style={{ fontWeight: 700, fontSize: '0.875rem', color: 'var(--text-primary)' }}>
                    {cat.category}
                  </span>
                  <span style={{ fontSize: '0.75rem', fontWeight: 700, color: 'var(--color-primary)' }}>
                    {cat.count} total
                  </span>
                </div>
                <div style={{ fontSize: '0.75rem', color: 'var(--text-tertiary)' }}>
                  Dismissed exceptions: {cat.dismissed}
                </div>
              </div>
            ))}
          </div>
        )}
      </div>
    </div>
  );
}
