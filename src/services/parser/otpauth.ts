import { Algorithm, Digits, Period, TOTPAccount } from '../../types/account';
import { normalizeBase32, isValidBase32 } from '../totp/base32';

export interface ParsedOtpAuthUri {
  type: 'totp';
  issuer: string;
  account: string;
  secret: string;
  algorithm: Algorithm;
  digits: Digits;
  period: Period;
}

/**
 * Normalizes algorithm string to our Algorithm enum
 */
export function normalizeAlgorithm(algStr: string | null | undefined): Algorithm {
  if (!algStr) return 'SHA-1';
  const upper = algStr.toUpperCase().replace('-', '');
  if (upper === 'SHA256') return 'SHA-256';
  if (upper === 'SHA512') return 'SHA-512';
  return 'SHA-1';
}

/**
 * Normalizes digits to 6 or 8
 */
export function normalizeDigits(digStr: string | number | null | undefined): Digits {
  if (!digStr) return 6;
  const num = typeof digStr === 'number' ? digStr : parseInt(digStr, 10);
  return num === 8 ? 8 : 6;
}

/**
 * Normalizes period to 30 or 60
 */
export function normalizePeriod(periodStr: string | number | null | undefined): Period {
  if (!periodStr) return 30;
  const num = typeof periodStr === 'number' ? periodStr : parseInt(periodStr, 10);
  return num === 60 ? 60 : 30;
}

/**
 * Parses an otpauth:// URI string into structured TOTP parameters
 */
export function parseOtpAuthUri(uriString: string): ParsedOtpAuthUri {
  const trimmed = uriString.trim();
  if (!trimmed.toLowerCase().startsWith('otpauth://')) {
    throw new Error('URI must start with "otpauth://"');
  }

  let url: URL;
  try {
    url = new URL(trimmed);
  } catch {
    throw new Error('Invalid URI syntax');
  }

  if (url.protocol !== 'otpauth:') {
    throw new Error('Invalid OTP URI protocol');
  }

  const type = url.host.toLowerCase();
  if (type !== 'totp') {
    throw new Error(`Unsupported OTP type "${type}". Only "totp" is supported.`);
  }

  // Path contains label: "/Issuer:Account" or "/Account"
  let path = decodeURIComponent(url.pathname);
  if (path.startsWith('/')) {
    path = path.slice(1);
  }

  let labelIssuer = '';
  let account = path;

  if (path.includes(':')) {
    const parts = path.split(':');
    labelIssuer = parts[0].trim();
    account = parts.slice(1).join(':').trim();
  }

  const searchParams = url.searchParams;
  const queryIssuer = searchParams.get('issuer')?.trim() || '';
  const issuer = queryIssuer || labelIssuer || 'Unknown';

  const rawSecret = searchParams.get('secret') || '';
  const normalizedSecret = normalizeBase32(rawSecret);

  if (!normalizedSecret) {
    throw new Error('Missing secret parameter in OTP URI');
  }

  if (!isValidBase32(normalizedSecret)) {
    throw new Error('Invalid Base32 secret parameter in OTP URI');
  }

  const algorithm = normalizeAlgorithm(searchParams.get('algorithm'));
  const digits = normalizeDigits(searchParams.get('digits'));
  const period = normalizePeriod(searchParams.get('period'));

  return {
    type: 'totp',
    issuer,
    account: account || 'Account',
    secret: normalizedSecret,
    algorithm,
    digits,
    period,
  };
}

/**
 * Builds an otpauth://totp URI from an account
 */
export function buildOtpAuthUri(account: Pick<TOTPAccount, 'issuer' | 'account' | 'secret' | 'algorithm' | 'digits' | 'period'>): string {
  const label = encodeURIComponent(`${account.issuer}:${account.account}`);
  const algStr = account.algorithm.replace('-', '');
  const params = new URLSearchParams({
    secret: account.secret,
    issuer: account.issuer,
    algorithm: algStr,
    digits: account.digits.toString(),
    period: account.period.toString(),
  });

  return `otpauth://totp/${label}?${params.toString()}`;
}
