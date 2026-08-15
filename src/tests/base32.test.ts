import { describe, it, expect } from 'vitest';
import { normalizeBase32, isValidBase32, base32ToUint8Array, uint8ArrayToBase32 } from '../services/totp/base32';

describe('Base32 Codec & Validator', () => {
  it('should normalize spaced and lowercase base32 strings', () => {
    expect(normalizeBase32('jbsw y3dp ehpk 3pxp')).toBe('JBSWY3DPEHPK3PXP');
    expect(normalizeBase32('JBSW-Y3DP-EHPK-3PXP')).toBe('JBSWY3DPEHPK3PXP');
    expect(normalizeBase32('  JBSWY3DPEHPK3PXP=== ')).toBe('JBSWY3DPEHPK3PXP');
  });

  it('should validate valid Base32 strings', () => {
    expect(isValidBase32('JBSWY3DPEHPK3PXP')).toBe(true);
    expect(isValidBase32('jbsw y3dp')).toBe(true);
    expect(isValidBase32('MZXW633PN5XW6MZX')).toBe(true);
  });

  it('should reject invalid Base32 strings', () => {
    expect(isValidBase32('')).toBe(false);
    expect(isValidBase32('1890!')).toBe(false); // 1, 8, 9, 0 are not in standard Base32
    expect(isValidBase32('JBSWY3D8')).toBe(false); // '8' is invalid
  });

  it('should correctly encode and decode binary arrays', () => {
    const originalText = 'Hello TOTP 2026';
    const encoder = new TextEncoder();
    const decoder = new TextDecoder();

    const bytes = encoder.encode(originalText);
    const b32 = uint8ArrayToBase32(bytes);
    const decodedBytes = base32ToUint8Array(b32);

    expect(decoder.decode(decodedBytes)).toBe(originalText);
  });
});
