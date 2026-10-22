import { defineConfig, loadEnv } from 'vite'
import react from '@vitejs/plugin-react'

const readBody = (req) => new Promise((resolve, reject) => {
  const chunks = [];
  req.on('data', chunk => chunks.push(chunk));
  req.on('end', () => resolve(Buffer.concat(chunks)));
  req.on('error', reject);
});

// Geliştirmede /api/library isteklerini Vercel fonksiyonuyla aynı handler'a yönlendirir.
// Upstash değişkenleri tanımlı değilse bellek içi depo kullanılır (sunucu yeniden başlayınca sıfırlanır).
const devApi = (env) => ({
  name: 'sinefix-dev-api',
  configureServer(server) {
    server.middlewares.use(async (req, res, next) => {
      if (!req.url?.startsWith('/api/library')) return next();
      try {
        const { handleLibraryRequest } = await server.ssrLoadModule('/server/libraryHandler.js');
        const { createStoreFromEnv } = await server.ssrLoadModule('/server/store.js');
        const body = ['GET', 'HEAD'].includes(req.method) ? undefined : await readBody(req);
        const headers = new Headers();
        ['authorization', 'content-type'].forEach(name => {
          if (req.headers[name]) headers.set(name, req.headers[name]);
        });
        headers.set('x-forwarded-for', req.socket.remoteAddress || '127.0.0.1');
        const request = new Request(`http://localhost${req.url}`, { method: req.method, headers, body });
        const response = await handleLibraryRequest(request, { store: createStoreFromEnv(env, { allowMemory: true }) });
        res.statusCode = response.status;
        response.headers.forEach((value, name) => res.setHeader(name, value));
        res.end(Buffer.from(await response.arrayBuffer()));
      } catch (error) {
        next(error);
      }
    });
  },
});

export default defineConfig(({ mode }) => ({
  plugins: [react(), devApi(loadEnv(mode, process.cwd(), ''))],
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
        },
      },
    },
  },
}));
