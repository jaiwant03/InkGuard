import React, { useState, useEffect, useRef } from 'react';
import { NavLink, Link, useNavigate, useLocation } from 'react-router-dom';
import {
  Shield,
  Search,
  Bell,
  ChevronDown,
  User,
  Settings,
  History,
  FolderOpen,
  LogOut,
  Menu,
  X,
  Check,
  Building,
  Sparkles,
  ExternalLink,
} from 'lucide-react';
import { useAuth } from '../context/AuthContext';
import { useToast } from '../context/ToastContext';
import { api } from '../services/api';

export default function TopNavigation({ onOpenSearch, onToggleMobileSidebar, isSidebarLayout = false }) {
  const { user, workspace, role, logout, refreshUser, switchWorkspace } = useAuth();
  const [profileOpen, setProfileOpen] = useState(false);
  const [workspaceOpen, setWorkspaceOpen] = useState(false);
  const [notifOpen, setNotifOpen] = useState(false);
  const [mobileMenuOpen, setMobileMenuOpen] = useState(false);

  const [workspacesList, setWorkspacesList] = useState([]);
  const [auditEvents, setAuditEvents] = useState([]);
  const [showEditProfile, setShowEditProfile] = useState(false);
  const [editName, setEditName] = useState(user?.name || '');
  const [savingProfile, setSavingProfile] = useState(false);

  const toast = useToast();
  const navigate = useNavigate();
  const location = useLocation();

  const profileRef = useRef(null);
  const workspaceRef = useRef(null);
  const notifRef = useRef(null);

  // Close dropdowns on outside click
  useEffect(() => {
    const handleOutsideClick = (e) => {
      if (profileRef.current && !profileRef.current.contains(e.target)) {
        setProfileOpen(false);
      }
      if (workspaceRef.current && !workspaceRef.current.contains(e.target)) {
        setWorkspaceOpen(false);
      }
      if (notifRef.current && !notifRef.current.contains(e.target)) {
        setNotifOpen(false);
      }
    };
    document.addEventListener('mousedown', handleOutsideClick);
    return () => document.removeEventListener('mousedown', handleOutsideClick);
  }, []);

  // Close mobile menu on route change
  useEffect(() => {
    setMobileMenuOpen(false);
  }, [location.pathname]);

  // Load workspaces
  useEffect(() => {
    let mounted = true;
    async function loadWorkspaces() {
      try {
        const res = await api.workspaces.list();
        if (mounted && res.success && res.data) {
          setWorkspacesList(res.data);
        }
      } catch (err) {
        // Silent fail or non-blocking
      }
    }
    loadWorkspaces();
    return () => {
      mounted = false;
    };
  }, [workspace?._id]);

  // Load notifications (recent audit events)
  useEffect(() => {
    let mounted = true;
    async function loadAudit() {
      try {
        const res = await api.audit.list({ limit: 6 });
        if (mounted && res.success && res.data) {
          setAuditEvents(res.data);
        }
      } catch (err) {
        // Non-blocking
      }
    }
    loadAudit();
    return () => {
      mounted = false;
    };
  }, [workspace?._id]);

  const handleSwitchWorkspace = async (targetId) => {
    if (targetId === workspace?._id) {
      setWorkspaceOpen(false);
      return;
    }
    try {
      await switchWorkspace(targetId);
      setWorkspaceOpen(false);
      toast.success('Switched active workspace.');
      window.location.reload(); // Refresh state cleanly
    } catch (err) {
      toast.error('Could not switch workspace: ' + err.message);
    }
  };

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

  // User initials helper
  const getInitials = (name) => {
    if (!name) return 'U';
    const parts = name.trim().split(' ');
    if (parts.length >= 2) {
      return (parts[0][0] + parts[1][0]).toUpperCase();
    }
    return name.slice(0, 2).toUpperCase();
  };

  const navItems = [
    { label: 'Dashboard', path: '/', end: true },
    { label: 'Brand Guidelines', path: '/guidelines' },
    { label: 'Approved Facts', path: '/facts' },
    { label: 'Content Review', path: '/review' },
    { label: 'Approval Queue', path: '/approvals' },
    { label: 'Governance Insights', path: '/insights' },
  ];

  return (
    <>
      <header className="top-nav">
        <div className="top-nav-inner">
          {/* LEFT: Mobile toggle & Brand / Breadcrumb */}
          <div style={{ display: 'flex', alignItems: 'center', gap: '12px' }}>
            {isSidebarLayout && (
              <button
                type="button"
                onClick={onToggleMobileSidebar}
                className="top-nav-btn top-nav-btn-icon mobile-menu-toggle"
                style={{ display: 'none' }}
                aria-label="Toggle Sidebar Navigation"
              >
                <Menu size={20} />
              </button>
            )}

            {!isSidebarLayout ? (
              <div className="top-nav-brand">
                <Link to="/" style={{ display: 'flex', alignItems: 'center', gap: '10px', textDecoration: 'none' }}>
                  <div
                    style={{
                      width: '36px',
                      height: '36px',
                      borderRadius: '10px',
                      background: 'linear-gradient(135deg, #2563EB, #7C3AED)',
                      display: 'flex',
                      alignItems: 'center',
                      justifyContent: 'center',
                      boxShadow: '0 4px 12px rgba(37, 99, 235, 0.25)',
                      flexShrink: 0,
                    }}
                  >
                    <Shield size={20} color="#FFFFFF" strokeWidth={2.2} />
                  </div>
                  <div style={{ display: 'flex', flexDirection: 'column' }}>
                    <span
                      style={{
                        fontSize: '1.125rem',
                        fontWeight: 800,
                        letterSpacing: '-0.02em',
                        color: '#0F172A',
                        lineHeight: 1.15,
                      }}
                    >
                      INKGUARD
                    </span>
                    <span
                      style={{
                        fontSize: '0.625rem',
                        fontWeight: 600,
                        letterSpacing: '0.04em',
                        color: '#64748B',
                        textTransform: 'uppercase',
                      }}
                    >
                      Brand Governance Platform
                    </span>
                  </div>
                </Link>
              </div>
            ) : (
              <div style={{ display: 'flex', alignItems: 'center', gap: '8px' }}>
                <span
                  style={{
                    display: 'inline-flex',
                    alignItems: 'center',
                    gap: '6px',
                    padding: '4px 10px',
                    borderRadius: '999px',
                    background: '#ECFDF5',
                    color: '#059669',
                    fontSize: '0.75rem',
                    fontWeight: 600,
                    border: '1px solid #A7F3D0',
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
                  AI Governance Active
                </span>
              </div>
            )}
          </div>

          {/* CENTER: Main Horizontal Navigation Links (Only shown when not in sidebar layout) */}
          {!isSidebarLayout && (
            <nav className="top-nav-links" aria-label="Main Navigation">
              {navItems.map((item) => (
                <NavLink
                  key={item.path}
                  to={item.path}
                  end={item.end}
                  className={({ isActive }) => `top-nav-link ${isActive ? 'active' : ''}`}
                >
                  {item.label}
                </NavLink>
              ))}
            </nav>
          )}

          {/* RIGHT: Actions, Search, Notifications, Avatar */}
          <div className="top-nav-actions">
            {/* Workspace Selector Dropdown */}
            <div style={{ position: 'relative' }} ref={workspaceRef}>
              <button
                type="button"
                onClick={() => {
                  setWorkspaceOpen(!workspaceOpen);
                  setProfileOpen(false);
                  setNotifOpen(false);
                }}
                className="top-nav-btn"
                style={{
                  display: 'flex',
                  alignItems: 'center',
                  gap: '6px',
                  padding: '6px 10px',
                  fontSize: '0.8125rem',
                  fontWeight: 600,
                  maxWidth: '180px',
                }}
                title="Current Workspace"
              >
                <Building size={14} color="#2563EB" />
                <span
                  style={{
                    overflow: 'hidden',
                    textOverflow: 'ellipsis',
                    whiteSpace: 'nowrap',
                    color: 'var(--text-primary)',
                  }}
                >
                  {workspace?.name || 'Default Workspace'}
                </span>
                <ChevronDown size={14} color="var(--text-tertiary)" />
              </button>

              {workspaceOpen && (
                <div
                  style={{
                    position: 'absolute',
                    top: 'calc(100% + 8px)',
                    right: 0,
                    width: '260px',
                    background: '#FFFFFF',
                    borderRadius: 'var(--radius-xl)',
                    border: '1px solid var(--border-light)',
                    boxShadow: 'var(--shadow-dropdown)',
                    padding: '8px',
                    zIndex: 200,
                  }}
                >
                  <div
                    style={{
                      padding: '6px 10px 8px 10px',
                      fontSize: '0.6875rem',
                      fontWeight: 700,
                      textTransform: 'uppercase',
                      color: 'var(--text-tertiary)',
                      borderBottom: '1px solid var(--border-subtle)',
                      marginBottom: '6px',
                    }}
                  >
                    Select Workspace
                  </div>

                  <div style={{ display: 'flex', flexDirection: 'column', gap: '3px' }}>
                    {workspacesList.length > 0 ? (
                      workspacesList.map((ws) => {
                        const isCurrent = ws._id === workspace?._id;
                        return (
                          <div
                            key={ws._id}
                            onClick={() => handleSwitchWorkspace(ws._id)}
                            style={{
                              display: 'flex',
                              alignItems: 'center',
                              justifyContent: 'space-between',
                              padding: '8px 10px',
                              borderRadius: 'var(--radius-md)',
                              background: isCurrent ? '#EFF6FF' : 'transparent',
                              cursor: 'pointer',
                              fontSize: '0.8125rem',
                              fontWeight: isCurrent ? 700 : 500,
                              color: isCurrent ? '#2563EB' : 'var(--text-primary)',
                            }}
                          >
                            <div style={{ minWidth: 0, paddingRight: '8px' }}>
                              <div style={{ overflow: 'hidden', textOverflow: 'ellipsis', whiteSpace: 'nowrap' }}>
                                {ws.name}
                              </div>
                              <div style={{ fontSize: '0.6875rem', color: 'var(--text-tertiary)' }}>
                                Role: {ws.role || 'Member'}
                              </div>
                            </div>
                            {isCurrent && <Check size={14} color="#2563EB" />}
                          </div>
                        );
                      })
                    ) : (
                      <div style={{ padding: '8px', fontSize: '0.8125rem', color: 'var(--text-secondary)' }}>
                        {workspace?.name || 'Active Workspace'}
                      </div>
                    )}
                  </div>

                  <div style={{ borderTop: '1px solid var(--border-subtle)', marginTop: '6px', paddingTop: '6px' }}>
                    <Link
                      to="/settings"
                      onClick={() => setWorkspaceOpen(false)}
                      style={{
                        display: 'flex',
                        alignItems: 'center',
                        gap: '8px',
                        padding: '8px 10px',
                        borderRadius: 'var(--radius-md)',
                        fontSize: '0.8125rem',
                        color: 'var(--text-secondary)',
                        textDecoration: 'none',
                      }}
                    >
                      <Settings size={14} />
                      <span>Workspace Settings</span>
                    </Link>
                  </div>
                </div>
              )}
            </div>

            {/* Functional Search Trigger Button */}
            <button
              type="button"
              onClick={onOpenSearch}
              className="top-nav-btn"
              style={{
                display: 'flex',
                alignItems: 'center',
                gap: '8px',
                padding: '6px 12px',
                fontSize: '0.8125rem',
                color: 'var(--text-secondary)',
              }}
              title="Search across content, rules, and facts (⌘K)"
            >
              <Search size={15} color="var(--text-tertiary)" />
              <span className="search-btn-label">Search...</span>
              <kbd
                style={{
                  background: 'var(--bg-surface-secondary)',
                  border: '1px solid var(--border-light)',
                  borderRadius: 'var(--radius-sm)',
                  padding: '1px 5px',
                  fontSize: '0.6875rem',
                  fontWeight: 600,
                  color: 'var(--text-tertiary)',
                }}
              >
                ⌘K
              </kbd>
            </button>

            {/* Notifications Dropdown */}
            <div style={{ position: 'relative' }} ref={notifRef}>
              <button
                type="button"
                onClick={() => {
                  setNotifOpen(!notifOpen);
                  setProfileOpen(false);
                  setWorkspaceOpen(false);
                }}
                className="top-nav-btn top-nav-btn-icon"
                aria-label="Notifications"
                title="Audit Trail & Notifications"
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
                    background: '#2563EB',
                    boxShadow: '0 0 0 2px #FFFFFF',
                  }}
                />
              </button>

              {notifOpen && (
                <div
                  style={{
                    position: 'absolute',
                    top: 'calc(100% + 8px)',
                    right: 0,
                    width: '340px',
                    background: '#FFFFFF',
                    borderRadius: 'var(--radius-xl)',
                    border: '1px solid var(--border-light)',
                    boxShadow: 'var(--shadow-dropdown)',
                    padding: '12px',
                    zIndex: 200,
                  }}
                >
                  <div
                    style={{
                      display: 'flex',
                      justifyContent: 'space-between',
                      alignItems: 'center',
                      marginBottom: '10px',
                      paddingBottom: '8px',
                      borderBottom: '1px solid var(--border-light)',
                    }}
                  >
                    <span style={{ fontSize: '0.875rem', fontWeight: 700, color: 'var(--text-primary)' }}>
                      Governance Activity
                    </span>
                    <span
                      style={{
                        fontSize: '0.6875rem',
                        fontWeight: 600,
                        padding: '2px 8px',
                        borderRadius: 'var(--radius-full)',
                        background: '#EFF6FF',
                        color: '#2563EB',
                      }}
                    >
                      Audit Trail Active
                    </span>
                  </div>

                  <div style={{ display: 'flex', flexDirection: 'column', gap: '6px', maxHeight: '280px', overflowY: 'auto' }}>
                    {auditEvents.length > 0 ? (
                      auditEvents.map((evt) => (
                        <div
                          key={evt._id}
                          style={{
                            padding: '8px 10px',
                            borderRadius: 'var(--radius-md)',
                            background: 'var(--bg-surface-secondary)',
                            fontSize: '0.8125rem',
                          }}
                        >
                          <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'baseline' }}>
                            <span style={{ fontWeight: 600, color: 'var(--text-primary)' }}>
                              {evt.action?.replace(/_/g, ' ') || 'Activity Logged'}
                            </span>
                            <span style={{ fontSize: '0.6875rem', color: 'var(--text-tertiary)' }}>
                              {new Date(evt.createdAt).toLocaleDateString([], { month: 'short', day: 'numeric' })}
                            </span>
                          </div>
                          <div style={{ color: 'var(--text-secondary)', fontSize: '0.75rem', marginTop: '2px' }}>
                            {evt.details?.title || evt.details?.name || evt.actor?.name || 'Workspace event recorded'}
                          </div>
                        </div>
                      ))
                    ) : (
                      <div style={{ padding: '16px', textAlign: 'center', color: 'var(--text-tertiary)', fontSize: '0.8125rem' }}>
                        No recent governance activities.
                      </div>
                    )}
                  </div>

                  <div style={{ borderTop: '1px solid var(--border-light)', marginTop: '8px', paddingTop: '8px' }}>
                    <Link
                      to="/history"
                      onClick={() => setNotifOpen(false)}
                      style={{
                        display: 'block',
                        textAlign: 'center',
                        fontSize: '0.8125rem',
                        fontWeight: 600,
                        color: '#2563EB',
                        textDecoration: 'none',
                        padding: '4px',
                      }}
                    >
                      View Complete Audit History →
                    </Link>
                  </div>
                </div>
              )}
            </div>

            {/* User Profile Avatar with Initials */}
            <div style={{ position: 'relative' }} ref={profileRef}>
              <button
                type="button"
                onClick={() => {
                  setProfileOpen(!profileOpen);
                  setWorkspaceOpen(false);
                  setNotifOpen(false);
                }}
                className="top-nav-btn"
                style={{
                  display: 'flex',
                  alignItems: 'center',
                  gap: '8px',
                  padding: '3px 8px 3px 3px',
                  borderRadius: 'var(--radius-full)',
                }}
                aria-label="User profile menu"
              >
                <div
                  style={{
                    width: '32px',
                    height: '32px',
                    borderRadius: 'var(--radius-full)',
                    background: 'linear-gradient(135deg, #1E40AF, #3B82F6)',
                    color: '#FFFFFF',
                    display: 'flex',
                    alignItems: 'center',
                    justifyContent: 'center',
                    fontWeight: 700,
                    fontSize: '0.8125rem',
                    letterSpacing: '0.02em',
                  }}
                >
                  {getInitials(user?.name)}
                </div>
                <ChevronDown size={14} color="var(--text-tertiary)" />
              </button>

              {/* Profile Dropdown */}
              {profileOpen && (
                <div
                  style={{
                    position: 'absolute',
                    top: 'calc(100% + 8px)',
                    right: 0,
                    width: '240px',
                    background: '#FFFFFF',
                    borderRadius: 'var(--radius-xl)',
                    border: '1px solid var(--border-light)',
                    boxShadow: 'var(--shadow-dropdown)',
                    padding: '8px',
                    zIndex: 200,
                  }}
                >
                  <div
                    style={{
                      padding: '8px 10px',
                      borderBottom: '1px solid var(--border-subtle)',
                      marginBottom: '4px',
                    }}
                  >
                    <div style={{ fontSize: '0.875rem', fontWeight: 700, color: 'var(--text-primary)' }}>
                      {user?.name || 'Authorized User'}
                    </div>
                    <div
                      style={{
                        fontSize: '0.75rem',
                        color: 'var(--text-tertiary)',
                        overflow: 'hidden',
                        textOverflow: 'ellipsis',
                      }}
                    >
                      {user?.email}
                    </div>
                    <div style={{ marginTop: '6px' }}>
                      <span
                        style={{
                          display: 'inline-block',
                          fontSize: '0.6875rem',
                          fontWeight: 600,
                          textTransform: 'capitalize',
                          padding: '2px 8px',
                          borderRadius: 'var(--radius-full)',
                          background: '#EFF6FF',
                          color: '#2563EB',
                        }}
                      >
                        {role || 'creator'}
                      </span>
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
                      borderRadius: 'var(--radius-md)',
                      fontSize: '0.8125rem',
                      fontWeight: 500,
                      color: 'var(--text-secondary)',
                      background: 'none',
                      border: 'none',
                      cursor: 'pointer',
                      textAlign: 'left',
                    }}
                  >
                    <User size={15} /> Edit Profile
                  </button>

                  <Link
                    to="/assets"
                    onClick={() => setProfileOpen(false)}
                    style={{
                      padding: '8px 10px',
                      display: 'flex',
                      alignItems: 'center',
                      gap: '8px',
                      borderRadius: 'var(--radius-md)',
                      fontSize: '0.8125rem',
                      fontWeight: 500,
                      color: 'var(--text-secondary)',
                      textDecoration: 'none',
                    }}
                  >
                    <FolderOpen size={15} /> Brand Asset Library
                  </Link>

                  <Link
                    to="/history"
                    onClick={() => setProfileOpen(false)}
                    style={{
                      padding: '8px 10px',
                      display: 'flex',
                      alignItems: 'center',
                      gap: '8px',
                      borderRadius: 'var(--radius-md)',
                      fontSize: '0.8125rem',
                      fontWeight: 500,
                      color: 'var(--text-secondary)',
                      textDecoration: 'none',
                    }}
                  >
                    <History size={15} /> Review History
                  </Link>

                  <Link
                    to="/settings"
                    onClick={() => setProfileOpen(false)}
                    style={{
                      padding: '8px 10px',
                      display: 'flex',
                      alignItems: 'center',
                      gap: '8px',
                      borderRadius: 'var(--radius-md)',
                      fontSize: '0.8125rem',
                      fontWeight: 500,
                      color: 'var(--text-secondary)',
                      textDecoration: 'none',
                    }}
                  >
                    <Settings size={15} /> Workspace Settings
                  </Link>

                  <div style={{ borderTop: '1px solid var(--border-subtle)', marginTop: '4px', paddingTop: '4px' }}>
                    <button
                      onClick={handleLogout}
                      style={{
                        width: '100%',
                        padding: '8px 10px',
                        display: 'flex',
                        alignItems: 'center',
                        gap: '8px',
                        borderRadius: 'var(--radius-md)',
                        fontSize: '0.8125rem',
                        fontWeight: 600,
                        color: 'var(--severity-high)',
                        background: 'none',
                        border: 'none',
                        cursor: 'pointer',
                        textAlign: 'left',
                      }}
                    >
                      <LogOut size={15} /> Sign Out
                    </button>
                  </div>
                </div>
              )}
            </div>

            {/* Mobile Hamburger Menu Toggle */}
            <button
              type="button"
              onClick={() => setMobileMenuOpen(!mobileMenuOpen)}
              className="top-nav-btn top-nav-btn-icon mobile-menu-toggle"
              aria-label="Toggle navigation menu"
            >
              {mobileMenuOpen ? <X size={20} /> : <Menu size={20} />}
            </button>
          </div>
        </div>

        {/* Mobile Collapsible Navigation Menu */}
        {mobileMenuOpen && (
          <div
            className="mobile-nav-drawer"
            style={{
              padding: '16px',
              background: '#FFFFFF',
              borderTop: '1px solid var(--border-light)',
              boxShadow: 'var(--shadow-md)',
            }}
          >
            <div style={{ display: 'flex', flexDirection: 'column', gap: '6px' }}>
              {navItems.map((item) => (
                <NavLink
                  key={item.path}
                  to={item.path}
                  end={item.end}
                  className={({ isActive }) => `top-nav-link ${isActive ? 'active' : ''}`}
                  style={{ width: '100%', justifyContent: 'flex-start' }}
                  onClick={() => setMobileMenuOpen(false)}
                >
                  {item.label}
                </NavLink>
              ))}
              <div style={{ borderTop: '1px solid var(--border-light)', margin: '8px 0', paddingTop: '8px' }}>
                <Link
                  to="/settings"
                  onClick={() => setMobileMenuOpen(false)}
                  style={{
                    display: 'flex',
                    alignItems: 'center',
                    gap: '8px',
                    padding: '8px 12px',
                    fontSize: '0.875rem',
                    color: 'var(--text-secondary)',
                    textDecoration: 'none',
                  }}
                >
                  <Settings size={16} /> Workspace Settings
                </Link>
                <Link
                  to="/history"
                  onClick={() => setMobileMenuOpen(false)}
                  style={{
                    display: 'flex',
                    alignItems: 'center',
                    gap: '8px',
                    padding: '8px 12px',
                    fontSize: '0.875rem',
                    color: 'var(--text-secondary)',
                    textDecoration: 'none',
                  }}
                >
                  <History size={16} /> Audit History
                </Link>
              </div>
            </div>
          </div>
        )}
      </header>

      {/* Edit Profile Modal */}
      {showEditProfile && (
        <div className="modal-overlay" style={{ zIndex: 1100 }}>
          <div className="modal-content" style={{ padding: 'var(--space-6)' }}>
            <h3 style={{ fontSize: '1.25rem', fontWeight: 700, marginBottom: 'var(--space-2)' }}>Edit User Profile</h3>
            <p style={{ fontSize: '0.875rem', color: 'var(--text-secondary)', marginBottom: 'var(--space-4)' }}>
              Update your display name across all INKGUARD brand reviews and audit trails.
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
                <input
                  type="text"
                  className="form-input"
                  value={user?.email || ''}
                  disabled
                  style={{ background: 'var(--bg-surface-secondary)' }}
                />
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
