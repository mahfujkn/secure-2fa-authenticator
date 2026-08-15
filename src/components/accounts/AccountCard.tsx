import React, { useState, useEffect } from 'react';
import { Star, MoreVertical, Copy, Check, Edit2, Trash2, Eye, EyeOff } from 'lucide-react';
import { TOTPAccount, TOTPCodeResult } from '../../types/account';
import { Button } from '../common/Button';
import { ServiceIcon } from '../common/ServiceIcon';
import { ProgressRing } from '../common/ProgressRing';
import { Badge } from '../common/Badge';
import { copyToClipboard } from '../../services/clipboard/clipboardManager';

export interface AccountCardProps {
  account: TOTPAccount;
  codeResult?: TOTPCodeResult;
  timerStyle?: 'bar' | 'ring';
  density?: 'compact' | 'comfortable';
  hideCodeByDefault?: boolean;
  onEdit: (account: TOTPAccount) => void;
  onDelete: (account: TOTPAccount) => void;
  onToggleFavorite: (id: string) => void;
}

export const AccountCard: React.FC<AccountCardProps> = ({
  account,
  codeResult,
  timerStyle = 'bar',
  density = 'comfortable',
  hideCodeByDefault = false,
  onEdit,
  onDelete,
  onToggleFavorite,
}) => {
  const [isCopied, setIsCopied] = useState<boolean>(false);
  const [isMenuOpen, setIsMenuOpen] = useState<boolean>(false);
  const [isCodeHidden, setIsCodeHidden] = useState<boolean>(hideCodeByDefault);

  // Sync with global setting changes
  useEffect(() => {
    setIsCodeHidden(hideCodeByDefault);
  }, [hideCodeByDefault]);

  const handleCopy = async (e?: React.MouseEvent) => {
    if (e) e.stopPropagation();
    if (!codeResult?.code) return;

    const success = await copyToClipboard(codeResult.code);
    if (success) {
      setIsCopied(true);
      setTimeout(() => setIsCopied(false), 2000);
    }
  };

  const isCompact = density === 'compact';

  // Format masked placeholder to match digit count and layout (6 vs 8)
  const getMaskedCode = () => {
    if (account.digits === 8) {
      return '•••• ••••';
    }
    return '••• •••';
  };

  return (
    <div
      style={{
        backgroundColor: 'var(--color-bg-card)',
        border: '1px solid var(--color-border-subtle)',
        borderRadius: 'var(--radius-lg)',
        padding: isCompact ? '10px 14px' : '14px 16px',
        display: 'flex',
        flexDirection: 'column',
        gap: isCompact ? '8px' : '12px',
        position: 'relative',
        transition: 'all var(--transition-fast)',
        boxShadow: 'var(--shadow-sm)',
      }}
      className="account-card"
    >
      {/* Top Header Row */}
      <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', gap: '8px' }}>
        <div style={{ display: 'flex', alignItems: 'center', gap: '10px', minWidth: 0, flex: 1 }}>
          <ServiceIcon issuer={account.issuer} size={isCompact ? 28 : 34} />
          <div style={{ minWidth: 0, flex: 1 }}>
            <div style={{ display: 'flex', alignItems: 'center', gap: '6px' }}>
              <h4
                style={{
                  fontSize: isCompact ? '13px' : '14px',
                  fontWeight: 600,
                  color: 'var(--color-text-primary)',
                  lineHeight: 1.2,
                }}
                className="truncate"
              >
                {account.issuer}
              </h4>
              {account.isFavorite && (
                <Star size={13} fill="#F59E0B" color="#F59E0B" style={{ flexShrink: 0 }} />
              )}
            </div>
            <p
              style={{
                fontSize: isCompact ? '11px' : '12px',
                color: 'var(--color-text-secondary)',
                lineHeight: 1.2,
                marginTop: '2px',
              }}
              className="truncate"
            >
              {account.account}
            </p>
          </div>
        </div>

        {/* Action icons */}
        <div style={{ display: 'flex', alignItems: 'center', gap: '2px', position: 'relative' }}>
          <Button
            variant="ghost"
            size="icon"
            onClick={() => onToggleFavorite(account.id)}
            title={account.isFavorite ? 'Unpin account' : 'Pin to favorites'}
            aria-label={account.isFavorite ? 'Unpin account' : 'Pin to favorites'}
            style={{ width: '28px', height: '28px' }}
          >
            <Star
              size={14}
              color={account.isFavorite ? '#F59E0B' : 'var(--color-text-muted)'}
              fill={account.isFavorite ? '#F59E0B' : 'transparent'}
            />
          </Button>

          <Button
            variant="ghost"
            size="icon"
            onClick={() => setIsMenuOpen(!isMenuOpen)}
            title="More options"
            aria-label="More options"
            style={{ width: '28px', height: '28px' }}
          >
            <MoreVertical size={14} color="var(--color-text-muted)" />
          </Button>

          {/* Context Dropdown Menu */}
          {isMenuOpen && (
            <>
              <div
                style={{ position: 'fixed', inset: 0, zIndex: 100 }}
                onClick={() => setIsMenuOpen(false)}
              />
              <div
                style={{
                  position: 'absolute',
                  top: '100%',
                  right: 0,
                  backgroundColor: 'var(--color-bg-surface-raised)',
                  border: '1px solid var(--color-border-default)',
                  borderRadius: 'var(--radius-md)',
                  boxShadow: 'var(--shadow-md)',
                  padding: '4px',
                  zIndex: 101,
                  minWidth: '130px',
                  display: 'flex',
                  flexDirection: 'column',
                  gap: '2px',
                }}
                className="animate-slide-down"
              >
                <button
                  style={{
                    display: 'flex',
                    alignItems: 'center',
                    gap: '8px',
                    padding: '6px 10px',
                    fontSize: '12px',
                    color: 'var(--color-text-primary)',
                    borderRadius: 'var(--radius-sm)',
                    textAlign: 'left',
                    width: '100%',
                  }}
                  onClick={() => {
                    setIsCodeHidden(!isCodeHidden);
                    setIsMenuOpen(false);
                  }}
                >
                  {isCodeHidden ? <Eye size={13} /> : <EyeOff size={13} />}
                  {isCodeHidden ? 'Show Code' : 'Hide Code'}
                </button>
                <button
                  style={{
                    display: 'flex',
                    alignItems: 'center',
                    gap: '8px',
                    padding: '6px 10px',
                    fontSize: '12px',
                    color: 'var(--color-text-primary)',
                    borderRadius: 'var(--radius-sm)',
                    textAlign: 'left',
                    width: '100%',
                  }}
                  onClick={() => {
                    setIsMenuOpen(false);
                    onEdit(account);
                  }}
                >
                  <Edit2 size={13} />
                  Edit
                </button>
                <button
                  style={{
                    display: 'flex',
                    alignItems: 'center',
                    gap: '8px',
                    padding: '6px 10px',
                    fontSize: '12px',
                    color: 'var(--color-danger)',
                    borderRadius: 'var(--radius-sm)',
                    textAlign: 'left',
                    width: '100%',
                  }}
                  onClick={() => {
                    setIsMenuOpen(false);
                    onDelete(account);
                  }}
                >
                  <Trash2 size={13} />
                  Delete
                </button>
              </div>
            </>
          )}
        </div>
      </div>

      {/* Main OTP Code & Action Display */}
      <div
        style={{
          display: 'flex',
          alignItems: 'center',
          justifyContent: 'space-between',
          gap: '8px',
        }}
      >
        <div style={{ display: 'flex', alignItems: 'center', gap: '8px' }}>
          <span
            className="otp-number"
            style={{
              fontSize: isCompact ? '22px' : '26px',
              color: 'var(--color-text-primary)',
              letterSpacing: '0.08em',
              fontWeight: 700,
              lineHeight: 1,
            }}
          >
            {isCodeHidden ? getMaskedCode() : codeResult?.formattedCode || '------'}
          </span>

          <Button
            variant="ghost"
            size="icon"
            onClick={() => setIsCodeHidden(!isCodeHidden)}
            title={isCodeHidden ? 'Show code' : 'Hide code'}
            aria-label={isCodeHidden ? 'Show code' : 'Hide code'}
            style={{ width: '24px', height: '24px', color: 'var(--color-text-muted)' }}
          >
            {isCodeHidden ? <Eye size={14} /> : <EyeOff size={14} />}
          </Button>

          {account.period === 60 && (
            <Badge variant="default" size="sm">60s</Badge>
          )}
          {account.algorithm !== 'SHA-1' && (
            <Badge variant="default" size="sm">{account.algorithm}</Badge>
          )}
        </div>

        {/* Copy Button */}
        <Button
          variant={isCopied ? 'primary' : 'secondary'}
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

      {/* Countdown Progress Bar / Ring */}
      {codeResult && (
        <ProgressRing
          secondsRemaining={codeResult.secondsRemaining}
          totalPeriod={codeResult.totalPeriod}
          progressPercent={codeResult.progressPercent}
          type={timerStyle}
          size={24}
        />
      )}
    </div>
  );
};
