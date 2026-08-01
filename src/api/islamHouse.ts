/** Suudi Arabistan İslam İşleri Bakanlığı'nın İslam Evi (islamhouse.com) araması. */

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
  took?: number;
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
  'neyse',
  'yani',
  'gibi',
  'kadar',
  'sonra',
  'once',
  'önce',
  'zaman',
  'ken',
  'iken',
  'yapmaliyim',
  'yapmalıyım',
  'etmeliyim',
  'olur',
  'olmaz',
  'eder',
  'edilir',
  'alinir',
  'alınır',
]);

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

/** Soru kalıplarından arama terimleri çıkarır. */
export function extractSearchTerms(question: string): string {
  const cleaned = question
    .replace(/[?!.,;:"""'']/g, ' ')
    .split(/\s+/)
    .map((w) => w.trim())
    .filter((w) => w.length >= 2 && !STOP_WORDS.has(w.toLocaleLowerCase('tr')));
  const terms = cleaned.slice(0, 8).join(' ').trim();
  return terms.length >= 3 ? terms : question.trim();
}

/** Kısa yedek sorgu: en anlamlı 2–3 kelime. */
export function extractCoreKeywords(question: string): string {
  const words = extractSearchTerms(question)
    .split(/\s+/)
    .filter(Boolean)
    .sort((a, b) => b.length - a.length);
  return words.slice(0, 3).join(' ').trim();
}

function contentWords(question: string): string[] {
  return normalizeTr(question)
    .split(' ')
    .filter((w) => w.length >= 3 && !STOP_WORDS.has(w));
}

/** Sonuçun soruyla alakasını puanlar; alakasızları elemek için. */
export function scoreHit(question: string, title: string, snippet: string, type: string): number {
  const words = contentWords(question);
  if (words.length === 0) return 0;
  const hay = normalizeTr(`${title} ${snippet}`);
  let score = 0;
  let matched = 0;
  for (const w of words) {
    if (hay.includes(w)) {
      matched += 1;
      score += w.length >= 5 ? 3 : 2;
    }
  }
  // En az bir anlamlı kelime eşleşmeli
  if (matched === 0) return 0;
  if (type === 'fatwa') score += 2;
  if (type === 'articles') score += 1;
  if (snippet.length >= 40) score += 1;
  // Eşleşme oranı düşükse cezalandır
  const ratio = matched / words.length;
  if (ratio < 0.25 && matched < 2) return 0;
  return score;
}

async function postSearch(body: Record<string, unknown>): Promise<Omit<SaudiSourceHit, 'score'>[]> {
  const controller = new AbortController();
  const timer = setTimeout(() => controller.abort(), 8000);
  try {
    const response = await fetch(SEARCH_URL, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json', Accept: 'application/json' },
      body: JSON.stringify(body),
      signal: controller.signal,
    });
    // 404 = sonuç yok; hata sayma
    if (response.status === 404) return [];
    if (!response.ok) return [];
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

async function searchOnce(term: string): Promise<Omit<SaudiSourceHit, 'score'>[]> {
  if (term.trim().length < 3) return [];
  const [fatwas, articles, mixed] = await Promise.all([
    postSearch({ term, flang: 'tr', langs: ['tr'], types: ['fatwa'], page: 1 }),
    postSearch({ term, flang: 'tr', langs: ['tr'], types: ['articles'], page: 1 }),
    postSearch({ term, flang: 'tr', langs: ['tr'], types: ['-1'], page: 1 }),
  ]);
  const seen = new Set<string>();
  const out: Omit<SaudiSourceHit, 'score'>[] = [];
  for (const hit of [...fatwas, ...articles, ...mixed]) {
    if (seen.has(hit.id)) continue;
    seen.add(hit.id);
    out.push(hit);
  }
  return out;
}

/**
 * İslam Evi'nde Türkçe fetva + makale araştırır.
 * Birden fazla sorgu dener; yalnızca alakalı sonuçları döndürür.
 */
export async function searchSaudiIslamicSources(question: string): Promise<{
  hits: SaudiSourceHit[];
  query: string;
}> {
  const primary = extractSearchTerms(question);
  const core = extractCoreKeywords(question);
  const queries = [...new Set([primary, core, question.trim()].filter((q) => q.length >= 3))];

  const seen = new Set<string>();
  const scored: SaudiSourceHit[] = [];

  for (const query of queries) {
    const raw = await searchOnce(query);
    for (const hit of raw) {
      if (seen.has(hit.id)) continue;
      const score = scoreHit(question, hit.title, hit.snippet, hit.type);
      if (score <= 0) continue;
      seen.add(hit.id);
      scored.push({ ...hit, score });
    }
    // Yeterince iyi sonuç varsa diğer sorgulara gerek yok
    if (scored.some((h) => h.score >= 5)) break;
  }

  scored.sort((a, b) => b.score - a.score);
  return { hits: scored.slice(0, 5), query: primary };
}

/** Snippet çoğunlukla sorunun tekrarıysa "cevap" gibi gösterme. */
function snippetLooksLikeAnswer(snippet: string): boolean {
  if (snippet.length < 50) return false;
  const lower = snippet.toLocaleLowerCase('tr');
  // Sadece "sorunun metni şöyledir" kalıbı varsa cevap değil
  if (/sorunun metni şöyledir|sorunun metni soyledir/.test(lower) && snippet.length < 180) {
    return false;
  }
  return true;
}

export function formatSaudiGroundedAnswer(question: string, hits: SaudiSourceHit[]): string | null {
  const relevant = hits.filter((h) => h.score >= 3);
  if (relevant.length === 0) return null;

  const primary = relevant[0];
  const lines: string[] = [];

  lines.push(
    'Suudi Arabistan **İslam İşleri, Davet ve İrşad Bakanlığı** yayınlarından (İslam Evi) bulunan kaynaklar:',
  );
  lines.push('');

  if (snippetLooksLikeAnswer(primary.snippet)) {
    lines.push(`**${primary.title}**`);
    lines.push(primary.snippet);
  } else {
    lines.push(`Sorunuza en yakın resmi kaynak: **${primary.title}**`);
    lines.push('Ayrıntılı hüküm için aşağıdaki bağlantıyı açabilirsiniz.');
  }

  const extras = relevant.filter((h) => h.id !== primary.id).slice(0, 3);
  if (extras.length > 0) {
    lines.push('');
    lines.push('Diğer ilgili kaynaklar:');
    for (const hit of extras) {
      lines.push(`• **${hit.title}**`);
    }
  }

  lines.push('');
  lines.push('Kaynak linkleri:');
  for (const hit of relevant.slice(0, 4)) {
    lines.push(`• ${hit.title} → ${hit.url}`);
  }

  lines.push('');
  lines.push(
    'Not: Bu bir kaynak yönlendirmesidir; fetva yerine geçmez. Resmi ifta: https://alifta.gov.sa',
  );

  void question;
  return lines.join('\n');
}
