import React, { useState, useEffect } from 'react';
import { Outlet } from 'react-router-dom';
import Sidebar from '../components/Sidebar';
import TopNavigation from '../components/TopNavigation';
import GlobalSearchModal from '../components/GlobalSearchModal';

export default function AppLayout() {
  const [searchOpen, setSearchOpen] = useState(false);
  const [sidebarCollapsed, setSidebarCollapsed] = useState(() => {
    return localStorage.getItem('inkguard_sidebar_collapsed') === 'true';
  });
  const [mobileSidebarOpen, setMobileSidebarOpen] = useState(false);

  useEffect(() => {
    const handleOpenSearch = () => setSearchOpen(true);
    window.addEventListener('inkguard-open-search', handleOpenSearch);
    return () => window.removeEventListener('inkguard-open-search', handleOpenSearch);
  }, []);

  const handleToggleCollapse = () => {
    setSidebarCollapsed((prev) => {
      const next = !prev;
      localStorage.setItem('inkguard_sidebar_collapsed', String(next));
      return next;
    });
  };

  return (
    <div style={{ minHeight: '100vh', display: 'flex', background: 'var(--bg-app)' }}>
      {/* Sidebar with Gradient Active State */}
      <Sidebar
        collapsed={sidebarCollapsed}
        onToggleCollapse={handleToggleCollapse}
        mobileOpen={mobileSidebarOpen}
        onCloseMobile={() => setMobileSidebarOpen(false)}
      />

      {/* Main Shell Column */}
      <div style={{ flex: 1, display: 'flex', flexDirection: 'column', minWidth: 0, overflowX: 'hidden' }}>
        {/* Top Header Bar */}
        <TopNavigation
          onOpenSearch={() => setSearchOpen(true)}
          onToggleMobileSidebar={() => setMobileSidebarOpen(!mobileSidebarOpen)}
          isSidebarLayout={true}
        />

        {/* Global Search Modal */}
        <GlobalSearchModal isOpen={searchOpen} onClose={() => setSearchOpen(false)} />

        {/* Main Page Canvas Container */}
        <main
          style={{
            flex: 1,
            width: '100%',
            maxWidth: '1480px',
            margin: '0 auto',
            padding: '28px 32px 56px 32px',
          }}
          className="app-main-content"
        >
          <Outlet />
        </main>
      </div>
    </div>
  );
}
