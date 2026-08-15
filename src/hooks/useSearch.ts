import { useState, useMemo } from 'react';
import { TOTPAccount } from '../types/account';

export function useSearch(accounts: TOTPAccount[]) {
  const [searchQuery, setSearchQuery] = useState<string>('');

  const filteredAccounts = useMemo(() => {
    const query = searchQuery.trim().toLowerCase();
    if (!query) {
      return accounts;
    }

    return accounts.filter((acc) => {
      const issuerMatch = acc.issuer.toLowerCase().includes(query);
      const accountMatch = acc.account.toLowerCase().includes(query);
      return issuerMatch || accountMatch;
    });
  }, [accounts, searchQuery]);

  const favorites = useMemo(() => {
    return filteredAccounts.filter((a) => a.isFavorite);
  }, [filteredAccounts]);

  const regularAccounts = useMemo(() => {
    return filteredAccounts.filter((a) => !a.isFavorite);
  }, [filteredAccounts]);

  return {
    searchQuery,
    setSearchQuery,
    filteredAccounts,
    favorites,
    regularAccounts,
    hasActiveFilter: searchQuery.trim().length > 0,
  };
}
