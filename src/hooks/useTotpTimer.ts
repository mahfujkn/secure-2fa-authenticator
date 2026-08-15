import { useState, useEffect } from 'react';

export interface TotpTimeState {
  timestampSeconds: number;
  period30SecondsRemaining: number;
  period30ProgressPercent: number;
  period60SecondsRemaining: number;
  period60ProgressPercent: number;
}

/**
 * High-precision shared timer hook for TOTP countdown synchronization.
 * Synchronizes with system clock seconds to ensure exact rollover at :00 and :30.
 */
export function useTotpTimer(): TotpTimeState {
  const [timeState, setTimeState] = useState<TotpTimeState>(() => {
    const nowSec = Math.floor(Date.now() / 1000);
    const rem30 = 30 - (nowSec % 30);
    const rem60 = 60 - (nowSec % 60);
    return {
      timestampSeconds: nowSec,
      period30SecondsRemaining: rem30,
      period30ProgressPercent: (rem30 / 30) * 100,
      period60SecondsRemaining: rem60,
      period60ProgressPercent: (rem60 / 60) * 100,
    };
  });

  useEffect(() => {
    let animationFrameId: number;
    let lastSec = Math.floor(Date.now() / 1000);

    const checkTick = () => {
      const currentSec = Math.floor(Date.now() / 1000);
      if (currentSec !== lastSec) {
        lastSec = currentSec;
        const rem30 = 30 - (currentSec % 30);
        const rem60 = 60 - (currentSec % 60);

        setTimeState({
          timestampSeconds: currentSec,
          period30SecondsRemaining: rem30,
          period30ProgressPercent: (rem30 / 30) * 100,
          period60SecondsRemaining: rem60,
          period60ProgressPercent: (rem60 / 60) * 100,
        });
      }
      animationFrameId = requestAnimationFrame(checkTick);
    };

    animationFrameId = requestAnimationFrame(checkTick);
    return () => cancelAnimationFrame(animationFrameId);
  }, []);

  return timeState;
}
