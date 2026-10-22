// @vitest-environment node
import { describe, expect, test, vi } from 'vitest';
import { escapeHtml, jsonForScript, renderPage, resolveRoute } from '../render';
import { TmdbError } from '../tmdb';

const TEMPLATE = `<!doctype html><html><head>
<!--seo-head--><title>x</title><!--/seo-head-->
</head><body><div id="root"><!--seo-body--><!--/seo-body--></div></body></html>`;
const SITE = 'https://sinefix.example';

const MOVIE = {
  id: 550,
  title: 'Dövüş Kulübü',
  original_title: 'Fight Club',
  release_date: '1999-10-15',
  runtime: 139,
  overview: 'Bir sabun satıcısı ve </script><script>alert(1)</script> uykusuz bir adam.',
  backdrop_path: '/backdrop.jpg',
  poster_path: '/poster.jpg',
  genres: [{ id: 18, name: 'Dram' }],
  credits: { cast: [{ id: 287, name: 'Brad Pitt' }], crew: [{ id: 7467, name: 'David Fincher', job: 'Director' }] },
  videos: { results: [] },
  recommendations: { results: [{ id: 680, title: 'Ucuz Roman', release_date: '1994-09-10' }] },
  'watch/providers': { results: { TR: { flatrate: [{ provider_id: 8, provider_name: 'Netflix' }] } } },
};

const fakeTmdb = (routes) => vi.fn(async (path) => {
  if (path in routes) return routes[path];
  throw new TmdbError(404, `TMDB 404 ${path}`);
});

const render = (url, tmdb = fakeTmdb({})) =>
  renderPage({ url, template: TEMPLATE, tmdb, siteUrl: SITE, logger: { error: () => {} } });

describe('resolveRoute', () => {
  test.each([
    ['/', { kind: 'home' }],
    ['/movie/550/dovus-kulubu-izle', { kind: 'media', mediaType: 'movie', id: '550', slug: 'dovus-kulubu-izle' }],
    ['/tv/1399', { kind: 'media', mediaType: 'tv', id: '1399', slug: undefined }],
    ['/person/287/brad-pitt', { kind: 'person', id: '287', slug: 'brad-pitt' }],
    ['/movies', { kind: 'list', mediaType: 'movie' }],
    ['/sss', { kind: 'static', page: '/sss' }],
    ['/sahneler/dovus-kulubu-movie-550', { kind: 'static', page: '/sahneler' }],
    ['/watch/movie/550/dovus-kulubu-izle', { kind: 'private' }],
    ['/search', { kind: 'private' }],
    ['/login', { kind: 'redirect', to: '/ayarlar' }],
    ['/movies/', { kind: 'redirect', to: '/movies' }],
    ['/genre/tv/18', { kind: 'redirect', to: '/series/genre/dram' }],
    ['/movies/genre/yok-boyle-tur', { kind: 'notFound' }],
    ['/movie/abc', { kind: 'notFound' }],
    ['/wp-admin', { kind: 'notFound' }],
  ])('%s', (path, expected) => {
    expect(resolveRoute(path)).toMatchObject(expected);
  });

  test('tür sayfası türü çözer', () => {
    expect(resolveRoute('/series/genre/suc').genre).toMatchObject({ id: 80, slug: 'suc' });
  });
});

describe('renderPage', () => {
  test('eksik slug kalıcı adrese 301 ile yönlenir, sorgu korunur', async () => {
    const result = await render('/movie/550?tab=cast', fakeTmdb({ '/movie/550': MOVIE }));
    expect(result.status).toBe(301);
    expect(result.headers.Location).toBe('/movie/550/dovus-kulubu-izle?tab=cast');
  });

  test('film sayfası: etiketler, JSON-LD ve içerik', async () => {
    const result = await render('/movie/550/dovus-kulubu-izle', fakeTmdb({ '/movie/550': MOVIE }));
    expect(result.status).toBe(200);
    expect(result.headers['Cache-Control']).toContain('s-maxage=3600');
    const html = result.body;
    expect(html).toContain('<title data-rh="true">Dövüş Kulübü (1999) | SINEFIX</title>');
    expect(html).toContain(`<link data-rh="true" rel="canonical" href="${SITE}/movie/550/dovus-kulubu-izle" />`);
    expect(html).toContain('"@type":"Movie"');
    expect(html).toContain('"duration":"PT2H19M"');
    expect(html).not.toContain('aggregateRating');
    expect(html).toContain('<a href="/person/7467/david-fincher">David Fincher</a>');
    expect(html).toContain('<a href="/movies/genre/dram">Dram</a>');
    expect(html).toContain('<a href="/movie/680/ucuz-roman-izle">Ucuz Roman (1994)</a>');
    expect(html).toContain('Netflix');
    expect(html).toContain('rel="preload" as="image"');
    // Özet içindeki HTML ne gövdeyi ne de JSON-LD bloğunu kırabilir
    expect(html).not.toContain('<script>alert(1)</script>');
    expect(html).toContain('&lt;/script&gt;&lt;script&gt;alert(1)');
    expect(html).toContain('\\u003c/script>\\u003cscript>alert(1)');
    expect(html.match(/<!--seo-head-->/g)).toHaveLength(1);
  });

  test('TMDB 404 → 404 ve noindex', async () => {
    const result = await render('/movie/999999/yok');
    expect(result.status).toBe(404);
    expect(result.body).toContain('content="noindex, follow"');
    expect(result.body).not.toContain('rel="canonical"');
  });

  test('TMDB erişilemezse sayfa yine açılır, kısa süre önbelleğe alınır', async () => {
    const tmdb = vi.fn(async () => { throw new Error('timeout'); });
    const result = await render('/movie/550/dovus-kulubu-izle', tmdb);
    expect(result.status).toBe(200);
    expect(result.headers['Cache-Control']).toContain('s-maxage=60');
  });

  test('kişi sayfası slug düzeltme', async () => {
    const tmdb = fakeTmdb({ '/person/287': { id: 287, name: 'Brad Pitt', combined_credits: { cast: [] } } });
    expect((await render('/person/287/yanlis', tmdb)).headers.Location).toBe('/person/287/brad-pitt');
    const ok = await render('/person/287/brad-pitt', tmdb);
    expect(ok.status).toBe(200);
    expect(ok.body).toContain('"@type":"Person"');
  });

  test('liste: sayfalama kendi adresine, filtreler ana adrese canonical olur', async () => {
    const tmdb = fakeTmdb({ '/discover/movie': { results: [{ id: 1, title: 'A' }], total_pages: 10 } });
    const paged = await render('/movies/genre/aksiyon?page=3', tmdb);
    expect(paged.body).toContain(`href="${SITE}/movies/genre/aksiyon?page=3"`);
    expect(paged.body).toContain('Aksiyon filmleri (Sayfa 3)');
    expect(paged.body).toContain('"@type":"ItemList"');
    const filtered = await render('/movies/genre/aksiyon?year=2020&page=2', tmdb);
    expect(filtered.body).toContain(`rel="canonical" href="${SITE}/movies/genre/aksiyon"`);
    expect(tmdb).toHaveBeenCalledWith('/discover/movie', expect.objectContaining({ with_genres: 28, page: 3 }));
  });

  test('eski ?genre= adresi tür sayfasına yönlenir', async () => {
    const result = await render('/series?genre=18&sort=top_rated&page=4');
    expect(result.status).toBe(301);
    expect(result.headers.Location).toBe('/series/genre/dram?sort=top_rated');
  });

  test('kişisel sayfalar noindex, bilinmeyen adres 404', async () => {
    expect((await render('/watch/movie/550/x')).body).toContain('noindex');
    const missing = await render('/bilinmeyen');
    expect(missing.status).toBe(404);
  });

  test('protokolsüz adrese yönlendirme yapılmaz', async () => {
    const result = await render('/\\evil.example/');
    expect(result.status).toBe(404);
    expect(result.headers.Location).toBeUndefined();
  });

  test('bozuk yüzde kodlaması 404 döner', async () => {
    expect((await render('/movie/%E0%A4%A')).status).toBe(404);
  });
});

describe('kaçış yardımcıları', () => {
  test('escapeHtml', () => {
    expect(escapeHtml(`<a href="x">'&'</a>`)).toBe('&lt;a href=&quot;x&quot;&gt;&#39;&amp;&#39;&lt;/a&gt;');
  });

  test('jsonForScript', () => {
    expect(jsonForScript({ a: '</script>' })).toBe('{"a":"\\u003c/script>"}');
  });
});
