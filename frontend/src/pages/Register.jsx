import React, { useState } from 'react';
import { Link, useNavigate } from 'react-router-dom';
import { Eye, EyeOff, Lock, Mail, User, Building, AlertCircle, CheckCircle2 } from 'lucide-react';
import { useAuth } from '../context/AuthContext';
import { useToast } from '../context/ToastContext';
import { ASSET_IMAGES } from '../assets/images';

export default function Register() {
  const [name, setName] = useState('');
  const [email, setEmail] = useState('');
  const [workspaceName, setWorkspaceName] = useState('');
  const [password, setPassword] = useState('');
  const [confirmPassword, setConfirmPassword] = useState('');
  const [showPassword, setShowPassword] = useState(false);
  const [agreeTerms, setAgreeTerms] = useState(false);
  const [loading, setLoading] = useState(false);
  const [errorMsg, setErrorMsg] = useState('');

  const { register } = useAuth();
  const toast = useToast();
  const navigate = useNavigate();

  // Password strength checks
  const hasMinLength = password.length >= 8;
  const hasUppercase = /[A-Z]/.test(password);
  const hasNumber = /[0-9]/.test(password);
  const isMatch = password && password === confirmPassword;

  const handleSubmit = async (e) => {
    e.preventDefault();
    if (!agreeTerms) {
      setErrorMsg('Please accept the platform brand governance terms of use.');
      return;
    }
    if (!hasMinLength || !hasUppercase || !hasNumber) {
      setErrorMsg('Password does not meet the minimum security requirements.');
      return;
    }
    if (password !== confirmPassword) {
      setErrorMsg('Passwords do not match.');
      return;
    }

    try {
      setLoading(true);
      setErrorMsg('');
      await register({
        name: name.trim(),
        email: email.trim(),
        password,
        confirmPassword,
        workspaceName: workspaceName.trim() || undefined,
      });
      toast.success('Account and brand workspace registered successfully!');
      navigate('/');
    } catch (err) {
      setErrorMsg(err.message || 'Registration failed.');
    } finally {
      setLoading(false);
    }
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
      <div
        style={{
          width: '100%',
          maxWidth: '520px',
          background: 'rgba(255, 255, 255, 0.98)',
          borderRadius: 'var(--radius-2xl)',
          boxShadow: '0 25px 50px -12px rgba(0, 0, 0, 0.35)',
          padding: 'var(--space-8)',
          position: 'relative',
          zIndex: 1,
        }}
      >
        <div style={{ textAlign: 'center', marginBottom: 'var(--space-6)' }}>
          <div
            className="motion-mascot"
            style={{
              width: '80px',
              height: '80px',
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
            New Organization Workspace
          </div>

          <h1 style={{ fontSize: '1.5rem', fontWeight: 800, color: 'var(--text-primary)', letterSpacing: '-0.02em' }}>
            Register INKGUARD Workspace
          </h1>
          <p style={{ fontSize: '0.875rem', color: 'var(--text-secondary)', marginTop: '2px' }}>
            Set up your brand governance hub in seconds.
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

        <form onSubmit={handleSubmit}>
          <div className="form-group">
            <label className="form-label">Full Name *</label>
            <div style={{ position: 'relative' }}>
              <input
                type="text"
                required
                className="form-input"
                placeholder="Jane Doe"
                value={name}
                onChange={(e) => setName(e.target.value)}
                style={{ paddingLeft: '38px' }}
              />
              <User size={16} color="var(--text-tertiary)" style={{ position: 'absolute', left: '12px', top: '13px' }} />
            </div>
          </div>

          <div className="form-group">
            <label className="form-label">Work Email *</label>
            <div style={{ position: 'relative' }}>
              <input
                type="email"
                required
                className="form-input"
                placeholder="jane@company.com"
                value={email}
                onChange={(e) => setEmail(e.target.value)}
                style={{ paddingLeft: '38px' }}
              />
              <Mail size={16} color="var(--text-tertiary)" style={{ position: 'absolute', left: '12px', top: '13px' }} />
            </div>
          </div>

          <div className="form-group">
            <label className="form-label">Brand / Organization Workspace Name</label>
            <div style={{ position: 'relative' }}>
              <input
                type="text"
                className="form-input"
                placeholder="e.g. Apex Enterprise Cloud"
                value={workspaceName}
                onChange={(e) => setWorkspaceName(e.target.value)}
                style={{ paddingLeft: '38px' }}
              />
              <Building size={16} color="var(--text-tertiary)" style={{ position: 'absolute', left: '12px', top: '13px' }} />
            </div>
          </div>

          <div className="form-group">
            <label className="form-label">Password *</label>
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

            {/* Live password requirements indicator */}
            <div style={{ display: 'flex', gap: '12px', marginTop: '6px', fontSize: '0.6875rem' }}>
              <span style={{ color: hasMinLength ? '#10B981' : '#94A3B8', display: 'flex', alignItems: 'center', gap: '3px' }}>
                <CheckCircle2 size={11} /> 8+ chars
              </span>
              <span style={{ color: hasUppercase ? '#10B981' : '#94A3B8', display: 'flex', alignItems: 'center', gap: '3px' }}>
                <CheckCircle2 size={11} /> 1 uppercase
              </span>
              <span style={{ color: hasNumber ? '#10B981' : '#94A3B8', display: 'flex', alignItems: 'center', gap: '3px' }}>
                <CheckCircle2 size={11} /> 1 number
              </span>
            </div>
          </div>

          <div className="form-group">
            <label className="form-label">Confirm Password *</label>
            <div style={{ position: 'relative' }}>
              <input
                type={showPassword ? 'text' : 'password'}
                required
                className="form-input"
                placeholder="••••••••••••"
                value={confirmPassword}
                onChange={(e) => setConfirmPassword(e.target.value)}
                style={{ paddingLeft: '38px' }}
              />
              <Lock size={16} color="var(--text-tertiary)" style={{ position: 'absolute', left: '12px', top: '13px' }} />
            </div>
            {confirmPassword && !isMatch && (
              <span className="form-error">Passwords do not match</span>
            )}
          </div>

          <div style={{ marginBottom: 'var(--space-5)' }}>
            <label style={{ display: 'flex', alignItems: 'flex-start', gap: '8px', fontSize: '0.8125rem', color: 'var(--text-secondary)', cursor: 'pointer' }}>
              <input
                type="checkbox"
                required
                checked={agreeTerms}
                onChange={(e) => setAgreeTerms(e.target.checked)}
                style={{ accentColor: 'var(--color-primary)', marginTop: '3px' }}
              />
              <span>
                I agree to the brand governance confidentiality standards and terms of use.
              </span>
            </label>
          </div>

          <button
            type="submit"
            className="btn btn-primary btn-lg"
            disabled={loading}
            style={{ width: '100%', marginBottom: 'var(--space-4)' }}
          >
            {loading ? 'Creating Account & Workspace...' : 'Create Admin Workspace'}
          </button>
        </form>

        <div style={{ textAlign: 'center', fontSize: '0.875rem', color: 'var(--text-secondary)' }}>
          Already have an account?{' '}
          <Link to="/login" style={{ fontWeight: 600, color: 'var(--color-primary)' }}>
            Sign in
          </Link>
        </div>
      </div>
    </div>
  );
}
