import { matchReligiousFaq } from '../data/religiousFaq';

export interface ChatMessage {
  id: string;
  role: 'user' | 'assistant' | 'system';
  content: string;
}

export const RELIGIOUS_SYSTEM_PROMPT = `Sen "Ezan Vakti" uygulamasının Dini Asistanısın. Türkçe konuşursun.

Kurallar:
1. Yalnızca İslamî ilim, ibadet, ahlak, Kur’an-Hadis kültürü ve günlük dinî pratik hakkında yardım et.
2. Cevapların kısa, net ve saygılı olsun. Gerekirse maddeler kullan.
3. Ana çizgi olarak Ehl-i Sünnet / Diyanet İşleri Başkanlığı’na yakın, yaygın kabul gören bilgileri özetle. Mezhep farkı kritikse belirt.
4. Her cevapta şunu unutturma: Bu bir yapay zeka özetidir; fetva değildir. Kişisel hüküm, şüpheli veya özel durumlarda müftülük / ehil bir âlime danışılmalıdır.
5. Tıp, hukuk, siyaset, kehanet, büyü, tarikat tartışması veya İslam dışı inanç propagandası isteklerini nazikçe reddet.
6. Ayet/hadis naklediyorsan mümkünse meal/kaynak belirt; uydurma rivayet uydurma.
7. Kullanıcı selam verirse kısa selamla karşılık ver, ardından yardımcı ol.`;

const DISCLAIMER =
  '\n\nNot: Bu cevap yapay zeka destekli genel bilgidir; fetva yerine geçmez.';

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

async function askPuter(question: string, history: ChatMessage[]): Promise<string> {
  const puter = await loadPuter();
  const messages = [
    { role: 'system', content: RELIGIOUS_SYSTEM_PROMPT },
    ...history
      .filter((m) => m.role === 'user' || m.role === 'assistant')
      .slice(-8)
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
    // Model adı değişmiş olabilir; varsayılan modele düş.
    result = await puter.ai.chat(messages, { stream: false });
  }

  const text = extractText(result);
  if (!text) throw new Error('Boş yanıt');
  return text.includes('fetva') ? text : `${text}${DISCLAIMER}`;
}

async function askGemini(question: string, history: ChatMessage[]): Promise<string> {
  const key = import.meta.env.VITE_GEMINI_API_KEY as string | undefined;
  if (!key) throw new Error('Gemini anahtarı yok');

  const contents = [
    ...history
      .filter((m) => m.role === 'user' || m.role === 'assistant')
      .slice(-8)
      .map((m) => ({
        role: m.role === 'assistant' ? 'model' : 'user',
        parts: [{ text: m.content }],
      })),
    { role: 'user', parts: [{ text: question }] },
  ];

  const response = await fetch(
    `https://generativelanguage.googleapis.com/v1beta/models/gemini-2.0-flash:generateContent?key=${encodeURIComponent(key)}`,
    {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({
        system_instruction: { parts: [{ text: RELIGIOUS_SYSTEM_PROMPT }] },
        contents,
        generationConfig: { temperature: 0.4, maxOutputTokens: 1024 },
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
  return `${hit.answer}${DISCLAIMER}`;
}

/**
 * Önce isteğe bağlı Gemini anahtarı, sonra Puter (kullanıcı-ödemeli, ücretsiz entegrasyon),
 * olmazsa yerel SSS. Böylece anahtarsız da çalışır.
 */
export async function askReligiousAi(
  question: string,
  history: ChatMessage[] = [],
): Promise<{ answer: string; source: 'gemini' | 'puter' | 'faq' }> {
  const trimmed = question.trim();
  if (!trimmed) throw new Error('Soru boş');

  if (import.meta.env.VITE_GEMINI_API_KEY) {
    try {
      const answer = await askGemini(trimmed, history);
      return { answer, source: 'gemini' };
    } catch {
      // Diğer kanallara düş
    }
  }

  try {
    const answer = await askPuter(trimmed, history);
    return { answer, source: 'puter' };
  } catch {
    const local = faqAnswer(trimmed);
    if (local) return { answer: local, source: 'faq' };
    throw new Error(
      'Yapay zeka şu an yanıt veremedi. İnternet bağlantınızı kontrol edin veya önerilen sorulardan birini deneyin. İlk kullanımda Puter oturum penceresini onaylamanız gerekebilir.',
    );
  }
}

export function createMessageId(): string {
  return `${Date.now()}-${Math.random().toString(36).slice(2, 8)}`;
}
