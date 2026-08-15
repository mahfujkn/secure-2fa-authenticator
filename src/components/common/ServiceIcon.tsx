import React from 'react';
import { Shield } from 'lucide-react';

export interface ServiceIconProps {
  issuer: string;
  size?: number;
}

// Generate consistent background color based on name hash
function getMonogramColor(name: string): { bg: string; text: string } {
  const colors = [
    { bg: 'rgba(59, 130, 246, 0.18)', text: '#60A5FA' }, // Blue
    { bg: 'rgba(16, 185, 129, 0.18)', text: '#34D399' }, // Emerald
    { bg: 'rgba(139, 92, 246, 0.18)', text: '#A78BFA' }, // Purple
    { bg: 'rgba(245, 158, 11, 0.18)', text: '#FBBF24' }, // Amber
    { bg: 'rgba(6, 182, 212, 0.18)', text: '#22D3EE' },  // Cyan
    { bg: 'rgba(236, 72, 153, 0.18)', text: '#F472B6' }, // Pink
    { bg: 'rgba(99, 102, 241, 0.18)', text: '#818CF8' }, // Indigo
  ];

  let hash = 0;
  for (let i = 0; i < name.length; i++) {
    hash = name.charCodeAt(i) + ((hash << 5) - hash);
  }
  const index = Math.abs(hash) % colors.length;
  return colors[index];
}

// Get initials: e.g. "Google" -> "G", "GitHub" -> "GH", "Amazon Web Services" -> "AWS"
function getInitials(name: string): string {
  if (!name) return 'OTP';
  const parts = name.trim().split(/[\s_-]+/);
  if (parts.length >= 2) {
    return (parts[0][0] + parts[1][0]).toUpperCase();
  }
  return name.slice(0, 2).toUpperCase();
}

export const ServiceIcon: React.FC<ServiceIconProps> = ({ issuer, size = 36 }) => {
  const clean = (issuer || 'TOTP').trim();
  const { bg, text } = getMonogramColor(clean);
  const initials = getInitials(clean);

  return (
    <div
      style={{
        width: `${size}px`,
        height: `${size}px`,
        borderRadius: 'var(--radius-md)',
        backgroundColor: bg,
        color: text,
        display: 'flex',
        alignItems: 'center',
        justifyContent: 'center',
        fontWeight: 700,
        fontSize: size <= 32 ? '11px' : '13px',
        letterSpacing: '0.04em',
        userSelect: 'none',
        flexShrink: 0,
        border: `1px solid ${text}22`,
      }}
      title={issuer}
    >
      {clean.toLowerCase().includes('quick') ? (
        <Shield size={size * 0.55} />
      ) : (
        initials
      )}
    </div>
  );
};
