export interface IslamicOccasion {
  /** Hicri ay numarası (1 = Muharrem, ... 12 = Zilhicce) */
  month: number;
  /** Hicri ayın günü */
  day: number;
  name: string;
  emoji: string;
  description: string;
}

/**
 * Sabit hicri tarihli önemli günler/geceler. Recep ayının ilk cuma gecesi olan
 * Regaib Kandili gibi haftanın gününe bağlı (değişken) günler, yanlış tarih
 * göstermemek için bilerek dahil edilmemiştir.
 */
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

export function findOccasion(month: number, day: number): IslamicOccasion | null {
  return ISLAMIC_OCCASIONS.find((o) => o.month === month && o.day === day) ?? null;
}
