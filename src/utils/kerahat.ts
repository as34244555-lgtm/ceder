import type { DayPrayerTimes, PrayerKey } from '../types';

export interface KerahatWindow {
  id: 'sunrise' | 'istiva' | 'sunset';
  label: string;
  start: Date;
  end: Date;
}

const MIN = 60 * 1000;

function findTime(day: DayPrayerTimes, key: PrayerKey): Date | null {
  return day.times.find((t) => t.key === key)?.date ?? null;
}

/**
 * Hanefi fıkhına göre namaz kılınması mekruh görülen üç zaman dilimini
 * yaklaşık olarak hesaplar: güneş doğarken, tam tepedeyken (istiva) ve
 * batarken. Bu sınırlar astronomik olarak kesin değil, yaygın kabul gören
 * yaklaşık dakika aralıklarıyla hesaplanır; ibadetle ilgili kesin sınırlar
 * için yerel din görevlisine danışılması önerilir.
 */
export function getKerahatWindows(day: DayPrayerTimes | null): KerahatWindow[] {
  if (!day) return [];
  const sunrise = findTime(day, 'gunes');
  const dhuhr = findTime(day, 'ogle');
  const maghrib = findTime(day, 'aksam');

  const windows: KerahatWindow[] = [];

  if (sunrise) {
    windows.push({
      id: 'sunrise',
      label: 'Güneş doğarken',
      start: sunrise,
      end: new Date(sunrise.getTime() + 45 * MIN),
    });
  }

  if (dhuhr) {
    windows.push({
      id: 'istiva',
      label: 'Tam tepedeyken (istiva)',
      start: new Date(dhuhr.getTime() - 40 * MIN),
      end: dhuhr,
    });
  }

  if (maghrib) {
    windows.push({
      id: 'sunset',
      label: 'Güneş batarken',
      start: new Date(maghrib.getTime() - 45 * MIN),
      end: maghrib,
    });
  }

  return windows;
}

export function getActiveKerahatWindow(
  windows: KerahatWindow[],
  now: Date,
): KerahatWindow | null {
  return windows.find((w) => now.getTime() >= w.start.getTime() && now.getTime() < w.end.getTime()) ?? null;
}
