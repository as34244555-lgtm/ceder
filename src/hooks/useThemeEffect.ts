import { useEffect } from 'react';
import { Capacitor } from '@capacitor/core';
import type { ThemeMode } from '../types';
import { resolvePalette } from '../themePalettes';

export function useThemeEffect(theme: ThemeMode) {
  useEffect(() => {
    const root = document.documentElement;

    const apply = () => {
      const palette = resolvePalette(theme);
      root.setAttribute('data-theme', palette.id);
      root.setAttribute('data-appearance', palette.appearance);
      root.style.colorScheme = palette.appearance;
      const meta = document.querySelector('meta[name="theme-color"]');
      if (meta) meta.setAttribute('content', palette.bar);
      if (Capacitor.isNativePlatform()) {
        void import('@capacitor/status-bar').then(async ({ StatusBar, Style }) => {
          await StatusBar.setBackgroundColor({ color: palette.bar }).catch(() => undefined);
          await StatusBar.setStyle({
            style: palette.appearance === 'light' ? Style.Light : Style.Dark,
          }).catch(() => undefined);
        });
      }
    };

    apply();

    if (theme === 'system') {
      const mq = window.matchMedia('(prefers-color-scheme: light)');
      if (typeof mq.addEventListener === 'function') {
        mq.addEventListener('change', apply);
        return () => mq.removeEventListener('change', apply);
      }
      mq.addListener(apply);
      return () => mq.removeListener(apply);
    }
  }, [theme]);
}
