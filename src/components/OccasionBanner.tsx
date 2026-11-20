import type { IslamicOccasion } from '../data/islamicOccasions';

interface OccasionBannerProps {
  occasion: IslamicOccasion;
}

export function OccasionBanner({ occasion }: OccasionBannerProps) {
  return (
    <div className="w-full rounded-2xl px-4 py-3 flex items-center gap-3 bg-[var(--accent-soft-bg)] border border-[var(--accent-soft-border)] fade-in-up">
      <span className="text-2xl leading-none">{occasion.emoji}</span>
      <div className="flex flex-col">
        <span className="text-sm font-semibold text-[var(--accent-soft-text)]">
          Bugün {occasion.name}
        </span>
        {occasion.description && (
          <span className="text-xs text-[var(--text-muted)]">{occasion.description}</span>
        )}
      </div>
    </div>
  );
}
