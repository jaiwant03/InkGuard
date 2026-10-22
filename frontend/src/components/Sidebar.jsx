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
  ShieldAlert,
} from 'lucide-react';
import { useAuth } from '../context/AuthContext';
import { api } from '../services/api';
import { useToast } from '../context/ToastContext';

export default function Sidebar({ collapsed, onToggleCollapse, mobileOpen, onCloseMobile }) {
  const { workspace, role, user, switchWorkspace } = useAuth();
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
        if (res.success) {
          setWorkspaces(res.data);
        }
      } catch (err) {
        // silent load
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

  const navItems = [
    { name: 'Dashboard', path: '/', icon: LayoutDashboard },
    { name: 'Brand Guidelines', path: '/guidelines', icon: BookOpen },
    { name: 'Approved Facts', path: '/facts', icon: CheckCircle2 },
    { name: 'Brand Assets', path: '/assets', icon: ImageIcon },
    { name: 'Content Review', path: '/review', icon: FileCheck2 },
    { name: 'Approval Queue', path: '/approvals', icon: ClipboardList },
    { name: 'Review History', path: '/history', icon: History },
    { name: 'Governance Insights', path: '/insights', icon: BarChart3 },
    { name: 'Workspace Settings', path: '/settings', icon: Settings },
  ];

  const sidebarWidth = collapsed ? 'var(--sidebar-collapsed-width)' : 'var(--sidebar-width)';

  return (
    <>
      <aside
        style={{
          width: sidebarWidth,
          background: 'var(--bg-surface)',
          borderRight: '1px solid var(--border-light)',
          display: 'flex',
          flexDirection: 'column',
          transition: 'width var(--transition-normal)',
          height: '100vh',
          position: 'sticky',
          top: 0,
          zIndex: 100,
          userSelect: 'none',
        }}
      >
        {/* Brand Header */}
        <div
          style={{
            height: 'var(--topbar-height)',
            display: 'flex',
            alignItems: 'center',
            justifyContent: collapsed ? 'center' : 'space-between',
            padding: collapsed ? '0' : '0 var(--space-5)',
            borderBottom: '1px solid var(--border-subtle)',
          }}
        >
          <div style={{ display: 'flex', alignItems: 'center', gap: 'var(--space-3)' }}>
            {/* Logo Shield */}
            <div
              style={{
                width: '36px',
                height: '36px',
                borderRadius: 'var(--radius-md)',
                background: 'var(--gradient-primary)',
                display: 'flex',
                alignItems: 'center',
                justifyContent: 'center',
                boxShadow: '0 4px 12px rgba(37, 99, 235, 0.3)',
                flexShrink: 0,
              }}
            >
              <svg viewBox="0 0 100 100" width="22" height="22">
                <path d="M 50,10 L 85,25 C 85,65 65,85 50,95 C 35,85 15,65 15,25 Z" fill="none" stroke="#FFFFFF" strokeWidth="10" />
                <path d="M 35,50 L 46,62 L 68,36" fill="none" stroke="#FFFFFF" strokeWidth="10" strokeLinecap="round" strokeLinejoin="round" />
              </svg>
            </div>

            {!collapsed && (
              <div>
                <span style={{ fontSize: '1.1875rem', fontWeight: 800, letterSpacing: '-0.02em', color: 'var(--text-primary)' }}>
                  INKGUARD
                </span>
                <span
                  style={{
                    display: 'block',
                    fontSize: '0.625rem',
                    fontWeight: 700,
                    letterSpacing: '0.08em',
                    color: 'var(--color-primary)',
                    textTransform: 'uppercase',
                    marginTop: '-2px',
                  }}
                >
                  Governance Platform
                </span>
              </div>
            )}
          </div>

          {!collapsed && (
            <button
              onClick={onToggleCollapse}
              style={{
                padding: '6px',
                borderRadius: 'var(--radius-sm)',
                color: 'var(--text-tertiary)',
                display: 'flex',
                alignItems: 'center',
              }}
              aria-label="Collapse sidebar"
            >
              <ChevronLeft size={18} />
            </button>
          )}
        </div>

        {/* Workspace Switcher Selector */}
        {!collapsed && (
          <div style={{ padding: 'var(--space-4) var(--space-5)', position: 'relative' }}>
            <div
              onClick={() => setDropdownOpen(!dropdownOpen)}
              style={{
                padding: '10px 12px',
                borderRadius: 'var(--radius-lg)',
                background: 'var(--bg-surface-secondary)',
                border: '1px solid var(--border-light)',
                cursor: 'pointer',
                display: 'flex',
                alignItems: 'center',
                justifyContent: 'space-between',
              }}
            >
              <div style={{ minWidth: 0 }}>
                <span style={{ display: 'block', fontSize: '0.6875rem', color: 'var(--text-tertiary)', fontWeight: 600, textTransform: 'uppercase' }}>
                  Workspace
                </span>
                <span
                  style={{
                    display: 'block',
                    fontSize: '0.875rem',
                    fontWeight: 700,
                    color: 'var(--text-primary)',
                    overflow: 'hidden',
                    textOverflow: 'ellipsis',
                    whiteSpace: 'nowrap',
                  }}
                >
                  {workspace?.name || 'Default Workspace'}
                </span>
              </div>
              <ChevronDown size={16} color="var(--text-tertiary)" style={{ transform: dropdownOpen ? 'rotate(180deg)' : 'none', transition: 'transform 0.2s' }} />
            </div>

            {/* Dropdown menu */}
            {dropdownOpen && (
              <div
                style={{
                  position: 'absolute',
                  top: 'calc(100% - 8px)',
                  left: 'var(--space-5)',
                  right: 'var(--space-5)',
                  background: 'var(--bg-surface)',
                  borderRadius: 'var(--radius-lg)',
                  border: '1px solid var(--border-light)',
                  boxShadow: 'var(--shadow-dropdown)',
                  zIndex: 200,
                  padding: '6px',
                }}
              >
                <div style={{ maxHeight: '180px', overflowY: 'auto' }}>
                  {workspaces.map((ws) => (
                    <div
                      key={ws._id}
                      onClick={() => handleSwitch(ws._id)}
                      style={{
                        padding: '8px 10px',
                        borderRadius: 'var(--radius-sm)',
                        cursor: 'pointer',
                        fontSize: '0.8125rem',
                        fontWeight: 600,
                        color: ws._id === workspace?._id ? 'var(--color-primary)' : 'var(--text-primary)',
                        background: ws._id === workspace?._id ? 'var(--color-primary-light)' : 'transparent',
                        display: 'flex',
                        alignItems: 'center',
                        justifyContent: 'space-between',
                      }}
                    >
                      <span style={{ overflow: 'hidden', textOverflow: 'ellipsis', whiteSpace: 'nowrap' }}>{ws.name}</span>
                      <span style={{ fontSize: '0.6875rem', color: 'var(--text-tertiary)', textTransform: 'capitalize' }}>{ws.role}</span>
                    </div>
                  ))}
                </div>

                <div style={{ borderTop: '1px solid var(--border-subtle)', marginTop: '4px', paddingTop: '4px' }}>
                  <button
                    onClick={() => {
                      setDropdownOpen(false);
                      setShowCreateModal(true);
                    }}
                    style={{
                      width: '100%',
                      padding: '8px 10px',
                      borderRadius: 'var(--radius-sm)',
                      display: 'flex',
                      alignItems: 'center',
                      gap: '6px',
                      fontSize: '0.8125rem',
                      fontWeight: 600,
                      color: 'var(--color-primary)',
                    }}
                  >
                    <Plus size={14} /> Create Workspace
                  </button>
                </div>
              </div>
            )}
          </div>
        )}

        {/* Collapsed expand toggle button */}
        {collapsed && (
          <div style={{ display: 'flex', justifyContent: 'center', padding: 'var(--space-3) 0' }}>
            <button
              onClick={onToggleCollapse}
              style={{
                padding: '6px',
                borderRadius: 'var(--radius-sm)',
                color: 'var(--text-tertiary)',
                display: 'flex',
                alignItems: 'center',
              }}
              aria-label="Expand sidebar"
            >
              <ChevronRight size={18} />
            </button>
          </div>
        )}

        {/* Navigation Items */}
        <nav style={{ flex: 1, padding: collapsed ? 'var(--space-2)' : '0 var(--space-4)', overflowY: 'auto' }}>
          <div style={{ display: 'flex', flexDirection: 'column', gap: '3px' }}>
            {navItems.map((item) => {
              const Icon = item.icon;
              return (
                <NavLink
                  key={item.path}
                  to={item.path}
                  style={({ isActive }) => ({
                    display: 'flex',
                    alignItems: 'center',
                    gap: collapsed ? '0' : 'var(--space-3)',
                    justifyContent: collapsed ? 'center' : 'flex-start',
                    padding: collapsed ? '12px 0' : '10px 14px',
                    borderRadius: 'var(--radius-md)',
                    fontSize: '0.875rem',
                    fontWeight: isActive ? 600 : 500,
                    color: isActive ? 'var(--color-primary)' : 'var(--text-secondary)',
                    background: isActive ? 'var(--color-primary-light)' : 'transparent',
                    transition: 'all var(--transition-fast)',
                    textDecoration: 'none',
                  })}
                  title={collapsed ? item.name : undefined}
                >
                  <Icon size={19} />
                  {!collapsed && <span>{item.name}</span>}
                </NavLink>
              );
            })}
          </div>
        </nav>

        {/* User Mini Profile Footer */}
        <div
          style={{
            padding: collapsed ? 'var(--space-3) 0' : 'var(--space-4) var(--space-5)',
            borderTop: '1px solid var(--border-subtle)',
            display: 'flex',
            alignItems: 'center',
            gap: 'var(--space-3)',
            justifyContent: collapsed ? 'center' : 'flex-start',
          }}
        >
          <div
            style={{
              width: '34px',
              height: '34px',
              borderRadius: 'var(--radius-full)',
              background: 'linear-gradient(135deg, #4F46E5, #06B6D4)',
              color: '#FFFFFF',
              display: 'flex',
              alignItems: 'center',
              justifyContent: 'center',
              fontSize: '0.875rem',
              fontWeight: 700,
              flexShrink: 0,
            }}
          >
            {user?.name?.charAt(0) || 'U'}
          </div>

          {!collapsed && (
            <div style={{ minWidth: 0, flex: 1 }}>
              <span
                style={{
                  display: 'block',
                  fontSize: '0.8125rem',
                  fontWeight: 600,
                  color: 'var(--text-primary)',
                  overflow: 'hidden',
                  textOverflow: 'ellipsis',
                  whiteSpace: 'nowrap',
                }}
              >
                {user?.name}
              </span>
              <span
                style={{
                  display: 'inline-block',
                  fontSize: '0.6875rem',
                  fontWeight: 600,
                  color: 'var(--color-primary)',
                  textTransform: 'capitalize',
                  background: 'var(--color-primary-light)',
                  padding: '1px 6px',
                  borderRadius: 'var(--radius-sm)',
                }}
              >
                {role || 'creator'}
              </span>
            </div>
          )}
        </div>
      </aside>

      {/* Create Workspace Modal */}
      {showCreateModal && (
        <div className="modal-overlay">
          <div className="modal-content" style={{ padding: 'var(--space-6)' }}>
            <h3 style={{ fontSize: '1.25rem', fontWeight: 700, marginBottom: 'var(--space-2)' }}>Create Brand Workspace</h3>
            <p style={{ fontSize: '0.875rem', color: 'var(--text-secondary)', marginBottom: 'var(--space-4)' }}>
              Organize dedicated guidelines, rules, approved facts, and content reviews.
            </p>

            <form onSubmit={handleCreateWorkspace}>
              <div className="form-group">
                <label className="form-label">Workspace Name *</label>
                <input
                  type="text"
                  className="form-input"
                  required
                  placeholder="e.g. Apex Enterprise Communications"
                  value={newWsName}
                  onChange={(e) => setNewWsName(e.target.value)}
                />
              </div>

              <div className="form-group">
                <label className="form-label">Description (Optional)</label>
                <textarea
                  className="form-textarea"
                  rows={3}
                  placeholder="Brand mission, focus, and target departments..."
                  value={newWsDesc}
                  onChange={(e) => setNewWsDesc(e.target.value)}
                />
              </div>

              <div style={{ display: 'flex', justifyContent: 'flex-end', gap: 'var(--space-2)', marginTop: 'var(--space-4)' }}>
                <button type="button" className="btn btn-secondary" onClick={() => setShowCreateModal(false)}>
                  Cancel
                </button>
                <button type="submit" className="btn btn-primary" disabled={creating}>
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
