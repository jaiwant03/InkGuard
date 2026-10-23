import React, { useState } from 'react';
import { Link, useNavigate } from 'react-router-dom';
import { Eye, EyeOff, Lock, Mail, User, Building, AlertCircle, CheckCircle2, ArrowRight } from 'lucide-react';
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
        background: '#FFFFFF',
        padding: 'var(--space-6)',
        position: 'relative',
      }}
    >
      <div
        style={{
          width: '100%',
          maxWidth: '520px',
          background: '#FFFFFF',
          borderRadius: '24px',
          border: '1px solid #E2E8F0',
          boxShadow: '0 20px 45px -12px rgba(15, 23, 42, 0.08), 0 0 1px 1px rgba(15, 23, 42, 0.04)',
          padding: '40px 36px',
          position: 'relative',
          zIndex: 1,
        }}
      >
        {/* Header */}
        <div style={{ textAlign: 'center', marginBottom: '28px' }}>
          <div
            className="motion-mascot"
            style={{
              width: '80px',
              height: '80px',
              margin: '0 auto 16px auto',
              borderRadius: '50%',
              overflow: 'hidden',
              boxShadow: '0 12px 28px -6px rgba(37, 99, 235, 0.22), 0 0 0 1px rgba(37, 99, 235, 0.1)',
              border: '3px solid #FFFFFF',
              background: '#FFFFFF',
            }}
          >
            <img
              src={ASSET_IMAGES.governanceShield}
              alt="Governance Mascot 3D"
              style={{ width: '100%', height: '100%', objectFit: 'cover', display: 'block' }}
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
            New Organization Workspace
          </div>

          <h1
            style={{
              fontSize: '1.625rem',
              fontWeight: 850,
              color: '#0F172A',
              letterSpacing: '-0.025em',
              marginBottom: '4px',
            }}
          >
            Register INKGUARD Workspace
          </h1>
          <p style={{ fontSize: '0.875rem', color: '#64748B', margin: 0 }}>
            Set up your brand governance hub in seconds.
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
                style={{ paddingLeft: '40px' }}
              />
              <User
                size={16}
                color="#94A3B8"
                style={{ position: 'absolute', left: '14px', top: '50%', transform: 'translateY(-50%)' }}
              />
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
            <label className="form-label">Brand / Organization Workspace Name</label>
            <div style={{ position: 'relative' }}>
              <input
                type="text"
                className="form-input"
                placeholder="e.g. Apex Enterprise Cloud"
                value={workspaceName}
                onChange={(e) => setWorkspaceName(e.target.value)}
                style={{ paddingLeft: '40px' }}
              />
              <Building
                size={16}
                color="#94A3B8"
                style={{ position: 'absolute', left: '14px', top: '50%', transform: 'translateY(-50%)' }}
              />
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

            {/* Live password requirements indicator chips */}
            <div style={{ display: 'flex', gap: '8px', marginTop: '8px', flexWrap: 'wrap' }}>
              <span
                style={{
                  fontSize: '0.6875rem',
                  fontWeight: 600,
                  padding: '2px 8px',
                  borderRadius: '6px',
                  background: hasMinLength ? '#ECFDF5' : '#F1F5F9',
                  color: hasMinLength ? '#059669' : '#64748B',
                  border: `1px solid ${hasMinLength ? '#A7F3D0' : '#E2E8F0'}`,
                  display: 'inline-flex',
                  alignItems: 'center',
                  gap: '4px',
                  transition: 'all 0.15s ease',
                }}
              >
                <CheckCircle2 size={11} /> 8+ chars
              </span>
              <span
                style={{
                  fontSize: '0.6875rem',
                  fontWeight: 600,
                  padding: '2px 8px',
                  borderRadius: '6px',
                  background: hasUppercase ? '#ECFDF5' : '#F1F5F9',
                  color: hasUppercase ? '#059669' : '#64748B',
                  border: `1px solid ${hasUppercase ? '#A7F3D0' : '#E2E8F0'}`,
                  display: 'inline-flex',
                  alignItems: 'center',
                  gap: '4px',
                  transition: 'all 0.15s ease',
                }}
              >
                <CheckCircle2 size={11} /> 1 uppercase
              </span>
              <span
                style={{
                  fontSize: '0.6875rem',
                  fontWeight: 600,
                  padding: '2px 8px',
                  borderRadius: '6px',
                  background: hasNumber ? '#ECFDF5' : '#F1F5F9',
                  color: hasNumber ? '#059669' : '#64748B',
                  border: `1px solid ${hasNumber ? '#A7F3D0' : '#E2E8F0'}`,
                  display: 'inline-flex',
                  alignItems: 'center',
                  gap: '4px',
                  transition: 'all 0.15s ease',
                }}
              >
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
                style={{ paddingLeft: '40px' }}
              />
              <Lock
                size={16}
                color="#94A3B8"
                style={{ position: 'absolute', left: '14px', top: '50%', transform: 'translateY(-50%)' }}
              />
            </div>
            {confirmPassword && !isMatch && (
              <span style={{ fontSize: '0.75rem', color: '#DC2626', marginTop: '4px', display: 'block' }}>
                Passwords do not match
              </span>
            )}
          </div>

          <div style={{ marginBottom: '24px', marginTop: '4px' }}>
            <label
              style={{
                display: 'flex',
                alignItems: 'flex-start',
                gap: '10px',
                fontSize: '0.8125rem',
                color: '#475569',
                cursor: 'pointer',
                lineHeight: 1.45,
                userSelect: 'none',
              }}
            >
              <input
                type="checkbox"
                required
                checked={agreeTerms}
                onChange={(e) => setAgreeTerms(e.target.checked)}
                style={{ marginTop: '2px', flexShrink: 0 }}
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
            style={{ width: '100%', marginBottom: '18px' }}
          >
            {loading ? 'Creating Account & Workspace...' : 'Create Admin Workspace'}
            {!loading && <ArrowRight size={16} />}
          </button>
        </form>

        <div style={{ textAlign: 'center', fontSize: '0.875rem', color: '#64748B' }}>
          Already have an account?{' '}
          <Link to="/login" style={{ fontWeight: 600, color: 'var(--color-primary)' }}>
            Sign in
          </Link>
        </div>
      </div>
    </div>
  );
}
