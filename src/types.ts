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
export type AdhanSoundMode = 'chime' | 'adhan';
export type AdhanSoundId = 'ses1' | 'ses2';

export interface AppSettings {
  soundEnabled: boolean;
  notificationsEnabled: boolean;
  /** @deprecated bkz. reminderMinutesList */
  reminderMinutesBefore?: number | null;
  reminderMinutesList: number[];
  calculationMethod: number;
  theme: ThemeMode;
  timeFormat: TimeFormat;
  adhanSoundMode: AdhanSoundMode;
  adhanSoundId: AdhanSoundId;
}

export type PrimaryTabId = 'home' | 'tracker' | 'qibla' | 'calendar' | 'more';
export type SecondaryScreenId =
  | 'zikir'
  | 'esma'
  | 'guide'
  | 'ramadan'
  | 'zakat'
  | 'mosques'
  | 'settings';
export type TabId = PrimaryTabId | SecondaryScreenId;
