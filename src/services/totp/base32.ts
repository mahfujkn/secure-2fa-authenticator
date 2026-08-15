/**
 * RFC 4648 Base32 Codec & Validator
 * Supports sanitizing spaces, hyphens, and padding for TOTP secrets.
 */

const BASE32_ALPHABET = 'ABCDEFGHIJKLMNOPQRSTUVWXYZ234567';
const BASE32_MAP: Record<string, number> = {};

for (let i = 0; i < BASE32_ALPHABET.length; i++) {
  BASE32_MAP[BASE32_ALPHABET[i]] = i;
}

/**
 * Normalizes user-input secret:
 * - Strips whitespace, hyphens, underscores, padding '='
 * - Converts to uppercase
 */
export function normalizeBase32(input: string): string {
  if (!input) return '';
  return input
    .toUpperCase()
    .replace(/[\s\-_=]/g, '')
    .trim();
}

/**
 * Validates whether normalized or raw string is a valid Base32 secret
 */
export function isValidBase32(input: string): boolean {
  const normalized = normalizeBase32(input);
  if (normalized.length === 0) return false;
  
  for (let i = 0; i < normalized.length; i++) {
    const char = normalized[i];
    if (!(char in BASE32_MAP)) {
      return false;
    }
  }
  return true;
}

/**
 * Decodes a Base32 string into a Uint8Array.
 * Throws an Error if invalid characters are encountered.
 */
export function base32ToUint8Array(input: string): Uint8Array {
  const normalized = normalizeBase32(input);
  if (!normalized) {
    return new Uint8Array(0);
  }

  let bits = 0;
  let value = 0;
  const output: number[] = [];

  for (let i = 0; i < normalized.length; i++) {
    const char = normalized[i];
    const val = BASE32_MAP[char];
    if (val === undefined) {
      throw new Error(`Invalid Base32 character '${char}' at index ${i}`);
    }

    value = (value << 5) | val;
    bits += 5;

    if (bits >= 8) {
      output.push((value >>> (bits - 8)) & 255);
      bits -= 8;
    }
  }

  return new Uint8Array(output);
}

/**
 * Encodes a Uint8Array to a Base32 string (without padding)
 */
export function uint8ArrayToBase32(bytes: Uint8Array): string {
  let bits = 0;
  let value = 0;
  let output = '';

  for (let i = 0; i < bytes.length; i++) {
    value = (value << 8) | bytes[i];
    bits += 8;

    while (bits >= 5) {
      output += BASE32_ALPHABET[(value >>> (bits - 5)) & 31];
      bits -= 5;
    }
  }

  if (bits > 0) {
    output += BASE32_ALPHABET[(value << (5 - bits)) & 31];
  }

  return output;
}
