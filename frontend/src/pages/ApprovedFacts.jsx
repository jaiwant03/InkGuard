import React, { useState, useEffect } from 'react';
import {
  CheckCircle2,
  Plus,
  Search,
  ExternalLink,
  Clock,
  AlertTriangle,
  Edit2,
  Trash2,
  ShieldCheck,
  Calendar,
  UserCheck,
  X,
  ShieldAlert,
  Check,
  Sparkles,
  RotateCcw,
} from 'lucide-react';
import { api } from '../services/api';
import { useAuth } from '../context/AuthContext';
import { useToast } from '../context/ToastContext';
import { ASSET_IMAGES } from '../assets/images';

const STANDARD_FACTS_TEMPLATE = [
  {
    factText: 'INKGUARD delivers 99.99% high availability with multi-region automated failover architecture.',
    category: 'Performance Benchmarks',
    sourceName: 'Infrastructure SLA Report Q4 2025',
    sourceUrl: 'https://status.inkguard.io',
    verificationDate: new Date().toISOString(),
    expiryDate: new Date(Date.now() + 365 * 24 * 60 * 60 * 1000).toISOString(),
    ownerRole: 'VP of Cloud Infrastructure',
    status: 'active',
    notes: 'Verified against SOC2 Type II audit telemetry and multi-cloud metrics.',
  },
  {
    factText: 'Over 1,200 enterprise organizations actively use our brand governance platform worldwide.',
    category: 'Customer Adoption',
    sourceName: 'Annual Customer & Revenue Report 2025',
    sourceUrl: '',
    verificationDate: new Date().toISOString(),
    expiryDate: new Date(Date.now() + 180 * 24 * 60 * 60 * 1000).toISOString(),
    ownerRole: 'Director of Product Marketing',
    status: 'active',
    notes: 'Audited active accounts with more than 10 daily active seats.',
  },
  {
    factText: 'Automated brand audits reduce content compliance review cycle times by 45%.',
    category: 'Product Capabilities',
    sourceName: 'Enterprise Governance Efficiency Benchmark 2026',
    sourceUrl: '',
    verificationDate: new Date().toISOString(),
    expiryDate: new Date(Date.now() + 365 * 24 * 60 * 60 * 1000).toISOString(),
    ownerRole: 'Head of Customer Success',
    status: 'active',
    notes: 'Calculated across 85,000 document reviews during beta testing phase.',
  },
  {
    factText: 'All data is encrypted with AES-256 at rest and TLS 1.3 in transit with SOC2 Type II compliance.',
    category: 'Security & Compliance',
    sourceName: 'Corporate Security & Compliance Whitepaper',
    sourceUrl: 'https://trust.inkguard.io',
    verificationDate: new Date().toISOString(),
    expiryDate: new Date(Date.now() + 365 * 24 * 60 * 60 * 1000).toISOString(),
    ownerRole: 'Chief Information Security Officer',
    status: 'active',
    notes: 'Third-party audited and re-certified annually.',
  },
];

export default function ApprovedFacts() {
  const [facts, setFacts] = useState([]);
  const [loading, setLoading] = useState(true);
  const [search, setSearch] = useState('');
  const [selectedStatus, setSelectedStatus] = useState('');

  // Modals
  const [showModal, setShowModal] = useState(false);
  const [editingFact, setEditingFact] = useState(null);
  const [formData, setFormData] = useState({
    factText: '',
    category: 'Product Capabilities',
    sourceName: '',
    sourceUrl: '',
    verificationDate: new Date().toISOString().split('T')[0],
    expiryDate: '',
    ownerRole: 'Product Marketing Lead',
    status: 'active',
    notes: '',
  });
  const [saving, setSaving] = useState(false);
  const [deleteConfirm, setDeleteConfirm] = useState(null);
  const [loadingTemplate, setLoadingTemplate] = useState(false);

  const { workspace, isReviewer, isAdmin } = useAuth();
  const toast = useToast();

  const handleLoadStarterTemplate = async () => {
    try {
      setLoadingTemplate(true);
      toast.info('Seeding standard corporate verified facts...');
      let added = 0;
      for (const fact of STANDARD_FACTS_TEMPLATE) {
        try {
          await api.approvedFacts.create(fact);
          added++;
        } catch (e) {
          // ignore duplicate
        }
      }
      toast.success(`Successfully loaded ${added} verified corporate facts!`);
      await loadFacts();
    } catch (err) {
      toast.error('Could not load template facts: ' + (err.message || 'Request failed'));
    } finally {
      setLoadingTemplate(false);
    }
  };

  const loadFacts = async () => {
    try {
      setLoading(true);
      const res = await api.approvedFacts.list({
        search: search || undefined,
        status: selectedStatus || undefined,
      });
      if (res.success) {
        setFacts(res.data);
      }
    } catch (err) {
      toast.error('Failed to load approved facts: ' + err.message);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    loadFacts();
  }, [workspace, search, selectedStatus]);

  const handleOpenAdd = () => {
    setEditingFact(null);
    setFormData({
      factText: '',
      category: 'Performance Benchmarks',
      sourceName: '',
      sourceUrl: '',
      verificationDate: new Date().toISOString().split('T')[0],
      expiryDate: '',
      ownerRole: 'Director of Product',
      status: 'active',
      notes: '',
    });
    setShowModal(true);
  };

  const handleOpenEdit = (fact) => {
    setEditingFact(fact);
    setFormData({
      factText: fact.factText,
      category: fact.category || 'Product Capabilities',
      sourceName: fact.sourceName,
      sourceUrl: fact.sourceUrl || '',
      verificationDate: fact.verificationDate ? new Date(fact.verificationDate).toISOString().split('T')[0] : '',
      expiryDate: fact.expiryDate ? new Date(fact.expiryDate).toISOString().split('T')[0] : '',
      ownerRole: fact.ownerRole || '',
      status: fact.status || 'active',
      notes: fact.notes || '',
    });
    setShowModal(true);
  };

  const handleSave = async (e) => {
    e.preventDefault();
    try {
      setSaving(true);
      const payload = {
        factText: formData.factText.trim(),
        category: formData.category.trim(),
        sourceName: formData.sourceName.trim(),
        sourceUrl: formData.sourceUrl.trim() || undefined,
        verificationDate: formData.verificationDate ? new Date(formData.verificationDate) : undefined,
        expiryDate: formData.expiryDate ? new Date(formData.expiryDate) : null,
        ownerRole: formData.ownerRole.trim(),
        status: formData.status,
        notes: formData.notes.trim(),
      };

      if (editingFact) {
        await api.approvedFacts.update(editingFact._id, payload);
        toast.success('Approved fact updated.');
      } else {
        await api.approvedFacts.create(payload);
        toast.success('Approved fact created.');
      }

      setShowModal(false);
      loadFacts();
    } catch (err) {
      toast.error('Failed to save fact: ' + err.message);
    } finally {
      setSaving(false);
    }
  };

  const handleDelete = async () => {
    if (!deleteConfirm) return;
    try {
      await api.approvedFacts.delete(deleteConfirm._id);
      toast.success('Approved fact removed.');
      setDeleteConfirm(null);
      loadFacts();
    } catch (err) {
      toast.error('Failed to delete fact: ' + err.message);
    }
  };

  const activeCount = facts.filter(f => f.status === 'active' && !f.isAutoExpired).length;
  const expiredCount = facts.filter(f => f.status === 'expired' || f.isAutoExpired).length;

  return (
    <div style={{ display: 'flex', flexDirection: 'column', gap: '28px', maxWidth: '100%' }}>
      {/* Modern Page Header Banner */}
      <div className="page-header-clean">
        <div style={{ display: 'flex', alignItems: 'center', gap: '20px', flexWrap: 'wrap' }}>
          <div
            className="ui-integrated-graphic motion-mascot"
            style={{ width: '56px', height: '56px', flexShrink: 0 }}
          >
            <img
              src={ASSET_IMAGES.brandDocPreview}
              alt="Truth Repository"
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
                  background: '#ECFDF5',
                  color: '#059669',
                  fontSize: '0.6875rem',
                  fontWeight: 700,
                  border: '1px solid #A7F3D0',
                  textTransform: 'uppercase',
                  letterSpacing: '0.04em',
                }}
              >
                <CheckCircle2 size={12} color="#059669" />
                Truth Repository
              </span>
              <span style={{ fontSize: '0.75rem', color: '#94A3B8' }}>•</span>
              <span style={{ fontSize: '0.75rem', color: '#64748B', fontWeight: 600 }}>
                {activeCount} Verified Claims Enforced
              </span>
            </div>

            <h1 className="text-gradient-primary" style={{ fontSize: '1.75rem', fontWeight: 850, margin: 0 }}>
              Approved Facts & Evidence Repository
            </h1>
            <p style={{ fontSize: '0.875rem', color: '#64748B', marginTop: '4px', margin: '4px 0 0 0' }}>
              Authoritative corporate claims, benchmarks, and legal verification sources preventing promotional drift.
            </p>
          </div>
        </div>

        {/* Action Button & Quick Metrics */}
        <div style={{ display: 'flex', alignItems: 'center', gap: '12px', flexWrap: 'wrap' }}>
          <div className="segmented-control">
            <span className="segmented-option active">
              {activeCount} Active Verified
            </span>
            {expiredCount > 0 && (
              <span className="segmented-option" style={{ color: '#D97706' }}>
                {expiredCount} Refresh Needed
              </span>
            )}
          </div>

          {isReviewer && (
            <button onClick={handleOpenAdd} className="btn btn-gradient-primary btn-sm">
              <Plus size={16} strokeWidth={2.5} />
              <span>Add Approved Fact</span>
            </button>
          )}
        </div>
      </div>

      {/* Unified Search & Status Filter Toolbar */}
      <div className="facts-toolbar">
        <div className="facts-toolbar-search">
          <Search size={16} color="var(--text-tertiary)" />
          <input
            type="text"
            placeholder="Search facts by keyword, metric, or source..."
            value={search}
            onChange={(e) => setSearch(e.target.value)}
          />
          {search && (
            <button
              type="button"
              onClick={() => setSearch('')}
              style={{
                position: 'absolute',
                right: '12px',
                background: 'transparent',
                border: 'none',
                cursor: 'pointer',
                color: '#94A3B8',
                display: 'flex',
                alignItems: 'center',
                justifyContent: 'center',
                padding: '2px',
              }}
              title="Clear search"
            >
              <X size={14} />
            </button>
          )}
        </div>

        <div style={{ display: 'flex', alignItems: 'center', gap: '10px', flexWrap: 'wrap' }}>
          <select
            className="form-select"
            value={selectedStatus}
            onChange={(e) => setSelectedStatus(e.target.value)}
            style={{ width: '180px' }}
          >
            <option value="">All Statuses</option>
            <option value="active">Active Verified</option>
            <option value="expired">Expired / Needs Refresh</option>
            <option value="archived">Archived</option>
          </select>

          {(search || selectedStatus) && (
            <button
              type="button"
              onClick={() => {
                setSearch('');
                setSelectedStatus('');
              }}
              className="btn btn-ghost btn-sm"
              style={{
                display: 'inline-flex',
                alignItems: 'center',
                gap: '6px',
                color: '#64748B',
                padding: '6px 12px',
                borderRadius: '10px',
                border: '1px solid #E2E8F0',
                background: '#F8FAFC',
                fontSize: '0.8125rem',
                fontWeight: 600,
              }}
              title="Reset all filters"
            >
              <RotateCcw size={13} />
              <span>Reset Filters</span>
            </button>
          )}
        </div>
      </div>

      {/* Facts Grid or Spacious Empty Canvas */}
      {loading ? (
        <div className="brand-empty-canvas" style={{ padding: '64px 24px' }}>
          <div className="brand-empty-canvas-emblem" style={{ background: '#ECFDF5', borderColor: '#A7F3D0' }}>
            <Sparkles size={34} color="#059669" className="motion-spin-slow" />
          </div>
          <h4 style={{ fontSize: '1.2rem', fontWeight: 800, color: '#0F172A', marginBottom: '6px' }}>
            Loading Approved Facts...
          </h4>
          <p style={{ fontSize: '0.875rem', color: '#64748B', maxWidth: '420px', margin: '0 auto' }}>
            Synchronizing verified corporate benchmarks and evidentiary sources.
          </p>
        </div>
      ) : facts.length === 0 ? (
        <div className="brand-empty-canvas">
          <div
            className="brand-empty-canvas-emblem"
            style={{
              background: 'linear-gradient(135deg, #ECFDF5 0%, #F0FDF4 100%)',
              borderColor: '#A7F3D0',
              boxShadow: '0 12px 28px -6px rgba(16, 185, 129, 0.22)',
            }}
          >
            <CheckCircle2 size={34} color="#059669" strokeWidth={2.3} />
          </div>

          <h3 className="brand-empty-title">
            {search || selectedStatus
              ? 'No Matching Approved Facts Found'
              : 'Your Verified Facts Repository is Empty'}
          </h3>

          <p className="brand-empty-subtitle">
            {search || selectedStatus
              ? 'No corporate claims match your active search filters. Try clearing criteria to view all verified data points.'
              : 'Approved facts provide deterministic truth anchors for your brand. InkGuard cross-references every marketing claim and statistic against these verified sources to eliminate factual drift.'}
          </p>

          <div className="brand-empty-actions">
            {search || selectedStatus ? (
              <button
                type="button"
                onClick={() => {
                  setSearch('');
                  setSelectedStatus('');
                }}
                className="btn btn-primary"
                style={{ padding: '12px 24px', borderRadius: '14px', fontWeight: 700 }}
              >
                <RotateCcw size={16} />
                <span>Clear Search & Filters</span>
              </button>
            ) : (
              <>
                {isReviewer && (
                  <button
                    type="button"
                    onClick={handleLoadStarterTemplate}
                    disabled={loadingTemplate}
                    className="btn btn-gradient-primary"
                    style={{
                      padding: '12px 24px',
                      borderRadius: '14px',
                      fontWeight: 700,
                      fontSize: '0.9375rem',
                      background: 'linear-gradient(135deg, #059669 0%, #2563EB 100%)',
                      boxShadow: '0 8px 24px -4px rgba(5, 150, 105, 0.38)',
                      display: 'inline-flex',
                      alignItems: 'center',
                      gap: '8px',
                    }}
                  >
                    <Sparkles size={16} />
                    <span>
                      {loadingTemplate ? 'Loading Verified Facts...' : 'Load Recommended Facts (1-Click)'}
                    </span>
                  </button>
                )}

                {isReviewer && (
                  <button
                    type="button"
                    onClick={handleOpenAdd}
                    className="btn"
                    style={{
                      padding: '12px 22px',
                      borderRadius: '14px',
                      fontWeight: 600,
                      fontSize: '0.9375rem',
                      background: '#FFFFFF',
                      border: '1.5px solid #CBD5E1',
                      color: '#0F172A',
                      display: 'inline-flex',
                      alignItems: 'center',
                      gap: '8px',
                    }}
                  >
                    <Plus size={16} />
                    <span>Add Custom Fact</span>
                  </button>
                )}
              </>
            )}
          </div>

          {/* 3 Value Pillar Highlights */}
          {!search && !selectedStatus && (
            <div className="brand-empty-features-grid">
              <div className="brand-empty-feature-card">
                <div className="brand-empty-feature-icon" style={{ background: '#ECFDF5', color: '#059669' }}>
                  <ShieldCheck size={18} strokeWidth={2.4} />
                </div>
                <div>
                  <div style={{ fontWeight: 700, fontSize: '0.875rem', color: '#0F172A' }}>
                    SLA & Performance
                  </div>
                  <div style={{ fontSize: '0.75rem', color: '#64748B', marginTop: '2px', lineHeight: 1.45 }}>
                    Lock in legally defensible uptime, latency, and cloud infrastructure figures.
                  </div>
                </div>
              </div>

              <div className="brand-empty-feature-card">
                <div className="brand-empty-feature-icon" style={{ background: '#EFF6FF', color: '#2563EB' }}>
                  <CheckCircle2 size={18} strokeWidth={2.4} />
                </div>
                <div>
                  <div style={{ fontWeight: 700, fontSize: '0.875rem', color: '#0F172A' }}>
                    Enterprise Adoption
                  </div>
                  <div style={{ fontSize: '0.75rem', color: '#64748B', marginTop: '2px', lineHeight: 1.45 }}>
                    Maintain audited user counts, client milestones, and market growth statistics.
                  </div>
                </div>
              </div>

              <div className="brand-empty-feature-card">
                <div className="brand-empty-feature-icon" style={{ background: '#F5F3FF', color: '#7C3AED' }}>
                  <Clock size={18} strokeWidth={2.4} />
                </div>
                <div>
                  <div style={{ fontWeight: 700, fontSize: '0.875rem', color: '#0F172A' }}>
                    Automated Expiry Safeguards
                  </div>
                  <div style={{ fontSize: '0.75rem', color: '#64748B', marginTop: '2px', lineHeight: 1.45 }}>
                    Facts automatically flag for recertification when empirical validity dates lapse.
                  </div>
                </div>
              </div>
            </div>
          )}
        </div>
      ) : (
        <div
          className="facts-grid"
          style={{
            display: 'grid',
            gridTemplateColumns: 'repeat(auto-fill, minmax(min(100%, 380px), 1fr))',
            gap: '24px',
          }}
        >
          {facts.map((fact) => {
            const isExpired = fact.status === 'expired' || fact.isAutoExpired;

            return (
              <div
                key={fact._id}
                className={`fact-card ${isExpired ? 'expired' : 'verified'}`}
              >
                <div>
                  <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '8px' }}>
                    <span className="badge badge-neutral" style={{ fontSize: '0.6875rem', fontWeight: 700 }}>
                      {fact.category}
                    </span>
                    <span
                      style={{
                        display: 'inline-flex',
                        alignItems: 'center',
                        gap: '4px',
                        padding: '3px 10px',
                        borderRadius: 'var(--radius-full)',
                        fontSize: '0.75rem',
                        fontWeight: 700,
                        background: isExpired ? '#FFFBEB' : '#ECFDF5',
                        color: isExpired ? '#B45309' : '#047857',
                        border: `1px solid ${isExpired ? '#FDE68A' : '#A7F3D0'}`,
                      }}
                    >
                      {isExpired ? <AlertTriangle size={12} /> : <CheckCircle2 size={12} />}
                      {isExpired ? 'Expired / Refresh Needed' : 'Verified Active'}
                    </span>
                  </div>

                  <div className="fact-quote-box">
                    "{fact.factText}"
                  </div>

                  <div className="fact-meta-list">
                    <div className="fact-meta-item">
                      <ShieldCheck size={14} color="var(--color-primary)" style={{ flexShrink: 0 }} />
                      <span>
                        Source: <strong>{fact.sourceName}</strong>
                      </span>
                      {fact.sourceUrl && (
                        <a href={fact.sourceUrl} target="_blank" rel="noreferrer" style={{ display: 'inline-flex', color: 'var(--color-primary)' }}>
                          <ExternalLink size={12} />
                        </a>
                      )}
                    </div>

                    <div className="fact-meta-item">
                      <Calendar size={14} color="var(--text-tertiary)" style={{ flexShrink: 0 }} />
                      <span>Verified: {new Date(fact.verificationDate).toLocaleDateString()}</span>
                      {fact.expiryDate && (
                        <span style={{ color: isExpired ? '#B45309' : 'var(--text-tertiary)', fontWeight: isExpired ? 700 : 500 }}>
                          (Expires: {new Date(fact.expiryDate).toLocaleDateString()})
                        </span>
                      )}
                    </div>

                    {fact.ownerRole && (
                      <div className="fact-meta-item">
                        <UserCheck size={14} color="var(--text-tertiary)" style={{ flexShrink: 0 }} />
                        <span>Owner: <strong>{fact.ownerRole}</strong></span>
                      </div>
                    )}
                  </div>
                </div>

                {isReviewer && (
                  <div className="fact-footer">
                    <span style={{ fontSize: '0.75rem', color: 'var(--text-tertiary)' }}>
                      ID: {fact._id.slice(-6).toUpperCase()}
                    </span>
                    <div style={{ display: 'flex', gap: '8px' }}>
                      <button
                        onClick={() => handleOpenEdit(fact)}
                        className="btn btn-secondary btn-xs"
                      >
                        <Edit2 size={12} /> Edit
                      </button>
                      {isAdmin && (
                        <button
                          onClick={() => setDeleteConfirm(fact)}
                          className="btn btn-danger btn-xs"
                        >
                          <Trash2 size={12} /> Delete
                        </button>
                      )}
                    </div>
                  </div>
                )}
              </div>
            );
          })}
        </div>
      )}

      {/* Add / Edit Modal */}
      {showModal && (
        <div className="modal-overlay" onClick={() => setShowModal(false)}>
          <div className="modal-content" style={{ maxWidth: '720px' }} onClick={(e) => e.stopPropagation()}>
            {/* Modal Header */}
            <div className="modal-header">
              <div style={{ display: 'flex', alignItems: 'center', gap: '14px' }}>
                <div
                  style={{
                    width: '42px',
                    height: '42px',
                    borderRadius: '12px',
                    background: 'linear-gradient(135deg, #ECFDF5 0%, #EFF6FF 100%)',
                    display: 'flex',
                    alignItems: 'center',
                    justifyContent: 'center',
                    border: '1px solid #A7F3D0',
                    color: '#059669',
                    flexShrink: 0,
                  }}
                >
                  <ShieldCheck size={22} />
                </div>
                <div className="modal-header-content">
                  <div style={{ display: 'flex', alignItems: 'center', gap: '8px', marginBottom: '2px' }}>
                    <span
                      style={{
                        display: 'inline-flex',
                        alignItems: 'center',
                        gap: '4px',
                        padding: '1px 8px',
                        borderRadius: '999px',
                        background: '#ECFDF5',
                        color: '#059669',
                        fontSize: '0.6875rem',
                        fontWeight: 700,
                        border: '1px solid #A7F3D0',
                      }}
                    >
                      Truth Repository
                    </span>
                    <span style={{ fontSize: '0.75rem', color: '#94A3B8' }}>•</span>
                    <span style={{ fontSize: '0.75rem', color: '#64748B', fontWeight: 600 }}>
                      Verified Ground Truth
                    </span>
                  </div>
                  <h3 className="modal-title text-gradient-primary">
                    {editingFact ? 'Edit Approved Fact' : 'Register Approved Fact'}
                  </h3>
                </div>
              </div>

              <button
                type="button"
                className="modal-close-btn"
                onClick={() => setShowModal(false)}
                title="Close dialog"
              >
                <X size={16} />
              </button>
            </div>

            {/* Modal Form */}
            <form onSubmit={handleSave} style={{ display: 'flex', flexDirection: 'column', flex: 1, minHeight: 0 }}>
              <div className="modal-body" style={{ display: 'flex', flexDirection: 'column', gap: '16px' }}>
                <div className="form-group" style={{ margin: 0 }}>
                  <label className="form-label" style={{ display: 'flex', justifyContent: 'space-between' }}>
                    <span>Fact Statement / Metric <span style={{ color: '#EF4444' }}>*</span></span>
                    <span style={{ fontSize: '0.75rem', color: '#94A3B8', fontWeight: 400 }}>Verified corporate claim or statistic</span>
                  </label>
                  <textarea
                    className="form-textarea"
                    rows={3}
                    required
                    placeholder="e.g. Apex Cloud processes over 4.8 billion transactions daily with sub-millisecond p99 latency across 24 global regions."
                    value={formData.factText}
                    onChange={(e) => setFormData({ ...formData, factText: e.target.value })}
                  />
                </div>

                <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '14px' }}>
                  <div className="form-group" style={{ margin: 0 }}>
                    <label className="form-label">Category</label>
                    <input
                      type="text"
                      className="form-input"
                      placeholder="e.g. Performance Benchmarks"
                      value={formData.category}
                      onChange={(e) => setFormData({ ...formData, category: e.target.value })}
                    />
                  </div>

                  <div className="form-group" style={{ margin: 0 }}>
                    <label className="form-label">Responsible Owner Role</label>
                    <input
                      type="text"
                      className="form-input"
                      placeholder="e.g. Chief Technology Officer"
                      value={formData.ownerRole}
                      onChange={(e) => setFormData({ ...formData, ownerRole: e.target.value })}
                    />
                  </div>
                </div>

                <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '14px' }}>
                  <div className="form-group" style={{ margin: 0 }}>
                    <label className="form-label">
                      Source Document Name <span style={{ color: '#EF4444' }}>*</span>
                    </label>
                    <input
                      type="text"
                      required
                      className="form-input"
                      placeholder="e.g. Q3 2026 Audit Report §2.4"
                      value={formData.sourceName}
                      onChange={(e) => setFormData({ ...formData, sourceName: e.target.value })}
                    />
                  </div>

                  <div className="form-group" style={{ margin: 0 }}>
                    <label className="form-label">Source URL (Optional)</label>
                    <input
                      type="url"
                      className="form-input"
                      placeholder="https://audit.example.com/report"
                      value={formData.sourceUrl}
                      onChange={(e) => setFormData({ ...formData, sourceUrl: e.target.value })}
                    />
                  </div>
                </div>

                <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr 1fr', gap: '14px' }}>
                  <div className="form-group" style={{ margin: 0 }}>
                    <label className="form-label">Verification Date</label>
                    <input
                      type="date"
                      className="form-input"
                      value={formData.verificationDate}
                      onChange={(e) => setFormData({ ...formData, verificationDate: e.target.value })}
                    />
                  </div>

                  <div className="form-group" style={{ margin: 0 }}>
                    <label className="form-label">Expiry Date</label>
                    <input
                      type="date"
                      className="form-input"
                      value={formData.expiryDate}
                      onChange={(e) => setFormData({ ...formData, expiryDate: e.target.value })}
                    />
                  </div>

                  <div className="form-group" style={{ margin: 0 }}>
                    <label className="form-label">Governance Status</label>
                    <select
                      className="form-select"
                      value={formData.status}
                      onChange={(e) => setFormData({ ...formData, status: e.target.value })}
                    >
                      <option value="active">🟢 Active</option>
                      <option value="expired">🟡 Expired</option>
                      <option value="archived">⚪ Archived</option>
                    </select>
                  </div>
                </div>
              </div>

              {/* Modal Footer */}
              <div className="modal-footer">
                <button
                  type="button"
                  className="btn btn-secondary btn-sm"
                  onClick={() => setShowModal(false)}
                  style={{ borderRadius: '10px', padding: '8px 20px', fontWeight: 600 }}
                >
                  Cancel
                </button>
                <button
                  type="submit"
                  className="btn btn-gradient-primary btn-sm"
                  disabled={saving}
                  style={{ borderRadius: '10px', padding: '8px 24px', fontWeight: 700, boxShadow: '0 4px 14px rgba(79, 70, 229, 0.3)' }}
                >
                  {saving ? 'Saving...' : editingFact ? 'Update Fact' : 'Register Fact'}
                </button>
              </div>
            </form>
          </div>
        </div>
      )}

      {/* Delete Fact Modal */}
      {deleteConfirm && (
        <div className="modal-overlay" onClick={() => setDeleteConfirm(null)}>
          <div className="modal-content" style={{ maxWidth: '440px' }} onClick={(e) => e.stopPropagation()}>
            <div className="modal-header">
              <div style={{ display: 'flex', alignItems: 'center', gap: '10px', color: '#DC2626' }}>
                <ShieldAlert size={22} />
                <h3 className="modal-title" style={{ fontSize: '1.125rem' }}>Delete Approved Fact?</h3>
              </div>
              <button
                type="button"
                className="modal-close-btn"
                onClick={() => setDeleteConfirm(null)}
              >
                <X size={16} />
              </button>
            </div>
            <div className="modal-body">
              <p style={{ fontSize: '0.875rem', color: '#64748B', margin: 0, lineHeight: 1.5 }}>
                Are you sure you want to remove this fact from the governance repository? Future AI audits will no longer substantiate statements with this source.
              </p>
            </div>
            <div className="modal-footer">
              <button
                className="btn btn-secondary btn-sm"
                onClick={() => setDeleteConfirm(null)}
                style={{ borderRadius: '10px', padding: '8px 18px', fontWeight: 600 }}
              >
                Cancel
              </button>
              <button
                className="btn btn-danger btn-sm"
                onClick={handleDelete}
                style={{ borderRadius: '10px', padding: '8px 20px', fontWeight: 700 }}
              >
                Delete Fact
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}
