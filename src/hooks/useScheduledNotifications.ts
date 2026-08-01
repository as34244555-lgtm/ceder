import { useEffect } from 'react';
import type { AppSettings, DayPrayerTimes, TrackablePrayerKey } from '../types';
import { schedulePrayerAlerts, type SchedulableAlert } from '../utils/notifications';
import { Capacitor } from '@capacitor/core';
import { Preferences } from '@capacitor/preferences';

function prayerEnabled(key: string, settings: AppSettings): boolean {
  return settings.enabledPrayers?.[key as TrackablePrayerKey] !== false;
}

/**
 * Native: gelecek ezan + hatırlatmaları Local Notifications ile zamanlar.
 * Ayrıca widget için sonraki vakti Preferences'a yazar.
 */
export function useScheduledNotifications(
  today: DayPrayerTimes | null,
  tomorrow: DayPrayerTimes | null,
  settings: AppSettings,
  locationLabel: string,
) {
  useEffect(() => {
    if (!settings.notificationsEnabled || !today) return;

    const days = [today, tomorrow].filter(Boolean) as DayPrayerTimes[];
    const alerts: SchedulableAlert[] = [];
    let id = 1000;
    const now = Date.now();

    for (const day of days) {
      for (const t of day.times) {
        if (!t.isAdhan || !prayerEnabled(t.key, settings)) continue;
        const at = t.date.getTime();
        if (at > now) {
          alerts.push({
            id: id++,
            title: `${t.label} vakti 🕌`,
            body: `${locationLabel} — Vaktin hayırlı olsun.`,
            at: t.date,
          });
        }
        for (const minutes of settings.reminderMinutesList ?? []) {
          const reminderAt = new Date(at - minutes * 60_000);
          if (reminderAt.getTime() > now) {
            alerts.push({
              id: id++,
              title: `${t.label} vaktine ${minutes} dk`,
              body: 'Hazırlığınızı yapabilirsiniz.',
              at: reminderAt,
            });
          }
        }
      }
    }

    void schedulePrayerAlerts(alerts);

    // Widget verisi
    if (Capacitor.isNativePlatform()) {
      const upcoming = today.times
        .filter((t) => t.isAdhan && t.date.getTime() > now)
        .concat(tomorrow?.times.filter((t) => t.isAdhan) ?? [])
        .slice(0, 3)
        .map((t) => ({
          label: t.label,
          time: t.date.toLocaleTimeString('tr-TR', { hour: '2-digit', minute: '2-digit' }),
        }));
      void Preferences.set({
        key: 'widget_prayer_times',
        value: JSON.stringify({
          location: locationLabel,
          updatedAt: Date.now(),
          times: upcoming,
        }),
      }).catch(() => undefined);
    }
  }, [today, tomorrow, settings, locationLabel]);
}
