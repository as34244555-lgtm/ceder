/** Yerel dini SSS — ağ olmasa bile hızlı ve isabetli cevap. */

export interface ReligiousFaqEntry {
  id: string;
  keywords: string[];
  question: string;
  answer: string;
}

export const RELIGIOUS_FAQ: ReligiousFaqEntry[] = [
  {
    id: 'namaz-farz',
    keywords: ['farz', 'namaz farz', 'namazin farz', 'rukun', 'rükün', 'rukuun'],
    question: 'Namazın farzları nelerdir?',
    answer:
      'Namazın farzları iki gruptur:\n\n**Namazdan önce (şartlar):** Hadesten taharet (abdest/gusül), necasetten taharet, setr-i avret, istikbal-i kıble, vakit, niyet.\n\n**Namazın içinde (rükünler):** İftitah tekbiri, kıyam, kıraat, rükû, secde, ka‘de-i ahîre (son oturuş).',
  },
  {
    id: 'abdest',
    keywords: ['abdest', 'abdest nasil', 'abdesti bozan', 'el yuz yikama'],
    question: 'Abdest nasıl alınır?',
    answer:
      'Kısaca abdest sırası: Niyet → ellere su → ağıza ve burna su → yüzü yıkama → kolları dirseklerle birlikte yıkama → başa meshetme → ayakları topuklarla birlikte yıkama.\n\nAbdesti bozan başlıca durumlar: idrar/dışkı/gaz, uyku (uyanıklığı gidecek şekilde), bayılma.',
  },
  {
    id: 'gusul',
    keywords: ['gusul', 'gusül', 'boy abdest', 'ihtilam', 'cunup', 'cünüp'],
    question: 'Gusül nasıl alınır?',
    answer:
      'Gusülde ağız ve burnun içi dahil bütün vücut yıkanır. Niyet edilir; ağız-burun temizlenir; tüm beden su ile yıkanır; saç diplerinin ıslanmasına dikkat edilir. Cünüplük ve hayız/nifas sonrası gusül gerekir.',
  },
  {
    id: 'oruc-bozan',
    keywords: ['oruc', 'oruç', 'orucu bozan', 'iftar', 'ramazan oruc', 'imsak'],
    question: 'Orucu bozan şeyler nelerdir?',
    answer:
      'Bile bile yemek-içmek ve cinsel ilişki orucu bozar. Unutarak yiyip içmek Hanefî mezhebinde bozmaz. Hastalık ve yolculukta ruhsat vardır. Kaza/kefaret durumu için müftülüğe danışın.',
  },
  {
    id: 'dis-macunu-oruc',
    keywords: ['dis macunu', 'diş macunu', 'macun', 'misvak', 'oruclu dis'],
    question: 'Oruçluyken diş macunu kullanılır mı?',
    answer:
      'Çoğu âlime göre diş macunu yutulmazsa orucu bozmaz; boğaza kaçırmamaya dikkat edilir. İsterseniz iftara kadar bekleyebilir veya misvak kullanabilirsiniz.',
  },
  {
    id: 'zekat',
    keywords: ['zekat', 'zekât', 'nisap', 'kime verilir', 'fitre'],
    question: 'Zekât kimlere verilir?',
    answer:
      'Kur’an’da (Tevbe 9/60) zekât sınıfları sayılır; başlıcaları fakirler, miskinler, borçlular ve Allah yolunda olanlardır. Ana-baba, eş ve usûl-fürû‘a zekât verilmez (mezheplere göre ayrıntı değişebilir). Uygulamadaki Zekât hesaplayıcısını kullanabilirsiniz.',
  },
  {
    id: 'kible',
    keywords: ['kible', 'kıble', 'kabe yonu', 'hangi yone'],
    question: 'Kıble neresidir?',
    answer:
      'Kıble, Mekke’deki Kâbe yönüdür. Namazda bu yöne dönmek farzdır. Uygulamadaki Kıble sekmesi yardımcı olur; camideki kıble işaretine de uyabilirsiniz.',
  },
  {
    id: 'kible-bilememe',
    keywords: ['kibleyi bilemez', 'kıbleyi bilemez', 'yon bilmiyorum', 'kible suphe'],
    question: 'Kıbleyi bilemezsem namazım olur mu?',
    answer:
      'Gücünüz yettiğince araştırıp doğru yöne dönün. Araştırma sonrası içtihadınızla kıldığınız namaz, yön sonradan yanlış çıksa bile birçok görüşe göre iade edilmez.',
  },
  {
    id: 'teravih',
    keywords: ['teravih', 'teravih kac', 'teravih rekat'],
    question: 'Teravih namazı nedir?',
    answer:
      'Teravih, Ramazan gecelerinde yatsıdan sonra kılınan müekked sünnettir. Diyanet uygulamasında genellikle 20 rekât kıldırılır; tek başına da kılınabilir.',
  },
  {
    id: 'kadin-namaz',
    keywords: ['hayiz', 'hayız', 'adet', 'nifas', 'kadin namaz'],
    question: 'Hayızda namaz ve oruç nasıl olur?',
    answer:
      'Hayız ve nifasta namaz ve oruç tutulmaz. Namazlar kaza edilmez; oruçlar sonra kaza edilir. Temizlik sonrası gusül alınır.',
  },
  {
    id: 'cuma',
    keywords: ['cuma', 'cuma namaz', 'hutbe'],
    question: 'Cuma namazı kimlere farzdır?',
    answer:
      'Şartları taşıyan erkeklere farz-ı ayındır. Hutbeyi dinlemek namazın parçasıdır. Kadınlara farz değildir.',
  },
  {
    id: 'kaza',
    keywords: [
      'kaza',
      'kacirilan namaz',
      'kaçırılan namaz',
      'kacirinca',
      'kaçırınca',
      'borc namaz',
      'vakti gecen',
      'sabah namazi kacir',
    ],
    question: 'Kaçırılan namaz nasıl kılınır?',
    answer:
      'Vaktinde kılınamayan farz namazlar kaza edilir. “Kazaya kalan … namazını kılmaya” diye niyet edilir. Uygulamadaki Namazlarım sekmesinde kaza sayacı vardır.',
  },
  {
    id: 'rekat',
    keywords: ['rekat', 'rekât', 'kac rekat', 'öğle kac', 'ogle kac', 'yatsi kac'],
    question: 'Namazlar kaç rekâttır?',
    answer:
      'Farzer (kısaca): Sabah 2, Öğle 4, İkindi 4, Akşam 3, Yatsı 4 rekât farzdır. Ayrıca sünnet rekâtları vardır. Ayrıntı için “Namaz Nasıl Kılınır?” bölümüne bakın.',
  },
  {
    id: 'teyemmum',
    keywords: ['teyemmum', 'teyemmüm', 'toprak ile'],
    question: 'Teyemmüm nedir?',
    answer:
      'Su bulunamaz veya kullanılamazsa temiz toprakla yapılan abdest/gusül yerine geçen ruhsattır. Niyet edilip eller toprağa vurulur, yüz ve kollar mesh edilir.',
  },
  {
    id: 'esma',
    keywords: ['esma', 'esmaul', '99 isim'],
    question: "Esmaü'l-Hüsna nedir?",
    answer:
      "Esmaü'l-Hüsna, Allah’ın (c.c.) en güzel isimleridir. Uygulamadaki Esmaü'l-Hüsna bölümünden okuyabilirsiniz.",
  },
  {
    id: 'dua',
    keywords: ['nasil dua', 'dua nasil', 'dua nasil edilir'],
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

function normalize(text: string): string {
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

/** Tek kelime: aynı kök (namazın ↔ namaz). Çok kelime: hepsi bulunmalı. */
function tokenInHay(hayTokens: string[], word: string): boolean {
  const w = normalize(word);
  if (w.length < 3) return hayTokens.includes(w);
  const stemLen = Math.min(5, w.length);
  const stem = w.slice(0, stemLen);
  return hayTokens.some((t) => {
    if (t === w) return true;
    // ortak kök en az 4 harf
    if (stem.length >= 4 && t.startsWith(stem)) return true;
    if (t.length >= 4 && w.startsWith(t.slice(0, Math.min(5, t.length)))) return true;
    return false;
  });
}

function fuzzyHas(hay: string, needle: string): boolean {
  const n = normalize(needle);
  if (!n) return false;
  if (hay.includes(n)) return true;
  const parts = n.split(' ').filter(Boolean);
  const hayTokens = hay.split(' ').filter(Boolean);
  if (parts.length === 0) return false;
  return parts.every((part) => tokenInHay(hayTokens, part));
}

/** Anahtar kelime / kök eşleşmesi. */
export function matchReligiousFaq(question: string): ReligiousFaqEntry | null {
  const q = normalize(question);
  if (q.length < 2) return null;

  let best: { entry: ReligiousFaqEntry; score: number } | null = null;
  for (const entry of RELIGIOUS_FAQ) {
    let score = 0;
    for (const keyword of entry.keywords) {
      if (!fuzzyHas(q, keyword)) continue;
      const len = normalize(keyword).length;
      score += len >= 8 ? 4 : len >= 5 ? 3 : 2;
    }
    const nq = normalize(entry.question);
    if (hayIncludesQuestion(q, nq)) score += 5;
    if (!best || score > best.score) best = { entry, score };
  }

  return best && best.score >= 3 ? best.entry : null;
}

function hayIncludesQuestion(hay: string, questionNorm: string): boolean {
  if (hay.includes(questionNorm)) return true;
  const parts = questionNorm.split(' ').filter((p) => p.length >= 4);
  if (parts.length < 2) return false;
  const hayTokens = hay.split(' ').filter(Boolean);
  return parts.every((p) => tokenInHay(hayTokens, p));
}
