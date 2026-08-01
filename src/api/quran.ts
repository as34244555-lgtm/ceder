import { loadJSON, saveJSON } from '../utils/storage';

export interface QuranAyah {
  numberInSurah: number;
  arabic: string;
  translation: string;
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

const cacheKey = (n: number) => `ezan-app:quran-surah-${n}`;

/** Arapça + Diyanet Türkçe meal. */
export async function fetchSurahWithTranslation(surahNumber: number): Promise<QuranAyah[]> {
  const cached = loadJSON<QuranAyah[] | null>(cacheKey(surahNumber), null);
  if (cached && cached.length > 0) return cached;

  const url = `https://api.alquran.cloud/v1/surah/${surahNumber}/editions/quran-uthmani,tr.diyanet`;
  const res = await fetch(url);
  if (!res.ok) throw new Error('Sure yüklenemedi');
  const json = (await res.json()) as { data: CloudEdition[] };

  const arabicAyahs = json.data?.[0]?.ayahs ?? [];
  const trAyahs = json.data?.[1]?.ayahs ?? [];

  const ayahs: QuranAyah[] = arabicAyahs.map((a, i) => ({
    numberInSurah: a.numberInSurah,
    arabic: a.text.replace(/^\uFEFF/, ''),
    translation: trAyahs[i]?.text ?? '',
    globalNumber: a.number,
  }));

  if (ayahs.length) saveJSON(cacheKey(surahNumber), ayahs);
  return ayahs;
}

/** Mishary Alafasy tilavet (CDN). */
export function ayahAudioUrl(globalAyahNumber: number): string {
  return `https://cdn.islamic.network/quran/audio/128/ar.alafasy/${globalAyahNumber}.mp3`;
}
