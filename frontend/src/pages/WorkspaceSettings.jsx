import React, { useState, useEffect } from 'react';
import {
  Settings,
  Users,
  Shield,
  UserPlus,
  Trash2,
  Lock,
  Building,
  CheckCircle2,
  AlertTriangle,
  Info,
} from 'lucide-react';
import { api } from '../services/api';
import { useAuth } from '../context/AuthContext';
import { useToast } from '../context/ToastContext';

export default function WorkspaceSettings() {
  const [currentWs, setCurrentWs] = useState(null);
  const [members, setMembers] = useState([]);
  const [loading, setLoading] = useState(true);

  // Form states
  const [name, setName] = useState('');
  const [description, setDescription] = useState('');
  const [industry, setIndustry] = useState('Technology & SaaS');
  const [savingSettings, setSavingSettings] = useState(false);

  // Add Member Modal
  const [showAddModal, setShowAddModal] = useState(false);
  const [newMemberEmail, setNewMemberEmail] = useState('');
  const [newMemberName, setNewMemberName] = useState('');
  const [newMemberRole, setNewMemberRole] = useState('creator');
  const [inviting, setInviting] = useState(false);

  const { workspace, isAdmin, isReviewer, user, refreshUser } = useAuth();
  const toast = useToast();

  const loadData = async () => {
    try {
      setLoading(true);
      const [wsRes, memRes] = await Promise.all([
        api.workspaces.current(),
        api.workspaces.members(),
      ]);

      if (wsRes.success) {
        setCurrentWs(wsRes.data);
        setName(wsRes.data.name || '');
        setDescription(wsRes.data.description || '');
        setIndustry(wsRes.data.industry || 'Technology & SaaS');
      }

      if (memRes.success) {
        setMembers(memRes.data);
      }
    } catch (err) {
      toast.error('Failed to load workspace settings: ' + err.message);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    loadData();
  }, [workspace]);

  const handleSaveSettings = async (e) => {
    e.preventDefault();
    if (!name.trim()) return;

    try {
      setSavingSettings(true);
      const res = await api.workspaces.updateCurrent({
        name: name.trim(),
        description: description.trim(),
        industry,
      });

      if (res.success) {
        toast.success('Workspace settings updated.');
        refreshUser();
      }
    } catch (err) {
      toast.error('Failed to save settings: ' + err.message);
    } finally {
      setSavingSettings(false);
    }
  };

  const handleAddMember = async (e) => {
    e.preventDefault();
    if (!newMemberEmail.trim()) return;

    try {
      setInviting(true);
      const res = await api.workspaces.addMember({
        email: newMemberEmail.trim(),
        name: newMemberName.trim() || undefined,
        role: newMemberRole,
      });

      if (res.success) {
        toast.success(`Added ${newMemberEmail} to workspace.`);
        setShowAddModal(false);
        setNewMemberEmail('');
        setNewMemberName('');
        setNewMemberRole('creator');
        loadData();
      }
    } catch (err) {
      toast.error(err.message || 'Failed to add member.');
    } finally {
      setInviting(false);
    }
  };

  const handleUpdateRole = async (memberId, newRole) => {
    try {
      const res = await api.workspaces.updateRole(memberId, newRole);
      if (res.success) {
        toast.success(res.message);
        loadData();
      }
    } catch (err) {
      toast.error('Failed to update role: ' + err.message);
    }
  };

  const handleRemoveMember = async (memberId, memberName) => {
    if (!window.confirm(`Are you sure you want to remove ${memberName} from this workspace?`)) return;

    try {
      const res = await api.workspaces.removeMember(memberId);
      if (res.success) {
        toast.success('Member removed.');
        loadData();
      }
    } catch (err) {
      toast.error('Failed to remove member: ' + err.message);
    }
  };

  return (
    <div style={{ display: 'flex', flexDirection: 'column', gap: 'var(--space-8)' }}>
      {/* Header */}
      <div>
        <h2 style={{ fontSize: '1.25rem', fontWeight: 800, color: 'var(--text-primary)' }}>
          Workspace Settings & Team Roles
        </h2>
        <p style={{ fontSize: '0.875rem', color: 'var(--text-secondary)' }}>
          Manage workspace configuration, team member permissions, and platform security standards.
        </p>
      </div>

      <div style={{ display: 'grid', gridTemplateColumns: 'minmax(0, 1fr) 360px', gap: 'var(--space-6)', alignItems: 'start' }}>
        {/* Left Column: Workspace Profile + Members Table */}
        <div style={{ display: 'flex', flexDirection: 'column', gap: 'var(--space-6)' }}>
          {/* Workspace Details Form */}
          <div className="card">
            <h3 className="card-title" style={{ marginBottom: 'var(--space-4)' }}>
              <Building size={18} /> Organization Workspace Details
            </h3>

            <form onSubmit={handleSaveSettings}>
              <div className="form-group">
                <label className="form-label">Workspace Name *</label>
                <input
                  type="text"
                  required
                  disabled={!isAdmin}
                  className="form-input"
                  value={name}
                  onChange={(e) => setName(e.target.value)}
                />
              </div>

              <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: 'var(--space-4)' }}>
                <div className="form-group">
                  <label className="form-label">Industry Classification</label>
                  <select
                    className="form-select"
                    disabled={!isAdmin}
                    value={industry}
                    onChange={(e) => setIndustry(e.target.value)}
                  >
                    <option value="Technology & SaaS">Technology & SaaS</option>
                    <option value="Financial Services">Financial Services</option>
                    <option value="Healthcare & Life Sciences">Healthcare & Life Sciences</option>
                    <option value="Retail & E-Commerce">Retail & E-Commerce</option>
                    <option value="Consumer Goods">Consumer Goods</option>
                    <option value="Other">Other</option>
                  </select>
                </div>

                <div className="form-group">
                  <label className="form-label">Workspace Identifier (Slug)</label>
                  <input
                    type="text"
                    disabled
                    className="form-input"
                    value={currentWs?.slug || ''}
                    style={{ background: 'var(--bg-surface-secondary)', fontFamily: 'var(--font-mono)' }}
                  />
                </div>
              </div>

              <div className="form-group">
                <label className="form-label">Workspace Mission & Scope</label>
                <textarea
                  className="form-textarea"
                  rows={3}
                  disabled={!isAdmin}
                  value={description}
                  onChange={(e) => setDescription(e.target.value)}
                />
              </div>

              {isAdmin && (
                <div style={{ display: 'flex', justifyContent: 'flex-end', marginTop: 'var(--space-4)' }}>
                  <button type="submit" className="btn btn-primary" disabled={savingSettings}>
                    {savingSettings ? 'Saving...' : 'Save Workspace Changes'}
                  </button>
                </div>
              )}
            </form>
          </div>

          {/* Members Table */}
          <div className="card">
            <div className="card-header">
              <div>
                <h3 className="card-title">
                  <Users size={18} /> Team Members & Role Permissions ({members.length})
                </h3>
                <p className="card-subtitle">Controls who can author, review, or administer brand rules</p>
              </div>

              {isAdmin && (
                <button onClick={() => setShowAddModal(true)} className="btn btn-primary btn-sm">
                  <UserPlus size={15} /> Add Member
                </button>
              )}
            </div>

            <div style={{ overflowX: 'auto' }}>
              <table style={{ width: '100%', borderCollapse: 'collapse', textAlign: 'left', fontSize: '0.875rem' }}>
                <thead>
                  <tr style={{ borderBottom: '1px solid var(--border-light)', color: 'var(--text-tertiary)', fontSize: '0.75rem', textTransform: 'uppercase' }}>
                    <th style={{ padding: '10px 12px' }}>Member</th>
                    <th style={{ padding: '10px 12px' }}>Role</th>
                    <th style={{ padding: '10px 12px' }}>Status</th>
                    {isAdmin && <th style={{ padding: '10px 12px', textAlign: 'right' }}>Actions</th>}
                  </tr>
                </thead>
                <tbody>
                  {members.map((m) => {
                    const isOwner = currentWs?.owner === m.user?._id;
                    const isSelf = user?._id === m.user?._id;

                    return (
                      <tr key={m._id} style={{ borderBottom: '1px solid var(--border-subtle)' }}>
                        <td style={{ padding: '12px' }}>
                          <div style={{ fontWeight: 600, color: 'var(--text-primary)' }}>
                            {m.user?.name} {isSelf && '(You)'}
                          </div>
                          <div style={{ fontSize: '0.75rem', color: 'var(--text-tertiary)' }}>
                            {m.user?.email}
                          </div>
                        </td>

                        <td style={{ padding: '12px' }}>
                          {isAdmin && !isOwner ? (
                            <select
                              className="form-select"
                              style={{ width: '120px', padding: '4px 8px', fontSize: '0.8125rem' }}
                              value={m.role}
                              onChange={(e) => handleUpdateRole(m._id, e.target.value)}
                            >
                              <option value="creator">Creator</option>
                              <option value="reviewer">Reviewer</option>
                              <option value="admin">Admin</option>
                            </select>
                          ) : (
                            <span className="badge badge-neutral" style={{ textTransform: 'capitalize' }}>
                              {m.role} {isOwner && '• Owner'}
                            </span>
                          )}
                        </td>

                        <td style={{ padding: '12px' }}>
                          <span
                            style={{
                              display: 'inline-flex',
                              alignItems: 'center',
                              gap: '4px',
                              padding: '2px 8px',
                              borderRadius: 'var(--radius-full)',
                              fontSize: '0.6875rem',
                              fontWeight: 700,
                              background: '#ECFDF5',
                              color: '#047857',
                            }}
                          >
                            <CheckCircle2 size={11} /> Active
                          </span>
                        </td>

                        {isAdmin && (
                          <td style={{ padding: '12px', textAlign: 'right' }}>
                            {!isOwner && !isSelf && (
                              <button
                                onClick={() => handleRemoveMember(m._id, m.user?.name)}
                                style={{ color: 'var(--severity-high)', padding: '4px' }}
                                title="Remove Member"
                              >
                                <Trash2 size={15} />
                              </button>
                            )}
                          </td>
                        )}
                      </tr>
                    );
                  })}
                </tbody>
              </table>
            </div>
          </div>
        </div>

        {/* Right Column: Roles Matrix & Privacy Security Info */}
        <div style={{ display: 'flex', flexDirection: 'column', gap: 'var(--space-6)' }}>
          {/* Roles Permission Matrix */}
          <div className="card">
            <h3 className="card-title" style={{ fontSize: '0.9375rem', marginBottom: 'var(--space-3)' }}>
              <Shield size={16} /> Role Access Matrix
            </h3>

            <div style={{ display: 'flex', flexDirection: 'column', gap: 'var(--space-3)', fontSize: '0.8125rem' }}>
              <div style={{ padding: '8px', borderRadius: 'var(--radius-sm)', background: 'var(--bg-surface-secondary)' }}>
                <strong style={{ color: 'var(--color-primary)' }}>Creator</strong>
                <p style={{ color: 'var(--text-secondary)', marginTop: '2px', fontSize: '0.75rem' }}>
                  Write, paste, and run audits on content drafts. View findings and submit drafts for sign-off.
                </p>
              </div>

              <div style={{ padding: '8px', borderRadius: 'var(--radius-sm)', background: 'var(--bg-surface-secondary)' }}>
                <strong style={{ color: '#047857' }}>Reviewer</strong>
                <p style={{ color: 'var(--text-secondary)', marginTop: '2px', fontSize: '0.75rem' }}>
                  All Creator rights + manage brand guidelines, approved facts, approve/reject drafts, request changes.
                </p>
              </div>

              <div style={{ padding: '8px', borderRadius: 'var(--radius-sm)', background: 'var(--bg-surface-secondary)' }}>
                <strong style={{ color: '#6D28D9' }}>Administrator</strong>
                <p style={{ color: 'var(--text-secondary)', marginTop: '2px', fontSize: '0.75rem' }}>
                  Full workspace authority. Manage team memberships, roles, workspace settings, and audit logs.
                </p>
              </div>
            </div>
          </div>

          {/* Privacy & Confidentiality Guarantee */}
          <div className="card">
            <h3 className="card-title" style={{ fontSize: '0.9375rem', marginBottom: 'var(--space-2)' }}>
              <Lock size={16} /> Confidentiality Architecture
            </h3>
            <p style={{ fontSize: '0.75rem', color: 'var(--text-secondary)', lineHeight: 1.5 }}>
              INKGUARD runs deterministic rule parsing securely on your local private environment. Content drafts are evaluated strictly in-memory or persisted in workspace-isolated MongoDB collections. No confidential drafts are shared or sent externally unless an explicit AI provider key is authorized on the backend.
            </p>
          </div>
        </div>
      </div>

      {/* Add Member Modal */}
      {showAddModal && (
        <div className="modal-overlay">
          <div className="modal-content" style={{ padding: 'var(--space-6)', maxWidth: '460px' }}>
            <h3 style={{ fontSize: '1.25rem', fontWeight: 700, marginBottom: 'var(--space-2)' }}>
              Add Team Member
            </h3>
            <p style={{ fontSize: '0.875rem', color: 'var(--text-secondary)', marginBottom: 'var(--space-4)' }}>
              Grant workspace access with designated role permissions.
            </p>

            <form onSubmit={handleAddMember}>
              <div className="form-group">
                <label className="form-label">Work Email Address *</label>
                <input
                  type="email"
                  required
                  className="form-input"
                  placeholder="colleague@company.com"
                  value={newMemberEmail}
                  onChange={(e) => setNewMemberEmail(e.target.value)}
                />
              </div>

              <div className="form-group">
                <label className="form-label">Full Name (Optional)</label>
                <input
                  type="text"
                  className="form-input"
                  placeholder="First Last"
                  value={newMemberName}
                  onChange={(e) => setNewMemberName(e.target.value)}
                />
              </div>

              <div className="form-group">
                <label className="form-label">Assigned Role</label>
                <select
                  className="form-select"
                  value={newMemberRole}
                  onChange={(e) => setNewMemberRole(e.target.value)}
                >
                  <option value="creator">Creator (Draft & Audit Content)</option>
                  <option value="reviewer">Reviewer (Approve & Manage Rules)</option>
                  <option value="admin">Administrator (Full Control)</option>
                </select>
              </div>

              <div style={{ display: 'flex', justifyContent: 'flex-end', gap: 'var(--space-2)', marginTop: 'var(--space-5)' }}>
                <button type="button" className="btn btn-secondary" onClick={() => setShowAddModal(false)}>
                  Cancel
                </button>
                <button type="submit" className="btn btn-primary" disabled={inviting}>
                  {inviting ? 'Adding...' : 'Add Member'}
                </button>
              </div>
            </form>
          </div>
        </div>
      )}
    </div>
  );
}
