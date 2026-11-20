import { useMemo } from 'react';
import { AlertTriangle } from 'lucide-react';
import { getActiveKerahatWindow, getKerahatWindows } from '../utils/kerahat';
import type { DayPrayerTimes } from '../types';

interface KerahatBadgeProps {
  today: DayPrayerTimes | null;
  now: Date;
}

export function KerahatBadge({ today, now }: KerahatBadgeProps) {
  const active = useMemo(() => {
    const windows = getKerahatWindows(today);
    return getActiveKerahatWindow(windows, now);
  }, [today, now]);

  if (!active) return null;

  return (
    <div className="w-full rounded-2xl px-4 py-3 flex items-center gap-3 bg-red-500/10 border border-red-400/25 fade-in-up">
      <AlertTriangle className="h-5 w-5 text-red-300 shrink-0" />
      <div className="flex flex-col">
        <span className="text-sm font-semibold text-red-200">
          Kerahat vakti: {active.label}
        </span>
        <span className="text-xs text-[var(--text-muted)]">
          Bu aralıkta (yaklaşık) namaz kılınması mekruh görülür; farz namaz kılınacaksa bu
          vaktin çıkması beklenmelidir.
        </span>
      </div>
    </div>
  );
}
