import React from 'react';
import { ShieldCheck, WifiOff, DatabaseZap, EyeOff, Lock } from 'lucide-react';

export const PrivacyInfo: React.FC = () => {
  const points = [
    {
      icon: <WifiOff size={16} color="var(--color-primary)" />,
      title: '100% Local & Offline',
      description: 'Zero network requests. No external APIs, CDNs, or remote scripts are ever executed.',
    },
    {
      icon: <DatabaseZap size={16} color="var(--color-success)" />,
      title: 'No Cloud Storage',
      description: 'All persistent account secrets are stored solely inside your browser’s local storage.',
    },
    {
      icon: <EyeOff size={16} color="var(--color-accent)" />,
      title: 'No Telemetry or Tracking',
      description: 'No analytics, no crash reporters, no tracking pixels, and zero user profiling.',
    },
    {
      icon: <Lock size={16} color="var(--color-quick-totp)" />,
      title: 'Ephemeral Quick TOTP',
      description: 'Quick TOTP temporary secrets stay strictly in runtime RAM and are discarded immediately on close.',
    },
    {
      icon: <ShieldCheck size={16} color="var(--color-success)" />,
      title: 'Local QR Decoding',
      description: 'Uploaded and captured QR codes are processed locally on an in-memory HTML5 Canvas.',
    },
  ];

  return (
    <div style={{ display: 'flex', flexDirection: 'column', gap: '14px' }}>
      <div
        style={{
          padding: '12px 14px',
          backgroundColor: 'var(--color-primary-subtle)',
          borderRadius: 'var(--radius-lg)',
          border: '1px solid rgba(45, 104, 235, 0.25)',
        }}
      >
        <h4 style={{ fontSize: '13px', fontWeight: 600, color: 'var(--color-primary-hover)' }}>
          “Your secrets stay on your device.”
        </h4>
        <p style={{ fontSize: '11px', color: 'var(--color-text-secondary)', marginTop: '4px', lineHeight: 1.4 }}>
          Secure 2FA Authenticator is engineered from the ground up to guarantee strict offline operation and complete personal privacy.
        </p>
      </div>

      <div style={{ display: 'flex', flexDirection: 'column', gap: '8px' }}>
        {points.map((pt, index) => (
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

      {/* About Box */}
      <div
        style={{
          padding: '12px',
          backgroundColor: 'var(--color-bg-input)',
          borderRadius: 'var(--radius-md)',
          border: '1px solid var(--color-border-subtle)',
          display: 'flex',
          flexDirection: 'column',
          gap: '4px',
        }}
      >
        <p style={{ fontSize: '12px', fontWeight: 600, color: 'var(--color-text-primary)' }}>
          Secure 2FA Authenticator v1.0.0
        </p>
        <p style={{ fontSize: '11px', color: 'var(--color-text-muted)' }}>
          Open-source, privacy-first RFC 6238 TOTP browser extension.
        </p>
      </div>
    </div>
  );
};
