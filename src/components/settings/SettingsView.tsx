import React, { useState } from 'react';
import { ArrowLeft, Sliders, Database, Info } from 'lucide-react';
import { UserSettings, ThemeMode } from '../../types/settings';
import { Button } from '../common/Button';
import { GeneralSettings } from './GeneralSettings';
import { BackupSection } from './BackupSection';
import { AboutSection } from './AboutSection';

export interface SettingsViewProps {
  settings: UserSettings;
  onUpdateSettings: (updates: Partial<UserSettings>) => void;
  onThemeChange: (theme: ThemeMode) => void;
  onAccountsChanged: () => void;
  onBack: () => void;
}

export const SettingsView: React.FC<SettingsViewProps> = ({
  settings,
  onUpdateSettings,
  onThemeChange,
  onAccountsChanged,
  onBack,
}) => {
  const [activeTab, setActiveTab] = useState<'general' | 'backup' | 'about'>('general');

  return (
    <div
      style={{
        display: 'flex',
        flexDirection: 'column',
        gap: '14px',
        flex: 1,
      }}
      className="animate-fade-in"
    >
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
          backgroundColor: 'var(--color-bg-header)',
          border: '1px solid var(--color-border-subtle)',
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
            fontWeight: activeTab === 'general' ? 600 : 500,
            borderRadius: 'var(--radius-sm)',
            display: 'flex',
            alignItems: 'center',
            justifyContent: 'center',
            gap: '6px',
            backgroundColor: activeTab === 'general' ? 'var(--color-primary)' : 'transparent',
            color: activeTab === 'general' ? '#FFFFFF' : 'var(--color-text-secondary)',
            boxShadow: activeTab === 'general' ? '0 2px 6px rgba(45, 104, 235, 0.35)' : 'none',
            transition: 'all var(--transition-fast)',
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
            fontWeight: activeTab === 'backup' ? 600 : 500,
            borderRadius: 'var(--radius-sm)',
            display: 'flex',
            alignItems: 'center',
            justifyContent: 'center',
            gap: '6px',
            backgroundColor: activeTab === 'backup' ? 'var(--color-primary)' : 'transparent',
            color: activeTab === 'backup' ? '#FFFFFF' : 'var(--color-text-secondary)',
            boxShadow: activeTab === 'backup' ? '0 2px 6px rgba(45, 104, 235, 0.35)' : 'none',
            transition: 'all var(--transition-fast)',
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
            fontWeight: activeTab === 'about' ? 600 : 500,
            borderRadius: 'var(--radius-sm)',
            display: 'flex',
            alignItems: 'center',
            justifyContent: 'center',
            gap: '6px',
            backgroundColor: activeTab === 'about' ? 'var(--color-primary)' : 'transparent',
            color: activeTab === 'about' ? '#FFFFFF' : 'var(--color-text-secondary)',
            boxShadow: activeTab === 'about' ? '0 2px 6px rgba(45, 104, 235, 0.35)' : 'none',
            transition: 'all var(--transition-fast)',
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
