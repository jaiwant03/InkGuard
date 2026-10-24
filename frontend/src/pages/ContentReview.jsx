import React, { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import {
  FileCheck2,
  Sparkles,
  Save,
  Upload,
  BookOpen,
  FileText,
  Clock,
  CheckCircle2,
  AlertTriangle,
  Shield,
  Check,
} from 'lucide-react';
import { api } from '../services/api';
import { useAuth } from '../context/AuthContext';
import { useToast } from '../context/ToastContext';
import { ASSET_IMAGES } from '../assets/images';

const CONTENT_TYPES = [
  'General marketing text',
  'Social media post',
  'Advertisement',
  'Website copy',
  'Email campaign',
  'Product description',
];

const VIOLATION_SAMPLE = `Introducing the new ACE platform for high-scale enterprise workloads!

Our cloud architecture is 100% guaranteed to be hack-proof, with zero-risk migration for any legacy cluster. If your engineers experience any difficulties, they can simply contact our helpdesk.

To explore all architecture diagrams and benchmarks, click here. Over 1,200 enterprise organizations use Apex Cloud solutions worldwide.`;

const COMPLIANT_SAMPLE = `Apex Cloud Enterprise delivers resilient distributed architecture for mission-critical workloads.

Our systems are engineered for 99.99% high availability and multi-region failover. If your engineering leads have any questions, our dedicated Client Success Team is available 24/7.

Explore our architectural whitepaper and benchmark studies. Apex Cloud is a registered trademark of Apex Solutions, Inc.`;

export default function ContentReview() {
  const [title, setTitle] = useState('');
  const [contentType, setContentType] = useState('Website copy');
  const [content, setContent] = useState('');
  const [savingDraft, setSavingDraft] = useState(false);
  const [auditing, setAuditing] = useState(false);
  const [activeRules, setActiveRules] = useState([]);

  const { workspace } = useAuth();
  const toast = useToast();
  const navigate = useNavigate();

  useEffect(() => {
    async function loadRules() {
      try {
        const rulesRes = await api.brandRules.list({ isActive: true });
        if (rulesRes.success) setActiveRules(rulesRes.data);
      } catch (err) {
        // silent load
      }
    }
    loadRules();
  }, [workspace]);

  const handleFileUpload = (e) => {
    const file = e.target.files[0];
    if (!file) return;

    if (!file.name.endsWith('.txt') && !file.name.endsWith('.md')) {
      toast.error('Only .txt and .md text documents are supported.');
      return;
    }

    if (file.size > 2 * 1024 * 1024) {
      toast.error('File size exceeds the 2MB limit.');
      return;
    }

    const reader = new FileReader();
    reader.onload = (event) => {
      setContent(event.target.result);
      if (!title) {
        setTitle(file.name.replace(/\.[^/.]+$/, '').replace(/[-_]/g, ' '));
      }
      toast.success(`Loaded text from ${file.name}`);
    };
    reader.readAsText(file);
  };

  const handleSaveDraft = async () => {
    if (!title.trim() || !content.trim()) {
      toast.error('Please provide both a title and content text.');
      return;
    }
    try {
      setSavingDraft(true);
      const res = await api.drafts.create({
        title: title.trim(),
        contentType,
        content: content.trim(),
      });
      if (res.success) {
        toast.success('Draft saved successfully.');
        navigate(`/review/${res.data._id}`);
      }
    } catch (err) {
      toast.error('Failed to save draft: ' + err.message);
    } finally {
      setSavingDraft(false);
    }
  };

  const handleRunAudit = async () => {
    if (!title.trim() || !content.trim()) {
      toast.error('Please enter content before running the brand audit.');
      return;
    }

    try {
      setAuditing(true);
      const draftRes = await api.drafts.create({
        title: title.trim(),
        contentType,
        content: content.trim(),
      });

      if (!draftRes.success) throw new Error(draftRes.message);
      const draftId = draftRes.data._id;

      const auditRes = await api.drafts.review(draftId);
      if (auditRes.success) {
        toast.success(`Audit Complete! Compliance Score: ${auditRes.data.scoreResult.score}%`);
        navigate(`/review/${draftId}`);
      }
    } catch (err) {
      toast.error('Brand Audit failed: ' + err.message);
    } finally {
      setAuditing(false);
    }
  };

  const wordCount = content.trim() ? content.trim().split(/\s+/).length : 0;
  const charCount = content.length;

  return (
    <div style={{ display: 'grid', gridTemplateColumns: 'minmax(0, 1fr) 360px', gap: 'var(--space-6)', alignItems: 'start' }}>
      {/* Left Main Pane: Editor */}
      <div style={{ display: 'flex', flexDirection: 'column', gap: 'var(--space-6)' }}>
        <div className="card" style={{ padding: '24px' }}>
          <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: 'var(--space-4)', flexWrap: 'wrap', gap: 'var(--space-2)' }}>
            <div>
              <h1 className="text-gradient-primary" style={{ fontSize: '1.5rem', fontWeight: 850, margin: 0 }}>
                Content Review Studio
              </h1>
              <p style={{ fontSize: '0.875rem', color: '#64748B', marginTop: '3px', margin: '3px 0 0 0' }}>
                Audit drafts in real-time against active brand guidelines, prohibited terminology, and approved facts.
              </p>
            </div>

            {/* Quick Demo Pre-fillers */}
            <div style={{ display: 'flex', gap: '8px' }}>
              <button
                type="button"
                onClick={() => {
                  setTitle('Q4 Cloud Announcement (Violation Sample)');
                  setContentType('Website copy');
                  setContent(VIOLATION_SAMPLE);
                }}
                className="btn btn-secondary btn-sm"
                style={{ fontSize: '0.75rem', borderRadius: '10px' }}
                title="Loads copy with prohibited terms and expired fact for test inspection"
              >
                <AlertTriangle size={13} color="#EF4444" />
                <span>Violation Sample</span>
              </button>
              <button
                type="button"
                onClick={() => {
                  setTitle('High-Scale Cloud Overview (Compliant Sample)');
                  setContentType('Website copy');
                  setContent(COMPLIANT_SAMPLE);
                }}
                className="btn btn-secondary btn-sm"
                style={{ fontSize: '0.75rem', borderRadius: '10px' }}
                title="Loads compliant enterprise copy"
              >
                <CheckCircle2 size={13} color="#10B981" />
                <span>Compliant Sample</span>
              </button>
            </div>
          </div>

          {/* Form Inputs */}
          <div style={{ display: 'grid', gridTemplateColumns: '2fr 1fr', gap: 'var(--space-4)', marginBottom: 'var(--space-4)' }}>
            <div className="form-group" style={{ marginBottom: 0 }}>
              <label className="form-label">Content Title *</label>
              <input
                type="text"
                className="form-input"
                placeholder="e.g. Q4 Cloud Product Launch Announcement"
                value={title}
                onChange={(e) => setTitle(e.target.value)}
              />
            </div>

            <div className="form-group" style={{ marginBottom: 0 }}>
              <label className="form-label">Content Type *</label>
              <select className="form-select" value={contentType} onChange={(e) => setContentType(e.target.value)}>
                {CONTENT_TYPES.map((t) => (
                  <option key={t} value={t}>{t}</option>
                ))}
              </select>
            </div>
          </div>

          {/* Main Text Input Area */}
          <div className="form-group">
            <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '4px' }}>
              <label className="form-label">Content Text / Copy *</label>
              <div style={{ display: 'flex', alignItems: 'center', gap: '12px' }}>
                <span style={{ fontSize: '0.75rem', color: 'var(--text-tertiary)' }}>
                  {wordCount} words • {charCount} chars
                </span>
                <label
                  style={{
                    fontSize: '0.75rem',
                    color: 'var(--color-primary)',
                    cursor: 'pointer',
                    display: 'flex',
                    alignItems: 'center',
                    gap: '4px',
                    fontWeight: 600,
                  }}
                >
                  <Upload size={13} /> Import .txt / .md
                  <input type="file" accept=".txt,.md" style={{ display: 'none' }} onChange={handleFileUpload} />
                </label>
              </div>
            </div>

            <textarea
              className="form-textarea"
              rows={14}
              placeholder="Paste or write your marketing text, announcement, ad copy, or social update here..."
              value={content}
              onChange={(e) => setContent(e.target.value)}
              style={{
                fontFamily: 'var(--font-sans)',
                fontSize: '0.9375rem',
                lineHeight: 1.6,
                padding: 'var(--space-4)',
              }}
            />
          </div>

          {/* Action Footer */}
          <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginTop: 'var(--space-6)', borderTop: '1px solid var(--border-light)', paddingTop: 'var(--space-4)' }}>
            <span style={{ fontSize: '0.8125rem', color: 'var(--text-tertiary)' }}>
              Deterministic checks will evaluate across {activeRules.length} active workspace brand rules.
            </span>

            <div style={{ display: 'flex', gap: 'var(--space-3)' }}>
              <button
                type="button"
                className="btn btn-secondary"
                disabled={savingDraft || auditing}
                onClick={handleSaveDraft}
              >
                <Save size={16} /> Save as Draft
              </button>

              <button
                type="button"
                className="btn btn-primary btn-lg"
                disabled={auditing || savingDraft}
                onClick={handleRunAudit}
                style={{ minWidth: '190px' }}
              >
                {auditing ? (
                  <>
                    <Sparkles size={16} className="spinner" /> Analyzing Brand Standards...
                  </>
                ) : (
                  <>
                    <FileCheck2 size={18} /> Run Brand Audit
                  </>
                )}
              </button>
            </div>
          </div>
        </div>
      </div>

      {/* Right Side Pane: Live Metrics & Governance Pre-Flight Reference */}
      <div style={{ display: 'flex', flexDirection: 'column', gap: 'var(--space-5)' }}>
        {/* Live Content Statistics */}
        <div className="card" style={{ padding: '20px' }}>
          <h3 className="text-gradient-blue" style={{ fontSize: '0.9375rem', fontWeight: 800, marginBottom: '14px' }}>
            Live Content Metrics
          </h3>
          <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '10px' }}>
            <div style={{ background: '#F8FAFC', padding: '10px 12px', borderRadius: '12px', border: '1px solid #E2E8F0' }}>
              <span style={{ fontSize: '0.6875rem', color: '#64748B', fontWeight: 700, textTransform: 'uppercase' }}>Words</span>
              <div style={{ fontSize: '1.25rem', fontWeight: 850, color: '#0F172A', marginTop: '2px' }}>{wordCount}</div>
            </div>
            <div style={{ background: '#F8FAFC', padding: '10px 12px', borderRadius: '12px', border: '1px solid #E2E8F0' }}>
              <span style={{ fontSize: '0.6875rem', color: '#64748B', fontWeight: 700, textTransform: 'uppercase' }}>Characters</span>
              <div style={{ fontSize: '1.25rem', fontWeight: 850, color: '#0F172A', marginTop: '2px' }}>{charCount}</div>
            </div>
            <div style={{ background: '#F8FAFC', padding: '10px 12px', borderRadius: '12px', border: '1px solid #E2E8F0' }}>
              <span style={{ fontSize: '0.6875rem', color: '#64748B', fontWeight: 700, textTransform: 'uppercase' }}>Reading Time</span>
              <div style={{ fontSize: '1.125rem', fontWeight: 850, color: '#2563EB', marginTop: '2px' }}>
                {Math.ceil(wordCount / 200) || 1} min
              </div>
            </div>
            <div style={{ background: '#F8FAFC', padding: '10px 12px', borderRadius: '12px', border: '1px solid #E2E8F0' }}>
              <span style={{ fontSize: '0.6875rem', color: '#64748B', fontWeight: 700, textTransform: 'uppercase' }}>Target Format</span>
              <div style={{ fontSize: '0.75rem', fontWeight: 700, color: '#0F172A', marginTop: '4px', overflow: 'hidden', textOverflow: 'ellipsis', whiteSpace: 'nowrap' }}>
                {contentType}
              </div>
            </div>
          </div>
        </div>

        {/* Active Governance Rules Enforced */}
        <div className="card" style={{ padding: '20px' }}>
          <div style={{ display: 'flex', alignItems: 'center', gap: '10px', marginBottom: '12px' }}>
            <div className="icon-tile icon-tile-blue" style={{ width: '32px', height: '32px' }}>
              <Shield size={16} strokeWidth={2.4} />
            </div>
            <div>
              <h3 className="text-gradient-primary" style={{ fontSize: '0.9375rem', fontWeight: 800, margin: 0 }}>
                Deterministic Engine Active
              </h3>
              <span style={{ fontSize: '0.6875rem', color: '#64748B' }}>
                {activeRules.length} rules loaded for audit
              </span>
            </div>
          </div>

          <div style={{ display: 'flex', flexDirection: 'column', gap: '8px' }}>
            {[
              { label: 'Prohibited Phrasing', desc: 'Auto-flags non-compliant wording' },
              { label: 'Tone of Voice Check', desc: 'Detects informal or unapproved tone' },
              { label: 'Approved Fact Verifier', desc: 'Validates marketing statistics & claims' },
              { label: 'Required Disclaimers', desc: 'Checks for mandatory legal copy' },
            ].map((item, idx) => (
              <div
                key={idx}
                style={{
                  display: 'flex',
                  alignItems: 'center',
                  gap: '10px',
                  padding: '8px 10px',
                  borderRadius: '10px',
                  background: '#F8FAFC',
                  border: '1px solid #F1F5F9',
                }}
              >
                <div style={{ width: '16px', height: '16px', borderRadius: '50%', background: '#ECFDF5', color: '#059669', display: 'flex', alignItems: 'center', justifyContent: 'center' }}>
                  <Check size={10} strokeWidth={3} />
                </div>
                <div style={{ flex: 1 }}>
                  <div style={{ fontSize: '0.75rem', fontWeight: 700, color: '#1E293B' }}>{item.label}</div>
                  <div style={{ fontSize: '0.6875rem', color: '#64748B' }}>{item.desc}</div>
                </div>
              </div>
            ))}
          </div>
        </div>
      </div>
    </div>
  );
}
