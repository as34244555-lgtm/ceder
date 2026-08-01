/** Suudi İslam İşleri — İslam Evi araması (kısa ve tek istek odaklı). */

export interface SaudiSourceHit {
  id: string;
  title: string;
  snippet: string;
  type: string;
  url: string;
  score: number;
}

interface IslamHouseSearchResponse {
  items?: {
    id: string;
    lang?: string;
    type: string;
    title: string;
    nabza?: string;
  }[];
}

const SEARCH_URL = 'https://islamhouse.com/search/search.php';

const TOPIC_SEEDS: { match: RegExp; term: string }[] = [
  { match: /abdest/i, term: 'abdest' },
  { match: /gus(u|ü)l|boy abdest/i, term: 'gusul' },
  { match: /namaz|rekat|rekât|kaza/i, term: 'namaz' },
  { match: /farz/i, term: 'namaz farz' },
  { match: /oru[cç]|imsak|iftar/i, term: 'oruc' },
  { match: /zek[aâ]t|fitre/i, term: 'zekat' },
  { match: /k[ıi]ble/i, term: 'kible' },
  { match: /teravih/i, term: 'teravih' },
  { match: /cuma/i, term: 'cuma' },
  { match: /macun|misvak/i, term: 'dis macunu' },
];

function stripHtml(html: string): string {
  return html
    .replace(/<[^>]+>/g, ' ')
    .replace(/&quot;/g, '"')
    .replace(/&#39;/g, "'")
    .replace(/&amp;/g, '&')
    .replace(/&nbsp;/g, ' ')
    .replace(/\s+/g, ' ')
    .trim();
}

export function normalizeTr(text: string): string {
  return text
    .toLocaleLowerCase('tr')
    .replace(/ı/g, 'i')
    .replace(/ğ/g, 'g')
    .replace(/ü/g, 'u')
    .replace(/ş/g, 's')
    .replace(/ö/g, 'o')
    .replace(/ç/g, 'c')
    .replace(/[^a-z0-9\s]/g, ' ')
    .replace(/\s+/g, ' ')
    .trim();
}

function bestSearchTerm(question: string): string {
  for (const seed of TOPIC_SEEDS) {
    if (seed.match.test(question)) return seed.term;
  }
  const words = question
    .replace(/[?!.,;:"""'']/g, ' ')
    .split(/\s+/)
    .map((w) => w.trim())
    .filter((w) => w.length >= 4);
  words.sort((a, b) => b.length - a.length);
  return (words[0] ?? question).trim().slice(0, 40);
}

function scoreHit(question: string, title: string, snippet: string): number {
  const q = normalizeTr(question);
  const hay = normalizeTr(`${title} ${snippet}`);
  const qParts = q.split(' ').filter((w) => w.length >= 4);
  if (qParts.length === 0) return hay.length > 0 ? 1 : 0;
  let matched = 0;
  for (const p of qParts) {
    const stem = p.slice(0, Math.min(5, p.length));
    if (hay.includes(stem)) matched += 1;
  }
  return matched;
}

async function searchFatwas(term: string): Promise<Omit<SaudiSourceHit, 'score'>[]> {
  const controller = new AbortController();
  const timer = setTimeout(() => controller.abort(), 2500);
  try {
    const response = await fetch(SEARCH_URL, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json', Accept: 'application/json' },
      body: JSON.stringify({
        term,
        flang: 'tr',
        langs: ['tr'],
        types: ['fatwa'],
        page: 1,
      }),
      signal: controller.signal,
    });
    if (!response.ok) return [];
    const json = (await response.json()) as IslamHouseSearchResponse;
    return (json.items ?? []).slice(0, 5).map((item) => ({
      id: String(item.id),
      title: stripHtml(item.title ?? ''),
      snippet: stripHtml(item.nabza ?? ''),
      type: item.type ?? 'fatwa',
      url: `https://islamhouse.com/${item.id}`,
    }));
  } catch {
    return [];
  } finally {
    clearTimeout(timer);
  }
}

export async function searchSaudiIslamicSources(question: string): Promise<{
  hits: SaudiSourceHit[];
  query: string;
}> {
  const query = bestSearchTerm(question);
  if (query.length < 3) return { hits: [], query };

  const raw = await searchFatwas(query);
  const hits = raw
    .map((h) => ({ ...h, score: scoreHit(question, h.title, h.snippet) }))
    .filter((h) => h.score > 0)
    .sort((a, b) => b.score - a.score)
    .slice(0, 4);

  // Hiç skorlanamadıysa yine de ilk 2 sonucu göster (terim zaten konu tohumu)
  if (hits.length === 0 && raw.length > 0) {
    return {
      hits: raw.slice(0, 2).map((h) => ({ ...h, score: 1 })),
      query,
    };
  }

  return { hits, query };
}

export function formatSaudiGroundedAnswer(_question: string, hits: SaudiSourceHit[]): string | null {
  if (hits.length === 0) return null;
  const lines = [
    'İslam Evi kaynakları (Suudi İslam İşleri Bakanlığı yayınları):',
    '',
  ];
  for (const hit of hits.slice(0, 3)) {
    lines.push(`• **${hit.title}**`);
    if (hit.snippet && !/sorunun metni/i.test(hit.snippet)) {
      lines.push(`  ${hit.snippet.slice(0, 160)}${hit.snippet.length > 160 ? '…' : ''}`);
    }
    lines.push(`  ${hit.url}`);
  }
  lines.push('');
  lines.push('Not: Fetva yerine geçmez. https://alifta.gov.sa');
  return lines.join('\n');
}
