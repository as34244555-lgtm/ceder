import { useEffect, useRef } from 'react';
import type { AppSettings, PrayerTime, TrackablePrayerKey } from '../types';
import { playFullAdhan, playPrayerChime, playReminderPing } from '../utils/sound';
import { showPrayerNotification } from '../utils/notifications';
import {
  prayerEnteredSpeech,
  prayerReminderSpeech,
  speakPrayerMessage,
} from '../utils/speech';

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

function isTrackable(key: string): key is TrackablePrayerKey {
  return key === 'imsak' || key === 'ogle' || key === 'ikindi' || key === 'aksam' || key === 'yatsi';
}

/**
 * Vakit değişince ezan + sesli duyuru + bildirim; hatırlatmalarda ping.
 * onPrayerEntered: “kıldınız mı?” diyaloğu için.
 */
export function useAdhanAlerts(
  current: PrayerTime | null,
  next: PrayerTime | null,
  msRemaining: number | null,
  settings: AppSettings,
  onPrayerEntered?: (prayer: PrayerTime & { key: TrackablePrayerKey }) => void,
) {
  const lastCurrentKeyRef = useRef<string | null | undefined>(undefined);
  const remindedKeysRef = useRef<Set<string>>(new Set());
  const onEnteredRef = useRef(onPrayerEntered);
  onEnteredRef.current = onPrayerEntered;

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
        // Ezan / nağmeden kısa süre sonra sesli vakit mesajı
        window.setTimeout(() => {
          speakPrayerMessage(prayerEnteredSpeech(current.label));
        }, settings.adhanSoundMode === 'adhan' ? 2500 : 800);
      }

      if (settings.notificationsEnabled) {
        showPrayerNotification(
          `${current.label} vakti girdi 🕌`,
          'Vaktin hayırlı olsun. Namazınızı kıldınız mı?',
        );
      }

      if (isTrackable(current.key)) {
        onEnteredRef.current?.({ ...current, key: current.key });
      }
    }
  }, [current, settings]);

  useEffect(() => {
    const list = settings.reminderMinutesList ?? [];
    if (list.length === 0 || !next?.isAdhan || msRemaining === null) return;
    if (!isEnabledPrayer(next, settings)) return;

    for (const minutes of list) {
      const thresholdMs = minutes * 60 * 1000;
      const remindKey = `${next.key}-${next.date.toDateString()}-${minutes}`;
      if (msRemaining <= thresholdMs && !remindedKeysRef.current.has(remindKey)) {
        remindedKeysRef.current.add(remindKey);
        if (settings.soundEnabled) {
          playReminderPing();
          speakPrayerMessage(prayerReminderSpeech(next.label, minutes));
        }
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
