import React, { useState, useEffect } from 'react';
import { Outlet } from 'react-router-dom';
import TopNavigation from '../components/TopNavigation';
import GlobalSearchModal from '../components/GlobalSearchModal';
import LiveDemoModal from '../components/LiveDemoModal';

export default function AppLayout() {
  const [searchOpen, setSearchOpen] = useState(false);
  const [demoOpen, setDemoOpen] = useState(false);

  useEffect(() => {
    const handleOpenSearch = () => setSearchOpen(true);
    const handleOpenDemo = () => setDemoOpen(true);

    window.addEventListener('inkguard-open-search', handleOpenSearch);
    window.addEventListener('inkguard-open-demo', handleOpenDemo);

    return () => {
      window.removeEventListener('inkguard-open-search', handleOpenSearch);
      window.removeEventListener('inkguard-open-demo', handleOpenDemo);
    };
  }, []);

  return (
    <div style={{ minHeight: '100vh', display: 'flex', flexDirection: 'column', background: 'var(--bg-app)' }}>
      {/* Top Navigation Bar with Dual-Tier Governance & Gradient Active States */}
      <TopNavigation
        onOpenSearch={() => setSearchOpen(true)}
        onOpenDemo={() => setDemoOpen(true)}
      />

      {/* Global Search Modal */}
      <GlobalSearchModal isOpen={searchOpen} onClose={() => setSearchOpen(false)} />

      {/* Live Input & Output Interactive Showcase Modal */}
      <LiveDemoModal isOpen={demoOpen} onClose={() => setDemoOpen(false)} />

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
