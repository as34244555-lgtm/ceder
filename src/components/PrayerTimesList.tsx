import type { PrayerTime, TimeFormat } from '../types';
import { PRAYER_ICONS } from './prayerIcons';
import { formatTime } from '../utils/time';

interface PrayerTimesListProps {
  times: PrayerTime[];
  currentKeyId: string | null;
  timeFormat: TimeFormat;
}

export function PrayerTimesList({ times, currentKeyId, timeFormat }: PrayerTimesListProps) {
  return (
    <div className="grid grid-cols-2 sm:grid-cols-3 lg:grid-cols-6 gap-3 w-full">
      {times.map((time) => {
        const Icon = PRAYER_ICONS[time.key];
        const id = `${time.key}-${time.date.toDateString()}`;
        const isActive = id === currentKeyId;

        return (
          <div
            key={id}
            className={[
              'flex flex-col items-center gap-1.5 rounded-2xl px-3 py-4 transition-colors fade-in-up',
              isActive
                ? 'bg-gold-400/15 border border-gold-400/40 shadow-[0_0_0_1px_rgba(242,193,78,0.15)]'
                : 'glass-card',
            ].join(' ')}
          >
            <Icon
              className={`h-5 w-5 ${isActive ? 'text-gold-300' : 'text-[var(--text-secondary)]'}`}
              strokeWidth={1.75}
            />
            <span
              className={`text-xs uppercase tracking-wide ${
                isActive ? 'text-gold-200' : 'text-[var(--text-muted)]'
              }`}
            >
              {time.label}
            </span>
            <span className={`text-lg font-semibold tabular-nums ${isActive ? 'text-[var(--text-primary)]' : 'text-[var(--text-primary)]'}`}>
              {formatTime(time.date, timeFormat)}
            </span>
            {!time.isAdhan && (
              <span className="text-[10px] text-[var(--text-faint)]">ezan okunmaz</span>
            )}
          </div>
        );
      })}
    </div>
  );
}
