import { DEFAULT_METHOD_ID } from '../data/methods';
import type { AppSettings, FavoriteCity } from '../types';

const SETTINGS_KEY = 'ezan-app:settings';
const CITY_KEY = 'ezan-app:selected-city';

export const DEFAULT_SETTINGS: AppSettings = {
  soundEnabled: true,
  notificationsEnabled: false,
  reminderMinutesList: [],
  calculationMethod: DEFAULT_METHOD_ID,
  theme: 'dark',
  timeFormat: '24',
  adhanSoundMode: 'adhan',
  adhanSoundId: 'ses1',
};

export function loadSettings(): AppSettings {
  try {
    const raw = localStorage.getItem(SETTINGS_KEY);
    if (!raw) return DEFAULT_SETTINGS;
    const parsed = JSON.parse(raw) as Partial<AppSettings>;
    const merged = { ...DEFAULT_SETTINGS, ...parsed };
    // Eski tekil hatırlatma alanından yeni çoklu listeye geçiş.
    if (parsed.reminderMinutesBefore && merged.reminderMinutesList.length === 0) {
      merged.reminderMinutesList = [parsed.reminderMinutesBefore];
    }
    return merged;
  } catch {
    return DEFAULT_SETTINGS;
  }
}

export function saveSettings(settings: AppSettings) {
  try {
    localStorage.setItem(SETTINGS_KEY, JSON.stringify(settings));
  } catch {
    // localStorage kullanılamıyor olabilir (gizli sekme vb.)
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

/** Genel amaçlı, tarihe göre anahtarlanan JSON verisi okuma/yazma (namaz takibi, oruç takvimi vb. için). */
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
