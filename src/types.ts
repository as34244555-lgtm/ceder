export interface City {
  il: string;
  ilceleri?: string[];
}

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

export interface DayPrayerTimes {
  dateISO: string;
  hijriDate: string;
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

export interface AppSettings {
  soundEnabled: boolean;
  notificationsEnabled: boolean;
  reminderMinutesBefore: number | null;
}
