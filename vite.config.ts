import { defineConfig } from 'vite'
import react from '@vitejs/plugin-react'
import tailwindcss from '@tailwindcss/vite'
import { VitePWA } from 'vite-plugin-pwa'

// https://vite.dev/config/
export default defineConfig({
  plugins: [
    react(),
    tailwindcss(),
    VitePWA({
      registerType: 'autoUpdate',
      includeAssets: ['favicon.svg', 'icons/*.png', 'audio/*.mp3'],
      manifest: {
        id: '/',
        name: 'Ezan Vakti — Namaz Vakitleri',
        short_name: 'Ezan Vakti',
        description:
          'Şehrinize veya konumunuza göre namaz vakitlerini gösteren, kıble pusulası, aylık takvim, tesbih ve dua içeren namaz vakti uygulaması.',
        lang: 'tr',
        start_url: '/',
        scope: '/',
        display: 'standalone',
        orientation: 'portrait',
        theme_color: '#0b3d2e',
        background_color: '#04120e',
        icons: [
          { src: '/icons/icon-192.png', sizes: '192x192', type: 'image/png', purpose: 'any' },
          { src: '/icons/icon-512.png', sizes: '512x512', type: 'image/png', purpose: 'any' },
          {
            src: '/icons/maskable-512.png',
            sizes: '512x512',
            type: 'image/png',
            purpose: 'maskable',
          },
        ],
      },
      workbox: {
        globPatterns: ['**/*.{js,css,html,svg,png,woff2}'],
        runtimeCaching: [
          {
            urlPattern: /^https:\/\/api\.aladhan\.com\/.*/i,
            handler: 'NetworkFirst',
            options: {
              cacheName: 'aladhan-api-cache',
              expiration: { maxEntries: 60, maxAgeSeconds: 60 * 60 * 24 * 7 },
              networkTimeoutSeconds: 8,
              cacheableResponse: { statuses: [0, 200] },
            },
          },
          {
            urlPattern: /^https:\/\/api\.bigdatacloud\.net\/.*/i,
            handler: 'NetworkFirst',
            options: {
              cacheName: 'geocode-cache',
              expiration: { maxEntries: 20, maxAgeSeconds: 60 * 60 * 24 },
            },
          },
          {
            urlPattern: /\/audio\/.*\.mp3$/i,
            handler: 'CacheFirst',
            options: {
              cacheName: 'adhan-audio-cache',
              expiration: { maxEntries: 5, maxAgeSeconds: 60 * 60 * 24 * 365 },
            },
          },
        ],
      },
      devOptions: {
        enabled: false,
      },
    }),
  ],
  server: {
    // Allows the dev server to be reached through tunneling tools
    // (e.g. Cloudflare Tunnel) which use a different Host header.
    allowedHosts: true,
  },
})
