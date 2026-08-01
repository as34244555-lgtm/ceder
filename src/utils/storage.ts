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
  reminderMinutesList: [15],
  calculationMethod: DEFAULT_METHOD_ID,
  theme: 'dark',
  timeFormat: '24',
};

const VALID_SOUND_IDS = new Set(['makkah', 'madinah', 'sabah', 'aaqib']);

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

    // Eski (kaldırılmış) ses kimliklerini temizle / geçir
    const legacyId = parsed.adhanSoundId as string | undefined;
    if (legacyId === 'ses1' || legacyId === 'ses2' || !VALID_SOUND_IDS.has(String(merged.adhanSoundId))) {
      merged.adhanSoundId = 'makkah';
    }
    if (merged.fajrAdhanSoundId && !VALID_SOUND_IDS.has(merged.fajrAdhanSoundId)) {
      merged.fajrAdhanSoundId = 'madinah';
    }
    if (merged.adhanSoundMode !== 'adhan' && merged.adhanSoundMode !== 'chime') {
      merged.adhanSoundMode = 'adhan';
    }

    return {
      soundEnabled: merged.soundEnabled,
      adhanSoundMode: merged.adhanSoundMode,
      adhanSoundId: merged.adhanSoundId,
      fajrAdhanSoundId: merged.fajrAdhanSoundId,
      enabledPrayers: merged.enabledPrayers,
      notificationsEnabled: merged.notificationsEnabled,
      reminderMinutesBefore: merged.reminderMinutesBefore,
      reminderMinutesList: merged.reminderMinutesList,
      calculationMethod: merged.calculationMethod,
      theme: merged.theme,
      timeFormat: merged.timeFormat,
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
