import { describe, it, expect, beforeEach } from 'vitest';
import { settingsRepository } from '../services/storage/settingsRepository';
import { storage } from '../services/storage/storageAdapter';

describe('Settings Repository & Code Visibility', () => {
  beforeEach(async () => {
    await storage.remove('secure_totp_settings_v1');
  });

  it('should initialize with default settings including hideCodesByDefault=false', async () => {
    const settings = await settingsRepository.get();
    expect(settings.hideCodesByDefault).toBe(false);
    expect(settings.theme).toBe('system');
    expect(settings.density).toBe('comfortable');
    expect(settings.timerStyle).toBe('bar');
    expect(settings.clipboardAutoClear).toBe(30);
  });

  it('should update hideCodesByDefault setting without losing existing settings', async () => {
    await settingsRepository.update({ hideCodesByDefault: true });
    const updated = await settingsRepository.get();
    expect(updated.hideCodesByDefault).toBe(true);
    expect(updated.density).toBe('comfortable');

    await settingsRepository.update({ density: 'compact' });
    const updatedAgain = await settingsRepository.get();
    expect(updatedAgain.hideCodesByDefault).toBe(true);
    expect(updatedAgain.density).toBe('compact');
  });

  it('should fallback to default settings gracefully when storage contains incomplete object', async () => {
    // Simulate legacy storage without hideCodesByDefault
    await storage.set('secure_totp_settings_v1', { theme: 'dark', density: 'compact' });
    const loaded = await settingsRepository.get();
    expect(loaded.theme).toBe('dark');
    expect(loaded.density).toBe('compact');
    expect(loaded.hideCodesByDefault).toBe(false);
  });
});
