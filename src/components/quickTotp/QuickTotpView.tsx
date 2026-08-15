import React, { useState } from 'react';
import { Zap, ShieldCheck, Lock, Trash2, ArrowLeft, Plus } from 'lucide-react';
import { EphemeralParsedEntry } from '../../types/quickTotp';
import { TOTPAccount } from '../../types/account';
import { useQuickTotp } from '../../hooks/useQuickTotp';
import { QuickTotpCard } from './QuickTotpCard';
import { QuickTotpWarning } from './QuickTotpWarning';
import { Button } from '../common/Button';
import { Badge } from '../common/Badge';
import { Modal } from '../common/Modal';

export interface QuickTotpViewProps {
  timestampSeconds: number;
  onBack: () => void;
  onSavePermanentAccount: (accountData: Omit<TOTPAccount, 'id' | 'createdAt' | 'updatedAt'>) => Promise<unknown>;
}

export const QuickTotpView: React.FC<QuickTotpViewProps> = ({
  timestampSeconds,
  onBack,
  onSavePermanentAccount,
}) => {
  const {
    textInput,
    setTextInput,
    validEntries,
    invalidEntries,
    itemsWithCodes,
    clear,
  } = useQuickTotp(timestampSeconds);

  const [saveTargetEntry, setSaveTargetEntry] = useState<EphemeralParsedEntry | null>(null);

  const handleConfirmSave = async () => {
    if (!saveTargetEntry) return;

    await onSavePermanentAccount({
      issuer: saveTargetEntry.issuer.startsWith('Temporary Code') ? 'Saved Account' : saveTargetEntry.issuer,
      account: saveTargetEntry.account === 'Quick TOTP (Not Saved)' ? 'Account' : saveTargetEntry.account,
      secret: saveTargetEntry.normalizedSecret,
      algorithm: saveTargetEntry.algorithm,
      digits: saveTargetEntry.digits,
      period: saveTargetEntry.period,
      isFavorite: false,
    });

    setSaveTargetEntry(null);
  };

  return (
    <div
      style={{
        display: 'flex',
        flexDirection: 'column',
        gap: '14px',
        flex: 1,
      }}
      className="animate-fade-in"
    >
      {/* Top Banner with Privacy Info */}
      <div
        style={{
          padding: '12px',
          backgroundColor: 'var(--color-quick-totp-subtle)',
          border: '1px solid rgba(139, 92, 246, 0.25)',
          borderRadius: 'var(--radius-lg)',
          display: 'flex',
          flexDirection: 'column',
          gap: '8px',
        }}
      >
        <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between' }}>
          <div style={{ display: 'flex', alignItems: 'center', gap: '8px' }}>
            <Button
              variant="ghost"
              size="icon"
              onClick={onBack}
              title="Back to accounts"
              style={{ width: '28px', height: '28px' }}
            >
              <ArrowLeft size={16} />
            </Button>
            <div
              style={{
                width: '28px',
                height: '28px',
                borderRadius: 'var(--radius-pill)',
                backgroundColor: 'var(--color-quick-totp)',
                color: '#ffffff',
                display: 'flex',
                alignItems: 'center',
                justifyContent: 'center',
              }}
            >
              <Zap size={16} />
            </div>
            <div>
              <h3 style={{ fontSize: '14px', fontWeight: 600, color: 'var(--color-text-primary)' }}>
                Quick TOTP
              </h3>
              <p style={{ fontSize: '11px', color: 'var(--color-text-secondary)' }}>
                Generate temporary codes without saving your secret.
              </p>
            </div>
          </div>
        </div>

        {/* Privacy Badges */}
        <div style={{ display: 'flex', alignItems: 'center', gap: '6px', flexWrap: 'wrap' }}>
          <Badge variant="quick-totp" icon={<Lock size={11} />} size="sm">
            Not saved
          </Badge>
          <Badge variant="quick-totp" icon={<Lock size={11} />} size="sm">
            Not synced
          </Badge>
          <Badge variant="quick-totp" icon={<ShieldCheck size={11} />} size="sm">
            Local memory only
          </Badge>
        </div>
      </div>

      {/* Multi-Key Input Box */}
      <div style={{ display: 'flex', flexDirection: 'column', gap: '6px' }}>
        <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between' }}>
          <label style={{ fontSize: '12px', fontWeight: 600, color: 'var(--color-text-primary)' }}>
            Paste Secrets or OTP URIs (One per line)
          </label>
          {textInput && (
            <Button
              variant="ghost"
              size="sm"
              onClick={clear}
              icon={<Trash2 size={12} />}
              style={{ fontSize: '11px', height: '22px', padding: '0 6px', color: 'var(--color-danger)' }}
            >
              Clear
            </Button>
          )}
        </div>

        <textarea
          rows={3}
          value={textInput}
          onChange={(e) => setTextInput(e.target.value)}
          placeholder={`Paste one or multiple Base32 secrets or otpauth:// URIs...\n\nJBSWY3DPEHPK3PXP\nqtrb t4r2 gch4 invo iis4 ret7 5xzz woul\notpauth://totp/GitHub:user@example.com?secret=...`}
          style={{
            width: '100%',
            backgroundColor: 'var(--color-bg-input)',
            border: '1px solid var(--color-border-default)',
            borderRadius: 'var(--radius-md)',
            padding: '10px 12px',
            fontSize: '12px',
            color: 'var(--color-text-primary)',
            fontFamily: 'var(--font-mono)',
            outline: 'none',
            resize: 'vertical',
            minHeight: '74px',
            maxHeight: '160px',
          }}
          autoFocus
        />

        <p style={{ fontSize: '11px', color: 'var(--color-text-muted)', lineHeight: 1.3 }}>
          Supports raw Base32, spaced/hyphenated keys, and full otpauth:// URIs. Codes generate instantly on paste.
        </p>

        {/* Validation Errors for Invalid Lines */}
        <QuickTotpWarning errors={invalidEntries} />
      </div>

      {/* Real-time Generated Temporary Codes */}
      <div style={{ display: 'flex', flexDirection: 'column', gap: '10px' }}>
        {validEntries.length > 0 && (
          <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', padding: '0 2px' }}>
            <span style={{ fontSize: '11px', fontWeight: 600, textTransform: 'uppercase', letterSpacing: '0.06em', color: 'var(--color-text-secondary)' }}>
              Temporary Codes ({validEntries.length})
            </span>
            <span style={{ fontSize: '11px', color: 'var(--color-text-muted)' }}>
              Ephemeral runtime memory
            </span>
          </div>
        )}

        <div style={{ display: 'flex', flexDirection: 'column', gap: '8px' }}>
          {itemsWithCodes.map(({ entry, codeResult }) => (
            <QuickTotpCard
              key={entry.id}
              entry={entry}
              codeResult={codeResult}
              onSaveToAccounts={(e) => setSaveTargetEntry(e)}
            />
          ))}
        </div>
      </div>

      {/* Confirmation Modal when user explicitly clicks "Save" */}
      <Modal
        isOpen={saveTargetEntry !== null}
        onClose={() => setSaveTargetEntry(null)}
        title="Add Account?"
        subtitle="Save this secret permanently to your local authenticator"
        maxWidth="380px"
        footer={
          <>
            <Button variant="outline" onClick={() => setSaveTargetEntry(null)}>
              Cancel
            </Button>
            <Button
              variant="primary"
              onClick={handleConfirmSave}
              icon={<Plus size={14} />}
            >
              Add Account
            </Button>
          </>
        }
      >
        {saveTargetEntry && (
          <div style={{ display: 'flex', flexDirection: 'column', gap: '10px' }}>
            <div
              style={{
                padding: '12px',
                backgroundColor: 'var(--color-bg-input)',
                borderRadius: 'var(--radius-md)',
                border: '1px solid var(--color-border-subtle)',
              }}
            >
              <p style={{ fontSize: '13px', fontWeight: 600, color: 'var(--color-text-primary)' }}>
                {saveTargetEntry.issuer}
              </p>
              <p style={{ fontSize: '12px', color: 'var(--color-text-secondary)', marginTop: '2px' }}>
                {saveTargetEntry.account}
              </p>
            </div>
            <p style={{ fontSize: '11px', color: 'var(--color-text-muted)', lineHeight: 1.4 }}>
              This secret will be stored locally on your device in your authenticator's encrypted database.
            </p>
          </div>
        )}
      </Modal>
    </div>
  );
};
