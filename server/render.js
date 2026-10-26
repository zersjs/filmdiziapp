// Arama motorları ve sosyal ağ önizlemeleri için sunucu tarafı sayfa hazırlığı.
//
// Uygulama tek sayfalık (SPA) bir React uygulamasıdır. Bu modül, istenen adres için
// dist/index.html şablonuna şunları ekler:
//   • sayfaya özel <title>, description, canonical, Open Graph/Twitter ve JSON-LD etiketleri
//     (tarayıcıdaki <Seo> bileşeniyle aynı lib/seo.js fonksiyonlarından üretilir),
//   • JavaScript çalıştırmayan tarayıcılar için anlamlı metin ve bağlantılar (.ssr-shell),
//   • doğru HTTP durumları: 301 (eski/eksik slug), 404 (olmayan içerik), 200.
// JavaScript açık kullanıcılar .ssr-shell'i hiç görmez (index.html'deki "js" sınıfı);
// React ilk çizimde #root içeriğini kendi arayüzüyle değiştirir.
import {
  DEFAULT_DESCRIPTION, DEFAULT_IMAGE_PATH, NOINDEX_PREFIXES, SITE_NAME, STATIC_PAGES,
  absoluteUrl, formatPageTitle, genreSeo, mediaPath, mediaSeo, personSeo, websiteJsonLd,
} from '../src/lib/seo.js';
import { GENRES, genreById, genreBySlug, genreHeading, genrePath } from '../src/lib/genres.js';
import { TMDB_IMAGE_BASE, WATCH_REGION } from '../src/lib/tmdbConfig.js';
import { createSlug, getPersonPath } from '../src/utils/helpers.js';

export const HEAD_BLOCK = /<!--seo-head-->[\s\S]*?<!--\/seo-head-->/;
export const BODY_BLOCK = /<!--seo-body-->[\s\S]*?<!--\/seo-body-->/;

const MEDIA_APPEND = {
  movie: 'credits,videos,recommendations,external_ids,watch/providers',
  tv: 'aggregate_credits,credits,videos,recommendations,external_ids,watch/providers',
};

const ACCOUNT_PATHS = ['/login', '/register', '/forgot-password'];

// ---------- HTML yardımcıları ----------

export const escapeHtml = (value) => String(value ?? '').replace(/[&<>"']/g, char => ({
  '&': '&amp;', '<': '&lt;', '>': '&gt;', '"': '&quot;', "'": '&#39;',
}[char]));

// "</script>" içeren bir metin JSON-LD bloğunu erken kapatamaz.
export const jsonForScript = (data) => JSON.stringify(data).replace(/</g, '\\u003c');

const tag = (name, attrs) => `<${name} data-rh="true" ${Object.entries(attrs)
  .map(([key, value]) => `${key}="${escapeHtml(value)}"`).join(' ')} />`;

const list = (items, render) => (items.length ? `<ul>${items.map(item => `<li>${render(item)}</li>`).join('')}</ul>` : '');
const link = (href, text) => `<a href="${escapeHtml(href)}">${escapeHtml(text)}</a>`;
const yearOf = (item) => (item.release_date || item.first_air_date || '').slice(0, 4);
const titleOf = (item) => item.title || item.name || '';

// <Seo> bileşeninin sunucudaki karşılığı; etiketler data-rh ile işaretlenir ki
// React Helmet sayfa açıldığında bunları devralıp güncelleyebilsin.
export const renderHead = ({
  siteUrl, title, description = DEFAULT_DESCRIPTION, path, image, imageAlt, type = 'website',
  noindex = false, jsonLd = [], preload,
}) => {
  const fullTitle = formatPageTitle(title);
  // Site adresi bilinmiyorsa (yerel derleme) göreli canonical yazmak yerine hiç yazılmaz.
  const canonical = path && /^https?:\/\//.test(siteUrl) ? absoluteUrl(siteUrl, path) : null;
  const ogImage = absoluteUrl(siteUrl, image || DEFAULT_IMAGE_PATH);
  const parts = [
    `<title data-rh="true">${escapeHtml(fullTitle)}</title>`,
    tag('meta', { name: 'description', content: description }),
    tag('meta', { name: 'robots', content: noindex ? 'noindex, follow' : 'index, follow, max-image-preview:large' }),
    canonical && !noindex && tag('link', { rel: 'canonical', href: canonical }),
    tag('meta', { property: 'og:site_name', content: SITE_NAME }),
    tag('meta', { property: 'og:locale', content: 'tr_TR' }),
    tag('meta', { property: 'og:type', content: type }),
    tag('meta', { property: 'og:title', content: fullTitle }),
    tag('meta', { property: 'og:description', content: description }),
    canonical && tag('meta', { property: 'og:url', content: canonical }),
    tag('meta', { property: 'og:image', content: ogImage }),
    imageAlt && tag('meta', { property: 'og:image:alt', content: imageAlt }),
    tag('meta', { name: 'twitter:card', content: 'summary_large_image' }),
    tag('meta', { name: 'twitter:title', content: fullTitle }),
    tag('meta', { name: 'twitter:description', content: description }),
    tag('meta', { name: 'twitter:image', content: ogImage }),
    ...jsonLd.filter(Boolean).map(data => `<script data-rh="true" type="application/ld+json">${jsonForScript(data)}</script>`),
    // Detay sayfasının en büyük görseli (LCP); srcset istemcideki <img> ile birebir aynıdır.
    preload && `<link rel="preload" as="image" imagesrcset="${escapeHtml(preload.srcset)}" imagesizes="${escapeHtml(preload.sizes)}" fetchpriority="high" />`,
  ];
  return `<!--seo-head-->\n    ${parts.filter(Boolean).join('\n    ')}\n    <!--/seo-head-->`;
};

const SHELL_NAV = [
  ['/', 'Ana Sayfa'], ['/movies', 'Filmler'], ['/series', 'Diziler'], ['/sahneler', 'Sahneler'], ['/ne-izlesem', 'Ne izlesem?'],
];

const breadcrumbsHtml = (crumbs = []) => (crumbs.length > 1
  ? `<nav aria-label="İçerik konumu"><ol>${crumbs.map((crumb, index) => (index === crumbs.length - 1
    ? `<li aria-current="page">${escapeHtml(crumb.name)}</li>`
    : `<li>${link(crumb.path, crumb.name)}</li>`)).join('')}</ol></nav>`
  : '');

const genreLinksHtml = (mediaType) =>
  `<nav aria-label="Türler">${list(GENRES[mediaType], g => link(genrePath(mediaType, g), genreHeading(mediaType, g)))}</nav>`;

export const renderShell = ({ breadcrumbs, content }) => `<!--seo-body--><div class="ssr-shell">
<header>${link('/', SITE_NAME)}<nav aria-label="Ana menü">${list(SHELL_NAV, ([href, text]) => link(href, text))}</nav></header>
<main>${breadcrumbsHtml(breadcrumbs)}${content}</main>
</div><!--/seo-body-->`;

const mediaItemsHtml = (items, mediaType) => list(
  items.filter(item => titleOf(item)),
  item => link(mediaPath(item.media_type || mediaType, item), `${titleOf(item)}${yearOf(item) ? ` (${yearOf(item)})` : ''}`)
);

// ---------- Adres çözümleme ----------

const MEDIA_ROUTE = /^\/(movie|tv)\/(\d+)(?:\/([^/]+))?$/;
const PERSON_ROUTE = /^\/person\/(\d+)(?:\/([^/]+))?$/;
const LIST_ROUTE = /^\/(movies|series)(?:\/genre\/([^/]+))?$/;
const LEGACY_GENRE_ROUTE = /^\/genre\/(movie|tv)\/(\d+)$/;

export const resolveRoute = (pathname) => {
  // "//site.com" gibi yollar asla yönlendirme hedefi olmamalı (protokolsüz adres = açık yönlendirme).
  if (pathname.startsWith('//')) return { kind: 'notFound' };
  if (pathname.length > 1 && pathname.endsWith('/')) return { kind: 'redirect', to: pathname.replace(/\/+$/, '') || '/' };
  if (pathname === '/') return { kind: 'home' };

  let match = pathname.match(MEDIA_ROUTE);
  if (match) return { kind: 'media', mediaType: match[1], id: match[2], slug: match[3] };

  match = pathname.match(PERSON_ROUTE);
  if (match) return { kind: 'person', id: match[1], slug: match[2] };

  match = pathname.match(LIST_ROUTE);
  if (match) {
    const mediaType = match[1] === 'series' ? 'tv' : 'movie';
    if (!match[2]) return { kind: 'list', mediaType };
    const genre = genreBySlug(mediaType, match[2]);
    return genre ? { kind: 'list', mediaType, genre } : { kind: 'notFound' };
  }

  match = pathname.match(LEGACY_GENRE_ROUTE);
  if (match) {
    const genre = genreById(match[1], match[2]);
    return { kind: 'redirect', to: genre ? genrePath(match[1], genre) : match[1] === 'tv' ? '/series' : '/movies' };
  }

  if (pathname === '/sahneler' || /^\/sahneler\/[^/]+$/.test(pathname)) return { kind: 'static', page: '/sahneler' };
  if (STATIC_PAGES[pathname]) return { kind: 'static', page: pathname };
  if (ACCOUNT_PATHS.includes(pathname) || pathname.startsWith('/profile/')) return { kind: 'redirect', to: '/ayarlar' };
  if (/^\/watch\/(movie|tv)\/\d+(\/[^/]+)?$/.test(pathname)) return { kind: 'private' };
  if (NOINDEX_PREFIXES.some(prefix => !prefix.endsWith('/') && pathname === prefix)) return { kind: 'private' };
  return { kind: 'notFound' };
};

// ---------- Sayfa içerikleri ----------

const notFoundPage = () => ({
  status: 404,
  head: { title: 'Sayfa bulunamadı', noindex: true },
  shell: { content: '<h1>Sayfa bulunamadı</h1><p>Aradığın sayfa taşınmış veya hiç var olmamış olabilir.</p>' },
});

const responsiveBackdrop = (path) => path && {
  srcset: ['w780 780w', 'w1280 1280w', 'original 1920w']
    .map(entry => { const [size, width] = entry.split(' '); return `${TMDB_IMAGE_BASE}/${size}${path} ${width}`; })
    .join(', '),
  sizes: '100vw',
};

const mediaPage = async ({ mediaType, id, slug }, { tmdb, siteUrl, search }) => {
  const media = await tmdb(`/${mediaType}/${id}`, {
    append_to_response: MEDIA_APPEND[mediaType],
    include_video_language: 'tr,en,null',
  });
  const canonicalSlug = createSlug(titleOf(media));
  if (slug !== canonicalSlug || String(media.id) !== id) {
    return { redirect: `/${mediaType}/${media.id}/${canonicalSlug}${search}` };
  }

  const seo = mediaSeo(mediaType, media, siteUrl);
  const isTv = mediaType === 'tv';
  const cast = ((isTv ? media.aggregate_credits?.cast : media.credits?.cast) || []).slice(0, 15);
  const directors = (media.credits?.crew || []).filter(person => person.job === 'Director');
  const makers = isTv ? media.created_by || [] : directors;
  const providers = media['watch/providers']?.results?.[WATCH_REGION]?.flatrate || [];
  const recommendations = (media.recommendations?.results || []).slice(0, 12);
  const genres = (media.genres || []).map(g => genreById(mediaType, g.id)).filter(Boolean);

  const facts = [
    genres.length && `<dt>Tür</dt><dd>${genres.map(g => link(genrePath(mediaType, g), g.name)).join(', ')}</dd>`,
    makers.length && `<dt>${isTv ? 'Yaratıcı' : 'Yönetmen'}</dt><dd>${makers.map(p => link(getPersonPath(p), p.name)).join(', ')}</dd>`,
    !isTv && media.runtime && `<dt>Süre</dt><dd>${media.runtime} dakika</dd>`,
    isTv && media.number_of_seasons && `<dt>Sezon</dt><dd>${media.number_of_seasons} sezon, ${media.number_of_episodes} bölüm</dd>`,
    (media.release_date || media.first_air_date) && `<dt>${isTv ? 'İlk yayın' : 'Vizyon'}</dt><dd>${escapeHtml(media.release_date || media.first_air_date)}</dd>`,
  ].filter(Boolean).join('');

  return {
    head: { ...seo, type: seo.ogType, preload: responsiveBackdrop(media.backdrop_path) },
    shell: {
      breadcrumbs: seo.breadcrumbs,
      content: [
        `<article><h1>${escapeHtml(seo.title)}</h1>`,
        media.tagline && `<p><em>${escapeHtml(media.tagline)}</em></p>`,
        media.overview && `<p>${escapeHtml(media.overview)}</p>`,
        facts && `<dl>${facts}</dl>`,
        providers.length && `<h2>Nerede izlenir?</h2><p>${providers.map(p => escapeHtml(p.provider_name)).join(', ')}</p>`,
        cast.length && `<h2>Oyuncular</h2>${list(cast, p => link(getPersonPath(p), p.name))}`,
        recommendations.length && `<h2>Bunları da beğenebilirsin</h2>${mediaItemsHtml(recommendations, mediaType)}`,
        '</article>',
      ].filter(Boolean).join(''),
    },
  };
};

const personPage = async ({ id, slug }, { tmdb, siteUrl }) => {
  const person = await tmdb(`/person/${id}`, { append_to_response: 'combined_credits,external_ids' });
  const path = getPersonPath(person);
  if (`/person/${id}${slug ? `/${slug}` : ''}` !== path) return { redirect: path };

  const seo = personSeo(person, siteUrl);
  const credits = [...(person.combined_credits?.cast || []), ...(person.combined_credits?.crew || [])]
    .filter(c => c.media_type === 'movie' || c.media_type === 'tv')
    .filter((c, i, all) => all.findIndex(x => x.media_type === c.media_type && x.id === c.id) === i)
    .sort((a, b) => (b.vote_count || 0) - (a.vote_count || 0))
    .slice(0, 24);

  return {
    head: { ...seo, type: seo.ogType },
    shell: {
      breadcrumbs: seo.breadcrumbs,
      content: [
        `<article><h1>${escapeHtml(person.name)}</h1>`,
        person.biography && `<p>${escapeHtml(person.biography)}</p>`,
        credits.length && `<h2>Bilinen yapımları</h2>${mediaItemsHtml(credits)}`,
        '</article>',
      ].filter(Boolean).join(''),
    },
  };
};

const listPage = async ({ mediaType, genre }, { tmdb, siteUrl, searchParams }) => {
  const basePath = genre ? genrePath(mediaType, genre) : mediaType === 'tv' ? '/series' : '/movies';
  const requestedPage = Number.parseInt(searchParams.get('page'), 10);
  const page = Number.isFinite(requestedPage) && requestedPage > 1 ? Math.min(requestedPage, 500) : 1;
  const refined = ['sort', 'year', 'rating', 'provider'].some(key => searchParams.get(key));

  const data = await tmdb(`/discover/${mediaType}`, {
    sort_by: 'popularity.desc', include_adult: false, page, with_genres: genre?.id,
  });
  const items = (data.results || []).map(item => ({ ...item, media_type: mediaType }));
  const seo = genre
    ? genreSeo(mediaType, genre, siteUrl, items)
    : { ...STATIC_PAGES[basePath], path: basePath, breadcrumbs: [], jsonLd: [] };
  const suffix = page > 1 ? ` (Sayfa ${page})` : '';
  const totalPages = Math.min(data.total_pages || 1, 500);

  return {
    head: {
      ...seo,
      title: `${seo.title}${suffix}`,
      path: refined || page === 1 ? basePath : `${basePath}?page=${page}`,
    },
    shell: {
      breadcrumbs: seo.breadcrumbs,
      content: [
        `<h1>${escapeHtml(genre ? genreHeading(mediaType, genre) : STATIC_PAGES[basePath].title)}${escapeHtml(suffix)}</h1>`,
        `<p>${escapeHtml(seo.description)}</p>`,
        mediaItemsHtml(items, mediaType),
        `<nav aria-label="Sayfalar">${[
          page > 1 && link(page === 2 ? basePath : `${basePath}?page=${page - 1}`, 'Önceki sayfa'),
          page < totalPages && link(`${basePath}?page=${page + 1}`, 'Sonraki sayfa'),
        ].filter(Boolean).join(' ')}</nav>`,
        genreLinksHtml(mediaType),
      ].join(''),
    },
  };
};

const staticPage = ({ page }) => {
  const meta = STATIC_PAGES[page];
  return {
    head: { ...meta, path: page },
    shell: { content: `<h1>${escapeHtml(meta.title || SITE_NAME)}</h1><p>${escapeHtml(meta.description)}</p>` },
  };
};

// Ana sayfa normalde statik index.html olarak sunulur (bkz. vite.config.js); bu yalnızca
// şablon üretimi ve önizleme sunucusu içindir.
export const homePage = ({ siteUrl }) => ({
  head: { path: '/', description: DEFAULT_DESCRIPTION, jsonLd: [websiteJsonLd(siteUrl)] },
  shell: {
    content: `<h1>${escapeHtml(SITE_NAME)}: film ve dizi keşfet</h1><p>${escapeHtml(DEFAULT_DESCRIPTION)}</p>${genreLinksHtml('movie')}${genreLinksHtml('tv')}`,
  },
});

export const injectTemplate = (template, { siteUrl, head, shell }) => template
  .replace(HEAD_BLOCK, () => renderHead({ siteUrl, ...head }))
  .replace(BODY_BLOCK, () => renderShell(shell || {}));

const CACHE = {
  ok: 'public, max-age=0, s-maxage=3600, stale-while-revalidate=86400',
  notFound: 'public, max-age=0, s-maxage=600',
  fallback: 'public, max-age=0, s-maxage=60',
  redirect: 'public, max-age=3600',
};

const htmlResponse = (status, body, cacheControl) => ({
  status,
  headers: { 'Content-Type': 'text/html; charset=utf-8', 'Cache-Control': cacheControl },
  body,
});

const redirectResponse = (location) => ({
  status: 301,
  headers: { Location: location, 'Cache-Control': CACHE.redirect },
  body: '',
});

// url: ziyaretçinin istediği adres (yol + sorgu). Sonuç { status, headers, body }.
export const renderPage = async ({ url, template, tmdb, siteUrl, logger = console }) => {
  // Göreli çözümleme yapılmaz: "//site.com" biçimli bir yol başka bir sunucu adı olarak yorumlanmasın.
  const { pathname, searchParams, search } = new URL(`http://localhost${url.startsWith('/') ? '' : '/'}${url}`);
  let route;
  try {
    route = resolveRoute(decodeURI(pathname));
  } catch {
    route = { kind: 'notFound' }; // bozuk yüzde kodlaması
  }
  const context = { tmdb, siteUrl, searchParams, search };
  const render = (page, status = 200, cache = CACHE.ok) =>
    htmlResponse(page.status || status, injectTemplate(template, { siteUrl, ...page }), page.status === 404 ? CACHE.notFound : cache);

  if (route.kind === 'redirect') return redirectResponse(`${route.to}${search}`);
  if (route.kind === 'notFound') return render(notFoundPage());
  if (route.kind === 'private') return render({ head: { noindex: true } });
  if (route.kind === 'static') return render(staticPage(route));
  if (route.kind === 'home') return render(homePage({ siteUrl }));

  // Eski ?genre=28 bağlantıları kalıcı tür adresine
  if (route.kind === 'list' && !route.genre && searchParams.get('genre')) {
    const genre = genreById(route.mediaType, searchParams.get('genre'));
    if (genre) {
      const rest = new URLSearchParams(searchParams);
      rest.delete('genre');
      rest.delete('page');
      const query = rest.toString();
      return redirectResponse(`${genrePath(route.mediaType, genre)}${query ? `?${query}` : ''}`);
    }
  }

  try {
    const page = route.kind === 'media'
      ? await mediaPage(route, context)
      : route.kind === 'person'
        ? await personPage(route, context)
        : await listPage(route, context);
    if (page.redirect) return redirectResponse(page.redirect);
    return render(page);
  } catch (error) {
    if (error?.status === 404) return render(notFoundPage());
    // TMDB'ye ulaşılamadı: sayfa yine açılır, yalnızca kısa süre önbelleğe alınır.
    logger.error?.('[render]', pathname, error?.message || error);
    if (route.kind === 'list') return render(staticListFallback(route), 200, CACHE.fallback);
    return render({ head: {} }, 200, CACHE.fallback);
  }
};

const staticListFallback = ({ mediaType, genre }) => {
  const seo = genre ? genreSeo(mediaType, genre, '') : { ...STATIC_PAGES[mediaType === 'tv' ? '/series' : '/movies'] };
  return {
    head: { title: seo.title, description: seo.description, path: genre ? genrePath(mediaType, genre) : mediaType === 'tv' ? '/series' : '/movies' },
    shell: { content: `<h1>${escapeHtml(seo.title)}</h1><p>${escapeHtml(seo.description)}</p>${genreLinksHtml(mediaType)}` },
  };
};
