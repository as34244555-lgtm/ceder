import type { PrayerTime } from '../types';
import { PRAYER_ICONS } from './prayerIcons';

interface PrayerTimesListProps {
  times: PrayerTime[];
  currentKeyId: string | null;
}

export function PrayerTimesList({ times, currentKeyId }: PrayerTimesListProps) {
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
              className={`h-5 w-5 ${isActive ? 'text-gold-300' : 'text-emerald-200/70'}`}
              strokeWidth={1.75}
            />
            <span
              className={`text-xs uppercase tracking-wide ${
                isActive ? 'text-gold-200' : 'text-emerald-100/60'
              }`}
            >
              {time.label}
            </span>
            <span className={`text-lg font-semibold tabular-nums ${isActive ? 'text-white' : 'text-emerald-50'}`}>
              {time.date.toLocaleTimeString('tr-TR', { hour: '2-digit', minute: '2-digit' })}
            </span>
            {!time.isAdhan && (
              <span className="text-[10px] text-emerald-100/40">ezan okunmaz</span>
            )}
          </div>
        );
      })}
    </div>
  );
}
