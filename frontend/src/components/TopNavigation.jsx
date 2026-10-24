import React, { useState, useEffect, useRef } from 'react';
import { NavLink, Link, useNavigate, useLocation } from 'react-router-dom';
import {
  Shield,
  LayoutDashboard,
  BookOpen,
  CheckCircle2,
  Palette,
  FileText,
  Clock,
  History,
  TrendingUp,
  Settings,
  Search,
  Bell,
  ChevronDown,
  User,
  LogOut,
  Menu,
  X,
  Check,
  Building,
  Plus,
  Sparkles,
  ClipboardList,
} from 'lucide-react';
import { useAuth } from '../context/AuthContext';
import { useToast } from '../context/ToastContext';
import { api } from '../services/api';

export default function TopNavigation({ onOpenSearch, onOpenDemo }) {
  const { user, workspace, role, logout, refreshUser, switchWorkspace } = useAuth();
  const [profileOpen, setProfileOpen] = useState(false);
  const [workspaceOpen, setWorkspaceOpen] = useState(false);
  const [notifOpen, setNotifOpen] = useState(false);
  const [mobileMenuOpen, setMobileMenuOpen] = useState(false);

  const [workspacesList, setWorkspacesList] = useState([]);
  const [auditEvents, setAuditEvents] = useState([]);

  // Create Workspace Modal State
  const [showCreateWsModal, setShowCreateWsModal] = useState(false);
  const [newWsName, setNewWsName] = useState('');
  const [newWsDesc, setNewWsDesc] = useState('');
  const [creatingWs, setCreatingWs] = useState(false);

  // Edit Profile Modal State
  const [showEditProfile, setShowEditProfile] = useState(false);
  const [editName, setEditName] = useState(user?.name || '');
  const [savingProfile, setSavingProfile] = useState(false);

  const toast = useToast();
  const navigate = useNavigate();
  const location = useLocation();

  const profileRef = useRef(null);
  const workspaceRef = useRef(null);
  const notifRef = useRef(null);

  // Close dropdowns on click outside
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
        // Non-blocking
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
      window.location.reload();
    } catch (err) {
      toast.error('Could not switch workspace: ' + err.message);
    }
  };

  const handleCreateWorkspace = async (e) => {
    e.preventDefault();
    if (!newWsName.trim()) return;
    try {
      setCreatingWs(true);
      const res = await api.workspaces.create({
        name: newWsName.trim(),
        description: newWsDesc.trim(),
      });
      if (res.success) {
        toast.success(`Created workspace "${res.data.name}"!`);
        setShowCreateWsModal(false);
        setNewWsName('');
        setNewWsDesc('');
        await switchWorkspace(res.data._id);
        navigate('/');
      }
    } catch (err) {
      toast.error(err.message || 'Failed to create workspace.');
    } finally {
      setCreatingWs(false);
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

  const getInitials = (name) => {
    if (!name) return 'U';
    const parts = name.trim().split(' ');
    if (parts.length >= 2) {
      return (parts[0][0] + parts[1][0]).toUpperCase();
    }
    return name.slice(0, 2).toUpperCase();
  };

  // The 6 Essential Core Brand Governance Pillars
  const navTabs = [
    { label: 'Dashboard', path: '/', icon: LayoutDashboard, color: '#2563EB', lightBg: '#EFF6FF', end: true },
    { label: 'Brand Guidelines', path: '/guidelines', icon: BookOpen, color: '#7C3AED', lightBg: '#F5F3FF' },
    { label: 'Approved Facts', path: '/facts', icon: CheckCircle2, color: '#10B981', lightBg: '#ECFDF5' },
    { label: 'Content Review', path: '/review', icon: FileText, color: '#F43F5E', lightBg: '#FFF1F2' },
    { label: 'Approval Queue', path: '/approvals', icon: ClipboardList, color: '#F59E0B', lightBg: '#FFFBEB' },
    { label: 'Review History', path: '/history', icon: History, color: '#3B82F6', lightBg: '#EFF6FF' },
  ];

  return (
    <>
      <header className="top-nav">
        {/* ===================================================================
            TIER 1: Brand Identity, Workspace Switcher, Global Controls
            =================================================================== */}
        <div className="top-nav-tier-primary">
          <div className="top-nav-tier-primary-inner">
            {/* LEFT: Brand Logo + Workspace Selector + Governance Status */}
            <div style={{ display: 'flex', alignItems: 'center', gap: '16px' }}>
              {/* Brand Logo */}
              <Link
                to="/"
                style={{
                  display: 'flex',
                  alignItems: 'center',
                  gap: '12px',
                  textDecoration: 'none',
                }}
              >
                <div
                  style={{
                    width: '36px',
                    height: '36px',
                    borderRadius: '11px',
                    background: 'linear-gradient(135deg, #2563EB 0%, #7C3AED 100%)',
                    display: 'flex',
                    alignItems: 'center',
                    justifyContent: 'center',
                    boxShadow: '0 4px 14px rgba(37, 99, 235, 0.32)',
                    flexShrink: 0,
                  }}
                >
                  <Shield size={20} color="#FFFFFF" strokeWidth={2.3} />
                </div>
                <div style={{ display: 'flex', flexDirection: 'column' }}>
                  <div style={{ display: 'flex', alignItems: 'center', gap: '8px' }}>
                    <span
                      style={{
                        fontSize: '1.1875rem',
                        fontWeight: 850,
                        letterSpacing: '-0.025em',
                        color: '#0F172A',
                        lineHeight: 1.1,
                      }}
                    >
                      INKGUARD
                    </span>
                    <span
                      style={{
                        fontSize: '0.625rem',
                        fontWeight: 700,
                        padding: '1.5px 6px',
                        borderRadius: '999px',
                        background: '#EFF6FF',
                        color: '#2563EB',
                        border: '1px solid #BFDBFE',
                        textTransform: 'uppercase',
                        letterSpacing: '0.04em',
                      }}
                    >
                      Engine
                    </span>
                  </div>
                  <span
                    style={{
                      fontSize: '0.625rem',
                      fontWeight: 600,
                      color: '#64748B',
                      letterSpacing: '0.04em',
                      textTransform: 'uppercase',
                      marginTop: '1px',
                    }}
                  >
                    AI Brand Governance
                  </span>
                </div>
              </Link>

              {/* Subtle Divider */}
              <div style={{ width: '1px', height: '26px', background: '#E2E8F0', margin: '0 4px' }} className="top-nav-desktop-only" />

              {/* Workspace Switcher Dropdown */}
              <div style={{ position: 'relative' }} ref={workspaceRef} className="top-nav-desktop-only">
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
                    gap: '8px',
                    padding: '6px 12px',
                    borderRadius: '12px',
                    fontSize: '0.8125rem',
                    fontWeight: 600,
                    maxWidth: '220px',
                    background: '#FFFFFF',
                    border: '1px solid #E2E8F0',
                  }}
                  title="Switch or manage active workspace"
                >
                  <div
                    className="icon-tile icon-tile-blue"
                    style={{ width: '22px', height: '22px', borderRadius: '6px' }}
                  >
                    <Building size={12} strokeWidth={2.4} />
                  </div>
                  <span
                    style={{
                      overflow: 'hidden',
                      textOverflow: 'ellipsis',
                      whiteSpace: 'nowrap',
                      color: '#0F172A',
                    }}
                  >
                    {workspace?.name || 'Workspace'}
                  </span>
                  <ChevronDown size={14} color="#64748B" />
                </button>

                {/* Workspace Dropdown Panel */}
                {workspaceOpen && (
                  <div
                    style={{
                      position: 'absolute',
                      top: 'calc(100% + 8px)',
                      left: 0,
                      width: '280px',
                      background: '#FFFFFF',
                      borderRadius: '16px',
                      border: '1px solid #E2E8F0',
                      boxShadow: '0 16px 36px -6px rgba(15, 23, 42, 0.12), 0 0 0 1px rgba(0,0,0,0.02)',
                      padding: '8px',
                      zIndex: 220,
                    }}
                  >
                    <div
                      style={{
                        padding: '6px 10px 8px 10px',
                        fontSize: '0.6875rem',
                        fontWeight: 700,
                        textTransform: 'uppercase',
                        color: '#64748B',
                        borderBottom: '1px solid #F1F5F9',
                        marginBottom: '6px',
                        letterSpacing: '0.04em',
                      }}
                    >
                      Available Workspaces
                    </div>

                    <div style={{ display: 'flex', flexDirection: 'column', gap: '3px', maxHeight: '220px', overflowY: 'auto' }}>
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
                                borderRadius: '10px',
                                background: isCurrent ? '#EFF6FF' : 'transparent',
                                cursor: 'pointer',
                                fontSize: '0.8125rem',
                                fontWeight: isCurrent ? 700 : 500,
                                color: isCurrent ? '#2563EB' : '#0F172A',
                                transition: 'background 0.15s ease',
                              }}
                            >
                              <div style={{ minWidth: 0, paddingRight: '8px' }}>
                                <div style={{ overflow: 'hidden', textOverflow: 'ellipsis', whiteSpace: 'nowrap' }}>
                                  {ws.name}
                                </div>
                                <div style={{ fontSize: '0.6875rem', color: '#64748B' }}>
                                  {ws.role ? `Role: ${ws.role}` : 'Workspace Member'}
                                </div>
                              </div>
                              {isCurrent && <Check size={14} color="#2563EB" />}
                            </div>
                          );
                        })
                      ) : (
                        <div style={{ padding: '8px 10px', fontSize: '0.8125rem', color: '#64748B' }}>
                          {workspace?.name || 'Active Workspace'}
                        </div>
                      )}
                    </div>

                    <div style={{ borderTop: '1px solid #F1F5F9', marginTop: '6px', paddingTop: '6px', display: 'flex', flexDirection: 'column', gap: '2px' }}>
                      <button
                        type="button"
                        onClick={() => {
                          setWorkspaceOpen(false);
                          setShowCreateWsModal(true);
                        }}
                        style={{
                          width: '100%',
                          display: 'flex',
                          alignItems: 'center',
                          gap: '8px',
                          padding: '8px 10px',
                          borderRadius: '10px',
                          fontSize: '0.8125rem',
                          fontWeight: 600,
                          color: '#2563EB',
                          background: '#EFF6FF',
                          border: 'none',
                          cursor: 'pointer',
                          textAlign: 'left',
                        }}
                      >
                        <Plus size={14} />
                        <span>Create New Workspace</span>
                      </button>

                      <Link
                        to="/settings"
                        onClick={() => setWorkspaceOpen(false)}
                        style={{
                          display: 'flex',
                          alignItems: 'center',
                          gap: '8px',
                          padding: '8px 10px',
                          borderRadius: '10px',
                          fontSize: '0.8125rem',
                          color: '#475569',
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

              {/* AI Governance Active Pill */}
              <div
                className="top-nav-desktop-only"
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
              </div>
            </div>

            {/* RIGHT: Live Demo, Search, Notifications, User Profile & Mobile Toggle */}
            <div style={{ display: 'flex', alignItems: 'center', gap: '10px' }}>
              {/* Live Interactive Demo Button */}
              <button
                type="button"
                onClick={onOpenDemo}
                className="top-nav-btn"
                style={{
                  display: 'flex',
                  alignItems: 'center',
                  gap: '6px',
                  padding: '6px 14px',
                  fontSize: '0.8125rem',
                  fontWeight: 700,
                  color: '#2563EB',
                  borderRadius: '12px',
                  border: '1px solid #BFDBFE',
                  background: 'linear-gradient(135deg, #EFF6FF 0%, #EEF2FF 100%)',
                  boxShadow: '0 2px 6px rgba(37, 99, 235, 0.08)',
                }}
                title="View live input and output demonstration scenarios"
              >
                <Sparkles size={14} color="#2563EB" />
                <span>Live Demo</span>
              </button>

              {/* Global Search Button */}
              <button
                type="button"
                onClick={onOpenSearch}
                className="top-nav-btn"
                style={{
                  display: 'flex',
                  alignItems: 'center',
                  gap: '8px',
                  padding: '6px 14px',
                  fontSize: '0.8125rem',
                  color: '#64748B',
                  borderRadius: '12px',
                  border: '1px solid #E2E8F0',
                  background: '#F8FAFC',
                }}
                title="Search across content, rules, and facts (⌘K)"
              >
                <Search size={15} color="#64748B" />
                <span className="search-btn-label">Search governance...</span>
                <kbd
                  style={{
                    background: '#FFFFFF',
                    border: '1px solid #E2E8F0',
                    borderRadius: '6px',
                    padding: '1px 6px',
                    fontSize: '0.6875rem',
                    fontWeight: 700,
                    color: '#64748B',
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
                  style={{
                    width: '38px',
                    height: '38px',
                    borderRadius: '12px',
                    position: 'relative',
                    border: '1px solid #E2E8F0',
                  }}
                  aria-label="Notifications"
                  title="Audit Trail & Notifications"
                >
                  <Bell size={17} color="#475569" />
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
                      borderRadius: '16px',
                      border: '1px solid #E2E8F0',
                      boxShadow: '0 16px 36px -6px rgba(15, 23, 42, 0.12)',
                      padding: '14px',
                      zIndex: 220,
                    }}
                  >
                    <div
                      style={{
                        display: 'flex',
                        justifyContent: 'space-between',
                        alignItems: 'center',
                        marginBottom: '10px',
                        paddingBottom: '8px',
                        borderBottom: '1px solid #F1F5F9',
                      }}
                    >
                      <span style={{ fontSize: '0.875rem', fontWeight: 700, color: '#0F172A' }}>
                        Governance Activity
                      </span>
                      <span
                        style={{
                          fontSize: '0.6875rem',
                          fontWeight: 700,
                          padding: '2px 8px',
                          borderRadius: '999px',
                          background: '#EFF6FF',
                          color: '#2563EB',
                        }}
                      >
                        Audit Trail Active
                      </span>
                    </div>

                    <div style={{ display: 'flex', flexDirection: 'column', gap: '6px', maxHeight: '260px', overflowY: 'auto' }}>
                      {auditEvents.length > 0 ? (
                        auditEvents.map((evt) => (
                          <div
                            key={evt._id}
                            style={{
                              padding: '8px 10px',
                              borderRadius: '10px',
                              background: '#F8FAFC',
                              fontSize: '0.8125rem',
                              border: '1px solid #F1F5F9',
                            }}
                          >
                            <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'baseline' }}>
                              <span style={{ fontWeight: 600, color: '#0F172A' }}>
                                {evt.action?.replace(/_/g, ' ') || 'Activity Logged'}
                              </span>
                              <span style={{ fontSize: '0.6875rem', color: '#64748B' }}>
                                {new Date(evt.createdAt).toLocaleDateString([], { month: 'short', day: 'numeric' })}
                              </span>
                            </div>
                            <div style={{ color: '#64748B', fontSize: '0.75rem', marginTop: '2px' }}>
                              {evt.details?.title || evt.details?.name || evt.actor?.name || 'Workspace event recorded'}
                            </div>
                          </div>
                        ))
                      ) : (
                        <div style={{ padding: '20px', textAlign: 'center', color: '#64748B', fontSize: '0.8125rem' }}>
                          No recent governance activities.
                        </div>
                      )}
                    </div>

                    <div style={{ borderTop: '1px solid #F1F5F9', marginTop: '10px', paddingTop: '8px' }}>
                      <Link
                        to="/history"
                        onClick={() => setNotifOpen(false)}
                        style={{
                          display: 'block',
                          textAlign: 'center',
                          fontSize: '0.8125rem',
                          fontWeight: 700,
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

              {/* User Profile Pill & Dropdown */}
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
                    padding: '4px 10px 4px 4px',
                    borderRadius: '12px',
                    border: '1px solid #E2E8F0',
                    background: '#FFFFFF',
                  }}
                  aria-label="User profile menu"
                >
                  <div
                    style={{
                      width: '30px',
                      height: '30px',
                      borderRadius: '8px',
                      background: 'linear-gradient(135deg, #2563EB 0%, #7C3AED 100%)',
                      color: '#FFFFFF',
                      display: 'flex',
                      alignItems: 'center',
                      justifyContent: 'center',
                      fontWeight: 700,
                      fontSize: '0.75rem',
                      letterSpacing: '0.02em',
                      boxShadow: '0 2px 6px rgba(37, 99, 235, 0.25)',
                    }}
                  >
                    {getInitials(user?.name)}
                  </div>
                  <div style={{ textAlign: 'left', lineHeight: 1.15 }} className="top-nav-desktop-only">
                    <div style={{ fontSize: '0.75rem', fontWeight: 700, color: '#0F172A', maxWidth: '110px', overflow: 'hidden', textOverflow: 'ellipsis', whiteSpace: 'nowrap' }}>
                      {user?.name ? user.name.split(' ')[0] : 'Admin'}
                    </div>
                    <div style={{ fontSize: '0.625rem', color: '#64748B', fontWeight: 600 }}>
                      {role || 'Admin'}
                    </div>
                  </div>
                  <ChevronDown size={13} color="#64748B" />
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
                      borderRadius: '16px',
                      border: '1px solid #E2E8F0',
                      boxShadow: '0 16px 36px -6px rgba(15, 23, 42, 0.12)',
                      padding: '10px',
                      zIndex: 220,
                    }}
                  >
                    <div style={{ padding: '6px 8px 10px 8px', borderBottom: '1px solid #F1F5F9' }}>
                      <div style={{ fontWeight: 700, fontSize: '0.875rem', color: '#0F172A' }}>
                        {user?.name || 'Administrator'}
                      </div>
                      <div style={{ fontSize: '0.75rem', color: '#64748B', marginTop: '2px' }}>
                        {user?.email || 'admin@acme.corp'}
                      </div>
                      <div style={{ marginTop: '6px' }}>
                        <span
                          style={{
                            fontSize: '0.6875rem',
                            fontWeight: 700,
                            padding: '2px 8px',
                            borderRadius: '999px',
                            background: '#EFF6FF',
                            color: '#2563EB',
                            border: '1px solid #BFDBFE',
                          }}
                        >
                          Role: {role || 'Admin'}
                        </span>
                      </div>
                    </div>

                    <div style={{ padding: '6px 0', display: 'flex', flexDirection: 'column', gap: '2px' }}>
                      <button
                        type="button"
                        onClick={() => {
                          setShowEditProfile(true);
                          setProfileOpen(false);
                        }}
                        style={{
                          width: '100%',
                          display: 'flex',
                          alignItems: 'center',
                          gap: '8px',
                          padding: '8px 10px',
                          borderRadius: '8px',
                          fontSize: '0.8125rem',
                          color: '#0F172A',
                          background: 'transparent',
                          border: 'none',
                          cursor: 'pointer',
                          textAlign: 'left',
                        }}
                      >
                        <User size={15} color="#64748B" /> Edit Profile
                      </button>

                      <Link
                        to="/settings"
                        onClick={() => setProfileOpen(false)}
                        style={{
                          display: 'flex',
                          alignItems: 'center',
                          gap: '8px',
                          padding: '8px 10px',
                          borderRadius: '8px',
                          fontSize: '0.8125rem',
                          color: '#0F172A',
                          textDecoration: 'none',
                        }}
                      >
                        <Settings size={15} color="#64748B" /> Workspace Settings
                      </Link>

                      <Link
                        to="/history"
                        onClick={() => setProfileOpen(false)}
                        style={{
                          display: 'flex',
                          alignItems: 'center',
                          gap: '8px',
                          padding: '8px 10px',
                          borderRadius: '8px',
                          fontSize: '0.8125rem',
                          color: '#0F172A',
                          textDecoration: 'none',
                        }}
                      >
                        <History size={15} color="#64748B" /> Audit Trail
                      </Link>
                    </div>

                    <div style={{ borderTop: '1px solid #F1F5F9', paddingTop: '6px' }}>
                      <button
                        type="button"
                        onClick={handleLogout}
                        style={{
                          width: '100%',
                          display: 'flex',
                          alignItems: 'center',
                          gap: '8px',
                          padding: '8px 10px',
                          borderRadius: '8px',
                          fontSize: '0.8125rem',
                          color: '#E11D48',
                          background: 'transparent',
                          border: 'none',
                          cursor: 'pointer',
                          fontWeight: 600,
                        }}
                      >
                        <LogOut size={15} /> Sign Out
                      </button>
                    </div>
                  </div>
                )}
              </div>

              {/* Mobile Hamburger Toggle Button */}
              <button
                type="button"
                onClick={() => setMobileMenuOpen(!mobileMenuOpen)}
                className="top-nav-btn top-nav-btn-icon mobile-menu-toggle"
                style={{ width: '38px', height: '38px', borderRadius: '12px' }}
                aria-label="Toggle navigation menu"
              >
                {mobileMenuOpen ? <X size={20} /> : <Menu size={20} />}
              </button>
            </div>
          </div>
        </div>

        {/* ===================================================================
            TIER 2: Horizontal Navigation Tabs with Gradient Active State
            =================================================================== */}
        <div className="top-nav-tier-secondary">
          <div className="top-nav-tier-secondary-inner">
            {navTabs.map((tab) => {
              const IconComponent = tab.icon;
              return (
                <NavLink
                  key={tab.path}
                  to={tab.path}
                  end={tab.end}
                  className={({ isActive }) => `top-nav-tab ${isActive ? 'active' : ''}`}
                >
                  <span className="top-nav-tab-icon">
                    <IconComponent size={15} strokeWidth={2.2} />
                  </span>
                  <span>{tab.label}</span>
                </NavLink>
              );
            })}
          </div>
        </div>

        {/* Mobile Navigation Drawer */}
        {mobileMenuOpen && (
          <div
            className="mobile-nav-drawer"
            style={{
              padding: '16px',
              background: '#FFFFFF',
              borderTop: '1px solid #E2E8F0',
              boxShadow: '0 12px 28px rgba(15, 23, 42, 0.1)',
            }}
          >
            <div style={{ display: 'flex', flexDirection: 'column', gap: '4px' }}>
              {navTabs.map((tab) => {
                const IconComponent = tab.icon;
                return (
                  <NavLink
                    key={tab.path}
                    to={tab.path}
                    end={tab.end}
                    className={({ isActive }) => `top-nav-tab ${isActive ? 'active' : ''}`}
                    style={{ width: '100%', justifyContent: 'flex-start', padding: '10px 14px' }}
                    onClick={() => setMobileMenuOpen(false)}
                  >
                    <span className="top-nav-tab-icon">
                      <IconComponent size={16} strokeWidth={2.2} />
                    </span>
                    <span>{tab.label}</span>
                  </NavLink>
                );
              })}
              <div style={{ height: '1px', background: '#E2E8F0', margin: '6px 0' }} />
              <NavLink
                to="/settings"
                className={({ isActive }) => `top-nav-tab ${isActive ? 'active' : ''}`}
                style={{ width: '100%', justifyContent: 'flex-start', padding: '10px 14px' }}
                onClick={() => setMobileMenuOpen(false)}
              >
                <span className="top-nav-tab-icon">
                  <Settings size={16} strokeWidth={2.2} />
                </span>
                <span>Workspace Settings</span>
              </NavLink>
            </div>
          </div>
        )}
      </header>

      {/* ===================================================================
          MODAL: Create New Workspace
          =================================================================== */}
      {showCreateWsModal && (
        <div className="modal-overlay" style={{ zIndex: 1100 }}>
          <div className="modal-content glass-card" style={{ maxWidth: '440px', padding: '28px' }}>
            <h3 style={{ fontSize: '1.25rem', fontWeight: 800, color: '#0F172A', marginBottom: '8px' }}>
              Create New Workspace
            </h3>
            <p style={{ fontSize: '0.8125rem', color: '#64748B', marginBottom: '20px' }}>
              Establish a dedicated environment for brand governance, guidelines, and deterministic scans.
            </p>

            <form onSubmit={handleCreateWorkspace}>
              <div className="form-group">
                <label className="form-label" style={{ fontWeight: 600 }}>Workspace Name</label>
                <input
                  type="text"
                  className="form-input"
                  required
                  placeholder="e.g. Acme Enterprise"
                  value={newWsName}
                  onChange={(e) => setNewWsName(e.target.value)}
                  autoFocus
                />
              </div>

              <div className="form-group">
                <label className="form-label" style={{ fontWeight: 600 }}>Description (Optional)</label>
                <input
                  type="text"
                  className="form-input"
                  placeholder="e.g. Global Marketing & PR"
                  value={newWsDesc}
                  onChange={(e) => setNewWsDesc(e.target.value)}
                />
              </div>

              <div style={{ display: 'flex', justifyContent: 'flex-end', gap: '10px', marginTop: '24px' }}>
                <button
                  type="button"
                  className="btn btn-secondary"
                  onClick={() => setShowCreateWsModal(false)}
                >
                  Cancel
                </button>
                <button
                  type="submit"
                  className="btn btn-gradient-primary"
                  disabled={creatingWs}
                >
                  {creatingWs ? 'Creating...' : 'Create Workspace'}
                </button>
              </div>
            </form>
          </div>
        </div>
      )}

      {/* ===================================================================
          MODAL: Edit User Profile
          =================================================================== */}
      {showEditProfile && (
        <div className="modal-overlay" style={{ zIndex: 1100 }}>
          <div className="modal-content glass-card" style={{ maxWidth: '440px', padding: '28px' }}>
            <h3 style={{ fontSize: '1.25rem', fontWeight: 800, color: '#0F172A', marginBottom: '8px' }}>
              Edit User Profile
            </h3>
            <p style={{ fontSize: '0.8125rem', color: '#64748B', marginBottom: '20px' }}>
              Update your display name across all INKGUARD brand reviews and audit trails.
            </p>

            <form onSubmit={handleSaveProfile}>
              <div className="form-group">
                <label className="form-label" style={{ fontWeight: 600 }}>Full Name</label>
                <input
                  type="text"
                  className="form-input"
                  required
                  value={editName}
                  onChange={(e) => setEditName(e.target.value)}
                />
              </div>

              <div className="form-group">
                <label className="form-label" style={{ fontWeight: 600 }}>Email Address (Read-only)</label>
                <input
                  type="text"
                  className="form-input"
                  value={user?.email || ''}
                  disabled
                  style={{ background: '#F8FAFC', color: '#64748B' }}
                />
              </div>

              <div style={{ display: 'flex', justifyContent: 'flex-end', gap: '10px', marginTop: '24px' }}>
                <button
                  type="button"
                  className="btn btn-secondary"
                  onClick={() => setShowEditProfile(false)}
                >
                  Cancel
                </button>
                <button
                  type="submit"
                  className="btn btn-gradient-primary"
                  disabled={savingProfile}
                >
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
