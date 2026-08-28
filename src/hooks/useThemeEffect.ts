import { useEffect } from 'react';
import type { ThemeMode } from '../types';

export function useThemeEffect(theme: ThemeMode) {
  useEffect(() => {
    const root = document.documentElement;

    const apply = () => {
      const resolved =
        theme === 'system'
          ? window.matchMedia('(prefers-color-scheme: light)').matches
            ? 'light'
            : 'dark'
          : theme;
      root.setAttribute('data-theme', resolved);
      const meta = document.querySelector('meta[name="theme-color"]');
      if (meta) meta.setAttribute('content', resolved === 'light' ? '#eef7f0' : '#0b3d2e');
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
