export interface CalculationMethod {
  id: number;
  label: string;
}

/** Aladhan API'nin desteklediği yaygın hesaplama yöntemleri. */
export const CALCULATION_METHODS: CalculationMethod[] = [
  { id: 13, label: 'Diyanet İşleri Başkanlığı (Türkiye)' },
  { id: 3, label: 'Müslüman Dünya Birliği (MWL)' },
  { id: 2, label: 'İslami Bilimler Üniversitesi, Karaçi' },
  { id: 5, label: 'Mısır Din İşleri Yüksek Kurulu' },
  { id: 4, label: "Ümmü'l-Kurâ Üniversitesi, Mekke" },
  { id: 1, label: 'Karachi Üniversitesi' },
  { id: 7, label: 'Tahran Üniversitesi' },
  { id: 9, label: 'Kuveyt' },
  { id: 8, label: 'Körfez Bölgesi' },
  { id: 10, label: 'Katar' },
  { id: 11, label: 'Singapur (MUIS)' },
  { id: 12, label: 'Fransa (UOIF)' },
  { id: 15, label: 'Moonsighting Committee' },
  { id: 0, label: 'Jafari / Shia Ithna-Ashari' },
];

export const DEFAULT_METHOD_ID = 13;
