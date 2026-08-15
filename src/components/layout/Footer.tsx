import { Lock } from 'lucide-react';

export const Footer: React.FC = () => {
  return (
    <footer
      style={{
        padding: '8px 14px',
        backgroundColor: 'var(--color-bg-surface)',
        borderTop: '1px solid var(--color-border-subtle)',
        display: 'flex',
        alignItems: 'center',
        justifyContent: 'center',
        gap: '8px',
        fontSize: '11px',
        color: 'var(--color-text-muted)',
        userSelect: 'none',
      }}
    >
      <Lock size={11} />
      <span>Your secrets stay on your device • 100% Offline</span>
    </footer>
  );
};
