import React, { useState, useEffect } from 'react';
import { BrowserRouter, Routes, Route, Navigate, useLocation } from 'react-router-dom';
import { AuthProvider, useAuth } from './context/AuthContext';
import { ToastProvider } from './context/ToastContext';
// Main App Router Flow
function AppRouter() {
  return (

  return (
    <Routes>
      {/* Public Auth Routes */}
      <Route path="/login" element={<Login />} />
      <Route path="/register" element={<Register />} />

      {/* Protected Application Routes */}
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
        <Route path="assets" element={<BrandAssets />} />
        <Route path="review" element={<ContentReview />} />
        <Route path="review/:draftId" element={<ReviewResults />} />
        <Route path="approvals" element={<ApprovalQueue />} />
        <Route path="history" element={<ReviewHistory />} />
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
