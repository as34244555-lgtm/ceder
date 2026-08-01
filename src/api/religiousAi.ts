import { matchReligiousFaq } from '../data/religiousFaq';
import { searchIslamHouseExact } from './islamHouse';
import { formatResearchAnswer, searchTrustedWeb, type ResearchHit } from './webResearch';

export interface ChatMessage {
  id: string;
  role: 'user' | 'assistant' | 'system';
  content: string;
}

function isGreeting(text: string): boolean {
  const t = text.trim();
  if (t.length > 48) return false;
  return /^(selam|selamun|selamün|selamu|asü|asu|merhaba|iyi günler|hayırlı)/i.test(t);
}

export type ReligiousAiSource = 'web' | 'web+faq' | 'faq' | 'greeting' | 'none';

function dedupeHits(hits: ResearchHit[]): ResearchHit[] {
  const seen = new Set<string>();
  const out: ResearchHit[] = [];
  for (const hit of hits) {
    const key = hit.url.replace(/\/$/, '').toLowerCase();
    if (seen.has(key)) continue;
    seen.add(key);
    out.push(hit);
  }
  return out;
}

/**
 * Sorunun aynısını güvenilir sitelerde araştırır:
 * - İslam Evi (doğrudan API)
 * - Diyanet / Sorularla İslamiyet / Fetva.net / Dinimiz İslam vb. (web araması)
 */
export async function askReligiousAi(
  question: string,
  _history: ChatMessage[] = [],
): Promise<{ answer: string; source: ReligiousAiSource }> {
  const trimmed = question.trim();
  if (!trimmed) throw new Error('Soru boş');

  if (isGreeting(trimmed)) {
    return {
      answer:
        'Aleykümselam. Sorunuzu kendi cümlelerinizle yazın — sorunun aynısını güvenilir sitelerde araştırırım.',
      source: 'greeting',
    };
  }

  const [islamHouseHits, webHits] = await Promise.all([
    searchIslamHouseExact(trimmed),
    searchTrustedWeb(trimmed),
  ]);

  // Önce web (çeşitli güvenilir siteler), sonra İslam Evi — tekrarları ayıkla
  const hits = dedupeHits([...webHits, ...islamHouseHits]).slice(0, 6);
  const faq = matchReligiousFaq(trimmed);

  if (hits.length > 0) {
    const faqNote = faq
      ? `Kısa özet: ${faq.answer.split('\n')[0]?.slice(0, 220) ?? ''}`
      : undefined;
    return {
      answer: formatResearchAnswer(trimmed, hits, faqNote),
      source: faq ? 'web+faq' : 'web',
    };
  }

  if (faq) {
    return {
      answer:
        `${faq.answer}\n\n` +
        'İnternette ek kaynak şu an bulunamadı. Daha spesifik yazıp tekrar deneyebilirsiniz.\n\n' +
        'Not: Genel bilgidir; fetva değildir.',
      source: 'faq',
    };
  }

  return {
    answer:
      `“${trimmed}” için güvenilir sitelerde net bir sonuç bulamadım.\n\n` +
      'Soruyu biraz daha açık yazmayı deneyin (ör. “abdest nasıl alınır?”, “diş macunu orucu bozar mı?”).\n\n' +
      'Araştırdığım siteler: Diyanet, İslam Evi, Sorularla İslamiyet, Fetva.net, Dinimiz İslam.',
    source: 'none',
  };
}

export function createMessageId(): string {
  return `${Date.now()}-${Math.random().toString(36).slice(2, 8)}`;
}
