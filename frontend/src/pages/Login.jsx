import React, { useState } from 'react';
import { Link, useNavigate } from 'react-router-dom';
import { Eye, EyeOff, Lock, Mail, ArrowRight, ShieldCheck, AlertCircle } from 'lucide-react';
import { useAuth } from '../context/AuthContext';
import { useToast } from '../context/ToastContext';
import { ASSET_IMAGES } from '../assets/images';
import { Check } from 'lucide-react';

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
        background: 'linear-gradient(135deg, #090D16 0%, #0F172A 50%, #1E1B4B 100%)',
        padding: 'var(--space-6)',
        position: 'relative',
        overflow: 'hidden',
      }}
    >
      {/* Background glow circle */}
      <div
        style={{
          position: 'absolute',
          width: '500px',
          height: '500px',
          borderRadius: '50%',
          background: 'radial-gradient(circle, rgba(37, 99, 235, 0.2) 0%, transparent 70%)',
          filter: 'blur(60px)',
          pointerEvents: 'none',
        }}
      />

      <div
        style={{
          width: '100%',
          maxWidth: '460px',
          background: 'rgba(255, 255, 255, 0.98)',
          borderRadius: 'var(--radius-2xl)',
          boxShadow: '0 25px 50px -12px rgba(0, 0, 0, 0.35)',
          padding: 'var(--space-8)',
          position: 'relative',
          zIndex: 1,
        }}
      >
        {/* Brand Header with 3D Motion Mascot */}
        <div style={{ textAlign: 'center', marginBottom: 'var(--space-6)' }}>
          <div
            className="motion-mascot"
            style={{
              width: '84px',
              height: '84px',
              margin: '0 auto var(--space-3) auto',
              borderRadius: '50%',
              overflow: 'hidden',
              boxShadow: '0 12px 28px -4px rgba(37, 99, 235, 0.4)',
              border: '2px solid #DBEAFE',
              background: 'radial-gradient(circle, #EFF6FF 0%, #DBEAFE 100%)',
            }}
          >
            <img
              src={ASSET_IMAGES.governanceShield}
              alt="Governance Mascot 3D"
              style={{ width: '100%', height: '100%', objectFit: 'cover', display: 'block' }}
            />
          </div>

          <div style={{ display: 'inline-flex', alignItems: 'center', gap: '6px', fontSize: '0.75rem', color: '#10B981', fontWeight: 600, background: '#ECFDF5', padding: '3px 10px', borderRadius: '999px', marginBottom: '8px' }}>
            <span className="motion-pulse-check" style={{ width: '7px', height: '7px', borderRadius: '50%', background: '#10B981', display: 'inline-block' }} />
            Brand Governance Engine
          </div>

          <h1 style={{ fontSize: '1.625rem', fontWeight: 800, color: 'var(--text-primary)', letterSpacing: '-0.02em' }}>
            Welcome to INKGUARD
          </h1>
          <p style={{ fontSize: '0.875rem', color: 'var(--text-secondary)', marginTop: '4px' }}>
            Create with confidence. Publish with consistency.
          </p>

          {/* Reference Palette Dot Matrix */}
          <div style={{ display: 'flex', justifyContent: 'center', alignItems: 'center', gap: '8px', marginTop: '10px' }}>
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

        {/* Demo Fast Login Buttons */}
        <div
          style={{
            background: 'var(--bg-surface-secondary)',
            borderRadius: 'var(--radius-lg)',
            padding: '10px 12px',
            marginBottom: 'var(--space-5)',
            border: '1px solid var(--border-light)',
          }}
        >
          <span style={{ display: 'block', fontSize: '0.6875rem', fontWeight: 700, color: 'var(--text-tertiary)', textTransform: 'uppercase', marginBottom: '6px' }}>
            ⚡ Fast Demo Roles Fill:
          </span>
          <div style={{ display: 'flex', gap: '6px' }}>
            <button
              type="button"
              onClick={() => handleFastLogin('admin')}
              className="btn btn-secondary btn-sm"
              style={{ flex: 1, fontSize: '0.75rem', padding: '4px 6px' }}
            >
              Admin
            </button>
            <button
              type="button"
              onClick={() => handleFastLogin('reviewer')}
              className="btn btn-secondary btn-sm"
              style={{ flex: 1, fontSize: '0.75rem', padding: '4px 6px' }}
            >
              Reviewer
            </button>
            <button
              type="button"
              onClick={() => handleFastLogin('creator')}
              className="btn btn-secondary btn-sm"
              style={{ flex: 1, fontSize: '0.75rem', padding: '4px 6px' }}
            >
              Creator
            </button>
          </div>
        </div>

        {/* Error notification banner */}
        {errorMsg && (
          <div
            style={{
              padding: '10px 14px',
              borderRadius: 'var(--radius-md)',
              background: 'var(--severity-high-bg)',
              color: 'var(--severity-high)',
              border: '1px solid var(--severity-high-border)',
              fontSize: '0.8125rem',
              display: 'flex',
              alignItems: 'center',
              gap: '8px',
              marginBottom: 'var(--space-4)',
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
                style={{ paddingLeft: '38px' }}
              />
              <Mail size={16} color="var(--text-tertiary)" style={{ position: 'absolute', left: '12px', top: '13px' }} />
            </div>
          </div>

          <div className="form-group">
            <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
              <label className="form-label">Password</label>
            </div>
            <div style={{ position: 'relative' }}>
              <input
                type={showPassword ? 'text' : 'password'}
                required
                className="form-input"
                placeholder="••••••••••••"
                value={password}
                onChange={(e) => setPassword(e.target.value)}
                style={{ paddingLeft: '38px', paddingRight: '38px' }}
              />
              <Lock size={16} color="var(--text-tertiary)" style={{ position: 'absolute', left: '12px', top: '13px' }} />
              <button
                type="button"
                onClick={() => setShowPassword(!showPassword)}
                style={{ position: 'absolute', right: '12px', top: '11px', color: 'var(--text-tertiary)' }}
                aria-label="Toggle password visibility"
              >
                {showPassword ? <EyeOff size={16} /> : <Eye size={16} />}
              </button>
            </div>
          </div>

          <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', marginBottom: 'var(--space-5)' }}>
            <label style={{ display: 'flex', alignItems: 'center', gap: '8px', fontSize: '0.8125rem', color: 'var(--text-secondary)', cursor: 'pointer' }}>
              <input
                type="checkbox"
                checked={rememberMe}
                onChange={(e) => setRememberMe(e.target.checked)}
                style={{ accentColor: 'var(--color-primary)' }}
              />
              Remember me
            </label>
            <span style={{ fontSize: '0.8125rem', color: 'var(--text-tertiary)' }}>
              Password recovery is managed by your Admin
            </span>
          </div>

          <button
            type="submit"
            className="btn btn-primary btn-lg"
            disabled={loading}
            style={{ width: '100%', marginBottom: 'var(--space-4)' }}
          >
            {loading ? 'Authenticating...' : 'Sign In to Workspace'}
          </button>
        </form>

        <div style={{ textAlign: 'center', fontSize: '0.875rem', color: 'var(--text-secondary)' }}>
          Don't have an account?{' '}
          <Link to="/register" style={{ fontWeight: 600, color: 'var(--color-primary)' }}>
            Register new workspace
          </Link>
        </div>
      </div>
    </div>
  );
}
