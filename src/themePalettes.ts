import type { ThemeMode } from './types';

export type PaletteId = Exclude<ThemeMode, 'system'>;

export interface ThemePalette {
  id: PaletteId;
  label: string;
  description: string;
  bar: string;
  appearance: 'light' | 'dark';
  swatch: [string, string, string];
}

export const THEME_PALETTES: ThemePalette[] = [
  {
    id: 'dark',
    label: 'Zümrüt gece',
    description: 'Koyu yeşil, altın vurgu',
    bar: '#0b3d2e',
    appearance: 'dark',
    swatch: ['#04120e', '#0f4a37', '#f2c14e'],
  },
  {
    id: 'light',
    label: 'Açık',
    description: 'Sıcak fildişi zemin, koyu yazı',
    bar: '#f6f1e7',
    appearance: 'light',
    swatch: ['#f7f1e6', '#ffffff', '#8a5a10'],
  },
  {
    id: 'sand',
    label: 'Kum',
    description: 'Sıcak çöl aydınlığı',
    bar: '#f3e6cf',
    appearance: 'light',
    swatch: ['#f6ead4', '#fffaf2', '#8d4b12'],
  },
  {
    id: 'rose',
    label: 'Şafak',
    description: 'Yumuşak pembe sabah',
    bar: '#fde8e4',
    appearance: 'light',
    swatch: ['#fff1ee', '#ffffff', '#9a3d4a'],
  },
  {
    id: 'ocean',
    label: 'Gece denizi',
    description: 'Lacivert, soğuk altın',
    bar: '#0c1c33',
    appearance: 'dark',
    swatch: ['#07111f', '#163154', '#e4c16a'],
  },
  {
    id: 'olive',
    label: 'Zeytin',
    description: 'Toprak yeşili gece',
    bar: '#1c2614',
    appearance: 'dark',
    swatch: ['#12180c', '#2a381c', '#d7b15a'],
  },
  {
    id: 'mist',
    label: 'Sis',
    description: 'Serin gri aydınlık',
    bar: '#e7eaee',
    appearance: 'light',
    swatch: ['#f4f6f8', '#d5dbe3', '#3d4a5c'],
  },
  {
    id: 'sky',
    label: 'Gökyüzü',
    description: 'Açık mavi sabah',
    bar: '#e4eef8',
    appearance: 'light',
    swatch: ['#f3f8fd', '#c5daf0', '#1d4e89'],
  },
  {
    id: 'dusk',
    label: 'Mor gece',
    description: 'Menekşe alacakaranlık',
    bar: '#241433',
    appearance: 'dark',
    swatch: ['#140c1e', '#3a2158', '#e7c27a'],
  },
  {
    id: 'ink',
    label: 'Mürekkep',
    description: 'Kömür siyahı, gümüş yazı',
    bar: '#121417',
    appearance: 'dark',
    swatch: ['#0c0e11', '#2a3038', '#d7dde6'],
  },
];

export function paletteById(id: PaletteId): ThemePalette {
  return THEME_PALETTES.find((p) => p.id === id) ?? THEME_PALETTES[0];
}

export function resolvePalette(theme: ThemeMode): ThemePalette {
  if (theme === 'system') {
    const light =
      typeof window !== 'undefined' &&
      window.matchMedia('(prefers-color-scheme: light)').matches;
    return paletteById(light ? 'light' : 'dark');
  }
  return paletteById(theme);
}
