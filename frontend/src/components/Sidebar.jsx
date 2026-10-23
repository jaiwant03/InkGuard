import React, { useState, useEffect } from 'react';
import { NavLink, useNavigate } from 'react-router-dom';
import {
  LayoutDashboard,
  BookOpen,
  CheckCircle2,
  Image as ImageIcon,
  FileCheck2,
  ClipboardList,
  History,
  BarChart3,
  Settings,
  ChevronDown,
  Plus,
  ChevronLeft,
  ChevronRight,
  Shield,
  LogOut,
  X,
  Check,
  Building,
  Sparkles,
} from 'lucide-react';
import { useAuth } from '../context/AuthContext';
import { api } from '../services/api';
import { useToast } from '../context/ToastContext';
import { ASSET_IMAGES } from '../assets/images';

export default function Sidebar({ collapsed, onToggleCollapse, mobileOpen, onCloseMobile }) {
  const { workspace, role, user, switchWorkspace, logout } = useAuth();
  const [workspaces, setWorkspaces] = useState([]);
  const [dropdownOpen, setDropdownOpen] = useState(false);
  const [showCreateModal, setShowCreateModal] = useState(false);
  const [newWsName, setNewWsName] = useState('');
  const [newWsDesc, setNewWsDesc] = useState('');
  const [creating, setCreating] = useState(false);
  const toast = useToast();
  const navigate = useNavigate();

  useEffect(() => {
    async function loadWorkspaces() {
      try {
        const res = await api.workspaces.list();
        if (res.success && res.data) {
          setWorkspaces(res.data);
        }
      } catch (err) {
        // silent
      }
    }
    loadWorkspaces();
  }, [workspace]);

  const handleSwitch = async (wsId) => {
    try {
      await switchWorkspace(wsId);
      setDropdownOpen(false);
      toast.success('Workspace switched.');
      navigate('/');
    } catch (err) {
      toast.error('Failed to switch workspace: ' + err.message);
    }
  };

  const handleCreateWorkspace = async (e) => {
    e.preventDefault();
    if (!newWsName.trim()) return;
    try {
      setCreating(true);
      const res = await api.workspaces.create({
        name: newWsName.trim(),
        description: newWsDesc.trim(),
      });
      if (res.success) {
        toast.success(`Created "${res.data.name}"!`);
        setShowCreateModal(false);
        setNewWsName('');
        setNewWsDesc('');
        await switchWorkspace(res.data._id);
        navigate('/');
      }
    } catch (err) {
      toast.error(err.message || 'Failed to create workspace.');
    } finally {
      setCreating(false);
    }
  };

  const handleLogout = async () => {
    try {
      await logout();
      toast.info('Signed out.');
      navigate('/login');
    } catch (err) {
      toast.error('Logout error: ' + err.message);
    }
  };

  const navItems = [
    { name: 'Dashboard', path: '/', icon: LayoutDashboard, color: '#2563EB', lightBg: '#EFF6FF', end: true },
    { name: 'Brand Guidelines', path: '/guidelines', icon: BookOpen, color: '#7C3AED', lightBg: '#F5F3FF' },
    { name: 'Approved Facts', path: '/facts', icon: CheckCircle2, color: '#10B981', lightBg: '#ECFDF5' },
    { name: 'Brand Assets', path: '/assets', icon: ImageIcon, color: '#06B6D4', lightBg: '#ECFEFF' },
    { name: 'Content Review', path: '/review', icon: FileCheck2, color: '#F43F5E', lightBg: '#FFF1F2' },
    { name: 'Approval Queue', path: '/approvals', icon: ClipboardList, color: '#F59E0B', lightBg: '#FFFBEB' },
    { name: 'Review History', path: '/history', icon: History, color: '#3B82F6', lightBg: '#EFF6FF' },
    { name: 'Governance Insights', path: '/insights', icon: BarChart3, color: '#8B5CF6', lightBg: '#F5F3FF' },
    { name: 'Workspace Settings', path: '/settings', icon: Settings, color: '#64748B', lightBg: '#F1F5F9' },
  ];

  const sidebarWidth = collapsed ? '74px' : '260px';

  return (
    <>
      {/* Mobile Backdrop Overlay */}
      {mobileOpen && (
        <div
          onClick={onCloseMobile}
          style={{
            position: 'fixed',
            inset: 0,
            background: 'rgba(15, 23, 42, 0.45)',
            backdropFilter: 'blur(4px)',
            zIndex: 998,
          }}
        />
      )}

      <aside
        style={{
          width: sidebarWidth,
          background: '#FFFFFF',
          borderRight: '1px solid #E2E8F0',
          display: 'flex',
          flexDirection: 'column',
          transition: 'width 0.25s cubic-bezier(0.16, 1, 0.3, 1), transform 0.25s cubic-bezier(0.16, 1, 0.3, 1)',
          height: '100vh',
          position: 'sticky',
          top: 0,
          zIndex: 999,
          userSelect: 'none',
          boxShadow: '1px 0 10px rgba(15, 23, 42, 0.03)',
        }}
        className={mobileOpen ? 'sidebar-mobile-open' : ''}
      >
        {/* Brand Header */}
        <div
          style={{
            height: '68px',
            display: 'flex',
            alignItems: 'center',
            justifyContent: collapsed ? 'center' : 'space-between',
            padding: collapsed ? '0' : '0 18px',
            borderBottom: '1px solid #F1F5F9',
          }}
        >
          <div style={{ display: 'flex', alignItems: 'center', gap: '12px', minWidth: 0 }}>
            {/* Logo Shield */}
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

            {!collapsed && (
              <div style={{ minWidth: 0 }}>
                <span
                  style={{
                    fontSize: '1.1875rem',
                    fontWeight: 850,
                    letterSpacing: '-0.025em',
                    color: '#0F172A',
                    display: 'block',
                    lineHeight: 1.15,
                  }}
                >
                  INKGUARD
                </span>
                <span
                  style={{
                    display: 'block',
                    fontSize: '0.625rem',
                    fontWeight: 700,
                    letterSpacing: '0.06em',
                    color: '#2563EB',
                    textTransform: 'uppercase',
                  }}
                >
                  Governance Engine
                </span>
              </div>
            )}
          </div>

          {!collapsed && onToggleCollapse && (
            <button
              onClick={onToggleCollapse}
              style={{
                padding: '6px',
                borderRadius: '8px',
                color: '#64748B',
                background: 'transparent',
                border: 'none',
                cursor: 'pointer',
                display: 'flex',
                alignItems: 'center',
                transition: 'all 0.15s ease',
              }}
              title="Collapse Sidebar"
              aria-label="Collapse sidebar"
            >
              <ChevronLeft size={18} />
            </button>
          )}
        </div>

        {/* Workspace Switcher Selector */}
        {!collapsed && (
          <div style={{ padding: '14px 16px 8px 16px', position: 'relative' }}>
            <div
              onClick={() => setDropdownOpen(!dropdownOpen)}
              style={{
                padding: '8px 12px',
                borderRadius: '12px',
                background: '#F8FAFC',
                border: '1px solid #E2E8F0',
                cursor: 'pointer',
                display: 'flex',
                alignItems: 'center',
                justifyContent: 'space-between',
                transition: 'all 0.15s ease',
              }}
              title="Switch Workspace"
            >
              <div style={{ display: 'flex', alignItems: 'center', gap: '8px', minWidth: 0 }}>
                <div
                  style={{
                    width: '26px',
                    height: '26px',
                    borderRadius: '7px',
                    background: '#EFF6FF',
                    color: '#2563EB',
                    display: 'flex',
                    alignItems: 'center',
                    justifyContent: 'center',
                    flexShrink: 0,
                  }}
                >
                  <Building size={14} />
                </div>
                <div style={{ minWidth: 0 }}>
                  <span
                    style={{
                      display: 'block',
                      fontSize: '0.8125rem',
                      fontWeight: 700,
                      color: '#0F172A',
                      overflow: 'hidden',
                      textOverflow: 'ellipsis',
                      whiteSpace: 'nowrap',
                    }}
                  >
                    {workspace?.name || 'Default Workspace'}
                  </span>
                </div>
              </div>
              <ChevronDown
                size={14}
                color="#64748B"
                style={{
                  transform: dropdownOpen ? 'rotate(180deg)' : 'none',
                  transition: 'transform 0.2s',
                  flexShrink: 0,
                }}
              />
            </div>

            {/* Dropdown Menu */}
            {dropdownOpen && (
              <div
                style={{
                  position: 'absolute',
                  top: 'calc(100% - 2px)',
                  left: '16px',
                  right: '16px',
                  background: '#FFFFFF',
                  borderRadius: '14px',
                  border: '1px solid #E2E8F0',
                  boxShadow: '0 12px 32px rgba(15, 23, 42, 0.12)',
                  zIndex: 200,
                  padding: '6px',
                }}
              >
                <div style={{ maxHeight: '180px', overflowY: 'auto' }}>
                  {workspaces.map((ws) => {
                    const isSelected = ws._id === workspace?._id;
                    return (
                      <div
                        key={ws._id}
                        onClick={() => handleSwitch(ws._id)}
                        style={{
                          padding: '8px 10px',
                          borderRadius: '8px',
                          cursor: 'pointer',
                          fontSize: '0.8125rem',
                          fontWeight: isSelected ? 700 : 500,
                          color: isSelected ? '#2563EB' : '#0F172A',
                          background: isSelected ? '#EFF6FF' : 'transparent',
                          display: 'flex',
                          alignItems: 'center',
                          justifyContent: 'space-between',
                        }}
                      >
                        <span style={{ overflow: 'hidden', textOverflow: 'ellipsis', whiteSpace: 'nowrap' }}>
                          {ws.name}
                        </span>
                        {isSelected && <Check size={14} color="#2563EB" />}
                      </div>
                    );
                  })}
                </div>

                <div style={{ borderTop: '1px solid #F1F5F9', marginTop: '4px', paddingTop: '4px' }}>
                  <button
                    onClick={() => {
                      setDropdownOpen(false);
                      setShowCreateModal(true);
                    }}
                    style={{
                      width: '100%',
                      padding: '8px 10px',
                      borderRadius: '8px',
                      display: 'flex',
                      alignItems: 'center',
                      gap: '6px',
                      fontSize: '0.8125rem',
                      fontWeight: 600,
                      color: '#2563EB',
                      background: 'none',
                      border: 'none',
                      cursor: 'pointer',
                    }}
                  >
                    <Plus size={14} /> Create Workspace
                  </button>
                </div>
              </div>
            )}
          </div>
        )}

        {/* Collapsed Expand Toggle */}
        {collapsed && onToggleCollapse && (
          <div style={{ display: 'flex', justifyContent: 'center', padding: '12px 0' }}>
            <button
              onClick={onToggleCollapse}
              style={{
                padding: '6px',
                borderRadius: '8px',
                color: '#64748B',
                background: '#F8FAFC',
                border: '1px solid #E2E8F0',
                cursor: 'pointer',
                display: 'flex',
                alignItems: 'center',
              }}
              title="Expand Sidebar"
              aria-label="Expand sidebar"
            >
              <ChevronRight size={16} />
            </button>
          </div>
        )}

        {/* Main Navigation Items with Gradient Active State */}
        <nav style={{ flex: 1, padding: collapsed ? '8px 10px' : '8px 14px', overflowY: 'auto' }}>
          <div style={{ display: 'flex', flexDirection: 'column', gap: '3px' }}>
            {navItems.map((item) => {
              const Icon = item.icon;
              return (
                <NavLink
                  key={item.path}
                  to={item.path}
                  end={item.end}
                  className={({ isActive }) => `sidebar-nav-link ${isActive ? 'active' : ''}`}
                  style={({ isActive }) => ({
                    justifyContent: collapsed ? 'center' : 'flex-start',
                    padding: collapsed ? '10px 0' : '9px 12px',
                  })}
                  title={collapsed ? item.name : undefined}
                >
                  {/* Colourful Icon Box */}
                  <div
                    className="sidebar-icon-box"
                    style={{
                      width: '30px',
                      height: '30px',
                      borderRadius: '8px',
                      background: item.lightBg,
                      color: item.color,
                      display: 'flex',
                      alignItems: 'center',
                      justifyContent: 'center',
                      flexShrink: 0,
                      transition: 'all 0.18s ease',
                    }}
                  >
                    <Icon size={17} strokeWidth={2.2} />
                  </div>

                  {!collapsed && (
                    <span style={{ minWidth: 0, overflow: 'hidden', textOverflow: 'ellipsis', whiteSpace: 'nowrap' }}>
                      {item.name}
                    </span>
                  )}
                </NavLink>
              );
            })}
          </div>
        </nav>

        {/* 3D Mascot AI Governance Card */}
        {!collapsed && (
          <div style={{ padding: '0 14px 10px 14px' }}>
            <div
              style={{
                background: 'linear-gradient(135deg, rgba(37, 99, 235, 0.06) 0%, rgba(124, 58, 237, 0.08) 100%)',
                borderRadius: '16px',
                padding: '10px 12px',
                border: '1px solid rgba(191, 219, 254, 0.8)',
                display: 'flex',
                alignItems: 'center',
                gap: '10px',
              }}
            >
              <div
                style={{
                  width: '36px',
                  height: '36px',
                  borderRadius: '50%',
                  overflow: 'hidden',
                  flexShrink: 0,
                  boxShadow: '0 4px 10px rgba(37, 99, 235, 0.25)',
                  border: '1.5px solid #BFDBFE',
                  background: '#FFFFFF',
                }}
              >
                <img
                  src={ASSET_IMAGES.governanceShield}
                  alt="InkGuard Mascot"
                  style={{ width: '100%', height: '100%', objectFit: 'cover', display: 'block' }}
                />
              </div>
              <div style={{ minWidth: 0, flex: 1 }}>
                <div style={{ display: 'flex', alignItems: 'center', gap: '5px' }}>
                  <span style={{ fontSize: '0.75rem', fontWeight: 800, color: '#1E40AF', lineHeight: 1.2 }}>
                    AI Guardrails
                  </span>
                  <span
                    style={{
                      width: '6px',
                      height: '6px',
                      borderRadius: '50%',
                      background: '#10B981',
                      display: 'inline-block',
                    }}
                  />
                </div>
                <span style={{ fontSize: '0.6875rem', color: '#6366F1', fontWeight: 600 }}>
                  Deterministic Scans
                </span>
              </div>
            </div>
          </div>
        )}

        {/* User Mini Profile Footer */}
        <div
          style={{
            padding: collapsed ? '12px 0' : '12px 16px',
            borderTop: '1px solid #F1F5F9',
            display: 'flex',
            alignItems: 'center',
            gap: '10px',
            justifyContent: collapsed ? 'center' : 'space-between',
          }}
        >
          <div style={{ display: 'flex', alignItems: 'center', gap: '10px', minWidth: 0 }}>
            <div
              style={{
                width: '34px',
                height: '34px',
                borderRadius: '50%',
                background: 'linear-gradient(135deg, #2563EB 0%, #7C3AED 100%)',
                color: '#FFFFFF',
                display: 'flex',
                alignItems: 'center',
                justifyContent: 'center',
                fontSize: '0.8125rem',
                fontWeight: 700,
                flexShrink: 0,
                boxShadow: '0 2px 6px rgba(37, 99, 235, 0.25)',
              }}
            >
              {user?.name?.charAt(0).toUpperCase() || 'U'}
            </div>

            {!collapsed && (
              <div style={{ minWidth: 0 }}>
                <span
                  style={{
                    display: 'block',
                    fontSize: '0.8125rem',
                    fontWeight: 700,
                    color: '#0F172A',
                    overflow: 'hidden',
                    textOverflow: 'ellipsis',
                    whiteSpace: 'nowrap',
                    lineHeight: 1.2,
                  }}
                >
                  {user?.name || 'Authenticated User'}
                </span>
                <span
                  style={{
                    display: 'inline-block',
                    fontSize: '0.6875rem',
                    fontWeight: 600,
                    color: '#2563EB',
                    textTransform: 'capitalize',
                  }}
                >
                  {role || 'Admin'}
                </span>
              </div>
            )}
          </div>

          {!collapsed && (
            <button
              onClick={handleLogout}
              style={{
                padding: '6px',
                borderRadius: '8px',
                background: 'transparent',
                border: 'none',
                color: '#94A3B8',
                cursor: 'pointer',
                display: 'flex',
                alignItems: 'center',
                transition: 'color 0.15s ease',
              }}
              title="Sign Out"
              aria-label="Sign out"
            >
              <LogOut size={16} />
            </button>
          )}
        </div>
      </aside>

      {/* Create Workspace Modal */}
      {showCreateModal && (
        <div className="modal-overlay">
          <div className="modal-content" style={{ maxWidth: '440px', padding: '24px' }}>
            <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '16px' }}>
              <h3 style={{ fontSize: '1.125rem', fontWeight: 800, color: '#0F172A' }}>
                Create Brand Workspace
              </h3>
              <button
                onClick={() => setShowCreateModal(false)}
                style={{ background: 'none', border: 'none', cursor: 'pointer', color: '#94A3B8' }}
              >
                <X size={18} />
              </button>
            </div>

            <form onSubmit={handleCreateWorkspace}>
              <div className="form-group">
                <label className="form-label">Workspace Name *</label>
                <input
                  type="text"
                  required
                  className="form-input"
                  placeholder="e.g. Apex Global Brand"
                  value={newWsName}
                  onChange={(e) => setNewWsName(e.target.value)}
                />
              </div>

              <div className="form-group">
                <label className="form-label">Description (Optional)</label>
                <textarea
                  className="form-textarea"
                  rows={2}
                  placeholder="Brand division, subsidiary, or regional hub..."
                  value={newWsDesc}
                  onChange={(e) => setNewWsDesc(e.target.value)}
                />
              </div>

              <div style={{ display: 'flex', justifyContent: 'flex-end', gap: '8px', marginTop: '20px' }}>
                <button
                  type="button"
                  className="btn btn-secondary"
                  onClick={() => setShowCreateModal(false)}
                >
                  Cancel
                </button>
                <button
                  type="submit"
                  className="btn btn-primary"
                  disabled={creating}
                >
                  {creating ? 'Creating...' : 'Create Workspace'}
                </button>
              </div>
            </form>
          </div>
        </div>
      )}
    </>
  );
}
