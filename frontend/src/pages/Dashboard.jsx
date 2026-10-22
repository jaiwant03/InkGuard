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
  ExternalLink,
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
} from 'lucide-react';
import ComplianceScoreRing from '../components/ComplianceScoreRing';
import { SeverityBadge, WorkflowStatusBadge } from '../components/Badges';
import { api } from '../services/api';
import { useAuth } from '../context/AuthContext';
import { useToast } from '../context/ToastContext';

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

  // Handle Finding Resolution
  const handleResolveFinding = async (finding) => {
    if (!finding.draft?._id) return;
    try {
      setResolvingId(finding._id);
      const res = await api.drafts.updateFindingStatus(finding.draft._id, finding._id, {
        action: 'resolve',
      });
      if (res.success) {
        toast.success('Finding marked as resolved.');
        // Update local state without full reload
        setFindings((prev) =>
          prev.map((f) => (f._id === finding._id ? { ...f, status: 'resolved' } : f))
        );
        // Refresh metrics for score update
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
    month: 'long',
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
        <div style={{ height: '72px' }} className="skeleton card" />
        <div className="dashboard-grid-top">
          <div style={{ height: '320px' }} className="skeleton card" />
          <div style={{ height: '320px' }} className="skeleton card" />
        </div>
        <div className="dashboard-grid-metrics">
          <div style={{ height: '110px' }} className="skeleton card" />
          <div style={{ height: '110px' }} className="skeleton card" />
          <div style={{ height: '110px' }} className="skeleton card" />
        </div>
        <div style={{ height: '280px' }} className="skeleton card" />
      </div>
    );
  }

  if (error) {
    return (
      <div className="card" style={{ textAlign: 'center', padding: '48px 24px' }}>
        <ShieldAlert size={48} color="var(--severity-high)" style={{ margin: '0 auto 16px auto' }} />
        <h3 style={{ fontSize: '1.25rem', fontWeight: 700, marginBottom: '8px' }}>Unable to Load Dashboard Data</h3>
        <p style={{ color: 'var(--text-secondary)', marginBottom: '16px' }}>{error}</p>
        <button className="btn btn-primary" onClick={fetchMetrics}>
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
    scoreComparison = 0,
    recentDrafts = [],
    complianceTrend = [],
    brandProfile = null,
    guidelineCoverage = {},
    totalActiveRules = 0,
  } = metrics || {};

  // Status interpretation for Brand Health
  let healthStatusLabel = 'No Audit Data';
  let healthStatusColor = 'var(--text-tertiary)';
  let healthExplanation = 'Submit content to run deterministic brand governance audits.';

  if (averageScore > 0) {
    if (averageScore >= 85) {
      healthStatusLabel = 'Compliant';
      healthStatusColor = '#10B981';
      healthExplanation = 'Your content complies with active brand guidelines, voice standards, and verified claims.';
    } else if (averageScore >= 70) {
      healthStatusLabel = 'Minor Inconsistencies';
      healthStatusColor = '#F59E0B';
      healthExplanation = 'Moderate findings detected. Resolve flagged terminology and claims to reach compliance target.';
    } else {
      healthStatusLabel = 'Action Required';
      healthStatusColor = '#EF4444';
      healthExplanation = 'High-risk deviations detected. Content requires revision prior to public dissemination.';
    }
  }

  // Filter trend points by selected health date range
  const filteredTrend = complianceTrend.filter((point) => {
    if (healthDateRange === 'all') return true;
    const pointDate = new Date(point.date);
    const now = new Date();
    const daysAgo = healthDateRange === '90d' ? 90 : 30;
    const cutoff = new Date(now.setDate(now.getDate() - daysAgo));
    return pointDate >= cutoff;
  });

  return (
    <div style={{ display: 'flex', flexDirection: 'column', gap: '24px' }}>
      {/* 2. WELCOME HEADER */}
      <section
        style={{
          display: 'flex',
          flexWrap: 'wrap',
          alignItems: 'center',
          justifyContent: 'space-between',
          gap: '16px',
          padding: '4px 0',
        }}
      >
        <div>
          <h1
            style={{
              fontSize: '1.625rem',
              fontWeight: 800,
              color: '#0F172A',
              letterSpacing: '-0.025em',
              lineHeight: 1.2,
            }}
          >
            {getGreeting()}
          </h1>
          <p
            style={{
              fontSize: '0.875rem',
              color: '#64748B',
              marginTop: '4px',
              display: 'flex',
              alignItems: 'center',
              gap: '8px',
            }}
          >
            <span>Keep your brand consistent, credible and compliant across all content.</span>
            <span style={{ color: '#CBD5E1' }}>•</span>
            <span style={{ display: 'inline-flex', alignItems: 'center', gap: '4px', color: '#64748B' }}>
              <Calendar size={13} />
              {formattedToday}
            </span>
          </p>
        </div>

        <button
          onClick={() => navigate('/review')}
          className="btn btn-primary"
          style={{
            display: 'inline-flex',
            alignItems: 'center',
            gap: '8px',
            padding: '10px 18px',
            borderRadius: 'var(--radius-lg)',
            fontWeight: 600,
            fontSize: '0.875rem',
          }}
          title="Run brand compliance audit on new content"
        >
          <Plus size={18} />
          <span>Start New Review</span>
        </button>
      </section>

      {/* TOP ROW: Brand Health Overview (Left) & Review Queue (Right) */}
      <section className="dashboard-grid-top">
        {/* 3. BRAND HEALTH OVERVIEW */}
        <div className="card" style={{ display: 'flex', flexDirection: 'column', justifyContent: 'space-between' }}>
          <div>
            {/* Card Header */}
            <div
              style={{
                display: 'flex',
                alignItems: 'flex-start',
                justifyContent: 'space-between',
                marginBottom: '16px',
              }}
            >
              <div style={{ display: 'flex', gap: '12px', alignItems: 'center' }}>
                <div
                  style={{
                    width: '38px',
                    height: '38px',
                    borderRadius: '10px',
                    background: '#EFF6FF',
                    color: '#2563EB',
                    display: 'flex',
                    alignItems: 'center',
                    justifyContent: 'center',
                    flexShrink: 0,
                  }}
                >
                  <Shield size={20} strokeWidth={2.2} />
                </div>
                <div>
                  <h2 style={{ fontSize: '1.0625rem', fontWeight: 700, color: '#0F172A', lineHeight: 1.2 }}>
                    Brand Health Overview
                  </h2>
                  <p style={{ fontSize: '0.75rem', color: '#64748B', marginTop: '2px' }}>
                    Overall brand compliance based on your content, guidelines and approved facts.
                  </p>
                </div>
              </div>

              {/* Functional Date Range Selector */}
              <select
                value={healthDateRange}
                onChange={(e) => setHealthDateRange(e.target.value)}
                style={{
                  padding: '4px 8px',
                  borderRadius: 'var(--radius-md)',
                  border: '1px solid var(--border-light)',
                  fontSize: '0.75rem',
                  fontWeight: 600,
                  color: 'var(--text-secondary)',
                  background: '#FFFFFF',
                  cursor: 'pointer',
                  outline: 'none',
                }}
              >
                <option value="30d">Last 30 Days</option>
                <option value="90d">Last 90 Days</option>
                <option value="all">All Time</option>
              </select>
            </div>

            {/* Score & Health Summary */}
            <div
              style={{
                display: 'flex',
                alignItems: 'center',
                gap: '24px',
                padding: '12px 16px',
                borderRadius: 'var(--radius-lg)',
                background: '#F8FAFC',
                border: '1px solid #E2E8F0',
                marginBottom: '20px',
              }}
            >
              <ComplianceScoreRing score={averageScore || 0} size={84} strokeWidth={8} showBadge={true} />

              <div style={{ flex: 1 }}>
                <div style={{ display: 'flex', alignItems: 'center', gap: '8px', marginBottom: '4px' }}>
                  <span
                    style={{
                      display: 'inline-flex',
                      alignItems: 'center',
                      gap: '4px',
                      fontSize: '0.75rem',
                      fontWeight: 700,
                      padding: '2px 8px',
                      borderRadius: 'var(--radius-full)',
                      background: averageScore >= 80 ? '#ECFDF5' : averageScore >= 60 ? '#FFFBEB' : '#FEF2F2',
                      color: healthStatusColor,
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

                  {scoreComparison !== 0 && (
                    <span
                      style={{
                        fontSize: '0.75rem',
                        fontWeight: 600,
                        color: scoreComparison > 0 ? '#10B981' : '#EF4444',
                        display: 'inline-flex',
                        alignItems: 'center',
                        gap: '2px',
                      }}
                    >
                      {scoreComparison > 0 ? `+${scoreComparison}%` : `${scoreComparison}%`} vs last audit
                    </span>
                  )}
                </div>

                <p style={{ fontSize: '0.8125rem', color: '#475569', lineHeight: 1.4 }}>
                  {healthExplanation}
                </p>
              </div>
            </div>
          </div>

          {/* Compliance Trend Line Chart */}
          <div>
            <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '8px' }}>
              <span style={{ fontSize: '0.75rem', fontWeight: 600, color: 'var(--text-tertiary)', textTransform: 'uppercase', letterSpacing: '0.04em' }}>
                Compliance Trend
              </span>
              {hoveredPoint && (
                <span style={{ fontSize: '0.75rem', fontWeight: 600, color: '#2563EB' }}>
                  {hoveredPoint.date}: {hoveredPoint.score}% ({hoveredPoint.draftTitle})
                </span>
              )}
            </div>

            {filteredTrend.length > 0 ? (
              <div style={{ position: 'relative', width: '100%', height: '120px' }}>
                <svg
                  viewBox="0 0 500 120"
                  style={{ width: '100%', height: '100%', overflow: 'visible' }}
                  preserveAspectRatio="none"
                >
                  <defs>
                    <linearGradient id="trendGradient" x1="0" y1="0" x2="0" y2="1">
                      <stop offset="0%" stopColor="#2563EB" stopOpacity="0.22" />
                      <stop offset="100%" stopColor="#2563EB" stopOpacity="0.0" />
                    </linearGradient>
                  </defs>

                  {/* Horizontal Guide Lines */}
                  <line x1="0" y1="20" x2="500" y2="20" stroke="#E2E8F0" strokeDasharray="3 3" />
                  <line x1="0" y1="60" x2="500" y2="60" stroke="#E2E8F0" strokeDasharray="3 3" />
                  <line x1="0" y1="100" x2="500" y2="100" stroke="#E2E8F0" strokeDasharray="3 3" />

                  {/* Build Polyline Path */}
                  {(() => {
                    const pointsCount = filteredTrend.length;
                    const coords = filteredTrend.map((p, idx) => {
                      const x = pointsCount === 1 ? 250 : (idx / (pointsCount - 1)) * 480 + 10;
                      // Score from 0 to 100 maps to y=105 to y=15
                      const y = 105 - (p.score / 100) * 90;
                      return { x, y, ...p };
                    });

                    const linePointsStr = coords.map((c) => `${c.x},${c.y}`).join(' ');
                    const areaPointsStr = `10,110 ${linePointsStr} ${coords[coords.length - 1].x},110`;

                    return (
                      <>
                        {/* Shaded Area Fill */}
                        <polygon points={areaPointsStr} fill="url(#trendGradient)" />

                        {/* Trend Stroke Line */}
                        <polyline
                          points={linePointsStr}
                          fill="none"
                          stroke="#2563EB"
                          strokeWidth="2.5"
                          strokeLinecap="round"
                          strokeLinejoin="round"
                        />

                        {/* Interactive Data Nodes */}
                        {coords.map((c, i) => (
                          <g key={i}>
                            <circle
                              cx={c.x}
                              cy={c.y}
                              r="4"
                              fill="#FFFFFF"
                              stroke="#2563EB"
                              strokeWidth="2.5"
                              style={{ cursor: 'pointer', transition: 'r 0.15s ease' }}
                              onMouseEnter={() => setHoveredPoint(c)}
                              onMouseLeave={() => setHoveredPoint(null)}
                            />
                            {hoveredPoint === c && (
                              <circle cx={c.x} cy={c.y} r="7" fill="#2563EB" opacity="0.3" />
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
                    marginTop: '4px',
                    fontSize: '0.6875rem',
                    color: 'var(--text-tertiary)',
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
                  borderRadius: 'var(--radius-md)',
                  color: 'var(--text-tertiary)',
                  fontSize: '0.8125rem',
                }}
              >
                No historical trend data yet. Run reviews to build compliance timeline.
              </div>
            )}
          </div>
        </div>

        {/* 4. REVIEW QUEUE */}
        <div className="card" style={{ display: 'flex', flexDirection: 'column', justifyContent: 'space-between' }}>
          <div>
            {/* Header */}
            <div
              style={{
                display: 'flex',
                alignItems: 'flex-start',
                justifyContent: 'space-between',
                marginBottom: '16px',
              }}
            >
              <div style={{ display: 'flex', gap: '12px', alignItems: 'center' }}>
                <div
                  style={{
                    width: '38px',
                    height: '38px',
                    borderRadius: '10px',
                    background: '#F0FDF4',
                    color: '#16A34A',
                    display: 'flex',
                    alignItems: 'center',
                    justifyContent: 'center',
                    flexShrink: 0,
                  }}
                >
                  <FileText size={20} strokeWidth={2.2} />
                </div>
                <div>
                  <h2 style={{ fontSize: '1.0625rem', fontWeight: 700, color: '#0F172A', lineHeight: 1.2 }}>
                    Review Queue
                  </h2>
                  <p style={{ fontSize: '0.75rem', color: '#64748B', marginTop: '2px' }}>
                    Recent content submitted for review and approval.
                  </p>
                </div>
              </div>

              <Link
                to="/approvals"
                style={{
                  fontSize: '0.8125rem',
                  fontWeight: 600,
                  color: '#2563EB',
                  textDecoration: 'none',
                  display: 'inline-flex',
                  alignItems: 'center',
                  gap: '4px',
                }}
              >
                View All <ChevronRight size={14} />
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
                        padding: '10px 12px',
                        borderRadius: 'var(--radius-lg)',
                        background: '#F8FAFC',
                        border: '1px solid #E2E8F0',
                        gap: '12px',
                        transition: 'all 0.15s ease',
                      }}
                    >
                      <div style={{ display: 'flex', alignItems: 'center', gap: '12px', minWidth: 0 }}>
                        {/* Thumbnail Icon */}
                        <div
                          style={{
                            width: '34px',
                            height: '34px',
                            borderRadius: 'var(--radius-md)',
                            background: '#FFFFFF',
                            border: '1px solid #E2E8F0',
                            display: 'flex',
                            alignItems: 'center',
                            justifyContent: 'center',
                            color: '#2563EB',
                            flexShrink: 0,
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
                              fontWeight: 600,
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
                              gap: '8px',
                              fontSize: '0.6875rem',
                              color: '#64748B',
                              marginTop: '2px',
                            }}
                          >
                            <span style={{ textTransform: 'capitalize' }}>
                              {draft.contentType?.replace(/_/g, ' ') || 'Document'}
                            </span>
                            <span>•</span>
                            <span>{new Date(draft.updatedAt).toLocaleDateString([], { month: 'short', day: 'numeric' })}</span>
                          </div>
                        </div>
                      </div>

                      {/* Right: Badges & Review Action */}
                      <div style={{ display: 'flex', alignItems: 'center', gap: '8px', flexShrink: 0 }}>
                        <WorkflowStatusBadge status={draft.status} />

                        {draft.latestComplianceScore !== undefined && (
                          <span
                            style={{
                              fontSize: '0.75rem',
                              fontWeight: 700,
                              padding: '2px 6px',
                              borderRadius: 'var(--radius-sm)',
                              background: draft.latestComplianceScore >= 80 ? '#ECFDF5' : '#FEF2F2',
                              color: draft.latestComplianceScore >= 80 ? '#059669' : '#DC2626',
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
                            background: '#CBD5E1',
                            color: '#0F172A',
                            display: 'flex',
                            alignItems: 'center',
                            justifyContent: 'center',
                            fontSize: '0.6875rem',
                            fontWeight: 700,
                          }}
                          title={`Author: ${draft.author?.name || 'Authorized Member'}`}
                        >
                          {authorInitials}
                        </div>

                        <Link
                          to={`/review/${draft._id}`}
                          className="btn btn-secondary btn-sm"
                          style={{ padding: '4px 8px', fontSize: '0.75rem' }}
                        >
                          Review
                        </Link>
                      </div>
                    </div>
                  );
                })
              ) : (
                <div style={{ padding: '32px 16px', textAlign: 'center', color: '#64748B', fontSize: '0.875rem' }}>
                  No drafts submitted for review yet.
                </div>
              )}
            </div>
          </div>

          <div style={{ paddingTop: '12px', marginTop: '12px', borderTop: '1px solid #F1F5F9' }}>
            <div style={{ display: 'flex', justifyContent: 'space-between', fontSize: '0.75rem', color: '#64748B' }}>
              <span>Total Drafts in Workspace: {recentDrafts.length}</span>
              <Link to="/review" style={{ color: '#2563EB', fontWeight: 600, textDecoration: 'none' }}>
                + Submit New Draft
              </Link>
            </div>
          </div>
        </div>
      </section>

      {/* 5. QUICK METRIC CARDS (ROW OF 3) */}
      <section className="dashboard-grid-metrics">
        {/* Card 1: High-Risk Issues */}
        <div
          className="card"
          onClick={() => {
            setSeverityFilter('high');
            const el = document.getElementById('recent-findings-section');
            if (el) el.scrollIntoView({ behavior: 'smooth' });
          }}
          style={{
            cursor: 'pointer',
            borderLeft: '4px solid #EF4444',
            display: 'flex',
            flexDirection: 'column',
            justifyContent: 'space-between',
            transition: 'transform 0.15s ease, box-shadow 0.15s ease',
          }}
          onMouseEnter={(e) => {
            e.currentTarget.style.transform = 'translateY(-2px)';
            e.currentTarget.style.boxShadow = 'var(--shadow-md)';
          }}
          onMouseLeave={(e) => {
            e.currentTarget.style.transform = 'none';
            e.currentTarget.style.boxShadow = 'var(--shadow-sm)';
          }}
          title="Click to filter findings by High Severity"
        >
          <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'flex-start' }}>
            <div>
              <span style={{ fontSize: '0.8125rem', fontWeight: 600, color: '#64748B' }}>High-Risk Issues</span>
              <div style={{ fontSize: '1.75rem', fontWeight: 800, color: '#0F172A', marginTop: '4px' }}>
                {openHighRiskCount}
              </div>
            </div>
            <div
              style={{
                width: '36px',
                height: '36px',
                borderRadius: 'var(--radius-md)',
                background: '#FEF2F2',
                color: '#EF4444',
                display: 'flex',
                alignItems: 'center',
                justifyContent: 'center',
              }}
            >
              <AlertTriangle size={18} />
            </div>
          </div>
          <p style={{ fontSize: '0.75rem', color: '#64748B', marginTop: '8px' }}>
            Requires immediate resolution before public release.
          </p>
        </div>

        {/* Card 2: Pending Reviews */}
        <div
          className="card"
          onClick={() => navigate('/approvals')}
          style={{
            cursor: 'pointer',
            borderLeft: '4px solid #F59E0B',
            display: 'flex',
            flexDirection: 'column',
            justifyContent: 'space-between',
            transition: 'transform 0.15s ease, box-shadow 0.15s ease',
          }}
          onMouseEnter={(e) => {
            e.currentTarget.style.transform = 'translateY(-2px)';
            e.currentTarget.style.boxShadow = 'var(--shadow-md)';
          }}
          onMouseLeave={(e) => {
            e.currentTarget.style.transform = 'none';
            e.currentTarget.style.boxShadow = 'var(--shadow-sm)';
          }}
          title="Click to view Approval Queue"
        >
          <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'flex-start' }}>
            <div>
              <span style={{ fontSize: '0.8125rem', fontWeight: 600, color: '#64748B' }}>Pending Reviews</span>
              <div style={{ fontSize: '1.75rem', fontWeight: 800, color: '#0F172A', marginTop: '4px' }}>
                {pendingApprovalsCount}
              </div>
            </div>
            <div
              style={{
                width: '36px',
                height: '36px',
                borderRadius: 'var(--radius-md)',
                background: '#FFFBEB',
                color: '#F59E0B',
                display: 'flex',
                alignItems: 'center',
                justifyContent: 'center',
              }}
            >
              <Clock size={18} />
            </div>
          </div>
          <p style={{ fontSize: '0.75rem', color: '#64748B', marginTop: '8px' }}>
            Awaiting human reviewer or brand manager sign-off.
          </p>
        </div>

        {/* Card 3: Reviewed This Month */}
        <div
          className="card"
          onClick={() => navigate('/history')}
          style={{
            cursor: 'pointer',
            borderLeft: '4px solid #10B981',
            display: 'flex',
            flexDirection: 'column',
            justifyContent: 'space-between',
            transition: 'transform 0.15s ease, box-shadow 0.15s ease',
          }}
          onMouseEnter={(e) => {
            e.currentTarget.style.transform = 'translateY(-2px)';
            e.currentTarget.style.boxShadow = 'var(--shadow-md)';
          }}
          onMouseLeave={(e) => {
            e.currentTarget.style.transform = 'none';
            e.currentTarget.style.boxShadow = 'var(--shadow-sm)';
          }}
          title="Click to view Review History"
        >
          <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'flex-start' }}>
            <div>
              <span style={{ fontSize: '0.8125rem', fontWeight: 600, color: '#64748B' }}>Reviewed This Month</span>
              <div style={{ fontSize: '1.75rem', fontWeight: 800, color: '#0F172A', marginTop: '4px' }}>
                {reviewedThisMonthCount}
              </div>
            </div>
            <div
              style={{
                width: '36px',
                height: '36px',
                borderRadius: 'var(--radius-md)',
                background: '#ECFDF5',
                color: '#10B981',
                display: 'flex',
                alignItems: 'center',
                justifyContent: 'center',
              }}
            >
              <TrendingUp size={18} />
            </div>
          </div>
          <p style={{ fontSize: '0.75rem', color: '#64748B', marginTop: '8px' }}>
            Total automated compliance evaluations completed.
          </p>
        </div>
      </section>

      {/* 6. RECENT FINDINGS TABLE (FULL-WIDTH CARD) */}
      <section className="card" id="recent-findings-section" style={{ padding: '20px 24px' }}>
        {/* Table Header & Controls */}
        <div
          style={{
            display: 'flex',
            flexWrap: 'wrap',
            alignItems: 'center',
            justifyContent: 'space-between',
            gap: '16px',
            marginBottom: '16px',
          }}
        >
          <div>
            <h2 style={{ fontSize: '1.125rem', fontWeight: 700, color: '#0F172A', lineHeight: 1.2 }}>
              Recent Findings
            </h2>
            <p style={{ fontSize: '0.75rem', color: '#64748B', marginTop: '2px' }}>
              Latest issues detected in your content reviews with real-time resolution actions.
            </p>
          </div>

          {/* Filters */}
          <div style={{ display: 'flex', flexWrap: 'wrap', alignItems: 'center', gap: '8px' }}>
            {/* Category Filter */}
            <select
              value={categoryFilter}
              onChange={(e) => setCategoryFilter(e.target.value)}
              className="form-select"
              style={{ width: 'auto', padding: '6px 10px', fontSize: '0.8125rem' }}
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
              style={{ width: 'auto', padding: '6px 10px', fontSize: '0.8125rem' }}
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
              style={{ width: 'auto', padding: '6px 10px', fontSize: '0.8125rem' }}
            >
              <option value="">All Statuses</option>
              <option value="open">Open</option>
              <option value="resolved">Resolved</option>
              <option value="dismissed">Dismissed</option>
            </select>

            <Link
              to="/approvals"
              className="btn btn-secondary btn-sm"
              style={{ display: 'inline-flex', alignItems: 'center', gap: '4px' }}
            >
              <span>View All</span>
              <ArrowRight size={14} />
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
                <th>Issue Category</th>
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
                  <td colSpan="8" style={{ textAlign: 'center', padding: '32px' }}>
                    <div style={{ color: 'var(--text-tertiary)', fontSize: '0.875rem' }}>Loading findings...</div>
                  </td>
                </tr>
              ) : findings.length > 0 ? (
                findings.map((f, idx) => (
                  <tr key={f._id}>
                    {/* Index */}
                    <td style={{ color: 'var(--text-tertiary)', fontSize: '0.75rem', fontWeight: 600 }}>
                      {idx + 1}
                    </td>

                    {/* Content Title */}
                    <td>
                      <Link
                        to={`/review/${f.draft?._id || f.draft}`}
                        style={{
                          fontWeight: 600,
                          color: '#0F172A',
                          textDecoration: 'none',
                          display: 'block',
                          maxWidth: '180px',
                          overflow: 'hidden',
                          textOverflow: 'ellipsis',
                          whiteSpace: 'nowrap',
                        }}
                        title={f.draft?.title || 'View Draft Review'}
                      >
                        {f.draft?.title || 'Submitted Content'}
                      </Link>
                      <span style={{ fontSize: '0.6875rem', color: '#64748B' }}>
                        {f.draft?.contentType || 'review'}
                      </span>
                    </td>

                    {/* Category */}
                    <td>
                      <span
                        style={{
                          fontSize: '0.75rem',
                          fontWeight: 600,
                          color: '#334155',
                          background: '#F1F5F9',
                          padding: '3px 8px',
                          borderRadius: 'var(--radius-sm)',
                        }}
                      >
                        {f.category}
                      </span>
                    </td>

                    {/* Flagged Excerpt */}
                    <td style={{ maxWidth: '240px' }}>
                      <div
                        style={{
                          fontSize: '0.8125rem',
                          color: '#DC2626',
                          background: '#FEF2F2',
                          padding: '4px 8px',
                          borderRadius: 'var(--radius-sm)',
                          borderLeft: '3px solid #EF4444',
                          overflow: 'hidden',
                          textOverflow: 'ellipsis',
                          whiteSpace: 'nowrap',
                        }}
                        title={f.flaggedSnippet || f.explanation}
                      >
                        "{f.flaggedSnippet || f.explanation}"
                      </div>
                    </td>

                    {/* Rule / Source */}
                    <td style={{ maxWidth: '180px' }}>
                      <span
                        style={{
                          fontSize: '0.75rem',
                          color: '#475569',
                          display: 'block',
                          overflow: 'hidden',
                          textOverflow: 'ellipsis',
                          whiteSpace: 'nowrap',
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
                          borderRadius: 'var(--radius-full)',
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
                          style={{ padding: '4px 8px', fontSize: '0.75rem' }}
                          title="Open Finding in Content Review Studio"
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
                              background: '#EFF6FF',
                              color: '#2563EB',
                              border: '1px solid #BFDBFE',
                              fontWeight: 600,
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
                  <td colSpan="8" style={{ textAlign: 'center', padding: '36px' }}>
                    <CheckCircle2 size={32} color="#10B981" style={{ margin: '0 auto 8px auto' }} />
                    <div style={{ fontSize: '0.875rem', fontWeight: 600, color: '#0F172A' }}>
                      No findings match the selected criteria
                    </div>
                    <div style={{ fontSize: '0.75rem', color: '#64748B', marginTop: '2px' }}>
                      All reviewed content adheres to active governance rules.
                    </div>
                  </td>
                </tr>
              )}
            </tbody>
          </table>
        </div>
      </section>

      {/* BOTTOM ROW: Brand Identity Snapshot (Left) & Guideline Coverage (Right) */}
      <section className="dashboard-grid-bottom">
        {/* 7. BOTTOM LEFT: BRAND IDENTITY SNAPSHOT */}
        <div className="card" style={{ display: 'flex', flexDirection: 'column', justifyContent: 'space-between' }}>
          <div>
            {/* Header */}
            <div
              style={{
                display: 'flex',
                alignItems: 'flex-start',
                justifyContent: 'space-between',
                marginBottom: '16px',
              }}
            >
              <div style={{ display: 'flex', gap: '12px', alignItems: 'center' }}>
                <div
                  style={{
                    width: '38px',
                    height: '38px',
                    borderRadius: '10px',
                    background: '#FAF5FF',
                    color: '#9333EA',
                    display: 'flex',
                    alignItems: 'center',
                    justifyContent: 'center',
                    flexShrink: 0,
                  }}
                >
                  <Palette size={20} strokeWidth={2.2} />
                </div>
                <div>
                  <h2 style={{ fontSize: '1.0625rem', fontWeight: 700, color: '#0F172A', lineHeight: 1.2 }}>
                    Brand Identity Snapshot
                  </h2>
                  <p style={{ fontSize: '0.75rem', color: '#64748B', marginTop: '2px' }}>
                    Active typography, colour standards and logo assets.
                  </p>
                </div>
              </div>

              <Link to="/guidelines" className="btn btn-secondary btn-sm">
                Manage
              </Link>
            </div>

            {brandProfile ? (
              <div style={{ display: 'flex', flexDirection: 'column', gap: '16px' }}>
                {/* Brand Colors Swatches */}
                <div>
                  <span
                    style={{
                      fontSize: '0.75rem',
                      fontWeight: 700,
                      textTransform: 'uppercase',
                      color: 'var(--text-tertiary)',
                      letterSpacing: '0.04em',
                      display: 'block',
                      marginBottom: '8px',
                    }}
                  >
                    Approved Colour Palette
                  </span>
                  <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(100px, 1fr))', gap: '8px' }}>
                    {brandProfile.colors && brandProfile.colors.length > 0 ? (
                      brandProfile.colors.map((c, i) => (
                        <div
                          key={i}
                          onClick={() => handleCopyHex(c.hex)}
                          style={{
                            padding: '8px',
                            borderRadius: 'var(--radius-md)',
                            background: '#F8FAFC',
                            border: '1px solid #E2E8F0',
                            cursor: 'pointer',
                            display: 'flex',
                            flexDirection: 'column',
                            gap: '6px',
                            transition: 'all 0.15s ease',
                          }}
                          title="Click to copy hex code"
                        >
                          <div
                            style={{
                              height: '28px',
                              borderRadius: 'var(--radius-sm)',
                              background: c.hex,
                              boxShadow: 'inset 0 0 0 1px rgba(0,0,0,0.1)',
                            }}
                          />
                          <div style={{ fontSize: '0.75rem', fontWeight: 600, color: '#0F172A' }}>
                            {c.name || c.role || 'Brand Color'}
                          </div>
                          <div
                            style={{
                              fontSize: '0.6875rem',
                              fontFamily: 'monospace',
                              color: copiedHex === c.hex ? '#10B981' : '#64748B',
                              display: 'flex',
                              alignItems: 'center',
                              justifyContent: 'space-between',
                            }}
                          >
                            <span>{c.hex}</span>
                            {copiedHex === c.hex ? <Check size={12} /> : <Copy size={12} />}
                          </div>
                        </div>
                      ))
                    ) : (
                      <div style={{ fontSize: '0.8125rem', color: '#64748B' }}>No colours registered.</div>
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
                      color: 'var(--text-tertiary)',
                      letterSpacing: '0.04em',
                      display: 'block',
                      marginBottom: '8px',
                    }}
                  >
                    Typography Settings
                  </span>
                  <div
                    style={{
                      display: 'grid',
                      gridTemplateColumns: '1fr 1fr',
                      gap: '8px',
                      padding: '10px 12px',
                      borderRadius: 'var(--radius-md)',
                      background: '#F8FAFC',
                      border: '1px solid #E2E8F0',
                    }}
                  >
                    <div>
                      <div style={{ fontSize: '0.6875rem', color: '#64748B' }}>Primary Body Font</div>
                      <div style={{ fontSize: '0.875rem', fontWeight: 700, color: '#0F172A' }}>
                        {brandProfile.typography?.primaryFont || 'Inter, -apple-system'}
                      </div>
                    </div>
                    <div>
                      <div style={{ fontSize: '0.6875rem', color: '#64748B' }}>Heading Display Font</div>
                      <div style={{ fontSize: '0.875rem', fontWeight: 700, color: '#0F172A' }}>
                        {brandProfile.typography?.headingFont || 'Plus Jakarta Sans'}
                      </div>
                    </div>
                  </div>
                </div>
              </div>
            ) : (
              <div
                style={{
                  padding: '24px',
                  textAlign: 'center',
                  background: '#F8FAFC',
                  borderRadius: 'var(--radius-md)',
                  color: '#64748B',
                }}
              >
                <p style={{ fontSize: '0.875rem', fontWeight: 600 }}>Brand profile not configured yet.</p>
                <Link to="/guidelines" className="btn btn-primary btn-sm" style={{ marginTop: '8px' }}>
                  Configure Brand Identity
                </Link>
              </div>
            )}
          </div>

          <div style={{ borderTop: '1px solid #F1F5F9', paddingTop: '10px', marginTop: '12px' }}>
            <span style={{ fontSize: '0.75rem', color: '#64748B' }}>
              Enforced by InkGuard Deterministic Visual Engine
            </span>
          </div>
        </div>

        {/* 8. BOTTOM RIGHT: GUIDELINE COVERAGE */}
        <div className="card" style={{ display: 'flex', flexDirection: 'column', justifyContent: 'space-between' }}>
          <div>
            {/* Header */}
            <div
              style={{
                display: 'flex',
                alignItems: 'flex-start',
                justifyContent: 'space-between',
                marginBottom: '16px',
              }}
            >
              <div style={{ display: 'flex', gap: '12px', alignItems: 'center' }}>
                <div
                  style={{
                    width: '38px',
                    height: '38px',
                    borderRadius: '10px',
                    background: '#EFF6FF',
                    color: '#2563EB',
                    display: 'flex',
                    alignItems: 'center',
                    justifyContent: 'center',
                    flexShrink: 0,
                  }}
                >
                  <ShieldCheck size={20} strokeWidth={2.2} />
                </div>
                <div>
                  <h2 style={{ fontSize: '1.0625rem', fontWeight: 700, color: '#0F172A', lineHeight: 1.2 }}>
                    Guideline Coverage
                  </h2>
                  <p style={{ fontSize: '0.75rem', color: '#64748B', marginTop: '2px' }}>
                    Active deterministic governance rules enforced across workspaces.
                  </p>
                </div>
              </div>

              <Link to="/guidelines" className="btn btn-secondary btn-sm">
                View Guidelines
              </Link>
            </div>

            {/* Coverage Tiles Grid */}
            <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(130px, 1fr))', gap: '10px' }}>
              {[
                { label: 'Messaging', key: 'Messaging', icon: BookOpen },
                { label: 'Terminology', key: 'Terminology', icon: CheckSquare },
                { label: 'Visual Identity', key: 'Visual identity', icon: Palette },
                { label: 'Accessibility', key: 'Accessibility', icon: Layers },
                { label: 'Promotional Claims', key: 'Promotional claims', icon: Sparkles },
                { label: 'Tone of Voice', key: 'Tone of voice', icon: Info },
              ].map((cat, idx) => {
                const count = guidelineCoverage[cat.key] || 0;
                const IconComponent = cat.icon;

                return (
                  <div
                    key={idx}
                    style={{
                      padding: '12px',
                      borderRadius: 'var(--radius-md)',
                      background: '#F8FAFC',
                      border: '1px solid #E2E8F0',
                      display: 'flex',
                      flexDirection: 'column',
                      justifyContent: 'space-between',
                      minHeight: '76px',
                    }}
                  >
                    <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
                      <span style={{ fontSize: '0.75rem', fontWeight: 600, color: '#475569' }}>{cat.label}</span>
                      <IconComponent size={14} color="#2563EB" />
                    </div>
                    <div style={{ fontSize: '1.25rem', fontWeight: 800, color: '#0F172A', marginTop: '4px' }}>
                      {count}{' '}
                      <span style={{ fontSize: '0.6875rem', fontWeight: 500, color: '#64748B' }}>
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
              paddingTop: '10px',
              marginTop: '12px',
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
                fontWeight: 600,
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
