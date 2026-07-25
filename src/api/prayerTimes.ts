import type { DayPrayerTimes, PrayerKey, PrayerTime } from '../types';

const BASE_URL = 'https://api.aladhan.com/v1';

/** Diyanet İşleri Başkanlığı (Türkiye) hesaplama yöntemi. */
const CALCULATION_METHOD = 13;

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

interface AladhanResponse {
  code: number;
  status: string;
  data: {
    timings: AladhanTimings;
    date: {
      readable: string;
      gregorian: { date: string; day: string; month: { number: number }; year: string };
      hijri: { day: string; month: { en: string; number: number }; year: string };
    };
  };
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

function buildDayFromResponse(json: AladhanResponse): DayPrayerTimes {
  if (json.code !== 200 || !json.data) {
    throw new PrayerTimesError('Namaz vakitleri alınamadı.');
  }

  const { timings, date } = json.data;
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
  const hijriDate = `${hijri.day} ${translateHijriMonth(hijri.month.en)} ${hijri.year}`;

  return {
    dateISO: `${year}-${String(month).padStart(2, '0')}-${String(day).padStart(2, '0')}`,
    hijriDate,
    gregorianDateLabel: date.readable,
    times,
  };
}

const HIJRI_MONTHS_TR: Record<string, string> = {
  Muharram: 'Muharrem',
  Safar: 'Safer',
  "Rabi' al-awwal": 'Rebîülevvel',
  "Rabi' al-thani": 'Rebîülâhir',
  'Jumada al-awwal': 'Cemâziyelevvel',
  'Jumada al-thani': 'Cemâziyelâhir',
  Rajab: 'Recep',
  Shaban: 'Şaban',
  Ramadan: 'Ramazan',
  Shawwal: 'Şevval',
  "Dhu al-Qa'dah": 'Zilkade',
  'Dhu al-Hijjah': 'Zilhicce',
};

function translateHijriMonth(en: string): string {
  return HIJRI_MONTHS_TR[en] ?? en;
}

async function fetchAladhan(url: string): Promise<DayPrayerTimes> {
  const response = await fetch(url);
  if (!response.ok) {
    throw new PrayerTimesError(`Sunucu hatası: ${response.status}`);
  }
  const json = (await response.json()) as AladhanResponse;
  return buildDayFromResponse(json);
}

function toDDMMYYYY(date: Date): string {
  const d = String(date.getDate()).padStart(2, '0');
  const m = String(date.getMonth() + 1).padStart(2, '0');
  const y = date.getFullYear();
  return `${d}-${m}-${y}`;
}

export async function fetchPrayerTimesByCity(
  city: string,
  date: Date = new Date(),
): Promise<DayPrayerTimes> {
  const url = `${BASE_URL}/timingsByCity/${toDDMMYYYY(date)}?city=${encodeURIComponent(
    city,
  )}&country=Turkey&method=${CALCULATION_METHOD}`;
  return fetchAladhan(url);
}

export async function fetchPrayerTimesByCoords(
  latitude: number,
  longitude: number,
  date: Date = new Date(),
): Promise<DayPrayerTimes> {
  const url = `${BASE_URL}/timings/${toDDMMYYYY(date)}?latitude=${latitude}&longitude=${longitude}&method=${CALCULATION_METHOD}`;
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
