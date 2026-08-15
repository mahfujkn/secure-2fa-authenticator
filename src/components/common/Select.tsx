import React from 'react';

export interface SelectOption {
  value: string | number;
  label: string;
}

export interface SelectProps extends React.SelectHTMLAttributes<HTMLSelectElement> {
  label?: string;
  options: SelectOption[];
  helperText?: string;
  fullWidth?: boolean;
}

export const Select: React.FC<SelectProps> = ({
  label,
  options,
  helperText,
  fullWidth = true,
  className = '',
  style,
  id,
  ...props
}) => {
  const generatedId = id || (label ? `select-${label.toLowerCase().replace(/\s+/g, '-')}` : undefined);

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
          border: '1px solid var(--color-border-default)',
          borderRadius: 'var(--radius-md)',
          padding: '0 8px',
          height: '38px',
        }}
      >
        <select
          id={generatedId}
          style={{
            flex: 1,
            background: 'transparent',
            border: 'none',
            outline: 'none',
            fontSize: '13px',
            color: 'var(--color-text-primary)',
            cursor: 'pointer',
            ...style,
          }}
          className={className}
          {...props}
        >
          {options.map((opt) => (
            <option
              key={opt.value}
              value={opt.value}
              style={{ backgroundColor: 'var(--color-bg-surface)', color: 'var(--color-text-primary)' }}
            >
              {opt.label}
            </option>
          ))}
        </select>
      </div>

      {helperText && (
        <span style={{ fontSize: '11px', color: 'var(--color-text-muted)', marginTop: '2px' }}>
          {helperText}
        </span>
      )}
    </div>
  );
};
