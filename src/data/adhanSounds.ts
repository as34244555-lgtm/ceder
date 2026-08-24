import type { AdhanSoundId } from '../types';

export interface AdhanSoundOption {
  id: AdhanSoundId;
  label: string;
  description: string;
  fullSrc: string;
  previewSrc: string;
}

const audioBase = `${import.meta.env.BASE_URL}audio/`;

export const ADHAN_SOUNDS: AdhanSoundOption[] = [
  {
    id: 'makkah',
    label: 'Mekke — Ali Ahmed Mulla',
    description: 'Mescid-i Haram (kamu malı)',
    fullSrc: `${audioBase}makkah-ali-mulla.mp3`,
    previewSrc: `${audioBase}makkah-ali-mulla-preview.mp3`,
  },
  {
    id: 'madinah',
    label: 'Medine — Sabah Ezanı',
    description: 'Mescid-i Nebevi sabah (kamu malı)',
    fullSrc: `${audioBase}madinah-fajr.mp3`,
    previewSrc: `${audioBase}madinah-fajr-preview.mp3`,
  },
  {
    id: 'sabah',
    label: 'Sabah Fakhry',
    description: 'Klasik Suriye üslubu (kamu malı)',
    fullSrc: `${audioBase}sabah-fakhry.mp3`,
    previewSrc: `${audioBase}sabah-fakhry-preview.mp3`,
  },
  {
    id: 'aaqib',
    label: 'Aaqib Azeez',
    description: 'Net stüdyo kaydı (CC BY-SA 4.0)',
    fullSrc: `${audioBase}aaqib-azeez.mp3`,
    previewSrc: `${audioBase}aaqib-azeez-preview.mp3`,
  },
  {
    id: 'aqsa',
    label: 'Kudüs — Mescid-i Aksa',
    description: 'Al-Aqsa ezanı',
    fullSrc: `${audioBase}aqsa.mp3`,
    previewSrc: `${audioBase}aqsa-preview.mp3`,
  },
  {
    id: 'klcc',
    label: 'Malezya — KLCC',
    description: 'CC0 saha kaydı',
    fullSrc: `${audioBase}klcc.mp3`,
    previewSrc: `${audioBase}klcc-preview.mp3`,
  },
  {
    id: 'mishary',
    label: 'Mishary Alafasy',
    description: 'Kuveyt üslubu',
    fullSrc: `${audioBase}mishary.mp3`,
    previewSrc: `${audioBase}mishary-preview.mp3`,
  },
];

export function getAdhanSound(id: AdhanSoundId): AdhanSoundOption {
  return ADHAN_SOUNDS.find((s) => s.id === id) ?? ADHAN_SOUNDS[0]!;
}
