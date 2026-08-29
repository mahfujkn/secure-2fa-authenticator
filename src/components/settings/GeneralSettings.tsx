import React from 'react';
import { ThemeMode, AccountDensity, TimerStyle, ClipboardAutoClear, UserSettings } from '../../types/settings';
import { Select } from '../common/Select';
import { Switch } from '../common/Switch';

export interface GeneralSettingsProps {
  settings: UserSettings;
  onUpdateSettings: (updates: Partial<UserSettings>) => void;
  onThemeChange: (theme: ThemeMode) => void;
}

export const GeneralSettings: React.FC<GeneralSettingsProps> = ({
  settings,
  onUpdateSettings,
  onThemeChange,
}) => {
  return (
    <div style={{ display: 'flex', flexDirection: 'column', gap: '20px' }}>
      {/* Section 1: APPEARANCE */}
      <div style={{ display: 'flex', flexDirection: 'column', gap: '12px' }}>
        <h4
          style={{
            fontSize: '11px',
            fontWeight: 700,
            color: 'var(--color-text-secondary)',
            textTransform: 'uppercase',
            letterSpacing: '0.06em',
          }}
        >
          Appearance
        </h4>

        <div style={{ display: 'flex', flexDirection: 'column', gap: '10px' }}>
          <Select
            label="Theme Appearance"
            value={settings.theme}
            onChange={(e) => onThemeChange(e.target.value as ThemeMode)}
            options={[
              { value: 'dark', label: 'Dark Charcoal (Recommended)' },
              { value: 'light', label: 'Light' },
              { value: 'system', label: 'System' },
            ]}
            helperText="Controls the visual theme across the extension and dashboard."
          />

          <Select
            label="Account List Density"
            value={settings.density}
            onChange={(e) => onUpdateSettings({ density: e.target.value as AccountDensity })}
            options={[
              { value: 'comfortable', label: 'Comfortable (Default)' },
              { value: 'compact', label: 'Compact' },
            ]}
            helperText="Adjusts card height and font sizing in the account list."
          />

          <Select
            label="Countdown Timer Style"
            value={settings.timerStyle}
            onChange={(e) => onUpdateSettings({ timerStyle: e.target.value as TimerStyle })}
            options={[
              { value: 'bar', label: 'Linear Progress Bar' },
              { value: 'ring', label: 'Circular Progress' },
            ]}
            helperText="How the TOTP rollover progress is displayed."
          />
        </div>
      </div>

      <div style={{ height: '1px', backgroundColor: 'var(--color-border-subtle)' }} />

      {/* Section 2: CODE VISIBILITY */}
      <div style={{ display: 'flex', flexDirection: 'column', gap: '12px' }}>
        <h4
          style={{
            fontSize: '11px',
            fontWeight: 700,
            color: 'var(--color-text-secondary)',
            textTransform: 'uppercase',
            letterSpacing: '0.06em',
          }}
        >
          Code Visibility
        </h4>

        <div
          style={{
            padding: '12px 14px',
            backgroundColor: 'var(--color-bg-card)',
            border: '1px solid var(--color-border-subtle)',
            borderRadius: 'var(--radius-md)',
          }}
        >
          <Switch
            label="Hide Codes by Default"
            checked={settings.hideCodesByDefault}
            onChange={(checked) => onUpdateSettings({ hideCodesByDefault: checked })}
            helperText="Automatically hide all TOTP codes when the extension is opened."
          />
        </div>
      </div>

      <div style={{ height: '1px', backgroundColor: 'var(--color-border-subtle)' }} />

      {/* Section 3: CLIPBOARD */}
      <div style={{ display: 'flex', flexDirection: 'column', gap: '12px' }}>
        <h4
          style={{
            fontSize: '11px',
            fontWeight: 700,
            color: 'var(--color-text-secondary)',
            textTransform: 'uppercase',
            letterSpacing: '0.06em',
          }}
        >
          Clipboard
        </h4>

        <Select
          label="Clipboard Auto-Clear"
          value={settings.clipboardAutoClear}
          onChange={(e) => onUpdateSettings({ clipboardAutoClear: parseInt(e.target.value, 10) as ClipboardAutoClear })}
          options={[
            { value: 0, label: 'Never (Keep clipboard text)' },
            { value: 30, label: 'Clear after 30 seconds' },
            { value: 60, label: 'Clear after 60 seconds' },
          ]}
          helperText="Attempts to clear copied TOTP codes from clipboard in supported browser contexts."
        />
      </div>
    </div>
  );
};
