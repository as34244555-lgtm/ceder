import { matchReligiousFaq } from '../data/religiousFaq';
import {
  formatSaudiGroundedAnswer,
  searchSaudiIslamicSources,
  type SaudiSourceHit,
} from './islamHouse';

export interface ChatMessage {
  id: string;
  role: 'user' | 'assistant' | 'system';
  content: string;
}

export const RELIGIOUS_SYSTEM_PROMPT = `Sen "Ezan Vakti" uygulamasının Dini Asistanısın. Türkçe konuşursun.

Kurallar:
1. Yalnızca İslamî ilim, ibadet, ahlak, Kur’an-Hadis ve günlük dinî pratik hakkında yardım et.
2. Cevapların kısa, net ve saygılı olsun. Gerekirse maddeler kullan.
3. Sana verilen "Suudi kaynak özetleri" (İslam Evi / islamhouse.com — Suudi Arabistan İslam İşleri Bakanlığı yayını) varsa ÖNCE onlara dayan. Kaynak başlık ve linklerini belirt.
4. Kaynak yoksa Ehl-i Sünnet çizgisinde genel bilgi ver; uydurma rivayet yazma.
5. Her cevapta belirt: Bu bir özet/yardımcıdır; fetva değildir. Şüpheli veya kişisel durumlarda https://alifta.gov.sa veya yerel müftülüğe danışılmalıdır.
6. Tıp, hukuk, siyaset, kehanet, büyü ve İslam dışı propaganda isteklerini reddet.
7. Selamı kısa karşıla, sonra yardımcı ol.`;

const DISCLAIMER =
  '\n\nNot: Bu cevap yapay zeka / kaynak özetidir; fetva yerine geçmez. Resmi ifta: https://alifta.gov.sa';

type PuterChatResult =
  | string
  | {
      message?: { content?: string } | string;
      text?: string;
      content?: string;
    };

interface PuterAi {
  chat: (
    prompt: string | { role: string; content: string }[],
    options?: Record<string, unknown>,
  ) => Promise<PuterChatResult>;
}

interface PuterGlobal {
  ai: PuterAi;
}

declare global {
  interface Window {
    puter?: PuterGlobal;
  }
}

let puterLoader: Promise<PuterGlobal> | null = null;

function loadPuter(): Promise<PuterGlobal> {
  if (typeof window === 'undefined') {
    return Promise.reject(new Error('Tarayıcı gerekli'));
  }
  if (window.puter?.ai?.chat) return Promise.resolve(window.puter);
  if (puterLoader) return puterLoader;

  puterLoader = new Promise((resolve, reject) => {
    const existing = document.querySelector<HTMLScriptElement>('script[data-puter]');
    if (existing && window.puter?.ai?.chat) {
      resolve(window.puter);
      return;
    }

    const script = document.createElement('script');
    script.src = 'https://js.puter.com/v2/';
    script.async = true;
    script.dataset.puter = 'true';
    script.onload = () => {
      if (window.puter?.ai?.chat) resolve(window.puter);
      else reject(new Error('Puter AI yüklenemedi'));
    };
    script.onerror = () => {
      puterLoader = null;
      reject(new Error('Puter betiği yüklenemedi'));
    };
    document.head.appendChild(script);
  });

  return puterLoader;
}

function extractText(result: PuterChatResult): string {
  if (typeof result === 'string') return result.trim();
  if (!result || typeof result !== 'object') return '';

  if (typeof result.text === 'string') return result.text.trim();
  if (typeof result.content === 'string') return result.content.trim();

  const message = result.message;
  if (typeof message === 'string') return message.trim();
  if (message && typeof message === 'object' && typeof message.content === 'string') {
    return message.content.trim();
  }

  return '';
}

function buildSourceContext(hits: SaudiSourceHit[]): string {
  if (hits.length === 0) return 'Suudi kaynak özeti bulunamadı.';
  return hits
    .slice(0, 5)
    .map(
      (h, i) =>
        `${i + 1}. [${h.type}] ${h.title}\nÖzet: ${h.snippet || '(özet yok)'}\nLink: ${h.url}`,
    )
    .join('\n\n');
}

async function askPuter(
  question: string,
  history: ChatMessage[],
  sourceContext: string,
): Promise<string> {
  const puter = await loadPuter();
  const messages = [
    { role: 'system', content: RELIGIOUS_SYSTEM_PROMPT },
    {
      role: 'system',
      content: `Suudi İslam İşleri Bakanlığı / İslam Evi araştırma sonuçları:\n${sourceContext}`,
    },
    ...history
      .filter((m) => m.role === 'user' || m.role === 'assistant')
      .slice(-6)
      .map((m) => ({ role: m.role, content: m.content })),
    { role: 'user', content: question },
  ];

  let result: PuterChatResult;
  try {
    result = await puter.ai.chat(messages, {
      model: 'openai/gpt-4o-mini',
      stream: false,
    });
  } catch {
    result = await puter.ai.chat(messages, { stream: false });
  }

  const text = extractText(result);
  if (!text) throw new Error('Boş yanıt');
  return text.includes('fetva') ? text : `${text}${DISCLAIMER}`;
}

async function askGemini(
  question: string,
  history: ChatMessage[],
  sourceContext: string,
): Promise<string> {
  const key = import.meta.env.VITE_GEMINI_API_KEY as string | undefined;
  if (!key) throw new Error('Gemini anahtarı yok');

  const contents = [
    ...history
      .filter((m) => m.role === 'user' || m.role === 'assistant')
      .slice(-6)
      .map((m) => ({
        role: m.role === 'assistant' ? 'model' : 'user',
        parts: [{ text: m.content }],
      })),
    {
      role: 'user',
      parts: [
        {
          text: `Kaynaklar:\n${sourceContext}\n\nSoru: ${question}`,
        },
      ],
    },
  ];

  const response = await fetch(
    `https://generativelanguage.googleapis.com/v1beta/models/gemini-2.0-flash:generateContent?key=${encodeURIComponent(key)}`,
    {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({
        system_instruction: { parts: [{ text: RELIGIOUS_SYSTEM_PROMPT }] },
        contents,
        generationConfig: { temperature: 0.3, maxOutputTokens: 1024 },
      }),
    },
  );

  if (!response.ok) throw new Error(`Gemini hata: ${response.status}`);
  const json = (await response.json()) as {
    candidates?: { content?: { parts?: { text?: string }[] } }[];
  };
  const text = json.candidates?.[0]?.content?.parts?.map((p) => p.text ?? '').join('').trim();
  if (!text) throw new Error('Gemini boş yanıt');
  return text.includes('fetva') ? text : `${text}${DISCLAIMER}`;
}

function faqAnswer(question: string): string | null {
  const hit = matchReligiousFaq(question);
  if (!hit) return null;
  return `${hit.answer}\n\nKaynak notu: Hızlı yerel özet. Daha ayrıntı için İslam Evi (islamhouse.com) ve https://alifta.gov.sa incelenebilir.${DISCLAIMER}`;
}

export type ReligiousAiSource = 'faq' | 'islamhouse' | 'gemini' | 'puter';

/**
 * Hız öncelikli akış (Suudi kaynak odaklı):
 * 1) İslam Evi araması (~20–40 ms) — Suudi İslam İşleri Bakanlığı yayınları
 * 2) Yerel SSS (anında yedek)
 * 3) AI ile kaynaklara dayalı sentez (Gemini / Puter)
 */
export async function askReligiousAi(
  question: string,
  history: ChatMessage[] = [],
): Promise<{ answer: string; source: ReligiousAiSource }> {
  const trimmed = question.trim();
  if (!trimmed) throw new Error('Soru boş');

  // 1) Suudi İslam Evi araştırması (hızlı)
  const { hits } = await searchSaudiIslamicSources(trimmed);
  const grounded = formatSaudiGroundedAnswer(trimmed, hits);
  const richEnough =
    hits.some((h) => h.type === 'fatwa') ||
    hits.filter((h) => h.snippet.length >= 40).length >= 1 ||
    hits.length >= 2;

  if (grounded && richEnough) {
    return { answer: grounded, source: 'islamhouse' };
  }

  // 2) Yerel SSS yedeği
  const local = faqAnswer(trimmed);
  if (local) return { answer: local, source: 'faq' };

  const sourceContext = buildSourceContext(hits);

  // 3) AI sentezi (kaynak bağlamıyla)
  if (import.meta.env.VITE_GEMINI_API_KEY) {
    try {
      const answer = await askGemini(trimmed, history, sourceContext);
      return { answer, source: 'gemini' };
    } catch {
      // devam
    }
  }

  try {
    const answer = await askPuter(trimmed, history, sourceContext);
    return { answer, source: 'puter' };
  } catch {
    if (grounded) return { answer: grounded, source: 'islamhouse' };
    throw new Error(
      'Kaynaklara ulaşılamadı. İnterneti kontrol edin veya önerilen sorulardan birini deneyin.',
    );
  }
}

export function createMessageId(): string {
  return `${Date.now()}-${Math.random().toString(36).slice(2, 8)}`;
}
