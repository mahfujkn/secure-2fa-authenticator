import { describe, it, expect } from 'vitest';
import { parseOtpAuthUri, buildOtpAuthUri } from '../services/parser/otpauth';

describe('OTPAuth URI Parser and Builder', () => {
  it('should parse standard Google otpauth URI', () => {
    const uri = 'otpauth://totp/Google:user@example.com?secret=JBSWY3DPEHPK3PXP&issuer=Google&algorithm=SHA1&digits=6&period=30';
    const parsed = parseOtpAuthUri(uri);

    expect(parsed.issuer).toBe('Google');
    expect(parsed.account).toBe('user@example.com');
    expect(parsed.secret).toBe('JBSWY3DPEHPK3PXP');
    expect(parsed.algorithm).toBe('SHA-1');
    expect(parsed.digits).toBe(6);
    expect(parsed.period).toBe(30);
  });

  it('should parse URI without explicit query issuer, extracting from label path', () => {
    const uri = 'otpauth://totp/GitHub:developer?secret=KRSXG5A2EJXW6YQZ';
    const parsed = parseOtpAuthUri(uri);

    expect(parsed.issuer).toBe('GitHub');
    expect(parsed.account).toBe('developer');
    expect(parsed.secret).toBe('KRSXG5A2EJXW6YQZ');
    expect(parsed.algorithm).toBe('SHA-1');
    expect(parsed.digits).toBe(6);
    expect(parsed.period).toBe(30);
  });

  it('should handle custom SHA-256 and 8-digit parameters', () => {
    const uri = 'otpauth://totp/AWS:admin@corp.internal?secret=JBSWY3DPEHPK3PXP&algorithm=SHA256&digits=8&period=60';
    const parsed = parseOtpAuthUri(uri);

    expect(parsed.issuer).toBe('AWS');
    expect(parsed.algorithm).toBe('SHA-256');
    expect(parsed.digits).toBe(8);
    expect(parsed.period).toBe(60);
  });

  it('should apply standard defaults (SHA-1, 6 digits, 30s) when optional parameters are omitted', () => {
    const uri = 'otpauth://totp/MinimalService:user?secret=JBSWY3DPEHPK3PXP';
    const parsed = parseOtpAuthUri(uri);

    expect(parsed.issuer).toBe('MinimalService');
    expect(parsed.account).toBe('user');
    expect(parsed.secret).toBe('JBSWY3DPEHPK3PXP');
    expect(parsed.algorithm).toBe('SHA-1');
    expect(parsed.digits).toBe(6);
    expect(parsed.period).toBe(30);
  });

  it('should reject invalid protocols or non-totp URIs', () => {
    expect(() => parseOtpAuthUri('https://example.com')).toThrow();
    expect(() => parseOtpAuthUri('otpauth://hotp/Google:user?secret=JBSWY3DPEHPK3PXP&counter=1')).toThrow('Unsupported OTP type');
    expect(() => parseOtpAuthUri('otpauth://totp/Google:user?secret=invalid1890!')).toThrow('Invalid Base32 secret');
  });

  it('should rebuild a valid otpauth URI correctly', () => {
    const built = buildOtpAuthUri({
      issuer: 'Cloudflare',
      account: 'admin@domain.com',
      secret: 'JBSWY3DPEHPK3PXP',
      algorithm: 'SHA-1',
      digits: 6,
      period: 30,
    });

    expect(built).toContain('otpauth://totp/Cloudflare%3Aadmin%40domain.com');
    expect(built).toContain('secret=JBSWY3DPEHPK3PXP');
    expect(built).toContain('issuer=Cloudflare');
  });
});
