import React, { useState } from 'react';
import { Copy, Check, Plus } from 'lucide-react';
import { EphemeralParsedEntry } from '../../types/quickTotp';
import { TOTPCodeResult } from '../../types/account';
import { Button } from '../common/Button';
import { Badge } from '../common/Badge';
import { ProgressRing } from '../common/ProgressRing';
import { copyToClipboard } from '../../services/clipboard/clipboardManager';

export interface QuickTotpCardProps {
  entry: EphemeralParsedEntry;
  codeResult?: TOTPCodeResult;
  onSaveToAccounts: (entry: EphemeralParsedEntry) => void;
}

export const QuickTotpCard: React.FC<QuickTotpCardProps> = ({
  entry,
  codeResult,
  onSaveToAccounts,
}) => {
  const [isCopied, setIsCopied] = useState<boolean>(false);

  const handleCopy = async () => {
    if (!codeResult?.code) return;
    const success = await copyToClipboard(codeResult.code);
    if (success) {
      setIsCopied(true);
      setTimeout(() => setIsCopied(false), 2000);
    }
  };

  return (
    <div
      style={{
        backgroundColor: 'var(--color-bg-card)',
        border: '1px solid var(--color-border-subtle)',
        borderRadius: 'var(--radius-lg)',
        padding: '12px 14px',
        display: 'flex',
        flexDirection: 'column',
        gap: '10px',
        position: 'relative',
        boxShadow: 'var(--shadow-sm)',
      }}
      className="quick-totp-card animate-fade-in"
    >
      {/* Header */}
      <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', gap: '8px' }}>
        <div style={{ minWidth: 0, flex: 1 }}>
          <div style={{ display: 'flex', alignItems: 'center', gap: '6px' }}>
            <h4
              style={{
                fontSize: '13px',
                fontWeight: 600,
                color: 'var(--color-text-primary)',
              }}
              className="truncate"
            >
              {entry.issuer}
            </h4>
            <Badge variant="quick-totp" size="sm">
              Line {entry.lineNumber}
            </Badge>
          </div>
          {entry.account && (
            <p
              style={{
                fontSize: '11px',
                color: 'var(--color-text-secondary)',
                marginTop: '1px',
              }}
              className="truncate"
            >
              {entry.account}
            </p>
          )}
        </div>

        <Button
          variant="outline"
          size="sm"
          onClick={() => onSaveToAccounts(entry)}
          title="Save permanently to local accounts"
          icon={<Plus size={12} />}
          style={{ fontSize: '11px', height: '26px', padding: '0 8px' }}
        >
          Save
        </Button>
      </div>

      {/* Code and Copy */}
      <div
        style={{
          display: 'flex',
          alignItems: 'center',
          justifyContent: 'space-between',
          gap: '8px',
        }}
      >
        <span
          className="otp-number"
          style={{
            fontSize: '24px',
            color: 'var(--color-text-primary)',
            letterSpacing: '0.08em',
            lineHeight: 1,
          }}
        >
          {codeResult?.formattedCode || '------'}
        </span>

        <Button
          variant={isCopied ? 'primary' : 'quick-totp'}
          size="sm"
          onClick={handleCopy}
          icon={isCopied ? <Check size={14} /> : <Copy size={14} />}
          style={{
            minWidth: '78px',
            backgroundColor: isCopied ? 'var(--color-success)' : undefined,
          }}
        >
          {isCopied ? 'Copied' : 'Copy'}
        </Button>
      </div>

      {/* Countdown progress bar */}
      {codeResult && (
        <ProgressRing
          secondsRemaining={codeResult.secondsRemaining}
          totalPeriod={codeResult.totalPeriod}
          progressPercent={codeResult.progressPercent}
          type="bar"
        />
      )}
    </div>
  );
};
