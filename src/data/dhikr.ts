export interface DhikrOption {
  id: string;
  arabic: string;
  turkish: string;
  defaultTarget: number;
}

export const DHIKR_OPTIONS: DhikrOption[] = [
  { id: 'subhanallah', arabic: 'سُبْحَانَ اللّٰهِ', turkish: 'Sübhânallah', defaultTarget: 33 },
  { id: 'elhamdulillah', arabic: 'اَلْحَمْدُ لِلّٰهِ', turkish: 'Elhamdülillah', defaultTarget: 33 },
  { id: 'allahuekber', arabic: 'اَللّٰهُ أَكْبَرُ', turkish: 'Allâhu Ekber', defaultTarget: 34 },
  { id: 'estagfirullah', arabic: 'أَسْتَغْفِرُ اللّٰهَ', turkish: 'Estağfirullah', defaultTarget: 100 },
  {
    id: 'la-ilahe',
    arabic: 'لَا إِلَٰهَ إِلَّا اللّٰهُ',
    turkish: 'Lâ ilâhe illallah',
    defaultTarget: 100,
  },
  {
    id: 'salavat',
    arabic: 'اَللّٰهُمَّ صَلِّ عَلَى مُحَمَّدٍ',
    turkish: 'Allâhümme salli alâ Muhammed',
    defaultTarget: 100,
  },
];
