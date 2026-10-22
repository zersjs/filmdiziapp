// /sitemap.xml (dizin) ve /sitemaps/<ad>.xml dosyaları.
// İçerik listeleri TMDB'nin popüler, en yüksek puanlı ve haftanın trendleri listelerinden
// derlenir; film/dizi kayıtlarına afiş görselleri (image sitemap) eklenir.
import { STATIC_PAGES, absoluteUrl, mediaPath } from '../src/lib/seo.js';
import { GENRES, genrePath } from '../src/lib/genres.js';
import { tmdbImage } from '../src/lib/tmdbConfig.js';
import { getPersonPath } from '../src/utils/helpers.js';

export const SITEMAPS = ['pages', 'movies', 'series', 'people'];

const SOURCES = {
  movies: { mediaType: 'movie', lists: ['/movie/popular', '/movie/top_rated', '/trending/movie/week'], pages: 8 },
  series: { mediaType: 'tv', lists: ['/tv/popular', '/tv/top_rated', '/trending/tv/week'], pages: 8 },
  people: { lists: ['/person/popular', '/trending/person/week'], pages: 5 },
};

const xmlEscape = (value) => String(value).replace(/[&<>"']/g, char => ({
  '&': '&amp;', '<': '&lt;', '>': '&gt;', '"': '&quot;', "'": '&apos;',
}[char]));

const urlEntry = (loc, image) => [
  '<url>',
  `<loc>${xmlEscape(loc)}</loc>`,
  image ? `<image:image><image:loc>${xmlEscape(image)}</image:loc></image:image>` : '',
  '</url>',
].join('');

const urlset = (entries) => [
  '<?xml version="1.0" encoding="UTF-8"?>',
  '<urlset xmlns="http://www.sitemaps.org/schemas/sitemap/0.9" xmlns:image="http://www.google.com/schemas/sitemap-image/1.1">',
  ...entries,
  '</urlset>',
].join('\n');

export const buildSitemapIndex = (siteUrl) => [
  '<?xml version="1.0" encoding="UTF-8"?>',
  '<sitemapindex xmlns="http://www.sitemaps.org/schemas/sitemap/0.9">',
  ...SITEMAPS.map(name => `<sitemap><loc>${xmlEscape(absoluteUrl(siteUrl, `/sitemaps/${name}.xml`))}</loc></sitemap>`),
  '</sitemapindex>',
].join('\n');

const staticEntries = (siteUrl) => [
  ...Object.keys(STATIC_PAGES).map(path => urlEntry(absoluteUrl(siteUrl, path))),
  ...['movie', 'tv'].flatMap(mediaType => GENRES[mediaType].map(genre => urlEntry(absoluteUrl(siteUrl, genrePath(mediaType, genre))))),
];

// Listelerin bir kısmı başarısız olsa da diğerleriyle site haritası üretilir.
const collect = async (tmdb, { lists, pages }) => {
  const requests = lists.flatMap(list => Array.from({ length: pages }, (_, i) => tmdb(list, { page: i + 1 })));
  const settled = await Promise.allSettled(requests);
  const seen = new Set();
  const items = [];
  settled.forEach(result => {
    if (result.status !== 'fulfilled') return;
    (result.value.results || []).forEach(item => {
      if (seen.has(item.id) || item.adult) return;
      seen.add(item.id);
      items.push(item);
    });
  });
  if (!items.length && settled.some(result => result.status === 'rejected')) {
    throw settled.find(result => result.status === 'rejected').reason;
  }
  return items;
};

export const buildSitemap = async (name, { tmdb, siteUrl }) => {
  if (name === 'pages') return urlset(staticEntries(siteUrl));
  const source = SOURCES[name];
  if (!source) return null;
  const items = await collect(tmdb, source);
  const entries = name === 'people'
    ? items.filter(person => person.name).map(person => urlEntry(absoluteUrl(siteUrl, getPersonPath(person)), tmdbImage(person.profile_path, 'h632')))
    : items.filter(item => item.title || item.name).map(item => urlEntry(
      absoluteUrl(siteUrl, mediaPath(source.mediaType, item)),
      tmdbImage(item.poster_path, 'w780')
    ));
  return urlset(entries);
};

export const buildRobots = (siteUrl) => [
  'User-agent: *',
  'Allow: /',
  // Kişisel ve tekrar eden sayfalar; bunlarda ayrıca noindex etiketi de var.
  'Disallow: /api/',
  'Disallow: /search',
  'Disallow: /watch/',
  'Disallow: /ayarlar',
  'Disallow: /favorites',
  'Disallow: /watch-later',
  '',
  `Sitemap: ${absoluteUrl(siteUrl, '/sitemap.xml')}`,
  '',
].join('\n');
