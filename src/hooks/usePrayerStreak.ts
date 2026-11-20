import { useMemo } from 'react';
import { todayISO, TRACKABLE_PRAYERS, usePrayerTracker } from './usePrayerTracker';

export interface StreakInfo {
  current: number;
  best: number;
  badges: { id: string; label: string; earned: boolean }[];
}

/** Ardışık tam gün (5/5 vakit) serisi. */
export function usePrayerStreak(): StreakInfo {
  const { isChecked } = usePrayerTracker();

  return useMemo(() => {
    let current = 0;
    for (let i = 0; i < 365; i++) {
      const iso = todayISO(-i);
      const complete = TRACKABLE_PRAYERS.every(({ key }) => isChecked(iso, key));
      if (!complete) {
        // Bugün henüz bitmediyse seriyi kırma (i===0 ve kısmi OK say)
        if (i === 0) continue;
        break;
      }
      current += 1;
    }

    let best = current;
    let run = 0;
    for (let i = 0; i < 365; i++) {
      const iso = todayISO(-i);
      const complete = TRACKABLE_PRAYERS.every(({ key }) => isChecked(iso, key));
      if (complete) {
        run += 1;
        best = Math.max(best, run);
      } else if (i !== 0) {
        run = 0;
      }
    }

    const badges = [
      { id: '3', label: '3 gün seri', earned: best >= 3 },
      { id: '7', label: '7 gün seri', earned: best >= 7 },
      { id: '30', label: '30 gün seri', earned: best >= 30 },
      { id: '100', label: '100 gün seri', earned: best >= 100 },
    ];

    return { current, best, badges };
  }, [isChecked]);
}
