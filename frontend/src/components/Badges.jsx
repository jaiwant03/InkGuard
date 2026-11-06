import React from 'react';
import { AlertTriangle, AlertCircle, Info, CheckCircle2, Clock, Check, XCircle } from 'lucide-react';

export function SeverityBadge({ severity = 'Medium' }) {
  const norm = severity?.toLowerCase() || 'medium';
  if (norm === 'high') {
    return (
      <span className="badge badge-high">
        <AlertTriangle size={12} />
        High Risk
      </span>
    );
  }
  if (norm === 'medium') {
    return (
      <span className="badge badge-medium">
        <AlertCircle size={12} />
        Medium
      </span>
    );
  }
  return (
    <span className="badge badge-low">
      <Info size={12} />
      Low
    </span>
  );
}

export function ClaimStatusBadge({ status }) {
  if (status === 'Supported by an approved source') {
    return (
      <span
        style={{
          display: 'inline-flex',
          alignItems: 'center',
          gap: '4px',
          padding: '2px 8px',
          borderRadius: 'var(--radius-full)',
          background: '#ECFDF5',
          color: '#065F46',
          border: '1px solid #A7F3D0',
          fontSize: '0.75rem',
          fontWeight: 600,
        }}
      >
        <Check size={12} />
        Supported by Approved Fact
      </span>
    );
  }

  if (status === 'Potentially inconsistent') {
    return (
      <span
        style={{
          display: 'inline-flex',
          alignItems: 'center',
          gap: '4px',
          padding: '2px 8px',
          borderRadius: 'var(--radius-full)',
          background: '#FFFBEB',
          color: '#92400E',
          border: '1px solid #FDE68A',
          fontSize: '0.75rem',
          fontWeight: 600,
        }}
      >
        <AlertTriangle size={12} />
        Potentially Inconsistent
      </span>
    );
  }

  return (
    <span
      style={{
        display: 'inline-flex',
        alignItems: 'center',
        gap: '4px',
        padding: '2px 8px',
        borderRadius: 'var(--radius-full)',
        background: '#EFF6FF',
        color: '#1E40AF',
        border: '1px solid #BFDBFE',
        fontSize: '0.75rem',
        fontWeight: 600,
      }}
    >
      <Clock size={12} />
      Needs Verification
    </span>
  );
}

export function WorkflowStatusBadge({ status = 'Draft' }) {
  const map = {
    Draft: { bg: '#F1F5F9', color: '#475569', border: '#E2E8F0', icon: Clock },
    'In Review': { bg: '#EFF6FF', color: '#1D4ED8', border: '#BFDBFE', icon: Clock },
    'Changes Requested': { bg: '#FFFBEB', color: '#B45309', border: '#FCD34D', icon: AlertCircle },
    Approved: { bg: '#ECFDF5', color: '#047857', border: '#A7F3D0', icon: CheckCircle2 },
    Rejected: { bg: '#FEF2F2', color: '#B91C1C', border: '#FCA5A5', icon: XCircle },
  };

  const current = map[status] || map.Draft;
  const Icon = current.icon;

  return (
    <span
      style={{
        display: 'inline-flex',
        alignItems: 'center',
        gap: '4px',
        padding: '3px 10px',
        borderRadius: 'var(--radius-full)',
        background: current.bg,
        color: current.color,
        border: `1px solid ${current.border}`,
        fontSize: '0.75rem',
        fontWeight: 600,
      }}
    >
      <Icon size={12} />
      {status}
    </span>
  );
}
