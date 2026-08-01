import { matchReligiousFaq } from '../data/religiousFaq';
import { formatSaudiGroundedAnswer, searchSaudiIslamicSources } from './islamHouse';

export interface ChatMessage {
  id: string;
  role: 'user' | 'assistant' | 'system';
  content: string;
}

const DISCLAIMER =
  '\n\nNot: Bu cevap genel bilgidir; fetva yerine geçmez. Resmi ifta: https://alifta.gov.sa';

const GREETING_RE =
  /^(selam|selamun|selamün|selamu|asü|asu|merhaba|iyi günler|hayırlı)/i;

function isGreeting(text: string): boolean {
  const t = text.trim();
  if (t.length > 40) return false;
  return GREETING_RE.test(t);
}

function faqAnswer(question: string): string | null {
  const hit = matchReligiousFaq(question);
  if (!hit) return null;
  return `${hit.answer}${DISCLAIMER}`;
}

export type ReligiousAiSource = 'faq' | 'islamhouse' | 'faq+islamhouse' | 'greeting' | 'none';

/**
 * 1) Selam
 * 2) Yerel SSS (her zaman çalışır)
 * 3) İslam Evi kaynak linkleri (varsa eklenir)
 * 4) Sadece İslam Evi
 * 5) Bulunamadı
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
        'Aleykümselam. Sorunuzu yazın — önce hızlı cevap verir, ardından İslam Evi’nden kaynak linkleri eklerim.',
      source: 'greeting',
    };
  }

  const local = faqAnswer(trimmed);

  // İslam Evi'ni dene; başarısız olsa bile yerel cevap varsa onu göster
  let grounded: string | null = null;
  try {
    const { hits } = await searchSaudiIslamicSources(trimmed);
    grounded = formatSaudiGroundedAnswer(trimmed, hits);
  } catch {
    grounded = null;
  }

  if (local && grounded) {
    return {
      answer: `${local}\n\n---\n\n${grounded}`,
      source: 'faq+islamhouse',
    };
  }
  if (local) return { answer: local, source: 'faq' };
  if (grounded) return { answer: grounded, source: 'islamhouse' };

  return {
    answer:
      `“${trimmed}” için henüz net bir cevap bulamadım.\n\n` +
      'Daha iyi sonuç için kısa yazın: örn. **abdest**, **oruç diş macunu**, **teravih rekat**, **namaz kaza**.\n\n' +
      'Hazır sorulardan birini de seçebilirsiniz. Resmi ifta: https://alifta.gov.sa',
    source: 'none',
  };
}

export function createMessageId(): string {
  return `${Date.now()}-${Math.random().toString(36).slice(2, 8)}`;
}
