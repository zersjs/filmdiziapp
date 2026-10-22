// Vercel Function: uygulama sayfalarının ilk HTML'i (bkz. server/render.js).
// vercel.json, statik dosya olmayan tüm adresleri /api/render?path=<adres> olarak buraya yönlendirir.
import { readFile } from 'node:fs/promises';
import { join } from 'node:path';
import { renderPage } from '../server/render.js';
import { createTmdbFromEnv, resolveSiteUrl } from '../server/tmdb.js';

const tmdb = createTmdbFromEnv(process.env);
let templatePromise;

// Şablon derlenmiş dist/index.html'dir (vercel.json → functions.includeFiles).
// Dosya pakete girmediyse aynı dağıtımdaki statik kopyası okunur.
const loadTemplate = (origin) => {
  templatePromise ??= readFile(join(process.cwd(), 'dist', 'index.html'), 'utf8')
    .catch(async () => {
      const response = await fetch(`${origin}/index.html`);
      if (!response.ok) throw new Error(`index.html alınamadı (${response.status})`);
      return response.text();
    })
    .catch((error) => {
      templatePromise = undefined;
      throw error;
    });
  return templatePromise;
};

export const GET = async (request) => {
  const requestUrl = new URL(request.url);
  const params = new URLSearchParams(requestUrl.search);
  const path = params.get('path') || (requestUrl.pathname.startsWith('/api/') ? '/' : requestUrl.pathname);
  params.delete('path');
  const query = params.toString();

  const template = await loadTemplate(requestUrl.origin);
  const result = await renderPage({
    url: `${path.startsWith('/') ? path : `/${path}`}${query ? `?${query}` : ''}`,
    template,
    tmdb,
    siteUrl: resolveSiteUrl(process.env, request.url),
  });
  return new Response(result.body || null, { status: result.status, headers: result.headers });
};

export const HEAD = async (request) => {
  const response = await GET(request);
  return new Response(null, { status: response.status, headers: response.headers });
};
