import { CloudSun, Moon, MoonStar, Sunrise, Sunset, SunMedium } from 'lucide-react';
import type { PrayerKey } from '../types';

export const PRAYER_ICONS: Record<PrayerKey, typeof Moon> = {
  imsak: Moon,
  gunes: Sunrise,
  ogle: SunMedium,
  ikindi: CloudSun,
  aksam: Sunset,
  yatsi: MoonStar,
};
