import { useState, useEffect, useCallback } from 'react';
import { TOTPAccount, TOTPCodeResult } from '../types/account';
import { accountRepository } from '../services/storage/accountRepository';
import { generateTotp } from '../services/totp/totpEngine';

export interface AccountWithCode {
  account: TOTPAccount;
  codeResult?: TOTPCodeResult;
  error?: string;
}

export function useAccounts(timestampSeconds: number) {
  const [accounts, setAccounts] = useState<TOTPAccount[]>([]);
  const [codesMap, setCodesMap] = useState<Record<string, TOTPCodeResult>>({});
  const [isLoading, setIsLoading] = useState<boolean>(true);

  // Load all accounts from repository
  const loadAccounts = useCallback(async () => {
    try {
      const list = await accountRepository.getAll();
      setAccounts(list);
    } catch (err) {
      console.error('Failed to load accounts:', err);
    } finally {
      setIsLoading(false);
    }
  }, []);

  useEffect(() => {
    loadAccounts();
  }, [loadAccounts]);

  // Recalculate codes whenever accounts or timestampSeconds change
  useEffect(() => {
    if (accounts.length === 0) return;

    let isMounted = true;
    const generateAll = async () => {
      const nextCodes: Record<string, TOTPCodeResult> = {};
      for (const acc of accounts) {
        try {
          const res = await generateTotp({
            secret: acc.secret,
            algorithm: acc.algorithm,
            digits: acc.digits,
            period: acc.period,
            timestampSeconds,
          });
          nextCodes[acc.id] = res;
        } catch (err) {
          console.error(`Failed to generate TOTP for account ${acc.id}:`, err);
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
  }, [accounts, timestampSeconds]);

  const addAccount = async (accountData: Omit<TOTPAccount, 'id' | 'createdAt' | 'updatedAt'>) => {
    const created = await accountRepository.create(accountData);
    await loadAccounts();
    return created;
  };

  const updateAccount = async (id: string, updates: Partial<Omit<TOTPAccount, 'id' | 'createdAt'>>) => {
    const updated = await accountRepository.update(id, updates);
    await loadAccounts();
    return updated;
  };

  const deleteAccount = async (id: string) => {
    await accountRepository.delete(id);
    await loadAccounts();
  };

  const toggleFavorite = async (id: string) => {
    await accountRepository.toggleFavorite(id);
    await loadAccounts();
  };

  return {
    accounts,
    codesMap,
    isLoading,
    addAccount,
    updateAccount,
    deleteAccount,
    toggleFavorite,
    reloadAccounts: loadAccounts,
  };
}
