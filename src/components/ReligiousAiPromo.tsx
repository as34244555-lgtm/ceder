import { MessageCircleQuestion } from 'lucide-react';

interface ReligiousAiPromoProps {
  onOpen: () => void;
}

/** Ana ekranda benzersiz AI özelliğini öne çıkaran kısa çağrı. */
export function ReligiousAiPromo({ onOpen }: ReligiousAiPromoProps) {
  return (
    <button
      type="button"
      onClick={onOpen}
      className="glass-card rounded-2xl p-4 w-full text-left fade-in-up hover:bg-[var(--surface-soft-strong)] transition group"
    >
      <div className="flex items-center gap-3">
        <span className="flex h-11 w-11 shrink-0 items-center justify-center rounded-xl bg-gold-400/15 text-gold-300 group-hover:bg-gold-400/25 transition">
          <MessageCircleQuestion className="h-5 w-5" />
        </span>
        <div className="min-w-0 flex-1">
          <div className="flex items-center gap-2">
            <p className="text-sm font-semibold text-[var(--text-primary)]">Dini Asistan</p>
            <span className="text-[10px] px-1.5 py-0.5 rounded-md bg-gold-400/20 text-gold-300 font-medium">
              Araştır
            </span>
          </div>
          <p className="text-xs text-[var(--text-muted)] mt-0.5">
            Sorunuzu güvenilir sitelerde araştırır, kaynak linklerini gösterir.
          </p>
        </div>
      </div>
    </button>
  );
}
