import type { AdhanSoundId } from '../types';

export interface AdhanSoundOption {
  id: AdhanSoundId;
  label: string;
  fullSrc: string;
  previewSrc: string;
}

const audioBase = `${import.meta.env.BASE_URL}audio/`;

export const ADHAN_SOUNDS: AdhanSoundOption[] = [
  {
    id: 'ses1',
    label: 'Ses 1',
    fullSrc: `${audioBase}adhan-full.mp3`,
    previewSrc: `${audioBase}adhan-preview.mp3`,
  },
  {
    id: 'ses2',
    label: 'Ses 2',
    fullSrc: `${audioBase}adhan-2-full.mp3`,
    previewSrc: `${audioBase}adhan-2-preview.mp3`,
  },
];

export function getAdhanSound(id: AdhanSoundId): AdhanSoundOption {
  return ADHAN_SOUNDS.find((s) => s.id === id) ?? ADHAN_SOUNDS[0];
}
