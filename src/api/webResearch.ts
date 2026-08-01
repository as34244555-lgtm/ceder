/** Tam soruyu güvenilir İslami sitelerde araştırır (DuckDuckGo HTML → Jina). */

export interface ResearchHit {
  title: string;
  snippet: string;
  url: string;
  host: string;
}

const TRUSTED_HOSTS = [
  'islamhouse.com',
  'd1.islamhouse.com',
  'diyanet.gov.tr',
  'kuran.diyanet.gov.tr',
  'sorularlaislamiyet.com',
  'fetva.net',
  'dinimizislam.com',
  'm.dinimizislam.com',
  'alifta.gov.sa',
  'islamqa.info',
  'binbaz.org.sa',
  'saaid.net',
  'hadislerleislam.com',
] as const;

const BLOCKED_URL_PARTS = [
  'mlist.islamhouse',
  'torrent.islamhouse',
  '/login',
  'login?',
];

const SITE_FILTER =
  'site:diyanet.gov.tr OR site:islamhouse.com OR site:sorularlaislamiyet.com OR site:fetva.net OR site:dinimizislam.com OR site:alifta.gov.sa OR site:islamqa.info';

function isTrustedHost(host: string): boolean {
  const h = host.replace(/^www\./, '').toLowerCase();
  return TRUSTED_HOSTS.some((d) => h === d || h.endsWith(`.${d}`));
}

function cleanText(text: string): string {
  return text
    .replace(/\*\*/g, '')
    .replace(/\[([^\]]+)\]\([^)]+\)/g, '$1')
    .replace(/<mark>/gi, '')
    .replace(/<\/mark>/gi, '')
    .replace(/\s+/g, ' ')
    .trim();
}

function parseDuckDuckGoMarkdown(md: string): ResearchHit[] {
  const results: ResearchHit[] = [];
  const blocks = md.split(/\n## /).slice(1);

  for (const block of blocks) {
    const titleMatch = block.match(
      /^\[([^\]]+)\]\(https?:\/\/duckduckgo\.com\/l\/\?uddg=([^&]+)/,
    );
    if (!titleMatch) continue;

    const title = cleanText(titleMatch[1] ?? '');
    let url = '';
    try {
      url = decodeURIComponent(titleMatch[2] ?? '');
    } catch {
      continue;
    }
    if (!/^https?:\/\//i.test(url)) continue;
    if (BLOCKED_URL_PARTS.some((p) => url.toLowerCase().includes(p))) continue;

    let host = '';
    try {
      host = new URL(url).hostname.replace(/^www\./, '');
    } catch {
      continue;
    }
    if (!isTrustedHost(host)) continue;

    // Snippet genellikle başlıktan sonraki [metin](ddg-link) satırında
    let snippet = '';
    const linkSnippets = [
      ...block.matchAll(/\[([^\]\n]{40,500})\]\(https?:\/\/duckduckgo\.com\/l\/\?/g),
    ];
    for (const sn of linkSnippets) {
      const raw = sn[1] ?? '';
      if (/!\[[^\]]*\]/.test(`[${raw}]`) || raw.includes('.ico')) continue;
      const candidate = cleanText(raw);
      if (
        candidate.length >= 40 &&
        !/^https?:/i.test(candidate) &&
        !/^[a-z0-9.-]+\.[a-z]{2,}(\/|$)/i.test(candidate)
      ) {
        snippet = candidate.slice(0, 280);
        break;
      }
    }

    if (snippet && snippet.toLocaleLowerCase('tr') === title.toLocaleLowerCase('tr')) {
      snippet = '';
    }
    if (results.some((r) => r.url === url)) continue;
    results.push({ title, snippet, url, host });
  }

  return results;
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

/**
 * Sorunun aynısını güvenilir sitelerde arar.
 * DuckDuckGo HTML sonucu Jina Reader üzerinden okunur (tarayıcı CORS kısıtı için).
 */
export async function searchTrustedWeb(question: string): Promise<ResearchHit[]> {
  const q = question.trim();
  if (q.length < 3) return [];

  const searchUrl =
    'http://html.duckduckgo.com/html/?q=' +
    encodeURIComponent(`${q} ${SITE_FILTER}`);

  const response = await fetchWithTimeout(`https://r.jina.ai/${searchUrl}`, 7000, {
    headers: { Accept: 'text/plain' },
  });
  if (!response?.ok) return [];

  const markdown = await response.text();
  return parseDuckDuckGoMarkdown(markdown).slice(0, 8);
}

export function formatResearchAnswer(
  question: string,
  hits: ResearchHit[],
  extraNote?: string,
): string {
  const lines = [
    `“${question}” sorusunu güvenilir sitelerde araştırdım:`,
    '',
  ];

  hits.slice(0, 6).forEach((hit, i) => {
    lines.push(`**${i + 1}. ${hit.title}**`);
    lines.push(`Kaynak: ${hit.host}`);
    if (hit.snippet) {
      lines.push(hit.snippet + (hit.snippet.length >= 280 ? '…' : ''));
    }
    lines.push(hit.url);
    lines.push('');
  });

  if (extraNote) {
    lines.push(extraNote);
    lines.push('');
  }

  lines.push('Not: Genel araştırma özetidir; kişisel fetva değildir.');
  return lines.join('\n').trim();
}
