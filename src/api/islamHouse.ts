/** Suudi Arabistan İslam İşleri Bakanlığı'nın İslam Evi (islamhouse.com) araması. */

export interface SaudiSourceHit {
  id: string;
  title: string;
  snippet: string;
  type: string;
  url: string;
  lang: string;
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
]);

function stripHtml(html: string): string {
  return html
    .replace(/<[^>]+>/g, ' ')
    .replace(/&quot;/g, '"')
    .replace(/&#39;/g, "'")
    .replace(/&amp;/g, '&')
    .replace(/&lt;/g, '<')
    .replace(/&gt;/g, '>')
    .replace(/\s+/g, ' ')
    .trim();
}

/** Arama kalitesini artırmak için soru kalıplarından anahtar kelimeler çıkarır. */
export function extractSearchTerms(question: string): string {
  const cleaned = question
    .replace(/[?!.,;:"""'']/g, ' ')
    .split(/\s+/)
    .map((w) => w.trim())
    .filter((w) => w.length >= 2 && !STOP_WORDS.has(w.toLocaleLowerCase('tr')));
  const terms = cleaned.slice(0, 8).join(' ').trim();
  return terms.length >= 3 ? terms : question.trim();
}

async function postSearch(body: Record<string, unknown>): Promise<SaudiSourceHit[]> {
  const controller = new AbortController();
  const timer = setTimeout(() => controller.abort(), 8000);
  try {
    const response = await fetch(SEARCH_URL, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json', Accept: 'application/json' },
      body: JSON.stringify(body),
      signal: controller.signal,
    });
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

/**
 * İslam Evi'nde Türkçe fetva + makale araştırır (Suudi İslam İşleri Bakanlığı yayını).
 * Fetva sonuçları önceliklidir; hızlıdır (~20–40 ms sunucu tarafı).
 */
export async function searchSaudiIslamicSources(question: string): Promise<{
  hits: SaudiSourceHit[];
  query: string;
}> {
  const query = extractSearchTerms(question);
  if (query.length < 3) return { hits: [], query };

  const [fatwas, articles, mixed] = await Promise.all([
    postSearch({
      term: query,
      flang: 'tr',
      langs: ['tr'],
      types: ['fatwa'],
      page: 1,
    }),
    postSearch({
      term: query,
      flang: 'tr',
      langs: ['tr'],
      types: ['articles'],
      page: 1,
    }),
    postSearch({
      term: query,
      flang: 'tr',
      langs: ['tr'],
      types: ['-1'],
      page: 1,
    }),
  ]);

  const seen = new Set<string>();
  const hits: SaudiSourceHit[] = [];
  for (const hit of [...fatwas, ...articles, ...mixed]) {
    if (seen.has(hit.id)) continue;
    seen.add(hit.id);
    hits.push(hit);
    if (hits.length >= 6) break;
  }

  return { hits, query };
}

export function formatSaudiGroundedAnswer(question: string, hits: SaudiSourceHit[]): string | null {
  if (hits.length === 0) return null;

  const withSnippet = hits.filter((h) => h.snippet.length >= 40);
  const primary = withSnippet[0] ?? hits[0];
  const lines: string[] = [];

  lines.push(
    'Suudi Arabistan **İslam İşleri, Davet ve İrşad Bakanlığı** yayınlarından (İslam Evi / islamhouse.com) araştırıldı:',
  );
  lines.push('');

  if (primary.snippet) {
    lines.push(`**${primary.title}**`);
    lines.push(primary.snippet);
  } else {
    lines.push(`Konuyla ilgili resmi yayınlar bulundu. Öne çıkan: **${primary.title}**`);
  }

  const extras = hits.filter((h) => h.id !== primary.id).slice(0, 3);
  if (extras.length > 0) {
    lines.push('');
    lines.push('İlgili diğer kaynaklar:');
    for (const hit of extras) {
      const bit = hit.snippet ? ` — ${hit.snippet.slice(0, 120)}${hit.snippet.length > 120 ? '…' : ''}` : '';
      lines.push(`• **${hit.title}**${bit}`);
    }
  }

  lines.push('');
  lines.push('Kaynak linkleri:');
  for (const hit of hits.slice(0, 4)) {
    lines.push(`• [${hit.type}] ${hit.title} → ${hit.url}`);
  }

  lines.push('');
  lines.push(
    'Not: Bu özet İslam Evi aramasına dayanır; kişisel fetva yerine geçmez. Resmi ifta kurumu: https://alifta.gov.sa — yerel müftülüğe de danışabilirsiniz.',
  );

  // Soruyla tamamen alakasız görünmesin diye çok zayıf eşleşmede null dönme —
  // en az bir sonuç varsa kullanıcıya sunuyoruz.
  void question;
  return lines.join('\n');
}
