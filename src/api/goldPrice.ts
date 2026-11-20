import { loadJSON, saveJSON } from '../utils/storage';

const CACHE_KEY = 'ezan-app:gold-gram-try';
const OUNCE_GRAMS = 31.1034768;

interface GoldCache {
  gramTry: number;
  fetchedAt: number;
  source: string;
}

/** Güncel gram altın (TRY). Önce CDN kur API, sonra önbellek. */
export async function fetchGoldGramPriceTry(): Promise<GoldCache | null> {
  const cached = loadJSON<GoldCache | null>(CACHE_KEY, null);
  if (cached && Date.now() - cached.fetchedAt < 6 * 60 * 60 * 1000) {
    return cached;
  }

  try {
    const res = await fetch(
      'https://cdn.jsdelivr.net/npm/@fawazahmed0/currency-api@latest/v1/currencies/xau.json',
    );
    if (!res.ok) throw new Error('gold api');
    const json = (await res.json()) as { xau?: { try?: number } };
    const tryPerOunce = json.xau?.try;
    if (!tryPerOunce || tryPerOunce <= 0) throw new Error('no rate');
    const gramTry = tryPerOunce / OUNCE_GRAMS;
    const value: GoldCache = {
      gramTry,
      fetchedAt: Date.now(),
      source: 'currency-api (XAU/TRY)',
    };
    saveJSON(CACHE_KEY, value);
    return value;
  } catch {
    return cached;
  }
}

/** Diyanet fitre için kaba varsayılan (kullanıcı yine de değiştirebilir). */
export const DEFAULT_FITRE_TRY = 210;
