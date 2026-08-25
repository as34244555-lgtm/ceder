import { loadJSON, saveJSON } from '../utils/storage';

export interface QuranAyah {
  numberInSurah: number;
  arabic: string;
  globalNumber: number;
}

interface CloudAyah {
  number: number;
  text: string;
  numberInSurah: number;
}

interface CloudEdition {
  ayahs: CloudAyah[];
}

const cacheKey = (n: number) => `ezan-app:quran-surah-${n}-uthmani`;

/** Yalnızca Arapça uthmani metin (telifli meal/tilavet yok). */
export async function fetchSurahArabic(surahNumber: number): Promise<QuranAyah[]> {
  const key = cacheKey(surahNumber);
  const cached = loadJSON<QuranAyah[] | null>(key, null);
  if (cached && cached.length > 0) return cached;

  const url = `https://api.alquran.cloud/v1/surah/${surahNumber}/quran-uthmani`;
  const res = await fetch(url);
  if (!res.ok) throw new Error('Sure yüklenemedi');
  const json = (await res.json()) as { data: CloudEdition };

  const ayahs: QuranAyah[] = (json.data?.ayahs ?? []).map((a) => ({
    numberInSurah: a.numberInSurah,
    arabic: a.text.replace(/^\uFEFF/, ''),
    globalNumber: a.number,
  }));

  if (ayahs.length) saveJSON(key, ayahs);
  return ayahs;
}

const BOOKMARK_KEY = 'ezan-app:quran-bookmark';
const HATIM_KEY = 'ezan-app:quran-hatim';
const MEMORIZE_KEY = 'ezan-app:quran-memorize';

export interface QuranBookmark {
  surah: number;
  ayah: number;
}

export function loadBookmark(): QuranBookmark | null {
  return loadJSON(BOOKMARK_KEY, null);
}

export function saveBookmark(b: QuranBookmark) {
  saveJSON(BOOKMARK_KEY, b);
}

/** Hatim: okunan sure numaraları seti. */
export function loadHatim(): number[] {
  return loadJSON(HATIM_KEY, []);
}

export function toggleHatimSurah(surah: number): number[] {
  const cur = new Set(loadHatim());
  if (cur.has(surah)) cur.delete(surah);
  else cur.add(surah);
  const next = [...cur].sort((a, b) => a - b);
  saveJSON(HATIM_KEY, next);
  return next;
}

export function loadMemorize(): Record<string, boolean> {
  return loadJSON(MEMORIZE_KEY, {});
}

export function toggleMemorize(surah: number, ayah: number): Record<string, boolean> {
  const key = `${surah}:${ayah}`;
  const cur = { ...loadMemorize() };
  cur[key] = !cur[key];
  saveJSON(MEMORIZE_KEY, cur);
  return cur;
}
