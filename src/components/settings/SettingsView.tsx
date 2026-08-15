import React, { useState } from 'react';
import { Sliders, Database, Info, ArrowLeft } from 'lucide-react';
import { UserSettings, ThemeMode } from '../../types/settings';
import { GeneralSettings } from './GeneralSettings';
import { BackupSection } from './BackupSection';
import { AboutSection } from './AboutSection';
import { Button } from '../common/Button';

export interface SettingsViewProps {
  settings: UserSettings;
  onUpdateSettings: (updates: Partial<UserSettings>) => void;
  onThemeChange: (theme: ThemeMode) => void;
  onAccountsChanged: () => void;
  onBack: () => void;
}

type SettingsTab = 'general' | 'backup' | 'about';

export const SettingsView: React.FC<SettingsViewProps> = ({
  settings,
  onUpdateSettings,
  onThemeChange,
  onAccountsChanged,
  onBack,
}) => {
  const [activeTab, setActiveTab] = useState<SettingsTab>('general');

  return (
    <div style={{ display: 'flex', flexDirection: 'column', gap: '14px', flex: 1 }} className="animate-fade-in">
      {/* Header */}
      <div style={{ display: 'flex', alignItems: 'center', gap: '8px' }}>
        <Button
          variant="ghost"
          size="icon"
          onClick={onBack}
          aria-label="Back to accounts"
          style={{ width: '28px', height: '28px' }}
        >
          <ArrowLeft size={16} />
        </Button>
        <h3 style={{ fontSize: '15px', fontWeight: 600, color: 'var(--color-text-primary)' }}>
          Settings
        </h3>
      </div>

      {/* Tabs: [ General ] [ Backup ] [ About ] */}
      <div
        style={{
          display: 'grid',
          gridTemplateColumns: '1fr 1fr 1fr',
          gap: '4px',
          backgroundColor: 'var(--color-bg-input)',
          padding: '4px',
          borderRadius: 'var(--radius-md)',
        }}
      >
        <button
          type="button"
          onClick={() => setActiveTab('general')}
          style={{
            padding: '6px',
            fontSize: '12px',
            fontWeight: 500,
            borderRadius: 'var(--radius-sm)',
            display: 'flex',
            alignItems: 'center',
            justifyContent: 'center',
            gap: '6px',
            backgroundColor: activeTab === 'general' ? 'var(--color-bg-surface-raised)' : 'transparent',
            color: activeTab === 'general' ? 'var(--color-text-primary)' : 'var(--color-text-muted)',
            boxShadow: activeTab === 'general' ? 'var(--shadow-sm)' : 'none',
          }}
        >
          <Sliders size={13} />
          General
        </button>

        <button
          type="button"
          onClick={() => setActiveTab('backup')}
          style={{
            padding: '6px',
            fontSize: '12px',
            fontWeight: 500,
            borderRadius: 'var(--radius-sm)',
            display: 'flex',
            alignItems: 'center',
            justifyContent: 'center',
            gap: '6px',
            backgroundColor: activeTab === 'backup' ? 'var(--color-bg-surface-raised)' : 'transparent',
            color: activeTab === 'backup' ? 'var(--color-text-primary)' : 'var(--color-text-muted)',
            boxShadow: activeTab === 'backup' ? 'var(--shadow-sm)' : 'none',
          }}
        >
          <Database size={13} />
          Backup
        </button>

        <button
          type="button"
          onClick={() => setActiveTab('about')}
          style={{
            padding: '6px',
            fontSize: '12px',
            fontWeight: 500,
            borderRadius: 'var(--radius-sm)',
            display: 'flex',
            alignItems: 'center',
            justifyContent: 'center',
            gap: '6px',
            backgroundColor: activeTab === 'about' ? 'var(--color-bg-surface-raised)' : 'transparent',
            color: activeTab === 'about' ? 'var(--color-text-primary)' : 'var(--color-text-muted)',
            boxShadow: activeTab === 'about' ? 'var(--shadow-sm)' : 'none',
          }}
        >
          <Info size={13} />
          About
        </button>
      </div>

      {/* Tab Content */}
      <div style={{ flex: 1, overflowY: 'auto' }}>
        {activeTab === 'general' && (
          <GeneralSettings
            settings={settings}
            onUpdateSettings={onUpdateSettings}
            onThemeChange={onThemeChange}
          />
        )}

        {activeTab === 'backup' && (
          <BackupSection onAccountsChanged={onAccountsChanged} />
        )}

        {activeTab === 'about' && <AboutSection />}
      </div>
    </div>
  );
};
