import { formatCountdown } from '../utils/iqamah';

interface IqamahBannerProps {
  label: string;
  msRemaining: number;
}

export function IqamahBanner({ label, msRemaining }: IqamahBannerProps) {
  return (
    <div className="w-full glass-card rounded-2xl px-4 py-3 flex items-center justify-between fade-in-up border border-gold-400/30">
      <div>
        <p className="text-[10px] uppercase tracking-[0.15em] text-gold-300">Kamet</p>
        <p className="text-sm text-[var(--text-primary)]">{label} kametine</p>
      </div>
      <p className="text-2xl font-semibold tabular-nums text-gold-300">
        {formatCountdown(msRemaining)}
      </p>
    </div>
  );
}
