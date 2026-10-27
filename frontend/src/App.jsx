import React, { useState } from 'react';
import { BrowserRouter, Routes, Route, Navigate, useLocation } from 'react-router-dom';
import { AuthProvider, useAuth } from './context/AuthContext';
import { ToastProvider } from './context/ToastContext';
import SplashScreen from './components/SplashScreen';

// Layout & Pages
import AppLayout from './layouts/AppLayout';
import Login from './pages/Login';
import Register from './pages/Register';
import Dashboard from './pages/Dashboard';
import BrandGuidelines from './pages/BrandGuidelines';
import ApprovedFacts from './pages/ApprovedFacts';
import ContentReview from './pages/ContentReview';
import ReviewResults from './pages/ReviewResults';
import ApprovalQueue from './pages/ApprovalQueue';
import ReviewHistory from './pages/ReviewHistory';
import BrandAssets from './pages/BrandAssets';
import GovernanceInsights from './pages/GovernanceInsights';
import WorkspaceSettings from './pages/WorkspaceSettings';

// Protected Route Wrapper
function ProtectedRoute({ children }) {
  const { isAuthenticated, loading } = useAuth();
  const location = useLocation();

  if (loading) {
    return (
      <div style={{ height: '100vh', display: 'flex', alignItems: 'center', justifyContent: 'center', background: 'var(--bg-app)' }}>
        <div style={{ textAlign: 'center' }}>
          <div
            style={{
              width: '44px',
              height: '44px',
              borderRadius: 'var(--radius-lg)',
              background: 'var(--gradient-primary)',
              margin: '0 auto var(--space-3) auto',
              display: 'flex',
              alignItems: 'center',
              justifyContent: 'center',
              boxShadow: '0 4px 12px rgba(37, 99, 235, 0.3)',
            }}
          >
            <svg viewBox="0 0 100 100" width="24" height="24">
              <path d="M 50,10 L 85,25 C 85,65 65,85 50,96 C 35,85 15,65 15,25 Z" fill="none" stroke="#FFFFFF" strokeWidth="10" />
              <path d="M 35,50 L 46,62 L 68,36" fill="none" stroke="#FFFFFF" strokeWidth="10" strokeLinecap="round" strokeLinejoin="round" />
            </svg>
          </div>
          <span style={{ fontSize: '0.875rem', fontWeight: 600, color: 'var(--text-secondary)' }}>
            Verifying secure session...
          </span>
        </div>
      </div>
    );
  }

  if (!isAuthenticated) {
    return <Navigate to="/login" state={{ from: location }} replace />;
  }

  return children;
}

// Main App Router Flow
function AppRouter() {
  const [showSplash, setShowSplash] = useState(true);

  if (showSplash) {
    return <SplashScreen onComplete={() => setShowSplash(false)} />;
  }
  return (
    <Routes>
      {/* Public Auth Routes */}
      <Route path="/login" element={<Login />} />
      <Route path="/register" element={<Register />} />

      {/* Protected Essential Application Routes */}
      <Route
        path="/"
        element={
          <ProtectedRoute>
            <AppLayout />
          </ProtectedRoute>
        }
      >
        <Route index element={<Dashboard />} />
        <Route path="guidelines" element={<BrandGuidelines />} />
        <Route path="facts" element={<ApprovedFacts />} />
        <Route path="review" element={<ContentReview />} />
        <Route path="review/:draftId" element={<ReviewResults />} />
        <Route path="approvals" element={<ApprovalQueue />} />
        <Route path="history" element={<ReviewHistory />} />
        <Route path="assets" element={<BrandAssets />} />
        <Route path="insights" element={<GovernanceInsights />} />
        <Route path="settings" element={<WorkspaceSettings />} />
      </Route>

      {/* Fallback route */}
      <Route path="*" element={<Navigate to="/" replace />} />
    </Routes>
  );
}

export default function App() {
  return (
    <BrowserRouter>
      <ToastProvider>
        <AuthProvider>
          <AppRouter />
        </AuthProvider>
      </ToastProvider>
    </BrowserRouter>
  );
}
