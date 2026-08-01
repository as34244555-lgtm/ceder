/** İslam Evi (Suudi İslam İşleri) — sorunun aynısıyla arama. */

import type { ResearchHit } from './webResearch';

interface IslamHouseSearchResponse {
  numFound?: number;
  items?: {
    id: string;
    lang?: string;
    type: string;
    title: string;
    nabza?: string;
  }[];
}

const SEARCH_URL = 'https://islamhouse.com/search/search.php';

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

async function fetchWithTimeout(url: string, ms: number, init?: RequestInit): Promise<Response | null> {
  const controller = new AbortController();
  const timer = setTimeout(() => controller.abort(), ms);
  try {
    return await fetch(url, { ...init, signal: controller.signal });
  } catch {
    return null;
  } finally {
    clearTimeout(timer);
  }
}

/** Kullanıcının sorusunu olduğu gibi İslam Evi'nde arar. */
export async function searchIslamHouseExact(question: string): Promise<ResearchHit[]> {
  const term = question.trim().slice(0, 120);
  if (term.length < 3) return [];

  const body = new URLSearchParams({
    term,
    type: 'all',
    language: 'tr',
  });

  const response = await fetchWithTimeout(SEARCH_URL, 4000, {
    method: 'POST',
    headers: {
      'Content-Type': 'application/x-www-form-urlencoded',
      Accept: 'application/json',
    },
    body,
  });
  // 404 = sonuç yok (Arapça HTML gövde döner); diğer hatalarda da boş dön
  if (!response || response.status === 404 || !response.ok) return [];

  let json: IslamHouseSearchResponse;
  try {
    const raw = await response.text();
    if (!raw.trim().startsWith('{')) return [];
    json = JSON.parse(raw) as IslamHouseSearchResponse;
  } catch {
    return [];
  }

  const items = (json.items ?? []).filter((item) => item?.id && item?.title);
  // Önce Türkçe; yoksa diğer diller (ama tercihen tr)
  const preferred = items.filter((i) => (i.lang ?? 'tr') === 'tr');
  const pool = preferred.length > 0 ? preferred : items;

  return pool.slice(0, 8).map((item) => {
    const title = stripHtml(item.title ?? '');
    const snippet = stripHtml(item.nabza ?? '');
    return {
      title,
      snippet:
        snippet && snippet.toLocaleLowerCase('tr') !== title.toLocaleLowerCase('tr')
          ? snippet.slice(0, 280)
          : '',
      url: `https://islamhouse.com/${item.id}`,
      host: 'islamhouse.com',
    };
  }).filter((h) => h.title.length > 0);
}

/** Geriye uyumluluk — eski çağrılar için. */
export async function searchSaudiIslamicSources(question: string): Promise<{
  hits: ResearchHit[];
  query: string;
}> {
  const hits = await searchIslamHouseExact(question);
  return { hits, query: question.trim() };
}

export function formatSaudiGroundedAnswer(question: string, hits: ResearchHit[]): string | null {
  if (hits.length === 0) return null;
  const lines = [
    `“${question}” için İslam Evi kaynakları (Suudi İslam İşleri):`,
    '',
  ];
  for (const hit of hits.slice(0, 4)) {
    lines.push(`• **${hit.title}**`);
    if (hit.snippet && !/sorunun metni/i.test(hit.snippet)) {
      lines.push(`  ${hit.snippet.slice(0, 180)}${hit.snippet.length > 180 ? '…' : ''}`);
    }
    lines.push(`  ${hit.url}`);
  }
  lines.push('');
  lines.push('Not: Fetva yerine geçmez. https://alifta.gov.sa');
  return lines.join('\n');
}
