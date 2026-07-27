/** Çevrimiçi AI yanıt veremezse kullanılan, Diyanet çizgisine yakın kısa SSS. */

export interface ReligiousFaqEntry {
  id: string;
  keywords: string[];
  question: string;
  answer: string;
}

export const RELIGIOUS_FAQ: ReligiousFaqEntry[] = [
  {
    id: 'namaz-farz',
    keywords: ['farz', 'namazın farzları', 'namaz farzlari', 'rukün', 'rükün'],
    question: 'Namazın farzları nelerdir?',
    answer:
      'Namazın farzları iki gruptur:\n\n**Namazdan önce (şartlar):** Hadesten taharet (abdest/gusül), necasetten taharet, setr-i avret, istikbal-i kıble, vakit, niyet.\n\n**Namazın içinde (rükünler):** İftitah tekbiri, kıyam, kıraat, rükû, secde, ka‘de-i ahîre (son oturuş).\n\nBu özet genel bilgidir; kişisel hüküm için bir âlime veya Diyanet’e danışın.',
  },
  {
    id: 'abdest',
    keywords: ['abdest', 'abdest nasıl', 'abdesti bozan'],
    question: 'Abdest nasıl alınır?',
    answer:
      'Kısaca abdest sırası: Niyet → ellere su → ağıza ve burna su → yüzü yıkama → kolları dirseklerle birlikte yıkama → başa meshetme → ayakları topuklarla birlikte yıkama.\n\nAbdesti bozan başlıca durumlar: idrar/dışkı/gaz çıkması, uyumak (uyanıklığı gidecek şekilde), bayılmak. Şüphede kaldığınızda bir din görevlisine sorun.',
  },
  {
    id: 'gusul',
    keywords: ['gusül', 'gusul', 'boy abdesti', 'ihtilam'],
    question: 'Gusül nasıl alınır?',
    answer:
      'Gusülde ağız ve burnun içi dahil bütün vücudun yıkanması gerekir. Niyet edilir; ağız-burun temizlenir; sonra tüm beden su ile yıkanır. Saç diplerinin ıslanmasına dikkat edilir. Gusül gerektiren hâller arasında cünüplük ve hayız/nifasın bitmesi sayılır.',
  },
  {
    id: 'oruc-bozan',
    keywords: ['oruç', 'orucu bozan', 'iftar', 'ramazan oruç'],
    question: 'Orucu bozan şeyler nelerdir?',
    answer:
      'Kasdî olarak yemek-içmek, cinsel ilişki ve benzeri bilerek yapılan fiiller orucu bozar. Unutarak yiyip içmek Hanefî mezhebinde orucu bozmaz. Hastalık, yolculuk gibi ruhsatlar vardır. Kaza veya kefaret gerekip gerekmediği duruma göre değişir; kesin hüküm için müftülüğe danışın.',
  },
  {
    id: 'zekat',
    keywords: ['zekât', 'zekat', 'nisap', 'kime verilir'],
    question: 'Zekât kimlere verilir?',
    answer:
      'Kur’an’da (Tevbe 9/60) zekâtın verileceği sınıflar belirtilir; başlıcaları fakirler, miskinler, borçlular ve Allah yolunda olanlardır. Ana-baba, eş ve usûl-fürû‘a zekât verilmez (mezheplere göre ayrıntı değişebilir). Nisap ve oran için uygulamadaki Zekât hesaplayıcısını da kullanabilirsiniz.',
  },
  {
    id: 'kible',
    keywords: ['kıble', 'kible', 'hangi yöne'],
    question: 'Kıble neresidir?',
    answer:
      'Kıble, Mekke’deki Kâbe yönüdür. Namazda bu yöne dönmek farzdır. Uygulamadaki Kıble sekmesi pusula ve konum ile yönü göstermeye yardımcı olur; şüphede camideki kıble işaretine uyun.',
  },
  {
    id: 'teravih',
    keywords: ['teravih', 'teravih kaç'],
    question: 'Teravih namazı nedir?',
    answer:
      'Teravih, Ramazan gecelerinde yatsıdan sonra kılınan müekked sünnet bir namazdır. Diyanet uygulamasında genellikle 20 rekât olarak kıldırılır. Tek başına da kılınabilir. Orucun farz oluşundan ayrı bir ibadettir.',
  },
  {
    id: 'kadın-namaz',
    keywords: ['hayız', 'adet', 'kadın namaz', 'nifas'],
    question: 'Hayızda namaz ve oruç nasıl olur?',
    answer:
      'Hayız ve nifas süresince namaz ve oruç tutulmaz; namazlar kaza edilmez, oruçlar ise sonra kaza edilir. Temizlik sonrası gusül alınır. Süre ve hükümler kişiden kişiye değişebileceği için emin olmadığınız durumda bir hanım din görevlisi veya müftülüğe danışın.',
  },
  {
    id: 'cuma',
    keywords: ['cuma', 'cuma namazı', 'hutbe'],
    question: 'Cuma namazı kimlere farzdır?',
    answer:
      'Cuma namazı, şartları taşıyan erkeklere farz-ı ayındır. Hutbeyi dinlemek de namazın parçasıdır. Özür, yolculuk gibi durumlar hükümleri etkileyebilir. Kadınlar için farz değildir; kılmaları menduptur.',
  },
  {
    id: 'kaza',
    keywords: ['kaza', 'kaçırılan namaz', 'borç namaz'],
    question: 'Kaçırılan namaz nasıl kılınır?',
    answer:
      'Vaktinde kılınamayan farz namazlar kaza edilir. Kaza ederken “kazaya kalan … namazını kılmaya” diye niyet edilir. Çok borç birikmişse planlı şekilde kaza etmek önerilir. Uygulamadaki Namazlarım sekmesinde kaza sayacı vardır.',
  },
  {
    id: 'esma',
    keywords: ['esma', "esmaül", '99 isim'],
    question: "Esmaü'l-Hüsna nedir?",
    answer:
      "Esmaü'l-Hüsna, Allah’ın (c.c.) en güzel isimleridir. Bu isimlerle dua etmek sünnettir. Uygulamadaki Esmaü'l-Hüsna bölümünden 99 ismi okuyabilirsiniz.",
  },
  {
    id: 'dua',
    keywords: ['dua', 'nasıl dua', 'kabul'],
    question: 'Dua nasıl edilir?',
    answer:
      'Dua; kalp huzuru, helâl lokma, tevazu ve ısrarla Allah’a yönelmektir. Elleri açmak, kıbleye dönmek, hamd ve salât ile başlamak menduptur. Kabulün şekli ve zamanı Allah’a aittir. Hazır dualar için Zikir & Dualar bölümüne bakabilirsiniz.',
  },
];

export const SUGGESTED_QUESTIONS = [
  'Namazın farzları nelerdir?',
  'Abdest nasıl alınır?',
  'Orucu bozan şeyler nelerdir?',
  'Zekât kimlere verilir?',
  'Gusül nasıl alınır?',
  'Kaçırılan namaz nasıl kaza edilir?',
] as const;

function normalize(text: string): string {
  return text
    .toLocaleLowerCase('tr')
    .normalize('NFD')
    .replace(/[\u0300-\u036f]/g, '')
    .replace(/ı/g, 'i')
    .replace(/[^a-z0-9ğüşöçi\s]/gi, ' ')
    .replace(/\s+/g, ' ')
    .trim();
}

/** Basit anahtar kelime eşleşmesi; skor yeterince yüksekse cevap döner. */
export function matchReligiousFaq(question: string): ReligiousFaqEntry | null {
  const q = normalize(question);
  if (q.length < 3) return null;

  let best: { entry: ReligiousFaqEntry; score: number } | null = null;
  for (const entry of RELIGIOUS_FAQ) {
    let score = 0;
    for (const keyword of entry.keywords) {
      const k = normalize(keyword);
      if (q.includes(k)) score += k.length >= 6 ? 3 : 2;
    }
    const nq = normalize(entry.question);
    if (q.includes(nq) || nq.includes(q)) score += 5;
    if (!best || score > best.score) best = { entry, score };
  }

  return best && best.score >= 3 ? best.entry : null;
}
