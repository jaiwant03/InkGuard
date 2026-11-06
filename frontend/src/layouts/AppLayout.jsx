import React, { useState, useEffect } from 'react';
import { Outlet } from 'react-router-dom';
import TopNavigation from '../components/TopNavigation';
import GlobalSearchModal from '../components/GlobalSearchModal';

export default function AppLayout() {
  const [searchOpen, setSearchOpen] = useState(false);

  useEffect(() => {
    const handleOpenSearch = () => setSearchOpen(true);
    window.addEventListener('inkguard-open-search', handleOpenSearch);
    return () => window.removeEventListener('inkguard-open-search', handleOpenSearch);
  }, []);

  return (
    <div style={{ minHeight: '100vh', display: 'flex', flexDirection: 'column', background: 'var(--bg-app)' }}>
      {/* Top Navigation Bar with Dual-Tier Governance & Gradient Active States */}
      <TopNavigation onOpenSearch={() => setSearchOpen(true)} />

      {/* Global Search Modal */}
      <GlobalSearchModal isOpen={searchOpen} onClose={() => setSearchOpen(false)} />

      {/* Main Page Canvas Container */}
      <main
        style={{
          flex: 1,
          width: '100%',
          maxWidth: '1560px',
          margin: '0 auto',
          padding: '28px 32px 56px 32px',
        }}
        className="app-main-content"
      >
        <Outlet />
      </main>
    </div>
  );
}
