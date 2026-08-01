import { matchReligiousFaq } from '../data/religiousFaq';
import { formatSaudiGroundedAnswer, searchSaudiIslamicSources } from './islamHouse';

export interface ChatMessage {
  id: string;
  role: 'user' | 'assistant' | 'system';
  content: string;
}

const DISCLAIMER =
  '\n\n_Not: Genel bilgidir; fetva değildir. https://alifta.gov.sa_';

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
 * Önce yerel SSS ile ANINDA cevap.
 * İslam Evi en fazla ~2.5 sn denenir; gelirse kaynak eklenir.
 * Ağ olmasa da SSS cevabı çalışır.
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
        'Aleykümselam. Sorunuzu yazın — hemen cevaplarım (abdest, namaz, oruç, zekât, gusül…).',
      source: 'greeting',
    };
  }

  const faq = matchReligiousFaq(trimmed);
  const local = faq ? `${faq.answer}${DISCLAIMER}` : null;

  // Yerel cevap varsa İslam Evi'ni bekletmeden döndür (kaynak için kısa dene)
  if (local) {
    const remote = await withTimeout(
      searchSaudiIslamicSources(trimmed).then((r) =>
        formatSaudiGroundedAnswer(trimmed, r.hits),
      ),
      2200,
    );
    if (remote) {
      return { answer: `${local}\n\n---\n\n${remote}`, source: 'faq+islamhouse' };
    }
    return { answer: local, source: 'faq' };
  }

  // SSS yoksa İslam Evi'ni dene
  const remote = await withTimeout(
    searchSaudiIslamicSources(trimmed).then((r) => formatSaudiGroundedAnswer(trimmed, r.hits)),
    2800,
  );
  if (remote) return { answer: remote, source: 'islamhouse' };

  return {
    answer:
      `“${trimmed}” için hazır cevabım yok.\n\n` +
      'Şunu dene:\n' +
      '• **abdest** / **gusül** / **namaz farzları**\n' +
      '• **oruç** / **diş macunu**\n' +
      '• **zekât** / **kaza namaz** / **teravih**\n' +
      '• veya aşağıdaki hazır sorulardan birini seç',
    source: 'none',
  };
}

export function createMessageId(): string {
  return `${Date.now()}-${Math.random().toString(36).slice(2, 8)}`;
}
