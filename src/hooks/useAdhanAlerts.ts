import { useEffect, useRef } from 'react';
import type { AppSettings, PrayerTime } from '../types';
import { playPrayerChime, playReminderPing } from '../utils/sound';
import { showPrayerNotification } from '../utils/notifications';

/**
 * `current` (o an geçerli olan vakit) değiştiğinde, eğer bu bir ezan vaktiyse
 * ses ve bildirim tetikler. Uygulama ilk açıldığında (henüz "current" bilinmiyorken)
 * yanlışlıkla tetiklenmemesi için ilk değer sessizce kaydedilir.
 */
export function useAdhanAlerts(
  current: PrayerTime | null,
  next: PrayerTime | null,
  msRemaining: number | null,
  settings: AppSettings,
) {
  const lastCurrentKeyRef = useRef<string | null | undefined>(undefined);
  const remindedKeyRef = useRef<string | null>(null);

  useEffect(() => {
    const key = current ? `${current.key}-${current.date.toDateString()}` : null;

    if (lastCurrentKeyRef.current === undefined) {
      lastCurrentKeyRef.current = key;
      return;
    }

    if (key !== lastCurrentKeyRef.current) {
      lastCurrentKeyRef.current = key;
      if (current?.isAdhan) {
        if (settings.soundEnabled) playPrayerChime();
        if (settings.notificationsEnabled) {
          showPrayerNotification(
            `${current.label} vakti girdi 🕌`,
            'Vaktin hayırlı olsun.',
          );
        }
      }
    }
  }, [current, settings.soundEnabled, settings.notificationsEnabled]);

  useEffect(() => {
    if (!settings.reminderMinutesBefore || !next?.isAdhan || msRemaining === null) return;
    const key = `${next.key}-${next.date.toDateString()}`;
    const thresholdMs = settings.reminderMinutesBefore * 60 * 1000;
    if (msRemaining <= thresholdMs && remindedKeyRef.current !== key) {
      remindedKeyRef.current = key;
      if (settings.soundEnabled) playReminderPing();
      if (settings.notificationsEnabled) {
        showPrayerNotification(
          `${next.label} vaktine ${settings.reminderMinutesBefore} dakika kaldı`,
          'Hazırlığınızı yapabilirsiniz.',
        );
      }
    }
  }, [next, msRemaining, settings.reminderMinutesBefore, settings.soundEnabled, settings.notificationsEnabled]);
}
