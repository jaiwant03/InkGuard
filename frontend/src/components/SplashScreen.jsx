import React, { useState, useEffect } from 'react';
import { ArrowRight } from 'lucide-react';
import { ASSET_IMAGES } from '../assets/images';

export default function SplashScreen({ onComplete }) {
  const [fadingOut, setFadingOut] = useState(false);
  const [progress, setProgress] = useState(0);

  useEffect(() => {
    // Smooth progress bar increment
    const interval = setInterval(() => {
      setProgress((prev) => {
        if (prev >= 100) {
          clearInterval(interval);
          return 100;
        }
        return prev + 2.5;
      });
    }, 80);

    // Fade out after ~3.3 seconds, complete at 3.7 seconds
    const fadeTimer = setTimeout(() => {
      setFadingOut(true);
    }, 3300);

    const completeTimer = setTimeout(() => {
      onComplete();
    }, 3700);

    return () => {
      clearInterval(interval);
      clearTimeout(fadeTimer);
      clearTimeout(completeTimer);
    };
  }, [onComplete]);

  const handleSkip = () => {
    setFadingOut(true);
    setTimeout(() => {
      onComplete();
    }, 300);
  };

  return (
    <div
      className={`splash-container ${fadingOut ? 'splash-fade-out' : ''}`}
      style={{
        position: 'fixed',
        inset: 0,
        zIndex: 99999,
        background: '#FFFFFF',
        display: 'flex',
        flexDirection: 'column',
        alignItems: 'center',
        justifyContent: 'center',
        userSelect: 'none',
        overflow: 'hidden',
      }}
    >
      {/* Studio Ambient Radial Depth (Pure White Palette) */}
      <div className="splash-ambient-glow" />

      {/* Main Logo & Brand Presentation */}
      <div className="splash-content-box">
        {/* Dual Rotating High-Tech Precision Orbital Rings */}
        <div className="splash-orbit-outer">
          <div className="splash-orbit-tick" style={{ top: '0', left: '50%' }} />
          <div className="splash-orbit-tick" style={{ bottom: '0', left: '50%' }} />
          <div className="splash-orbit-tick" style={{ left: '0', top: '50%' }} />
          <div className="splash-orbit-tick" style={{ right: '0', top: '50%' }} />
        </div>
        <div className="splash-orbit-inner" />

        {/* 3D Shield Logo Stage */}
        <div className="splash-logo-stage">
          <div className="splash-logo-3d-wrapper">
            <img
              src={ASSET_IMAGES.governanceShield}
              alt="InkGuard Brand Shield"
              className="splash-shield-image"
            />
            {/* Shimmer light reflection sweep */}
            <div className="splash-light-glint" />
          </div>

          {/* Dynamic 3D Contact Shadow beneath shield */}
          <div className="splash-dynamic-shadow" />
        </div>

        {/* Website Name with Kinetic 3D Perspective Reveal */}
        <div className="splash-brand-text-wrapper">
          <h1 className="splash-website-title">
            INKGUARD
          </h1>
          <div className="splash-title-underline-glow" />

          {/* Tagline */}
          <div
            style={{
              marginTop: '12px',
              fontSize: '0.75rem',
              fontWeight: 700,
              letterSpacing: '0.14em',
              textTransform: 'uppercase',
              color: '#64748B',
            }}
          >
            AI-Powered Brand Governance Platform
          </div>

          {/* Progress Indicator */}
          <div style={{ marginTop: '28px', display: 'flex', flexDirection: 'column', alignItems: 'center', gap: '8px' }}>
            <div
              style={{
                width: '180px',
                height: '4px',
                borderRadius: '999px',
                background: '#F1F5F9',
                border: '1px solid #E2E8F0',
                overflow: 'hidden',
              }}
            >
              <div
                style={{
                  height: '100%',
                  width: `${progress}%`,
                  borderRadius: '999px',
                  background: 'linear-gradient(90deg, #2563EB 0%, #7C3AED 100%)',
                  transition: 'width 0.1s linear',
                }}
              />
            </div>
            <span style={{ fontSize: '0.6875rem', color: '#94A3B8', fontWeight: 600 }}>
              Initializing Governance Engine...
            </span>
          </div>

          {/* Fast Skip / Enter Button */}
          <button
            type="button"
            onClick={handleSkip}
            style={{
              marginTop: '20px',
              background: 'transparent',
              border: 'none',
              cursor: 'pointer',
              display: 'inline-flex',
              alignItems: 'center',
              gap: '6px',
              fontSize: '0.75rem',
              fontWeight: 600,
              color: '#2563EB',
              padding: '6px 12px',
              borderRadius: '999px',
              transition: 'all 0.15s ease',
            }}
          >
            <span>Continue to Sign In</span>
            <ArrowRight size={13} />
          </button>
        </div>
      </div>
    </div>
  );
}
