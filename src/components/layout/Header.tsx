import React from 'react';
import { Shield, Settings, ExternalLink, Zap } from 'lucide-react';
import { Button } from '../common/Button';

export interface HeaderProps {
  activeView: 'accounts' | 'quick-totp' | 'settings';
  onNavigate: (view: 'accounts' | 'quick-totp' | 'settings') => void;
  onOpenDashboard?: () => void;
  isDashboard?: boolean;
}

export const Header: React.FC<HeaderProps> = ({
  activeView,
  onNavigate,
  onOpenDashboard,
  isDashboard = false,
}) => {
  return (
    <header
      style={{
        padding: isDashboard ? '16px 24px' : '10px 14px',
        backgroundColor: 'var(--color-bg-header)',
        borderBottom: '1px solid var(--color-border-subtle)',
        display: 'flex',
        alignItems: 'center',
        justifyContent: 'space-between',
        userSelect: 'none',
      }}
    >
      {/* Brand logo & title */}
      <div
        style={{
          display: 'flex',
          alignItems: 'center',
          gap: '10px',
          cursor: 'pointer',
        }}
        onClick={() => onNavigate('accounts')}
        title="Secure 2FA Authenticator"
      >
        <div
          style={{
            width: '30px',
            height: '30px',
            borderRadius: '8px',
            background: 'linear-gradient(135deg, #2D68EB 0%, #2459D6 100%)',
            border: '1px solid rgba(255, 255, 255, 0.15)',
            color: '#ffffff',
            display: 'flex',
            alignItems: 'center',
            justifyContent: 'center',
            boxShadow: '0 2px 8px rgba(45, 104, 235, 0.35)',
            flexShrink: 0,
          }}
        >
          <Shield size={16} />
        </div>

        <div style={{ display: 'flex', flexDirection: 'column', justifyContent: 'center' }}>
          <h2
            style={{
              fontSize: isDashboard ? '15px' : '13.5px',
              fontWeight: 700,
              color: 'var(--color-text-primary)',
              lineHeight: 1.2,
              letterSpacing: '-0.01em',
              margin: 0,
              padding: 0,
            }}
          >
            {isDashboard ? 'Secure 2FA Authenticator' : 'Secure 2FA'}
          </h2>
          <span
            style={{
              fontSize: '9.5px',
              color: 'var(--color-success)',
              fontWeight: 700,
              letterSpacing: '0.06em',
              textTransform: 'uppercase',
              lineHeight: 1.1,
              marginTop: '1px',
            }}
          >
            100% Offline
          </span>
        </div>
      </div>

      {/* Header Actions */}
      <div style={{ display: 'flex', alignItems: 'center', gap: '4px' }}>
        {activeView !== 'quick-totp' && (
          <Button
            variant="ghost"
            size="sm"
            onClick={() => onNavigate('quick-totp')}
            icon={<Zap size={14} color="var(--color-quick-totp)" />}
            style={{ fontSize: '12px', height: '28px', padding: '0 8px', color: 'var(--color-quick-totp)' }}
            title="Quick TOTP"
          >
            Quick TOTP
          </Button>
        )}

        {!isDashboard && onOpenDashboard && (
          <Button
            variant="ghost"
            size="icon"
            onClick={onOpenDashboard}
            title="Open Full Dashboard"
            aria-label="Open Full Dashboard"
            style={{ width: '28px', height: '28px' }}
          >
            <ExternalLink size={14} color="var(--color-text-secondary)" />
          </Button>
        )}

        <Button
          variant="ghost"
          size="icon"
          onClick={() => onNavigate(activeView === 'settings' ? 'accounts' : 'settings')}
          title="Settings"
          aria-label="Settings"
          style={{
            width: '28px',
            height: '28px',
            backgroundColor: activeView === 'settings' ? 'var(--color-bg-surface-raised)' : 'transparent',
          }}
        >
          <Settings size={14} color={activeView === 'settings' ? 'var(--color-primary)' : 'var(--color-text-secondary)'} />
        </Button>
      </div>
    </header>
  );
};
