import { useMemo } from 'react';
import type { DayPrayerTimes } from '../types';

export interface RamadanCountdown {
  phase: 'sahur' | 'iftar';
  target: Date;
  msRemaining: number;
}

function findTime(day: DayPrayerTimes, key: string) {
  return day.times.find((t) => t.key === key)?.date ?? null;
}

export function useRamadanCountdown(
  today: DayPrayerTimes | null,
  tomorrow: DayPrayerTimes | null,
  now: Date,
): RamadanCountdown | null {
  return useMemo(() => {
    if (!today) return null;
    const imsak = findTime(today, 'imsak');
    const aksam = findTime(today, 'aksam');
    if (!imsak || !aksam) return null;

    if (now.getTime() < imsak.getTime()) {
      return { phase: 'sahur', target: imsak, msRemaining: imsak.getTime() - now.getTime() };
    }
    if (now.getTime() < aksam.getTime()) {
      return { phase: 'iftar', target: aksam, msRemaining: aksam.getTime() - now.getTime() };
    }
    const tomorrowImsak = tomorrow ? findTime(tomorrow, 'imsak') : null;
    if (tomorrowImsak) {
      return {
        phase: 'sahur',
        target: tomorrowImsak,
        msRemaining: tomorrowImsak.getTime() - now.getTime(),
      };
    }
    return null;
  }, [today, tomorrow, now]);
}
