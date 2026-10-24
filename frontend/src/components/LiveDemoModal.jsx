import React, { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import {
  Sparkles,
  X,
  AlertTriangle,
  CheckCircle2,
  ArrowRight,
  ShieldAlert,
  ShieldCheck,
  Copy,
  Check,
  Play,
  FileText,
  BookOpen,
} from 'lucide-react';
import ComplianceScoreRing from './ComplianceScoreRing';
import { useToast } from '../context/ToastContext';

export const DEMO_SCENARIOS = [
  {
    id: 'violation',
    name: 'High-Risk Prohibited Copy',
    tag: 'Fails Governance',
    tagColor: '#EF4444',
    tagBg: '#FEF2F2',
    icon: ShieldAlert,
    title: 'Q4 Global Cloud Infrastructure Press Release',
    contentType: 'Website copy',
    inputText: `Introducing our new Apex cloud engine for all mission-critical workloads!

Our cloud architecture is 100% guaranteed to be hack-proof, with zero-risk migration for any legacy cluster. If your engineers experience any difficulties, they can simply contact our helpdesk.

To explore all architecture diagrams and benchmarks, click here. Over 1,200 enterprise organizations use Apex Cloud solutions worldwide.`,
    score: 52,
    statusText: 'Action Required',
    statusColor: '#EF4444',
    statusBg: '#FEF2F2',
    findings: [
      {
        severity: 'High',
        rule: 'Zero-Tolerance on Hack-Proof Claims',
        flagged: '100% guaranteed to be hack-proof',
        explanation: 'Absolute invulnerability claims violate corporate legal and security policy.',
        suggestion: 'Replace with: "engineered with a multi-layer enterprise defense architecture"',
      },
      {
        severity: 'High',
        rule: 'Prohibit Absolute Guarantees',
        flagged: 'zero-risk migration',
        explanation: 'Terms implying zero-risk violate truth-in-advertising guidelines.',
        suggestion: 'Replace with: "managed migration pathway with automated rollback verification"',
      },
      {
        severity: 'Medium',
        rule: 'Approved Facts Verification',
        flagged: 'Over 1,200 enterprise organizations',
        explanation: 'Discrepancy with Truth Repository: verified record states "over 4,500 enterprise brands".',
        suggestion: 'Update metric to: "over 4,500 enterprise brands"',
      },
    ],
  },
  {
    id: 'outdated_claims',
    name: 'Unverified SLA & Claim Drift',
    tag: 'Claim Discrepancy',
    tagColor: '#D97706',
    tagBg: '#FFFBEB',
    icon: AlertTriangle,
    title: 'Enterprise High-Availability Benchmark Factsheet',
    contentType: 'Advertisement',
    inputText: `Apex Cloud delivers unbreakable enterprise infrastructure with a 100% uptime guarantee.

Our proprietary cluster auto-healing eliminates all points of failure. More than 1,000 customers have trusted our cheapest cloud pricing tier without outage.`,
    score: 64,
    statusText: 'Revisions Recommended',
    statusColor: '#D97706',
    statusBg: '#FFFBEB',
    findings: [
      {
        severity: 'High',
        rule: 'Verified High-Availability SLA Claim',
        flagged: '100% uptime guarantee',
        explanation: 'Unverified SLA claim. Contractually verified SLA is 99.99% high-availability.',
        suggestion: 'Replace with: "99.99% high-availability SLA"',
      },
      {
        severity: 'Medium',
        rule: 'Preferred Brand Terminology',
        flagged: 'cheapest cloud pricing tier',
        explanation: 'Brand guidelines mandate value-oriented positioning rather than discount phrasing.',
        suggestion: 'Replace with: "cost-effective enterprise tier"',
      },
    ],
  },
  {
    id: 'compliant',
    name: '100% Brand Compliant Copy',
    tag: 'Passes All Guardrails',
    tagColor: '#059669',
    tagBg: '#ECFDF5',
    icon: ShieldCheck,
    title: 'Apex Cloud Enterprise Architecture Overview',
    contentType: 'Website copy',
    inputText: `Apex Cloud Enterprise delivers resilient distributed architecture for mission-critical enterprise workloads.

Our systems are engineered for 99.99% high availability and multi-region failover with automated disaster recovery protocols. If your engineering leads have any architectural questions, our dedicated Client Success Team is available 24/7.

Explore our architectural whitepaper and benchmark studies. Apex Cloud is a registered trademark of Apex Solutions, Inc. Apex Cloud protects over 4,500 enterprise brands with 99.99% high-availability SLA.`,
    score: 100,
    statusText: 'Fully Compliant',
    statusColor: '#059669',
    statusBg: '#ECFDF5',
    findings: [],
  },
];

export default function LiveDemoModal({ isOpen, onClose, onSelectScenario }) {
  const [activeTab, setActiveTab] = useState(DEMO_SCENARIOS[0].id);
  const [copied, setCopied] = useState(false);
  const toast = useToast();
  const navigate = useNavigate();

  if (!isOpen) return null;

  const currentScenario = DEMO_SCENARIOS.find((s) => s.id === activeTab) || DEMO_SCENARIOS[0];

  const handleCopyInput = () => {
    navigator.clipboard.writeText(currentScenario.inputText);
    setCopied(true);
    toast.success('Scenario input text copied to clipboard!');
    setTimeout(() => setCopied(false), 2000);
  };

  const handleRunLiveInStudio = () => {
    onClose();
    if (onSelectScenario) {
      onSelectScenario(currentScenario);
    } else {
      navigate('/review', { state: { scenario: currentScenario } });
    }
  };

  return (
    <div className="modal-overlay" onClick={onClose} style={{ zIndex: 1200 }}>
      <div
        className="modal-content glass-card"
        style={{
          maxWidth: '960px',
          width: '95%',
          maxHeight: '90vh',
          display: 'flex',
          flexDirection: 'column',
          padding: 0,
          overflow: 'hidden',
          borderRadius: '24px',
        }}
        onClick={(e) => e.stopPropagation()}
      >
        {/* Modal Top Header */}
        <div
          style={{
            padding: '20px 28px',
            borderBottom: '1px solid #E2E8F0',
            display: 'flex',
            alignItems: 'center',
            justifyContent: 'space-between',
            background: 'linear-gradient(135deg, #FFFFFF 0%, #F8FAFC 100%)',
          }}
        >
          <div style={{ display: 'flex', alignItems: 'center', gap: '12px' }}>
            <div
              className="icon-tile icon-tile-blue"
              style={{ width: '40px', height: '40px', borderRadius: '12px' }}
            >
              <Sparkles size={20} color="#2563EB" strokeWidth={2.5} />
            </div>
            <div>
              <div style={{ display: 'flex', alignItems: 'center', gap: '8px' }}>
                <h3 style={{ fontSize: '1.25rem', fontWeight: 850, color: '#0F172A', margin: 0 }}>
                  Live Input & Output Playground
                </h3>
                <span
                  style={{
                    fontSize: '0.6875rem',
                    fontWeight: 700,
                    padding: '2px 8px',
                    borderRadius: '999px',
                    background: '#EFF6FF',
                    color: '#2563EB',
                    border: '1px solid #BFDBFE',
                    textTransform: 'uppercase',
                  }}
                >
                  Interactive Guide
                </span>
              </div>
              <p style={{ fontSize: '0.8125rem', color: '#64748B', margin: '2px 0 0 0' }}>
                Explore exact inputs fed into the deterministic brand engine and the live outputs generated.
              </p>
            </div>
          </div>

          <button
            onClick={onClose}
            className="action-icon-btn"
            title="Close"
            style={{ width: '36px', height: '36px', borderRadius: '10px' }}
          >
            <X size={18} />
          </button>
        </div>

        {/* Scenario Switcher Tabs */}
        <div
          style={{
            display: 'flex',
            gap: '8px',
            padding: '12px 28px',
            background: '#F8FAFC',
            borderBottom: '1px solid #E2E8F0',
            overflowX: 'auto',
          }}
        >
          {DEMO_SCENARIOS.map((sc) => {
            const IconComponent = sc.icon;
            const isActive = sc.id === activeTab;
            return (
              <button
                key={sc.id}
                onClick={() => setActiveTab(sc.id)}
                style={{
                  display: 'flex',
                  alignItems: 'center',
                  gap: '8px',
                  padding: '8px 16px',
                  borderRadius: '12px',
                  fontSize: '0.8125rem',
                  fontWeight: isActive ? 750 : 600,
                  color: isActive ? '#0F172A' : '#64748B',
                  background: isActive ? '#FFFFFF' : 'transparent',
                  border: isActive ? '1px solid #E2E8F0' : '1px solid transparent',
                  boxShadow: isActive ? '0 2px 6px rgba(15, 23, 42, 0.05)' : 'none',
                  cursor: 'pointer',
                  transition: 'all 0.18s ease',
                  whiteSpace: 'nowrap',
                }}
              >
                <IconComponent size={15} color={sc.tagColor} />
                <span>{sc.name}</span>
                <span
                  style={{
                    fontSize: '0.625rem',
                    fontWeight: 700,
                    padding: '2px 6px',
                    borderRadius: '6px',
                    background: sc.tagBg,
                    color: sc.tagColor,
                  }}
                >
                  {sc.tag}
                </span>
              </button>
            );
          })}
        </div>

        {/* Modal Main Body: Side-by-Side Input and Output */}
        <div
          style={{
            padding: '24px 28px',
            overflowY: 'auto',
            display: 'grid',
            gridTemplateColumns: 'minmax(0, 1.2fr) minmax(0, 1fr)',
            gap: '24px',
          }}
        >
          {/* LEFT: INPUT COLUMN */}
          <div style={{ display: 'flex', flexDirection: 'column', gap: '14px' }}>
            <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between' }}>
              <div style={{ display: 'flex', alignItems: 'center', gap: '8px' }}>
                <span
                  style={{
                    fontSize: '0.75rem',
                    fontWeight: 800,
                    textTransform: 'uppercase',
                    color: '#2563EB',
                    letterSpacing: '0.05em',
                  }}
                >
                  📥 User Input
                </span>
                <span style={{ fontSize: '0.75rem', color: '#94A3B8' }}>•</span>
                <span style={{ fontSize: '0.75rem', color: '#64748B', fontWeight: 600 }}>
                  Format: {currentScenario.contentType}
                </span>
              </div>

              <button
                onClick={handleCopyInput}
                className="btn btn-secondary btn-sm"
                style={{ padding: '4px 10px', fontSize: '0.75rem', borderRadius: '8px' }}
                title="Copy sample input text"
              >
                {copied ? <Check size={12} color="#059669" /> : <Copy size={12} />}
                <span>{copied ? 'Copied!' : 'Copy Text'}</span>
              </button>
            </div>

            {/* Input Preview Box */}
            <div
              style={{
                background: '#FFFFFF',
                border: '1px solid #E2E8F0',
                borderRadius: '16px',
                padding: '16px 20px',
                boxShadow: '0 2px 6px rgba(15, 23, 42, 0.02)',
              }}
            >
              <div style={{ fontSize: '0.875rem', fontWeight: 750, color: '#0F172A', marginBottom: '8px' }}>
                {currentScenario.title}
              </div>
              <div
                style={{
                  fontSize: '0.8125rem',
                  color: '#334155',
                  lineHeight: 1.6,
                  whiteSpace: 'pre-wrap',
                  fontFamily: 'var(--font-sans)',
                  background: '#F8FAFC',
                  padding: '14px',
                  borderRadius: '10px',
                  border: '1px solid #F1F5F9',
                }}
              >
                {currentScenario.inputText}
              </div>
            </div>

            <div style={{ fontSize: '0.75rem', color: '#64748B' }}>
              💡 <em>This represents the raw copy a creator submits for compliance verification.</em>
            </div>
          </div>

          {/* RIGHT: OUTPUT COLUMN */}
          <div style={{ display: 'flex', flexDirection: 'column', gap: '14px' }}>
            <div style={{ display: 'flex', alignItems: 'center', gap: '8px' }}>
              <span
                style={{
                  fontSize: '0.75rem',
                  fontWeight: 800,
                  textTransform: 'uppercase',
                  color: '#7C3AED',
                  letterSpacing: '0.05em',
                }}
              >
                📤 Live Engine Output
              </span>
            </div>

            {/* Live Score Summary Card */}
            <div
              style={{
                background: '#FFFFFF',
                border: '1px solid #E2E8F0',
                borderRadius: '16px',
                padding: '16px 20px',
                display: 'flex',
                alignItems: 'center',
                gap: '18px',
                boxShadow: '0 2px 6px rgba(15, 23, 42, 0.02)',
              }}
            >
              <ComplianceScoreRing score={currentScenario.score} size={74} strokeWidth={7} showBadge={false} />

              <div style={{ flex: 1 }}>
                <span
                  style={{
                    display: 'inline-block',
                    fontSize: '0.6875rem',
                    fontWeight: 750,
                    padding: '2px 8px',
                    borderRadius: '999px',
                    background: currentScenario.statusBg,
                    color: currentScenario.statusColor,
                    marginBottom: '4px',
                  }}
                >
                  {currentScenario.statusText}
                </span>
                <div style={{ fontSize: '0.9375rem', fontWeight: 800, color: '#0F172A' }}>
                  {currentScenario.score}% Compliance Score
                </div>
                <div style={{ fontSize: '0.75rem', color: '#64748B', marginTop: '2px' }}>
                  {currentScenario.findings.length === 0
                    ? '0 rule violations detected'
                    : `${currentScenario.findings.length} findings require resolution`}
                </div>
              </div>
            </div>

            {/* Flagged Issues List */}
            <div style={{ display: 'flex', flexDirection: 'column', gap: '8px', maxHeight: '200px', overflowY: 'auto' }}>
              {currentScenario.findings.length > 0 ? (
                currentScenario.findings.map((f, idx) => (
                  <div
                    key={idx}
                    style={{
                      background: '#FFF1F2',
                      border: '1px solid #FECDD3',
                      borderLeft: '4px solid #EF4444',
                      borderRadius: '10px',
                      padding: '10px 12px',
                      fontSize: '0.75rem',
                    }}
                  >
                    <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
                      <span style={{ fontWeight: 700, color: '#991B1B' }}>Flagged: "{f.flagged}"</span>
                      <span
                        style={{
                          fontSize: '0.625rem',
                          fontWeight: 750,
                          background: '#FEE2E2',
                          color: '#DC2626',
                          padding: '1px 6px',
                          borderRadius: '4px',
                        }}
                      >
                        {f.severity}
                      </span>
                    </div>
                    <div style={{ color: '#64748B', marginTop: '3px' }}>{f.explanation}</div>
                    <div style={{ color: '#059669', fontWeight: 600, marginTop: '4px' }}>
                      💡 {f.suggestion}
                    </div>
                  </div>
                ))
              ) : (
                <div
                  style={{
                    background: '#ECFDF5',
                    border: '1px solid #A7F3D0',
                    borderRadius: '10px',
                    padding: '16px',
                    textAlign: 'center',
                    color: '#065F46',
                    fontSize: '0.8125rem',
                  }}
                >
                  <CheckCircle2 size={24} color="#059669" style={{ margin: '0 auto 6px auto' }} />
                  <strong>100% Brand Compliant</strong>
                  <div style={{ fontSize: '0.75rem', color: '#047857', marginTop: '2px' }}>
                    All terminology, tone, and claims verified against guidelines and approved facts.
                  </div>
                </div>
              )}
            </div>
          </div>
        </div>

        {/* Modal Bottom Actions */}
        <div
          style={{
            padding: '16px 28px',
            borderTop: '1px solid #E2E8F0',
            background: '#F8FAFC',
            display: 'flex',
            alignItems: 'center',
            justifyContent: 'space-between',
            flexWrap: 'wrap',
            gap: '12px',
          }}
        >
          <span style={{ fontSize: '0.8125rem', color: '#64748B' }}>
            Clicking run will feed this input into the live Studio and calculate real output.
          </span>

          <div style={{ display: 'flex', gap: '10px' }}>
            <button
              onClick={onClose}
              className="btn btn-secondary btn-sm"
              style={{ borderRadius: '10px' }}
            >
              Cancel
            </button>
            <button
              onClick={handleRunLiveInStudio}
              className="btn btn-gradient-primary btn-sm"
              style={{ borderRadius: '10px', padding: '8px 20px', fontWeight: 700 }}
            >
              <Play size={14} fill="#FFFFFF" />
              <span>Run This Live in Studio →</span>
            </button>
          </div>
        </div>
      </div>
    </div>
  );
}
