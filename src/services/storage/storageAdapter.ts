/**
 * Universal Storage Adapter
 * Detects chrome.storage.local if running in extension runtime,
 * otherwise falls back to browser localStorage / memory mock.
 */

class StorageAdapter {
  private memoryMap = new Map<string, string>();

  private isChromeStorageAvailable(): boolean {
    return (
      typeof chrome !== 'undefined' &&
      !!chrome.storage &&
      !!chrome.storage.local
    );
  }

  async get<T>(key: string, defaultValue: T): Promise<T> {
    if (this.isChromeStorageAvailable()) {
      return new Promise((resolve) => {
        chrome.storage.local.get([key], (result) => {
          if (chrome.runtime.lastError || result[key] === undefined) {
            resolve(defaultValue);
          } else {
            resolve(result[key] as T);
          }
        });
      });
    }

    // Fallback to localStorage / memory
    try {
      if (typeof window !== 'undefined' && window.localStorage) {
        const item = window.localStorage.getItem(key);
        if (item !== null) {
          return JSON.parse(item) as T;
        }
      } else if (this.memoryMap.has(key)) {
        return JSON.parse(this.memoryMap.get(key)!) as T;
      }
    } catch {
      // Ignore storage errors
    }

    return defaultValue;
  }

  async set<T>(key: string, value: T): Promise<void> {
    if (this.isChromeStorageAvailable()) {
      return new Promise((resolve, reject) => {
        chrome.storage.local.set({ [key]: value }, () => {
          if (chrome.runtime.lastError) {
            reject(new Error(chrome.runtime.lastError.message));
          } else {
            resolve();
          }
        });
      });
    }

    try {
      if (typeof window !== 'undefined' && window.localStorage) {
        window.localStorage.setItem(key, JSON.stringify(value));
      } else {
        this.memoryMap.set(key, JSON.stringify(value));
      }
    } catch (err) {
      throw new Error(`Failed to save to local storage: ${err instanceof Error ? err.message : 'Unknown error'}`);
    }
  }

  async remove(key: string): Promise<void> {
    if (this.isChromeStorageAvailable()) {
      return new Promise((resolve) => {
        chrome.storage.local.remove(key, () => resolve());
      });
    }

    try {
      if (typeof window !== 'undefined' && window.localStorage) {
        window.localStorage.removeItem(key);
      } else {
        this.memoryMap.delete(key);
      }
    } catch {
      // Ignore
    }
  }
}

export const storage = new StorageAdapter();
