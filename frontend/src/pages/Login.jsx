import React, { useState } from 'react';
import { Link, useNavigate } from 'react-router-dom';
import { Eye, EyeOff, Lock, Mail, ArrowRight, ShieldCheck, AlertCircle, Sparkles } from 'lucide-react';
import { useAuth } from '../context/AuthContext';
import { useToast } from '../context/ToastContext';
import { ASSET_IMAGES } from '../assets/images';

export default function Login() {
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [showPassword, setShowPassword] = useState(false);
  const [rememberMe, setRememberMe] = useState(false);
  const [loading, setLoading] = useState(false);
  const [errorMsg, setErrorMsg] = useState('');

  const { login } = useAuth();
  const toast = useToast();
  const navigate = useNavigate();

  const handleSubmit = async (e) => {
    e.preventDefault();
    if (!email || !password) {
      setErrorMsg('Please enter both email and password.');
      return;
    }

    try {
      setLoading(true);
      setErrorMsg('');
      await login({ email: email.trim(), password, rememberMe });
      toast.success('Signed in successfully.');
      navigate('/');
    } catch (err) {
      setErrorMsg(err.message || 'Invalid email address or password.');
    } finally {
      setLoading(false);
    }
  };

  // Quick fill helper for review
  const handleFastLogin = (role) => {
    if (role === 'admin') {
      setEmail('admin@inkguard.demo');
      setPassword('Password123!');
    } else if (role === 'reviewer') {
      setEmail('reviewer@inkguard.demo');
      setPassword('Password123!');
    } else {
      setEmail('creator@inkguard.demo');
      setPassword('Password123!');
    }
    setErrorMsg('');
  };

  return (
    <div
      style={{
        minHeight: '100vh',
        display: 'flex',
        alignItems: 'center',
        justifyContent: 'center',
        background: '#FFFFFF',
        padding: 'var(--space-6)',
        position: 'relative',
      }}
    >
      <div
        style={{
          width: '100%',
          maxWidth: '460px',
          background: '#FFFFFF',
          borderRadius: '24px',
          border: '1px solid #E2E8F0',
          boxShadow: '0 20px 45px -12px rgba(15, 23, 42, 0.08), 0 0 1px 1px rgba(15, 23, 42, 0.04)',
          padding: '40px 36px',
          position: 'relative',
          zIndex: 1,
        }}
      >
        {/* Brand Header with Emblem */}
        <div style={{ textAlign: 'center', marginBottom: '28px' }}>
          <div
            className="ui-integrated-graphic motion-mascot"
            style={{
              width: '84px',
              height: '84px',
              margin: '0 auto 14px auto',
            }}
          >
            <img
              src={ASSET_IMAGES.governanceShield}
              alt="Governance Mascot 3D"
              className="ui-seamless-image"
              style={{ width: '100%', height: '100%' }}
            />
          </div>

          <div
            style={{
              display: 'inline-flex',
              alignItems: 'center',
              gap: '6px',
              fontSize: '0.75rem',
              color: '#059669',
              fontWeight: 600,
              background: '#ECFDF5',
              padding: '4px 12px',
              borderRadius: '999px',
              border: '1px solid #A7F3D0',
              marginBottom: '10px',
            }}
          >
            <span
              className="motion-pulse-check"
              style={{
                width: '7px',
                height: '7px',
                borderRadius: '50%',
                background: '#10B981',
                display: 'inline-block',
              }}
            />
            Brand Governance Engine
          </div>

          <h1
            className="text-gradient-primary"
            style={{
              fontSize: '1.75rem',
              fontWeight: 850,
              letterSpacing: '-0.025em',
              marginBottom: '4px',
            }}
          >
            Welcome to INKGUARD
          </h1>
          <p style={{ fontSize: '0.875rem', color: '#64748B', margin: 0 }}>
            Create with confidence. Publish with consistency.
          </p>

          {/* Reference Palette Dot Matrix */}
          <div
            style={{
              display: 'flex',
              justifyContent: 'center',
              alignItems: 'center',
              gap: '8px',
              marginTop: '12px',
            }}
          >
            {['#2563EB', '#4F46E5', '#0284C7', '#10B981', '#F59E0B'].map((hex, idx) => (
              <span
                key={idx}
                className="color-dot"
                style={{ width: '14px', height: '14px', backgroundColor: hex }}
                title={hex}
              />
            ))}
          </div>
        </div>

        {/* Demo Fast Login Options */}
        <div
          style={{
            background: 'var(--bg-surface-secondary)',
            borderRadius: '16px',
            padding: '14px 16px',
            marginBottom: '24px',
            border: '1px solid var(--border-light)',
          }}
        >
          <span
            style={{
              display: 'block',
              fontSize: '0.6875rem',
              fontWeight: 700,
              color: 'var(--text-tertiary)',
              textTransform: 'uppercase',
              letterSpacing: '0.06em',
              marginBottom: '10px',
            }}
          >
            ⚡ Select Demo Persona:
          </span>
          <div style={{ display: 'flex', gap: '8px' }}>
            <button
              type="button"
              onClick={() => handleFastLogin('admin')}
              className="option-pill"
              style={{ flex: 1, padding: '8px 10px', fontSize: '0.75rem', fontWeight: 700, color: '#1E3A8A' }}
            >
              👑 Admin
            </button>
            <button
              type="button"
              onClick={() => handleFastLogin('reviewer')}
              className="option-pill"
              style={{ flex: 1, padding: '8px 10px', fontSize: '0.75rem', fontWeight: 700, color: '#047857' }}
            >
              🛡️ Reviewer
            </button>
            <button
              type="button"
              onClick={() => handleFastLogin('creator')}
              className="option-pill"
              style={{ flex: 1, padding: '8px 10px', fontSize: '0.75rem', fontWeight: 700, color: '#6D28D9' }}
            >
              ✍️ Creator
            </button>
          </div>
        </div>

        {/* Error notification banner */}
        {errorMsg && (
          <div
            style={{
              padding: '10px 14px',
              borderRadius: '12px',
              background: '#FEF2F2',
              color: '#DC2626',
              border: '1px solid #FCA5A5',
              fontSize: '0.8125rem',
              display: 'flex',
              alignItems: 'center',
              gap: '8px',
              marginBottom: '20px',
            }}
          >
            <AlertCircle size={16} flexShrink={0} />
            <span>{errorMsg}</span>
          </div>
        )}

        {/* Form */}
        <form onSubmit={handleSubmit}>
          <div className="form-group">
            <label className="form-label">Email Address</label>
            <div style={{ position: 'relative' }}>
              <input
                type="email"
                required
                className="form-input"
                placeholder="name@company.com"
                value={email}
                onChange={(e) => setEmail(e.target.value)}
                style={{ paddingLeft: '40px' }}
              />
              <Mail
                size={16}
                color="#94A3B8"
                style={{ position: 'absolute', left: '14px', top: '50%', transform: 'translateY(-50%)' }}
              />
            </div>
          </div>

          <div className="form-group">
            <label className="form-label">Password</label>
            <div style={{ position: 'relative' }}>
              <input
                type={showPassword ? 'text' : 'password'}
                required
                className="form-input"
                placeholder="••••••••••••"
                value={password}
                onChange={(e) => setPassword(e.target.value)}
                style={{ paddingLeft: '40px', paddingRight: '40px' }}
              />
              <Lock
                size={16}
                color="#94A3B8"
                style={{ position: 'absolute', left: '14px', top: '50%', transform: 'translateY(-50%)' }}
              />
              <button
                type="button"
                onClick={() => setShowPassword(!showPassword)}
                style={{
                  position: 'absolute',
                  right: '12px',
                  top: '50%',
                  transform: 'translateY(-50%)',
                  background: 'none',
                  border: 'none',
                  cursor: 'pointer',
                  color: '#94A3B8',
                  padding: '4px',
                  display: 'flex',
                  alignItems: 'center',
                  justifyContent: 'center',
                }}
                aria-label="Toggle password visibility"
              >
                {showPassword ? <EyeOff size={16} /> : <Eye size={16} />}
              </button>
            </div>
          </div>

          <div
            style={{
              display: 'flex',
              alignItems: 'center',
              justifyContent: 'space-between',
              marginBottom: '24px',
              marginTop: '4px',
            }}
          >
            <label
              style={{
                display: 'flex',
                alignItems: 'center',
                gap: '8px',
                fontSize: '0.8125rem',
                color: '#475569',
                cursor: 'pointer',
                userSelect: 'none',
              }}
            >
              <input
                type="checkbox"
                checked={rememberMe}
                onChange={(e) => setRememberMe(e.target.checked)}
              />
              Remember me
            </label>
            <span style={{ fontSize: '0.8125rem', color: '#94A3B8' }}>
              Managed by your Workspace Admin
            </span>
          </div>

          <button
            type="submit"
            className="btn btn-primary btn-lg"
            disabled={loading}
            style={{ width: '100%', marginBottom: '18px' }}
          >
            {loading ? 'Authenticating...' : 'Sign In to Workspace'}
            {!loading && <ArrowRight size={16} />}
          </button>
        </form>

        <div style={{ textAlign: 'center', fontSize: '0.875rem', color: '#64748B' }}>
          Don't have an account?{' '}
          <Link to="/register" style={{ fontWeight: 600, color: 'var(--color-primary)' }}>
            Register new workspace
          </Link>
        </div>
      </div>
    </div>
  );
}
