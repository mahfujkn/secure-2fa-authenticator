import React from 'react';

export interface ProgressRingProps {
  secondsRemaining: number;
  totalPeriod: number;
  progressPercent: number;
  type?: 'bar' | 'ring';
  size?: number; // for circular ring in px
}

export const ProgressRing: React.FC<ProgressRingProps> = ({
  secondsRemaining,
  progressPercent,
  type = 'bar',
  size = 28,
}) => {
  // Color threshold: danger if <= 5 seconds, warning if <= 10, otherwise primary
  const getColor = () => {
    if (secondsRemaining <= 5) return 'var(--color-danger)';
    if (secondsRemaining <= 10) return 'var(--color-warning)';
    return 'var(--color-primary)';
  };

  if (type === 'ring') {
    const strokeWidth = 3;
    const radius = (size - strokeWidth) / 2;
    const circumference = 2 * Math.PI * radius;
    const strokeDashoffset = circumference - (progressPercent / 100) * circumference;

    return (
      <div style={{ position: 'relative', width: size, height: size, display: 'inline-flex', alignItems: 'center', justifyContent: 'center' }}>
        <svg width={size} height={size} style={{ transform: 'rotate(-90deg)' }}>
          {/* Background circle */}
          <circle
            cx={size / 2}
            cy={size / 2}
            r={radius}
            stroke="var(--color-border-subtle)"
            strokeWidth={strokeWidth}
            fill="transparent"
          />
          {/* Foreground progress circle */}
          <circle
            cx={size / 2}
            cy={size / 2}
            r={radius}
            stroke={getColor()}
            strokeWidth={strokeWidth}
            fill="transparent"
            strokeDasharray={circumference}
            strokeDashoffset={strokeDashoffset}
            strokeLinecap="round"
            style={{ transition: 'stroke-dashoffset 0.8s linear, stroke 0.3s ease' }}
          />
        </svg>
        <span
          style={{
            position: 'absolute',
            fontSize: size <= 28 ? '10px' : '11px',
            fontFamily: 'var(--font-mono)',
            fontWeight: 700,
            color: getColor(),
          }}
        >
          {secondsRemaining}
        </span>
      </div>
    );
  }

  // Linear bar
  return (
    <div style={{ display: 'flex', flexDirection: 'column', gap: '3px', width: '100%' }}>
      <div style={{ display: 'flex', justifyContent: 'flex-end', alignItems: 'center' }}>
        <span
          style={{
            fontSize: '11px',
            fontFamily: 'var(--font-mono)',
            fontWeight: 600,
            color: getColor(),
            transition: 'color 0.3s ease',
          }}
        >
          {secondsRemaining}s
        </span>
      </div>
      <div
        style={{
          width: '100%',
          height: '4px',
          backgroundColor: 'var(--color-bg-surface-raised)',
          borderRadius: 'var(--radius-pill)',
          overflow: 'hidden',
        }}
      >
        <div
          style={{
            height: '100%',
            width: `${progressPercent}%`,
            backgroundColor: getColor(),
            borderRadius: 'var(--radius-pill)',
            transition: 'width 0.8s linear, background-color 0.3s ease',
          }}
        />
      </div>
    </div>
  );
};
