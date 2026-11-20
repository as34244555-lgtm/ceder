import { Loader2 } from 'lucide-react';
import { formatCountdown } from '../hooks/useNextPrayer';
import { useRamadanCalendar } from '../hooks/useRamadanCalendar';
import type { RamadanCountdown } from '../hooks/useRamadanCountdown';
import { useFastingTracker } from '../hooks/useFastingTracker';
import { formatTime } from '../utils/time';
import type { DayPrayerTimes, LocationInfo, TimeFormat } from '../types';

interface RamadanScreenProps {
  location: LocationInfo | null;
  method: number;
  timeFormat: TimeFormat;
  today: DayPrayerTimes | null;
  countdown: RamadanCountdown | null;
}

export function RamadanScreen({ location, method, timeFormat, today, countdown }: RamadanScreenProps) {
  const isRamadan = today?.hijri.month === 9;
  const hijriYear = today?.hijri.year ?? null;
  const { days, loading, error } = useRamadanCalendar(location, method, hijriYear);
  const { getStatus, cycleStatus } = useFastingTracker();

  const kept = days.filter((d) => getStatus(d.dateISO) === 'tuttum').length;
  const missed = days.filter((d) => getStatus(d.dateISO) === 'tutamadim').length;

  return (
    <div className="w-full flex flex-col gap-4 fade-in-up">
      <div className="glass-card rounded-3xl p-6 flex flex-col items-center gap-3 text-center">
        <h2 className="text-sm uppercase tracking-[0.2em] text-[var(--text-secondary)]">
          Ramazan Modu
        </h2>
        {isRamadan && countdown ? (
          <>
            <p className="text-[var(--text-muted)] text-sm">
              Ramazan'ın {today?.hijri.day}. günü ·{' '}
              {countdown.phase === 'iftar' ? 'İftara kalan' : 'Sahura kalan'}
            </p>
            <p className="font-mono text-4xl font-bold text-gold-300 tabular-nums">
              {formatCountdown(countdown.msRemaining)}
            </p>
          </>
        ) : (
          <p className="text-[var(--text-muted)] text-sm max-w-sm">
            Şu anda Ramazan ayında değilsiniz. Aşağıda bu hicri yılın Ramazan ayına ait oruç
            takvimini önceden inceleyebilir veya geçmiş günlerinizi işaretleyebilirsiniz.
          </p>
        )}
      </div>

      <div className="glass-card rounded-2xl p-5 flex flex-col gap-4">
        <div className="flex items-center justify-between">
          <h3 className="text-sm font-semibold text-[var(--text-primary)]">30 Günlük Oruç Takvimi</h3>
          <span className="text-xs text-[var(--text-muted)]">
            {kept} tutuldu · {missed} tutulamadı
          </span>
        </div>

        {loading && (
          <div className="flex items-center justify-center gap-2 text-[var(--text-secondary)] py-6">
            <Loader2 className="h-4 w-4 animate-spin" /> Yükleniyor…
          </div>
        )}
        {error && <p className="text-red-300 text-sm text-center">{error}</p>}

        {!loading && !error && days.length > 0 && (
          <div className="grid grid-cols-5 sm:grid-cols-7 gap-2">
            {days.map((day) => {
              const status = getStatus(day.dateISO);
              const imsak = day.times.find((t) => t.key === 'imsak');
              const aksam = day.times.find((t) => t.key === 'aksam');
              return (
                <button
                  key={day.dateISO}
                  type="button"
                  onClick={() => cycleStatus(day.dateISO)}
                  title={
                    imsak && aksam
                      ? `İmsak ${formatTime(imsak.date, timeFormat)} · İftar ${formatTime(aksam.date, timeFormat)}`
                      : undefined
                  }
                  className={`flex flex-col items-center gap-0.5 rounded-xl py-2.5 text-xs transition ${
                    status === 'tuttum'
                      ? 'bg-[var(--accent-soft-bg)] border border-[var(--accent-soft-border)] text-[var(--accent-soft-text)]'
                      : status === 'tutamadim'
                        ? 'bg-red-500/10 border border-red-400/25 text-red-300'
                        : 'bg-[var(--surface-soft)] border border-[var(--border-soft)] text-[var(--text-secondary)]'
                  }`}
                >
                  <span className="font-semibold">{day.hijri.day}</span>
                  <span className="text-[10px] opacity-70">
                    {status === 'tuttum' ? '✓' : status === 'tutamadim' ? '✕' : '–'}
                  </span>
                </button>
              );
            })}
          </div>
        )}
        <p className="text-[11px] text-[var(--text-muted)]">
          Bir güne dokunarak sırayla "tuttum" → "tutamadım" → "işaretsiz" arasında geçiş
          yapabilirsiniz.
        </p>
      </div>
    </div>
  );
}
