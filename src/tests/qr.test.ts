import { describe, it, expect } from 'vitest';
import { analyzeQrText } from '../services/qr/qrDecoder';

describe('QR Text Analyzer & Local TOTP Validator', () => {
  it('should identify valid TOTP QR text with full parameters', () => {
    const qrText = 'otpauth://totp/GitHub:user@example.com?secret=JBSWY3DPEHPK3PXP&issuer=GitHub&algorithm=SHA256&digits=8&period=60';
    const result = analyzeQrText(qrText);

    expect(result.isTotp).toBe(true);
    expect(result.parsed).toBeDefined();
    expect(result.parsed?.issuer).toBe('GitHub');
    expect(result.parsed?.account).toBe('user@example.com');
    expect(result.parsed?.algorithm).toBe('SHA-256');
    expect(result.parsed?.digits).toBe(8);
    expect(result.parsed?.period).toBe(60);
  });

  it('should identify minimal TOTP QR text and apply defaults (SHA-1, 6 digits, 30s)', () => {
    const qrText = 'otpauth://totp/Google:user@gmail.com?secret=JBSWY3DPEHPK3PXP';
    const result = analyzeQrText(qrText);

    expect(result.isTotp).toBe(true);
    expect(result.parsed).toBeDefined();
    expect(result.parsed?.issuer).toBe('Google');
    expect(result.parsed?.algorithm).toBe('SHA-1');
    expect(result.parsed?.digits).toBe(6);
    expect(result.parsed?.period).toBe(30);
  });

  it('should flag non-TOTP QR content with clear error reason', () => {
    const websiteQr = 'https://example.com/login';
    const result = analyzeQrText(websiteQr);

    expect(result.isTotp).toBe(false);
    expect(result.error).toContain('not a supported TOTP configuration');
  });

  it('should flag invalid Base32 secret in otpauth URI', () => {
    const invalidSecretQr = 'otpauth://totp/Test:user?secret=INVALID1890!';
    const result = analyzeQrText(invalidSecretQr);

    expect(result.isTotp).toBe(false);
    expect(result.error).toBeDefined();
  });
});
