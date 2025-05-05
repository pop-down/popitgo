import { defineConfig } from 'vite'
import { svelte } from '@sveltejs/vite-plugin-svelte'
import { VitePWA } from 'vite-plugin-pwa'

export default defineConfig({
  plugins: [
    svelte(),
    VitePWA({
      registerType: 'autoUpdate',
      includeAssets: ['robots.txt', 'vite.svg'],
      manifest: {
        name: 'PopItGo - 팝업 예약 관리',
        short_name: 'PopItGo',
        description: '팝업 예약 및 관리를 위한 PWA 앱',
        theme_color: '#3B82F6',
        background_color: '#ffffff',
        icons: [
          {
            src: '/vite.svg',
            sizes: '192x192',
            type: 'image/svg+xml'
          }
        ],
        start_url: '/',
        display: 'standalone',
        orientation: 'portrait'
      }
    })
  ],
  base: '/'
})
