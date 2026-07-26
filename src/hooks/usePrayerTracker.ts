import { useCallback, useMemo, useState } from 'react';
import { loadJSON, saveJSON } from '../utils/storage';
import type { TrackablePrayerKey } from '../types';

const STORAGE_KEY = 'ezan-app:prayer-tracker';
export const TRACKABLE_PRAYERS: { key: TrackablePrayerKey; label: string }[] = [
  { key: 'imsak', label: 'Sabah' },
  { key: 'ogle', label: 'Öğle' },
  { key: 'ikindi', label: 'İkindi' },
  { key: 'aksam', label: 'Akşam' },
  { key: 'yatsi', label: 'Yatsı' },
];

type TrackerData = Record<string, Partial<Record<TrackablePrayerKey, boolean>>>;

export function todayISO(offsetDays = 0): string {
  const d = new Date();
  d.setDate(d.getDate() + offsetDays);
  return `${d.getFullYear()}-${String(d.getMonth() + 1).padStart(2, '0')}-${String(d.getDate()).padStart(2, '0')}`;
}

export function usePrayerTracker() {
  const [data, setData] = useState<TrackerData>(() => loadJSON(STORAGE_KEY, {}));

  const isChecked = useCallback(
    (dateISO: string, key: TrackablePrayerKey) => Boolean(data[dateISO]?.[key]),
    [data],
  );

  const toggle = useCallback((dateISO: string, key: TrackablePrayerKey) => {
    setData((prev) => {
      const day = { ...(prev[dateISO] ?? {}) };
      day[key] = !day[key];
      const next = { ...prev, [dateISO]: day };
      saveJSON(STORAGE_KEY, next);
      return next;
    });
  }, []);

  const weeklyStats = useMemo(() => {
    let completed = 0;
    let total = 0;
    for (let i = 0; i < 7; i++) {
      const iso = todayISO(-i);
      const day = data[iso];
      for (const { key } of TRACKABLE_PRAYERS) {
        total += 1;
        if (day?.[key]) completed += 1;
      }
    }
    return { completed, total };
  }, [data]);

  const todayStats = useMemo(() => {
    const iso = todayISO();
    const day = data[iso];
    const completed = TRACKABLE_PRAYERS.filter(({ key }) => day?.[key]).length;
    return { completed, total: TRACKABLE_PRAYERS.length };
  }, [data]);

  return { isChecked, toggle, weeklyStats, todayStats };
}
