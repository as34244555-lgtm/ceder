import { DEFAULT_METHOD_ID } from '../data/methods';
import type { DayPrayerTimes, PrayerKey, PrayerTime } from '../types';

const BASE_URL = 'https://api.aladhan.com/v1';

const PRAYER_LABELS: Record<PrayerKey, string> = {
  imsak: 'İmsak',
  gunes: 'Güneş',
  ogle: 'Öğle',
  ikindi: 'İkindi',
  aksam: 'Akşam',
  yatsi: 'Yatsı',
};

/** Bu vakitlerde gerçekten ezan okunur; Güneş vakti bilgilendirme amaçlıdır. */
const ADHAN_KEYS = new Set<PrayerKey>(['imsak', 'ogle', 'ikindi', 'aksam', 'yatsi']);

interface AladhanTimings {
  Fajr: string;
  Sunrise: string;
  Dhuhr: string;
  Asr: string;
  Maghrib: string;
  Isha: string;
  [key: string]: string;
}

interface AladhanDate {
  readable: string;
  gregorian: { date: string; day: string; month: { number: number }; year: string };
  hijri: { day: string; month: { en: string; number: number }; year: string };
}

interface AladhanResponse {
  code: number;
  status: string;
  data: {
    timings: AladhanTimings;
    date: AladhanDate;
  };
}

interface AladhanCalendarResponse {
  code: number;
  status: string;
  data: { timings: AladhanTimings; date: AladhanDate }[];
}

class PrayerTimesError extends Error {}

function stripTimezoneSuffix(time: string): string {
  // Aladhan bazı zamanları "05:23 (+03)" biçiminde döndürür.
  return time.split(' ')[0];
}

function parseHM(time: string): { hours: number; minutes: number } {
  const [h, m] = stripTimezoneSuffix(time).split(':').map(Number);
  return { hours: h, minutes: m };
}

/**
 * Hicri ay adları, ay numarasına (1-12) göre çevrilir. Aladhan API'nin `en`
 * alanı Arapça harf çevirisinde aksan işaretleri kullandığından (örn.
 * "Muḥarram", "Shaʿbān") metin eşleştirmesi yerine güvenilir ay numarası
 * kullanılır.
 */
const HIJRI_MONTHS_TR: Record<number, string> = {
  1: 'Muharrem',
  2: 'Safer',
  3: 'Rebîülevvel',
  4: 'Rebîülâhir',
  5: 'Cemâziyelevvel',
  6: 'Cemâziyelâhir',
  7: 'Recep',
  8: 'Şaban',
  9: 'Ramazan',
  10: 'Şevval',
  11: 'Zilkade',
  12: 'Zilhicce',
};

function translateHijriMonth(monthNumber: number): string {
  return HIJRI_MONTHS_TR[monthNumber] ?? String(monthNumber);
}

function buildDayFromEntry(timings: AladhanTimings, date: AladhanDate): DayPrayerTimes {
  const [day, month, year] = date.gregorian.date.split('-').map(Number);

  const makeDate = (raw: string) => {
    const { hours, minutes } = parseHM(raw);
    return new Date(year, month - 1, day, hours, minutes, 0, 0);
  };

  const order: { key: PrayerKey; raw: string }[] = [
    { key: 'imsak', raw: timings.Fajr },
    { key: 'gunes', raw: timings.Sunrise },
    { key: 'ogle', raw: timings.Dhuhr },
    { key: 'ikindi', raw: timings.Asr },
    { key: 'aksam', raw: timings.Maghrib },
    { key: 'yatsi', raw: timings.Isha },
  ];

  const times: PrayerTime[] = order.map(({ key, raw }) => ({
    key,
    label: PRAYER_LABELS[key],
    date: makeDate(raw),
    isAdhan: ADHAN_KEYS.has(key),
  }));

  const hijri = date.hijri;
  const hijriMonthLabel = translateHijriMonth(hijri.month.number);
  const hijriDate = `${hijri.day} ${hijriMonthLabel} ${hijri.year}`;

  return {
    dateISO: `${year}-${String(month).padStart(2, '0')}-${String(day).padStart(2, '0')}`,
    hijriDate,
    hijri: {
      day: Number(hijri.day),
      month: hijri.month.number,
      monthLabel: hijriMonthLabel,
      year: Number(hijri.year),
    },
    gregorianDateLabel: date.readable,
    times,
  };
}

async function fetchAladhan(url: string): Promise<DayPrayerTimes> {
  const response = await fetch(url);
  if (!response.ok) {
    throw new PrayerTimesError(`Sunucu hatası: ${response.status}`);
  }
  const json = (await response.json()) as AladhanResponse;
  if (json.code !== 200 || !json.data) {
    throw new PrayerTimesError('Namaz vakitleri alınamadı.');
  }
  return buildDayFromEntry(json.data.timings, json.data.date);
}

function toDDMMYYYY(date: Date): string {
  const d = String(date.getDate()).padStart(2, '0');
  const m = String(date.getMonth() + 1).padStart(2, '0');
  const y = date.getFullYear();
  return `${d}-${m}-${y}`;
}

export async function fetchPrayerTimesByCity(
  city: string,
  country: string = 'Turkey',
  method: number = DEFAULT_METHOD_ID,
  date: Date = new Date(),
): Promise<DayPrayerTimes> {
  const url = `${BASE_URL}/timingsByCity/${toDDMMYYYY(date)}?city=${encodeURIComponent(
    city,
  )}&country=${encodeURIComponent(country)}&method=${method}`;
  return fetchAladhan(url);
}

export async function fetchPrayerTimesByCoords(
  latitude: number,
  longitude: number,
  method: number = DEFAULT_METHOD_ID,
  date: Date = new Date(),
): Promise<DayPrayerTimes> {
  const url = `${BASE_URL}/timings/${toDDMMYYYY(date)}?latitude=${latitude}&longitude=${longitude}&method=${method}`;
  return fetchAladhan(url);
}

export async function fetchTodayAndTomorrow(
  fetcher: (date: Date) => Promise<DayPrayerTimes>,
): Promise<{ today: DayPrayerTimes; tomorrow: DayPrayerTimes }> {
  const now = new Date();
  const tomorrow = new Date(now);
  tomorrow.setDate(now.getDate() + 1);
  const [today, tomorrowData] = await Promise.all([fetcher(now), fetcher(tomorrow)]);
  return { today, tomorrow: tomorrowData };
}

export async function fetchMonthlyCalendarByCity(
  city: string,
  country: string,
  method: number,
  year: number,
  month: number,
): Promise<DayPrayerTimes[]> {
  const url = `${BASE_URL}/calendarByCity/${year}/${month}?city=${encodeURIComponent(
    city,
  )}&country=${encodeURIComponent(country)}&method=${method}`;
  const response = await fetch(url);
  if (!response.ok) throw new PrayerTimesError(`Sunucu hatası: ${response.status}`);
  const json = (await response.json()) as AladhanCalendarResponse;
  if (json.code !== 200 || !json.data) throw new PrayerTimesError('Takvim alınamadı.');
  return json.data.map((entry) => buildDayFromEntry(entry.timings, entry.date));
}

export async function fetchMonthlyCalendarByCoords(
  latitude: number,
  longitude: number,
  method: number,
  year: number,
  month: number,
): Promise<DayPrayerTimes[]> {
  const url = `${BASE_URL}/calendar/${year}/${month}?latitude=${latitude}&longitude=${longitude}&method=${method}`;
  const response = await fetch(url);
  if (!response.ok) throw new PrayerTimesError(`Sunucu hatası: ${response.status}`);
  const json = (await response.json()) as AladhanCalendarResponse;
  if (json.code !== 200 || !json.data) throw new PrayerTimesError('Takvim alınamadı.');
  return json.data.map((entry) => buildDayFromEntry(entry.timings, entry.date));
}
