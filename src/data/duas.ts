export interface Dua {
  id: string;
  title: string;
  arabic: string;
  transliteration: string;
  meaning: string;
}

export const DUAS: Dua[] = [
  {
    id: 'ezan-duasi',
    title: 'Ezan Duası',
    arabic:
      'اَللّٰهُمَّ رَبَّ هٰذِهِ الدَّعْوَةِ التَّامَّةِ وَالصَّلَاةِ الْقَائِمَةِ، آتِ مُحَمَّدًا الْوَسِيلَةَ وَالْفَضِيلَةَ، وَابْعَثْهُ مَقَامًا مَحْمُودًا الَّذِي وَعَدْتَهُ',
    transliteration:
      "Allâhümme Rabbe hâzihi'd-da'veti't-tâmmeh ve's-salâti'l-kâimeh, âti Muhammedeni'l-vesîlete ve'l-fadîleh, veb'ashü makâmen mahmûdenillezî veadteh.",
    meaning:
      'Allah\'ım! Bu eksiksiz davetin ve kılınacak namazın Rabbi! Muhammed\'e vesileyi ve fazileti ver, onu kendisine vaad ettiğin makam-ı mahmûda ulaştır.',
  },
  {
    id: 'sabah-duasi',
    title: 'Sabah Duası',
    arabic: 'اَللّٰهُمَّ بِكَ أَصْبَحْنَا وَبِكَ أَمْسَيْنَا وَبِكَ نَحْيَا وَبِكَ نَمُوتُ وَإِلَيْكَ النُّشُورُ',
    transliteration:
      'Allâhümme bike asbahnâ ve bike emseynâ ve bike nahyâ ve bike nemûtü ve ileykenüşûr.',
    meaning:
      'Allah\'ım! Senin izninle sabahladık, senin izninle akşamladık. Senin izninle yaşar, senin izninle ölürüz. Dönüş de yalnız sanadır.',
  },
  {
    id: 'yemek-oncesi',
    title: 'Yemekten Önce',
    arabic: 'بِسْمِ اللّٰهِ',
    transliteration: 'Bismillâh',
    meaning: 'Allah\'ın adıyla (başlarım).',
  },
  {
    id: 'yemek-sonrasi',
    title: 'Yemekten Sonra',
    arabic: 'اَلْحَمْدُ لِلّٰهِ الَّذِي أَطْعَمَنَا وَسَقَانَا وَجَعَلَنَا مُسْلِمِينَ',
    transliteration: "Elhamdü lillâhillezî at'amenâ ve sekânâ ve cealenâ müslimîn.",
    meaning:
      'Bizi yediren, içiren ve Müslümanlardan kılan Allah\'a hamd olsun.',
  },
  {
    id: 'eve-girerken',
    title: 'Eve Girerken',
    arabic:
      'اَللّٰهُمَّ إِنِّي أَسْأَلُكَ خَيْرَ الْمَوْلِجِ وَخَيْرَ الْمَخْرَجِ، بِسْمِ اللّٰهِ وَلَجْنَا وَبِسْمِ اللّٰهِ خَرَجْنَا وَعَلَى اللّٰهِ رَبِّنَا تَوَكَّلْنَا',
    transliteration:
      "Allâhümme innî es'elüke hayre'l-mevlici ve hayre'l-mahrec, bismillâhi velecnâ ve bismillâhi harecnâ ve alellâhi rabbinâ tevekkelnâ.",
    meaning:
      'Allah\'ım! Senden girilecek ve çıkılacak yerin hayırlısını dilerim. Allah\'ın adıyla girdik, Allah\'ın adıyla çıktık ve yalnız Rabbimiz Allah\'a güvendik.',
  },
  {
    id: 'yolculuk-duasi',
    title: 'Yolculuğa Çıkarken',
    arabic:
      'سُبْحَانَ الَّذِي سَخَّرَ لَنَا هٰذَا وَمَا كُنَّا لَهُ مُقْرِنِينَ وَإِنَّا إِلَى رَبِّنَا لَمُنْقَلِبُونَ',
    transliteration:
      "Sübhânellezî sehhara lenâ hâzâ ve mâ künnâ lehû mukrinîn ve innâ ilâ rabbinâ le münkalibûn.",
    meaning:
      'Bunu bizim hizmetimize veren Allah\'ı tesbih ederiz, yoksa biz buna güç yetiremezdik. Şüphesiz biz Rabbimize döneceğiz.',
  },
  {
    id: 'uyumadan-once',
    title: 'Uyumadan Önce',
    arabic: 'بِاسْمِكَ اللّٰهُمَّ أَمُوتُ وَأَحْيَا',
    transliteration: 'Bismike Allâhümme emûtü ve ahyâ.',
    meaning: 'Allah\'ım! Senin adınla ölür ve senin adınla dirilirim.',
  },
  {
    id: 'sikinti-duasi',
    title: 'Sıkıntı Anında',
    arabic: 'حَسْبُنَا اللّٰهُ وَنِعْمَ الْوَكِيلُ',
    transliteration: "Hasbünallâhu ve ni'mel vekîl.",
    meaning: 'Allah bize yeter, O ne güzel vekildir.',
  },
];
