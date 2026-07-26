export interface DailyWisdom {
  type: 'ayet' | 'hadis';
  source: string;
  arabic?: string;
  text: string;
}

/** Gün döngüsüyle seçilen kısa ayet ve hadisler. */
export const DAILY_WISDOM: DailyWisdom[] = [
  {
    type: 'ayet',
    source: 'Bakara 2:286',
    text: 'Allah, bir kimseyi ancak gücünün yettiği şeyle yükümlü kılar.',
  },
  {
    type: 'ayet',
    source: 'İnşirah 94:5-6',
    text: 'Demek ki, güçlükle beraber bir kolaylık vardır. Evet, güçlükle beraber bir kolaylık vardır.',
  },
  {
    type: 'ayet',
    source: 'Ra\'d 13:28',
    text: 'İnananların kalpleri Allah\'ı anmakla huzur bulur.',
  },
  {
    type: 'ayet',
    source: 'Ahzab 33:41',
    text: 'Ey iman edenler! Allah\'ı çok zikredin.',
  },
  {
    type: 'ayet',
    source: 'Hucurat 49:13',
    text: 'Allah katında en üstün olanınız, O\'na karşı gelmekten en çok sakınanızdır.',
  },
  {
    type: 'hadis',
    source: 'Buhârî',
    text: 'Ameller niyetlere göredir. Herkesin niyeti neyse eline geçen odur.',
  },
  {
    type: 'hadis',
    source: 'Müslim',
    text: 'Müslüman, dilinden ve elinden diğer Müslümanların emin olduğu kimsedir.',
  },
  {
    type: 'hadis',
    source: 'Tirmizî',
    text: 'Kolaylaştırın, zorlaştırmayın; müjdeleyin, nefret ettirmeyin.',
  },
  {
    type: 'hadis',
    source: 'Buhârî',
    text: 'Sizin en hayırlınız, ahlakı en güzel olanınızdır.',
  },
  {
    type: 'hadis',
    source: 'Müslim',
    text: 'Güçlü kimse, güreşte rakibini yenen değil; öfkelendiği zaman nefsine hâkim olandır.',
  },
  {
    type: 'ayet',
    source: 'Nahl 16:90',
    text: 'Allah adaleti, iyiliği ve yakınlara vermeyi emreder.',
  },
  {
    type: 'ayet',
    source: 'Zümer 39:53',
    text: 'Allah\'ın rahmetinden ümit kesmeyin. Allah bütün günahları bağışlar.',
  },
  {
    type: 'hadis',
    source: 'Buhârî',
    text: 'Kim bir müminin dünya sıkıntılarından birini giderirse, Allah da onun ahiret sıkıntılarından birini giderir.',
  },
  {
    type: 'hadis',
    source: 'Tirmizî',
    text: 'Gülümseyerek kardeşinle karşılaşman sadakadır.',
  },
  {
    type: 'ayet',
    source: 'Asr 103:1-3',
    text: 'Asra yemin olsun ki, insan ziyandadır. Ancak iman edip salih amel işleyenler, birbirlerine hakkı ve sabrı tavsiye edenler müstesna.',
  },
];

export function getDailyWisdom(date: Date = new Date()): DailyWisdom {
  const start = new Date(date.getFullYear(), 0, 0);
  const dayOfYear = Math.floor((date.getTime() - start.getTime()) / 86_400_000);
  return DAILY_WISDOM[dayOfYear % DAILY_WISDOM.length];
}
