import { describe, it, expect } from 'vitest';
import { parseMultiKeyInput } from '../services/parser/multiKeyParser';

describe('Multi-Key Quick TOTP Parser', () => {
  it('should auto-detect a single raw Base32 secret', () => {
    const input = 'JBSWY3DPEHPK3PXP';
    const result = parseMultiKeyInput(input);

    expect(result.validEntries).toHaveLength(1);
    expect(result.invalidEntries).toHaveLength(0);
    expect(result.validEntries[0].normalizedSecret).toBe('JBSWY3DPEHPK3PXP');
    expect(result.validEntries[0].format).toBe('raw-base32');
  });

  it('should normalize spaced and hyphenated Base32 secrets automatically', () => {
    const input = `JBSW Y3DP EHPK 3PXP\nKRSX-G5A2-EJXW-6YQZ`;
    const result = parseMultiKeyInput(input);

    expect(result.validEntries).toHaveLength(2);
    expect(result.invalidEntries).toHaveLength(0);
    expect(result.validEntries[0].normalizedSecret).toBe('JBSWY3DPEHPK3PXP');
    expect(result.validEntries[0].format).toBe('spaced-base32');
    expect(result.validEntries[1].normalizedSecret).toBe('KRSXG5A2EJXW6YQZ');
    expect(result.validEntries[1].format).toBe('hyphenated-base32');
  });

  it('should auto-detect and parse otpauth URI in multi-key input', () => {
    const input = `otpauth://totp/GitHub:developer?secret=JBSWY3DPEHPK3PXP&issuer=GitHub\nKRSXG5A2EJXW6YQZ`;
    const result = parseMultiKeyInput(input);

    expect(result.validEntries).toHaveLength(2);
    expect(result.invalidEntries).toHaveLength(0);
    expect(result.validEntries[0].issuer).toBe('GitHub');
    expect(result.validEntries[0].format).toBe('otpauth-uri');
  });

  it('should handle mixed inputs and report invalid lines without breaking valid ones', () => {
    const input = `JBSWY3DPEHPK3PXP\nInvalid Secret 1890!\nKRSXG5A2EJXW6YQZ\nshort\notpauth://totp/Google:user?secret=MZXW633PN5XW6MZX`;
    const result = parseMultiKeyInput(input);

    expect(result.validEntries).toHaveLength(3);
    expect(result.invalidEntries).toHaveLength(2);

    expect(result.invalidEntries[0].lineNumber).toBe(2);
    expect(result.invalidEntries[0].errorMessage).toContain('Invalid Base32');

    expect(result.invalidEntries[1].lineNumber).toBe(4);
    expect(result.invalidEntries[1].errorMessage).toContain('too short');
  });

  it('should gracefully handle empty or whitespace lines', () => {
    const input = `\n  \nJBSWY3DPEHPK3PXP\n\n\n`;
    const result = parseMultiKeyInput(input);

    expect(result.validEntries).toHaveLength(1);
    expect(result.invalidEntries).toHaveLength(0);
  });
});
