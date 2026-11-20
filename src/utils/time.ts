import type { TimeFormat } from '../types';

export function formatTime(date: Date, format: TimeFormat): string {
  return date.toLocaleTimeString('tr-TR', {
    hour: '2-digit',
    minute: '2-digit',
    hour12: format === '12',
  });
}
