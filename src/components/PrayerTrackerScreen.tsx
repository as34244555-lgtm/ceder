import { Check, Minus, Plus } from 'lucide-react';
import { TRACKABLE_PRAYERS, todayISO, usePrayerTracker } from '../hooks/usePrayerTracker';
import { useKazaCounter } from '../hooks/useKazaCounter';

export function PrayerTrackerScreen() {
  const { isChecked, toggle, weeklyStats, todayStats } = usePrayerTracker();
  const kaza = useKazaCounter();
  const iso = todayISO();

  const weeklyPct =
    weeklyStats.total > 0 ? Math.round((weeklyStats.completed / weeklyStats.total) * 100) : 0;

  return (
    <div className="w-full flex flex-col gap-4 fade-in-up">
      <div className="glass-card rounded-3xl p-6 flex flex-col items-center gap-4">
        <h2 className="text-sm uppercase tracking-[0.2em] text-[var(--text-secondary)]">
          Bugünkü Namazlarım
        </h2>
        <div className="grid grid-cols-5 gap-2 w-full">
          {TRACKABLE_PRAYERS.map(({ key, label }) => {
            const checked = isChecked(iso, key);
            return (
              <button
                key={key}
                type="button"
                onClick={() => toggle(iso, key)}
                className={`flex flex-col items-center gap-2 rounded-2xl py-3 transition ${
                  checked
                    ? 'bg-[var(--accent-soft-bg)] border border-[var(--accent-soft-border)]'
                    : 'bg-[var(--surface-soft)] border border-[var(--border-soft)]'
                }`}
              >
                <span
                  className={`flex h-8 w-8 items-center justify-center rounded-full ${
                    checked ? 'bg-emerald-400 text-night-950' : 'bg-[var(--surface-soft-strong)]'
                  }`}
                >
                  {checked && <Check className="h-4 w-4" strokeWidth={3} />}
                </span>
                <span className="text-[11px] text-[var(--text-secondary)]">{label}</span>
              </button>
            );
          })}
        </div>
        <p className="text-sm text-[var(--text-muted)]">
          Bugün {todayStats.completed}/{todayStats.total} vakit tamamlandı
        </p>
      </div>

      <div className="glass-card rounded-2xl p-5 flex flex-col gap-3">
        <div className="flex items-center justify-between">
          <h3 className="text-sm font-semibold text-[var(--text-primary)]">Son 7 Gün</h3>
          <span className="text-sm text-gold-300 font-semibold">%{weeklyPct}</span>
        </div>
        <div className="h-2 w-full rounded-full bg-[var(--surface-soft-strong)] overflow-hidden">
          <div
            className="h-full rounded-full bg-gradient-to-r from-gold-500 via-gold-400 to-gold-300"
            style={{ width: `${weeklyPct}%` }}
          />
        </div>
        <p className="text-xs text-[var(--text-muted)]">
          {weeklyStats.completed} / {weeklyStats.total} vakit kılındı
        </p>
      </div>

      <div className="glass-card rounded-2xl p-5 flex flex-col gap-4">
        <div className="flex items-center justify-between">
          <h3 className="text-sm font-semibold text-[var(--text-primary)]">Kaza Namazı Takibi</h3>
          <span className="text-xs text-[var(--text-muted)]">Toplam borç: {kaza.total}</span>
        </div>
        <div className="flex flex-col gap-2">
          {TRACKABLE_PRAYERS.map(({ key, label }) => (
            <div
              key={key}
              className="flex items-center justify-between rounded-xl bg-[var(--surface-soft)] px-3 py-2.5"
            >
              <span className="text-sm text-[var(--text-secondary)]">{label}</span>
              <div className="flex items-center gap-3">
                <button
                  type="button"
                  onClick={() => kaza.decrement(key)}
                  className="flex h-7 w-7 items-center justify-center rounded-full bg-[var(--surface-soft-strong)] hover:brightness-125 transition"
                  aria-label={`${label} kaza sayısını azalt`}
                >
                  <Minus className="h-3.5 w-3.5" />
                </button>
                <span className="w-6 text-center tabular-nums text-[var(--text-primary)] font-medium">
                  {kaza.getCount(key)}
                </span>
                <button
                  type="button"
                  onClick={() => kaza.increment(key)}
                  className="flex h-7 w-7 items-center justify-center rounded-full bg-[var(--surface-soft-strong)] hover:brightness-125 transition"
                  aria-label={`${label} kaza sayısını artır`}
                >
                  <Plus className="h-3.5 w-3.5" />
                </button>
              </div>
            </div>
          ))}
        </div>
        <p className="text-[11px] text-[var(--text-muted)]">
          Kılamadığınız vakitler için "+" ile borcunuzu kaydedin, kaza ettikçe "-" ile azaltın.
        </p>
      </div>
    </div>
  );
}
