export type PrayerKey =
  | 'imsak'
  | 'gunes'
  | 'ogle'
  | 'ikindi'
  | 'aksam'
  | 'yatsi';

export type TrackablePrayerKey = 'imsak' | 'ogle' | 'ikindi' | 'aksam' | 'yatsi';

export interface PrayerTime {
  key: PrayerKey;
  label: string;
  date: Date;
  isAdhan: boolean;
}

export interface HijriDate {
  day: number;
  month: number;
  monthLabel: string;
  year: number;
}

export interface DayPrayerTimes {
  dateISO: string;
  hijriDate: string;
  hijri: HijriDate;
  gregorianDateLabel: string;
  times: PrayerTime[];
}

export interface LocationInfo {
  label: string;
  city: string;
  country: string;
  latitude?: number;
  longitude?: number;
  source: 'gps' | 'city';
}

export interface FavoriteCity {
  id: string;
  city: string;
  country: string;
  label: string;
}

export type ThemeMode = 'dark' | 'light' | 'system';
export type TimeFormat = '24' | '12';
export type AdhanSoundMode = 'adhan' | 'chime';
export type AdhanSoundId =
  | 'makkah'
  | 'madinah'
  | 'sabah'
  | 'aaqib'
  | 'aqsa'
  | 'klcc'
  | 'mishary';
export type AppLanguage = 'tr' | 'en' | 'ar';
export type PrayerAlertMap = Record<TrackablePrayerKey, boolean>;

export interface AppSettings {
  soundEnabled: boolean;
  adhanSoundMode: AdhanSoundMode;
  adhanSoundId: AdhanSoundId;
  fajrAdhanSoundId: AdhanSoundId | null;
  enabledPrayers: PrayerAlertMap;
  notificationsEnabled: boolean;
  /** Kalıcı durum çubuğu (Android Foreground Service) */
  ongoingNotification: boolean;
  reminderMinutesBefore?: number | null;
  reminderMinutesList: number[];
  /** Ezan sonrası kamet süresi (dk); 0 = kapalı */
  iqamahMinutes: number;
  calculationMethod: number;
  theme: ThemeMode;
  timeFormat: TimeFormat;
  language: AppLanguage;
  kidsMode: boolean;
}

export type PrimaryTabId = 'home' | 'tracker' | 'qibla' | 'calendar' | 'more';
export type SecondaryScreenId =
  | 'quran'
  | 'zikir'
  | 'esma'
  | 'guide'
  | 'ramadan'
  | 'zakat'
  | 'mosques'
  | 'halal'
  | 'hajj'
  | 'privacy'
  | 'settings';
export type TabId = PrimaryTabId | SecondaryScreenId;
