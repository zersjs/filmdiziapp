// "Ne izlesem?" öneri motoru: ruh hali, süre, dönem ve platform seçimlerini
// TMDB /discover parametrelerine çevirir. Seçimler adres çubuğunda tutulur;
// böylece bir öneri ekranı paylaşılabilir ve geri tuşuyla korunur.
import { WATCH_REGION } from '../lib/tmdbConfig.js';

export const TYPES = [
  { id: 'movie', label: 'Film' },
  { id: 'tv', label: 'Dizi' },
  { id: 'any', label: 'Fark etmez' },
];

// Türler arasında "veya" (|) kullanılır; without, ruh haline aykırı türleri dışarıda bırakır.
export const MOODS = [
  { id: 'gulmek', label: 'Gülmek istiyorum', movie: [35], tv: [35], without: { movie: [27, 53, 10752], tv: [80] } },
  { id: 'gerilim', label: 'Gerilsin', movie: [53, 9648, 80], tv: [80, 9648] },
  { id: 'korku', label: 'Korkmak istiyorum', movie: [27], tv: [9648, 10765], without: { movie: [16, 10751], tv: [10751, 16] } },
  { id: 'duygusal', label: 'Duygulanmak istiyorum', movie: [18, 10749], tv: [18] },
  { id: 'adrenalin', label: 'Adrenalin', movie: [28, 12], tv: [10759] },
  { id: 'dusundursun', label: 'Düşündürsün', movie: [878, 9648, 99], tv: [10765, 9648, 99] },
  { id: 'hafif', label: 'Kafa yormasın', movie: [35, 10751, 16], tv: [35, 10751, 16], without: { movie: [27, 53, 10752, 80], tv: [80, 10768] } },
  { id: 'gercek', label: 'Gerçek hikâyeler', movie: [99, 36], tv: [99] },
];

export const RUNTIMES = [
  { id: 'kisa', label: { movie: '1,5 saatten kısa', tv: 'Kısa bölümler' }, max: { movie: 95, tv: 35 } },
  { id: 'orta', label: { movie: '2 saate kadar', tv: '1 saate kadar' }, max: { movie: 125, tv: 65 } },
];

export const ERAS = [
  { id: 'yeni', label: 'Son 3 yıl' },
  { id: 'modern', label: "2000'ler ve sonrası" },
  { id: 'klasik', label: '2000 öncesi klasikler' },
];

const ids = (list) => list.map(item => item.id);

export const parseCriteria = (searchParams) => {
  const pick = (key, options) => (options.includes(searchParams.get(key)) ? searchParams.get(key) : '');
  return {
    type: pick('tur', ids(TYPES)) || 'any',
    mood: pick('mod', ids(MOODS)),
    runtime: pick('sure', ids(RUNTIMES)),
    era: pick('donem', ids(ERAS)),
    providers: (searchParams.get('platform') || '').split(',').filter(id => /^\d+$/.test(id)).slice(0, 8),
  };
};

export const criteriaToSearch = ({ type, mood, runtime, era, providers }) => {
  const params = new URLSearchParams();
  if (type && type !== 'any') params.set('tur', type);
  if (mood) params.set('mod', mood);
  if (runtime) params.set('sure', runtime);
  if (era) params.set('donem', era);
  if (providers?.length) params.set('platform', providers.join(','));
  return params;
};

export const typesFor = (type) => (type === 'any' ? ['movie', 'tv'] : [type]);

export const buildRecommendParams = (mediaType, criteria, page = 1, today = new Date()) => {
  const isMovie = mediaType === 'movie';
  const dateField = isMovie ? 'primary_release_date' : 'first_air_date';
  const params = {
    page,
    include_adult: false,
    sort_by: 'popularity.desc',
    // Popüler ama vasat yapımları ele: yeterince oy almış ve iyi puanlı olanlar
    'vote_average.gte': isMovie ? 6.8 : 7,
    'vote_count.gte': isMovie ? 300 : 150,
    // Kısa film ve tanıtım bölümlerini dışarıda bırak
    'with_runtime.gte': isMovie ? 60 : 15,
  };

  const mood = MOODS.find(m => m.id === criteria.mood);
  if (mood) {
    params.with_genres = mood[mediaType].join('|');
    if (mood.without?.[mediaType]) params.without_genres = mood.without[mediaType].join(',');
  }

  const runtime = RUNTIMES.find(r => r.id === criteria.runtime);
  if (runtime) params['with_runtime.lte'] = runtime.max[mediaType];

  const year = today.getFullYear();
  if (criteria.era === 'yeni') {
    params[`${dateField}.gte`] = `${year - 3}-01-01`;
    params['vote_count.gte'] = isMovie ? 150 : 80; // yeni yapımlar henüz az oy almış olur
  } else if (criteria.era === 'modern') {
    params[`${dateField}.gte`] = '2000-01-01';
  } else if (criteria.era === 'klasik') {
    params[`${dateField}.lte`] = '1999-12-31';
  }
  params[`${dateField}.lte`] ??= today.toISOString().slice(0, 10);

  if (criteria.providers?.length) {
    params.with_watch_providers = criteria.providers.join('|');
    params.watch_region = WATCH_REGION;
    params.with_watch_monetization_types = 'flatrate|free|ads';
  }

  return params;
};

// Öneri havuzu: afişi ve özeti olan, kitaplıkta veya daha önce gösterilenlerde bulunmayan
// yapımlar; film ve dizi listeleri dönüşümlü birleştirilip karıştırılır.
export const buildPool = (lists, { exclude = new Set(), random = Math.random } = {}) => {
  const merged = [];
  const longest = Math.max(0, ...lists.map(list => list.length));
  for (let i = 0; i < longest; i += 1) {
    lists.forEach(list => { if (list[i]) merged.push(list[i]); });
  }
  const pool = merged.filter(item =>
    item.poster_path && item.backdrop_path && item.overview && !exclude.has(`${item.media_type}-${item.id}`));
  for (let i = pool.length - 1; i > 0; i -= 1) {
    const j = Math.floor(random() * (i + 1));
    [pool[i], pool[j]] = [pool[j], pool[i]];
  }
  return pool;
};

// Tohumlu rastgele sayı üreteci (mulberry32): aynı tohum aynı sırayı verir,
// böylece kitaplığa ekleme gibi yeniden çizimler öneri sırasını karıştırmaz.
export const seededRandom = (seed) => {
  let t = seed >>> 0;
  return () => {
    t = (t + 0x6d2b79f5) >>> 0;
    let r = Math.imul(t ^ (t >>> 15), 1 | t);
    r = (r + Math.imul(r ^ (r >>> 7), 61 | r)) ^ r;
    return ((r ^ (r >>> 14)) >>> 0) / 4294967296;
  };
};
