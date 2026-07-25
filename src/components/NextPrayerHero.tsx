import { formatCountdown } from '../hooks/useNextPrayer';
import type { PrayerTime } from '../types';
import { PRAYER_ICONS } from './prayerIcons';

interface NextPrayerHeroProps {
  current: PrayerTime | null;
  next: PrayerTime | null;
  msRemaining: number | null;
  now: Date;
}

export function NextPrayerHero({ current, next, msRemaining, now }: NextPrayerHeroProps) {
  if (!next || msRemaining === null) {
    return (
      <div className="glass-card rounded-3xl p-8 w-full text-center text-emerald-100/70 fade-in-up">
        Vakitler yükleniyor…
      </div>
    );
  }

  const Icon = PRAYER_ICONS[next.key];

  let progressPct = 0;
  if (current) {
    const total = next.date.getTime() - current.date.getTime();
    const elapsed = now.getTime() - current.date.getTime();
    progressPct = Math.min(100, Math.max(0, (elapsed / total) * 100));
  }

  return (
    <div className="relative glass-card rounded-3xl p-6 sm:p-10 w-full text-center overflow-hidden fade-in-up">
      <div
        className="absolute inset-0 -z-10 opacity-40"
        style={{
          background:
            'radial-gradient(circle at 50% 0%, rgba(242,193,78,0.25), transparent 60%)',
        }}
      />
      <p className="text-emerald-200/70 text-sm uppercase tracking-[0.2em] mb-3">
        {current ? `Şu an: ${current.label}` : 'Sıradaki vakit'} · Kalan Süre
      </p>

      <div className="flex items-center justify-center gap-3 mb-2">
        <span className="flex h-14 w-14 sm:h-16 sm:w-16 items-center justify-center rounded-2xl bg-gold-400/15 text-gold-300 pulse-glow">
          <Icon className="h-7 w-7 sm:h-8 sm:w-8" strokeWidth={1.75} />
        </span>
        <h2 className="text-3xl sm:text-4xl font-semibold text-white">{next.label}</h2>
      </div>

      <div className="font-mono text-5xl sm:text-6xl font-bold tracking-wider text-gold-300 my-4 tabular-nums">
        {formatCountdown(msRemaining)}
      </div>

      <p className="text-emerald-100/60 text-sm">
        {next.date.toLocaleTimeString('tr-TR', { hour: '2-digit', minute: '2-digit' })} vaktinde
        {next.isAdhan ? ' ezan okunacak' : ' güneş doğacak'}
      </p>

      <div className="mt-6 h-2 w-full rounded-full bg-white/10 overflow-hidden">
        <div
          className="h-full rounded-full bg-gradient-to-r from-gold-500 via-gold-400 to-gold-300 transition-[width] duration-1000 ease-linear"
          style={{ width: `${progressPct}%` }}
        />
      </div>
    </div>
  );
}
