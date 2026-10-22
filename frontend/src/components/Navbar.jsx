import React, { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import {
  Bell,
  Search,
  Plus,
  LogOut,
  User,
  Shield,
  Sparkles,
  ExternalLink,
  ChevronDown,
  CheckCircle,
} from 'lucide-react';
import { useAuth } from '../context/AuthContext';
import { useToast } from '../context/ToastContext';
import { api } from '../services/api';

export default function Navbar({ pageTitle = 'Dashboard' }) {
  const { user, workspace, role, logout, refreshUser } = useAuth();
  const [profileOpen, setProfileOpen] = useState(false);
  const [notifOpen, setNotifOpen] = useState(false);
  const [showEditProfile, setShowEditProfile] = useState(false);
  const [editName, setEditName] = useState(user?.name || '');
  const [savingProfile, setSavingProfile] = useState(false);
  const toast = useToast();
  const navigate = useNavigate();

  const handleLogout = async () => {
    try {
      await logout();
      toast.info('Signed out successfully.');
      navigate('/login');
    } catch (err) {
      toast.error('Logout failed: ' + err.message);
    }
  };

  const handleSaveProfile = async (e) => {
    e.preventDefault();
    if (!editName.trim()) return;
    try {
      setSavingProfile(true);
      const res = await api.auth.updateProfile({ name: editName.trim() });
      if (res.success) {
        toast.success('Profile updated.');
        setShowEditProfile(false);
        refreshUser();
      }
    } catch (err) {
      toast.error('Update failed: ' + err.message);
    } finally {
      setSavingProfile(false);
    }
  };

  return (
    <>
      <header
        style={{
          height: 'var(--topbar-height)',
          background: 'var(--bg-surface)',
          borderBottom: '1px solid var(--border-light)',
          padding: '0 var(--space-8)',
          display: 'flex',
          alignItems: 'center',
          justifyContent: 'space-between',
          position: 'sticky',
          top: 0,
          zIndex: 90,
        }}
      >
        {/* Left: Breadcrumb & Title */}
        <div style={{ display: 'flex', alignItems: 'center', gap: 'var(--space-3)' }}>
          <h2 style={{ fontSize: '1.25rem', fontWeight: 700, color: 'var(--text-primary)' }}>
            {pageTitle}
          </h2>
          <div
            style={{
              display: 'inline-flex',
              alignItems: 'center',
              gap: '6px',
              padding: '3px 10px',
              borderRadius: 'var(--radius-full)',
              background: 'var(--color-primary-light)',
              color: 'var(--color-primary)',
              fontSize: '0.75rem',
              fontWeight: 600,
            }}
          >
            <Shield size={12} />
            <span>Deterministic Rule Engine Active</span>
          </div>
        </div>

        {/* Right: Actions, Notifications, User Profile */}
        <div style={{ display: 'flex', alignItems: 'center', gap: 'var(--space-4)' }}>
          {/* Reference UI Action Button matching Screenshot */}
          <button
            onClick={() => navigate('/review')}
            className="btn btn-primary btn-sm"
            style={{
              display: 'flex',
              alignItems: 'center',
              gap: '6px',
              background: '#2563EB',
              borderRadius: 'var(--radius-md)',
              boxShadow: '0 4px 14px rgba(37, 99, 235, 0.35)',
              fontWeight: 700,
              padding: '6px 14px',
            }}
            title="Instant Brand Compliance Engine"
          >
            <Sparkles size={14} />
            <span>Dolorow</span>
          </button>

          {/* Notifications Dropdown */}
          <div style={{ position: 'relative' }}>
            <button
              onClick={() => {
                setNotifOpen(!notifOpen);
                setProfileOpen(false);
              }}
              style={{
                width: '38px',
                height: '38px',
                borderRadius: 'var(--radius-md)',
                display: 'flex',
                alignItems: 'center',
                justifyContent: 'center',
                color: 'var(--text-secondary)',
                border: '1px solid var(--border-light)',
                position: 'relative',
              }}
              aria-label="Notifications"
            >
              <Bell size={18} />
              <span
                style={{
                  position: 'absolute',
                  top: '8px',
                  right: '8px',
                  width: '7px',
                  height: '7px',
                  borderRadius: '50%',
                  background: 'var(--color-primary)',
                }}
              />
            </button>

            {notifOpen && (
              <div
                style={{
                  position: 'absolute',
                  top: '120%',
                  right: 0,
                  width: '320px',
                  background: 'var(--bg-surface)',
                  borderRadius: 'var(--radius-xl)',
                  border: '1px solid var(--border-light)',
                  boxShadow: 'var(--shadow-dropdown)',
                  padding: 'var(--space-4)',
                  zIndex: 200,
                }}
              >
                <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: 'var(--space-3)' }}>
                  <span style={{ fontSize: '0.875rem', fontWeight: 700 }}>Governance Notifications</span>
                  <span style={{ fontSize: '0.6875rem', color: 'var(--color-primary)', fontWeight: 600 }}>Active</span>
                </div>
                <div style={{ display: 'flex', flexDirection: 'column', gap: 'var(--space-2)' }}>
                  <div style={{ padding: '8px', borderRadius: 'var(--radius-md)', background: 'var(--bg-surface-secondary)', fontSize: '0.8125rem' }}>
                    <div style={{ fontWeight: 600, color: 'var(--text-primary)' }}>Audit Engine Initialized</div>
                    <div style={{ color: 'var(--text-tertiary)', fontSize: '0.75rem' }}>Active rules loaded for {workspace?.name}.</div>
                  </div>
                  <div style={{ padding: '8px', borderRadius: 'var(--radius-md)', background: 'var(--bg-surface-secondary)', fontSize: '0.8125rem' }}>
                    <div style={{ fontWeight: 600, color: 'var(--text-primary)' }}>Fact Verification Watcher</div>
                    <div style={{ color: 'var(--text-tertiary)', fontSize: '0.75rem' }}>1 expired fact flagged for refresh.</div>
                  </div>
                </div>
              </div>
            )}
          </div>

          {/* User Profile Trigger */}
          <div style={{ position: 'relative' }}>
            <div
              onClick={() => {
                setProfileOpen(!profileOpen);
                setNotifOpen(false);
              }}
              style={{
                display: 'flex',
                alignItems: 'center',
                gap: '8px',
                padding: '4px 8px',
                borderRadius: 'var(--radius-lg)',
                border: '1px solid var(--border-light)',
                cursor: 'pointer',
              }}
            >
              <div
                style={{
                  width: '30px',
                  height: '30px',
                  borderRadius: 'var(--radius-full)',
                  background: 'linear-gradient(135deg, #2563EB, #4F46E5)',
                  color: '#FFFFFF',
                  display: 'flex',
                  alignItems: 'center',
                  justifyContent: 'center',
                  fontWeight: 700,
                  fontSize: '0.8125rem',
                }}
              >
                {user?.name?.charAt(0) || 'U'}
              </div>
              <div style={{ display: 'flex', flexDirection: 'column', textAlign: 'left' }}>
                <span style={{ fontSize: '0.8125rem', fontWeight: 600, color: 'var(--text-primary)', lineHeight: 1.2 }}>
                  {user?.name}
                </span>
                <span style={{ fontSize: '0.6875rem', color: 'var(--text-tertiary)', textTransform: 'capitalize' }}>
                  {role || 'creator'}
                </span>
              </div>
              <ChevronDown size={14} color="var(--text-tertiary)" />
            </div>

            {/* Profile Dropdown */}
            {profileOpen && (
              <div
                style={{
                  position: 'absolute',
                  top: '120%',
                  right: 0,
                  width: '240px',
                  background: 'var(--bg-surface)',
                  borderRadius: 'var(--radius-xl)',
                  border: '1px solid var(--border-light)',
                  boxShadow: 'var(--shadow-dropdown)',
                  padding: '6px',
                  zIndex: 200,
                }}
              >
                <div style={{ padding: '8px 10px', borderBottom: '1px solid var(--border-subtle)', marginBottom: '4px' }}>
                  <div style={{ fontSize: '0.8125rem', fontWeight: 700, color: 'var(--text-primary)' }}>{user?.name}</div>
                  <div style={{ fontSize: '0.75rem', color: 'var(--text-tertiary)', overflow: 'hidden', textOverflow: 'ellipsis' }}>
                    {user?.email}
                  </div>
                </div>

                <button
                  onClick={() => {
                    setProfileOpen(false);
                    setEditName(user?.name || '');
                    setShowEditProfile(true);
                  }}
                  style={{
                    width: '100%',
                    padding: '8px 10px',
                    display: 'flex',
                    alignItems: 'center',
                    gap: '8px',
                    borderRadius: 'var(--radius-sm)',
                    fontSize: '0.8125rem',
                    fontWeight: 500,
                    color: 'var(--text-secondary)',
                    textAlign: 'left',
                  }}
                >
                  <User size={15} /> Edit Profile
                </button>

                <button
                  onClick={handleLogout}
                  style={{
                    width: '100%',
                    padding: '8px 10px',
                    display: 'flex',
                    alignItems: 'center',
                    gap: '8px',
                    borderRadius: 'var(--radius-sm)',
                    fontSize: '0.8125rem',
                    fontWeight: 500,
                    color: 'var(--severity-high)',
                    textAlign: 'left',
                    marginTop: '2px',
                  }}
                >
                  <LogOut size={15} /> Sign Out
                </button>
              </div>
            )}
          </div>
        </div>
      </header>

      {/* Edit Profile Modal */}
      {showEditProfile && (
        <div className="modal-overlay">
          <div className="modal-content" style={{ padding: 'var(--space-6)' }}>
            <h3 style={{ fontSize: '1.25rem', fontWeight: 700, marginBottom: 'var(--space-2)' }}>Edit User Profile</h3>
            <p style={{ fontSize: '0.875rem', color: 'var(--text-secondary)', marginBottom: 'var(--space-4)' }}>
              Update your display name. Email address is managed by the workspace administrator.
            </p>

            <form onSubmit={handleSaveProfile}>
              <div className="form-group">
                <label className="form-label">Full Name</label>
                <input
                  type="text"
                  className="form-input"
                  required
                  value={editName}
                  onChange={(e) => setEditName(e.target.value)}
                />
              </div>

              <div className="form-group">
                <label className="form-label">Email Address (Read-only)</label>
                <input type="text" className="form-input" value={user?.email || ''} disabled style={{ background: 'var(--bg-surface-secondary)' }} />
              </div>

              <div style={{ display: 'flex', justifyContent: 'flex-end', gap: 'var(--space-2)', marginTop: 'var(--space-5)' }}>
                <button type="button" className="btn btn-secondary" onClick={() => setShowEditProfile(false)}>
                  Cancel
                </button>
                <button type="submit" className="btn btn-primary" disabled={savingProfile}>
                  {savingProfile ? 'Saving...' : 'Save Changes'}
                </button>
              </div>
            </form>
          </div>
        </div>
      )}
    </>
  );
}
