// @vitest-environment node
import { describe, expect, test, vi } from 'vitest';
import { buildRobots, buildSitemap, buildSitemapIndex } from '../sitemap';
import { resolveSiteUrl } from '../tmdb';

const SITE = 'https://sinefix.example';

describe('sitemap', () => {
  test('dizin tüm alt haritaları listeler', () => {
    const xml = buildSitemapIndex(SITE);
    ['pages', 'movies', 'series', 'people'].forEach(name => {
      expect(xml).toContain(`<loc>${SITE}/sitemaps/${name}.xml</loc>`);
    });
  });

  test('sayfa haritası statik sayfaları ve tür sayfalarını içerir', async () => {
    const xml = await buildSitemap('pages', { siteUrl: SITE });
    expect(xml).toContain(`<loc>${SITE}/ne-izlesem</loc>`);
    expect(xml).toContain(`<loc>${SITE}/movies/genre/bilim-kurgu</loc>`);
    expect(xml).toContain(`<loc>${SITE}/series/genre/suc</loc>`);
  });

  test('film haritası tekrarları ayıklar, afişi görsel olarak ekler, kaçış uygular', async () => {
    const tmdb = vi.fn(async (path, { page }) => ({
      results: page === 1
        ? [{ id: 1, title: 'Tom & Jerry', poster_path: '/a.jpg' }, { id: 2, title: 'B' }]
        : [{ id: 1, title: 'Tom & Jerry', poster_path: '/a.jpg' }],
    }));
    const xml = await buildSitemap('movies', { tmdb, siteUrl: SITE });
    expect(xml.match(/<url>/g)).toHaveLength(2);
    expect(xml).toContain(`<loc>${SITE}/movie/1/tom-jerry-izle</loc>`);
    expect(xml).toContain('<image:loc>https://image.tmdb.org/t/p/w780/a.jpg</image:loc>');
    expect(tmdb).toHaveBeenCalledWith('/movie/popular', { page: 1 });
  });

  test('bazı listeler başarısız olsa da harita üretilir', async () => {
    let calls = 0;
    const tmdb = vi.fn(async () => {
      calls += 1;
      if (calls % 2) throw new Error('timeout');
      return { results: [{ id: calls, name: `Dizi ${calls}` }] };
    });
    const xml = await buildSitemap('series', { tmdb, siteUrl: SITE });
    expect(xml).toContain('/tv/2/dizi-2-izle');
  });

  test('hepsi başarısızsa hata fırlatır (503 için)', async () => {
    const tmdb = vi.fn(async () => { throw new Error('down'); });
    await expect(buildSitemap('people', { tmdb, siteUrl: SITE })).rejects.toThrow('down');
  });

  test('bilinmeyen harita adı', async () => {
    expect(await buildSitemap('yok', { siteUrl: SITE })).toBeNull();
  });
});

describe('robots ve site adresi', () => {
  test('robots site haritasını mutlak adresle bildirir', () => {
    const robots = buildRobots(SITE);
    expect(robots).toContain(`Sitemap: ${SITE}/sitemap.xml`);
    expect(robots).toContain('Disallow: /watch/');
  });

  test('site adresi önceliği', () => {
    expect(resolveSiteUrl({ VITE_SITE_URL: 'https://a.example/' })).toBe('https://a.example');
    expect(resolveSiteUrl({ VERCEL_PROJECT_PRODUCTION_URL: 'sinefix.vercel.app' })).toBe('https://sinefix.vercel.app');
    expect(resolveSiteUrl({}, 'http://localhost:4173/movies')).toBe('http://localhost:4173');
  });
});
