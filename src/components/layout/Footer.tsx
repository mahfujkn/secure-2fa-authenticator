import React from 'react';
import { Lock } from 'lucide-react';

export const Footer: React.FC = () => {
  const openDeveloperLink = (e: React.MouseEvent) => {
    e.preventDefault();
    const url = 'https://github.com/mahfujkn';
    if (typeof chrome !== 'undefined' && chrome.tabs?.create) {
      chrome.tabs.create({ url });
    } else {
      window.open(url, '_blank', 'noopener,noreferrer');
    }
  };

  return (
    <footer
      style={{
        padding: '8px 14px',
        backgroundColor: 'var(--color-bg-footer)',
        borderTop: '1px solid var(--color-border-subtle)',
        display: 'flex',
        flexDirection: 'column',
        alignItems: 'center',
        justifyContent: 'center',
        gap: '4px',
        fontSize: '11px',
        color: 'var(--color-text-muted)',
        userSelect: 'none',
      }}
    >
      {/* Offline / Security notice */}
      <div style={{ display: 'flex', alignItems: 'center', gap: '6px', lineHeight: 1.2 }}>
        <Lock size={11} />
        <span>Your secrets stay on your device • 100% Offline</span>
      </div>

      {/* Developer credit */}
      <div style={{ fontSize: '10.5px', color: 'var(--color-text-muted)', lineHeight: 1.2 }}>
        <span>Developed with 💖 by </span>
        <a
          href="https://github.com/mahfujkn"
          onClick={openDeveloperLink}
          style={{
            color: 'var(--color-primary)',
            fontWeight: 600,
            textDecoration: 'none',
            cursor: 'pointer',
            transition: 'color var(--transition-fast)',
          }}
          onMouseEnter={(e) => (e.currentTarget.style.color = 'var(--color-primary-hover)')}
          onMouseLeave={(e) => (e.currentTarget.style.color = 'var(--color-primary)')}
          title="Mahfuj Khan Rafsan (GitHub)"
        >
          Mahfuj Khan Rafsan
        </a>
      </div>
    </footer>
  );
};
