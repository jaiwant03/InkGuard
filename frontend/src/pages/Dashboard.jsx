import React, { useState, useEffect } from 'react';
import { useNavigate, Link } from 'react-router-dom';
import {
  Shield,
  FileText,
  AlertTriangle,
  Clock,
  TrendingUp,
  ArrowRight,
  Plus,
  Palette,
  BookOpen,
  CheckCircle2,
  Copy,
  Check,
  ChevronRight,
  Filter,
  Sparkles,
  Info,
  Calendar,
  Layers,
  ArrowUpRight,
  ShieldAlert,
  ShieldCheck,
  CheckSquare,
  Zap,
  Sparkle,
} from 'lucide-react';
import ComplianceScoreRing from '../components/ComplianceScoreRing';
import { SeverityBadge, WorkflowStatusBadge } from '../components/Badges';
import { api } from '../services/api';
import { useAuth } from '../context/AuthContext';
import { useToast } from '../context/ToastContext';
import { ASSET_IMAGES } from '../assets/images';

export default function Dashboard() {
  const { user, workspace } = useAuth();
  const toast = useToast();
  const navigate = useNavigate();

  // Metrics & State
  const [metrics, setMetrics] = useState(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);

  // Brand Health date filter state
  const [healthDateRange, setHealthDateRange] = useState('30d');

  // Findings Table state & filters
  const [findings, setFindings] = useState([]);
  const [findingsLoading, setFindingsLoading] = useState(false);
  const [categoryFilter, setCategoryFilter] = useState('');
  const [severityFilter, setSeverityFilter] = useState('');
  const [statusFilter, setStatusFilter] = useState('');
  const [resolvingId, setResolvingId] = useState(null);

  // Copied hex code feedback
  const [copiedHex, setCopiedHex] = useState(null);

  // SVG Chart hover state
  const [hoveredPoint, setHoveredPoint] = useState(null);

  // Load Main Metrics
  const fetchMetrics = async () => {
    try {
      setLoading(true);
      setError(null);
      const res = await api.dashboard.metrics();
      if (res.success && res.data) {
        setMetrics(res.data);
      }
    } catch (err) {
      console.error('Failed to load metrics:', err);
      setError(err.message || 'Failed to load dashboard metrics.');
    } finally {
      setLoading(false);
    }
  };

  // Load Findings Table Data
  const fetchFindings = async () => {
    try {
      setFindingsLoading(true);
      const params = {};
      if (categoryFilter) params.category = categoryFilter;
      if (severityFilter) params.severity = severityFilter;
      if (statusFilter) params.status = statusFilter;

      const res = await api.dashboard.findings(params);
      if (res.success && res.data) {
        setFindings(res.data);
      }
    } catch (err) {
      console.error('Failed to load findings:', err);
    } finally {
      setFindingsLoading(false);
    }
  };

  useEffect(() => {
    fetchMetrics();
  }, [workspace?._id]);

  useEffect(() => {
    fetchFindings();
  }, [categoryFilter, severityFilter, statusFilter, workspace?._id]);

  // Handle Finding Resolution with real API call
  const handleResolveFinding = async (finding) => {
    if (!finding.draft?._id && !finding.draft) return;
    const draftId = finding.draft?._id || finding.draft;
    try {
      setResolvingId(finding._id);
      const res = await api.drafts.updateFindingStatus(draftId, finding._id, {
        action: 'resolve',
      });
      if (res.success) {
        toast.success('Finding marked as resolved.');
        setFindings((prev) =>
          prev.map((f) => (f._id === finding._id ? { ...f, status: 'resolved' } : f))
        );
        fetchMetrics();
      }
    } catch (err) {
      toast.error('Failed to resolve finding: ' + err.message);
    } finally {
      setResolvingId(null);
    }
  };

  // Copy Hex code helper
  const handleCopyHex = (hex) => {
    navigator.clipboard.writeText(hex);
    setCopiedHex(hex);
    toast.info(`Copied ${hex} to clipboard.`);
    setTimeout(() => setCopiedHex(null), 2000);
  };

  // Format Current Date
  const formattedToday = new Date().toLocaleDateString('en-US', {
    weekday: 'long',
    year: 'numeric',
    month: 'short',
    day: 'numeric',
  });

  // Dynamic Greeting based on time
  const getGreeting = () => {
    const hour = new Date().getHours();
    let prefix = 'Good morning';
    if (hour >= 12 && hour < 17) prefix = 'Good afternoon';
    else if (hour >= 17) prefix = 'Good evening';
    return user?.name ? `${prefix}, ${user.name.split(' ')[0]}` : prefix;
  };

  if (loading) {
    return (
      <div style={{ display: 'flex', flexDirection: 'column', gap: '24px' }}>
        <div style={{ height: '80px' }} className="skeleton card" />
        <div className="dashboard-kpi-grid-5">
          {[1, 2, 3, 4, 5].map((i) => (
            <div key={i} style={{ height: '110px' }} className="skeleton card" />
          ))}
        </div>
        <div className="dashboard-grid-top">
          <div style={{ height: '340px' }} className="skeleton card" />
          <div style={{ height: '340px' }} className="skeleton card" />
        </div>
        <div style={{ height: '280px' }} className="skeleton card" />
      </div>
    );
  }

  if (error) {
    return (
      <div className="glass-card" style={{ textAlign: 'center', padding: '56px 24px' }}>
        <div className="icon-tile icon-tile-coral" style={{ width: '56px', height: '56px', margin: '0 auto 16px auto' }}>
          <ShieldAlert size={28} />
        </div>
        <h3 style={{ fontSize: '1.25rem', fontWeight: 800, color: '#0F172A', marginBottom: '8px' }}>
          Unable to Load Governance Metrics
        </h3>
        <p style={{ color: '#64748B', maxWidth: '440px', margin: '0 auto 20px auto', fontSize: '0.875rem' }}>
          {error}
        </p>
        <button className="btn btn-gradient-primary" onClick={fetchMetrics}>
          Retry Connection
        </button>
      </div>
    );
  }

  const {
    averageScore = 0,
    openHighRiskCount = 0,
    pendingApprovalsCount = 0,
    reviewedThisMonthCount = 0,
    scoreComparison = null,
    recentDrafts = [],
    complianceTrend = [],
    brandProfile = null,
    guidelineCoverage = [],
    totalActiveRules = 0,
  } = metrics || {};

  // Extract numeric difference from scoreComparison
  const comparisonDiff =
    typeof scoreComparison === 'object' && scoreComparison !== null
      ? scoreComparison.diff
      : typeof scoreComparison === 'number'
      ? scoreComparison
      : null;

  // Build case-insensitive coverage lookup map
  const coverageMap = (Array.isArray(guidelineCoverage) ? guidelineCoverage : []).reduce((acc, item) => {
    if (item && item.category) acc[item.category.toLowerCase()] = item.count;
    return acc;
  }, {});

  const getCategoryRuleCount = (catName) => {
    return coverageMap[catName.toLowerCase()] || 0;
  };

  // Status interpretation for Brand Health
  let healthStatusLabel = 'No Audit Data';
  let healthStatusColor = '#64748B';
  let healthExplanation = 'Submit copy to run deterministic brand governance audits.';

  if (averageScore > 0) {
    if (averageScore >= 85) {
      healthStatusLabel = 'Compliant';
      healthStatusColor = '#10B981';
      healthExplanation = 'Content rigorously adheres to brand standards, tone of voice, and approved facts.';
    } else if (averageScore >= 70) {
      healthStatusLabel = 'Minor Inconsistencies';
      healthStatusColor = '#F59E0B';
      healthExplanation = 'Moderate findings detected. Resolve flagged terminology and claims to reach compliance target.';
    } else {
      healthStatusLabel = 'Action Required';
      healthStatusColor = '#F43F5E';
      healthExplanation = 'High-risk deviations detected. Content requires revision prior to public dissemination.';
    }
  }

  // Filter trend points by selected health date range
  const filteredTrend = complianceTrend.filter((point) => {
    if (healthDateRange === 'all') return true;
    const pointDate = point.isoDate ? new Date(point.isoDate) : new Date(point.date);
    if (isNaN(pointDate.getTime())) return true;
    const now = new Date();
    const daysAgo = healthDateRange === '90d' ? 90 : 30;
    const cutoff = new Date(now.setDate(now.getDate() - daysAgo));
    return pointDate >= cutoff;
  });

  return (
    <div style={{ display: 'flex', flexDirection: 'column', gap: '28px' }}>
      {/* ===================================================================
          1. HERO HEADER: Vibrant Welcome & Fast CTA Actions
          =================================================================== */}
      <section
        className="glass-card"
        style={{
          padding: '24px 28px',
          display: 'flex',
          flexWrap: 'wrap',
          alignItems: 'center',
          justifyContent: 'space-between',
          gap: '20px',
          background: 'linear-gradient(135deg, rgba(255, 255, 255, 0.98) 0%, rgba(248, 250, 252, 0.95) 100%)',
          border: '1px solid rgba(226, 232, 240, 0.9)',
          boxShadow: '0 10px 30px -5px rgba(37, 99, 235, 0.05), 0 1px 3px rgba(0, 0, 0, 0.02)',
        }}
      >
        <div style={{ display: 'flex', alignItems: 'center', gap: '22px' }}>
          <div
            className="ui-integrated-graphic motion-mascot"
            style={{
              width: '64px',
              height: '64px',
              flexShrink: 0,
            }}
          >
            <img
              src={ASSET_IMAGES.governanceShield}
              alt="InkGuard Governance Shield"
              className="ui-seamless-image"
              style={{ width: '100%', height: '100%' }}
            />
          </div>

          <div>
            <div style={{ display: 'flex', alignItems: 'center', gap: '10px', marginBottom: '6px' }}>
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
                <span
                  className="motion-pulse-check"
                  style={{
                    width: '6px',
                    height: '6px',
                    borderRadius: '50%',
                    background: '#10B981',
                    display: 'inline-block',
                  }}
                />
                Brand Governance Live
              </span>
              <span style={{ fontSize: '0.75rem', color: '#94A3B8' }}>•</span>
              <span style={{ display: 'inline-flex', alignItems: 'center', gap: '4px', color: '#64748B', fontSize: '0.75rem', fontWeight: 500 }}>
                <Calendar size={13} color="#2563EB" />
                {formattedToday}
              </span>
            </div>

            <h1
              style={{
                fontSize: '1.75rem',
                fontWeight: 850,
                color: '#0F172A',
                letterSpacing: '-0.025em',
                lineHeight: 1.2,
                margin: 0,
              }}
            >
              {getGreeting()}
            </h1>
            <p style={{ fontSize: '0.875rem', color: '#64748B', marginTop: '4px', margin: '4px 0 0 0' }}>
              Protect brand equity across all channels with real-time deterministic audits.
            </p>
          </div>
        </div>

        {/* Action Buttons */}
        <div style={{ display: 'flex', alignItems: 'center', gap: '10px', flexWrap: 'wrap' }}>
          <Link
            to="/guidelines"
            className="btn btn-secondary btn-sm"
            style={{
              padding: '9px 16px',
              fontSize: '0.8125rem',
              borderRadius: '12px',
            }}
          >
            <BookOpen size={15} color="#7C3AED" />
            <span>Guidelines</span>
          </Link>

          <Link
            to="/assets"
            className="btn btn-secondary btn-sm"
            style={{
              padding: '9px 16px',
              fontSize: '0.8125rem',
              borderRadius: '12px',
            }}
          >
            <Palette size={15} color="#06B6D4" />
            <span>Assets</span>
          </Link>

          <button
            onClick={() => navigate('/review')}
            className="btn btn-gradient-primary btn-sm"
            style={{
              padding: '9px 20px',
              fontSize: '0.8125rem',
              borderRadius: '12px',
            }}
            title="Run instant brand compliance audit on new content"
          >
            <Plus size={16} strokeWidth={2.5} />
            <span>Start New Review</span>
          </button>
        </div>
      </section>

      {/* ===================================================================
          2. COLOURFUL KPI CARDS (Rich Multi-Colour Palette of 5 Cards)
          =================================================================== */}
      <section className="dashboard-kpi-grid-5">
        {/* KPI 1: Overall Compliance (Electric Blue / Cyan) */}
        <div
          className="kpi-card-vibrant kpi-card-blue"
          onClick={() => {
            const el = document.getElementById('brand-health-overview');
            if (el) el.scrollIntoView({ behavior: 'smooth' });
          }}
          title="Overall compliance score across workspace"
        >
          <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'flex-start' }}>
            <span style={{ fontSize: '0.75rem', fontWeight: 700, color: '#64748B', textTransform: 'uppercase', letterSpacing: '0.04em' }}>
              Compliance Score
            </span>
            <div className="icon-tile icon-tile-blue" style={{ width: '36px', height: '36px' }}>
              <ShieldCheck size={18} strokeWidth={2.4} />
            </div>
          </div>
          <div style={{ marginTop: '12px' }}>
            <div style={{ fontSize: '2rem', fontWeight: 850, color: '#0F172A', lineHeight: 1 }}>
              {averageScore}%
            </div>
            <div style={{ display: 'flex', alignItems: 'center', gap: '6px', marginTop: '8px' }}>
              {comparisonDiff !== null && comparisonDiff !== undefined && (
                <span
                  style={{
                    fontSize: '0.6875rem',
                    fontWeight: 700,
                    padding: '2px 6px',
                    borderRadius: '6px',
                    background: comparisonDiff >= 0 ? '#ECFDF5' : '#FFF1F2',
                    color: comparisonDiff >= 0 ? '#059669' : '#E11D48',
                  }}
                >
                  {comparisonDiff >= 0 ? `+${comparisonDiff}%` : `${comparisonDiff}%`}
                </span>
              )}
              <span style={{ fontSize: '0.75rem', color: '#64748B' }}>vs previous audit</span>
            </div>
          </div>
        </div>

        {/* KPI 2: High-Risk Issues (Coral) */}
        <div
          className="kpi-card-vibrant kpi-card-coral"
          onClick={() => {
            setSeverityFilter('high');
            const el = document.getElementById('recent-findings-section');
            if (el) el.scrollIntoView({ behavior: 'smooth' });
          }}
          title="Click to filter findings by High Severity"
        >
          <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'flex-start' }}>
            <span style={{ fontSize: '0.75rem', fontWeight: 700, color: '#64748B', textTransform: 'uppercase', letterSpacing: '0.04em' }}>
              High-Risk Issues
            </span>
            <div className="icon-tile icon-tile-coral" style={{ width: '36px', height: '36px' }}>
              <AlertTriangle size={18} strokeWidth={2.4} />
            </div>
          </div>
          <div style={{ marginTop: '12px' }}>
            <div style={{ fontSize: '2rem', fontWeight: 850, color: '#0F172A', lineHeight: 1 }}>
              {openHighRiskCount}
            </div>
            <div style={{ display: 'flex', alignItems: 'center', gap: '6px', marginTop: '8px' }}>
              <span
                style={{
                  fontSize: '0.6875rem',
                  fontWeight: 700,
                  padding: '2px 6px',
                  borderRadius: '6px',
                  background: openHighRiskCount > 0 ? '#FFF1F2' : '#ECFDF5',
                  color: openHighRiskCount > 0 ? '#E11D48' : '#059669',
                }}
              >
                {openHighRiskCount > 0 ? 'Action Required' : 'All Clear'}
              </span>
              <span style={{ fontSize: '0.75rem', color: '#64748B' }}>in open drafts</span>
            </div>
          </div>
        </div>

        {/* KPI 3: Pending Reviews (Soft Amber) */}
        <div
          className="kpi-card-vibrant kpi-card-amber"
          onClick={() => navigate('/approvals')}
          title="Click to open Approval Queue"
        >
          <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'flex-start' }}>
            <span style={{ fontSize: '0.75rem', fontWeight: 700, color: '#64748B', textTransform: 'uppercase', letterSpacing: '0.04em' }}>
              Pending Queue
            </span>
            <div className="icon-tile icon-tile-amber" style={{ width: '36px', height: '36px' }}>
              <Clock size={18} strokeWidth={2.4} />
            </div>
          </div>
          <div style={{ marginTop: '12px' }}>
            <div style={{ fontSize: '2rem', fontWeight: 850, color: '#0F172A', lineHeight: 1 }}>
              {pendingApprovalsCount}
            </div>
            <div style={{ display: 'flex', alignItems: 'center', gap: '6px', marginTop: '8px' }}>
              <span
                style={{
                  fontSize: '0.6875rem',
                  fontWeight: 700,
                  padding: '2px 6px',
                  borderRadius: '6px',
                  background: '#FFFBEB',
                  color: '#D97706',
                }}
              >
                Awaiting Sign-off
              </span>
              <span style={{ fontSize: '0.75rem', color: '#64748B' }}>by reviewer</span>
            </div>
          </div>
        </div>

        {/* KPI 4: Audits Completed (Mint Green) */}
        <div
          className="kpi-card-vibrant kpi-card-mint"
          onClick={() => navigate('/history')}
          title="Click to open Review History"
        >
          <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'flex-start' }}>
            <span style={{ fontSize: '0.75rem', fontWeight: 700, color: '#64748B', textTransform: 'uppercase', letterSpacing: '0.04em' }}>
              Audited This Month
            </span>
            <div className="icon-tile icon-tile-mint" style={{ width: '36px', height: '36px' }}>
              <TrendingUp size={18} strokeWidth={2.4} />
            </div>
          </div>
          <div style={{ marginTop: '12px' }}>
            <div style={{ fontSize: '2rem', fontWeight: 850, color: '#0F172A', lineHeight: 1 }}>
              {reviewedThisMonthCount}
            </div>
            <div style={{ display: 'flex', alignItems: 'center', gap: '6px', marginTop: '8px' }}>
              <span
                style={{
                  fontSize: '0.6875rem',
                  fontWeight: 700,
                  padding: '2px 6px',
                  borderRadius: '6px',
                  background: '#ECFDF5',
                  color: '#059669',
                }}
              >
                Scans Active
              </span>
              <span style={{ fontSize: '0.75rem', color: '#64748B' }}>deterministic</span>
            </div>
          </div>
        </div>

        {/* KPI 5: Active Rules (Violet) */}
        <div
          className="kpi-card-vibrant kpi-card-violet"
          onClick={() => navigate('/guidelines')}
          title="Click to manage Brand Rules"
        >
          <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'flex-start' }}>
            <span style={{ fontSize: '0.75rem', fontWeight: 700, color: '#64748B', textTransform: 'uppercase', letterSpacing: '0.04em' }}>
              Enforced Rules
            </span>
            <div className="icon-tile icon-tile-violet" style={{ width: '36px', height: '36px' }}>
              <BookOpen size={18} strokeWidth={2.4} />
            </div>
          </div>
          <div style={{ marginTop: '12px' }}>
            <div style={{ fontSize: '2rem', fontWeight: 850, color: '#0F172A', lineHeight: 1 }}>
              {totalActiveRules}
            </div>
            <div style={{ display: 'flex', alignItems: 'center', gap: '6px', marginTop: '8px' }}>
              <span
                style={{
                  fontSize: '0.6875rem',
                  fontWeight: 700,
                  padding: '2px 6px',
                  borderRadius: '6px',
                  background: '#F5F3FF',
                  color: '#7C3AED',
                }}
              >
                Brand Guardrails
              </span>
              <span style={{ fontSize: '0.75rem', color: '#64748B' }}>across 6 pillars</span>
            </div>
          </div>
        </div>
      </section>

      {/* ===================================================================
          3. TOP ROW: Brand Compliance Chart (Left) & Review Queue (Right)
          =================================================================== */}
      <section className="dashboard-grid-top" id="brand-health-overview">
        {/* BRAND HEALTH OVERVIEW & COMPLIANCE CHART */}
        <div className="glass-card" style={{ padding: '24px', display: 'flex', flexDirection: 'column', justifyContent: 'space-between' }}>
          <div>
            {/* Card Header */}
            <div
              style={{
                display: 'flex',
                alignItems: 'flex-start',
                justifyContent: 'space-between',
                marginBottom: '18px',
              }}
            >
              <div style={{ display: 'flex', gap: '14px', alignItems: 'center' }}>
                <div className="icon-tile icon-tile-blue" style={{ width: '42px', height: '42px' }}>
                  <Shield size={22} strokeWidth={2.3} />
                </div>
                <div>
                  <h2 style={{ fontSize: '1.125rem', fontWeight: 800, color: '#0F172A', lineHeight: 1.2, margin: 0 }}>
                    Brand Compliance & Health
                  </h2>
                  <p style={{ fontSize: '0.75rem', color: '#64748B', marginTop: '3px', margin: '3px 0 0 0' }}>
                    Overall compliance score based on active guidelines, terminology, and approved facts.
                  </p>
                </div>
              </div>

              {/* Functional Date Range Selector */}
              <select
                value={healthDateRange}
                onChange={(e) => setHealthDateRange(e.target.value)}
                className="form-select"
                style={{
                  width: 'auto',
                  padding: '5px 28px 5px 12px',
                  fontSize: '0.75rem',
                  fontWeight: 700,
                  borderRadius: '10px',
                }}
              >
                <option value="30d">Last 30 Days</option>
                <option value="90d">Last 90 Days</option>
                <option value="all">All Time</option>
              </select>
            </div>

            {/* Score & Health Summary Box */}
            <div
              style={{
                display: 'flex',
                alignItems: 'center',
                gap: '24px',
                padding: '16px 20px',
                borderRadius: '16px',
                background: 'linear-gradient(135deg, #F8FAFC 0%, #EFF6FF 100%)',
                border: '1px solid #E2E8F0',
                marginBottom: '20px',
              }}
            >
              <ComplianceScoreRing score={averageScore || 0} size={86} strokeWidth={8} showBadge={true} />

              <div style={{ flex: 1 }}>
                <div style={{ display: 'flex', alignItems: 'center', gap: '10px', marginBottom: '6px', flexWrap: 'wrap' }}>
                  <span
                    style={{
                      display: 'inline-flex',
                      alignItems: 'center',
                      gap: '5px',
                      fontSize: '0.75rem',
                      fontWeight: 700,
                      padding: '3px 10px',
                      borderRadius: '999px',
                      background: averageScore >= 80 ? '#ECFDF5' : averageScore >= 60 ? '#FFFBEB' : '#FFF1F2',
                      color: healthStatusColor,
                      border: `1px solid ${averageScore >= 80 ? '#A7F3D0' : averageScore >= 60 ? '#FDE68A' : '#FECDD3'}`,
                    }}
                  >
                    <span
                      style={{
                        width: '6px',
                        height: '6px',
                        borderRadius: '50%',
                        background: healthStatusColor,
                      }}
                    />
                    {healthStatusLabel}
                  </span>

                  {comparisonDiff !== null && comparisonDiff !== undefined && comparisonDiff !== 0 && (
                    <span
                      style={{
                        fontSize: '0.75rem',
                        fontWeight: 700,
                        color: comparisonDiff >= 0 ? '#059669' : '#E11D48',
                        display: 'inline-flex',
                        alignItems: 'center',
                        gap: '3px',
                      }}
                    >
                      {comparisonDiff >= 0 ? `+${comparisonDiff}%` : `${comparisonDiff}%`} vs benchmark
                    </span>
                  )}
                </div>

                <p style={{ fontSize: '0.8125rem', color: '#475569', lineHeight: 1.45, margin: 0 }}>
                  {healthExplanation}
                </p>
              </div>
            </div>
          </div>

          {/* Interactive Compliance Trend Area Chart */}
          <div>
            <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '10px' }}>
              <span style={{ fontSize: '0.75rem', fontWeight: 700, color: '#64748B', textTransform: 'uppercase', letterSpacing: '0.04em' }}>
                Compliance Timeline Trend
              </span>
              {hoveredPoint ? (
                <span
                  style={{
                    fontSize: '0.75rem',
                    fontWeight: 700,
                    color: '#2563EB',
                    background: '#EFF6FF',
                    padding: '2px 8px',
                    borderRadius: '6px',
                    border: '1px solid #BFDBFE',
                  }}
                >
                  {hoveredPoint.date}: {hoveredPoint.score}% • {hoveredPoint.draftTitle || 'Content Review'}
                </span>
              ) : (
                <span style={{ fontSize: '0.75rem', color: '#94A3B8' }}>Hover points for audit details</span>
              )}
            </div>

            {filteredTrend.length > 0 ? (
              <div style={{ position: 'relative', width: '100%', height: '125px' }}>
                <svg
                  viewBox="0 0 500 120"
                  style={{ width: '100%', height: '100%', overflow: 'visible' }}
                  preserveAspectRatio="none"
                >
                  <defs>
                    <linearGradient id="vibrantTrendGrad" x1="0" y1="0" x2="0" y2="1">
                      <stop offset="0%" stopColor="#2563EB" stopOpacity="0.28" />
                      <stop offset="50%" stopColor="#7C3AED" stopOpacity="0.12" />
                      <stop offset="100%" stopColor="#06B6D4" stopOpacity="0.0" />
                    </linearGradient>
                  </defs>

                  {/* Benchmark Guide Lines */}
                  <line x1="0" y1="20" x2="500" y2="20" stroke="#CBD5E1" strokeDasharray="3 3" opacity="0.6" />
                  <line x1="0" y1="60" x2="500" y2="60" stroke="#CBD5E1" strokeDasharray="3 3" opacity="0.4" />
                  <line x1="0" y1="100" x2="500" y2="100" stroke="#CBD5E1" strokeDasharray="3 3" opacity="0.3" />

                  {/* Build Polyline Path */}
                  {(() => {
                    const pointsCount = filteredTrend.length;
                    const coords = filteredTrend.map((p, idx) => {
                      const x = pointsCount === 1 ? 250 : (idx / (pointsCount - 1)) * 480 + 10;
                      const y = 105 - (p.score / 100) * 90;
                      return { x, y, ...p };
                    });

                    const linePointsStr = coords.map((c) => `${c.x},${c.y}`).join(' ');
                    const areaPointsStr = `10,115 ${linePointsStr} ${coords[coords.length - 1].x},115`;

                    return (
                      <>
                        {/* Shaded Area Fill */}
                        <polygon points={areaPointsStr} fill="url(#vibrantTrendGrad)" />

                        {/* Trend Stroke Line */}
                        <polyline
                          points={linePointsStr}
                          fill="none"
                          stroke="#2563EB"
                          strokeWidth="2.8"
                          strokeLinecap="round"
                          strokeLinejoin="round"
                        />

                        {/* Interactive Data Nodes */}
                        {coords.map((c, i) => (
                          <g key={i}>
                            <circle
                              cx={c.x}
                              cy={c.y}
                              r={hoveredPoint === c ? '6' : '4'}
                              fill="#FFFFFF"
                              stroke="#2563EB"
                              strokeWidth="2.5"
                              style={{ cursor: 'pointer', transition: 'all 0.18s ease' }}
                              onMouseEnter={() => setHoveredPoint(c)}
                              onMouseLeave={() => setHoveredPoint(null)}
                            />
                            {hoveredPoint === c && (
                              <circle cx={c.x} cy={c.y} r="10" fill="#2563EB" opacity="0.2" />
                            )}
                          </g>
                        ))}
                      </>
                    );
                  })()}
                </svg>

                {/* X Axis Labels */}
                <div
                  style={{
                    display: 'flex',
                    justifyContent: 'space-between',
                    marginTop: '6px',
                    fontSize: '0.6875rem',
                    color: '#64748B',
                    fontWeight: 500,
                  }}
                >
                  <span>{filteredTrend[0]?.date}</span>
                  {filteredTrend.length > 2 && (
                    <span>{filteredTrend[Math.floor(filteredTrend.length / 2)]?.date}</span>
                  )}
                  <span>{filteredTrend[filteredTrend.length - 1]?.date}</span>
                </div>
              </div>
            ) : (
              <div
                style={{
                  padding: '24px 16px',
                  textAlign: 'center',
                  background: '#F8FAFC',
                  borderRadius: '12px',
                  color: '#64748B',
                  fontSize: '0.8125rem',
                  border: '1px dashed #E2E8F0',
                }}
              >
                No historical trend data yet. Run reviews to build compliance timeline.
              </div>
            )}
          </div>
        </div>

        {/* REVIEW QUEUE (Right Column) */}
        <div className="glass-card" style={{ padding: '24px', display: 'flex', flexDirection: 'column', justifyContent: 'space-between' }}>
          <div>
            {/* Header */}
            <div
              style={{
                display: 'flex',
                alignItems: 'flex-start',
                justifyContent: 'space-between',
                marginBottom: '18px',
              }}
            >
              <div style={{ display: 'flex', gap: '14px', alignItems: 'center' }}>
                <div className="icon-tile icon-tile-mint" style={{ width: '42px', height: '42px' }}>
                  <FileText size={22} strokeWidth={2.3} />
                </div>
                <div>
                  <h2 style={{ fontSize: '1.125rem', fontWeight: 800, color: '#0F172A', lineHeight: 1.2, margin: 0 }}>
                    Review Queue
                  </h2>
                  <p style={{ fontSize: '0.75rem', color: '#64748B', marginTop: '3px', margin: '3px 0 0 0' }}>
                    Recent content submitted for brand verification and sign-off.
                  </p>
                </div>
              </div>

              <Link
                to="/approvals"
                style={{
                  fontSize: '0.8125rem',
                  fontWeight: 700,
                  color: '#2563EB',
                  textDecoration: 'none',
                  display: 'inline-flex',
                  alignItems: 'center',
                  gap: '4px',
                }}
              >
                View Queue <ChevronRight size={14} />
              </Link>
            </div>

            {/* List of Real Review Records */}
            <div style={{ display: 'flex', flexDirection: 'column', gap: '10px' }}>
              {recentDrafts && recentDrafts.length > 0 ? (
                recentDrafts.slice(0, 4).map((draft) => {
                  const authorInitials = draft.author?.name
                    ? draft.author.name
                        .split(' ')
                        .map((n) => n[0])
                        .join('')
                        .toUpperCase()
                        .slice(0, 2)
                    : 'AU';

                  return (
                    <div
                      key={draft._id}
                      style={{
                        display: 'flex',
                        alignItems: 'center',
                        justifyContent: 'space-between',
                        padding: '10px 14px',
                        borderRadius: '14px',
                        background: '#FFFFFF',
                        border: '1px solid #E2E8F0',
                        gap: '12px',
                        transition: 'all 0.18s cubic-bezier(0.16, 1, 0.3, 1)',
                        boxShadow: '0 1px 3px rgba(15, 23, 42, 0.02)',
                      }}
                    >
                      <div style={{ display: 'flex', alignItems: 'center', gap: '12px', minWidth: 0 }}>
                        {/* Thumbnail Tile */}
                        <div
                          className="icon-tile icon-tile-blue"
                          style={{
                            width: '36px',
                            height: '36px',
                            borderRadius: '10px',
                          }}
                        >
                          <FileText size={16} />
                        </div>

                        {/* Title & Metadata */}
                        <div style={{ minWidth: 0 }}>
                          <Link
                            to={`/review/${draft._id}`}
                            style={{
                              fontSize: '0.875rem',
                              fontWeight: 700,
                              color: '#0F172A',
                              textDecoration: 'none',
                              display: 'block',
                              overflow: 'hidden',
                              textOverflow: 'ellipsis',
                              whiteSpace: 'nowrap',
                            }}
                          >
                            {draft.title}
                          </Link>
                          <div
                            style={{
                              display: 'flex',
                              alignItems: 'center',
                              gap: '6px',
                              fontSize: '0.6875rem',
                              color: '#64748B',
                              marginTop: '2px',
                            }}
                          >
                            <span style={{ textTransform: 'capitalize', fontWeight: 600 }}>
                              {draft.contentType?.replace(/_/g, ' ') || 'Document'}
                            </span>
                            <span>•</span>
                            <span>{new Date(draft.updatedAt).toLocaleDateString([], { month: 'short', day: 'numeric' })}</span>
                          </div>
                        </div>
                      </div>

                      {/* Right: Badges & Review CTA */}
                      <div style={{ display: 'flex', alignItems: 'center', gap: '8px', flexShrink: 0 }}>
                        <WorkflowStatusBadge status={draft.status} />

                        {draft.latestComplianceScore !== undefined && (
                          <span
                            style={{
                              fontSize: '0.75rem',
                              fontWeight: 700,
                              padding: '2px 8px',
                              borderRadius: '6px',
                              background: draft.latestComplianceScore >= 80 ? '#ECFDF5' : '#FFF1F2',
                              color: draft.latestComplianceScore >= 80 ? '#059669' : '#E11D48',
                              border: `1px solid ${draft.latestComplianceScore >= 80 ? '#A7F3D0' : '#FECDD3'}`,
                            }}
                            title={`Compliance Score: ${draft.latestComplianceScore}%`}
                          >
                            {draft.latestComplianceScore}%
                          </span>
                        )}

                        {/* Author Avatar */}
                        <div
                          style={{
                            width: '26px',
                            height: '26px',
                            borderRadius: '50%',
                            background: 'linear-gradient(135deg, #2563EB, #7C3AED)',
                            color: '#FFFFFF',
                            display: 'flex',
                            alignItems: 'center',
                            justifyContent: 'center',
                            fontSize: '0.6875rem',
                            fontWeight: 700,
                          }}
                          title={`Author: ${draft.author?.name || 'Workspace Member'}`}
                        >
                          {authorInitials}
                        </div>

                        <Link
                          to={`/review/${draft._id}`}
                          className="btn btn-secondary btn-sm"
                          style={{ padding: '4px 10px', fontSize: '0.75rem', borderRadius: '8px' }}
                        >
                          Review
                        </Link>
                      </div>
                    </div>
                  );
                })
              ) : (
                <div style={{ padding: '36px 16px', textAlign: 'center', color: '#64748B', fontSize: '0.875rem' }}>
                  No drafts submitted for review yet.
                </div>
              )}
            </div>
          </div>

          <div style={{ paddingTop: '14px', marginTop: '14px', borderTop: '1px solid #F1F5F9' }}>
            <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', fontSize: '0.75rem', color: '#64748B' }}>
              <span>Total Workspace Submissions: <strong style={{ color: '#0F172A' }}>{recentDrafts.length}</strong></span>
              <Link to="/review" style={{ color: '#2563EB', fontWeight: 700, textDecoration: 'none' }}>
                + Submit New Draft
              </Link>
            </div>
          </div>
        </div>
      </section>

      {/* ===================================================================
          4. RECENT FINDINGS TABLE (Interactive Resolution Hub)
          =================================================================== */}
      <section className="glass-card" id="recent-findings-section" style={{ padding: '24px' }}>
        {/* Table Header & Controls */}
        <div
          style={{
            display: 'flex',
            flexWrap: 'wrap',
            alignItems: 'center',
            justifyContent: 'space-between',
            gap: '16px',
            marginBottom: '18px',
          }}
        >
          <div style={{ display: 'flex', alignItems: 'center', gap: '12px' }}>
            <div className="icon-tile icon-tile-coral" style={{ width: '40px', height: '40px' }}>
              <AlertTriangle size={20} strokeWidth={2.4} />
            </div>
            <div>
              <h2 style={{ fontSize: '1.125rem', fontWeight: 800, color: '#0F172A', lineHeight: 1.2, margin: 0 }}>
                Recent Governance Findings
              </h2>
              <p style={{ fontSize: '0.75rem', color: '#64748B', marginTop: '3px', margin: '3px 0 0 0' }}>
                Real-time rule deviations detected across drafts with single-click resolution.
              </p>
            </div>
          </div>

          {/* Filters Bar */}
          <div style={{ display: 'flex', flexWrap: 'wrap', alignItems: 'center', gap: '8px' }}>
            {/* Category Filter */}
            <select
              value={categoryFilter}
              onChange={(e) => setCategoryFilter(e.target.value)}
              className="form-select"
              style={{ width: 'auto', padding: '5px 28px 5px 10px', fontSize: '0.75rem', borderRadius: '10px' }}
            >
              <option value="">All Categories</option>
              <option value="Tone of voice">Tone of voice</option>
              <option value="Terminology">Terminology</option>
              <option value="Messaging">Messaging</option>
              <option value="Promotional claims">Promotional claims</option>
              <option value="Visual identity">Visual identity</option>
              <option value="Accessibility">Accessibility</option>
              <option value="Required disclaimers">Required disclaimers</option>
              <option value="Approved facts">Approved facts</option>
            </select>

            {/* Severity Filter */}
            <select
              value={severityFilter}
              onChange={(e) => setSeverityFilter(e.target.value)}
              className="form-select"
              style={{ width: 'auto', padding: '5px 28px 5px 10px', fontSize: '0.75rem', borderRadius: '10px' }}
            >
              <option value="">All Severities</option>
              <option value="high">High Severity</option>
              <option value="medium">Medium Severity</option>
              <option value="low">Low Severity</option>
            </select>

            {/* Status Filter */}
            <select
              value={statusFilter}
              onChange={(e) => setStatusFilter(e.target.value)}
              className="form-select"
              style={{ width: 'auto', padding: '5px 28px 5px 10px', fontSize: '0.75rem', borderRadius: '10px' }}
            >
              <option value="">All Statuses</option>
              <option value="open">Open</option>
              <option value="resolved">Resolved</option>
              <option value="dismissed">Dismissed</option>
            </select>

            {(categoryFilter || severityFilter || statusFilter) && (
              <button
                onClick={() => {
                  setCategoryFilter('');
                  setSeverityFilter('');
                  setStatusFilter('');
                }}
                className="btn btn-secondary btn-sm"
                style={{ padding: '4px 10px', fontSize: '0.75rem', borderRadius: '8px' }}
              >
                Clear Filters
              </button>
            )}

            <Link
              to="/approvals"
              className="btn btn-secondary btn-sm"
              style={{ display: 'inline-flex', alignItems: 'center', gap: '4px', padding: '6px 12px', borderRadius: '10px' }}
            >
              <span>View All</span>
              <ArrowRight size={13} />
            </Link>
          </div>
        </div>

        {/* Table Container */}
        <div className="table-container">
          <table className="table-clean">
            <thead>
              <tr>
                <th style={{ width: '40px' }}>#</th>
                <th>Content Title</th>
                <th>Category</th>
                <th>Flagged Excerpt</th>
                <th>Relevant Rule / Source</th>
                <th>Severity</th>
                <th>Status</th>
                <th style={{ textAlign: 'right' }}>Actions</th>
              </tr>
            </thead>
            <tbody>
              {findingsLoading ? (
                <tr>
                  <td colSpan="8" style={{ textAlign: 'center', padding: '36px' }}>
                    <div style={{ color: '#64748B', fontSize: '0.875rem' }}>Filtering findings...</div>
                  </td>
                </tr>
              ) : findings.length > 0 ? (
                findings.map((f, idx) => (
                  <tr key={f._id}>
                    {/* Index */}
                    <td style={{ color: '#94A3B8', fontSize: '0.75rem', fontWeight: 600 }}>
                      {idx + 1}
                    </td>

                    {/* Content Title */}
                    <td>
                      <Link
                        to={`/review/${f.draft?._id || f.draft}`}
                        style={{
                          fontWeight: 700,
                          color: '#0F172A',
                          textDecoration: 'none',
                          display: 'block',
                          maxWidth: '160px',
                          overflow: 'hidden',
                          textOverflow: 'ellipsis',
                          whiteSpace: 'nowrap',
                        }}
                        title={f.draft?.title || 'Open Draft'}
                      >
                        {f.draft?.title || 'Submitted Content'}
                      </Link>
                      <span style={{ fontSize: '0.6875rem', color: '#64748B', textTransform: 'capitalize' }}>
                        {f.draft?.contentType?.replace(/_/g, ' ') || 'Document'}
                      </span>
                    </td>

                    {/* Category */}
                    <td>
                      <span
                        style={{
                          fontSize: '0.75rem',
                          fontWeight: 600,
                          color: '#4338CA',
                          background: '#EEF2FF',
                          padding: '3px 8px',
                          borderRadius: '6px',
                          border: '1px solid #E0E7FF',
                          whiteSpace: 'nowrap',
                        }}
                      >
                        {f.category}
                      </span>
                    </td>

                    {/* Flagged Excerpt */}
                    <td style={{ maxWidth: '190px' }}>
                      <div
                        style={{
                          fontSize: '0.8125rem',
                          color: '#E11D48',
                          background: '#FFF1F2',
                          padding: '4px 8px',
                          borderRadius: '6px',
                          borderLeft: '3px solid #F43F5E',
                          overflow: 'hidden',
                          textOverflow: 'ellipsis',
                          whiteSpace: 'nowrap',
                          fontWeight: 500,
                        }}
                        title={f.flaggedSnippet || f.explanation}
                      >
                        "{f.flaggedSnippet || f.explanation}"
                      </div>
                    </td>

                    {/* Rule / Source */}
                    <td style={{ maxWidth: '140px' }}>
                      <span
                        style={{
                          fontSize: '0.75rem',
                          color: '#475569',
                          display: 'block',
                          overflow: 'hidden',
                          textOverflow: 'ellipsis',
                          whiteSpace: 'nowrap',
                          fontWeight: 500,
                        }}
                        title={f.ruleRef?.name || f.factRef?.statement || f.explanation}
                      >
                        {f.ruleRef?.name || f.factRef?.topic || 'Standard Rule'}
                      </span>
                    </td>

                    {/* Severity */}
                    <td>
                      <SeverityBadge severity={f.severity} />
                    </td>

                    {/* Status */}
                    <td>
                      <span
                        style={{
                          display: 'inline-block',
                          fontSize: '0.6875rem',
                          fontWeight: 700,
                          textTransform: 'uppercase',
                          padding: '2px 8px',
                          borderRadius: '999px',
                          background:
                            f.status === 'resolved'
                              ? '#ECFDF5'
                              : f.status === 'dismissed'
                              ? '#F1F5F9'
                              : '#FFFBEB',
                          color:
                            f.status === 'resolved'
                              ? '#059669'
                              : f.status === 'dismissed'
                              ? '#64748B'
                              : '#D97706',
                          border: `1px solid ${
                            f.status === 'resolved'
                              ? '#A7F3D0'
                              : f.status === 'dismissed'
                              ? '#E2E8F0'
                              : '#FDE68A'
                          }`,
                        }}
                      >
                        {f.status}
                      </span>
                    </td>

                    {/* Actions */}
                    <td style={{ textAlign: 'right' }}>
                      <div style={{ display: 'inline-flex', alignItems: 'center', gap: '6px' }}>
                        <Link
                          to={`/review/${f.draft?._id || f.draft}`}
                          className="btn btn-secondary btn-sm"
                          style={{ padding: '4px 8px', fontSize: '0.75rem', borderRadius: '8px' }}
                          title="Open Finding in Review Studio"
                        >
                          Review
                        </Link>
                        {f.status === 'open' && (
                          <button
                            type="button"
                            onClick={() => handleResolveFinding(f)}
                            disabled={resolvingId === f._id}
                            className="btn btn-sm"
                            style={{
                              padding: '4px 8px',
                              fontSize: '0.75rem',
                              background: '#ECFDF5',
                              color: '#059669',
                              border: '1px solid #A7F3D0',
                              fontWeight: 700,
                              borderRadius: '8px',
                            }}
                            title="Resolve finding directly"
                          >
                            {resolvingId === f._id ? 'Saving...' : 'Resolve'}
                          </button>
                        )}
                      </div>
                    </td>
                  </tr>
                ))
              ) : (
                <tr>
                  <td colSpan="8" style={{ textAlign: 'center', padding: '40px' }}>
                    <div className="icon-tile icon-tile-mint" style={{ width: '44px', height: '44px', margin: '0 auto 8px auto' }}>
                      <CheckCircle2 size={24} />
                    </div>
                    <div style={{ fontSize: '0.875rem', fontWeight: 700, color: '#0F172A' }}>
                      No findings match the selected filters
                    </div>
                    <div style={{ fontSize: '0.75rem', color: '#64748B', marginTop: '2px' }}>
                      All reviewed copy adheres to current brand governance policies.
                    </div>
                  </td>
                </tr>
              )}
            </tbody>
          </table>
        </div>
      </section>

      {/* ===================================================================
          5. BOTTOM ROW: Brand Identity Panel (Left) & Guideline Coverage (Right)
          =================================================================== */}
      <section className="dashboard-grid-bottom">
        {/* BRAND IDENTITY PANEL */}
        <div className="glass-card" style={{ padding: '24px', display: 'flex', flexDirection: 'column', justifyContent: 'space-between' }}>
          <div>
            {/* Header */}
            <div
              style={{
                display: 'flex',
                alignItems: 'flex-start',
                justifyContent: 'space-between',
                marginBottom: '18px',
              }}
            >
              <div style={{ display: 'flex', gap: '14px', alignItems: 'center' }}>
                <div className="icon-tile icon-tile-violet" style={{ width: '42px', height: '42px' }}>
                  <Palette size={22} strokeWidth={2.3} />
                </div>
                <div>
                  <h2 style={{ fontSize: '1.125rem', fontWeight: 800, color: '#0F172A', lineHeight: 1.2, margin: 0 }}>
                    Brand Identity Panel
                  </h2>
                  <p style={{ fontSize: '0.75rem', color: '#64748B', marginTop: '3px', margin: '3px 0 0 0' }}>
                    Active color standards, typography specs, and approved visual tokens.
                  </p>
                </div>
              </div>

              <Link to="/guidelines" className="btn btn-secondary btn-sm" style={{ borderRadius: '10px' }}>
                Manage Specs
              </Link>
            </div>

            {brandProfile ? (
              <div style={{ display: 'flex', flexDirection: 'column', gap: '18px' }}>
                {/* Brand Colors Swatches */}
                <div>
                  <span
                    style={{
                      fontSize: '0.75rem',
                      fontWeight: 700,
                      textTransform: 'uppercase',
                      color: '#64748B',
                      letterSpacing: '0.04em',
                      display: 'block',
                      marginBottom: '10px',
                    }}
                  >
                    Approved Color Palette
                  </span>
                  <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(110px, 1fr))', gap: '10px' }}>
                    {(brandProfile.brandColors || brandProfile.colors || []).length > 0 ? (
                      (brandProfile.brandColors || brandProfile.colors).map((c, i) => (
                        <div
                          key={i}
                          onClick={() => handleCopyHex(c.hex)}
                          style={{
                            padding: '10px',
                            borderRadius: '12px',
                            background: '#FFFFFF',
                            border: '1px solid #E2E8F0',
                            cursor: 'pointer',
                            display: 'flex',
                            flexDirection: 'column',
                            gap: '6px',
                            transition: 'all 0.18s cubic-bezier(0.16, 1, 0.3, 1)',
                            boxShadow: '0 2px 4px rgba(15, 23, 42, 0.02)',
                          }}
                          title="Click to copy hex code"
                        >
                          <div
                            style={{
                              height: '32px',
                              borderRadius: '8px',
                              background: c.hex,
                              boxShadow: 'inset 0 0 0 1px rgba(0,0,0,0.1)',
                            }}
                          />
                          <div style={{ fontSize: '0.75rem', fontWeight: 700, color: '#0F172A', overflow: 'hidden', textOverflow: 'ellipsis', whiteSpace: 'nowrap' }}>
                            {c.name || c.role || 'Brand Color'}
                          </div>
                          <div
                            style={{
                              fontSize: '0.6875rem',
                              fontFamily: 'var(--font-mono)',
                              color: copiedHex === c.hex ? '#059669' : '#64748B',
                              display: 'flex',
                              alignItems: 'center',
                              justifyContent: 'space-between',
                            }}
                          >
                            <span>{c.hex}</span>
                            {copiedHex === c.hex ? <Check size={12} color="#059669" /> : <Copy size={12} />}
                          </div>
                        </div>
                      ))
                    ) : (
                      <div style={{ fontSize: '0.8125rem', color: '#64748B' }}>No registered colors.</div>
                    )}
                  </div>
                </div>

                {/* Typography Specs */}
                <div>
                  <span
                    style={{
                      fontSize: '0.75rem',
                      fontWeight: 700,
                      textTransform: 'uppercase',
                      color: '#64748B',
                      letterSpacing: '0.04em',
                      display: 'block',
                      marginBottom: '10px',
                    }}
                  >
                    Typography Settings
                  </span>
                  <div
                    style={{
                      display: 'grid',
                      gridTemplateColumns: '1fr 1fr',
                      gap: '10px',
                      padding: '12px 14px',
                      borderRadius: '12px',
                      background: '#F8FAFC',
                      border: '1px solid #E2E8F0',
                    }}
                  >
                    <div>
                      <div style={{ fontSize: '0.6875rem', color: '#64748B', fontWeight: 600 }}>Primary Body Font</div>
                      <div style={{ fontSize: '0.875rem', fontWeight: 800, color: '#0F172A', marginTop: '2px' }}>
                        {Array.isArray(brandProfile.typography)
                          ? brandProfile.typography.find((t) => t.role === 'Body')?.family || 'Inter'
                          : brandProfile.typography?.primaryFont || 'Inter, sans-serif'}
                      </div>
                    </div>
                    <div>
                      <div style={{ fontSize: '0.6875rem', color: '#64748B', fontWeight: 600 }}>Display Heading Font</div>
                      <div style={{ fontSize: '0.875rem', fontWeight: 800, color: '#0F172A', marginTop: '2px' }}>
                        {Array.isArray(brandProfile.typography)
                          ? brandProfile.typography.find((t) => t.role === 'Heading')?.family || 'Inter'
                          : brandProfile.typography?.headingFont || 'Plus Jakarta Sans'}
                      </div>
                    </div>
                  </div>
                </div>
              </div>
            ) : (
              <div
                style={{
                  padding: '32px 20px',
                  textAlign: 'center',
                  background: '#F8FAFC',
                  borderRadius: '14px',
                  color: '#64748B',
                  border: '1px dashed #E2E8F0',
                }}
              >
                <Palette size={28} color="#7C3AED" style={{ margin: '0 auto 8px auto' }} />
                <p style={{ fontSize: '0.875rem', fontWeight: 700, color: '#0F172A', margin: '0 0 6px 0' }}>
                  Brand profile not configured yet
                </p>
                <p style={{ fontSize: '0.75rem', margin: '0 0 12px 0' }}>
                  Set up approved color palettes, font pairings, and logo assets.
                </p>
                <Link to="/guidelines" className="btn btn-gradient-primary btn-sm">
                  Configure Brand Identity
                </Link>
              </div>
            )}
          </div>

          <div style={{ borderTop: '1px solid #F1F5F9', paddingTop: '12px', marginTop: '16px' }}>
            <span style={{ fontSize: '0.75rem', color: '#64748B' }}>
              Enforced automatically by InkGuard Deterministic Visual Engine
            </span>
          </div>
        </div>

        {/* GUIDELINE COVERAGE WIDGETS */}
        <div className="glass-card" style={{ padding: '24px', display: 'flex', flexDirection: 'column', justifyContent: 'space-between' }}>
          <div>
            {/* Header */}
            <div
              style={{
                display: 'flex',
                alignItems: 'flex-start',
                justifyContent: 'space-between',
                marginBottom: '18px',
              }}
            >
              <div style={{ display: 'flex', gap: '14px', alignItems: 'center' }}>
                <div className="icon-tile icon-tile-cyan" style={{ width: '42px', height: '42px' }}>
                  <ShieldCheck size={22} strokeWidth={2.3} />
                </div>
                <div>
                  <h2 style={{ fontSize: '1.125rem', fontWeight: 800, color: '#0F172A', lineHeight: 1.2, margin: 0 }}>
                    Guideline Coverage Widgets
                  </h2>
                  <p style={{ fontSize: '0.75rem', color: '#64748B', marginTop: '3px', margin: '3px 0 0 0' }}>
                    Active deterministic rules enforced across 6 core governance pillars.
                  </p>
                </div>
              </div>

              <Link to="/guidelines" className="btn btn-secondary btn-sm" style={{ borderRadius: '10px' }}>
                View All Rules
              </Link>
            </div>

            {/* Coverage Tiles Grid */}
            <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(130px, 1fr))', gap: '10px' }}>
              {[
                { label: 'Messaging', key: 'Messaging', icon: BookOpen, tileClass: 'icon-tile-blue' },
                { label: 'Terminology', key: 'Terminology', icon: CheckSquare, tileClass: 'icon-tile-violet' },
                { label: 'Visual Identity', key: 'Visual identity', icon: Palette, tileClass: 'icon-tile-cyan' },
                { label: 'Accessibility', key: 'Accessibility', icon: Layers, tileClass: 'icon-tile-mint' },
                { label: 'Promotional Claims', key: 'Promotional claims', icon: Sparkles, tileClass: 'icon-tile-coral' },
                { label: 'Tone of Voice', key: 'Tone of voice', icon: Info, tileClass: 'icon-tile-amber' },
              ].map((cat, idx) => {
                const count = getCategoryRuleCount(cat.key);
                const IconComponent = cat.icon;

                return (
                  <div
                    key={idx}
                    style={{
                      padding: '12px 14px',
                      borderRadius: '14px',
                      background: '#FFFFFF',
                      border: '1px solid #E2E8F0',
                      display: 'flex',
                      flexDirection: 'column',
                      justifyContent: 'space-between',
                      minHeight: '84px',
                      boxShadow: '0 1px 3px rgba(15, 23, 42, 0.02)',
                      transition: 'all 0.18s cubic-bezier(0.16, 1, 0.3, 1)',
                    }}
                  >
                    <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
                      <span style={{ fontSize: '0.75rem', fontWeight: 700, color: '#475569' }}>{cat.label}</span>
                      <div className={`icon-tile ${cat.tileClass}`} style={{ width: '26px', height: '26px', borderRadius: '7px' }}>
                        <IconComponent size={13} strokeWidth={2.4} />
                      </div>
                    </div>
                    <div style={{ fontSize: '1.35rem', fontWeight: 850, color: '#0F172A', marginTop: '6px' }}>
                      {count}{' '}
                      <span style={{ fontSize: '0.6875rem', fontWeight: 600, color: '#64748B' }}>
                        {count === 1 ? 'rule' : 'rules'}
                      </span>
                    </div>
                  </div>
                );
              })}
            </div>
          </div>

          <div
            style={{
              borderTop: '1px solid #F1F5F9',
              paddingTop: '12px',
              marginTop: '16px',
              display: 'flex',
              justifyContent: 'space-between',
              alignItems: 'center',
            }}
          >
            <span style={{ fontSize: '0.75rem', color: '#64748B' }}>
              Total Active Rules in Workspace: <strong style={{ color: '#0F172A' }}>{totalActiveRules}</strong>
            </span>
            <Link
              to="/guidelines"
              style={{
                fontSize: '0.75rem',
                fontWeight: 700,
                color: '#2563EB',
                textDecoration: 'none',
              }}
            >
              + Create Rule
            </Link>
          </div>
        </div>
      </section>
    </div>
  );
}
