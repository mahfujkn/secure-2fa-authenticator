import React from 'react';

export interface SwitchProps {
  id?: string;
  checked: boolean;
  onChange: (checked: boolean) => void;
  label?: string;
  helperText?: string;
  disabled?: boolean;
}

export const Switch: React.FC<SwitchProps> = ({
  id,
  checked,
  onChange,
  label,
  helperText,
  disabled = false,
}) => {
  const switchId = id || (label ? `switch-${label.toLowerCase().replace(/\s+/g, '-')}` : undefined);

  return (
    <div
      style={{
        display: 'flex',
        alignItems: 'flex-start',
        justifyContent: 'space-between',
        gap: '12px',
        opacity: disabled ? 0.5 : 1,
      }}
    >
      <div style={{ flex: 1 }}>
        {label && (
          <label
            htmlFor={switchId}
            style={{
              fontSize: '13px',
              fontWeight: 500,
              color: 'var(--color-text-primary)',
              cursor: disabled ? 'not-allowed' : 'pointer',
              display: 'block',
            }}
          >
            {label}
          </label>
        )}
        {helperText && (
          <p
            style={{
              fontSize: '11px',
              color: 'var(--color-text-muted)',
              marginTop: '2px',
              lineHeight: 1.3,
            }}
          >
            {helperText}
          </p>
        )}
      </div>

      <button
        id={switchId}
        type="button"
        role="switch"
        aria-checked={checked}
        aria-label={label || 'Toggle switch'}
        disabled={disabled}
        onClick={() => onChange(!checked)}
        style={{
          width: '42px',
          height: '24px',
          backgroundColor: checked ? 'var(--color-primary)' : 'var(--color-border-default)',
          borderRadius: 'var(--radius-pill)',
          position: 'relative',
          padding: '2px',
          transition: 'background-color var(--transition-fast)',
          cursor: disabled ? 'not-allowed' : 'pointer',
          flexShrink: 0,
          border: 'none',
          outline: 'none',
        }}
      >
        <div
          style={{
            width: '20px',
            height: '20px',
            backgroundColor: '#ffffff',
            borderRadius: 'var(--radius-pill)',
            transform: checked ? 'translateX(18px)' : 'translateX(0px)',
            transition: 'transform var(--transition-fast)',
            boxShadow: '0 1px 3px rgba(0,0,0,0.3)',
          }}
        />
      </button>
    </div>
  );
};
