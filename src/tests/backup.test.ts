import { describe, it, expect } from 'vitest';
import { validateBackupFileStructure, analyzeImportCandidates } from '../services/backup/importer';
import { TOTPAccount } from '../types/account';
import { BackupAccountV1 } from '../types/backup';

describe('Backup Validation & Import Resolution', () => {
  it('should validate standard BackupFileV1 structure', () => {
    const validData = {
      version: 1,
      type: 'totp-authenticator-backup',
      exportedAt: new Date().toISOString(),
      accounts: [
        {
          issuer: 'Google',
          account: 'user@gmail.com',
          secret: 'JBSWY3DPEHPK3PXP',
          algorithm: 'SHA1',
          digits: 6,
          period: 30,
        },
      ],
    };

    const validated = validateBackupFileStructure(validData);
    expect(validated.accounts).toHaveLength(1);
    expect(validated.type).toBe('totp-authenticator-backup');
  });

  it('should reject invalid backup formats or wrong versions', () => {
    expect(() => validateBackupFileStructure({ type: 'other', version: 1, accounts: [] })).toThrow('Invalid backup type');
    expect(() => validateBackupFileStructure({ type: 'totp-authenticator-backup', version: 2, accounts: [] })).toThrow('Unsupported backup version');
    expect(() => validateBackupFileStructure(null)).toThrow('invalid or corrupted');
  });

  it('should accurately detect duplicate accounts during import analysis', () => {
    const existingAccounts: TOTPAccount[] = [
      {
        id: 'acc-1',
        issuer: 'Google',
        account: 'user@example.com',
        secret: 'JBSWY3DPEHPK3PXP',
        algorithm: 'SHA-1',
        digits: 6,
        period: 30,
        createdAt: 100,
        updatedAt: 100,
      },
    ];

    const backupCandidates: BackupAccountV1[] = [
      {
        issuer: 'Google',
        account: 'user@example.com', // exact match
        secret: 'JBSWY3DPEHPK3PXP',
        algorithm: 'SHA-1',
        digits: 6,
        period: 30,
      },
      {
        issuer: 'GitHub',
        account: 'developer', // new item
        secret: 'KRSXG5A2EJXW6YQZ',
        algorithm: 'SHA-1',
        digits: 6,
        period: 30,
      },
    ];

    const preview = analyzeImportCandidates(backupCandidates, existingAccounts);
    expect(preview).toHaveLength(2);
    expect(preview[0].isDuplicate).toBe(true);
    expect(preview[0].duplicateOfId).toBe('acc-1');
    expect(preview[1].isDuplicate).toBe(false);
  });
});
