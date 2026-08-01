/** Suudi Arabistan İslam İşleri Bakanlığı — İslam Evi (islamhouse.com) araması. */

export interface SaudiSourceHit {
  id: string;
  title: string;
  snippet: string;
  type: string;
  url: string;
  lang: string;
  score: number;
}

interface IslamHouseSearchResponse {
  numFound?: number;
  items?: {
    id: string;
    lang: string;
    type: string;
    title: string;
    nabza?: string;
  }[];
}

const SEARCH_URL = 'https://islamhouse.com/search/search.php';

const STOP_WORDS = new Set([
  'nedir',
  'nasil',
  'nasıl',
  'nelerdir',
  'neler',
  'midir',
  'mıdır',
  'mudur',
  'müdür',
  'mi',
  'mı',
  'mu',
  'mü',
  'ne',
  'bir',
  've',
  'ile',
  'icin',
  'için',
  'olan',
  'olarak',
  'hakkinda',
  'hakkında',
  'soru',
  'cevap',
  'lutfen',
  'lütfen',
  'bana',
  'benim',
  'acaba',
  'yani',
  'gibi',
  'kadar',
  'sonra',
  'once',
  'önce',
  'yapmaliyim',
  'yapmalıyım',
  'etmeliyim',
  'olur',
  'olmaz',
]);

/** Konu kökleri: serbest soruda tek kelimelik güçlü arama için. */
const TOPIC_SEEDS: { match: RegExp; terms: string[] }[] = [
  { match: /abdest/i, terms: ['abdest'] },
  { match: /gus(u|ü)l|boy abdest/i, terms: ['gusul', 'boy abdesti'] },
  { match: /namaz|rekat|rekât|ruku|rükû|secde|kaza/i, terms: ['namaz'] },
  { match: /farz/i, terms: ['namaz farz'] },
  { match: /oru[cç]|imsak|iftar|sahur/i, terms: ['oruc', 'oruç'] },
  { match: /zek[aâ]t|fitre|nisap/i, terms: ['zekat', 'zekât'] },
  { match: /k[ıi]ble/i, terms: ['kible', 'kıble'] },
  { match: /teravih/i, terms: ['teravih'] },
  { match: /cuma/i, terms: ['cuma namaz'] },
  { match: /hay[ıi]z|nifas|adet/i, terms: ['hayiz', 'hayız'] },
  { match: /teyemmum|teyemmüm/i, terms: ['teyemmum'] },
  { match: /macun|misvak/i, terms: ['oruc dis macunu', 'diş macunu'] },
];

function stripHtml(html: string): string {
  return html
    .replace(/<[^>]+>/g, ' ')
    .replace(/&quot;/g, '"')
    .replace(/&#39;/g, "'")
    .replace(/&amp;/g, '&')
    .replace(/&lt;/g, '<')
    .replace(/&gt;/g, '>')
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

function tokenMatches(hayTokens: string[], word: string): boolean {
  const w = normalizeTr(word);
  if (w.length < 3) return hayTokens.includes(w);
  const stem = w.slice(0, Math.min(5, w.length));
  return hayTokens.some((t) => {
    if (t === w) return true;
    if (stem.length >= 4 && t.startsWith(stem)) return true;
    if (t.length >= 4 && w.startsWith(t.slice(0, Math.min(5, t.length)))) return true;
    return false;
  });
}

export function extractSearchTerms(question: string): string {
  const cleaned = question
    .replace(/[?!.,;:"""'']/g, ' ')
    .split(/\s+/)
    .map((w) => w.trim())
    .filter((w) => w.length >= 2 && !STOP_WORDS.has(w.toLocaleLowerCase('tr')));
  const terms = cleaned.slice(0, 6).join(' ').trim();
  return terms.length >= 3 ? terms : question.trim();
}

export function buildSearchQueries(question: string): string[] {
  const primary = extractSearchTerms(question);
  const words = primary
    .split(/\s+/)
    .filter(Boolean)
    .sort((a, b) => b.length - a.length);

  const queries: string[] = [];
  if (primary) queries.push(primary);
  if (words.length >= 2) queries.push(words.slice(0, 2).join(' '));
  if (words[0] && words[0].length >= 3) queries.push(words[0]);

  for (const seed of TOPIC_SEEDS) {
    if (seed.match.test(question)) queries.push(...seed.terms);
  }

  // ascii yedekler
  const ascii = normalizeTr(primary);
  if (ascii && ascii !== primary.toLocaleLowerCase('tr')) queries.push(ascii);

  return [...new Set(queries.map((q) => q.trim()).filter((q) => q.length >= 3))];
}

export function scoreHit(question: string, title: string, snippet: string, type: string): number {
  const words = normalizeTr(question)
    .split(' ')
    .filter((w) => w.length >= 3 && !STOP_WORDS.has(w));
  if (words.length === 0) return 0;

  const hay = normalizeTr(`${title} ${snippet}`);
  const hayTokens = hay.split(' ').filter(Boolean);
  let score = 0;
  let matched = 0;

  for (const w of words) {
    if (tokenMatches(hayTokens, w)) {
      matched += 1;
      score += w.length >= 5 ? 3 : 2;
    }
  }

  if (matched === 0) return 0;
  if (type === 'fatwa') score += 2;
  else if (type === 'articles' || type === 'books') score += 1;
  if (snippet.length >= 40) score += 1;
  return score;
}

async function postSearch(
  term: string,
  types: string[],
): Promise<Omit<SaudiSourceHit, 'score'>[]> {
  const controller = new AbortController();
  const timer = setTimeout(() => controller.abort(), 7000);
  try {
    const response = await fetch(SEARCH_URL, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json', Accept: 'application/json' },
      body: JSON.stringify({
        term,
        flang: 'tr',
        langs: ['tr'],
        types,
        page: 1,
      }),
      signal: controller.signal,
    });
    if (response.status === 404 || !response.ok) return [];
    const json = (await response.json()) as IslamHouseSearchResponse;
    return (json.items ?? []).map((item) => ({
      id: String(item.id),
      title: stripHtml(item.title ?? ''),
      snippet: stripHtml(item.nabza ?? ''),
      type: item.type ?? 'item',
      url: `https://islamhouse.com/${item.id}`,
      lang: item.lang ?? 'tr',
    }));
  } catch {
    return [];
  } finally {
    clearTimeout(timer);
  }
}

async function searchTerm(term: string): Promise<Omit<SaudiSourceHit, 'score'>[]> {
  // Önce fetva — daha isabetli ve tek istek
  const fatwas = await postSearch(term, ['fatwa']);
  if (fatwas.length > 0) return fatwas;
  const articles = await postSearch(term, ['articles']);
  if (articles.length > 0) return articles;
  return postSearch(term, ['-1']);
}

export async function searchSaudiIslamicSources(question: string): Promise<{
  hits: SaudiSourceHit[];
  query: string;
}> {
  const queries = buildSearchQueries(question);
  const seen = new Set<string>();
  const scored: SaudiSourceHit[] = [];

  for (const query of queries) {
    const raw = await searchTerm(query);
    for (const hit of raw) {
      if (seen.has(hit.id)) continue;
      const score = scoreHit(question, hit.title, hit.snippet, hit.type);
      // Kök eşleşmesiyle gelenleri de al (eşik düşük)
      if (score < 2) continue;
      seen.add(hit.id);
      scored.push({ ...hit, score });
    }
    if (scored.length >= 3) break;
  }

  scored.sort((a, b) => b.score - a.score);
  return { hits: scored.slice(0, 5), query: queries[0] ?? question };
}

function snippetLooksLikeAnswer(snippet: string): boolean {
  if (snippet.length < 60) return false;
  const lower = snippet.toLocaleLowerCase('tr');
  if (/sorunun metni şöyledir|sorunun metni soyledir/.test(lower) && snippet.length < 200) {
    return false;
  }
  return true;
}

export function formatSaudiGroundedAnswer(question: string, hits: SaudiSourceHit[]): string | null {
  const relevant = hits.filter((h) => h.score >= 2);
  if (relevant.length === 0) return null;

  const primary = relevant[0];
  const lines: string[] = [
    'Suudi Arabistan **İslam İşleri Bakanlığı** yayınları (İslam Evi) üzerinden bulunanlar:',
    '',
  ];

  if (snippetLooksLikeAnswer(primary.snippet)) {
    lines.push(`**${primary.title}**`);
    lines.push(primary.snippet);
  } else {
    lines.push(`En yakın kaynak: **${primary.title}**`);
    lines.push('Kısa özet kayıtta yok; ayrıntı için kaynağı açın.');
  }

  const extras = relevant.filter((h) => h.id !== primary.id).slice(0, 3);
  if (extras.length > 0) {
    lines.push('');
    lines.push('Diğer kaynaklar:');
    for (const hit of extras) lines.push(`• **${hit.title}**`);
  }

  lines.push('');
  lines.push('Linkler:');
  for (const hit of relevant.slice(0, 4)) {
    lines.push(`• ${hit.title} → ${hit.url}`);
  }
  lines.push('');
  lines.push('Not: Fetva yerine geçmez. Resmi ifta: https://alifta.gov.sa');
  void question;
  return lines.join('\n');
}
