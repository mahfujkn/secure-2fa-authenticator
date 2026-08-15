import { Algorithm, Digits, Period, TOTPCodeResult } from '../../types/account';
import { base32ToUint8Array } from './base32';
import { computeHmac } from './crypto';

/**
 * Formats a raw numeric code with human-friendly spacing:
 * 6 digits: "123 456"
 * 8 digits: "1234 5678"
 */
export function formatTotpCode(code: string, digits: Digits): string {
  const clean = code.replace(/\D/g, '');
  if (digits === 6 && clean.length === 6) {
    return `${clean.slice(0, 3)} ${clean.slice(3, 6)}`;
  }
  if (digits === 8 && clean.length === 8) {
    return `${clean.slice(0, 4)} ${clean.slice(4, 8)}`;
  }
  return clean;
}

/**
 * Converts a 64-bit integer counter to an 8-byte big-endian Uint8Array.
 */
function counterToUint8Array(counter: number): Uint8Array {
  const buffer = new ArrayBuffer(8);
  const view = new DataView(buffer);
  
  // High 32 bits and low 32 bits
  const high = Math.floor(counter / 0x100000000);
  const low = counter >>> 0;
  
  view.setUint32(0, high, false);
  view.setUint32(4, low, false);
  
  return new Uint8Array(buffer);
}

/**
 * Generates an RFC 6238 TOTP code from a Base32 secret at a given Unix timestamp (in seconds).
 */
export async function generateTotp(params: {
  secret: string;
  algorithm?: Algorithm;
  digits?: Digits;
  period?: Period;
  timestampSeconds?: number;
}): Promise<TOTPCodeResult> {
  const {
    secret,
    algorithm = 'SHA-1',
    digits = 6,
    period = 30,
    timestampSeconds = Math.floor(Date.now() / 1000),
  } = params;

  const keyBytes = base32ToUint8Array(secret);
  if (keyBytes.length === 0) {
    throw new Error('Empty secret key');
  }

  // Calculate moving counter T = floor(timestamp / period)
  const counter = Math.floor(timestampSeconds / period);
  const counterBytes = counterToUint8Array(counter);

  // Compute HMAC
  const hmac = await computeHmac(algorithm, keyBytes, counterBytes);

  // Dynamic Truncation (RFC 4226)
  const offset = hmac[hmac.length - 1] & 0x0f;
  const binaryCode =
    ((hmac[offset] & 0x7f) << 24) |
    ((hmac[offset + 1] & 0xff) << 16) |
    ((hmac[offset + 2] & 0xff) << 8) |
    (hmac[offset + 3] & 0xff);

  const mod = Math.pow(10, digits);
  const otpNumber = binaryCode % mod;
  const code = otpNumber.toString().padStart(digits, '0');
  const formattedCode = formatTotpCode(code, digits);

  // Compute timing info
  const elapsed = timestampSeconds % period;
  const secondsRemaining = period - elapsed;
  const progressPercent = Math.max(0, Math.min(100, (secondsRemaining / period) * 100));

  return {
    code,
    formattedCode,
    secondsRemaining,
    totalPeriod: period,
    progressPercent,
  };
}
