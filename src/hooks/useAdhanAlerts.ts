import { useEffect, useRef } from 'react';
import type { AppSettings, PrayerTime, TrackablePrayerKey } from '../types';
import { playFullAdhan, playPrayerChime, playReminderPing } from '../utils/sound';
import { showPrayerNotification } from '../utils/notifications';

function isEnabledPrayer(prayer: PrayerTime, settings: AppSettings): boolean {
  if (!prayer.isAdhan) return false;
  const key = prayer.key as TrackablePrayerKey;
  return settings.enabledPrayers?.[key] !== false;
}

function resolveSoundId(prayer: PrayerTime, settings: AppSettings) {
  if (prayer.key === 'imsak' && settings.fajrAdhanSoundId) {
    return settings.fajrAdhanSoundId;
  }
  return settings.adhanSoundId;
}

/**
 * Vakit değişince ezan/nağme + bildirim; hatırlatma eşiklerinde ping.
 */
export function useAdhanAlerts(
  current: PrayerTime | null,
  next: PrayerTime | null,
  msRemaining: number | null,
  settings: AppSettings,
) {
  const lastCurrentKeyRef = useRef<string | null | undefined>(undefined);
  const remindedKeysRef = useRef<Set<string>>(new Set());

  useEffect(() => {
    if (!current) return;
    const key = `${current.key}-${current.date.toDateString()}`;

    if (lastCurrentKeyRef.current === undefined) {
      lastCurrentKeyRef.current = key;
      return;
    }

    if (key !== lastCurrentKeyRef.current) {
      lastCurrentKeyRef.current = key;
      if (!isEnabledPrayer(current, settings)) return;

      if (settings.soundEnabled) {
        if (settings.adhanSoundMode === 'adhan') {
          playFullAdhan(false, `${current.label} Ezanı`, resolveSoundId(current, settings));
        } else {
          playPrayerChime();
        }
      }
      if (settings.notificationsEnabled) {
        showPrayerNotification(`${current.label} vakti girdi 🕌`, 'Vaktin hayırlı olsun.');
      }
    }
  }, [current, settings]);

  useEffect(() => {
    const list = settings.reminderMinutesList ?? [];
    if (list.length === 0 || !next?.isAdhan || msRemaining === null) return;
    if (!isEnabledPrayer(next, settings)) return;

    for (const minutes of list) {
      const thresholdMs = minutes * 60 * 1000;
      const key = `${next.key}-${next.date.toDateString()}-${minutes}`;
      if (msRemaining <= thresholdMs && !remindedKeysRef.current.has(key)) {
        remindedKeysRef.current.add(key);
        if (settings.soundEnabled) playReminderPing();
        if (settings.notificationsEnabled) {
          showPrayerNotification(
            `${next.label} vaktine ${minutes} dakika kaldı`,
            'Hazırlığınızı yapabilirsiniz.',
          );
        }
      }
    }
  }, [next, msRemaining, settings]);
}
