import { DEFAULT_METHOD_ID } from '../data/methods';
import type { AppSettings, FavoriteCity, PrayerAlertMap } from '../types';

const SETTINGS_KEY = 'ezan-app:settings';
const CITY_KEY = 'ezan-app:selected-city';

export const DEFAULT_ENABLED_PRAYERS: PrayerAlertMap = {
  imsak: true,
  ogle: true,
  ikindi: true,
  aksam: true,
  yatsi: true,
};

export const DEFAULT_SETTINGS: AppSettings = {
  soundEnabled: true,
  adhanSoundMode: 'adhan',
  adhanSoundId: 'makkah',
  fajrAdhanSoundId: 'madinah',
  enabledPrayers: { ...DEFAULT_ENABLED_PRAYERS },
  notificationsEnabled: false,
  ongoingNotification: true,
  reminderMinutesList: [15],
  iqamahMinutes: 15,
  calculationMethod: DEFAULT_METHOD_ID,
  theme: 'dark',
  timeFormat: '24',
  language: 'tr',
  kidsMode: false,
};

const VALID_SOUND_IDS = new Set(['makkah', 'madinah', 'sabah', 'klcc']);

export function loadSettings(): AppSettings {
  try {
    const raw = localStorage.getItem(SETTINGS_KEY);
    if (!raw) return DEFAULT_SETTINGS;
    const parsed = JSON.parse(raw) as Partial<AppSettings> & Record<string, unknown>;
    const merged: AppSettings = {
      ...DEFAULT_SETTINGS,
      ...parsed,
      enabledPrayers: {
        ...DEFAULT_ENABLED_PRAYERS,
        ...(parsed.enabledPrayers ?? {}),
      },
    };

    if (parsed.reminderMinutesBefore && merged.reminderMinutesList.length === 0) {
      merged.reminderMinutesList = [parsed.reminderMinutesBefore as number];
    }

    const legacyId = parsed.adhanSoundId as string | undefined;
    if (
      legacyId === 'ses1' ||
      legacyId === 'ses2' ||
      !VALID_SOUND_IDS.has(String(merged.adhanSoundId))
    ) {
      merged.adhanSoundId = 'makkah';
    }
    if (merged.fajrAdhanSoundId && !VALID_SOUND_IDS.has(merged.fajrAdhanSoundId)) {
      merged.fajrAdhanSoundId = 'madinah';
    }
    if (merged.adhanSoundMode !== 'adhan' && merged.adhanSoundMode !== 'chime') {
      merged.adhanSoundMode = 'adhan';
    }
    if (!['tr', 'en', 'ar'].includes(merged.language)) merged.language = 'tr';
    if (typeof merged.iqamahMinutes !== 'number') merged.iqamahMinutes = 15;
    if (typeof merged.ongoingNotification !== 'boolean') merged.ongoingNotification = true;
    if (typeof merged.kidsMode !== 'boolean') merged.kidsMode = false;

    return {
      soundEnabled: merged.soundEnabled,
      adhanSoundMode: merged.adhanSoundMode,
      adhanSoundId: merged.adhanSoundId,
      fajrAdhanSoundId: merged.fajrAdhanSoundId,
      enabledPrayers: merged.enabledPrayers,
      notificationsEnabled: merged.notificationsEnabled,
      ongoingNotification: merged.ongoingNotification,
      reminderMinutesBefore: merged.reminderMinutesBefore,
      reminderMinutesList: merged.reminderMinutesList,
      iqamahMinutes: merged.iqamahMinutes,
      calculationMethod: merged.calculationMethod,
      theme: merged.theme,
      timeFormat: merged.timeFormat,
      language: merged.language,
      kidsMode: merged.kidsMode,
    };
  } catch {
    return DEFAULT_SETTINGS;
  }
}

export function saveSettings(settings: AppSettings) {
  try {
    localStorage.setItem(SETTINGS_KEY, JSON.stringify(settings));
  } catch {
    // yoksay
  }
}

export function loadSelectedCity(): string | null {
  try {
    return localStorage.getItem(CITY_KEY);
  } catch {
    return null;
  }
}

export function saveSelectedCity(city: string) {
  try {
    localStorage.setItem(CITY_KEY, city);
  } catch {
    // yoksay
  }
}

const COUNTRY_KEY = 'ezan-app:selected-country';

export function loadSelectedCountry(): string | null {
  try {
    return localStorage.getItem(COUNTRY_KEY);
  } catch {
    return null;
  }
}

export function saveSelectedCountry(country: string) {
  try {
    localStorage.setItem(COUNTRY_KEY, country);
  } catch {
    // yoksay
  }
}

const FAVORITES_KEY = 'ezan-app:favorite-cities';

export function loadFavoriteCities(): FavoriteCity[] {
  try {
    const raw = localStorage.getItem(FAVORITES_KEY);
    return raw ? (JSON.parse(raw) as FavoriteCity[]) : [];
  } catch {
    return [];
  }
}

export function saveFavoriteCities(favorites: FavoriteCity[]) {
  try {
    localStorage.setItem(FAVORITES_KEY, JSON.stringify(favorites));
  } catch {
    // yoksay
  }
}

export function loadJSON<T>(key: string, fallback: T): T {
  try {
    const raw = localStorage.getItem(key);
    return raw ? (JSON.parse(raw) as T) : fallback;
  } catch {
    return fallback;
  }
}

export function saveJSON<T>(key: string, value: T) {
  try {
    localStorage.setItem(key, JSON.stringify(value));
  } catch {
    // yoksay
  }
}

/** Tüm uygulama verisini JSON yedek olarak dışa aktarır. */
export function exportAllData(): string {
  const keys = Object.keys(localStorage).filter((k) => k.startsWith('ezan-app:'));
  const data: Record<string, unknown> = {};
  for (const k of keys) {
    try {
      data[k] = JSON.parse(localStorage.getItem(k) ?? 'null');
    } catch {
      data[k] = localStorage.getItem(k);
    }
  }
  return JSON.stringify({ version: 1, exportedAt: new Date().toISOString(), data }, null, 2);
}

export function importAllData(json: string): boolean {
  try {
    const parsed = JSON.parse(json) as { data?: Record<string, unknown> };
    if (!parsed.data) return false;
    for (const [k, v] of Object.entries(parsed.data)) {
      if (!k.startsWith('ezan-app:')) continue;
      localStorage.setItem(k, typeof v === 'string' ? v : JSON.stringify(v));
    }
    return true;
  } catch {
    return false;
  }
}
