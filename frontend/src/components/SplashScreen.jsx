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
      style={{
        position: 'fixed',
        inset: 0,
        zIndex: 99999,
        background: '#FFFFFF',
        display: 'flex',
        flexDirection: 'column',
        alignItems: 'center',
        justifyContent: 'center',
        transition: 'opacity 0.5s ease-out, transform 0.5s ease-out',
        opacity: fadingOut ? 0 : 1,
        transform: fadingOut ? 'scale(1.02)' : 'scale(1)',
        pointerEvents: fadingOut ? 'none' : 'auto',
        userSelect: 'none',
      }}
    >
      <div
        style={{
          display: 'flex',
          flexDirection: 'column',
          alignItems: 'center',
          justifyContent: 'center',
          textAlign: 'center',
        }}
      >
        {/* Rotating Emblem Container */}
        <div className="splash-logo-wrapper">
          <div className="splash-rotating-ring" />
          <div className="splash-logo-inner">
            <img
              src={ASSET_IMAGES.governanceShield}
              alt="InkGuard Logo"
              className="splash-logo-img"
            />
          </div>
        </div>

        {/* Website Name with Rotating 3D Entrance */}
        <h1 className="splash-website-title">
          INKGUARD
        </h1>
      </div>
    </div>
  );
}
