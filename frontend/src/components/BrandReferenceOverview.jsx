import React, { useState } from 'react';
import {
  Check,
  ExternalLink,
  Shield,
  Layers,
  FileText,
  Type,
  Palette,
  CheckCircle2,
  Sparkles,
  ArrowRight,
  Eye,
} from 'lucide-react';
import ComplianceScoreRing from './ComplianceScoreRing';
import { ASSET_IMAGES } from '../assets/images';
import { useToast } from '../context/ToastContext';

export default function BrandReferenceOverview({
  score = 92,
  title = 'Brand Compliance Validation Engine',
  documentTitle = 'Corporate Brochure & Guidelines',
  status = 'Verified',
  onRunAudit,
}) {
  const toast = useToast();
  const [activeColorHex, setActiveColorHex] = useState('#2563EB');

  // Horizontal Color Strip (as in reference image)
  const colorStrip = [
    { name: 'Pure White', hex: '#FFFFFF', border: '#E2E8F0' },
    { name: 'Slate Gray', hex: '#64748B' },
    { name: 'Deep Indigo', hex: '#312E81' },
    { name: 'Sky Cyan', hex: '#0284C7' },
    { name: 'Royal Blue', hex: '#2563EB' },
    { name: 'Midnight', hex: '#0F172A' },
    { name: 'Magenta Pink', hex: '#DB2777' },
    { name: 'Coral Red', hex: '#EA580C' },
  ];

  // 2x5 Grid of Color Dots with Checked status (as in reference image)
  const colorDots = [
    { hex: '#0E7490', checked: false },
    { hex: '#2563EB', checked: true },
    { hex: '#7C3AED', checked: false },
    { hex: '#DC2626', checked: false },
    { hex: '#D97706', checked: false },
    { hex: '#06B6D4', checked: false },
    { hex: '#6366F1', checked: true },
    { hex: '#9333EA', checked: false },
    { hex: '#F43F5E', checked: false },
    { hex: '#EAB308', checked: false },
  ];

  // Asset Thumbnails (as in reference image)
  const assetThumbnails = [
    { name: 'Shield Logo', icon: 'shield', bg: '#2563EB', isPrimary: true },
    { name: 'Tech Vector', icon: 'wave', bg: '#0F172A' },
    { name: 'Color Wheel', icon: 'palette', bg: '#F8FAFC', img: ASSET_IMAGES.brandDocPreview },
    { name: 'Security Seal', icon: 'seal', bg: '#475569', img: ASSET_IMAGES.governanceShield },
    { name: 'Waveform Icon', icon: 'signal', bg: '#FFFFFF' },
    { name: 'Node Network', icon: 'network', bg: '#EFF6FF' },
  ];

  const handleCopyColor = (hex) => {
    setActiveColorHex(hex);
    navigator.clipboard.writeText(hex);
    toast.success(`Copied color hex: ${hex}`);
  };

  return (
    <div
      style={{
        display: 'grid',
        gridTemplateColumns: '260px minmax(0, 1fr) 320px',
        gap: 'var(--space-6)',
        alignItems: 'stretch',
        background: '#FFFFFF',
        borderRadius: 'var(--radius-2xl)',
        padding: 'var(--space-6)',
        boxShadow: '0 20px 50px -10px rgba(15, 23, 42, 0.08)',
        border: '1px solid #E2E8F0',
      }}
    >
      {/* ================= LEFT COLUMN: SCORE & ENGINE ================= */}
      <div
        style={{
          display: 'flex',
          flexDirection: 'column',
          justifyContent: 'space-between',
          padding: 'var(--space-4)',
          borderRight: '1px solid #F1F5F9',
        }}
      >
        <div>
          {/* Logo Mark Header */}
          <div style={{ display: 'flex', alignItems: 'center', gap: '10px', marginBottom: 'var(--space-6)' }}>
            <div
              style={{
                width: '36px',
                height: '36px',
                borderRadius: '50%',
                background: 'linear-gradient(135deg, #2563EB 0%, #1D4ED8 100%)',
                display: 'flex',
                alignItems: 'center',
                justifyContent: 'center',
                color: '#FFFFFF',
                boxShadow: '0 4px 10px rgba(37, 99, 235, 0.35)',
              }}
            >
              <svg viewBox="0 0 100 100" width="20" height="20">
                <path d="M 50,10 L 85,25 C 85,65 65,85 50,96 C 35,85 15,65 15,25 Z" fill="none" stroke="#FFFFFF" strokeWidth="12" />
                <path d="M 35,50 L 46,62 L 68,36" fill="none" stroke="#FFFFFF" strokeWidth="12" strokeLinecap="round" strokeLinejoin="round" />
              </svg>
            </div>
            <span style={{ fontSize: '1.25rem', fontWeight: 800, color: '#0F172A', letterSpacing: '-0.02em' }}>
              INKGUARD
            </span>
          </div>

          <h2
            style={{
              fontSize: '1.375rem',
              fontWeight: 800,
              color: '#0F172A',
              lineHeight: 1.25,
              letterSpacing: '-0.02em',
              marginBottom: 'var(--space-8)',
            }}
          >
            {title}
          </h2>

          {/* Large Compliance Score Ring (Exact Reference Style with Docked Checkmark) */}
          <div style={{ display: 'flex', justifyContent: 'center', marginBottom: 'var(--space-6)' }}>
            <ComplianceScoreRing score={score} size={150} strokeWidth={14} showBadge={true} />
          </div>

          <div style={{ textAlign: 'center' }}>
            <span
              style={{
                display: 'inline-flex',
                alignItems: 'center',
                gap: '5px',
                fontSize: '0.8125rem',
                fontWeight: 700,
                color: '#10B981',
                background: '#ECFDF5',
                padding: '4px 12px',
                borderRadius: 'var(--radius-full)',
                border: '1px solid #A7F3D0',
              }}
            >
              <Check size={14} strokeWidth={3} /> Verified Brand Compliant
            </span>
          </div>
        </div>

        {/* Small mascot pill footer */}
        <div
          style={{
            marginTop: 'var(--space-6)',
            padding: '10px 12px',
            borderRadius: 'var(--radius-lg)',
            background: 'var(--bg-surface-secondary)',
            display: 'flex',
            alignItems: 'center',
            gap: '8px',
          }}
        >
          <div className="ui-integrated-graphic" style={{ width: '28px', height: '28px' }}>
            <img
              src={ASSET_IMAGES.governanceShield}
              alt="Shield mascot"
              className="ui-seamless-image motion-mascot"
              style={{ width: '100%', height: '100%' }}
            />
          </div>
          <span style={{ fontSize: '0.75rem', color: 'var(--text-secondary)', fontWeight: 600 }}>
            Active Governance Watcher
          </span>
        </div>
      </div>

      {/* ================= CENTER COLUMN: UPLOADED DOCUMENT PREVIEW ================= */}
      <div style={{ display: 'flex', flexDirection: 'column', gap: 'var(--space-4)' }}>
        <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
          <h3 style={{ fontSize: '1rem', fontWeight: 800, color: '#0F172A' }}>
            Uploaded Document Preview
          </h3>
          <span style={{ fontSize: '0.75rem', color: 'var(--text-tertiary)', fontWeight: 600 }}>
            {documentTitle}
          </span>
        </div>

        {/* 3D Floating Brochure & Guidelines Presentation */}
        <div
          className="ui-seamless-mockup-frame"
          style={{
            position: 'relative',
            minHeight: '220px',
          }}
        >
          {/* 3D Rendered Animation Image with Floating Motion Effect */}
          <div className="motion-float" style={{ width: '100%', display: 'flex', justifyContent: 'center' }}>
            <img
              src={ASSET_IMAGES.brochureMockup}
              alt="3D Corporate Brochure Presentation"
              style={{
                width: '100%',
                maxHeight: '210px',
                objectFit: 'contain',
              }}
            />
          </div>

          {/* Floating UI Badges */}
          <div
            style={{
              position: 'absolute',
              bottom: '12px',
              left: '14px',
              background: 'rgba(255, 255, 255, 0.95)',
              backdropFilter: 'blur(8px)',
              padding: '4px 10px',
              borderRadius: 'var(--radius-full)',
              fontSize: '0.6875rem',
              fontWeight: 700,
              color: 'var(--color-primary)',
              boxShadow: '0 4px 10px rgba(0,0,0,0.06)',
              border: '1px solid #E2E8F0',
              display: 'flex',
              alignItems: 'center',
              gap: '4px',
            }}
          >
            <Sparkles size={11} /> 3D Brand Review Layer Active
          </div>
        </div>

        {/* Horizontal Color Palette Strip (Exact Reference) */}
        <div>
          <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '6px' }}>
            <span style={{ fontSize: '0.8125rem', fontWeight: 700, color: '#0F172A' }}>
              Color Palette
            </span>
            <span style={{ fontSize: '0.75rem', fontWeight: 700, color: '#64748B', fontFamily: 'var(--font-mono)' }}>
              {activeColorHex}
            </span>
          </div>

          <div
            style={{
              display: 'flex',
              alignItems: 'center',
              gap: '8px',
              background: '#F8FAFC',
              padding: '6px 10px',
              borderRadius: 'var(--radius-lg)',
              border: '1px solid #E2E8F0',
            }}
          >
            <span style={{ fontSize: '0.6875rem', fontWeight: 600, color: '#64748B', marginRight: '4px' }}>Light</span>
            {colorStrip.map((item, idx) => (
              <div
                key={idx}
                onClick={() => handleCopyColor(item.hex)}
                style={{
                  flex: 1,
                  height: '24px',
                  borderRadius: 'var(--radius-sm)',
                  background: item.hex,
                  border: item.border ? `1px solid ${item.border}` : 'none',
                  cursor: 'pointer',
                  boxShadow: '0 1px 3px rgba(0,0,0,0.1)',
                  transition: 'transform 0.15s',
                }}
                title={`${item.name} (${item.hex})`}
                onMouseEnter={(e) => (e.currentTarget.style.transform = 'scale(1.08)')}
                onMouseLeave={(e) => (e.currentTarget.style.transform = 'scale(1)')}
              />
            ))}
          </div>
        </div>

        {/* Asset Previews Row (Exact Reference) */}
        <div>
          <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '6px' }}>
            <span style={{ fontSize: '0.8125rem', fontWeight: 700, color: '#0F172A' }}>
              Asset Previews
            </span>
            <span style={{ fontSize: '0.6875rem', color: '#64748B', fontWeight: 600 }}>
              Usage 13 pts
            </span>
          </div>

          <div style={{ display: 'flex', gap: '10px', overflowX: 'auto', paddingBottom: '4px' }}>
            {assetThumbnails.map((asset, idx) => (
              <div
                key={idx}
                style={{
                  width: '50px',
                  height: '50px',
                  borderRadius: 'var(--radius-md)',
                  background: asset.bg,
                  border: '1px solid #E2E8F0',
                  display: 'flex',
                  alignItems: 'center',
                  justifyContent: 'center',
                  flexShrink: 0,
                  cursor: 'pointer',
                  overflow: 'hidden',
                  boxShadow: '0 2px 6px rgba(0,0,0,0.05)',
                  transition: 'transform 0.15s',
                }}
                title={asset.name}
                onMouseEnter={(e) => (e.currentTarget.style.transform = 'translateY(-2px)')}
                onMouseLeave={(e) => (e.currentTarget.style.transform = 'translateY(0)')}
              >
                {asset.img ? (
                  <img src={asset.img} alt={asset.name} style={{ width: '100%', height: '100%', objectFit: 'contain', mixBlendMode: 'multiply' }} />
                ) : (
                  <svg viewBox="0 0 100 100" width="24" height="24">
                    <path
                      d="M 20,50 Q 50,20 80,50 Q 50,80 20,50"
                      fill="none"
                      stroke={asset.bg === '#2563EB' || asset.bg === '#0F172A' ? '#FFFFFF' : '#2563EB'}
                      strokeWidth="10"
                    />
                  </svg>
                )}
              </div>
            ))}
          </div>
        </div>
      </div>

      {/* ================= RIGHT COLUMN: GUIDELINES & CHECKERS ================= */}
      <div style={{ display: 'flex', flexDirection: 'column', gap: 'var(--space-4)' }}>
        {/* Card 1: Extracted Guidelines (Reference UI) */}
        <div
          style={{
            background: '#FFFFFF',
            border: '1px solid #E2E8F0',
            borderRadius: 'var(--radius-xl)',
            padding: 'var(--space-4)',
            boxShadow: 'var(--shadow-sm)',
          }}
        >
          <div style={{ fontSize: '0.875rem', fontWeight: 800, color: '#0F172A', marginBottom: 'var(--space-3)' }}>
            Extracted Guidelines
          </div>

          {/* Logo Usage item */}
          <div
            style={{
              display: 'flex',
              alignItems: 'center',
              gap: '10px',
              padding: '8px 10px',
              borderRadius: 'var(--radius-md)',
              background: '#F8FAFC',
              marginBottom: '8px',
            }}
          >
            <div
              style={{
                width: '32px',
                height: '32px',
                borderRadius: '50%',
                background: '#2563EB',
                color: '#FFFFFF',
                display: 'flex',
                alignItems: 'center',
                justifyContent: 'center',
                flexShrink: 0,
              }}
            >
              <Shield size={16} />
            </div>
            <div style={{ flex: 1 }}>
              <div style={{ fontSize: '0.8125rem', fontWeight: 700, color: '#0F172A' }}>Logo Usage</div>
              <div style={{ fontSize: '0.6875rem', color: '#64748B' }}>Clearance & Alignment verified</div>
            </div>
          </div>

          {/* Messaging Tone item */}
          <div
            style={{
              display: 'flex',
              alignItems: 'center',
              justifyContent: 'space-between',
              padding: '8px 10px',
              borderRadius: 'var(--radius-md)',
              background: '#F8FAFC',
            }}
          >
            <div style={{ fontSize: '0.8125rem', fontWeight: 700, color: '#0F172A' }}>
              Messaging Tone
            </div>
            <span
              style={{
                fontSize: '0.6875rem',
                fontWeight: 700,
                color: '#2563EB',
                background: '#EFF6FF',
                padding: '2px 8px',
                borderRadius: 'var(--radius-full)',
                border: '1px solid #BFDBFE',
              }}
            >
              Authoritative
            </span>
          </div>
        </div>

        {/* Card 2: Color Palette Dots + Typography Checker (Reference UI) */}
        <div
          style={{
            background: '#FFFFFF',
            border: '1px solid #E2E8F0',
            borderRadius: 'var(--radius-xl)',
            padding: 'var(--space-4)',
            boxShadow: 'var(--shadow-sm)',
            flex: 1,
            display: 'flex',
            flexDirection: 'column',
            justifyContent: 'space-between',
          }}
        >
          {/* Color Palette Dots 2x5 Grid */}
          <div>
            <div style={{ fontSize: '0.875rem', fontWeight: 800, color: '#0F172A', marginBottom: '8px' }}>
              Color Palette
            </div>

            <div style={{ display: 'grid', gridTemplateColumns: 'repeat(5, 1fr)', gap: '8px', marginBottom: 'var(--space-4)' }}>
              {colorDots.map((dot, idx) => (
                <div key={idx} style={{ display: 'flex', justifyContent: 'center' }}>
                  {dot.checked ? (
                    <div className="color-dot-checked" title={`Verified approved color ${dot.hex}`}>
                      <Check size={14} strokeWidth={3} />
                    </div>
                  ) : (
                    <div
                      className="color-dot"
                      style={{ background: dot.hex }}
                      onClick={() => handleCopyColor(dot.hex)}
                      title={dot.hex}
                    />
                  )}
                </div>
              ))}
            </div>
          </div>

          {/* Typography Checker List */}
          <div>
            <div style={{ fontSize: '0.875rem', fontWeight: 800, color: '#0F172A', marginBottom: '8px' }}>
              Typography Checker
            </div>

            {/* Font Item 1 */}
            <div className="typography-checker-card">
              <div>
                <div style={{ fontSize: '0.8125rem', fontWeight: 700, color: '#0F172A' }}>Inter / Lato Bold</div>
                <div style={{ fontSize: '0.6875rem', color: '#64748B' }}>Primary Heading Hierarchy</div>
              </div>
              <div
                style={{
                  width: '20px',
                  height: '20px',
                  borderRadius: '50%',
                  background: '#10B981',
                  color: '#FFFFFF',
                  display: 'flex',
                  alignItems: 'center',
                  justifyContent: 'center',
                  boxShadow: '0 2px 4px rgba(16, 185, 129, 0.3)',
                }}
              >
                <Check size={12} strokeWidth={3.5} />
              </div>
            </div>

            {/* Font Item 2 */}
            <div className="typography-checker-card" style={{ marginBottom: 0 }}>
              <div>
                <div style={{ fontSize: '0.8125rem', fontWeight: 700, color: '#0F172A' }}>Open Sans Regular</div>
                <div style={{ fontSize: '0.6875rem', color: '#64748B' }}>Body & Microcopy Standard</div>
              </div>
              <div
                style={{
                  width: '20px',
                  height: '20px',
                  borderRadius: '50%',
                  background: '#10B981',
                  color: '#FFFFFF',
                  display: 'flex',
                  alignItems: 'center',
                  justifyContent: 'center',
                  boxShadow: '0 2px 4px rgba(16, 185, 129, 0.3)',
                }}
              >
                <Check size={12} strokeWidth={3.5} />
              </div>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}
