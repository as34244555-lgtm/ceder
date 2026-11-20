import { useMemo } from 'react';
import type { DayPrayerTimes, PrayerTime } from '../types';

export interface NextPrayerInfo {
  combinedTimes: PrayerTime[];
  current: PrayerTime | null;
  next: PrayerTime | null;
  msRemaining: number | null;
}

export function useNextPrayer(
  today: DayPrayerTimes | null,
  tomorrow: DayPrayerTimes | null,
  now: Date,
): NextPrayerInfo {
  return useMemo(() => {
    if (!today) {
      return { combinedTimes: [], current: null, next: null, msRemaining: null };
    }

    const combinedTimes = [...today.times, ...(tomorrow?.times ?? [])];

    let current: PrayerTime | null = null;
    let next: PrayerTime | null = null;

    for (const time of combinedTimes) {
      if (time.date.getTime() <= now.getTime()) {
        current = time;
      } else if (!next) {
        next = time;
        break;
      }
    }

    const msRemaining = next ? next.date.getTime() - now.getTime() : null;

    return { combinedTimes, current, next, msRemaining };
  }, [today, tomorrow, now]);
}

export function formatCountdown(ms: number): string {
  const totalSeconds = Math.max(0, Math.floor(ms / 1000));
  const hours = Math.floor(totalSeconds / 3600);
  const minutes = Math.floor((totalSeconds % 3600) / 60);
  const seconds = totalSeconds % 60;
  const pad = (n: number) => String(n).padStart(2, '0');
  return `${pad(hours)}:${pad(minutes)}:${pad(seconds)}`;
}
