import React from 'react';
import { ShieldCheck, Plus, Zap, SearchX, Star } from 'lucide-react';
import { TOTPAccount, TOTPCodeResult } from '../../types/account';
import { AccountCard } from './AccountCard';
import { Button } from '../common/Button';

export interface AccountListProps {
  favorites: TOTPAccount[];
  regularAccounts: TOTPAccount[];
  totalAccountsCount: number;
  codesMap: Record<string, TOTPCodeResult>;
  searchQuery: string;
  timerStyle?: 'bar' | 'ring';
  density?: 'compact' | 'comfortable';
  hideCodesByDefault?: boolean;
  onAddAccount: () => void;
  onOpenQuickTotp: () => void;
  onEditAccount: (account: TOTPAccount) => void;
  onDeleteAccount: (account: TOTPAccount) => void;
  onToggleFavorite: (id: string) => void;
}

export const AccountList: React.FC<AccountListProps> = ({
  favorites,
  regularAccounts,
  totalAccountsCount,
  codesMap,
  searchQuery,
  timerStyle = 'bar',
  density = 'comfortable',
  hideCodesByDefault = false,
  onAddAccount,
  onOpenQuickTotp,
  onEditAccount,
  onDeleteAccount,
  onToggleFavorite,
}) => {
  // Case 1: Zero accounts total in database (First launch empty state)
  if (totalAccountsCount === 0) {
    return (
      <div
        style={{
          display: 'flex',
          flexDirection: 'column',
          alignItems: 'center',
          justifyContent: 'center',
          textAlign: 'center',
          padding: '40px 20px',
          flex: 1,
          gap: '16px',
        }}
        className="animate-fade-in"
      >
        <div
          style={{
            width: '64px',
            height: '64px',
            borderRadius: 'var(--radius-xl)',
            backgroundColor: 'var(--color-primary-subtle)',
            color: 'var(--color-primary-hover)',
            display: 'flex',
            alignItems: 'center',
            justifyContent: 'center',
          }}
        >
          <ShieldCheck size={36} />
        </div>

        <div>
          <h3 style={{ fontSize: '18px', fontWeight: 600, color: 'var(--color-text-primary)' }}>
            Your authenticator is empty
          </h3>
          <p
            style={{
              fontSize: '13px',
              color: 'var(--color-text-secondary)',
              marginTop: '6px',
              maxWidth: '280px',
              lineHeight: 1.4,
            }}
          >
            Add your first account to start generating secure two-factor authentication codes.
          </p>
        </div>

        <div style={{ display: 'flex', flexDirection: 'column', gap: '8px', width: '100%', maxWidth: '240px', marginTop: '8px' }}>
          <Button
            variant="primary"
            fullWidth
            icon={<Plus size={16} />}
            onClick={onAddAccount}
          >
            Add Account
          </Button>
          <Button
            variant="quick-totp"
            fullWidth
            icon={<Zap size={16} />}
            onClick={onOpenQuickTotp}
          >
            Quick TOTP
          </Button>
        </div>

        <p style={{ fontSize: '11px', color: 'var(--color-text-muted)', marginTop: '8px' }}>
          🔒 Everything stays on this device • 100% offline
        </p>
      </div>
    );
  }

  // Case 2: Filter results empty (Search matched nothing)
  if (favorites.length === 0 && regularAccounts.length === 0) {
    return (
      <div
        style={{
          display: 'flex',
          flexDirection: 'column',
          alignItems: 'center',
          justifyContent: 'center',
          textAlign: 'center',
          padding: '40px 20px',
          gap: '12px',
        }}
        className="animate-fade-in"
      >
        <SearchX size={32} color="var(--color-text-muted)" />
        <div>
          <h4 style={{ fontSize: '15px', fontWeight: 600, color: 'var(--color-text-primary)' }}>
            No matching accounts
          </h4>
          <p style={{ fontSize: '12px', color: 'var(--color-text-muted)', marginTop: '4px' }}>
            No accounts found for "{searchQuery}"
          </p>
        </div>
      </div>
    );
  }

  // Case 3: Display grouped list
  return (
    <div style={{ display: 'flex', flexDirection: 'column', gap: '16px' }}>
      {/* Pinned / Favorites Section */}
      {favorites.length > 0 && (
        <div style={{ display: 'flex', flexDirection: 'column', gap: '8px' }}>
          <div style={{ display: 'flex', alignItems: 'center', gap: '6px', padding: '0 4px' }}>
            <Star size={13} fill="#F59E0B" color="#F59E0B" />
            <span style={{ fontSize: '11px', fontWeight: 600, textTransform: 'uppercase', letterSpacing: '0.06em', color: 'var(--color-text-secondary)' }}>
              Favorites ({favorites.length})
            </span>
          </div>

          <div style={{ display: 'flex', flexDirection: 'column', gap: '8px' }}>
            {favorites.map((acc) => (
              <AccountCard
                key={acc.id}
                account={acc}
                codeResult={codesMap[acc.id]}
                timerStyle={timerStyle}
                density={density}
                hideCodeByDefault={hideCodesByDefault}
                onEdit={onEditAccount}
                onDelete={onDeleteAccount}
                onToggleFavorite={onToggleFavorite}
              />
            ))}
          </div>
        </div>
      )}

      {/* Regular / All Accounts Section */}
      {regularAccounts.length > 0 && (
        <div style={{ display: 'flex', flexDirection: 'column', gap: '8px' }}>
          {favorites.length > 0 && (
            <div style={{ display: 'flex', alignItems: 'center', gap: '6px', padding: '0 4px' }}>
              <span style={{ fontSize: '11px', fontWeight: 600, textTransform: 'uppercase', letterSpacing: '0.06em', color: 'var(--color-text-muted)' }}>
                All Accounts ({regularAccounts.length})
              </span>
            </div>
          )}

          <div style={{ display: 'flex', flexDirection: 'column', gap: '8px' }}>
            {regularAccounts.map((acc) => (
              <AccountCard
                key={acc.id}
                account={acc}
                codeResult={codesMap[acc.id]}
                timerStyle={timerStyle}
                density={density}
                hideCodeByDefault={hideCodesByDefault}
                onEdit={onEditAccount}
                onDelete={onDeleteAccount}
                onToggleFavorite={onToggleFavorite}
              />
            ))}
          </div>
        </div>
      )}
    </div>
  );
};
