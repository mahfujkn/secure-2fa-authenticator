import { DEFAULT_SETTINGS, UserSettings } from '../../types/settings';
import { storage } from './storageAdapter';

const SETTINGS_STORAGE_KEY = 'secure_totp_settings_v1';

export class SettingsRepository {
  async get(): Promise<UserSettings> {
    const data = await storage.get<UserSettings>(SETTINGS_STORAGE_KEY, DEFAULT_SETTINGS);
    return { ...DEFAULT_SETTINGS, ...data };
  }

  async update(updates: Partial<UserSettings>): Promise<UserSettings> {
    const current = await this.get();
    const merged: UserSettings = {
      ...current,
      ...updates,
      version: DEFAULT_SETTINGS.version,
    };
    await storage.set(SETTINGS_STORAGE_KEY, merged);
    return merged;
  }
}

export const settingsRepository = new SettingsRepository();
