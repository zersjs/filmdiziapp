import { defineConfig } from 'vite'
import react from '@vitejs/plugin-react'

export default defineConfig({
  plugins: [react()],
  server: {
    port: 3000,
    open: true
  },
  build: {
    rollupOptions: {
      output: {
        // Sık değişmeyen kütüphaneleri ayrı dosyalara böl; tarayıcı önbelleği uzun süre geçerli kalsın.
        manualChunks: {
          react: ['react', 'react-dom', 'react-router-dom', 'react-helmet-async'],
          query: ['@tanstack/react-query', 'axios'],
          supabase: ['@supabase/supabase-js'],
        },
      },
    },
  },
});
