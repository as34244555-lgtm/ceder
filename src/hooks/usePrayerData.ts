import { useCallback, useEffect, useRef, useState } from 'react';
import {
  fetchPrayerTimesByCity,
  fetchPrayerTimesByCoords,
  fetchTodayAndTomorrow,
} from '../api/prayerTimes';
import type { DayPrayerTimes, LocationInfo } from '../types';

interface State {
  today: DayPrayerTimes | null;
  tomorrow: DayPrayerTimes | null;
  loading: boolean;
  error: string | null;
}

export function usePrayerData(location: LocationInfo | null) {
  const [state, setState] = useState<State>({
    today: null,
    tomorrow: null,
    loading: false,
    error: null,
  });
  const lastFetchedDateRef = useRef<string | null>(null);
  const lastLocationKeyRef = useRef<string | null>(null);

  const load = useCallback(async (loc: LocationInfo) => {
    setState((s) => ({ ...s, loading: true, error: null }));
    try {
      const fetcher =
        loc.source === 'gps' && loc.latitude !== undefined && loc.longitude !== undefined
          ? (date: Date) => fetchPrayerTimesByCoords(loc.latitude!, loc.longitude!, date)
          : (date: Date) => fetchPrayerTimesByCity(loc.city, date);

      const { today, tomorrow } = await fetchTodayAndTomorrow(fetcher);
      lastFetchedDateRef.current = today.dateISO;
      setState({ today, tomorrow, loading: false, error: null });
    } catch {
      setState((s) => ({
        ...s,
        loading: false,
        error: 'Namaz vakitleri alınırken bir sorun oluştu. İnternet bağlantınızı kontrol edip tekrar deneyin.',
      }));
    }
  }, []);

  useEffect(() => {
    if (!location) return;
    const key =
      location.source === 'gps'
        ? `gps:${location.latitude?.toFixed(2)}:${location.longitude?.toFixed(2)}`
        : `city:${location.city}`;
    if (lastLocationKeyRef.current === key) return;
    lastLocationKeyRef.current = key;
    void load(location);
  }, [location, load]);

  // Gece yarısını geçince veriyi otomatik tazele.
  useEffect(() => {
    const id = setInterval(() => {
      const todayISO = new Date();
      const iso = `${todayISO.getFullYear()}-${String(todayISO.getMonth() + 1).padStart(2, '0')}-${String(
        todayISO.getDate(),
      ).padStart(2, '0')}`;
      if (location && lastFetchedDateRef.current && lastFetchedDateRef.current !== iso) {
        void load(location);
      }
    }, 60 * 1000);
    return () => clearInterval(id);
  }, [location, load]);

  const refetch = useCallback(() => {
    if (location) void load(location);
  }, [location, load]);

  return { ...state, refetch };
}
