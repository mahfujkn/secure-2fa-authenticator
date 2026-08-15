import React from 'react';
import { AlertCircle } from 'lucide-react';
import { EphemeralErrorEntry } from '../../types/quickTotp';

export interface QuickTotpWarningProps {
  errors: EphemeralErrorEntry[];
}

export const QuickTotpWarning: React.FC<QuickTotpWarningProps> = ({ errors }) => {
  if (errors.length === 0) return null;

  return (
    <div
      style={{
        display: 'flex',
        flexDirection: 'column',
        gap: '6px',
        marginTop: '6px',
      }}
      className="animate-fade-in"
    >
      {errors.map((err) => (
        <div
          key={err.lineNumber}
          style={{
            padding: '6px 10px',
            backgroundColor: 'var(--color-warning-subtle)',
            border: '1px solid rgba(245, 158, 11, 0.25)',
            borderRadius: 'var(--radius-md)',
            display: 'flex',
            alignItems: 'center',
            gap: '8px',
            fontSize: '11px',
            color: 'var(--color-warning)',
          }}
        >
          <AlertCircle size={13} style={{ flexShrink: 0 }} />
          <span>
            <strong>Line {err.lineNumber}:</strong> {err.errorMessage}
          </span>
        </div>
      ))}
    </div>
  );
};
