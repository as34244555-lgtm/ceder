import { Moon, Sunrise } from 'lucide-react';
import { formatCountdown } from '../hooks/useNextPrayer';
import type { RamadanCountdown } from '../hooks/useRamadanCountdown';
import type { HijriDate } from '../types';

interface RamadanBannerProps {
  countdown: RamadanCountdown;
  hijri: HijriDate;
}

export function RamadanBanner({ countdown, hijri }: RamadanBannerProps) {
  const isIftar = countdown.phase === 'iftar';
  const Icon = isIftar ? Sunrise : Moon;

  return (
    <div className="w-full rounded-2xl px-4 py-4 flex items-center gap-4 bg-[var(--accent-soft-bg)] border border-[var(--accent-soft-border)] fade-in-up">
      <span className="flex h-11 w-11 shrink-0 items-center justify-center rounded-full bg-gold-400/20 text-gold-300">
        <Icon className="h-5 w-5" />
      </span>
      <div className="flex-1 min-w-0">
        <p className="text-xs uppercase tracking-wide text-[var(--text-muted)]">
          Ramazan'ın {hijri.day}. günü
        </p>
        <p className="text-sm font-semibold text-[var(--accent-soft-text)]">
          {isIftar ? 'İftara kalan süre' : 'Sahura (İmsak) kalan süre'}
        </p>
      </div>
      <span className="font-mono text-xl font-bold text-gold-300 tabular-nums shrink-0">
        {formatCountdown(countdown.msRemaining)}
      </span>
    </div>
  );
}
