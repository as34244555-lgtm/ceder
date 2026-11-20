export interface DailyWisdom {
  type: 'ayet' | 'hadis';
  source: string;
  text: string;
}

/** Kısa, özgün hatırlatmalar (resmî meal iddiası yok). */
export const DAILY_WISDOM: DailyWisdom[] = [
  {
    type: 'ayet',
    source: 'Bakara 2:286 (anlam özeti)',
    text: 'Kul, gücünün yetmediğiyle sorumlu tutulmaz.',
  },
  {
    type: 'ayet',
    source: 'İnşirah 94:5-6 (anlam özeti)',
    text: 'Zorluğun yanında bir kolaylık vardır.',
  },
  {
    type: 'ayet',
    source: 'Ra\'d 13:28 (anlam özeti)',
    text: 'Kalpler Allah’ı anmakla huzur bulur.',
  },
  {
    type: 'ayet',
    source: 'Ahzab 33:41 (anlam özeti)',
    text: 'Müminler Allah’ı çok anmaya çağrılır.',
  },
  {
    type: 'ayet',
    source: 'Hucurat 49:13 (anlam özeti)',
    text: 'Üstünlük takvadadır.',
  },
  {
    type: 'hadis',
    source: 'Niyet hadisi (anlam özeti)',
    text: 'Ameller niyetlere göredir.',
  },
  {
    type: 'hadis',
    source: 'Emanet hadisi (anlam özeti)',
    text: 'Müslüman, elinden ve dilinden emin olunan kimsedir.',
  },
  {
    type: 'hadis',
    source: 'Kolaylaştırma (anlam özeti)',
    text: 'Kolaylaştırın, zorlaştırmayın; müjdeleyin.',
  },
  {
    type: 'hadis',
    source: 'Ahlak (anlam özeti)',
    text: 'En hayırlınız, ahlakı en güzel olanınızdır.',
  },
  {
    type: 'hadis',
    source: 'Öfke (anlam özeti)',
    text: 'Asıl güç, öfkesine hâkim olmaktır.',
  },
  {
    type: 'ayet',
    source: 'Nahl 16:90 (anlam özeti)',
    text: 'Adalet, iyilik ve yakınlara vermek emredilir.',
  },
  {
    type: 'ayet',
    source: 'Zümer 39:53 (anlam özeti)',
    text: 'Allah’ın rahmetinden ümit kesilmez.',
  },
  {
    type: 'hadis',
    source: 'Sıkıntı giderme (anlam özeti)',
    text: 'Bir müminin sıkıntısını gideren, karşılığını görür.',
  },
  {
    type: 'hadis',
    source: 'Gülümseme (anlam özeti)',
    text: 'Kardeşine gülümseyerek bakmak sadakadır.',
  },
  {
    type: 'ayet',
    source: 'Asr 103 (anlam özeti)',
    text: 'İman, salih amel, hak ve sabır tavsiyesi kurtuluştur.',
  },
];

export function getDailyWisdom(date: Date = new Date()): DailyWisdom {
  const start = new Date(date.getFullYear(), 0, 0);
  const dayOfYear = Math.floor((date.getTime() - start.getTime()) / 86_400_000);
  return DAILY_WISDOM[dayOfYear % DAILY_WISDOM.length];
}
