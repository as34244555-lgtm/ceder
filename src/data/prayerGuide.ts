export interface PrayerGuideStep {
  label: string;
  rakat: number;
  type: 'sünnet' | 'farz' | 'vacip' | 'nafile';
}

export interface PrayerGuideEntry {
  key: string;
  name: string;
  totalRakat: number;
  steps: PrayerGuideStep[];
  note?: string;
}

export const PRAYER_GUIDE: PrayerGuideEntry[] = [
  {
    key: 'sabah',
    name: 'Sabah Namazı (İmsak)',
    totalRakat: 4,
    steps: [
      { label: 'Sabah namazının sünneti', rakat: 2, type: 'sünnet' },
      { label: 'Sabah namazının farzı', rakat: 2, type: 'farz' },
    ],
    note: 'Sabah namazının sünneti, müekked (önemle tavsiye edilen) bir sünnettir.',
  },
  {
    key: 'ogle',
    name: 'Öğle Namazı',
    totalRakat: 10,
    steps: [
      { label: 'İlk sünnet', rakat: 4, type: 'sünnet' },
      { label: 'Öğle namazının farzı', rakat: 4, type: 'farz' },
      { label: 'Son sünnet', rakat: 2, type: 'sünnet' },
    ],
  },
  {
    key: 'ikindi',
    name: 'İkindi Namazı',
    totalRakat: 8,
    steps: [
      { label: 'Sünnet (gayrı müekked)', rakat: 4, type: 'sünnet' },
      { label: 'İkindi namazının farzı', rakat: 4, type: 'farz' },
    ],
  },
  {
    key: 'aksam',
    name: 'Akşam Namazı',
    totalRakat: 5,
    steps: [
      { label: 'Akşam namazının farzı', rakat: 3, type: 'farz' },
      { label: 'Sünnet', rakat: 2, type: 'sünnet' },
    ],
  },
  {
    key: 'yatsi',
    name: 'Yatsı Namazı',
    totalRakat: 13,
    steps: [
      { label: 'İlk sünnet (gayrı müekked)', rakat: 4, type: 'sünnet' },
      { label: 'Yatsı namazının farzı', rakat: 4, type: 'farz' },
      { label: 'Son sünnet', rakat: 2, type: 'sünnet' },
      { label: 'Vitir namazı', rakat: 3, type: 'vacip' },
    ],
  },
];

export const PRAYER_STEPS_SUMMARY = [
  'Abdest alınır, kıbleye dönülür ve niyet edilir.',
  '"Allâhu Ekber" denilerek namaza başlanır (iftitah tekbiri).',
  'Kıyamda Sübhaneke, Fatiha ve bir sûre/ayet okunur.',
  'Rükûya varılır, "Sübhâne Rabbiyel Azîm" denir.',
  'Rükûdan doğrulunur, secdeye varılır, "Sübhâne Rabbiyel A\'lâ" denir (iki secde).',
  'Her iki rekatta bir oturulur, Ettehiyyâtü (ve son oturuşta salli-barik ve dualar) okunur.',
  'Namaz, sağa ve sola selam verilerek tamamlanır.',
];
