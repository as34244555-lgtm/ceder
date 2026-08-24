import type { PrayerTime } from '../types';

/** Ezan sonrası kamet geri sayımı (ms). Iqamah = adhan + N dakika. */
export function getIqamahCountdown(
  current: PrayerTime | null,
  now: Date,
  iqamahMinutes: number,
): { label: string; msRemaining: number } | null {
  if (!current?.isAdhan || iqamahMinutes <= 0) return null;
  const iqamahAt = current.date.getTime() + iqamahMinutes * 60_000;
  const ms = iqamahAt - now.getTime();
  if (ms <= 0 || ms > iqamahMinutes * 60_000) return null;
  return { label: current.label, msRemaining: ms };
}

export function formatCountdown(ms: number): string {
  const totalSec = Math.max(0, Math.floor(ms / 1000));
  const m = Math.floor(totalSec / 60);
  const s = totalSec % 60;
  return `${String(m).padStart(2, '0')}:${String(s).padStart(2, '0')}`;
}
