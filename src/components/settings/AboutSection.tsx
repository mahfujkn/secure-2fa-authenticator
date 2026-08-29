import React from 'react';
import {
  ShieldCheck,
  WifiOff,
  DatabaseZap,
  EyeOff,
  Lock,
  ExternalLink,
  Code2,
  Heart,
} from 'lucide-react';
import { Button } from '../common/Button';

// Bundled inline GitHub SVG icon
const GithubIcon: React.FC<{ size?: number }> = ({ size = 16 }) => (
  <svg
    width={size}
    height={size}
    viewBox="0 0 24 24"
    fill="currentColor"
    style={{ display: 'inline-block', verticalAlign: 'middle' }}
  >
    <path
      fillRule="evenodd"
      clipRule="evenodd"
      d="M12 2C6.477 2 2 6.484 2 12.017c0 4.425 2.865 8.18 6.839 9.504.5.092.682-.217.682-.483 0-.237-.008-.868-.013-1.703-2.782.605-3.369-1.343-3.369-1.343-.454-1.158-1.11-1.466-1.11-1.466-.908-.62.069-.608.069-.608 1.003.07 1.53 1.032 1.53 1.032.892 1.53 2.341 1.088 2.91.832.092-.647.35-1.088.636-1.338-2.22-.253-4.555-1.113-4.555-4.951 0-1.093.39-1.988 1.029-2.688-.103-.253-.446-1.272.098-2.65 0 0 .84-.27 2.75 1.026A9.564 9.564 0 0112 6.844c.85.004 1.705.115 2.504.337 1.909-1.296 2.747-1.027 2.747-1.027.546 1.379.202 2.398.1 2.651.64.7 1.028 1.595 1.028 2.688 0 3.848-2.339 4.695-4.566 4.943.359.309.678.92.678 1.855 0 1.338-.012 2.419-.012 2.747 0 .268.18.58.688.482A10.019 10.019 0 0022 12.017C22 6.484 17.522 2 12 2z"
    />
  </svg>
);

export const AboutSection: React.FC = () => {
  const privacyPoints = [
    {
      icon: <WifiOff size={16} color="var(--color-primary)" />,
      title: '100% Local & Offline',
      description: 'Zero network requests. No external APIs, CDNs, or remote scripts are required for normal operation.',
    },
    {
      icon: <DatabaseZap size={16} color="var(--color-success)" />,
      title: 'No Cloud Storage',
      description: 'All persistent account secrets are stored solely inside the browser’s local storage.',
    },
    {
      icon: <EyeOff size={16} color="var(--color-accent)" />,
      title: 'No Telemetry or Tracking',
      description: 'No analytics, crash reporters, tracking pixels, or user profiling.',
    },
    {
      icon: <Lock size={16} color="var(--color-quick-totp)" />,
      title: 'Ephemeral Quick TOTP',
      description: 'Quick TOTP temporary secrets stay strictly in runtime memory and are discarded when the session closes.',
    },
    {
      icon: <ShieldCheck size={16} color="var(--color-success)" />,
      title: 'Local QR Decoding',
      description: 'Uploaded and captured QR codes are processed locally in browser memory.',
    },
  ];

  const handleOpenUrl = (url: string) => (e: React.MouseEvent) => {
    e.preventDefault();
    if (typeof chrome !== 'undefined' && chrome.tabs) {
      chrome.tabs.create({ url });
    } else {
      window.open(url, '_blank', 'noopener,noreferrer');
    }
  };

  return (
    <div style={{ display: 'flex', flexDirection: 'column', gap: '18px' }} className="animate-fade-in">
      {/* Product Header */}
      <div
        style={{
          padding: '14px',
          backgroundColor: 'var(--color-primary-subtle)',
          borderRadius: 'var(--radius-lg)',
          border: '1px solid rgba(45, 104, 235, 0.25)',
          display: 'flex',
          flexDirection: 'column',
          gap: '4px',
        }}
      >
        <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between' }}>
          <h3 style={{ fontSize: '15px', fontWeight: 700, color: 'var(--color-text-primary)' }}>
            Secure 2FA Authenticator
          </h3>
          <span
            style={{
              fontSize: '11px',
              fontWeight: 700,
              fontFamily: 'var(--font-mono)',
              padding: '2px 8px',
              backgroundColor: 'var(--color-bg-surface-raised)',
              borderRadius: 'var(--radius-pill)',
              color: 'var(--color-primary-hover)',
              border: '1px solid rgba(45, 104, 235, 0.3)',
            }}
          >
            v1.0.0
          </span>
        </div>
        <p style={{ fontSize: '12px', color: 'var(--color-text-secondary)', lineHeight: 1.4 }}>
          Open-source, privacy-first RFC 6238 TOTP browser extension.
        </p>
      </div>

      {/* Privacy Architecture Cards */}
      <div style={{ display: 'flex', flexDirection: 'column', gap: '8px' }}>
        <h4
          style={{
            fontSize: '11px',
            fontWeight: 700,
            color: 'var(--color-text-secondary)',
            textTransform: 'uppercase',
            letterSpacing: '0.06em',
          }}
        >
          Privacy Architecture
        </h4>

        {privacyPoints.map((pt, index) => (
          <div
            key={index}
            style={{
              padding: '10px 12px',
              backgroundColor: 'var(--color-bg-card)',
              borderRadius: 'var(--radius-md)',
              border: '1px solid var(--color-border-subtle)',
              display: 'flex',
              alignItems: 'flex-start',
              gap: '10px',
            }}
          >
            <div style={{ marginTop: '2px' }}>{pt.icon}</div>
            <div>
              <p style={{ fontSize: '12px', fontWeight: 600, color: 'var(--color-text-primary)' }}>
                {pt.title}
              </p>
              <p style={{ fontSize: '11px', color: 'var(--color-text-secondary)', marginTop: '2px', lineHeight: 1.3 }}>
                {pt.description}
              </p>
            </div>
          </div>
        ))}
      </div>

      {/* Developer Credit Section */}
      <div
        style={{
          padding: '14px',
          backgroundColor: 'var(--color-bg-card)',
          borderRadius: 'var(--radius-lg)',
          border: '1px solid var(--color-border-subtle)',
          display: 'flex',
          flexDirection: 'column',
          gap: '10px',
        }}
      >
        <div>
          <span style={{ fontSize: '11px', color: 'var(--color-text-muted)', display: 'flex', alignItems: 'center', gap: '4px' }}>
            Developed with <Heart size={12} fill="#EF4444" color="#EF4444" /> by
          </span>
          <h4 style={{ fontSize: '15px', fontWeight: 700, color: 'var(--color-text-primary)', marginTop: '2px' }}>
            Mahfuj Khan Rafsan
          </h4>
          <p style={{ fontSize: '12px', color: 'var(--color-text-secondary)', marginTop: '1px' }}>
            github.com/mahfujkn
          </p>
        </div>

        <div>
          <Button
            variant="outline"
            size="sm"
            onClick={handleOpenUrl('https://github.com/mahfujkn')}
            icon={<GithubIcon size={14} />}
            aria-label="Open Mahfuj Khan Rafsan’s GitHub profile"
          >
            GitHub <ExternalLink size={12} style={{ marginLeft: '4px' }} />
          </Button>
        </div>
      </div>

      {/* Open Source Section */}
      <div
        style={{
          padding: '12px 14px',
          backgroundColor: 'var(--color-bg-input)',
          borderRadius: 'var(--radius-md)',
          border: '1px solid var(--color-border-subtle)',
          display: 'flex',
          flexDirection: 'column',
          gap: '8px',
        }}
      >
        <div style={{ display: 'flex', alignItems: 'center', gap: '6px' }}>
          <Code2 size={15} color="var(--color-text-secondary)" />
          <span style={{ fontSize: '12px', fontWeight: 600, color: 'var(--color-text-primary)' }}>
            Open Source
          </span>
        </div>
        <p style={{ fontSize: '11px', color: 'var(--color-text-muted)', lineHeight: 1.4 }}>
          Built as a privacy-first, open-source browser authenticator.
        </p>
        <div>
          <Button
            variant="ghost"
            size="sm"
            onClick={handleOpenUrl('https://github.com/mahfujkn/secure-2fa-authenticator')}
            icon={<ExternalLink size={13} />}
            style={{ fontSize: '11px', padding: '0 4px', height: '24px', color: 'var(--color-primary-hover)' }}
          >
            View Source on GitHub ↗
          </Button>
        </div>
      </div>
    </div>
  );
};
