import { describe, it, expect } from 'vitest';
import { generateTotp, formatTotpCode } from '../services/totp/totpEngine';
import { uint8ArrayToBase32 } from '../services/totp/base32';

describe('RFC 6238 TOTP Engine', () => {
  // RFC 6238 Appendix B test seeds
  // SHA-1 seed: ASCII "12345678901234567890" (20 bytes)
  const sha1Seed = new TextEncoder().encode('12345678901234567890');
  const sha1Secret = uint8ArrayToBase32(sha1Seed);

  // SHA-256 seed: ASCII "12345678901234567890123456789012" (32 bytes)
  const sha256Seed = new TextEncoder().encode('12345678901234567890123456789012');
  const sha256Secret = uint8ArrayToBase32(sha256Seed);

  // SHA-512 seed: 64 bytes
  const sha512Seed = new TextEncoder().encode('1234567890123456789012345678901234567890123456789012345678901234');
  const sha512Secret = uint8ArrayToBase32(sha512Seed);

  it('should match RFC 6238 test vectors for SHA-1 (8 digits, 30s period)', async () => {
    // T = 59 -> 94287082
    const res59 = await generateTotp({
      secret: sha1Secret,
      algorithm: 'SHA-1',
      digits: 8,
      period: 30,
      timestampSeconds: 59,
    });
    expect(res59.code).toBe('94287082');

    // T = 1111111109 -> 07081804
    const res111 = await generateTotp({
      secret: sha1Secret,
      algorithm: 'SHA-1',
      digits: 8,
      period: 30,
      timestampSeconds: 1111111109,
    });
    expect(res111.code).toBe('07081804');

    // T = 1234567890 -> 89005924
    const res123 = await generateTotp({
      secret: sha1Secret,
      algorithm: 'SHA-1',
      digits: 8,
      period: 30,
      timestampSeconds: 1234567890,
    });
    expect(res123.code).toBe('89005924');

    // T = 2000000000 -> 69279037
    const res200 = await generateTotp({
      secret: sha1Secret,
      algorithm: 'SHA-1',
      digits: 8,
      period: 30,
      timestampSeconds: 2000000000,
    });
    expect(res200.code).toBe('69279037');
  });

  it('should match RFC 6238 test vectors for SHA-256 (8 digits, 30s period)', async () => {
    // T = 59 -> 46119246
    const res = await generateTotp({
      secret: sha256Secret,
      algorithm: 'SHA-256',
      digits: 8,
      period: 30,
      timestampSeconds: 59,
    });
    expect(res.code).toBe('46119246');
  });

  it('should match RFC 6238 test vectors for SHA-512 (8 digits, 30s period)', async () => {
    // T = 59 -> 90693936
    const res = await generateTotp({
      secret: sha512Secret,
      algorithm: 'SHA-512',
      digits: 8,
      period: 30,
      timestampSeconds: 59,
    });
    expect(res.code).toBe('90693936');
  });

  it('should generate 6-digit codes correctly with 30s and 60s periods', async () => {
    const res30 = await generateTotp({
      secret: 'JBSWY3DPEHPK3PXP',
      digits: 6,
      period: 30,
      timestampSeconds: 1000,
    });
    expect(res30.code).toHaveLength(6);
    expect(res30.formattedCode).toMatch(/^\d{3} \d{3}$/);
    expect(res30.secondsRemaining).toBe(20);

    const res60 = await generateTotp({
      secret: 'JBSWY3DPEHPK3PXP',
      digits: 6,
      period: 60,
      timestampSeconds: 1000,
    });
    expect(res60.code).toHaveLength(6);
    expect(res60.secondsRemaining).toBe(20);
    expect(res60.totalPeriod).toBe(60);
  });

  it('should format codes with clean spacing for display', () => {
    expect(formatTotpCode('482913', 6)).toBe('482 913');
    expect(formatTotpCode('12345678', 8)).toBe('1234 5678');
  });
});
