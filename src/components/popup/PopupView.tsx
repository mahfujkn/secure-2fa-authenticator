import React, { useState } from 'react';
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

export interface PopupViewProps {
  initialSettings: UserSettings;
  onUpdateSettings: (updates: Partial<UserSettings>) => void;
  onOpenDashboard: () => void;
}

export const PopupView: React.FC<PopupViewProps> = ({
  initialSettings,
  onUpdateSettings,
  onOpenDashboard,
}) => {
  const [settings, setSettings] = useState<UserSettings>(initialSettings);
  const [activeView, setActiveView] = useState<'accounts' | 'quick-totp' | 'settings'>('accounts');

  // Modals state
  const [isAddModalOpen, setIsAddModalOpen] = useState<boolean>(false);
  const [addModalMode, setAddModalMode] = useState<'manual' | 'qr'>('manual');
  const [editingAccount, setEditingAccount] = useState<TOTPAccount | null>(null);
  const [deletingAccount, setDeletingAccount] = useState<TOTPAccount | null>(null);

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
    <div className="popup-container">
      <Header
        activeView={activeView}
        onNavigate={(v) => setActiveView(v)}
        onOpenDashboard={onOpenDashboard}
        isDashboard={false}
      />

      {/* Main Content Area */}
      <div
        style={{
          flex: 1,
          padding: '12px 14px',
          overflowY: 'auto',
          display: 'flex',
          flexDirection: 'column',
          gap: '12px',
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
            {/* Search Bar if accounts exist */}
            {accounts.length > 0 && (
              <Input
                placeholder="Search accounts..."
                leftIcon={<Search size={14} />}
                value={searchQuery}
                onChange={(e) => setSearchQuery(e.target.value)}
              />
            )}

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
                setAddModalMode('manual');
                setIsAddModalOpen(true);
              }}
              onOpenQuickTotp={() => setActiveView('quick-totp')}
              onEditAccount={(acc) => setEditingAccount(acc)}
              onDeleteAccount={(acc) => setDeletingAccount(acc)}
              onToggleFavorite={toggleFavorite}
            />
          </>
        )}
      </div>

      {/* Bottom Action Footer for Accounts View */}
      {activeView === 'accounts' && accounts.length > 0 && (
        <div
          style={{
            padding: '10px 14px',
            backgroundColor: 'var(--color-bg-surface)',
            borderTop: '1px solid var(--color-border-subtle)',
            display: 'grid',
            gridTemplateColumns: '1fr 1fr',
            gap: '8px',
          }}
        >
          <Button
            variant="quick-totp"
            size="sm"
            onClick={() => setActiveView('quick-totp')}
            icon={<Zap size={14} />}
          >
            ⚡ Quick TOTP
          </Button>

          <Button
            variant="primary"
            size="sm"
            onClick={() => setIsAddModalOpen(true)}
            icon={<Plus size={14} />}
          >
            + Add Account
          </Button>
        </div>
      )}

      <Footer />

      {/* Modals */}
      <AddAccountModal
        isOpen={isAddModalOpen}
        onClose={() => {
          setIsAddModalOpen(false);
          setAddModalMode('manual');
        }}
        onAddAccount={addAccount}
        initialMode={addModalMode}
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
