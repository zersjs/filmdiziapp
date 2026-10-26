// Sayfa başlığı, açıklama, canonical yol ve yapılandırılmış veri (JSON-LD) üreticileri.
// Tarayıcıdaki <Seo> bileşeni ile sunucudaki api/render.js aynı fonksiyonları kullanır;
// böylece arama motoruna giden ilk HTML ile JavaScript sonrası sayfa birebir tutarlı olur.
import { tmdbImage } from './tmdbConfig.js';
import { genreById, genreHeading, genrePath } from './genres.js';
import { createSlug, getPersonPath } from '../utils/helpers.js';

export const SITE_NAME = 'SINEFIX';
export const DEFAULT_TITLE = 'SINEFIX — Film ve dizi keşfet';
export const DEFAULT_DESCRIPTION =
  "Popüler, yeni ve en yüksek puanlı filmleri ve dizileri keşfet; fragmanları izle, Türkiye'de hangi platformda olduklarını öğren ve izleme listeni oluştur.";
export const DEFAULT_IMAGE_PATH = '/og-image.png';

// İndekslenmemesi gereken (ince/kişisel/üçüncü taraf içerikli) sayfalar
export const NOINDEX_PREFIXES = ['/watch/', '/search', '/favorites', '/watch-later', '/izlediklerim', '/ayarlar'];

export const STATIC_PAGES = {
  '/': { title: null, description: DEFAULT_DESCRIPTION },
  '/movies': {
    title: 'Filmler: popüler, yeni ve en iyi filmler',
    description: 'Popüler, vizyondaki, yakında çıkacak ve en yüksek puanlı filmleri tür, yıl, puan ve platforma göre filtrele.',
  },
  '/series': {
    title: 'Diziler: popüler ve en iyi diziler',
    description: 'Popüler, yayındaki ve en yüksek puanlı dizileri tür, yıl, puan ve platforma göre filtrele.',
  },
  '/sahneler': {
    title: 'Sahneler: film ve dizi fragmanları',
    description: 'Yeni ve popüler film ve dizi fragmanlarını dikey akışta keşfet, beğendiklerini listene ekle.',
  },
  '/ne-izlesem': {
    title: 'Ne izlesem? Ruh haline göre film ve dizi önerisi',
    description: 'Ruh haline, ayırabileceğin süreye ve abone olduğun platforma göre saniyeler içinde izlenecek film ya da dizi bul.',
  },
  '/sss': { title: 'Sıkça sorulan sorular', description: 'SINEFIX hakkında sıkça sorulan sorular ve cevapları.' },
  '/iletisim': { title: 'İletişim', description: 'Öneri, hata bildirimi ve sorularınız için SINEFIX ile iletişime geçin.' },
  '/gizlilik-politikasi': { title: 'Gizlilik politikası', description: 'SINEFIX hangi verileri tutar, nasıl saklar ve neden kullanır.' },
  '/kullanim-kosullari': { title: 'Kullanım koşulları', description: 'SINEFIX kullanım koşulları.' },
};

export const formatPageTitle = (title) => (title ? `${title} | ${SITE_NAME}` : DEFAULT_TITLE);

// Açıklamayı kelime sınırından keser (Google ~155-160 karakter gösterir).
export const clampText = (text, max = 158) => {
  const clean = String(text || '').replace(/\s+/g, ' ').trim();
  if (clean.length <= max) return clean;
  const cut = clean.slice(0, max - 1);
  const lastSpace = cut.lastIndexOf(' ');
  return `${(lastSpace > max * 0.6 ? cut.slice(0, lastSpace) : cut).replace(/[\s,;:.-]+$/, '')}…`;
};

export const isNoindexPath = (path) => NOINDEX_PREFIXES.some(prefix => path === prefix || path.startsWith(prefix));

export const absoluteUrl = (siteUrl, path) => {
  if (!path) return siteUrl;
  if (/^https?:\/\//.test(path)) return path;
  return `${siteUrl.replace(/\/$/, '')}${path.startsWith('/') ? path : `/${path}`}`;
};

export const isoDuration = (minutes) => {
  if (!minutes || minutes <= 0) return undefined;
  const hours = Math.floor(minutes / 60);
  const mins = minutes % 60;
  return `PT${hours ? `${hours}H` : ''}${mins ? `${mins}M` : ''}`;
};

const compact = (value) => {
  if (Array.isArray(value)) {
    const items = value.map(compact).filter(v => v !== undefined);
    return items.length ? items : undefined;
  }
  if (value && typeof value === 'object') {
    const entries = Object.entries(value)
      .map(([key, v]) => [key, compact(v)])
      .filter(([, v]) => v !== undefined && v !== null && v !== '');
    return entries.length ? Object.fromEntries(entries) : undefined;
  }
  return value === null || value === '' ? undefined : value;
};

const mediaTitle = (media) => media.title || media.name || '';
const mediaYear = (media) => (media.release_date || media.first_air_date || '').slice(0, 4);

export const mediaPath = (mediaType, media) => `/${mediaType}/${media.id}/${createSlug(mediaTitle(media))}`;

const pickTrailerVideo = (videos = []) =>
  videos.find(v => v.site === 'YouTube' && v.type === 'Trailer' && v.official && v.published_at) ||
  videos.find(v => v.site === 'YouTube' && v.type === 'Trailer' && v.published_at) ||
  null;

const personRef = (siteUrl) => (person) => ({
  '@type': 'Person',
  name: person.name,
  url: absoluteUrl(siteUrl, getPersonPath(person)),
});

const trailerObject = (media, title) => {
  const video = pickTrailerVideo(media.videos?.results);
  if (!video) return undefined;
  return {
    '@type': 'VideoObject',
    name: video.name || `${title} fragmanı`,
    description: clampText(media.overview || `${title} fragmanı`, 300),
    thumbnailUrl: [`https://i.ytimg.com/vi/${video.key}/hqdefault.jpg`],
    uploadDate: video.published_at,
    embedUrl: `https://www.youtube.com/embed/${video.key}`,
  };
};

export const breadcrumbJsonLd = (crumbs, siteUrl) => ({
  '@context': 'https://schema.org',
  '@type': 'BreadcrumbList',
  itemListElement: crumbs.map((crumb, index) => ({
    '@type': 'ListItem',
    position: index + 1,
    name: crumb.name,
    item: absoluteUrl(siteUrl, crumb.path),
  })),
});

// Google'ın site adı olarak göstermesi için (arama kutusu özelliği 2024'te kaldırıldı).
export const websiteJsonLd = (siteUrl) => ({
  '@context': 'https://schema.org',
  '@type': 'WebSite',
  name: SITE_NAME,
  url: absoluteUrl(siteUrl, '/'),
  inLanguage: 'tr-TR',
});

// Not: TMDB oyları başka bir siteye ait olduğundan aggregateRating olarak işaretlenmez
// (Google, başka sitelerden toplanan puanların yapılandırılmış veride kullanılmasına izin vermez).
export const mediaJsonLd = (mediaType, media, siteUrl) => {
  const title = mediaTitle(media);
  const isTv = mediaType === 'tv';
  const cast = (isTv ? media.aggregate_credits?.cast : media.credits?.cast) || [];
  const directors = (media.credits?.crew || []).filter(p => p.job === 'Director');
  const imdbId = media.imdb_id || media.external_ids?.imdb_id;
  const original = media.original_title || media.original_name;

  return compact({
    '@context': 'https://schema.org',
    '@type': isTv ? 'TVSeries' : 'Movie',
    name: title,
    alternateName: original && original !== title ? original : undefined,
    url: absoluteUrl(siteUrl, mediaPath(mediaType, media)),
    image: tmdbImage(media.poster_path, 'w780'),
    description: clampText(media.overview, 500),
    genre: (media.genres || []).map(g => g.name),
    inLanguage: media.original_language,
    datePublished: isTv ? undefined : media.release_date,
    startDate: isTv ? media.first_air_date : undefined,
    endDate: isTv && media.status === 'Ended' ? media.last_air_date : undefined,
    duration: isTv ? undefined : isoDuration(media.runtime),
    numberOfSeasons: isTv ? media.number_of_seasons : undefined,
    numberOfEpisodes: isTv ? media.number_of_episodes : undefined,
    director: isTv ? undefined : directors.map(personRef(siteUrl)),
    creator: isTv ? (media.created_by || []).map(personRef(siteUrl)) : undefined,
    actor: cast.slice(0, 10).map(personRef(siteUrl)),
    productionCompany: (media.production_companies || []).slice(0, 3).map(c => ({ '@type': 'Organization', name: c.name })),
    trailer: trailerObject(media, title),
    sameAs: imdbId ? [`https://www.imdb.com/title/${imdbId}/`] : undefined,
  });
};

export const mediaBreadcrumbs = (mediaType, media) => {
  const isTv = mediaType === 'tv';
  const firstGenre = media.genres?.map(g => genreById(mediaType, g.id)).find(Boolean);
  return [
    { name: 'Ana Sayfa', path: '/' },
    { name: isTv ? 'Diziler' : 'Filmler', path: isTv ? '/series' : '/movies' },
    ...(firstGenre ? [{ name: firstGenre.name, path: genrePath(mediaType, firstGenre) }] : []),
    { name: mediaTitle(media), path: mediaPath(mediaType, media) },
  ];
};

export const mediaSeo = (mediaType, media, siteUrl) => {
  const title = mediaTitle(media);
  const year = mediaYear(media);
  const label = mediaType === 'tv' ? 'dizi' : 'film';
  const breadcrumbs = mediaBreadcrumbs(mediaType, media);
  return {
    title: `${title}${year ? ` (${year})` : ''}`,
    description: clampText(
      media.overview ||
      `${title}${year ? ` (${year})` : ''} ${label} hakkında oyuncular, fragman, puan ve Türkiye'de nerede izlenebileceği bilgisi.`
    ),
    path: mediaPath(mediaType, media),
    image: tmdbImage(media.backdrop_path, 'w1280') || tmdbImage(media.poster_path, 'w780'),
    imageAlt: `${title} ${label} görseli`,
    ogType: mediaType === 'tv' ? 'video.tv_show' : 'video.movie',
    breadcrumbs,
    jsonLd: [mediaJsonLd(mediaType, media, siteUrl), breadcrumbJsonLd(breadcrumbs, siteUrl)],
  };
};

export const personSeo = (person, siteUrl) => {
  const path = getPersonPath(person);
  const breadcrumbs = [{ name: 'Ana Sayfa', path: '/' }, { name: person.name, path }];
  const ids = person.external_ids || {};
  return {
    title: person.name,
    description: clampText(person.biography || `${person.name} filmleri, dizileri ve biyografisi.`),
    path,
    image: tmdbImage(person.profile_path, 'h632'),
    imageAlt: person.name,
    ogType: 'profile',
    breadcrumbs,
    jsonLd: [
      compact({
        '@context': 'https://schema.org',
        '@type': 'Person',
        name: person.name,
        url: absoluteUrl(siteUrl, path),
        image: tmdbImage(person.profile_path, 'h632'),
        description: clampText(person.biography, 500),
        birthDate: person.birthday,
        deathDate: person.deathday,
        birthPlace: person.place_of_birth,
        sameAs: [
          ids.imdb_id && `https://www.imdb.com/name/${ids.imdb_id}/`,
          ids.instagram_id && `https://www.instagram.com/${ids.instagram_id}/`,
          ids.twitter_id && `https://x.com/${ids.twitter_id}`,
        ].filter(Boolean),
      }),
      breadcrumbJsonLd(breadcrumbs, siteUrl),
    ],
  };
};

export const genreSeo = (mediaType, genre, siteUrl, items = []) => {
  const heading = genreHeading(mediaType, genre);
  const path = genrePath(mediaType, genre);
  const plural = mediaType === 'tv' ? 'dizilerini' : 'filmlerini';
  const breadcrumbs = [
    { name: 'Ana Sayfa', path: '/' },
    { name: mediaType === 'tv' ? 'Diziler' : 'Filmler', path: mediaType === 'tv' ? '/series' : '/movies' },
    { name: genre.name, path },
  ];
  return {
    title: `${heading}: popüler ve en iyi ${mediaType === 'tv' ? 'diziler' : 'filmler'}`,
    description: clampText(
      `En popüler ${genre.name.toLocaleLowerCase('tr-TR')} ${plural} keşfet: puanlar, fragmanlar ve Türkiye'de hangi platformda izlenebilecekleri.`
    ),
    path,
    breadcrumbs,
    jsonLd: [
      breadcrumbJsonLd(breadcrumbs, siteUrl),
      ...(items.length
        ? [{
          '@context': 'https://schema.org',
          '@type': 'ItemList',
          itemListElement: items.slice(0, 20).map((item, index) => ({
            '@type': 'ListItem',
            position: index + 1,
            url: absoluteUrl(siteUrl, mediaPath(mediaType, item)),
          })),
        }]
        : []),
    ],
  };
};
