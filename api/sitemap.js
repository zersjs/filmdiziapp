// Vercel Function: /sitemap.xml ve /sitemaps/<ad>.xml (vercel.json rewrite'ları).
import { SITEMAPS, buildSitemap, buildSitemapIndex } from '../server/sitemap.js';
import { createTmdbFromEnv, resolveSiteUrl } from '../server/tmdb.js';

const tmdb = createTmdbFromEnv(process.env, { timeoutMs: 6000 });

const xml = (body, cache) => new Response(body, {
  headers: { 'Content-Type': 'application/xml; charset=utf-8', 'Cache-Control': cache },
});

export const GET = async (request) => {
  const siteUrl = resolveSiteUrl(process.env, request.url);
  const name = new URL(request.url).searchParams.get('name');
  if (!name) return xml(buildSitemapIndex(siteUrl), 'public, max-age=0, s-maxage=86400');
  if (!SITEMAPS.includes(name)) return new Response('Not found', { status: 404 });
  try {
    return xml(await buildSitemap(name, { tmdb, siteUrl }), 'public, max-age=0, s-maxage=86400, stale-while-revalidate=604800');
  } catch (error) {
    console.error('[sitemap]', name, error?.message || error);
    return new Response('TMDB unavailable', { status: 503, headers: { 'Retry-After': '3600', 'Cache-Control': 'no-store' } });
  }
};
