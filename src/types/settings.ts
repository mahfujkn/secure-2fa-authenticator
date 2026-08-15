export type ThemeMode = 'system' | 'dark' | 'light';
export type AccountDensity = 'compact' | 'comfortable';
export type TimerStyle = 'bar' | 'ring';
export type DuplicateHandling = 'skip' | 'replace' | 'keep_both';
export type ClipboardAutoClear = 0 | 30 | 60; // 0 = never

export interface UserSettings {
  theme: ThemeMode;
  density: AccountDensity;
  timerStyle: TimerStyle;
  duplicateHandling: DuplicateHandling;
  clipboardAutoClear: ClipboardAutoClear;
  hideCodesByDefault: boolean;
  version: number;
}

export const DEFAULT_SETTINGS: UserSettings = {
  theme: 'system',
  density: 'comfortable',
  timerStyle: 'bar',
  duplicateHandling: 'skip',
  clipboardAutoClear: 30,
  hideCodesByDefault: false,
  version: 1,
};
