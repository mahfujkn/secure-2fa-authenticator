import { useState, useEffect, useMemo, useCallback } from 'react';
import { EphemeralParsedEntry } from '../types/quickTotp';
import { TOTPCodeResult } from '../types/account';
import { parseMultiKeyInput } from '../services/parser/multiKeyParser';
import { generateTotp } from '../services/totp/totpEngine';

export interface QuickTotpItemWithCode {
  entry: EphemeralParsedEntry;
  codeResult?: TOTPCodeResult;
}

/**
 * Ephemeral in-memory hook for Quick TOTP generation.
 * Guarantees zero persistence: never reads or writes to any storage mechanism.
 */
export function useQuickTotp(timestampSeconds: number) {
  const [textInput, setTextInput] = useState<string>('');
  const [codesMap, setCodesMap] = useState<Record<string, TOTPCodeResult>>({});

  // Parse input immediately on text change
  const parseResult = useMemo(() => {
    return parseMultiKeyInput(textInput);
  }, [textInput]);

  const { validEntries, invalidEntries } = parseResult;

  // Recalculate codes whenever validEntries or timestampSeconds change
  useEffect(() => {
    if (validEntries.length === 0) {
      setCodesMap({});
      return;
    }

    let isMounted = true;
    const generateAll = async () => {
      const nextCodes: Record<string, TOTPCodeResult> = {};
      for (const item of validEntries) {
        try {
          const res = await generateTotp({
            secret: item.normalizedSecret,
            algorithm: item.algorithm,
            digits: item.digits,
            period: item.period,
            timestampSeconds,
          });
          nextCodes[item.id] = res;
        } catch (err) {
          console.error(`Failed to generate Quick TOTP for line ${item.lineNumber}:`, err);
        }
      }
      if (isMounted) {
        setCodesMap(nextCodes);
      }
    };

    generateAll();

    return () => {
      isMounted = false;
    };
  }, [validEntries, timestampSeconds]);

  // Explicitly clear in-memory state
  const clear = useCallback(() => {
    setTextInput('');
    setCodesMap({});
  }, []);

  // Cleanup on unmount (zero-persistence)
  useEffect(() => {
    return () => {
      setTextInput('');
      setCodesMap({});
    };
  }, []);

  const itemsWithCodes: QuickTotpItemWithCode[] = useMemo(() => {
    return validEntries.map((entry) => ({
      entry,
      codeResult: codesMap[entry.id],
    }));
  }, [validEntries, codesMap]);

  return {
    textInput,
    setTextInput,
    validEntries,
    invalidEntries,
    itemsWithCodes,
    clear,
  };
}
