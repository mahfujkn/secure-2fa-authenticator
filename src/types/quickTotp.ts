import { Algorithm, Digits, Period } from './account';

export type InputFormatType = 'raw-base32' | 'spaced-base32' | 'hyphenated-base32' | 'otpauth-uri';

export interface EphemeralParsedEntry {
  id: string;
  lineNumber: number;
  rawInput: string;
  format: InputFormatType;
  normalizedSecret: string;
  issuer: string;
  account: string;
  algorithm: Algorithm;
  digits: Digits;
  period: Period;
}

export interface EphemeralErrorEntry {
  lineNumber: number;
  rawInput: string;
  errorMessage: string;
}

export interface QuickTotpParseResult {
  validEntries: EphemeralParsedEntry[];
  invalidEntries: EphemeralErrorEntry[];
}
