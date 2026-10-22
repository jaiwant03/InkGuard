import React, { useState } from 'react';
import { Outlet, useLocation } from 'react-router-dom';
import Sidebar from '../components/Sidebar';
import Navbar from '../components/Navbar';

export default function AppLayout() {
  const [collapsed, setCollapsed] = useState(false);
  const location = useLocation();

  const getPageTitle = (pathname) => {
    if (pathname === '/' || pathname === '/dashboard') return 'Dashboard';
    if (pathname.startsWith('/guidelines')) return 'Brand Guidelines & Identity';
    if (pathname.startsWith('/facts')) return 'Approved Facts & Sources';
    if (pathname.startsWith('/assets')) return 'Brand Asset Library';
    if (pathname.startsWith('/review')) return 'Content Review Studio';
    if (pathname.startsWith('/approvals')) return 'Human Approval Queue';
    if (pathname.startsWith('/history')) return 'Review History & Audit Trail';
    if (pathname.startsWith('/insights')) return 'Governance Insights & Analytics';
    if (pathname.startsWith('/settings')) return 'Workspace Settings & Team';
    return 'Brand Governance';
  };

  return (
    <div style={{ display: 'flex', minHeight: '100vh', background: 'var(--bg-app)' }}>
      <Sidebar
        collapsed={collapsed}
        onToggleCollapse={() => setCollapsed(!collapsed)}
      />
      <div style={{ flex: 1, display: 'flex', flexDirection: 'column', minWidth: 0, overflowX: 'hidden' }}>
        <Navbar pageTitle={getPageTitle(location.pathname)} />
        <main style={{ flex: 1, padding: 'var(--space-8)', maxWidth: '1440px', width: '100%', margin: '0 auto' }}>
          <Outlet />
        </main>
      </div>
    </div>
  );
}
