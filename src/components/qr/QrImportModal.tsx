import React, { useState, useEffect } from 'react';
import {
  QrCode,
  Upload,
  Scan,
  Crop,
  CheckCircle2,
  AlertCircle,
  Eye,
  EyeOff,
  AlertTriangle,
  Loader2,
  ArrowLeft,
  Check,
} from 'lucide-react';
import { TOTPAccount } from '../../types/account';
import { ParsedOtpAuthUri } from '../../services/parser/otpauth';
import { decodeQrFromFile, analyzeQrText, QrCandidateItem } from '../../services/qr/qrDecoder';
import { scanActiveTab, selectQrAreaActiveTab } from '../../services/qr/tabScanner';
import { Modal } from '../common/Modal';
import { Button } from '../common/Button';
import { Badge } from '../common/Badge';

export interface QrImportModalProps {
  isOpen: boolean;
  onClose: () => void;
  onAddAccount: (accountData: Omit<TOTPAccount, 'id' | 'createdAt' | 'updatedAt'>) => Promise<unknown>;
  existingAccounts: TOTPAccount[];
  initialParsed?: ParsedOtpAuthUri;
}

type QrModalStep = 'entry' | 'scanning_page' | 'multiple_candidates' | 'preview' | 'error';

export const QrImportModal: React.FC<QrImportModalProps> = ({
  isOpen,
  onClose,
  onAddAccount,
  existingAccounts,
  initialParsed,
}) => {
  const [step, setStep] = useState<QrModalStep>('entry');
  const [isDragging, setIsDragging] = useState<boolean>(false);
  const [clipboardFeedback, setClipboardFeedback] = useState<string>('');
  
  // Scanned candidate and preview state
  const [selectedCandidate, setSelectedCandidate] = useState<ParsedOtpAuthUri | null>(null);
  const [multipleCandidates, setMultipleCandidates] = useState<QrCandidateItem[]>([]);
  const [showSecret, setShowSecret] = useState<boolean>(false);
  const [errorMessage, setErrorMessage] = useState<string>('');

  const resetState = () => {
    setStep('entry');
    setIsDragging(false);
    setClipboardFeedback('');
    setSelectedCandidate(null);
    setMultipleCandidates([]);
    setShowSecret(false);
    setErrorMessage('');
  };

  useEffect(() => {
    if (isOpen) {
      if (initialParsed) {
        setSelectedCandidate(initialParsed);
        setStep('preview');
      }
    } else {
      resetState();
    }
  }, [isOpen, initialParsed]);

  // Check duplicate condition
  const duplicateAccount = selectedCandidate
    ? existingAccounts.find(
        (acc) =>
          acc.secret === selectedCandidate.secret ||
          (acc.issuer.toLowerCase() === selectedCandidate.issuer.toLowerCase() &&
            acc.account.toLowerCase() === selectedCandidate.account.toLowerCase())
      )
    : undefined;

  // Process a local File (upload / drag / paste)
  const processImageFile = async (file: File | Blob) => {
    try {
      setErrorMessage('');
      const parsed = await decodeQrFromFile(file);
      setSelectedCandidate(parsed);
      setStep('preview');
    } catch (err: unknown) {
      const msg = err instanceof Error ? err.message : 'QR code not found.';
      setErrorMessage(msg);
      setStep('error');
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
    setStep('scanning_page');
    setErrorMessage('');

    try {
      const result = await scanActiveTab();
      if (!result.success || !result.rawResults) {
        setErrorMessage(result.error || "We couldn't scan the current page for QR codes.");
        setStep('error');
        return;
      }

      const rawList: string[] = result.rawResults;
      if (rawList.length === 0) {
        setErrorMessage('No QR code detected on the current page.');
        setStep('error');
        return;
      }

      const analyzed = rawList.map(analyzeQrText);
      const totpCandidates = analyzed.filter((c) => c.isTotp && c.parsed);

      if (totpCandidates.length === 1 && totpCandidates[0].parsed) {
        setSelectedCandidate(totpCandidates[0].parsed);
        setStep('preview');
      } else if (totpCandidates.length > 1) {
        setMultipleCandidates(totpCandidates);
        setStep('multiple_candidates');
      } else {
        setErrorMessage("We found a QR code, but it doesn't contain a supported TOTP configuration.");
        setStep('error');
      }
    } catch (err: unknown) {
      setErrorMessage(err instanceof Error ? err.message : "We couldn't scan the current page.");
      setStep('error');
    }
  };

  // Select QR Area on Active Webpage
  const handleSelectArea = async () => {
    setErrorMessage('');

    try {
      const result = await selectQrAreaActiveTab();
      if (result.canceled) {
        return;
      }

      if (result.success && result.otpUri) {
        try {
          const analyzed = analyzeQrText(result.otpUri);
          if (analyzed.isTotp && analyzed.parsed) {
            setSelectedCandidate(analyzed.parsed);
            setStep('preview');
          } else {
            setErrorMessage("This selected QR code is not a supported TOTP configuration.");
            setStep('error');
          }
        } catch (err: unknown) {
          setErrorMessage(err instanceof Error ? err.message : 'Invalid TOTP QR');
          setStep('error');
        }
      } else {
        setErrorMessage(result.error || 'No valid QR code found in selected area.');
        setStep('error');
      }
    } catch (err: unknown) {
      setErrorMessage(err instanceof Error ? err.message : 'Area selection failed.');
      setStep('error');
    }
  };

  // Confirm Import
  const handleConfirmAdd = async () => {
    if (!selectedCandidate) return;

    await onAddAccount({
      issuer: selectedCandidate.issuer,
      account: selectedCandidate.account,
      secret: selectedCandidate.secret,
      algorithm: selectedCandidate.algorithm,
      digits: selectedCandidate.digits,
      period: selectedCandidate.period,
      isFavorite: false,
    });

    onClose();
  };

  return (
    <Modal
      isOpen={isOpen}
      onClose={onClose}
      title={step === 'preview' ? '✓ QR Code Detected' : 'Scan QR Code'}
      subtitle={
        step === 'preview'
          ? 'Add this account to your authenticator.'
          : 'Upload an image or capture a TOTP QR directly from the current webpage.'
      }
      maxWidth="420px"
      footer={
        step === 'preview' ? (
          <>
            <Button variant="outline" onClick={() => setStep('entry')}>
              Back
            </Button>
            <Button variant="primary" onClick={handleConfirmAdd}>
              {duplicateAccount ? 'Add Anyway' : 'Add Account'}
            </Button>
          </>
        ) : undefined
      }
    >
      <div
        onPaste={handlePaste}
        tabIndex={0}
        style={{ outline: 'none', display: 'flex', flexDirection: 'column', gap: '14px' }}
      >
        {/* STEP 1: Entry / Upload Screen */}
        {step === 'entry' && (
          <>
            {/* Upload & Drag-and-Drop Area */}
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
              onClick={() => document.getElementById('qr-modal-file-input')?.click()}
              style={{
                border: `2px dashed ${isDragging ? 'var(--color-primary)' : 'var(--color-border-default)'}`,
                borderRadius: 'var(--radius-lg)',
                padding: '28px 16px',
                display: 'flex',
                flexDirection: 'column',
                alignItems: 'center',
                justifyContent: 'center',
                textAlign: 'center',
                backgroundColor: isDragging ? 'var(--color-primary-subtle)' : 'var(--color-bg-input)',
                gap: '10px',
                cursor: 'pointer',
                transition: 'all var(--transition-fast)',
              }}
            >
              <input
                id="qr-modal-file-input"
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
                  width: '46px',
                  height: '46px',
                  borderRadius: 'var(--radius-pill)',
                  backgroundColor: 'var(--color-primary-subtle)',
                  color: 'var(--color-primary)',
                  display: 'flex',
                  alignItems: 'center',
                  justifyContent: 'center',
                }}
              >
                <QrCode size={24} />
              </div>

              <div>
                <p style={{ fontSize: '13px', fontWeight: 600, color: 'var(--color-text-primary)' }}>
                  {isDragging ? 'Drop QR Code Here' : 'Select QR Code Image'}
                </p>
                <p style={{ fontSize: '11px', color: 'var(--color-text-muted)', marginTop: '3px' }}>
                  PNG, JPG, WEBP, or GIF • Drag & drop supported
                </p>
              </div>

              {clipboardFeedback && (
                <Badge variant="primary" icon={<Check size={11} />} size="sm">
                  {clipboardFeedback}
                </Badge>
              )}
            </div>

            {/* Quick Actions (Scan Current Page / Select Area) */}
            <div style={{ display: 'flex', flexDirection: 'column', gap: '8px' }}>
              <Button
                variant="primary"
                fullWidth
                size="md"
                onClick={handleScanCurrentPage}
                icon={<Scan size={15} />}
              >
                Scan Current Page
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

              <Button variant="ghost" fullWidth size="sm" onClick={onClose} style={{ marginTop: '2px' }}>
                Cancel
              </Button>
            </div>

            <p style={{ fontSize: '10px', color: 'var(--color-text-muted)', textAlign: 'center' }}>
              🔒 100% Local: Images are processed entirely in your browser memory.
            </p>
          </>
        )}

        {/* STEP 2: Scanning Page Progress */}
        {step === 'scanning_page' && (
          <div
            style={{
              display: 'flex',
              flexDirection: 'column',
              alignItems: 'center',
              justifyContent: 'center',
              padding: '36px 16px',
              gap: '14px',
              textAlign: 'center',
            }}
            className="animate-fade-in"
          >
            <Loader2 size={32} color="var(--color-primary)" className="animate-spin" />
            <div>
              <p style={{ fontSize: '14px', fontWeight: 600, color: 'var(--color-text-primary)' }}>
                Scanning current page…
              </p>
              <p style={{ fontSize: '12px', color: 'var(--color-text-secondary)', marginTop: '4px' }}>
                Scanning locally on your device
              </p>
            </div>
            <p style={{ fontSize: '10px', color: 'var(--color-text-muted)' }}>
              Your page content never leaves your browser.
            </p>
          </div>
        )}

        {/* STEP 3: Multiple QR Candidates Selection */}
        {step === 'multiple_candidates' && (
          <div style={{ display: 'flex', flexDirection: 'column', gap: '12px' }} className="animate-fade-in">
            <div style={{ display: 'flex', alignItems: 'center', gap: '8px' }}>
              <Button variant="ghost" size="icon" onClick={() => setStep('entry')} style={{ width: '28px', height: '28px' }}>
                <ArrowLeft size={16} />
              </Button>
              <h4 style={{ fontSize: '13px', fontWeight: 600, color: 'var(--color-text-primary)' }}>
                Multiple QR Codes Found ({multipleCandidates.length})
              </h4>
            </div>

            <div style={{ display: 'flex', flexDirection: 'column', gap: '8px', maxHeight: '240px', overflowY: 'auto' }}>
              {multipleCandidates.map((cand, idx) => (
                <div
                  key={cand.id}
                  style={{
                    padding: '10px 12px',
                    backgroundColor: 'var(--color-bg-input)',
                    border: '1px solid var(--color-border-subtle)',
                    borderRadius: 'var(--radius-md)',
                    display: 'flex',
                    alignItems: 'center',
                    justifyContent: 'space-between',
                  }}
                >
                  <div>
                    <span style={{ fontSize: '12px', fontWeight: 600, color: 'var(--color-text-primary)' }}>
                      {cand.parsed?.issuer || `QR Code #${idx + 1}`}
                    </span>
                    <p style={{ fontSize: '11px', color: 'var(--color-text-secondary)', marginTop: '1px' }}>
                      {cand.parsed?.account || 'TOTP Secret'}
                    </p>
                  </div>

                  <Button
                    variant="primary"
                    size="sm"
                    onClick={() => {
                      if (cand.parsed) {
                        setSelectedCandidate(cand.parsed);
                        setStep('preview');
                      }
                    }}
                  >
                    Select
                  </Button>
                </div>
              ))}
            </div>
          </div>
        )}

        {/* STEP 4: Import Confirmation Preview */}
        {step === 'preview' && selectedCandidate && (
          <div style={{ display: 'flex', flexDirection: 'column', gap: '12px' }} className="animate-fade-in">
            {/* Duplicate Warning */}
            {duplicateAccount && (
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
                  <strong>Account already exists:</strong> {duplicateAccount.issuer} ({duplicateAccount.account}). You can add it anyway or cancel.
                </p>
              </div>
            )}

            {/* Account Card Preview */}
            <div
              style={{
                padding: '14px',
                backgroundColor: 'var(--color-bg-input)',
                borderRadius: 'var(--radius-lg)',
                border: '1px solid var(--color-border-subtle)',
                display: 'flex',
                flexDirection: 'column',
                gap: '10px',
              }}
            >
              <div>
                <span style={{ fontSize: '11px', color: 'var(--color-text-muted)', textTransform: 'uppercase', letterSpacing: '0.05em' }}>
                  Service / Issuer
                </span>
                <p style={{ fontSize: '14px', fontWeight: 600, color: 'var(--color-text-primary)', marginTop: '2px' }}>
                  {selectedCandidate.issuer}
                </p>
              </div>

              <div>
                <span style={{ fontSize: '11px', color: 'var(--color-text-muted)', textTransform: 'uppercase', letterSpacing: '0.05em' }}>
                  Account / Username
                </span>
                <p style={{ fontSize: '13px', color: 'var(--color-text-secondary)', marginTop: '2px' }}>
                  {selectedCandidate.account}
                </p>
              </div>

              <div>
                <span style={{ fontSize: '11px', color: 'var(--color-text-muted)', textTransform: 'uppercase', letterSpacing: '0.05em' }}>
                  Secret Key
                </span>
                <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', marginTop: '2px' }}>
                  <p style={{ fontSize: '12px', fontFamily: 'var(--font-mono)', color: 'var(--color-text-primary)' }}>
                    {showSecret ? selectedCandidate.secret : '••••••••••••••••'}
                  </p>
                  <Button
                    variant="ghost"
                    size="icon"
                    onClick={() => setShowSecret(!showSecret)}
                    style={{ width: '24px', height: '24px' }}
                  >
                    {showSecret ? <EyeOff size={13} /> : <Eye size={13} />}
                  </Button>
                </div>
              </div>
            </div>

            {/* Detected Configuration Badge */}
            <div
              style={{
                padding: '8px 12px',
                backgroundColor: 'var(--color-success-subtle)',
                border: '1px solid rgba(50, 202, 146, 0.25)',
                borderRadius: 'var(--radius-md)',
                display: 'flex',
                alignItems: 'center',
                gap: '8px',
              }}
            >
              <CheckCircle2 size={15} color="var(--color-success)" style={{ flexShrink: 0 }} />
              <div style={{ fontSize: '11px' }}>
                <span style={{ fontWeight: 600, color: 'var(--color-success)' }}>TOTP Configuration: </span>
                <span style={{ color: 'var(--color-text-secondary)' }}>
                  {selectedCandidate.algorithm} · {selectedCandidate.digits} digits · {selectedCandidate.period}s
                </span>
              </div>
            </div>
          </div>
        )}

        {/* STEP 5: Error State with Recovery Actions */}
        {step === 'error' && (
          <div
            style={{
              display: 'flex',
              flexDirection: 'column',
              alignItems: 'center',
              padding: '20px 10px',
              gap: '14px',
              textAlign: 'center',
            }}
            className="animate-fade-in"
          >
            <div
              style={{
                width: '44px',
                height: '44px',
                borderRadius: 'var(--radius-pill)',
                backgroundColor: 'var(--color-danger-subtle)',
                color: 'var(--color-danger)',
                display: 'flex',
                alignItems: 'center',
                justifyContent: 'center',
              }}
            >
              <AlertCircle size={24} />
            </div>

            <div>
              <h4 style={{ fontSize: '14px', fontWeight: 600, color: 'var(--color-text-primary)' }}>
                {errorMessage || 'QR code not found.'}
              </h4>
              <p style={{ fontSize: '12px', color: 'var(--color-text-muted)', marginTop: '4px', maxWidth: '300px' }}>
                Ensure the QR code is fully visible on your screen, or upload an image file.
              </p>
            </div>

            <div style={{ display: 'flex', flexDirection: 'column', gap: '8px', width: '100%', maxWidth: '240px' }}>
              <Button variant="primary" size="sm" onClick={handleScanCurrentPage} icon={<Scan size={14} />}>
                Try Page Scan Again
              </Button>
              <Button variant="secondary" size="sm" onClick={handleSelectArea} icon={<Crop size={14} />}>
                Select QR Area
              </Button>
              <Button variant="outline" size="sm" onClick={() => setStep('entry')} icon={<Upload size={14} />}>
                Upload Image
              </Button>
            </div>
          </div>
        )}
      </div>
    </Modal>
  );
};
