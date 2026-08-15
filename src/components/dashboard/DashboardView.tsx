import React, { useState, useEffect } from 'react';
import { Search, Plus, Zap } from 'lucide-react';
import { TOTPAccount } from '../../types/account';
import { UserSettings } from '../../types/settings';
import { useTotpTimer } from '../../hooks/useTotpTimer';
import { useAccounts } from '../../hooks/useAccounts';
import { useSearch } from '../../hooks/useSearch';
import { useTheme } from '../../hooks/useTheme';
import { Header } from '../layout/Header';
import { Footer } from '../layout/Footer';
import { AccountList } from '../accounts/AccountList';
import { AddAccountModal } from '../accounts/AddAccountModal';
import { EditAccountModal } from '../accounts/EditAccountModal';
import { DeleteAccountModal } from '../accounts/DeleteAccountModal';
import { QuickTotpView } from '../quickTotp/QuickTotpView';
import { SettingsView } from '../settings/SettingsView';
import { Button } from '../common/Button';
import { Input } from '../common/Input';

export interface DashboardViewProps {
  initialSettings: UserSettings;
  onUpdateSettings: (updates: Partial<UserSettings>) => void;
}

export const DashboardView: React.FC<DashboardViewProps> = ({
  initialSettings,
  onUpdateSettings,
}) => {
  const [settings, setSettings] = useState<UserSettings>(initialSettings);
  const [activeView, setActiveView] = useState<'accounts' | 'quick-totp' | 'settings'>('accounts');

  // Modals state
  const [isAddModalOpen, setIsAddModalOpen] = useState<boolean>(false);
  const [editingAccount, setEditingAccount] = useState<TOTPAccount | null>(null);
  const [deletingAccount, setDeletingAccount] = useState<TOTPAccount | null>(null);

  const [initialImportUri, setInitialImportUri] = useState<string | undefined>(undefined);
  const [initialAddMode, setInitialAddMode] = useState<'manual' | 'qr'>('manual');

  // Check URL parameters on mount (e.g. from context menus)
  useEffect(() => {
    try {
      const params = new URLSearchParams(window.location.search);
      const importUri = params.get('import_uri');
      const action = params.get('action');

      if (importUri) {
        setInitialImportUri(decodeURIComponent(importUri));
        setInitialAddMode('manual');
        setIsAddModalOpen(true);
      } else if (action === 'scan_qr') {
        setInitialAddMode('qr');
        setIsAddModalOpen(true);
      }
    } catch {
      // Ignore
    }
  }, []);

  const { timestampSeconds } = useTotpTimer();
  const { setThemeMode } = useTheme();
  const {
    accounts,
    codesMap,
    addAccount,
    updateAccount,
    deleteAccount,
    toggleFavorite,
    reloadAccounts,
  } = useAccounts(timestampSeconds);

  const {
    searchQuery,
    setSearchQuery,
    favorites,
    regularAccounts,
  } = useSearch(accounts);

  const handleUpdateSettings = (updates: Partial<UserSettings>) => {
    const updated = { ...settings, ...updates };
    setSettings(updated);
    onUpdateSettings(updates);
  };

  return (
    <div className="dashboard-container">
      <Header
        activeView={activeView}
        onNavigate={(v) => setActiveView(v)}
        isDashboard={true}
      />

      <main
        style={{
          flex: 1,
          maxWidth: '860px',
          width: '100%',
          margin: '0 auto',
          padding: '24px 20px',
          display: 'flex',
          flexDirection: 'column',
          gap: '20px',
        }}
      >
        {activeView === 'quick-totp' && (
          <QuickTotpView
            timestampSeconds={timestampSeconds}
            onBack={() => setActiveView('accounts')}
            onSavePermanentAccount={async (data) => {
              await addAccount(data);
              setActiveView('accounts');
            }}
          />
        )}

        {activeView === 'settings' && (
          <SettingsView
            settings={settings}
            onUpdateSettings={handleUpdateSettings}
            onThemeChange={setThemeMode}
            onAccountsChanged={reloadAccounts}
            onBack={() => setActiveView('accounts')}
          />
        )}

        {activeView === 'accounts' && (
          <>
            {/* Top Toolbar */}
            <div
              style={{
                display: 'flex',
                alignItems: 'center',
                justifyContent: 'space-between',
                gap: '12px',
                flexWrap: 'wrap',
              }}
            >
              <div style={{ flex: 1, minWidth: '220px', maxWidth: '400px' }}>
                <Input
                  placeholder="Search accounts or services..."
                  leftIcon={<Search size={14} />}
                  value={searchQuery}
                  onChange={(e) => setSearchQuery(e.target.value)}
                />
              </div>

              <div style={{ display: 'flex', alignItems: 'center', gap: '8px' }}>
                <Button
                  variant="quick-totp"
                  size="md"
                  onClick={() => setActiveView('quick-totp')}
                  icon={<Zap size={15} />}
                >
                  Quick TOTP
                </Button>

                <Button
                  variant="primary"
                  size="md"
                  onClick={() => setIsAddModalOpen(true)}
                  icon={<Plus size={15} />}
                >
                  Add Account
                </Button>
              </div>
            </div>

            {/* Account List */}
            <AccountList
              favorites={favorites}
              regularAccounts={regularAccounts}
              totalAccountsCount={accounts.length}
              codesMap={codesMap}
              searchQuery={searchQuery}
              timerStyle={settings.timerStyle}
              density={settings.density}
              hideCodesByDefault={settings.hideCodesByDefault}
              onAddAccount={() => {
                setInitialAddMode('manual');
                setIsAddModalOpen(true);
              }}
              onOpenQuickTotp={() => setActiveView('quick-totp')}
              onEditAccount={(acc) => setEditingAccount(acc)}
              onDeleteAccount={(acc) => setDeletingAccount(acc)}
              onToggleFavorite={toggleFavorite}
            />
          </>
        )}
      </main>

      <Footer />

      {/* Modals */}
      <AddAccountModal
        isOpen={isAddModalOpen}
        onClose={() => {
          setIsAddModalOpen(false);
          setInitialImportUri(undefined);
          setInitialAddMode('manual');
        }}
        onAddAccount={addAccount}
        initialOtpUri={initialImportUri}
        initialMode={initialAddMode}
        existingAccounts={accounts}
      />

      <EditAccountModal
        account={editingAccount}
        isOpen={editingAccount !== null}
        onClose={() => setEditingAccount(null)}
        onUpdateAccount={updateAccount}
      />

      <DeleteAccountModal
        account={deletingAccount}
        isOpen={deletingAccount !== null}
        onClose={() => setDeletingAccount(null)}
        onConfirmDelete={deleteAccount}
      />
    </div>
  );
};
