import React from 'react';

export type BadgeVariant = 'default' | 'primary' | 'success' | 'warning' | 'danger' | 'quick-totp';

export interface BadgeProps {
  children: React.ReactNode;
  variant?: BadgeVariant;
  icon?: React.ReactNode;
  size?: 'sm' | 'md';
}

export const Badge: React.FC<BadgeProps> = ({
  children,
  variant = 'default',
  icon,
  size = 'sm',
}) => {
  const getVariantStyles = (): React.CSSProperties => {
    switch (variant) {
      case 'primary':
        return {
          backgroundColor: 'var(--color-primary-subtle)',
          color: 'var(--color-primary-hover)',
          border: '1px solid rgba(59, 130, 246, 0.25)',
        };
      case 'quick-totp':
        return {
          backgroundColor: 'var(--color-quick-totp-subtle)',
          color: 'var(--color-quick-totp-hover)',
          border: '1px solid rgba(139, 92, 246, 0.25)',
        };
      case 'success':
        return {
          backgroundColor: 'var(--color-success-subtle)',
          color: 'var(--color-success)',
          border: '1px solid rgba(16, 185, 129, 0.25)',
        };
      case 'warning':
        return {
          backgroundColor: 'var(--color-warning-subtle)',
          color: 'var(--color-warning)',
          border: '1px solid rgba(245, 158, 11, 0.25)',
        };
      case 'danger':
        return {
          backgroundColor: 'var(--color-danger-subtle)',
          color: 'var(--color-danger-hover)',
          border: '1px solid rgba(239, 68, 68, 0.25)',
        };
      case 'default':
      default:
        return {
          backgroundColor: 'var(--color-bg-surface-raised)',
          color: 'var(--color-text-secondary)',
          border: '1px solid var(--color-border-subtle)',
        };
    }
  };

  return (
    <span
      style={{
        display: 'inline-flex',
        alignItems: 'center',
        gap: '4px',
        fontSize: size === 'sm' ? '11px' : '12px',
        fontWeight: 500,
        padding: size === 'sm' ? '2px 6px' : '3px 8px',
        borderRadius: 'var(--radius-pill)',
        lineHeight: 1,
        userSelect: 'none',
        ...getVariantStyles(),
      }}
    >
      {icon}
      {children}
    </span>
  );
};
