import React from 'react';

export default function ComplianceScoreRing({ score = 0, size = 140, strokeWidth = 10, showDetails = true, label = 'Compliance Score' }) {
  const safeScore = Math.max(0, Math.min(100, Math.round(score || 0)));
  const radius = (size - strokeWidth) / 2;
  const circumference = 2 * Math.PI * radius;
  const strokeDashoffset = circumference - (safeScore / 100) * circumference;

  let color = '#10B981'; // Green
  let grade = 'Excellent';
  let gradeBg = '#ECFDF5';

  if (safeScore < 55) {
    color = '#EF4444'; // Red
    grade = 'High Risk';
    gradeBg = '#FEF2F2';
  } else if (safeScore < 75) {
    color = '#F59E0B'; // Amber
    grade = 'Needs Revision';
    gradeBg = '#FFFBEB';
  } else if (safeScore < 90) {
    color = '#2563EB'; // Royal Blue
    grade = 'Strong';
    gradeBg = '#EFF6FF';
  }

  return (
    <div style={{ display: 'flex', flexDirection: 'column', alignItems: 'center', gap: '8px' }}>
      <div style={{ position: 'relative', width: size, height: size }}>
        <svg width={size} height={size} style={{ transform: 'rotate(-90deg)' }}>
          {/* Background circle */}
          <circle
            cx={size / 2}
            cy={size / 2}
            r={radius}
            fill="transparent"
            stroke="#E2E8F0"
            strokeWidth={strokeWidth}
          />
          {/* Progress circle */}
          <circle
            cx={size / 2}
            cy={size / 2}
            r={radius}
            fill="transparent"
            stroke={color}
            strokeWidth={strokeWidth}
            strokeDasharray={circumference}
            strokeDashoffset={strokeDashoffset}
            strokeLinecap="round"
            style={{ transition: 'stroke-dashoffset 0.8s cubic-bezier(0.4, 0, 0.2, 1)' }}
          />
        </svg>

        {/* Centered Score */}
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
          <span style={{ fontSize: size * 0.25, fontWeight: 800, color: 'var(--text-primary)', lineHeight: 1 }}>
            {safeScore}%
          </span>
          {showDetails && (
            <span style={{ fontSize: '0.6875rem', fontWeight: 600, color: 'var(--text-tertiary)', textTransform: 'uppercase', marginTop: '4px' }}>
              Score
            </span>
          )}
        </div>
      </div>

      {showDetails && (
        <div style={{ textAlign: 'center' }}>
          <span
            style={{
              display: 'inline-block',
              padding: '2px 10px',
              borderRadius: 'var(--radius-full)',
              background: gradeBg,
              color: color,
              fontSize: '0.75rem',
              fontWeight: 700,
              border: `1px solid ${color}40`,
            }}
          >
            {grade}
          </span>
        </div>
      )}
    </div>
  );
}
