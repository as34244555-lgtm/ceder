import { defineConfig } from 'vite'
import react from '@vitejs/plugin-react'
import tailwindcss from '@tailwindcss/vite'

// https://vite.dev/config/
export default defineConfig({
  plugins: [react(), tailwindcss()],
  server: {
    // Allows the dev server to be reached through tunneling tools
    // (e.g. Cloudflare Tunnel) which use a different Host header.
    allowedHosts: true,
  },
})
