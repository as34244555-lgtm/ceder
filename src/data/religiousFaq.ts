/** Yerel dini SSS — serbest yazılan sorular için konu eşleştirmeli. */

export interface ReligiousFaqEntry {
  id: string;
  /** Serbest soruda yakalanacak kalıplar (normalize edilmiş metin üzerinde) */
  patterns: RegExp[];
  keywords: string[];
  question: string;
  answer: string;
}

export const RELIGIOUS_FAQ: ReligiousFaqEntry[] = [
  {
    id: 'dis-macunu-oruc',
    patterns: [/macun/, /misvak/, /dis\s*fircha/, /dis\s*temiz/],
    keywords: ['dis macunu', 'macun', 'misvak'],
    question: 'Oruçluyken diş macunu kullanılır mı?',
    answer:
      'Çoğu âlime göre diş macunu yutulmazsa orucu bozmaz; boğaza kaçırmamaya dikkat edilir. İsterseniz iftara kadar bekleyebilir veya misvak kullanabilirsiniz.',
  },
  {
    id: 'namaz-farz',
    patterns: [/farz/, /ruk[uü]n/, /sartlari/, /namazin\s*farz/],
    keywords: ['farz', 'namaz farz', 'rukun'],
    question: 'Namazın farzları nelerdir?',
    answer:
      'Namazın farzları iki gruptur:\n\n**Namazdan önce (şartlar):** Hadesten taharet (abdest/gusül), necasetten taharet, setr-i avret, istikbal-i kıble, vakit, niyet.\n\n**Namazın içinde (rükünler):** İftitah tekbiri, kıyam, kıraat, rükû, secde, ka‘de-i ahîre (son oturuş).',
  },
  {
    id: 'gusul',
    patterns: [/gusul/, /boy\s*abdest/, /cunup/, /ihtilam/],
    keywords: ['gusul', 'boy abdest', 'cunup'],
    question: 'Gusül nasıl alınır?',
    answer:
      'Gusülde ağız ve burnun içi dahil bütün vücut yıkanır. Niyet edilir; ağız-burun temizlenir; tüm beden su ile yıkanır; saç diplerinin ıslanmasına dikkat edilir. Cünüplük ve hayız/nifas sonrası gusül gerekir.',
  },
  {
    id: 'abdest',
    patterns: [/abdest/],
    keywords: ['abdest'],
    question: 'Abdest nasıl alınır?',
    answer:
      'Kısaca abdest sırası: Niyet → ellere su → ağıza ve burna su → yüzü yıkama → kolları dirseklerle birlikte yıkama → başa meshetme → ayakları topuklarla birlikte yıkama.\n\nAbdesti bozan başlıca durumlar: idrar/dışkı/gaz, uyku (uyanıklığı gidecek şekilde), bayılma.',
  },
  {
    id: 'kaza',
    patterns: [/kaza/, /kacir/, /kacirdim/, /vakti\s*gec/, /gecirdim/, /kilamadim/],
    keywords: ['kaza', 'kacirilan namaz', 'kacirinca'],
    question: 'Kaçırılan namaz nasıl kılınır?',
    answer:
      'Vaktinde kılınamayan farz namazlar kaza edilir. “Kazaya kalan … namazını kılmaya” diye niyet edilir. Uygulamadaki Namazlarım sekmesinde kaza sayacı vardır.',
  },
  {
    id: 'oruc-bozan',
    patterns: [/oruc/, /iftar/, /imsak/, /sahur/, /ramazan/],
    keywords: ['oruc', 'orucu bozan', 'iftar', 'imsak'],
    question: 'Orucu bozan şeyler nelerdir?',
    answer:
      'Bile bile yemek-içmek ve cinsel ilişki orucu bozar. Unutarak yiyip içmek Hanefî mezhebinde bozmaz. Hastalık ve yolculukta ruhsat vardır. Kaza/kefaret durumu için müftülüğe danışın.',
  },
  {
    id: 'zekat',
    patterns: [/zekat/, /fitre/, /nisap/],
    keywords: ['zekat', 'fitre', 'nisap'],
    question: 'Zekât kimlere verilir?',
    answer:
      'Kur’an’da (Tevbe 9/60) zekât sınıfları sayılır; başlıcaları fakirler, miskinler, borçlular ve Allah yolunda olanlardır. Ana-baba, eş ve usûl-fürû‘a zekât verilmez (mezheplere göre ayrıntı değişebilir). Uygulamadaki Zekât hesaplayıcısını kullanabilirsiniz.',
  },
  {
    id: 'kible-bilememe',
    patterns: [/kible.*(bil|bul|suphe|yanlis)/, /(bil|bul|suphe).*kible/, /yon\s*bilmiyorum/],
    keywords: ['kibleyi bilemez', 'kible suphe'],
    question: 'Kıbleyi bilemezsem namazım olur mu?',
    answer:
      'Gücünüz yettiğince araştırıp doğru yöne dönün. Araştırma sonrası içtihadınızla kıldığınız namaz, yön sonradan yanlış çıksa bile birçok görüşe göre iade edilmez.',
  },
  {
    id: 'kible',
    patterns: [/kible/, /kabe/],
    keywords: ['kible', 'kabe'],
    question: 'Kıble neresidir?',
    answer:
      'Kıble, Mekke’deki Kâbe yönüdür. Namazda bu yöne dönmek farzdır. Uygulamadaki Kıble sekmesi yardımcı olur; camideki kıble işaretine de uyabilirsiniz.',
  },
  {
    id: 'teravih',
    patterns: [/teravih/],
    keywords: ['teravih'],
    question: 'Teravih namazı nedir?',
    answer:
      'Teravih, Ramazan gecelerinde yatsıdan sonra kılınan müekked sünnettir. Diyanet uygulamasında genellikle 20 rekât kıldırılır; tek başına da kılınabilir.',
  },
  {
    id: 'kadin-namaz',
    patterns: [/hayiz/, /nifas/, /\badet\b/],
    keywords: ['hayiz', 'nifas', 'adet'],
    question: 'Hayızda namaz ve oruç nasıl olur?',
    answer:
      'Hayız ve nifasta namaz ve oruç tutulmaz. Namazlar kaza edilmez; oruçlar sonra kaza edilir. Temizlik sonrası gusül alınır.',
  },
  {
    id: 'cuma',
    patterns: [/cuma/, /hutbe/],
    keywords: ['cuma', 'hutbe'],
    question: 'Cuma namazı kimlere farzdır?',
    answer:
      'Şartları taşıyan erkeklere farz-ı ayındır. Hutbeyi dinlemek namazın parçasıdır. Kadınlara farz değildir.',
  },
  {
    id: 'rekat',
    patterns: [/rekat/, /kac\s*rekat/, /(sabah|ogle|ikindi|aksam|yatsi).*(kac|rekat)/],
    keywords: ['rekat', 'kac rekat'],
    question: 'Namazlar kaç rekâttır?',
    answer:
      'Farzer (kısaca): Sabah 2, Öğle 4, İkindi 4, Akşam 3, Yatsı 4 rekât farzdır. Ayrıca sünnet rekâtları vardır. Ayrıntı için “Namaz Nasıl Kılınır?” bölümüne bakın.',
  },
  {
    id: 'teyemmum',
    patterns: [/teyemmum/, /toprak.*(abdest|namaz)/],
    keywords: ['teyemmum'],
    question: 'Teyemmüm nedir?',
    answer:
      'Su bulunamaz veya kullanılamazsa temiz toprakla yapılan abdest/gusül yerine geçen ruhsattır. Niyet edilip eller toprağa vurulur, yüz ve kollar mesh edilir.',
  },
  {
    id: 'namaz-genel',
    patterns: [/namaz/],
    keywords: ['namaz'],
    question: 'Namaz hakkında',
    answer:
      'Namaz İslam’ın şartlarındandır. Günde beş vakit farz namaz vardır: Sabah, Öğle, İkindi, Akşam, Yatsı.\n\nDaha spesifik sorabilirsin:\n• Namazın farzları neler?\n• Kaç rekât?\n• Kaçırınca kaza nasıl olur?\n• Abdest nasıl alınır?\n\nAyrıca uygulamadaki **Namaz Nasıl Kılınır?** bölümüne bakabilirsin.',
  },
  {
    id: 'esma',
    patterns: [/esma/, /99\s*isim/],
    keywords: ['esma', '99 isim'],
    question: "Esmaü'l-Hüsna nedir?",
    answer:
      "Esmaü'l-Hüsna, Allah’ın (c.c.) en güzel isimleridir. Uygulamadaki Esmaü'l-Hüsna bölümünden okuyabilirsiniz.",
  },
  {
    id: 'dua',
    patterns: [/\bdua\b/],
    keywords: ['dua'],
    question: 'Dua nasıl edilir?',
    answer:
      'Dua; samimiyet, helâl lokma ve tevazu ile Allah’a yönelmektir. Elleri açmak, hamd ve salât ile başlamak menduptur. Hazır dualar için Zikir & Dualar bölümüne bakın.',
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

/** Türkçe karakterleri sadeleştirir (eşleştirme için). */
export function normalize(text: string): string {
  return text
    .toLocaleLowerCase('tr')
    .replace(/ı/g, 'i')
    .replace(/ğ/g, 'g')
    .replace(/ü/g, 'u')
    .replace(/ş/g, 's')
    .replace(/ö/g, 'o')
    .replace(/ç/g, 'c')
    .replace(/[^a-z0-9\s]/g, ' ')
    .replace(/\s+/g, ' ')
    .trim();
}

/**
 * Serbest yazılan soruyu konuya bağlar.
 * Önce özel kalıplar (macun, kaza…), sonra genel konular.
 */
export function matchReligiousFaq(question: string): ReligiousFaqEntry | null {
  const q = normalize(question);
  if (q.length < 2) return null;

  // Liste sırası öncelik demektir (özel konular üstte).
  for (const entry of RELIGIOUS_FAQ) {
    for (const pattern of entry.patterns) {
      if (pattern.test(q)) return entry;
    }
    for (const keyword of entry.keywords) {
      const k = normalize(keyword);
      if (k.length >= 3 && q.includes(k)) return entry;
    }
  }

  return null;
}
