import { useCallback, useMemo, useState } from 'react';
import { loadJSON, saveJSON } from '../utils/storage';
import { TRACKABLE_PRAYERS } from './usePrayerTracker';
import type { TrackablePrayerKey } from '../types';

const STORAGE_KEY = 'ezan-app:kaza-counts';

type KazaData = Partial<Record<TrackablePrayerKey, number>>;

export function useKazaCounter() {
  const [data, setData] = useState<KazaData>(() => loadJSON(STORAGE_KEY, {}));

  const getCount = useCallback((key: TrackablePrayerKey) => data[key] ?? 0, [data]);

  const increment = useCallback((key: TrackablePrayerKey) => {
    setData((prev) => {
      const next = { ...prev, [key]: (prev[key] ?? 0) + 1 };
      saveJSON(STORAGE_KEY, next);
      return next;
    });
  }, []);

  const decrement = useCallback((key: TrackablePrayerKey) => {
    setData((prev) => {
      const next = { ...prev, [key]: Math.max(0, (prev[key] ?? 0) - 1) };
      saveJSON(STORAGE_KEY, next);
      return next;
    });
  }, []);

  const total = useMemo(
    () => TRACKABLE_PRAYERS.reduce((sum, { key }) => sum + (data[key] ?? 0), 0),
    [data],
  );

  return { getCount, increment, decrement, total };
}
