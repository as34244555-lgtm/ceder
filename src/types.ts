export type PrayerKey =
  | 'imsak'
  | 'gunes'
  | 'ogle'
  | 'ikindi'
  | 'aksam'
  | 'yatsi';

/** Takip/kaza gibi özelliklerde kullanılan, güneş hariç 5 vakit. */
export type TrackablePrayerKey = 'imsak' | 'ogle' | 'ikindi' | 'aksam' | 'yatsi';

export interface PrayerTime {
  key: PrayerKey;
  label: string;
  date: Date;
  /** Whether this marks an actual ezan (call to prayer), as opposed to a transitional marker like sunrise. */
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
export type AdhanSoundId = 'makkah' | 'madinah' | 'sabah' | 'aaqib';

export type PrayerAlertMap = Record<TrackablePrayerKey, boolean>;

export interface AppSettings {
  soundEnabled: boolean;
  /** Gerçek ezan kaydı veya kısa nağme */
  adhanSoundMode: AdhanSoundMode;
  adhanSoundId: AdhanSoundId;
  /** Sabah (imsak) için ayrı ezan; null = genel sesle aynı */
  fajrAdhanSoundId: AdhanSoundId | null;
  /** Hangi vakitlerde ses/bildirim çalsın */
  enabledPrayers: PrayerAlertMap;
  notificationsEnabled: boolean;
  /** @deprecated bkz. reminderMinutesList */
  reminderMinutesBefore?: number | null;
  reminderMinutesList: number[];
  calculationMethod: number;
  theme: ThemeMode;
  timeFormat: TimeFormat;
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
  | 'settings';
export type TabId = PrimaryTabId | SecondaryScreenId;
