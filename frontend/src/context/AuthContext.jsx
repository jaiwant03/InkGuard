import React, { createContext, useContext, useState, useEffect, useCallback } from 'react';
import { api, setActiveWorkspaceId, getActiveWorkspaceId } from '../services/api';

const AuthContext = createContext(null);

export function AuthProvider({ children }) {
  const [user, setUser] = useState(null);
  const [workspace, setWorkspace] = useState(null);
  const [role, setRole] = useState(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);

  const checkAuth = useCallback(async () => {
    try {
      setLoading(true);
      setError(null);
      const res = await api.auth.me();
      if (res.success && res.data) {
        setUser(res.data.user);
        setWorkspace(res.data.workspace);
        setRole(res.data.role);
        if (res.data.workspace?._id) {
          setActiveWorkspaceId(res.data.workspace._id);
        }
      } else {
        setUser(null);
        setWorkspace(null);
        setRole(null);
      }
    } catch (err) {
      setUser(null);
      setWorkspace(null);
      setRole(null);
    } finally {
      setLoading(false);
    }
  }, []);

  useEffect(() => {
    checkAuth();
  }, [checkAuth]);

  const login = async (credentials) => {
    setError(null);
    const res = await api.auth.login(credentials);
    if (res.success && res.data) {
      setUser(res.data.user);
      setWorkspace(res.data.workspace);
      setRole(res.data.role);
      if (res.data.workspace?._id) {
        setActiveWorkspaceId(res.data.workspace._id);
      }
      return res.data;
    }
    throw new Error(res.message || 'Login failed');
  };

  const register = async (userData) => {
    setError(null);
    const res = await api.auth.register(userData);
    if (res.success && res.data) {
      setUser(res.data.user);
      setWorkspace(res.data.workspace);
      setRole(res.data.role);
      if (res.data.workspace?._id) {
        setActiveWorkspaceId(res.data.workspace._id);
      }
      return res.data;
    }
    throw new Error(res.message || 'Registration failed');
  };

  const logout = async () => {
    try {
      await api.auth.logout();
    } finally {
      setUser(null);
      setWorkspace(null);
      setRole(null);
      setActiveWorkspaceId('');
    }
  };

  const switchWorkspace = async (workspaceId) => {
    const res = await api.workspaces.switch(workspaceId);
    if (res.success && res.data) {
      setWorkspace(res.data.workspace);
      setRole(res.data.role);
      setActiveWorkspaceId(res.data.workspace._id);
      return res.data;
    }
  };

  const value = {
    user,
    workspace,
    role,
    loading,
    error,
    isAuthenticated: Boolean(user),
    isAdmin: role === 'admin' || user?.systemRole === 'superadmin',
    isReviewer: role === 'reviewer' || role === 'admin' || user?.systemRole === 'superadmin',
    isCreator: Boolean(user),
    login,
    register,
    logout,
    refreshUser: checkAuth,
    switchWorkspace,
  };

  return <AuthContext.Provider value={value}>{children}</AuthContext.Provider>;
}

export function useAuth() {
  const context = useContext(AuthContext);
  if (!context) {
    throw new Error('useAuth must be used within an AuthProvider');
  }
  return context;
}
