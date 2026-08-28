import { Check, X } from 'lucide-react';
import type { TrackablePrayerKey } from '../types';

interface PrayerCheckPromptProps {
  prayerKey: TrackablePrayerKey;
  prayerLabel: string;
  onPrayed: () => void;
  onMissed: () => void;
  onDismiss: () => void;
}

export function PrayerCheckPrompt({
  prayerLabel,
  onPrayed,
  onMissed,
  onDismiss,
}: PrayerCheckPromptProps) {
  return (
    <div className="fixed inset-0 z-50 flex items-end sm:items-center justify-center bg-black/70 backdrop-blur-sm p-4">
      <div className="w-full max-w-md glass-card rounded-3xl p-6 flex flex-col gap-4 fade-in-up">
        <div>
          <p className="text-xs uppercase tracking-[0.15em] text-gold-300 font-medium">
            Vakit hatırlatması
          </p>
          <h2 className="text-xl font-semibold text-[var(--text-primary)] mt-1">
            {prayerLabel} namazınızı kıldınız mı?
          </h2>
          <p className="text-sm text-[var(--text-muted)] mt-2 leading-relaxed">
            Evet derseniz bugünkü takipte bu vakit kılındı işaretlenir. Kılmadım derseniz kaza
            namazlarına eklenir.
          </p>
        </div>

        <div className="flex flex-col gap-2">
          <button
            type="button"
            onClick={onPrayed}
            className="flex items-center justify-center gap-2 w-full rounded-2xl bg-emerald-400/90 text-night-950 py-3.5 text-sm font-semibold hover:bg-emerald-300 transition"
          >
            <Check className="h-4 w-4" strokeWidth={3} />
            Evet, kıldım
          </button>
          <button
            type="button"
            onClick={onMissed}
            className="flex items-center justify-center gap-2 w-full rounded-2xl bg-[var(--surface-soft)] text-[var(--text-primary)] border border-[var(--border-soft)] py-3.5 text-sm font-semibold hover:bg-[var(--surface-soft-strong)] transition"
          >
            <X className="h-4 w-4" />
            Kılmadım (kazaya ekle)
          </button>
          <button
            type="button"
            onClick={onDismiss}
            className="w-full rounded-2xl py-2 text-xs text-[var(--text-muted)]"
          >
            Daha sonra
          </button>
        </div>
      </div>
    </div>
  );
}
