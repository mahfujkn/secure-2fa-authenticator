import React, { useState, useEffect } from 'react';
import {
  QrCode,
  KeyRound,
  Eye,
  EyeOff,
  Upload,
  CheckCircle2,
  AlertCircle,
  ChevronDown,
  ChevronRight,
  Check,
  Scan,
  Crop,
  Loader2,
  AlertTriangle,
} from 'lucide-react';
import { Algorithm, Digits, Period, TOTPAccount } from '../../types/account';
import { Modal } from '../common/Modal';
import { Button } from '../common/Button';
import { Input } from '../common/Input';
import { Select } from '../common/Select';
import { Badge } from '../common/Badge';
import { isValidBase32, normalizeBase32 } from '../../services/totp/base32';
import { parseOtpAuthUri, ParsedOtpAuthUri } from '../../services/parser/otpauth';
import { decodeQrFromFile, analyzeQrText } from '../../services/qr/qrDecoder';
import { scanActiveTab, selectQrAreaActiveTab } from '../../services/qr/tabScanner';

export interface AddAccountModalProps {
  isOpen: boolean;
  onClose: () => void;
  onAddAccount: (accountData: Omit<TOTPAccount, 'id' | 'createdAt' | 'updatedAt'>) => Promise<unknown>;
  initialOtpUri?: string;
  initialMode?: 'manual' | 'qr';
  existingAccounts?: TOTPAccount[];
}

type TabType = 'manual' | 'qr';

export const AddAccountModal: React.FC<AddAccountModalProps> = ({
  isOpen,
  onClose,
  onAddAccount,
  initialOtpUri,
  initialMode = 'manual',
  existingAccounts = [],
}) => {
  const [activeTab, setActiveTab] = useState<TabType>(initialMode);
  
  // Primary Form State
  const [issuer, setIssuer] = useState<string>('');
  const [account, setAccount] = useState<string>('');
  const [secret, setSecret] = useState<string>('');
  const [showSecret, setShowSecret] = useState<boolean>(false);

  // TOTP Configuration
  const [algorithm, setAlgorithm] = useState<Algorithm>('SHA-1');
  const [digits, setDigits] = useState<Digits>(6);
  const [period, setPeriod] = useState<Period>(30);
  
  // Tracking if configuration came from OTPAuth URI / QR
  const [isDetectedFromUri, setIsDetectedFromUri] = useState<boolean>(false);
  const [showAdvanced, setShowAdvanced] = useState<boolean>(false);

  // QR Scanning states
  const [isScanningPage, setIsScanningPage] = useState<boolean>(false);
  const [isDragging, setIsDragging] = useState<boolean>(false);
  const [qrError, setQrError] = useState<string>('');
  const [clipboardFeedback, setClipboardFeedback] = useState<string>('');

  // Reset form
  const resetForm = () => {
    setIssuer('');
    setAccount('');
    setSecret('');
    setAlgorithm('SHA-1');
    setDigits(6);
    setPeriod(30);
    setShowSecret(false);
    setIsDetectedFromUri(false);
    setShowAdvanced(false);
    setIsScanningPage(false);
    setIsDragging(false);
    setQrError('');
    setClipboardFeedback('');
    setActiveTab(initialMode);
  };

  // Helper to populate form from parsed OTPAuth URI
  const populateFromParsedUri = (parsed: ParsedOtpAuthUri) => {
    setIssuer(parsed.issuer);
    setAccount(parsed.account);
    setSecret(parsed.secret);
    setAlgorithm(parsed.algorithm);
    setDigits(parsed.digits);
    setPeriod(parsed.period);
    setIsDetectedFromUri(true);
    setActiveTab('manual');
  };

  useEffect(() => {
    if (isOpen) {
      if (initialOtpUri) {
        try {
          const parsed = parseOtpAuthUri(initialOtpUri);
          populateFromParsedUri(parsed);
        } catch {
          // Ignore
        }
      }
    } else {
      resetForm();
    }
  }, [isOpen, initialOtpUri, initialMode]);

  // Validation
  const normalizedSecret = normalizeBase32(secret);
  const isSecretValid = normalizedSecret.length >= 8 && isValidBase32(normalizedSecret);
  const isFormValid = issuer.trim().length > 0 && account.trim().length > 0 && isSecretValid;

  // Duplicate detection
  const duplicateAccount = existingAccounts.find(
    (acc) =>
      acc.secret === normalizedSecret ||
      (acc.issuer.toLowerCase() === issuer.trim().toLowerCase() &&
        acc.account.toLowerCase() === account.trim().toLowerCase())
  );

  // Handle secret input changes (with direct OTPAuth URI auto-detection)
  const handleSecretChange = (val: string) => {
    const trimmed = val.trim();
    if (trimmed.toLowerCase().startsWith('otpauth://')) {
      try {
        const parsed = parseOtpAuthUri(trimmed);
        populateFromParsedUri(parsed);
        return;
      } catch {
        // Ignore
      }
    }

    setSecret(val);
    if (isDetectedFromUri && !trimmed.toLowerCase().startsWith('otpauth://')) {
      setIsDetectedFromUri(false);
    }
  };

  // Process a local File (upload / drag / paste)
  const processImageFile = async (file: File | Blob) => {
    setQrError('');
    try {
      const parsed = await decodeQrFromFile(file);
      populateFromParsedUri(parsed);
    } catch (err: unknown) {
      const msg = err instanceof Error ? err.message : 'QR code not found.';
      setQrError(msg);
    }
  };

  // Clipboard Paste listener (Ctrl+V)
  const handlePaste = (e: React.ClipboardEvent) => {
    if (e.clipboardData.files && e.clipboardData.files.length > 0) {
      const file = e.clipboardData.files[0];
      if (file.type.startsWith('image/')) {
        setClipboardFeedback('QR image detected from clipboard');
        setTimeout(() => setClipboardFeedback(''), 2000);
        processImageFile(file);
      }
    }
  };

  // Scan Active Webpage for QR codes
  const handleScanCurrentPage = async () => {
    setIsScanningPage(true);
    setQrError('');

    try {
      const result = await scanActiveTab();
      setIsScanningPage(false);

      if (!result.success || !result.rawResults) {
        setQrError(result.error || "We couldn't scan the current page for QR codes.");
        return;
      }

      if (result.rawResults.length === 0) {
        setQrError('No QR code detected on current page.');
        return;
      }

      const analyzed = result.rawResults.map(analyzeQrText);
      const totpCandidates = analyzed.filter((c) => c.isTotp && c.parsed);

      if (totpCandidates.length > 0 && totpCandidates[0].parsed) {
        populateFromParsedUri(totpCandidates[0].parsed);
      } else {
        setQrError("We found a QR code, but it doesn't contain a supported TOTP configuration.");
      }
    } catch (err: unknown) {
      setIsScanningPage(false);
      setQrError(err instanceof Error ? err.message : "We couldn't scan the current page.");
    }
  };

  // Select QR Area on Active Webpage
  const handleSelectArea = async () => {
    setQrError('');

    try {
      const result = await selectQrAreaActiveTab();
      if (result.canceled) return;

      if (result.success && result.otpUri) {
        try {
          const analyzed = analyzeQrText(result.otpUri);
          if (analyzed.isTotp && analyzed.parsed) {
            populateFromParsedUri(analyzed.parsed);
          } else {
            setQrError("This selected QR code is not a supported TOTP configuration.");
          }
        } catch (err: unknown) {
          setQrError(err instanceof Error ? err.message : 'Invalid TOTP QR');
        }
      } else {
        setQrError(result.error || 'No QR code found in selected area.');
      }
    } catch (err: unknown) {
      setQrError(err instanceof Error ? err.message : 'Area selection failed.');
    }
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!isFormValid) return;

    await onAddAccount({
      issuer: issuer.trim(),
      account: account.trim(),
      secret: normalizedSecret,
      algorithm,
      digits,
      period,
      isFavorite: false,
    });

    onClose();
  };

  return (
    <Modal
      isOpen={isOpen}
      onClose={onClose}
      title="Add Account"
      subtitle="Add a TOTP account to your authenticator."
      maxWidth="420px"
      footer={
        activeTab === 'manual' ? (
          <>
            <Button variant="outline" onClick={onClose}>
              Cancel
            </Button>
            <Button
              variant="primary"
              onClick={handleSubmit}
              disabled={!isFormValid}
            >
              {duplicateAccount ? 'Add Anyway' : 'Add Account'}
            </Button>
          </>
        ) : undefined
      }
    >
      {/* Top Mode Selector */}
      <div
        style={{
          display: 'grid',
          gridTemplateColumns: '1fr 1fr',
          gap: '4px',
          backgroundColor: 'var(--color-bg-header)',
          border: '1px solid var(--color-border-subtle)',
          padding: '4px',
          borderRadius: 'var(--radius-md)',
          marginBottom: '16px',
        }}
      >
        <button
          type="button"
          onClick={() => setActiveTab('manual')}
          style={{
            padding: '6px',
            fontSize: '12px',
            fontWeight: activeTab === 'manual' ? 600 : 500,
            borderRadius: 'var(--radius-sm)',
            display: 'flex',
            alignItems: 'center',
            justifyContent: 'center',
            gap: '6px',
            backgroundColor: activeTab === 'manual' ? 'var(--color-primary)' : 'transparent',
            color: activeTab === 'manual' ? '#FFFFFF' : 'var(--color-text-secondary)',
            boxShadow: activeTab === 'manual' ? '0 2px 6px rgba(45, 104, 235, 0.35)' : 'none',
            transition: 'all var(--transition-fast)',
          }}
        >
          <KeyRound size={13} />
          Manual / Paste
        </button>

        <button
          type="button"
          onClick={() => setActiveTab('qr')}
          style={{
            padding: '6px',
            fontSize: '12px',
            fontWeight: activeTab === 'qr' ? 600 : 500,
            borderRadius: 'var(--radius-sm)',
            display: 'flex',
            alignItems: 'center',
            justifyContent: 'center',
            gap: '6px',
            backgroundColor: activeTab === 'qr' ? 'var(--color-primary)' : 'transparent',
            color: activeTab === 'qr' ? '#FFFFFF' : 'var(--color-text-secondary)',
            boxShadow: activeTab === 'qr' ? '0 2px 6px rgba(45, 104, 235, 0.35)' : 'none',
            transition: 'all var(--transition-fast)',
          }}
        >
          <QrCode size={13} />
          Scan QR Code
        </button>
      </div>

      {/* Mode 1: Manual / Paste Entry (Simplified 3-field layout) */}
      {activeTab === 'manual' && (
        <form onSubmit={handleSubmit} style={{ display: 'flex', flexDirection: 'column', gap: '14px' }}>
          {/* Duplicate Account Warning */}
          {duplicateAccount && (
            <div
              style={{
                padding: '8px 10px',
                backgroundColor: 'var(--color-warning-subtle)',
                border: '1px solid rgba(245, 158, 11, 0.3)',
                borderRadius: 'var(--radius-md)',
                display: 'flex',
                alignItems: 'center',
                gap: '6px',
              }}
            >
              <AlertTriangle size={14} color="var(--color-warning)" style={{ flexShrink: 0 }} />
              <span style={{ fontSize: '11px', color: 'var(--color-warning)' }}>
                Account already exists: <strong>{duplicateAccount.issuer} ({duplicateAccount.account})</strong>
              </span>
            </div>
          )}

          {/* Field 1: Service / Issuer */}
          <Input
            label="Service / Issuer"
            placeholder="e.g. Google, GitHub, Microsoft"
            value={issuer}
            onChange={(e) => setIssuer(e.target.value)}
            required
            autoFocus
          />

          {/* Field 2: Account / Username */}
          <Input
            label="Account / Username"
            placeholder="e.g. user@gmail.com"
            value={account}
            onChange={(e) => setAccount(e.target.value)}
            required
          />

          {/* Field 3: Secret Key */}
          <div>
            <Input
              label="Secret Key"
              placeholder="Paste Base32 secret or otpauth:// URI"
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

            {/* Live Secret Validation Feedback */}
            {secret.length > 0 && (
              <div style={{ marginTop: '5px', display: 'flex', alignItems: 'center', gap: '4px' }}>
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

          {/* Configuration Status Area */}
          {isSecretValid && (
            <div
              style={{
                padding: '8px 12px',
                backgroundColor: isDetectedFromUri ? 'var(--color-success-subtle)' : 'var(--color-bg-input)',
                border: `1px solid ${isDetectedFromUri ? 'rgba(50, 202, 146, 0.25)' : 'var(--color-border-subtle)'}`,
                borderRadius: 'var(--radius-md)',
                display: 'flex',
                alignItems: 'center',
                gap: '8px',
              }}
              className="animate-fade-in"
            >
              {isDetectedFromUri ? (
                <div style={{ display: 'flex', flexDirection: 'column', gap: '2px' }}>
                  <div style={{ display: 'flex', alignItems: 'center', gap: '4px', fontSize: '11px', fontWeight: 600, color: 'var(--color-success)' }}>
                    <Check size={13} /> TOTP configuration detected
                  </div>
                  <span style={{ fontSize: '11px', color: 'var(--color-text-secondary)' }}>
                    {algorithm} · {digits} digits · {period} seconds
                  </span>
                </div>
              ) : (
                <span style={{ fontSize: '11px', color: 'var(--color-text-muted)' }}>
                  Using standard TOTP settings · {algorithm} · {digits} digits · {period} seconds
                </span>
              )}
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
      )}

      {/* Mode 2: QR Import Suite (Upload, Drag-and-Drop, Page Scan, Area Select) */}
      {activeTab === 'qr' && (
        <div
          onPaste={handlePaste}
          tabIndex={0}
          style={{ outline: 'none', display: 'flex', flexDirection: 'column', gap: '14px' }}
        >
          {/* Upload & Drag-and-Drop Dropzone */}
          <div
            onDragOver={(e) => {
              e.preventDefault();
              setIsDragging(true);
            }}
            onDragLeave={() => setIsDragging(false)}
            onDrop={(e) => {
              e.preventDefault();
              setIsDragging(false);
              if (e.dataTransfer.files && e.dataTransfer.files[0]) {
                processImageFile(e.dataTransfer.files[0]);
              }
            }}
            onClick={() => document.getElementById('add-account-qr-input')?.click()}
            style={{
              border: `2px dashed ${isDragging ? 'var(--color-primary)' : 'var(--color-border-default)'}`,
              borderRadius: 'var(--radius-lg)',
              padding: '24px 16px',
              display: 'flex',
              flexDirection: 'column',
              alignItems: 'center',
              justifyContent: 'center',
              textAlign: 'center',
              backgroundColor: isDragging ? 'var(--color-primary-subtle)' : 'var(--color-bg-input)',
              gap: '8px',
              cursor: 'pointer',
              transition: 'all var(--transition-fast)',
            }}
          >
            <input
              id="add-account-qr-input"
              type="file"
              accept="image/png,image/jpeg,image/webp,image/gif"
              style={{ display: 'none' }}
              onChange={(e) => {
                if (e.target.files && e.target.files[0]) {
                  processImageFile(e.target.files[0]);
                }
              }}
            />

            <div
              style={{
                width: '42px',
                height: '42px',
                borderRadius: 'var(--radius-pill)',
                backgroundColor: 'var(--color-primary-subtle)',
                color: 'var(--color-primary)',
                display: 'flex',
                alignItems: 'center',
                justifyContent: 'center',
              }}
            >
              <Upload size={20} />
            </div>

            <div>
              <p style={{ fontSize: '13px', fontWeight: 600, color: 'var(--color-text-primary)' }}>
                {isDragging ? 'Drop QR Code Here' : 'Select QR Code Image'}
              </p>
              <p style={{ fontSize: '11px', color: 'var(--color-text-muted)', marginTop: '2px' }}>
                PNG, JPG, WEBP, or GIF • Drag & drop supported
              </p>
            </div>

            {clipboardFeedback && (
              <Badge variant="primary" icon={<Check size={11} />} size="sm">
                {clipboardFeedback}
              </Badge>
            )}
          </div>

          {/* Browser Capture Actions */}
          <div style={{ display: 'flex', flexDirection: 'column', gap: '8px' }}>
            <Button
              variant="primary"
              fullWidth
              size="md"
              disabled={isScanningPage}
              onClick={handleScanCurrentPage}
              icon={isScanningPage ? <Loader2 size={15} className="animate-spin" /> : <Scan size={15} />}
            >
              {isScanningPage ? 'Scanning Page Locally…' : 'Scan Current Page'}
            </Button>

            <Button
              variant="secondary"
              fullWidth
              size="md"
              onClick={handleSelectArea}
              icon={<Crop size={15} />}
            >
              Select QR Area
            </Button>
          </div>

          {qrError && (
            <div
              style={{
                padding: '8px 10px',
                backgroundColor: 'var(--color-danger-subtle)',
                border: '1px solid rgba(239, 68, 68, 0.25)',
                borderRadius: 'var(--radius-md)',
                display: 'flex',
                alignItems: 'center',
                gap: '6px',
                fontSize: '11px',
                color: 'var(--color-danger)',
              }}
            >
              <AlertCircle size={13} style={{ flexShrink: 0 }} />
              <span>{qrError}</span>
            </div>
          )}

          <div style={{ display: 'flex', justifyContent: 'flex-end', marginTop: '4px' }}>
            <Button variant="ghost" size="sm" onClick={onClose}>
              Cancel
            </Button>
          </div>

          <p style={{ fontSize: '10px', color: 'var(--color-text-muted)', textAlign: 'center' }}>
            🔒 100% Local: Images are processed entirely in your browser memory.
          </p>
        </div>
      )}
    </Modal>
  );
};
