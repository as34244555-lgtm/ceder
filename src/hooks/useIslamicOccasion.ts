import { useEffect, useRef, useState } from 'react';
import { findOccasion, type IslamicOccasion } from '../data/islamicOccasions';
import { showPrayerNotification } from '../utils/notifications';
import type { HijriDate } from '../types';

const NOTIFIED_KEY = 'ezan-app:occasion-notified-date';

export function useIslamicOccasion(hijri: HijriDate | undefined, notificationsEnabled: boolean) {
  const [occasion, setOccasion] = useState<IslamicOccasion | null>(null);
  const notifiedRef = useRef<string | null>(null);

  useEffect(() => {
    if (!hijri) {
      setOccasion(null);
      return;
    }
    const found = findOccasion(hijri.month, hijri.day);
    setOccasion(found);

    if (!found || !notificationsEnabled) return;
    const todayKey = `${hijri.year}-${hijri.month}-${hijri.day}`;

    try {
      const lastNotified = localStorage.getItem(NOTIFIED_KEY);
      if (lastNotified === todayKey || notifiedRef.current === todayKey) return;
      notifiedRef.current = todayKey;
      localStorage.setItem(NOTIFIED_KEY, todayKey);
      showPrayerNotification(
        `${found.emoji} ${found.name}`,
        found.description || `Mübarek olsun.`,
      );
    } catch {
      // localStorage kullanılamıyor olabilir; bildirim atlanır.
    }
  }, [hijri, notificationsEnabled]);

  return occasion;
}
