import { ChevronLeft, ChevronRight, Loader2 } from 'lucide-react';
import { useMonthlyCalendar } from '../hooks/useMonthlyCalendar';
import { TURKISH_MONTHS } from '../data/turkishMonths';
import { findOccasion } from '../data/islamicOccasions';
import type { LocationInfo, TimeFormat } from '../types';
import { formatTime } from '../utils/time';

interface MonthlyCalendarProps {
  location: LocationInfo | null;
  method: number;
  timeFormat: TimeFormat;
}

export function MonthlyCalendar({ location, method, timeFormat }: MonthlyCalendarProps) {
  const { year, month, days, loading, error, goToPreviousMonth, goToNextMonth } =
    useMonthlyCalendar(location, method);

  const todayISO = (() => {
    const d = new Date();
    return `${d.getFullYear()}-${String(d.getMonth() + 1).padStart(2, '0')}-${String(
      d.getDate(),
    ).padStart(2, '0')}`;
  })();

  return (
    <div className="w-full flex flex-col gap-4 fade-in-up">
      <div className="glass-card rounded-2xl px-4 py-3 flex items-center justify-between">
        <button
          type="button"
          onClick={goToPreviousMonth}
          className="p-2 rounded-xl hover:bg-[var(--surface-soft-strong)] transition"
          aria-label="Önceki ay"
        >
          <ChevronLeft className="h-5 w-5 text-[var(--text-secondary)]" />
        </button>
        <span className="font-semibold text-[var(--text-primary)]">
          {TURKISH_MONTHS[month - 1]} {year}
        </span>
        <button
          type="button"
          onClick={goToNextMonth}
          className="p-2 rounded-xl hover:bg-[var(--surface-soft-strong)] transition"
          aria-label="Sonraki ay"
        >
          <ChevronRight className="h-5 w-5 text-[var(--text-secondary)]" />
        </button>
      </div>

      {loading && (
        <div className="flex items-center justify-center gap-2 text-[var(--text-secondary)] py-6">
          <Loader2 className="h-4 w-4 animate-spin" /> Takvim yükleniyor…
        </div>
      )}

      {error && <p className="text-red-300 text-sm text-center">{error}</p>}

      {!loading && !error && days.length > 0 && (
        <div className="glass-card rounded-2xl overflow-x-auto">
          <table className="w-full text-sm min-w-[680px]">
            <thead>
              <tr className="text-[var(--text-secondary)] text-xs uppercase tracking-wide border-b border-[var(--border-soft)]">
                <th className="px-3 py-3 text-left font-medium">Gün</th>
                <th className="px-3 py-3 text-left font-medium">Hicri</th>
                <th className="px-3 py-3 text-center font-medium">İmsak</th>
                <th className="px-3 py-3 text-center font-medium">Güneş</th>
                <th className="px-3 py-3 text-center font-medium">Öğle</th>
                <th className="px-3 py-3 text-center font-medium">İkindi</th>
                <th className="px-3 py-3 text-center font-medium">Akşam</th>
                <th className="px-3 py-3 text-center font-medium">Yatsı</th>
              </tr>
            </thead>
            <tbody>
              {days.map((day) => {
                const isToday = day.dateISO === todayISO;
                const dayNumber = Number(day.dateISO.split('-')[2]);
                const weekday = new Date(
                  day.times[0].date.getFullYear(),
                  day.times[0].date.getMonth(),
                  day.times[0].date.getDate(),
                ).toLocaleDateString('tr-TR', { weekday: 'short' });
                const occasion = findOccasion(day.hijri.month, day.hijri.day);
                return (
                  <tr
                    key={day.dateISO}
                    className={`border-b border-[var(--border-soft)] last:border-0 ${
                      isToday
                        ? 'bg-gold-400/10'
                        : occasion
                          ? 'bg-[var(--accent-soft-bg)]'
                          : ''
                    }`}
                  >
                    <td className="px-3 py-2.5 text-left whitespace-nowrap">
                      <span className={isToday ? 'text-gold-300 font-semibold' : 'text-[var(--text-primary)]'}>
                        {dayNumber}
                      </span>{' '}
                      <span className="text-[var(--text-muted)] text-xs">{weekday}</span>
                    </td>
                    <td className="px-3 py-2.5 text-left whitespace-nowrap text-[var(--text-muted)] text-xs">
                      {day.hijri.day} {day.hijri.monthLabel}
                      {occasion && <span className="ml-1">{occasion.emoji}</span>}
                    </td>
                    {day.times.map((t) => (
                      <td
                        key={t.key}
                        className={`px-3 py-2.5 text-center tabular-nums ${
                          isToday ? 'text-[var(--text-primary)] font-medium' : 'text-[var(--text-secondary)]'
                        }`}
                      >
                        {formatTime(t.date, timeFormat)}
                      </td>
                    ))}
                  </tr>
                );
              })}
            </tbody>
          </table>
        </div>
      )}
    </div>
  );
}
