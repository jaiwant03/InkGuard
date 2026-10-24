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
} from 'lucide-react';
import { api } from '../services/api';
import { useAuth } from '../context/AuthContext';
import { useToast } from '../context/ToastContext';
import { ASSET_IMAGES } from '../assets/images';
import { Check, Sparkles } from 'lucide-react';

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
      {/* Clean Modern Page Header Banner */}
      <div className="page-header-clean">
        <div style={{ display: 'flex', alignItems: 'center', gap: '20px', flexWrap: 'wrap' }}>
          <div
            className="ui-integrated-graphic motion-mascot"
            style={{ width: '56px', height: '56px', flexShrink: 0 }}
          >
            <img
              src={ASSET_IMAGES.governanceShield}
              alt="Governance Shield"
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
                <CheckCircle2 size={12} color="#10B981" />
                Truth Repository
              </span>
              <span style={{ fontSize: '0.75rem', color: '#94A3B8' }}>•</span>
              <span style={{ fontSize: '0.75rem', color: '#64748B', fontWeight: 600 }}>
                {activeCount} Verified Claims Active
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
          <div style={{ display: 'flex', gap: '8px' }}>
            <span
              style={{
                fontSize: '0.75rem',
                fontWeight: 700,
                padding: '6px 12px',
                borderRadius: '10px',
                background: '#ECFDF5',
                color: '#059669',
                border: '1px solid #A7F3D0',
              }}
            >
              {activeCount} Active
            </span>
            {expiredCount > 0 && (
              <span
                style={{
                  fontSize: '0.75rem',
                  fontWeight: 700,
                  padding: '6px 12px',
                  borderRadius: '10px',
                  background: '#FFFBEB',
                  color: '#D97706',
                  border: '1px solid #FDE68A',
                }}
              >
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

      {/* Header bar */}
      <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', flexWrap: 'wrap', gap: 'var(--space-4)' }}>
        <div>
          <h2 className="text-gradient-blue" style={{ fontSize: '1.25rem', fontWeight: 800, margin: 0 }}>
            All Verified Fact Entries
          </h2>
          <p style={{ fontSize: '0.875rem', color: '#64748B', marginTop: '2px', margin: '2px 0 0 0' }}>
            Searchable corporate facts used by the deterministic rule engine to auto-validate content drafts.
          </p>
        </div>
      </div>

      {/* Search & Filter Bar */}
      <div className="card" style={{ padding: 'var(--space-4)' }}>
        <div style={{ display: 'flex', gap: 'var(--space-3)', flexWrap: 'wrap' }}>
          <div style={{ flex: 1, minWidth: '240px', position: 'relative' }}>
            <input
              type="text"
              className="form-input"
              placeholder="Search facts by keyword, metric, or source..."
              value={search}
              onChange={(e) => setSearch(e.target.value)}
              style={{ paddingLeft: '36px' }}
            />
            <Search size={16} color="var(--text-tertiary)" style={{ position: 'absolute', left: '12px', top: '12px' }} />
          </div>

          <select
            className="form-select"
            value={selectedStatus}
            onChange={(e) => setSelectedStatus(e.target.value)}
            style={{ width: '160px' }}
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
            <button onClick={handleOpenAdd} className="btn btn-primary">
              <Plus size={16} /> Add Approved Fact
            </button>
          )}
        </div>
      ) : (
        <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(340px, 1fr))', gap: 'var(--space-5)' }}>
          {facts.map((fact) => {
            const isExpired = fact.status === 'expired' || fact.isAutoExpired;

            return (
              <div
                key={fact._id}
                className="card"
                style={{
                  display: 'flex',
                  flexDirection: 'column',
                  justifyContent: 'space-between',
                  borderTop: `4px solid ${isExpired ? 'var(--severity-medium)' : 'var(--status-success)'}`,
                }}
              >
                <div>
                  <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: 'var(--space-3)' }}>
                    <span className="badge badge-neutral" style={{ fontSize: '0.6875rem' }}>
                      {fact.category}
                    </span>
                    <span
                      style={{
                        display: 'inline-flex',
                        alignItems: 'center',
                        gap: '4px',
                        padding: '2px 8px',
                        borderRadius: 'var(--radius-full)',
                        fontSize: '0.75rem',
                        fontWeight: 700,
                        background: isExpired ? '#FFFBEB' : '#ECFDF5',
                        color: isExpired ? '#B45309' : '#047857',
                        border: `1px solid ${isExpired ? '#FDE68A' : '#A7F3D0'}`,
                      }}
                    >
                      {isExpired ? <AlertTriangle size={12} /> : <CheckCircle2 size={12} />}
                      {isExpired ? 'Expired / Needs Refresh' : 'Verified Active'}
                    </span>
                  </div>

                  <p style={{ fontSize: '0.9375rem', fontWeight: 600, color: 'var(--text-primary)', lineHeight: 1.5, marginBottom: 'var(--space-4)' }}>
                    "{fact.factText}"
                  </p>

                  <div style={{ display: 'flex', flexDirection: 'column', gap: '6px', fontSize: '0.8125rem', color: 'var(--text-secondary)' }}>
                    <div style={{ display: 'flex', alignItems: 'center', gap: '6px' }}>
                      <ShieldCheck size={14} color="var(--color-primary)" />
                      <span>
                        Source: <strong>{fact.sourceName}</strong>
                      </span>
                      {fact.sourceUrl && (
                        <a href={fact.sourceUrl} target="_blank" rel="noreferrer" style={{ display: 'flex', color: 'var(--color-primary)' }}>
                          <ExternalLink size={12} />
                        </a>
                      )}
                    </div>

                    <div style={{ display: 'flex', alignItems: 'center', gap: '6px' }}>
                      <Calendar size={14} color="var(--text-tertiary)" />
                      <span>Verified: {new Date(fact.verificationDate).toLocaleDateString()}</span>
                      {fact.expiryDate && (
                        <span style={{ color: isExpired ? 'var(--severity-medium)' : 'var(--text-tertiary)' }}>
                          (Expires: {new Date(fact.expiryDate).toLocaleDateString()})
                        </span>
                      )}
                    </div>

                    {fact.ownerRole && (
                      <div style={{ display: 'flex', alignItems: 'center', gap: '6px' }}>
                        <UserCheck size={14} color="var(--text-tertiary)" />
                        <span>Owner: {fact.ownerRole}</span>
                      </div>
                    )}
                  </div>
                </div>

                {isReviewer && (
                  <div
                    style={{
                      borderTop: '1px solid var(--border-subtle)',
                      marginTop: 'var(--space-4)',
                      paddingTop: 'var(--space-3)',
                      display: 'flex',
                      justifyContent: 'flex-end',
                      gap: 'var(--space-2)',
                    }}
                  >
                    <button
                      onClick={() => handleOpenEdit(fact)}
                      className="btn btn-secondary btn-sm"
                      style={{ padding: '4px 8px', fontSize: '0.75rem' }}
                    >
                      <Edit2 size={13} /> Edit
                    </button>
                    {isAdmin && (
                      <button
                        onClick={() => setDeleteConfirm(fact)}
                        className="btn btn-danger btn-sm"
                        style={{ padding: '4px 8px', fontSize: '0.75rem' }}
                      >
                        <Trash2 size={13} /> Delete
                      </button>
                    )}
                  </div>
                )}
              </div>
            );
          })}
        </div>
      )}

      {/* Add / Edit Modal */}
      {showModal && (
        <div className="modal-overlay">
          <div className="modal-content" style={{ padding: 'var(--space-6)' }}>
            <h3 style={{ fontSize: '1.25rem', fontWeight: 700, marginBottom: 'var(--space-2)' }}>
              {editingFact ? 'Edit Approved Fact' : 'Add New Approved Fact'}
            </h3>
            <p style={{ fontSize: '0.875rem', color: 'var(--text-secondary)', marginBottom: 'var(--space-4)' }}>
              Register verified statements and factual data points for brand compliance verification.
            </p>

            <form onSubmit={handleSave}>
              <div className="form-group">
                <label className="form-label">Fact Statement / Metric *</label>
                <textarea
                  className="form-textarea"
                  rows={3}
                  required
                  placeholder="e.g. Apex Cloud processes over 4.8 billion transactions daily with sub-millisecond p99 latency."
                  value={formData.factText}
                  onChange={(e) => setFormData({ ...formData, factText: e.target.value })}
                />
              </div>

              <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: 'var(--space-4)' }}>
                <div className="form-group">
                  <label className="form-label">Category</label>
                  <input
                    type="text"
                    className="form-input"
                    placeholder="e.g. Performance Benchmarks"
                    value={formData.category}
                    onChange={(e) => setFormData({ ...formData, category: e.target.value })}
                  />
                </div>

                <div className="form-group">
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

              <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: 'var(--space-4)' }}>
                <div className="form-group">
                  <label className="form-label">Source Document Name *</label>
                  <input
                    type="text"
                    required
                    className="form-input"
                    placeholder="e.g. Q3 2026 Audit Report"
                    value={formData.sourceName}
                    onChange={(e) => setFormData({ ...formData, sourceName: e.target.value })}
                  />
                </div>

                <div className="form-group">
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

              <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr 1fr', gap: 'var(--space-4)' }}>
                <div className="form-group">
                  <label className="form-label">Verification Date</label>
                  <input
                    type="date"
                    className="form-input"
                    value={formData.verificationDate}
                    onChange={(e) => setFormData({ ...formData, verificationDate: e.target.value })}
                  />
                </div>

                <div className="form-group">
                  <label className="form-label">Expiry Date</label>
                  <input
                    type="date"
                    className="form-input"
                    value={formData.expiryDate}
                    onChange={(e) => setFormData({ ...formData, expiryDate: e.target.value })}
                  />
                </div>

                <div className="form-group">
                  <label className="form-label">Status</label>
                  <select
                    className="form-select"
                    value={formData.status}
                    onChange={(e) => setFormData({ ...formData, status: e.target.value })}
                  >
                    <option value="active">Active</option>
                    <option value="expired">Expired</option>
                    <option value="archived">Archived</option>
                  </select>
                </div>
              </div>

              <div style={{ display: 'flex', justifyContent: 'flex-end', gap: 'var(--space-2)', marginTop: 'var(--space-5)' }}>
                <button type="button" className="btn btn-secondary" onClick={() => setShowModal(false)}>
                  Cancel
                </button>
                <button type="submit" className="btn btn-primary" disabled={saving}>
                  {saving ? 'Saving...' : editingFact ? 'Update Fact' : 'Add Fact'}
                </button>
              </div>
            </form>
          </div>
        </div>
      )}

      {/* Delete Fact Modal */}
      {deleteConfirm && (
        <div className="modal-overlay">
          <div className="modal-content" style={{ padding: 'var(--space-6)', maxWidth: '440px' }}>
            <div style={{ display: 'flex', alignItems: 'center', gap: 'var(--space-3)', color: 'var(--severity-high)', marginBottom: 'var(--space-3)' }}>
              <AlertTriangle size={28} />
              <h3 style={{ fontSize: '1.125rem', fontWeight: 700 }}>Delete Approved Fact?</h3>
            </div>
            <p style={{ fontSize: '0.875rem', color: 'var(--text-secondary)', marginBottom: 'var(--space-5)' }}>
              Are you sure you want to remove this fact from the governance repository?
            </p>
            <div style={{ display: 'flex', justifyContent: 'flex-end', gap: 'var(--space-2)' }}>
              <button className="btn btn-secondary" onClick={() => setDeleteConfirm(null)}>
                Cancel
              </button>
              <button className="btn btn-danger" onClick={handleDelete}>
                Delete Fact
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}
