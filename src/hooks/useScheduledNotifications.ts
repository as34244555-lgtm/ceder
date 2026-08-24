import { Capacitor } from '@capacitor/core';
import { Preferences } from '@capacitor/preferences';
import { PrayerNative } from '../plugins/prayerNative';
import type { AppSettings, DayPrayerTimes, TrackablePrayerKey } from '../types';
import { schedulePrayerAlerts, type SchedulableAlert } from '../utils/notifications';
import { useEffect } from 'react';

function prayerEnabled(key: string, settings: AppSettings): boolean {
  return settings.enabledPrayers?.[key as TrackablePrayerKey] !== false;
}

export function useScheduledNotifications(
  today: DayPrayerTimes | null,
  tomorrow: DayPrayerTimes | null,
  settings: AppSettings,
  locationLabel: string,
) {
  useEffect(() => {
    if (!today) return;

    const days = [today, tomorrow].filter(Boolean) as DayPrayerTimes[];
    const alerts: SchedulableAlert[] = [];
    let id = 1000;
    const now = Date.now();

    if (settings.notificationsEnabled) {
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
            // Iqamah bildirimi
            if (settings.iqamahMinutes > 0) {
              const iqamahAt = new Date(at + settings.iqamahMinutes * 60_000);
              if (iqamahAt.getTime() > now) {
                alerts.push({
                  id: id++,
                  title: `${t.label} kamet`,
                  body: `Kamet zamanı (~${settings.iqamahMinutes} dk sonra)`,
                  at: iqamahAt,
                });
              }
            }
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
    }

    const upcoming = today.times
      .filter((t) => t.isAdhan && t.date.getTime() > now)
      .concat(tomorrow?.times.filter((t) => t.isAdhan) ?? [])
      .slice(0, 4)
      .map((t) => ({
        label: t.label,
        time: t.date.toLocaleTimeString('tr-TR', { hour: '2-digit', minute: '2-digit' }),
        at: t.date.getTime(),
      }));

    const payload = JSON.stringify({
      location: locationLabel,
      updatedAt: Date.now(),
      times: upcoming,
    });

    if (Capacitor.isNativePlatform()) {
      void Preferences.set({ key: 'widget_prayer_times', value: payload }).catch(() => undefined);
      void Preferences.set({ key: 'wear_prayer_times', value: payload }).catch(() => undefined);

      if (settings.ongoingNotification && settings.notificationsEnabled) {
        void PrayerNative.startOngoing().catch(() => undefined);
      } else {
        void PrayerNative.stopOngoing().catch(() => undefined);
      }
    }
  }, [today, tomorrow, settings, locationLabel]);
}
