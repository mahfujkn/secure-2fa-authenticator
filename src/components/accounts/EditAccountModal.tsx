import React, { useState, useEffect } from 'react';
import { Eye, EyeOff, AlertTriangle, CheckCircle2, AlertCircle, ChevronDown, ChevronRight } from 'lucide-react';
import { Algorithm, Digits, Period, TOTPAccount } from '../../types/account';
import { Modal } from '../common/Modal';
import { Button } from '../common/Button';
import { Input } from '../common/Input';
import { Select } from '../common/Select';
import { isValidBase32, normalizeBase32 } from '../../services/totp/base32';

export interface EditAccountModalProps {
  account: TOTPAccount | null;
  isOpen: boolean;
  onClose: () => void;
  onUpdateAccount: (id: string, updates: Partial<Omit<TOTPAccount, 'id' | 'createdAt'>>) => Promise<unknown>;
}

export const EditAccountModal: React.FC<EditAccountModalProps> = ({
  account,
  isOpen,
  onClose,
  onUpdateAccount,
}) => {
  const [issuer, setIssuer] = useState<string>('');
  const [accountName, setAccountName] = useState<string>('');
  const [secret, setSecret] = useState<string>('');
  const [algorithm, setAlgorithm] = useState<Algorithm>('SHA-1');
  const [digits, setDigits] = useState<Digits>(6);
  const [period, setPeriod] = useState<Period>(30);
  const [showSecret, setShowSecret] = useState<boolean>(false);
  const [isSecretChanged, setIsSecretChanged] = useState<boolean>(false);
  const [showAdvanced, setShowAdvanced] = useState<boolean>(false);

  useEffect(() => {
    if (account) {
      setIssuer(account.issuer);
      setAccountName(account.account);
      setSecret(account.secret);
      setAlgorithm(account.algorithm);
      setDigits(account.digits);
      setPeriod(account.period);
      setIsSecretChanged(false);
      setShowSecret(false);
      setShowAdvanced(false);
    }
  }, [account]);

  if (!account) return null;

  const normalizedSecret = normalizeBase32(secret);
  const isSecretValid = normalizedSecret.length >= 8 && isValidBase32(normalizedSecret);
  const isFormValid = issuer.trim().length > 0 && accountName.trim().length > 0 && isSecretValid;

  const handleSecretChange = (val: string) => {
    setSecret(val);
    setIsSecretChanged(normalizeBase32(val) !== account.secret);
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!isFormValid) return;

    await onUpdateAccount(account.id, {
      issuer: issuer.trim(),
      account: accountName.trim(),
      secret: normalizedSecret,
      algorithm,
      digits,
      period,
    });

    onClose();
  };

  return (
    <Modal
      isOpen={isOpen}
      onClose={onClose}
      title="Edit Account"
      subtitle={`Modify parameters for ${account.issuer}`}
      maxWidth="420px"
      footer={
        <>
          <Button variant="outline" onClick={onClose}>
            Cancel
          </Button>
          <Button variant="primary" onClick={handleSubmit} disabled={!isFormValid}>
            Save Changes
          </Button>
        </>
      }
    >
      <form onSubmit={handleSubmit} style={{ display: 'flex', flexDirection: 'column', gap: '14px' }}>
        <Input
          label="Service / Issuer"
          value={issuer}
          onChange={(e) => setIssuer(e.target.value)}
          required
        />

        <Input
          label="Account / Username"
          value={accountName}
          onChange={(e) => setAccountName(e.target.value)}
          required
        />

        <div>
          <Input
            label="Secret Key"
            type={showSecret ? 'text' : 'password'}
            value={secret}
            onChange={(e) => handleSecretChange(e.target.value)}
            rightIcon={
              <button
                type="button"
                onClick={() => setShowSecret(!showSecret)}
                style={{ color: 'var(--color-text-muted)', display: 'flex', alignItems: 'center' }}
                aria-label={showSecret ? 'Hide secret' : 'Show secret'}
              >
                {showSecret ? <EyeOff size={15} /> : <Eye size={15} />}
              </button>
            }
            required
          />
          {secret.length > 0 && (
            <div style={{ marginTop: '4px', display: 'flex', alignItems: 'center', gap: '4px' }}>
              {isSecretValid ? (
                <span style={{ fontSize: '11px', color: 'var(--color-success)', display: 'flex', alignItems: 'center', gap: '4px', fontWeight: 500 }}>
                  <CheckCircle2 size={12} /> Valid Base32 secret
                </span>
              ) : (
                <span style={{ fontSize: '11px', color: 'var(--color-danger)', display: 'flex', alignItems: 'center', gap: '4px', fontWeight: 500 }}>
                  <AlertCircle size={12} /> Invalid Base32 secret
                </span>
              )}
            </div>
          )}
        </div>

        {/* Warning if secret is changed */}
        {isSecretChanged && (
          <div
            style={{
              padding: '10px 12px',
              backgroundColor: 'var(--color-warning-subtle)',
              border: '1px solid rgba(245, 158, 11, 0.3)',
              borderRadius: 'var(--radius-md)',
              display: 'flex',
              alignItems: 'flex-start',
              gap: '8px',
            }}
          >
            <AlertTriangle size={16} color="var(--color-warning)" style={{ flexShrink: 0, marginTop: '2px' }} />
            <p style={{ fontSize: '11px', color: 'var(--color-warning)', lineHeight: 1.4 }}>
              <strong>Caution:</strong> Changing the secret key will change all generated OTP codes. Ensure this matches your provider's settings.
            </p>
          </div>
        )}

        {/* Expandable Advanced Options */}
        <div style={{ display: 'flex', flexDirection: 'column', gap: '8px', marginTop: '2px' }}>
          <button
            type="button"
            onClick={() => setShowAdvanced(!showAdvanced)}
            style={{
              display: 'inline-flex',
              alignItems: 'center',
              gap: '4px',
              fontSize: '12px',
              fontWeight: 500,
              color: 'var(--color-text-secondary)',
              alignSelf: 'flex-start',
              padding: '2px 0',
            }}
          >
            {showAdvanced ? <ChevronDown size={14} /> : <ChevronRight size={14} />}
            Advanced options
          </button>

          {showAdvanced && (
            <div
              style={{
                display: 'grid',
                gridTemplateColumns: '1fr 1fr 1fr',
                gap: '8px',
                padding: '10px 12px',
                backgroundColor: 'var(--color-bg-input)',
                border: '1px solid var(--color-border-subtle)',
                borderRadius: 'var(--radius-md)',
              }}
              className="animate-slide-down"
            >
              <Select
                label="Algorithm"
                value={algorithm}
                onChange={(e) => setAlgorithm(e.target.value as Algorithm)}
                options={[
                  { value: 'SHA-1', label: 'SHA-1' },
                  { value: 'SHA-256', label: 'SHA-256' },
                  { value: 'SHA-512', label: 'SHA-512' },
                ]}
              />

              <Select
                label="Digits"
                value={digits}
                onChange={(e) => setDigits(parseInt(e.target.value, 10) as Digits)}
                options={[
                  { value: 6, label: '6 digits' },
                  { value: 8, label: '8 digits' },
                ]}
              />

              <Select
                label="Period"
                value={period}
                onChange={(e) => setPeriod(parseInt(e.target.value, 10) as Period)}
                options={[
                  { value: 30, label: '30s' },
                  { value: 60, label: '60s' },
                ]}
              />
            </div>
          )}
        </div>
      </form>
    </Modal>
  );
};
