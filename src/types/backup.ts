import { TOTPAccount } from './account';

export interface BackupAccountV1 {
  issuer: string;
  account: string;
  secret: string;
  algorithm: string;
  digits: number;
  period: number;
  isFavorite?: boolean;
}

export interface BackupFileV1 {
  version: 1;
  type: 'totp-authenticator-backup';
  exportedAt: string;
  accounts: BackupAccountV1[];
}

export type ConflictStrategy = 'skip' | 'replace' | 'keep_both';

export interface ImportPreviewItem {
  account: TOTPAccount;
  isDuplicate: boolean;
  duplicateOfId?: string;
  validationError?: string;
}
