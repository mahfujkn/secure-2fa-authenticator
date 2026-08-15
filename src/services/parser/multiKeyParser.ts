import { EphemeralParsedEntry, EphemeralErrorEntry, QuickTotpParseResult, InputFormatType } from '../../types/quickTotp';
import { normalizeBase32, isValidBase32 } from '../totp/base32';
import { parseOtpAuthUri } from './otpauth';

/**
 * Detects the input format type of a line
 */
function detectFormatType(rawLine: string): InputFormatType {
  const trimmed = rawLine.trim();
  if (trimmed.toLowerCase().startsWith('otpauth://')) {
    return 'otpauth-uri';
  }
  if (trimmed.includes('-')) {
    return 'hyphenated-base32';
  }
  if (/\s+/.test(trimmed)) {
    return 'spaced-base32';
  }
  return 'raw-base32';
}

/**
 * Intelligently parses single or multi-line text input into valid entries and structured errors.
 * Never fails completely if at least one entry is valid.
 */
export function parseMultiKeyInput(textInput: string): QuickTotpParseResult {
  if (!textInput || !textInput.trim()) {
    return { validEntries: [], invalidEntries: [] };
  }

  const rawLines = textInput.split(/\r?\n/);
  const validEntries: EphemeralParsedEntry[] = [];
  const invalidEntries: EphemeralErrorEntry[] = [];

  let validCounter = 1;
  const seenSecrets = new Set<string>();

  rawLines.forEach((line, index) => {
    const lineNumber = index + 1;
    const trimmed = line.trim();

    // Skip empty lines gracefully
    if (!trimmed) {
      return;
    }

    const format = detectFormatType(trimmed);

    // Case 1: OTPAuth URI
    if (format === 'otpauth-uri') {
      try {
        const parsedUri = parseOtpAuthUri(trimmed);
        
        // Prevent duplicate rendering of exact same entry in same batch
        const dedupKey = `${parsedUri.secret}-${parsedUri.issuer}-${parsedUri.account}`;
        if (seenSecrets.has(dedupKey)) {
          return;
        }
        seenSecrets.add(dedupKey);

        validEntries.push({
          id: `ephemeral-${lineNumber}-${Date.now()}-${Math.random().toString(36).slice(2, 6)}`,
          lineNumber,
          rawInput: trimmed,
          format,
          normalizedSecret: parsedUri.secret,
          issuer: parsedUri.issuer,
          account: parsedUri.account,
          algorithm: parsedUri.algorithm,
          digits: parsedUri.digits,
          period: parsedUri.period,
        });
        validCounter++;
      } catch (err: unknown) {
        const msg = err instanceof Error ? err.message : 'Invalid OTPAuth URI';
        invalidEntries.push({
          lineNumber,
          rawInput: trimmed,
          errorMessage: msg,
        });
      }
      return;
    }

    // Case 2: Base32 string (raw, spaced, hyphenated)
    const normalized = normalizeBase32(trimmed);

    if (isValidBase32(normalized)) {
      // Must be at least reasonable length for TOTP (typically >= 8 chars)
      if (normalized.length < 8) {
        invalidEntries.push({
          lineNumber,
          rawInput: trimmed,
          errorMessage: 'Secret is too short (minimum 8 characters)',
        });
        return;
      }

      if (seenSecrets.has(normalized)) {
        return; // Deduplicate identical raw keys in the same batch
      }
      seenSecrets.add(normalized);

      validEntries.push({
        id: `ephemeral-${lineNumber}-${Date.now()}-${Math.random().toString(36).slice(2, 6)}`,
        lineNumber,
        rawInput: trimmed,
        format,
        normalizedSecret: normalized,
        issuer: `Temporary Code #${validCounter}`,
        account: 'Quick TOTP (Not Saved)',
        algorithm: 'SHA-1',
        digits: 6,
        period: 30,
      });
      validCounter++;
    } else {
      invalidEntries.push({
        lineNumber,
        rawInput: trimmed,
        errorMessage: 'Invalid Base32 secret characters',
      });
    }
  });

  return { validEntries, invalidEntries };
}
