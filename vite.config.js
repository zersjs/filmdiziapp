import { readFile } from 'node:fs/promises'
import { resolve } from 'node:path'
import { defineConfig, loadEnv } from 'vite'
import react from '@vitejs/plugin-react'
import { homePage, injectTemplate, renderPage } from './server/render.js'
import { SITEMAPS, buildRobots, buildSitemap, buildSitemapIndex } from './server/sitemap.js'
import { createTmdbFromEnv, resolveSiteUrl } from './server/tmdb.js'

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

const send = (res, { status = 200, headers = {}, body = '' }) => {
  res.statusCode = status;
  Object.entries(headers).forEach(([name, value]) => res.setHeader(name, value));
  res.end(body);
};

// /sitemap.xml, /sitemaps/*.xml ve /robots.txt — üretimdeki api/sitemap.js ve api/robots.js ile aynı çıktı.
const seoFilesMiddleware = (env) => async (req, res, next) => {
  const url = new URL(req.url, 'http://localhost');
  const siteUrl = resolveSiteUrl(env, `http://${req.headers.host}`);
  try {
    if (url.pathname === '/robots.txt') {
      return send(res, { headers: { 'Content-Type': 'text/plain; charset=utf-8' }, body: buildRobots(siteUrl) });
    }
    if (url.pathname === '/sitemap.xml') {
      return send(res, { headers: { 'Content-Type': 'application/xml; charset=utf-8' }, body: buildSitemapIndex(siteUrl) });
    }
    const match = url.pathname.match(/^\/sitemaps\/([a-z]+)\.xml$/);
    if (match && SITEMAPS.includes(match[1])) {
      const body = await buildSitemap(match[1], { tmdb: createTmdbFromEnv(env, { timeoutMs: 8000 }), siteUrl });
      return send(res, { headers: { 'Content-Type': 'application/xml; charset=utf-8' }, body });
    }
  } catch (error) {
    return next(error);
  }
  return next();
};

// Ana sayfa statik index.html olarak sunulduğu için onun etiketleri derlemede yazılır;
// diğer adresler api/render.js'ten geçer. `npm run preview` ikisini de taklit eder.
const seoHtml = (env) => {
  const siteUrl = resolveSiteUrl(env);
  let outDir = 'dist';
  return {
    name: 'sinefix-seo',
    configResolved(config) {
      outDir = resolve(config.root, config.build.outDir);
    },
    transformIndexHtml(html) {
      return injectTemplate(html, { siteUrl, ...homePage({ siteUrl }) });
    },
    configureServer(server) {
      server.middlewares.use(seoFilesMiddleware(env));
    },
    configurePreviewServer(server) {
      const tmdb = createTmdbFromEnv(env);
      server.middlewares.use(seoFilesMiddleware(env));
      server.middlewares.use(async (req, res, next) => {
        const { pathname } = new URL(req.url, 'http://localhost');
        if (req.method !== 'GET' || pathname === '/' || pathname.startsWith('/api/') || /\.[a-z0-9]+$/i.test(pathname)) return next();
        try {
          const template = await readFile(resolve(outDir, 'index.html'), 'utf8');
          send(res, await renderPage({ url: req.url, template, tmdb, siteUrl: resolveSiteUrl(env, `http://${req.headers.host}`) }));
        } catch (error) {
          next(error);
        }
      });
    },
  };
};

export default defineConfig(({ mode }) => {
  const env = loadEnv(mode, process.cwd(), '');
  const siteUrl = resolveSiteUrl(env);
  return {
  plugins: [react(), devApi(env), seoHtml(env)],
  // Canonical adresler için: VITE_SITE_URL yoksa Vercel'in üretim alan adı kullanılır.
  define: siteUrl && !env.VITE_SITE_URL ? { 'import.meta.env.VITE_SITE_URL': JSON.stringify(siteUrl) } : {},
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
  };
});
