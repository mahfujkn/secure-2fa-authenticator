import React from 'react';

export interface InputProps extends React.InputHTMLAttributes<HTMLInputElement> {
  label?: string;
  helperText?: string;
  errorText?: string;
  leftIcon?: React.ReactNode;
  rightIcon?: React.ReactNode;
  fullWidth?: boolean;
}

export const Input: React.FC<InputProps> = ({
  label,
  helperText,
  errorText,
  leftIcon,
  rightIcon,
  fullWidth = true,
  className = '',
  style,
  id,
  ...props
}) => {
  const generatedId = id || (label ? `input-${label.toLowerCase().replace(/\s+/g, '-')}` : undefined);

  return (
    <div style={{ display: 'flex', flexDirection: 'column', gap: '4px', width: fullWidth ? '100%' : 'auto' }}>
      {label && (
        <label
          htmlFor={generatedId}
          style={{
            fontSize: '12px',
            fontWeight: 500,
            color: 'var(--color-text-secondary)',
          }}
        >
          {label}
        </label>
      )}

      <div
        style={{
          display: 'flex',
          alignItems: 'center',
          backgroundColor: 'var(--color-bg-input)',
          border: `1px solid ${errorText ? 'var(--color-danger)' : 'var(--color-border-default)'}`,
          borderRadius: 'var(--radius-md)',
          padding: '0 12px',
          height: '38px',
          transition: 'border-color var(--transition-fast)',
        }}
      >
        {leftIcon && <span style={{ marginRight: '8px', color: 'var(--color-text-muted)', display: 'flex' }}>{leftIcon}</span>}
        <input
          id={generatedId}
          style={{
            flex: 1,
            background: 'transparent',
            border: 'none',
            outline: 'none',
            fontSize: '13px',
            color: 'var(--color-text-primary)',
            width: '100%',
            ...style,
          }}
          className={className}
          {...props}
        />
        {rightIcon && <span style={{ marginLeft: '8px', display: 'flex' }}>{rightIcon}</span>}
      </div>

      {errorText && (
        <span style={{ fontSize: '11px', color: 'var(--color-danger)', marginTop: '2px' }}>
          ✕ {errorText}
        </span>
      )}
      {!errorText && helperText && (
        <span style={{ fontSize: '11px', color: 'var(--color-text-muted)', marginTop: '2px' }}>
          {helperText}
        </span>
      )}
    </div>
  );
};
