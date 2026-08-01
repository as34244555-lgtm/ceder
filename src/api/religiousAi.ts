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
  return `${hit.answer}\n\nDaha ayrıntı için İslam Evi (islamhouse.com) ve https://alifta.gov.sa incelenebilir.${DISCLAIMER}`;
}

function notFoundAnswer(question: string): string {
  return (
    `“${question}” için İslam Evi’nde yeterince net bir Türkçe kaynak bulamadım.\n\n` +
    'Şunları deneyebilirsiniz:\n' +
    '• Soruyu daha kısa yazın (ör. “oruç diş macunu”, “sabah namazı kaza”)\n' +
    '• Aşağıdaki hazır sorulardan birini seçin\n' +
    '• Resmi ifta: https://alifta.gov.sa\n' +
    '• İslam Evi araması: https://islamhouse.com/tr/search/'
  );
}

export type ReligiousAiSource = 'faq' | 'islamhouse' | 'greeting' | 'none';

/**
 * Puter/kayıt ekranı olmadan:
 * 1) Selam
 * 2) Yerel SSS (hızlı, doğru)
 * 3) İslam Evi — yalnızca alakalı sonuçlar
 * 4) Anlaşılır “bulunamadı” mesajı
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
        'Aleykümselam. Dini sorunuzu yazabilirsiniz — İslam Evi (Suudi İslam İşleri Bakanlığı yayınları) üzerinden araştırıp kaynaklı cevaplarım.',
      source: 'greeting',
    };
  }

  // Yerel SSS önce: hazır/benzer sorularda anında doğru cevap
  const local = faqAnswer(trimmed);
  if (local) return { answer: local, source: 'faq' };

  // İslam Evi — alakasız sonuçlar elenir
  const { hits } = await searchSaudiIslamicSources(trimmed);
  const grounded = formatSaudiGroundedAnswer(trimmed, hits);
  if (grounded) return { answer: grounded, source: 'islamhouse' };

  return { answer: notFoundAnswer(trimmed), source: 'none' };
}

export function createMessageId(): string {
  return `${Date.now()}-${Math.random().toString(36).slice(2, 8)}`;
}
