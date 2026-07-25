export type PrayerKey =
  | 'imsak'
  | 'gunes'
  | 'ogle'
  | 'ikindi'
  | 'aksam'
  | 'yatsi';

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

export type ThemeMode = 'dark' | 'light' | 'system';
export type TimeFormat = '24' | '12';
export type AdhanSoundMode = 'chime' | 'adhan';

export interface AppSettings {
  soundEnabled: boolean;
  notificationsEnabled: boolean;
  reminderMinutesBefore: number | null;
  calculationMethod: number;
  theme: ThemeMode;
  timeFormat: TimeFormat;
  adhanSoundMode: AdhanSoundMode;
}

export type TabId = 'home' | 'qibla' | 'calendar' | 'zikir' | 'settings';
