import { useCallback, useEffect, useState } from 'react';
import { DHIKR_OPTIONS } from '../data/dhikr';

const STORAGE_KEY = 'ezan-app:tasbih';

interface TasbihState {
  selectedId: string;
  counts: Record<string, number>;
  dateISO: string;
}

function todayISO(): string {
  const d = new Date();
  return `${d.getFullYear()}-${String(d.getMonth() + 1).padStart(2, '0')}-${String(
    d.getDate(),
  ).padStart(2, '0')}`;
}

function loadState(): TasbihState {
  try {
    const raw = localStorage.getItem(STORAGE_KEY);
    if (raw) {
      const parsed = JSON.parse(raw) as TasbihState;
      if (parsed.dateISO === todayISO()) return parsed;
    }
  } catch {
    // yoksay
  }
  return { selectedId: DHIKR_OPTIONS[0].id, counts: {}, dateISO: todayISO() };
}

export function useTasbih() {
  const [state, setState] = useState<TasbihState>(loadState);

  useEffect(() => {
    try {
      localStorage.setItem(STORAGE_KEY, JSON.stringify(state));
    } catch {
      // yoksay
    }
  }, [state]);

  const selected = DHIKR_OPTIONS.find((d) => d.id === state.selectedId) ?? DHIKR_OPTIONS[0];
  const count = state.counts[state.selectedId] ?? 0;

  const selectDhikr = useCallback((id: string) => {
    setState((s) => ({ ...s, selectedId: id }));
  }, []);

  const increment = useCallback(() => {
    setState((s) => ({
      ...s,
      counts: { ...s.counts, [s.selectedId]: (s.counts[s.selectedId] ?? 0) + 1 },
    }));
  }, []);

  const reset = useCallback(() => {
    setState((s) => ({ ...s, counts: { ...s.counts, [s.selectedId]: 0 } }));
  }, []);

  return { selected, count, selectDhikr, increment, reset };
}
