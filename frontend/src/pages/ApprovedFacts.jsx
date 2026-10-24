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
} from 'lucide-react';
import { api } from '../services/api';
import { useAuth } from '../context/AuthContext';
import { useToast } from '../context/ToastContext';
import { ASSET_IMAGES } from '../assets/images';

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

  const { workspace, isReviewer, isAdmin } = useAuth();
  const toast = useToast();

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
    <div style={{ display: 'flex', flexDirection: 'column', gap: 'var(--space-6)' }}>
      {/* Modern Page Header */}
      <div className="page-header-clean">
        <div className="page-header-info">
          <div style={{ display: 'flex', alignItems: 'center', gap: '8px', marginBottom: '4px' }}>
            <span className="badge badge-success">
              <CheckCircle2 size={12} style={{ display: 'inline', marginRight: '4px' }} />
              Truth Repository
            </span>
            <span style={{ fontSize: '0.8125rem', color: 'var(--text-tertiary)' }}>
              Deterministic Fact Verification
            </span>
          </div>

          <h1 className="page-header-title text-gradient-primary">
            Approved Facts & Evidence Repository
          </h1>
          <p className="page-header-subtitle">
            Authoritative corporate claims, benchmarks, and legal verification sources preventing promotional drift.
          </p>
        </div>

        {/* Action Button & Quick Metrics */}
        <div style={{ display: 'flex', alignItems: 'center', gap: '12px', flexWrap: 'wrap' }}>
          <div className="segmented-control">
            <span className="segmented-btn active">
              {activeCount} Active
            </span>
            {expiredCount > 0 && (
              <span className="segmented-btn" style={{ color: '#D97706' }}>
                {expiredCount} Refresh Needed
              </span>
            )}
          </div>

          {isReviewer && (
            <button onClick={handleOpenAdd} className="btn btn-primary btn-sm btn-pill">
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
        </div>

        <div style={{ display: 'flex', alignItems: 'center', gap: '10px' }}>
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
        </div>
      </div>

      {/* Facts Grid */}
      {facts.length === 0 ? (
        <div className="card" style={{ textAlign: 'center', padding: 'var(--space-12)' }}>
          <CheckCircle2 size={44} color="var(--text-tertiary)" style={{ margin: '0 auto var(--space-3) auto' }} />
          <h3 style={{ fontSize: '1.125rem', fontWeight: 700, marginBottom: 'var(--space-1)' }}>No Approved Facts Found</h3>
          <p style={{ color: 'var(--text-secondary)', marginBottom: 'var(--space-4)' }}>
            {search || selectedStatus ? 'No facts match your search filters.' : 'Add verified data points and performance metrics.'}
          </p>
          {isReviewer && (
            <button onClick={handleOpenAdd} className="btn btn-primary btn-pill">
              <Plus size={16} /> Add Approved Fact
            </button>
          )}
        </div>
      ) : (
        <div className="facts-grid">
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
