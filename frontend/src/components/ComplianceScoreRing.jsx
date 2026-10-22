import React from 'react';
import { Check } from 'lucide-react';

export default function ComplianceScoreRing({
  score = 92,
  size = 140,
  strokeWidth = 12,
  showBadge = true,
  showDetails = false,
  label = 'Compliance Score',
}) {
  const safeScore = Math.max(0, Math.min(100, Math.round(score || 0)));
  const radius = (size - strokeWidth) / 2;
  const circumference = 2 * Math.PI * radius;
  const strokeDashoffset = circumference - (safeScore / 100) * circumference;

  let color = '#2563EB'; // Royal blue by default as in reference screenshot
  let grade = 'Excellent';
  let badgeColor = '#10B981'; // Emerald check

  if (safeScore < 55) {
    color = '#EF4444';
    grade = 'High Risk';
    badgeColor = '#EF4444';
  } else if (safeScore < 75) {
    color = '#F59E0B';
    grade = 'Needs Revision';
    badgeColor = '#F59E0B';
  } else if (safeScore < 90) {
    color = '#2563EB';
    grade = 'Strong';
    badgeColor = '#10B981';
  } else {
    color = '#2563EB';
    grade = 'Excellent';
    badgeColor = '#10B981';
  }

  // Calculate position of the docked badge on the circumference (at ~0 degrees, 3 o'clock)
  const badgeSize = Math.max(22, Math.round(size * 0.18));
  const badgeRight = strokeWidth / 4;
  const badgeTop = size / 2 - badgeSize / 2;

  return (
    <div style={{ display: 'inline-flex', flexDirection: 'column', alignItems: 'center' }}>
      <div style={{ position: 'relative', width: size, height: size }}>
        <svg width={size} height={size} style={{ transform: 'rotate(-90deg)' }}>
          {/* Background Track */}
          <circle
            cx={size / 2}
            cy={size / 2}
            r={radius}
            fill="transparent"
            stroke="#EEF2F6"
            strokeWidth={strokeWidth}
          />
          {/* Active Gradient Arc */}
          <defs>
            <linearGradient id="scoreArcGrad" x1="0%" y1="0%" x2="100%" y2="100%">
              <stop offset="0%" stopColor="#3B82F6" />
              <stop offset="100%" stopColor="#1D4ED8" />
            </linearGradient>
          </defs>
          <circle
            cx={size / 2}
            cy={size / 2}
            r={radius}
            fill="transparent"
            stroke="url(#scoreArcGrad)"
            strokeWidth={strokeWidth}
            strokeDasharray={circumference}
            strokeDashoffset={strokeDashoffset}
            strokeLinecap="round"
            style={{ transition: 'stroke-dashoffset 1s cubic-bezier(0.4, 0, 0.2, 1)' }}
          />
        </svg>

        {/* Centered Score Number */}
        <div
          style={{
            position: 'absolute',
            inset: 0,
            display: 'flex',
            flexDirection: 'column',
            alignItems: 'center',
            justifyContent: 'center',
          }}
        >
          <span
            style={{
              fontSize: `${Math.round(size * 0.26)}px`,
              fontWeight: 800,
              color: '#0F172A',
              letterSpacing: '-0.03em',
              lineHeight: 1,
            }}
          >
            {safeScore}%
          </span>
        </div>

        {/* Docked Circular Verification Badge (Exactly as in Reference Screenshot) */}
        {showBadge && (
          <div
            className="motion-pulse-check"
            style={{
              position: 'absolute',
              top: badgeTop,
              right: badgeRight,
              width: badgeSize,
              height: badgeSize,
              borderRadius: '50%',
              background: badgeColor,
              color: '#FFFFFF',
              display: 'flex',
              alignItems: 'center',
              justifyContent: 'center',
              boxShadow: '0 2px 8px rgba(16, 185, 129, 0.4)',
              border: '2px solid #FFFFFF',
            }}
          >
            <Check size={badgeSize * 0.65} strokeWidth={3.5} />
          </div>
        )}
      </div>

      {showDetails && (
        <div style={{ marginTop: '8px', textAlign: 'center' }}>
          <span
            style={{
              display: 'inline-block',
              padding: '2px 10px',
              borderRadius: 'var(--radius-full)',
              background: '#EFF6FF',
              color: 'var(--color-primary)',
              fontSize: '0.75rem',
              fontWeight: 700,
              border: '1px solid var(--border-light)',
            }}
          >
            {grade}
          </span>
        </div>
      )}
    </div>
  );
}
