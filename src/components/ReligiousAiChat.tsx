import { useEffect, useRef, useState } from 'react';
import { Bot, Loader2, Send, Sparkles, Trash2, User } from 'lucide-react';
import {
  askReligiousAi,
  createMessageId,
  type ChatMessage,
} from '../api/religiousAi';
import { matchReligiousFaq, SUGGESTED_QUESTIONS } from '../data/religiousFaq';

const WELCOME: ChatMessage = {
  id: 'welcome',
  role: 'assistant',
  content:
    'Selamün aleyküm. Ben **Dini Asistan**ım.\n\nAbdest, namaz, oruç, zekât, gusül gibi sorularınıza **hemen** cevap veririm. İsterseniz İslam Evi kaynak linklerini de eklerim.\n\nAşağıdan hazır soru seçin veya kendi sorunuzu yazın.',
};

function renderContent(text: string) {
  const cleaned = text.replace(/_([^_\n]+)_/g, '$1');
  const parts = cleaned.split(/(\*\*[^*]+\*\*|https?:\/\/[^\s]+)/g);
  return parts.map((part, i) => {
    if (!part) return null;
    if (part.startsWith('**') && part.endsWith('**')) {
      return (
        <strong key={i} className="font-semibold text-[var(--text-primary)]">
          {part.slice(2, -2)}
        </strong>
      );
    }
    if (/^https?:\/\//.test(part)) {
      return (
        <a
          key={i}
          href={part}
          target="_blank"
          rel="noopener noreferrer"
          className="underline break-all text-gold-300/90 hover:text-gold-300"
        >
          {part}
        </a>
      );
    }
    return <span key={i}>{part}</span>;
  });
}

export function ReligiousAiChat() {
  const [messages, setMessages] = useState<ChatMessage[]>([WELCOME]);
  const [input, setInput] = useState('');
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const bottomRef = useRef<HTMLDivElement>(null);
  const inputRef = useRef<HTMLTextAreaElement>(null);

  useEffect(() => {
    bottomRef.current?.scrollIntoView({ behavior: 'smooth', block: 'end' });
  }, [messages, loading]);

  const send = async (raw: string) => {
    const question = raw.trim();
    if (!question || loading) return;

    setError(null);
    setInput('');
    const userMsg: ChatMessage = {
      id: createMessageId(),
      role: 'user',
      content: question,
    };
    setMessages((prev) => [...prev, userMsg]);

    // Yerel SSS varsa anında göster (kullanıcı beklemesin)
    const instant = matchReligiousFaq(question);
    if (instant) {
      const instantId = createMessageId();
      setMessages((prev) => [
        ...prev,
        {
          id: instantId,
          role: 'assistant',
          content: `${instant.answer}\n\n_Kaynaklar kontrol ediliyor…_`,
        },
      ]);
      setLoading(true);
      try {
        const { answer } = await askReligiousAi(question);
        setMessages((prev) =>
          prev.map((m) => (m.id === instantId ? { ...m, content: answer } : m)),
        );
      } catch (err) {
        setMessages((prev) =>
          prev.map((m) =>
            m.id === instantId
              ? {
                  ...m,
                  content: `${instant.answer}\n\n_Not: Genel bilgidir; fetva değildir._`,
                }
              : m,
          ),
        );
        setError(err instanceof Error ? err.message : 'Ek kaynak alınamadı');
      } finally {
        setLoading(false);
        inputRef.current?.focus();
      }
      return;
    }

    setLoading(true);
    try {
      const { answer } = await askReligiousAi(question);
      setMessages((prev) => [
        ...prev,
        { id: createMessageId(), role: 'assistant', content: answer },
      ]);
    } catch (err) {
      setError(err instanceof Error ? err.message : 'Yanıt alınamadı');
    } finally {
      setLoading(false);
      inputRef.current?.focus();
    }
  };

  return (
    <div className="w-full flex flex-col gap-3 fade-in-up min-h-[60vh]">
      <div className="glass-card rounded-2xl px-4 py-3 flex items-start gap-3">
        <span className="flex h-10 w-10 shrink-0 items-center justify-center rounded-xl bg-gold-400/15 text-gold-300">
          <Sparkles className="h-5 w-5" />
        </span>
        <div className="min-w-0 flex-1">
          <p className="text-sm font-medium text-[var(--text-primary)]">Anında cevap + kaynak</p>
          <p className="text-xs text-[var(--text-muted)] mt-0.5 leading-relaxed">
            Önce hemen cevaplanır; varsa İslam Evi linkleri eklenir. Kayıt gerekmez.
          </p>
        </div>
        <button
          type="button"
          onClick={() => {
            setMessages([WELCOME]);
            setError(null);
            setInput('');
          }}
          className="shrink-0 rounded-lg p-2 text-[var(--text-muted)] hover:text-[var(--text-primary)] hover:bg-[var(--surface-soft)] transition"
          aria-label="Sohbeti temizle"
        >
          <Trash2 className="h-4 w-4" />
        </button>
      </div>

      <div className="glass-card rounded-2xl p-3 sm:p-4 flex flex-col gap-3 flex-1 min-h-[420px] max-h-[min(62vh,640px)] overflow-y-auto">
        {messages.map((msg) => {
          const isUser = msg.role === 'user';
          return (
            <div
              key={msg.id}
              className={`flex gap-2.5 ${isUser ? 'flex-row-reverse' : 'flex-row'}`}
            >
              <span
                className={`flex h-8 w-8 shrink-0 items-center justify-center rounded-full ${
                  isUser
                    ? 'bg-gold-400/20 text-gold-300'
                    : 'bg-[var(--accent-soft-bg)] text-[var(--accent-soft-text)]'
                }`}
              >
                {isUser ? <User className="h-4 w-4" /> : <Bot className="h-4 w-4" />}
              </span>
              <div
                className={`max-w-[85%] rounded-2xl px-3.5 py-2.5 text-sm leading-relaxed whitespace-pre-wrap ${
                  isUser
                    ? 'bg-gold-400/90 text-night-950 rounded-tr-md'
                    : 'bg-[var(--surface-soft)] text-[var(--text-secondary)] rounded-tl-md'
                }`}
              >
                {renderContent(msg.content)}
              </div>
            </div>
          );
        })}

        {loading && (
          <div className="flex gap-2.5 items-center text-xs text-[var(--text-muted)] pl-10">
            <Loader2 className="h-4 w-4 animate-spin text-gold-400" />
            Kaynaklar kontrol ediliyor…
          </div>
        )}
        <div ref={bottomRef} />
      </div>

      {error && (
        <p className="text-xs text-red-300/90 bg-red-500/10 border border-red-500/20 rounded-xl px-3 py-2">
          {error}
        </p>
      )}

      <div className="flex gap-2 overflow-x-auto pb-1 -mx-1 px-1">
        {SUGGESTED_QUESTIONS.map((q) => (
          <button
            key={q}
            type="button"
            disabled={loading}
            onClick={() => void send(q)}
            className="shrink-0 rounded-full px-3 py-1.5 text-xs bg-[var(--surface-soft)] text-[var(--text-secondary)] border border-[var(--border-soft)] hover:bg-[var(--surface-soft-strong)] transition disabled:opacity-40"
          >
            {q}
          </button>
        ))}
      </div>

      <form
        className="flex gap-2 items-end"
        onSubmit={(e) => {
          e.preventDefault();
          void send(input);
        }}
      >
        <textarea
          ref={inputRef}
          value={input}
          onChange={(e) => setInput(e.target.value)}
          onKeyDown={(e) => {
            if (e.key === 'Enter' && !e.shiftKey) {
              e.preventDefault();
              void send(input);
            }
          }}
          rows={2}
          placeholder="Örn: abdest nasıl alınır?"
          disabled={loading}
          className="flex-1 resize-none rounded-2xl bg-[var(--surface-soft)] border border-[var(--border-soft)] px-4 py-3 text-sm text-[var(--text-primary)] placeholder:text-[var(--text-faint)] outline-none focus:border-gold-400/50 disabled:opacity-50"
        />
        <button
          type="submit"
          disabled={loading || !input.trim()}
          className="shrink-0 h-11 w-11 rounded-2xl bg-gold-400/90 text-night-950 flex items-center justify-center hover:bg-gold-300 transition disabled:opacity-40"
          aria-label="Gönder"
        >
          {loading ? <Loader2 className="h-4 w-4 animate-spin" /> : <Send className="h-4 w-4" />}
        </button>
      </form>
    </div>
  );
}
