import React, { useEffect, useState } from 'react';
import ReactDOM from 'react-dom/client';
import { DEFAULT_SETTINGS, UserSettings } from './types/settings';
import { settingsRepository } from './services/storage/settingsRepository';
import { PopupView } from './components/popup/PopupView';
import './styles/global.css';

const PopupApp: React.FC = () => {
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

  const handleOpenDashboard = () => {
    if (typeof chrome !== 'undefined' && chrome.tabs) {
      chrome.tabs.create({ url: chrome.runtime.getURL('dashboard.html') });
    } else {
      window.open('dashboard.html', '_blank');
    }
  };

  if (!isLoaded) return null;

  return (
    <PopupView
      initialSettings={settings}
      onUpdateSettings={handleUpdateSettings}
      onOpenDashboard={handleOpenDashboard}
    />
  );
};

const rootEl = document.getElementById('root');
if (rootEl) {
  ReactDOM.createRoot(rootEl).render(
    <React.StrictMode>
      <PopupApp />
    </React.StrictMode>
  );
}
