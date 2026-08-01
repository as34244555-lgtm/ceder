import { matchReligiousFaq } from '../data/religiousFaq';
import { formatSaudiGroundedAnswer, searchSaudiIslamicSources } from './islamHouse';

export interface ChatMessage {
  id: string;
  role: 'user' | 'assistant' | 'system';
  content: string;
}

const DISCLAIMER =
  '\n\nNot: Genel bilgidir; fetva değildir. https://alifta.gov.sa';

function isGreeting(text: string): boolean {
  const t = text.trim();
  if (t.length > 48) return false;
  return /^(selam|selamun|selamün|selamu|asü|asu|merhaba|iyi günler|hayırlı)/i.test(t);
}

export type ReligiousAiSource = 'faq' | 'islamhouse' | 'faq+islamhouse' | 'greeting' | 'none';

function withTimeout<T>(promise: Promise<T>, ms: number): Promise<T | null> {
  return new Promise((resolve) => {
    const timer = setTimeout(() => resolve(null), ms);
    promise
      .then((value) => {
        clearTimeout(timer);
        resolve(value);
      })
      .catch(() => {
        clearTimeout(timer);
        resolve(null);
      });
  });
}

/**
 * Serbest yazılan sorularda önce konu eşleştirmesi (anında),
 * sonra isteğe bağlı İslam Evi kaynakları.
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
        'Aleykümselam. Sorunuzu kendi cümlelerinizle yazın — örneğin “abdesti nasıl alırım?”, “oruçta diş macunu olur mu?”',
      source: 'greeting',
    };
  }

  const faq = matchReligiousFaq(trimmed);
  const local = faq ? `${faq.answer}${DISCLAIMER}` : null;

  if (local) {
    const remote = await withTimeout(
      searchSaudiIslamicSources(trimmed).then((r) =>
        formatSaudiGroundedAnswer(trimmed, r.hits),
      ),
      2000,
    );
    if (remote) {
      return { answer: `${local}\n\n---\n\n${remote}`, source: 'faq+islamhouse' };
    }
    return { answer: local, source: 'faq' };
  }

  const remote = await withTimeout(
    searchSaudiIslamicSources(trimmed).then((r) => formatSaudiGroundedAnswer(trimmed, r.hits)),
    2500,
  );
  if (remote) return { answer: remote, source: 'islamhouse' };

  return {
    answer:
      `“${trimmed}” için net bir konu yakalayamadım.\n\n` +
      'Cümlede şu kelimelerden birini kullan:\n' +
      '**abdest, gusül, namaz, farz, oruç, zekât, kaza, kıble, teravih, cuma, dua**\n\n' +
      'Örnek: “abdesti bozan şeyler neler?” / “sabah namazını kaçırdım ne yapayım?”',
    source: 'none',
  };
}

export function createMessageId(): string {
  return `${Date.now()}-${Math.random().toString(36).slice(2, 8)}`;
}
