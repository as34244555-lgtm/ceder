import { useCallback, useEffect, useState } from 'react';
import { fetchMonthlyCalendarByCity, fetchMonthlyCalendarByCoords } from '../api/prayerTimes';
import type { DayPrayerTimes, LocationInfo } from '../types';

export function useMonthlyCalendar(location: LocationInfo | null, method: number) {
  const now = new Date();
  const [year, setYear] = useState(now.getFullYear());
  const [month, setMonth] = useState(now.getMonth() + 1);
  const [days, setDays] = useState<DayPrayerTimes[]>([]);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);

  const load = useCallback(
    async (loc: LocationInfo, y: number, m: number, calcMethod: number) => {
      setLoading(true);
      setError(null);
      try {
        const data =
          loc.source === 'gps' && loc.latitude !== undefined && loc.longitude !== undefined
            ? await fetchMonthlyCalendarByCoords(loc.latitude, loc.longitude, calcMethod, y, m)
            : await fetchMonthlyCalendarByCity(loc.city, loc.country, calcMethod, y, m);
        setDays(data);
      } catch {
        setError('Takvim yüklenirken bir sorun oluştu.');
      } finally {
        setLoading(false);
      }
    },
    [],
  );

  useEffect(() => {
    if (!location) return;
    void load(location, year, month, method);
  }, [location, year, month, method, load]);

  const goToPreviousMonth = useCallback(() => {
    setMonth((m) => {
      if (m === 1) {
        setYear((y) => y - 1);
        return 12;
      }
      return m - 1;
    });
  }, []);

  const goToNextMonth = useCallback(() => {
    setMonth((m) => {
      if (m === 12) {
        setYear((y) => y + 1);
        return 1;
      }
      return m + 1;
    });
  }, []);

  return { year, month, days, loading, error, goToPreviousMonth, goToNextMonth };
}
