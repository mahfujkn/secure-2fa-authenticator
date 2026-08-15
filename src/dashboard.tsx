import React, { useEffect, useState } from 'react';
import ReactDOM from 'react-dom/client';
import { DEFAULT_SETTINGS, UserSettings } from './types/settings';
import { settingsRepository } from './services/storage/settingsRepository';
import { DashboardView } from './components/dashboard/DashboardView';
import './styles/global.css';

const DashboardApp: React.FC = () => {
  const [settings, setSettings] = useState<UserSettings>(DEFAULT_SETTINGS);
  const [isLoaded, setIsLoaded] = useState(false);

  useEffect(() => {
    settingsRepository.get().then((loaded) => {
      setSettings(loaded);
      setIsLoaded(true);
    });
  }, []);

  const handleUpdateSettings = async (updates: Partial<UserSettings>) => {
    const next = await settingsRepository.update(updates);
    setSettings(next);
  };

  if (!isLoaded) return null;

  return (
    <DashboardView
      initialSettings={settings}
      onUpdateSettings={handleUpdateSettings}
    />
  );
};

const rootEl = document.getElementById('root');
if (rootEl) {
  ReactDOM.createRoot(rootEl).render(
    <React.StrictMode>
      <DashboardApp />
    </React.StrictMode>
  );
}
