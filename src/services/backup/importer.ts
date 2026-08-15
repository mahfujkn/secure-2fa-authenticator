import { BackupAccountV1, BackupFileV1, ConflictStrategy, ImportPreviewItem } from '../../types/backup';
import { TOTPAccount } from '../../types/account';
import { normalizeAlgorithm, normalizeDigits, normalizePeriod } from '../parser/otpauth';
import { isValidBase32, normalizeBase32 } from '../totp/base32';
import { accountRepository } from '../storage/accountRepository';

/**
 * Validates a parsed JSON object to verify it matches BackupFileV1 schema
 */
export function validateBackupFileStructure(obj: unknown): BackupFileV1 {
  if (!obj || typeof obj !== 'object') {
    throw new Error('This backup file is invalid or corrupted.');
  }

  const file = obj as Record<string, unknown>;

  if (file.type !== 'totp-authenticator-backup') {
    throw new Error('Invalid backup type. Expected "totp-authenticator-backup".');
  }

  if (file.version !== 1) {
    throw new Error(`Unsupported backup version: ${file.version}`);
  }

  if (!Array.isArray(file.accounts)) {
    throw new Error('Backup file is missing accounts array.');
  }

  return file as unknown as BackupFileV1;
}

/**
 * Previews incoming accounts against current accounts, flagging duplicates and invalid secrets
 */
export function analyzeImportCandidates(
  backupAccounts: BackupAccountV1[],
  existingAccounts: TOTPAccount[]
): ImportPreviewItem[] {
  return backupAccounts.map((item) => {
    const rawSecret = item.secret || '';
    const normalizedSecret = normalizeBase32(rawSecret);

    if (!isValidBase32(normalizedSecret)) {
      return {
        account: {
          id: '',
          issuer: item.issuer || 'Unknown',
          account: item.account || 'Unknown',
          secret: rawSecret,
          algorithm: 'SHA-1',
          digits: 6,
          period: 30,
          createdAt: Date.now(),
          updatedAt: Date.now(),
        },
        isDuplicate: false,
        validationError: 'Invalid Base32 secret',
      };
    }

    const validAccount: TOTPAccount = {
      id: `import-${Date.now()}-${Math.random().toString(36).slice(2, 7)}`,
      issuer: (item.issuer || 'Unknown').trim(),
      account: (item.account || 'Account').trim(),
      secret: normalizedSecret,
      algorithm: normalizeAlgorithm(item.algorithm),
      digits: normalizeDigits(item.digits),
      period: normalizePeriod(item.period),
      isFavorite: !!item.isFavorite,
      createdAt: Date.now(),
      updatedAt: Date.now(),
    };

    // Check duplicate condition: matching secret or matching (issuer + account)
    const duplicate = existingAccounts.find(
      (existing) =>
        existing.secret === validAccount.secret ||
        (existing.issuer.toLowerCase() === validAccount.issuer.toLowerCase() &&
          existing.account.toLowerCase() === validAccount.account.toLowerCase())
    );

    return {
      account: validAccount,
      isDuplicate: !!duplicate,
      duplicateOfId: duplicate?.id,
    };
  });
}

/**
 * Applies import preview items to local storage based on the chosen conflict strategy
 */
export async function applyImport(
  previewItems: ImportPreviewItem[],
  conflictStrategy: ConflictStrategy
): Promise<{ added: number; replaced: number; skipped: number }> {
  const existing = await accountRepository.getAll();
  const resultMap = new Map<string, TOTPAccount>();

  // Populate map with existing accounts keyed by ID
  existing.forEach((acc) => resultMap.set(acc.id, acc));

  let added = 0;
  let replaced = 0;
  let skipped = 0;

  for (const item of previewItems) {
    if (item.validationError) {
      skipped++;
      continue;
    }

    if (item.isDuplicate && item.duplicateOfId) {
      if (conflictStrategy === 'skip') {
        skipped++;
        continue;
      } else if (conflictStrategy === 'replace') {
        resultMap.set(item.duplicateOfId, {
          ...item.account,
          id: item.duplicateOfId,
          updatedAt: Date.now(),
        });
        replaced++;
        continue;
      } else if (conflictStrategy === 'keep_both') {
        const uniqueAccount: TOTPAccount = {
          ...item.account,
          issuer: `${item.account.issuer} (Imported)`,
        };
        resultMap.set(uniqueAccount.id, uniqueAccount);
        added++;
        continue;
      }
    }

    // New item
    resultMap.set(item.account.id, item.account);
    added++;
  }

  await accountRepository.setAll(Array.from(resultMap.values()));
  return { added, replaced, skipped };
}
