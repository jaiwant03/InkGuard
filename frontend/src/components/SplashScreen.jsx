import React, { useState, useEffect } from 'react';
import { ASSET_IMAGES } from '../assets/images';

export default function SplashScreen({ onComplete }) {
  const [fadingOut, setFadingOut] = useState(false);

  useEffect(() => {
    // 5 seconds total duration
    const fadeTimer = setTimeout(() => {
      setFadingOut(true);
    }, 4500);

    const completeTimer = setTimeout(() => {
      onComplete();
    }, 5000);

    return () => {
      clearTimeout(fadeTimer);
      clearTimeout(completeTimer);
    };
  }, [onComplete]);

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
        </div>
      </div>
    </div>
  );
}
