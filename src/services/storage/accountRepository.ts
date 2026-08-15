import { TOTPAccount } from '../../types/account';
import { storage } from './storageAdapter';
import { normalizeBase32, isValidBase32 } from '../totp/base32';

const ACCOUNTS_STORAGE_KEY = 'secure_totp_accounts_v1';

export class AccountRepository {
  /**
   * Retrieves all saved accounts
   */
  async getAll(): Promise<TOTPAccount[]> {
    const raw = await storage.get<TOTPAccount[]>(ACCOUNTS_STORAGE_KEY, []);
    if (!Array.isArray(raw)) return [];
    return raw;
  }

  /**
   * Saves a new account
   */
  async create(accountData: Omit<TOTPAccount, 'id' | 'createdAt' | 'updatedAt'>): Promise<TOTPAccount> {
    const normalizedSecret = normalizeBase32(accountData.secret);
    if (!isValidBase32(normalizedSecret)) {
      throw new Error('Invalid Base32 secret');
    }

    const accounts = await this.getAll();
    const now = Date.now();
    const newAccount: TOTPAccount = {
      ...accountData,
      id: `acc-${now}-${Math.random().toString(36).slice(2, 7)}`,
      secret: normalizedSecret,
      createdAt: now,
      updatedAt: now,
    };

    accounts.push(newAccount);
    await storage.set(ACCOUNTS_STORAGE_KEY, accounts);
    return newAccount;
  }

  /**
   * Updates an existing account
   */
  async update(id: string, updates: Partial<Omit<TOTPAccount, 'id' | 'createdAt'>>): Promise<TOTPAccount> {
    const accounts = await this.getAll();
    const index = accounts.findIndex((a) => a.id === id);
    if (index === -1) {
      throw new Error('Account not found');
    }

    if (updates.secret) {
      const normalizedSecret = normalizeBase32(updates.secret);
      if (!isValidBase32(normalizedSecret)) {
        throw new Error('Invalid Base32 secret');
      }
      updates.secret = normalizedSecret;
    }

    const updated: TOTPAccount = {
      ...accounts[index],
      ...updates,
      updatedAt: Date.now(),
    };

    accounts[index] = updated;
    await storage.set(ACCOUNTS_STORAGE_KEY, accounts);
    return updated;
  }

  /**
   * Deletes an account permanently from local storage
   */
  async delete(id: string): Promise<void> {
    const accounts = await this.getAll();
    const filtered = accounts.filter((a) => a.id !== id);
    await storage.set(ACCOUNTS_STORAGE_KEY, filtered);
  }

  /**
   * Toggles the favorite / pinned state of an account
   */
  async toggleFavorite(id: string): Promise<TOTPAccount> {
    const accounts = await this.getAll();
    const index = accounts.findIndex((a) => a.id === id);
    if (index === -1) {
      throw new Error('Account not found');
    }

    accounts[index].isFavorite = !accounts[index].isFavorite;
    accounts[index].updatedAt = Date.now();
    await storage.set(ACCOUNTS_STORAGE_KEY, accounts);
    return accounts[index];
  }

  /**
   * Bulk replaces all accounts (used during backup restore)
   */
  async setAll(accounts: TOTPAccount[]): Promise<void> {
    await storage.set(ACCOUNTS_STORAGE_KEY, accounts);
  }
}

export const accountRepository = new AccountRepository();
