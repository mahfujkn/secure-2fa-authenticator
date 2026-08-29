import { BackupFileV1, BackupAccountV1 } from '../../types/backup';
import { accountRepository } from '../storage/accountRepository';

/**
 * Generates an exportable BackupFileV1 object containing all saved local accounts.
 * Quick TOTP keys are strictly excluded.
 */
export async function createBackupData(): Promise<BackupFileV1> {
  const accounts = await accountRepository.getAll();

  const backupAccounts: BackupAccountV1[] = accounts.map((acc) => ({
    issuer: acc.issuer,
    account: acc.account,
    secret: acc.secret,
    algorithm: acc.algorithm,
    digits: acc.digits,
    period: acc.period,
    isFavorite: acc.isFavorite || false,
  }));

  return {
    version: 1,
    type: 'totp-authenticator-backup',
    exportedAt: new Date().toISOString(),
    accounts: backupAccounts,
  };
}

/**
 * Initiates a local file download of the JSON backup.
 */
export async function downloadBackupFile(): Promise<void> {
  const backup = await createBackupData();
  const jsonStr = JSON.stringify(backup, null, 2);
  const blob = new Blob([jsonStr], { type: 'application/json' });
  const url = URL.createObjectURL(blob);

  const dateStr = new Date().toISOString().slice(0, 10);
  const link = document.createElement('a');
  link.href = url;
  link.download = `secure-2fa-backup-${dateStr}.json`;
  document.body.appendChild(link);
  link.click();
  document.body.removeChild(link);
  URL.revokeObjectURL(url);
}
