export type Algorithm = 'SHA-1' | 'SHA-256' | 'SHA-512';
export type Digits = 6 | 8;
export type Period = 30 | 60;

export interface TOTPAccount {
  id: string;
  issuer: string;
  account: string;
  secret: string; // Base32 normalized
  algorithm: Algorithm;
  digits: Digits;
  period: Period;
  isFavorite?: boolean;
  createdAt: number;
  updatedAt: number;
}

export interface TOTPCodeResult {
  code: string;
  formattedCode: string;
  secondsRemaining: number;
  totalPeriod: number;
  progressPercent: number; // 0 to 100
}
