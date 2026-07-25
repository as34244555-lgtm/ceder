import type { AppSettings } from '../types';

const SETTINGS_KEY = 'ezan-app:settings';
const CITY_KEY = 'ezan-app:selected-city';

export const DEFAULT_SETTINGS: AppSettings = {
  soundEnabled: true,
  notificationsEnabled: false,
  reminderMinutesBefore: null,
};

export function loadSettings(): AppSettings {
  try {
    const raw = localStorage.getItem(SETTINGS_KEY);
    if (!raw) return DEFAULT_SETTINGS;
    return { ...DEFAULT_SETTINGS, ...(JSON.parse(raw) as Partial<AppSettings>) };
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
