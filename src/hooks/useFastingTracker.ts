import { useCallback, useState } from 'react';
import { loadJSON, saveJSON } from '../utils/storage';

const STORAGE_KEY = 'ezan-app:fasting-tracker';

export type FastingStatus = 'tuttum' | 'tutamadim';

type FastingData = Record<string, FastingStatus>;

export function useFastingTracker() {
  const [data, setData] = useState<FastingData>(() => loadJSON(STORAGE_KEY, {}));

  const getStatus = useCallback((dateISO: string): FastingStatus | undefined => data[dateISO], [data]);

  const setStatus = useCallback((dateISO: string, status: FastingStatus | undefined) => {
    setData((prev) => {
      const next = { ...prev };
      if (status) next[dateISO] = status;
      else delete next[dateISO];
      saveJSON(STORAGE_KEY, next);
      return next;
    });
  }, []);

  const cycleStatus = useCallback((dateISO: string) => {
    setData((prev) => {
      const current = prev[dateISO];
      const nextStatus: FastingStatus | undefined =
        current === undefined ? 'tuttum' : current === 'tuttum' ? 'tutamadim' : undefined;
      const next = { ...prev };
      if (nextStatus) next[dateISO] = nextStatus;
      else delete next[dateISO];
      saveJSON(STORAGE_KEY, next);
      return next;
    });
  }, []);

  return { getStatus, setStatus, cycleStatus };
}
