import React, { useState, useEffect } from 'react';
import { ShieldCheck, ArrowRight } from 'lucide-react';
import { ASSET_IMAGES } from '../assets/images';

export default function SplashScreen({ onComplete }) {
  const [progress, setProgress] = useState(0);

  useEffect(() => {
    const totalDuration = 5000; // 5 seconds
    const intervalTime = 50;
    const step = (intervalTime / totalDuration) * 100;

    const timer = setInterval(() => {
      setProgress((prev) => {
        if (prev >= 100) {
          clearInterval(timer);
          return 100;
        }
        return Math.min(100, prev + step);
      });
    }, intervalTime);

    const completionTimer = setTimeout(() => {
      onComplete();
    }, totalDuration);

    return () => {
      clearInterval(timer);
      clearTimeout(completionTimer);
    };
  }, [onComplete]);

  return (
    <div
      style={{
        position: 'fixed',
        inset: 0,
        zIndex: 99999,
        background: 'radial-gradient(ellipse at center, #1E1B4B 0%, #0F172A 50%, #060913 100%)',
        display: 'flex',
        flexDirection: 'column',
        alignItems: 'center',
        justifyContent: 'center',
        color: '#FFFFFF',
        fontFamily: 'var(--font-sans)',
        padding: 'var(--space-6)',
      }}
    >
      {/* Background glow effects */}
      <div
        style={{
          position: 'absolute',
          width: '450px',
          height: '450px',
          borderRadius: '50%',
          background: 'radial-gradient(circle, rgba(79, 70, 229, 0.25) 0%, rgba(37, 99, 235, 0.05) 60%, transparent 80%)',
          filter: 'blur(50px)',
          pointerEvents: 'none',
        }}
      />

      {/* Main Logo & Emblem */}
      <div
        style={{
          display: 'flex',
          flexDirection: 'column',
          alignItems: 'center',
          textAlign: 'center',
          maxWidth: '560px',
          zIndex: 1,
        }}
      >
        <div
          style={{
            position: 'relative',
            width: '100px',
            height: '100px',
            marginBottom: 'var(--space-6)',
            display: 'flex',
            alignItems: 'center',
            justifyContent: 'center',
          }}
        >
          {/* Animated SVG Shield Emblem */}
          <svg viewBox="0 0 100 100" width="100" height="100" style={{ filter: 'drop-shadow(0 0 24px rgba(37, 99, 235, 0.6))' }}>
            <defs>
              <linearGradient id="splashGrad" x1="0%" y1="0%" x2="100%" y2="100%">
                <stop offset="0%" stopColor="#3B82F6" />
                <stop offset="50%" stopColor="#4F46E5" />
                <stop offset="100%" stopColor="#6366F1" />
              </linearGradient>
            </defs>
            <path
              d="M 50,8 L 88,24 C 88,68 66,88 50,96 C 34,88 12,68 12,24 Z"
              fill="url(#splashGrad)"
            />
            {/* Inner checkmark */}
            <path
              d="M 32,48 L 45,62 L 70,34"
              fill="none"
              stroke="#FFFFFF"
              strokeWidth="7"
              strokeLinecap="round"
              strokeLinejoin="round"
            />
          </svg>
        </div>

        <h1
          style={{
            fontSize: '2.5rem',
            fontWeight: 800,
            letterSpacing: '-0.03em',
            margin: '0 0 var(--space-2) 0',
            background: 'linear-gradient(180deg, #FFFFFF 0%, #CBD5E1 100%)',
            WebkitBackgroundClip: 'text',
            WebkitTextFillColor: 'transparent',
          }}
        >
          INKGUARD
        </h1>

        <div
          style={{
            display: 'inline-block',
            padding: '4px 12px',
            borderRadius: 'var(--radius-full)',
            background: 'rgba(79, 70, 229, 0.2)',
            border: '1px solid rgba(99, 102, 241, 0.4)',
            fontSize: '0.8125rem',
            fontWeight: 600,
            letterSpacing: '0.08em',
            color: '#93C5FD',
            textTransform: 'uppercase',
            marginBottom: 'var(--space-4)',
          }}
        >
          AI-Assisted Brand Governance Platform
        </div>

        <p
          style={{
            fontSize: '1.0625rem',
            color: '#94A3B8',
            lineHeight: 1.6,
            maxWidth: '440px',
            margin: '0 0 var(--space-8) 0',
            fontWeight: 400,
          }}
        >
          Create with confidence. Publish with consistency.
        </p>

        {/* Progress bar */}
        <div
          style={{
            width: '260px',
            height: '4px',
            background: 'rgba(255, 255, 255, 0.1)',
            borderRadius: '2px',
            overflow: 'hidden',
            marginBottom: 'var(--space-4)',
          }}
        >
          <div
            style={{
              height: '100%',
              width: `${progress}%`,
              background: 'linear-gradient(90deg, #3B82F6, #6366F1)',
              borderRadius: '2px',
              transition: 'width 60ms linear',
            }}
          />
        </div>

        <div
          style={{
            display: 'flex',
            alignItems: 'center',
            justifyContent: 'space-between',
            width: '260px',
            fontSize: '0.75rem',
            color: '#64748B',
          }}
        >
          <span>Initializing governance engine...</span>
          <button
            onClick={onComplete}
            style={{
              color: '#93C5FD',
              background: 'none',
              border: 'none',
              cursor: 'pointer',
              display: 'flex',
              alignItems: 'center',
              gap: '4px',
              fontSize: '0.75rem',
              fontWeight: 500,
            }}
          >
            Skip <ArrowRight size={12} />
          </button>
        </div>
      </div>
    </div>
  );
}
