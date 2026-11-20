import { useEffect, useState } from 'react';
import {
  fetchHijriMonthCalendarByCity,
  fetchHijriMonthCalendarByCoords,
} from '../api/prayerTimes';
import type { DayPrayerTimes, LocationInfo } from '../types';

const RAMADAN_MONTH = 9;

export function useRamadanCalendar(
  location: LocationInfo | null,
  method: number,
  hijriYear: number | null,
) {
  const [days, setDays] = useState<DayPrayerTimes[]>([]);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    if (!location || !hijriYear) return;
    setLoading(true);
    setError(null);
    const promise =
      location.source === 'gps' && location.latitude !== undefined && location.longitude !== undefined
        ? fetchHijriMonthCalendarByCoords(location.latitude, location.longitude, method, hijriYear, RAMADAN_MONTH)
        : fetchHijriMonthCalendarByCity(location.city, location.country, method, hijriYear, RAMADAN_MONTH);

    promise
      .then((data) => setDays(data))
      .catch(() => setError('Ramazan takvimi yüklenirken bir sorun oluştu.'))
      .finally(() => setLoading(false));
  }, [location, method, hijriYear]);

  return { days, loading, error };
}
