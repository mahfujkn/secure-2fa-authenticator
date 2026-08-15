import React, { useState } from 'react';
import { Download, Upload, ShieldAlert, CheckCircle2, AlertTriangle, FileCheck } from 'lucide-react';
import { ConflictStrategy, ImportPreviewItem } from '../../types/backup';
import { downloadBackupFile } from '../../services/backup/exporter';
import { analyzeImportCandidates, applyImport, validateBackupFileStructure } from '../../services/backup/importer';
import { accountRepository } from '../../services/storage/accountRepository';
import { Button } from '../common/Button';
import { Modal } from '../common/Modal';
import { Select } from '../common/Select';

export interface BackupSectionProps {
  onAccountsChanged: () => void;
}

export const BackupSection: React.FC<BackupSectionProps> = ({ onAccountsChanged }) => {
  const [isExporting, setIsExporting] = useState<boolean>(false);
  const [exportSuccess, setExportSuccess] = useState<boolean>(false);

  // Import preview modal state
  const [importPreviewItems, setImportPreviewItems] = useState<ImportPreviewItem[]>([]);
  const [isImportModalOpen, setIsImportModalOpen] = useState<boolean>(false);
  const [conflictStrategy, setConflictStrategy] = useState<ConflictStrategy>('skip');
  const [importError, setImportError] = useState<string>('');
  const [importResultMsg, setImportResultMsg] = useState<string>('');

  const handleExport = async () => {
    try {
      setIsExporting(true);
      await downloadBackupFile();
      setExportSuccess(true);
      setTimeout(() => setExportSuccess(false), 3000);
    } catch (err) {
      console.error('Export failed:', err);
    } finally {
      setIsExporting(false);
    }
  };

  const handleFileSelect = async (e: React.ChangeEvent<HTMLInputElement>) => {
    setImportError('');
    setImportResultMsg('');
    const file = e.target.files?.[0];
    if (!file) return;

    try {
      const text = await file.text();
      const rawJson = JSON.parse(text);
      const validated = validateBackupFileStructure(rawJson);
      const existing = await accountRepository.getAll();
      const preview = analyzeImportCandidates(validated.accounts, existing);

      setImportPreviewItems(preview);
      setIsImportModalOpen(true);
    } catch (err: unknown) {
      const msg = err instanceof Error ? err.message : 'This backup file is invalid or corrupted.';
      setImportError(msg);
    } finally {
      e.target.value = '';
    }
  };

  const handleConfirmImport = async () => {
    try {
      const { added, replaced, skipped } = await applyImport(importPreviewItems, conflictStrategy);
      setIsImportModalOpen(false);
      onAccountsChanged();
      setImportResultMsg(`Imported successfully: ${added} added, ${replaced} updated, ${skipped} skipped.`);
      setTimeout(() => setImportResultMsg(''), 4000);
    } catch (err: unknown) {
      const msg = err instanceof Error ? err.message : 'Import failed';
      setImportError(msg);
    }
  };

  const duplicatesCount = importPreviewItems.filter((i) => i.isDuplicate).length;
  const validCount = importPreviewItems.filter((i) => !i.validationError).length;

  return (
    <div style={{ display: 'flex', flexDirection: 'column', gap: '16px' }}>
      {/* Export Card */}
      <div
        style={{
          padding: '14px',
          backgroundColor: 'var(--color-bg-card)',
          border: '1px solid var(--color-border-subtle)',
          borderRadius: 'var(--radius-lg)',
          display: 'flex',
          flexDirection: 'column',
          gap: '10px',
        }}
      >
        <div>
          <h4 style={{ fontSize: '13px', fontWeight: 600, color: 'var(--color-text-primary)' }}>
            Export Accounts Backup
          </h4>
          <p style={{ fontSize: '12px', color: 'var(--color-text-secondary)', marginTop: '2px' }}>
            Download a standard JSON backup of all your saved TOTP accounts. Quick TOTP keys are strictly excluded.
          </p>
        </div>

        <div
          style={{
            padding: '8px 10px',
            backgroundColor: 'var(--color-warning-subtle)',
            borderRadius: 'var(--radius-sm)',
            border: '1px solid rgba(245, 158, 11, 0.25)',
            display: 'flex',
            alignItems: 'center',
            gap: '8px',
          }}
        >
          <ShieldAlert size={15} color="var(--color-warning)" style={{ flexShrink: 0 }} />
          <span style={{ fontSize: '11px', color: 'var(--color-warning)', lineHeight: 1.3 }}>
            Exported backups contain your raw TOTP secrets. Store the downloaded file securely.
          </span>
        </div>

        <div style={{ display: 'flex', alignItems: 'center', gap: '10px' }}>
          <Button
            variant="secondary"
            size="sm"
            onClick={handleExport}
            disabled={isExporting}
            icon={<Download size={14} />}
          >
            {isExporting ? 'Exporting...' : 'Export JSON Backup'}
          </Button>
          {exportSuccess && (
            <span style={{ fontSize: '12px', color: 'var(--color-success)', display: 'flex', alignItems: 'center', gap: '4px' }}>
              <CheckCircle2 size={14} /> Backup saved
            </span>
          )}
        </div>
      </div>

      {/* Import Card */}
      <div
        style={{
          padding: '14px',
          backgroundColor: 'var(--color-bg-card)',
          border: '1px solid var(--color-border-subtle)',
          borderRadius: 'var(--radius-lg)',
          display: 'flex',
          flexDirection: 'column',
          gap: '10px',
        }}
      >
        <div>
          <h4 style={{ fontSize: '13px', fontWeight: 600, color: 'var(--color-text-primary)' }}>
            Import Accounts Backup
          </h4>
          <p style={{ fontSize: '12px', color: 'var(--color-text-secondary)', marginTop: '2px' }}>
            Restore accounts from a previously exported JSON backup file with duplicate resolution.
          </p>
        </div>

        <div>
          <input
            id="import-backup-input"
            type="file"
            accept=".json"
            style={{ display: 'none' }}
            onChange={handleFileSelect}
          />
          <Button
            variant="secondary"
            size="sm"
            onClick={() => document.getElementById('import-backup-input')?.click()}
            icon={<Upload size={14} />}
          >
            Select Backup File (.json)
          </Button>
        </div>

        {importError && (
          <p style={{ fontSize: '11px', color: 'var(--color-danger)' }}>
            ✕ {importError}
          </p>
        )}

        {importResultMsg && (
          <p style={{ fontSize: '11px', color: 'var(--color-success)', display: 'flex', alignItems: 'center', gap: '4px' }}>
            <CheckCircle2 size={13} /> {importResultMsg}
          </p>
        )}
      </div>

      {/* Import Preview & Conflict Resolver Modal */}
      <Modal
        isOpen={isImportModalOpen}
        onClose={() => setIsImportModalOpen(false)}
        title="Import Backup Preview"
        subtitle={`${validCount} account(s) detected in backup file`}
        maxWidth="460px"
        footer={
          <>
            <Button variant="outline" onClick={() => setIsImportModalOpen(false)}>
              Cancel
            </Button>
            <Button variant="primary" onClick={handleConfirmImport} icon={<FileCheck size={14} />}>
              Import Accounts
            </Button>
          </>
        }
      >
        <div style={{ display: 'flex', flexDirection: 'column', gap: '14px' }}>
          {/* Conflict strategy dropdown */}
          {duplicatesCount > 0 && (
            <div
              style={{
                padding: '10px 12px',
                backgroundColor: 'var(--color-warning-subtle)',
                borderRadius: 'var(--radius-md)',
                border: '1px solid rgba(245, 158, 11, 0.25)',
                display: 'flex',
                flexDirection: 'column',
                gap: '8px',
              }}
            >
              <div style={{ display: 'flex', alignItems: 'center', gap: '6px' }}>
                <AlertTriangle size={14} color="var(--color-warning)" />
                <span style={{ fontSize: '12px', fontWeight: 600, color: 'var(--color-warning)' }}>
                  {duplicatesCount} Duplicate Account(s) Detected
                </span>
              </div>

              <Select
                label="Duplicate Resolution Strategy"
                value={conflictStrategy}
                onChange={(e) => setConflictStrategy(e.target.value as ConflictStrategy)}
                options={[
                  { value: 'skip', label: 'Skip duplicates (Keep existing)' },
                  { value: 'replace', label: 'Replace existing accounts' },
                  { value: 'keep_both', label: 'Keep both (Add with suffix)' },
                ]}
              />
            </div>
          )}

          {/* Account preview list */}
          <div style={{ display: 'flex', flexDirection: 'column', gap: '6px', maxHeight: '220px', overflowY: 'auto' }}>
            {importPreviewItems.map((item, idx) => (
              <div
                key={idx}
                style={{
                  padding: '8px 12px',
                  backgroundColor: 'var(--color-bg-input)',
                  borderRadius: 'var(--radius-sm)',
                  display: 'flex',
                  alignItems: 'center',
                  justifyContent: 'space-between',
                  fontSize: '12px',
                  border: item.isDuplicate ? '1px solid rgba(245, 158, 11, 0.3)' : '1px solid var(--color-border-subtle)',
                }}
              >
                <div>
                  <span style={{ fontWeight: 600, color: 'var(--color-text-primary)' }}>
                    {item.account.issuer}
                  </span>
                  <span style={{ color: 'var(--color-text-muted)', marginLeft: '6px' }}>
                    ({item.account.account})
                  </span>
                </div>

                {item.validationError ? (
                  <span style={{ fontSize: '10px', color: 'var(--color-danger)', fontWeight: 600 }}>
                    Invalid
                  </span>
                ) : item.isDuplicate ? (
                  <span style={{ fontSize: '10px', color: 'var(--color-warning)', fontWeight: 600 }}>
                    Duplicate
                  </span>
                ) : (
                  <span style={{ fontSize: '10px', color: 'var(--color-success)', fontWeight: 600 }}>
                    New
                  </span>
                )}
              </div>
            ))}
          </div>
        </div>
      </Modal>
    </div>
  );
};
