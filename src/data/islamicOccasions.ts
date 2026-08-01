import type { HijriDate } from '../types';

export interface IslamicOccasion {
  month: number;
  day: number;
  name: string;
  emoji: string;
  description: string;
}

export const ISLAMIC_OCCASIONS: IslamicOccasion[] = [
  { month: 1, day: 1, name: 'Hicri Yılbaşı', emoji: '🌙', description: 'Hicri yılın ilk günü.' },
  { month: 1, day: 10, name: 'Aşure Günü', emoji: '🕯️', description: 'Muharrem ayının 10. günü.' },
  {
    month: 3,
    day: 12,
    name: 'Mevlid Kandili',
    emoji: '🕌',
    description: 'Peygamber Efendimizin doğumu.',
  },
  {
    month: 7,
    day: 27,
    name: 'Miraç Kandili',
    emoji: '✨',
    description: "Peygamber Efendimiz'in Mirac mucizesi.",
  },
  {
    month: 8,
    day: 15,
    name: 'Berat Kandili',
    emoji: '🌟',
    description: "Şaban ayının 14'ünü 15'ine bağlayan gece.",
  },
  {
    month: 9,
    day: 1,
    name: 'Ramazan Ayı Başlangıcı',
    emoji: '🌙',
    description: 'Ramazan-ı Şerif başlıyor, hayırlı oruçlar.',
  },
  {
    month: 9,
    day: 27,
    name: 'Kadir Gecesi',
    emoji: '🕯️',
    description: 'Bin aydan daha hayırlı gece.',
  },
  {
    month: 10,
    day: 1,
    name: 'Ramazan Bayramı (1. Gün)',
    emoji: '🎉',
    description: 'Ramazan Bayramınız mübarek olsun.',
  },
  { month: 10, day: 2, name: 'Ramazan Bayramı (2. Gün)', emoji: '🎉', description: '' },
  { month: 10, day: 3, name: 'Ramazan Bayramı (3. Gün)', emoji: '🎉', description: '' },
  {
    month: 12,
    day: 9,
    name: 'Arefe Günü',
    emoji: '🤲',
    description: 'Kurban Bayramı arefesi.',
  },
  {
    month: 12,
    day: 10,
    name: 'Kurban Bayramı (1. Gün)',
    emoji: '🎉',
    description: 'Kurban Bayramınız mübarek olsun.',
  },
  { month: 12, day: 11, name: 'Kurban Bayramı (2. Gün)', emoji: '🎉', description: '' },
  { month: 12, day: 12, name: 'Kurban Bayramı (3. Gün)', emoji: '🎉', description: '' },
  { month: 12, day: 13, name: 'Kurban Bayramı (4. Gün)', emoji: '🎉', description: '' },
];

const REGAIB: IslamicOccasion = {
  month: 7,
  day: 0,
  name: 'Regaib Kandili',
  emoji: '🌟',
  description: 'Recep ayının ilk Cuma gecesi.',
};

/**
 * Sabit hicri günler + Regaib (Recep’in ilk Cuma’sı).
 * `gregorian` verilirse haftanın günü ile Regaib hesaplanır.
 */
export function findOccasion(hijri: HijriDate, gregorian?: Date): IslamicOccasion | null {
  const fixed =
    ISLAMIC_OCCASIONS.find((o) => o.month === hijri.month && o.day === hijri.day) ?? null;
  if (fixed) return fixed;

  // Regaib: Recep (7) ayında ilk Cuma (JS: getDay()===5)
  if (hijri.month === 7 && gregorian && gregorian.getDay() === 5 && hijri.day <= 7) {
    return { ...REGAIB, day: hijri.day };
  }
  return null;
}
