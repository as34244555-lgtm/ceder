/// <reference types="vite-plugin-pwa/client" />
import { StrictMode } from 'react';
import { createRoot } from 'react-dom/client';
import { Capacitor } from '@capacitor/core';
import './index.css';
import App from './App.tsx';
import { ErrorBoundary } from './components/ErrorBoundary.tsx';

async function disableNativeServiceWorker() {
  if (!('serviceWorker' in navigator)) return;
  try {
    const regs = await navigator.serviceWorker.getRegistrations();
    await Promise.all(regs.map((reg) => reg.unregister()));
  } catch {
    // ignore
  }
}

async function bootstrapNativeShell() {
  if (!Capacitor.isNativePlatform()) {
    void import('virtual:pwa-register')
      .then(({ registerSW }) => {
        registerSW({ immediate: true });
      })
      .catch(() => undefined);
    return;
  }

  await disableNativeServiceWorker();
  try {
    const { StatusBar, Style } = await import('@capacitor/status-bar');
    await StatusBar.setStyle({ style: Style.Dark });
    await StatusBar.setBackgroundColor({ color: '#0b3d2e' });
  } catch {
    // StatusBar plugin unavailable in some environments; ignore.
  }
}

async function hideNativeSplash() {
  if (!Capacitor.isNativePlatform()) return;
  try {
    const { SplashScreen } = await import('@capacitor/splash-screen');
    await SplashScreen.hide();
  } catch {
    // ignore
  }
}

void bootstrapNativeShell();

const root = document.getElementById('root');
if (!root) {
  throw new Error('root element missing');
}

createRoot(root).render(
  <StrictMode>
    <ErrorBoundary>
      <App />
    </ErrorBoundary>
  </StrictMode>,
);

requestAnimationFrame(() => {
  void hideNativeSplash();
});
