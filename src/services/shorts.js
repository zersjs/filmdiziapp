// Sahneler akışının saf (React'tan bağımsız) mantığı: aday kaynakları, fragman seçimi
// ve fragmanları ihtiyaç anında çözen akış motoru.
import { discoverService, movieService, trendingService, tvService } from './tmdb';

// ---------- Bağlantılar ----------

// /sahneler/:slug bağlantıları "<id>-<movie|tv>-<başlık>" biçimindedir.
export const createShortSlug = (item) => {
  if (!item) return null;
  const title = (item.title || item.name || '')
    .toLocaleLowerCase('tr-TR')
    .replace(/ı/g, 'i')
    .normalize('NFD')
    .replace(/[̀-ͯ]/g, '')
    .replace(/[^a-z0-9]+/g, '-')
    .replace(/^-+|-+$/g, '')
    .substring(0, 50);
  return `${item.id}-${item.media_type}${title ? `-${title}` : ''}`;
};

export const parseShortSlug = (slug) => {
  const match = /^(\d+)-(movie|tv)(?:-|$)/.exec(slug || '');
  return match ? { id: Number(match[1]), mediaType: match[2] } : null;
};

export const shortKey = (item) => `${item.media_type}-${item.id}`;

// ---------- Rastgelelik ----------

// Tohumlu üreteç: aynı oturumda ana sayfa önizlemesi ile akış aynı sırayı üretir.
export const createRandom = (seed) => {
  let state = seed >>> 0;
  return () => {
    state = (state + 0x6d2b79f5) >>> 0;
    let t = state;
    t = Math.imul(t ^ (t >>> 15), t | 1);
    t ^= t + Math.imul(t ^ (t >>> 7), t | 61);
    return ((t ^ (t >>> 14)) >>> 0) / 4294967296;
  };
};

export const shuffle = (items, random = Math.random) => {
  const copy = [...items];
  for (let i = copy.length - 1; i > 0; i -= 1) {
    const j = Math.floor(random() * (i + 1));
    [copy[i], copy[j]] = [copy[j], copy[i]];
  }
  return copy;
};

// ---------- Fragman seçimi ----------

// Tam fragman, Türkçe bir teaser'dan bile önce gelir; dil eşit türler arasında belirleyicidir.
const TYPE_SCORE = { Trailer: 40, Teaser: 20, Clip: 8, Featurette: 4 };

export const pickShortTrailer = (videos = [], blockedKeys = new Set()) => {
  let best = null;
  let bestScore = -Infinity;
  for (const video of videos) {
    if (video.site !== 'YouTube' || !video.key || blockedKeys.has(video.key) || !TYPE_SCORE[video.type]) continue;
    const score =
      TYPE_SCORE[video.type] +
      (video.official ? 10 : 0) +
      (video.iso_639_1 === 'tr' ? 15 : video.iso_639_1 === 'en' ? 5 : 0) +
      (video.size >= 1080 ? 3 : video.size >= 720 ? 2 : 0) +
      (Date.parse(video.published_at) || 0) / 1e13; // eşitlikte yeni olan
    if (score > bestScore) {
      best = video;
      bestScore = score;
    }
  }
  return best
    ? { key: best.key, name: best.name, type: best.type, language: best.iso_639_1, official: !!best.official }
    : null;
};

export const getTrailerLabel = (trailer) => {
  if (!trailer) return null;
  const kind = { Trailer: 'Fragman', Teaser: 'Teaser', Clip: 'Klip', Featurette: 'Kamera arkası' }[trailer.type] || 'Video';
  const language = trailer.language === 'tr' ? 'Türkçe' : trailer.language === 'en' ? 'İngilizce' : null;
  return [trailer.official ? `Resmi ${kind.toLocaleLowerCase('tr-TR')}` : kind, language].filter(Boolean).join(' · ');
};

// ---------- Kaynaklar ----------

const page = (request, mediaType) => request.then(({ data }) => ({
  results: (data.results || []).map(item => ({ ...item, media_type: item.media_type || mediaType })),
  totalPages: data.total_pages || 1,
}));

// Kitaplıktaki türlere göre en çok tekrar eden türler (kişiselleştirme için).
export const topGenres = (items = [], limit = 3) => {
  const counts = new Map();
  items.forEach(item => (item.genre_ids || []).forEach(id => counts.set(id, (counts.get(id) || 0) + 1)));
  return [...counts.entries()].sort((a, b) => b[1] - a[1]).slice(0, limit).map(([id]) => id);
};

export const createSources = (library = {}) => {
  // Favoriler izleme listesine göre iki kat ağırlıklı sayılır.
  const liked = [...(library.favorites || []), ...(library.favorites || []), ...(library.watchLater || [])];
  const movieGenres = topGenres(liked.filter(item => item.media_type === 'movie'));
  const tvGenres = topGenres(liked.filter(item => item.media_type === 'tv'));

  const sources = [
    { id: 'trending-day', maxPages: 5, fetch: (p) => page(trendingService.getAll('day', p)) },
    { id: 'now-playing', maxPages: 3, fetch: (p) => page(movieService.getNowPlaying(p), 'movie') },
    { id: 'popular-tv', maxPages: 5, fetch: (p) => page(tvService.getPopular(p), 'tv') },
    { id: 'upcoming', maxPages: 3, fetch: (p) => page(movieService.getUpcoming(p), 'movie') },
    { id: 'trending-week', maxPages: 5, fetch: (p) => page(trendingService.getAll('week', p)) },
    { id: 'top-movie', maxPages: 5, fetch: (p) => page(movieService.getTopRated(p), 'movie') },
    { id: 'top-tv', maxPages: 3, fetch: (p) => page(tvService.getTopRated(p), 'tv') },
  ];

  // Kişisel kaynaklar akışın başına yakın konur: kullanıcının sevdiği türler sık görünsün.
  if (tvGenres.length) {
    sources.splice(2, 0, {
      id: 'for-you-tv',
      maxPages: 5,
      fetch: (p) => page(discoverService.tv({ with_genres: tvGenres.join('|'), sort_by: 'popularity.desc', 'vote_count.gte': 150, page: p }), 'tv'),
    });
  }
  if (movieGenres.length) {
    sources.splice(1, 0, {
      id: 'for-you-movie',
      maxPages: 5,
      fetch: (p) => page(discoverService.movie({ with_genres: movieGenres.join('|'), sort_by: 'popularity.desc', 'vote_count.gte': 300, page: p }), 'movie'),
    });
  }
  return sources;
};

const isCandidate = (item) =>
  item &&
  Number.isInteger(item.id) &&
  (item.media_type === 'movie' || item.media_type === 'tv') &&
  !item.adult &&
  !!(item.poster_path || item.backdrop_path);

// ---------- Akış motoru ----------
//
// Kaynaklar sırayla (round-robin) tüketilir; böylece art arda gelen sahneler farklı
// listelerden gelir. Adayların fragmanları yalnızca ihtiyaç duyulduğunda ve
// `concurrency` kadar paralel çözülür. Fragmanı olmayan adaylar sessizce atlanır.
// Daha önce izlenenler (isExcluded) ilk turda atlanır; kaynaklar tükenirse ikinci
// turda onlara da izin verilir, böylece akış hiç bitmez.
export const createShortsEngine = ({
  sources,
  resolveTrailer,
  isExcluded = () => false,
  random = Math.random,
  concurrency = 4,
}) => {
  const served = new Set();
  const buffers = sources.map(() => []);
  const progress = sources.map(() => ({ page: 0, done: false, loading: null }));
  const ready = [];
  let cursor = 0;
  let relaxed = false;
  let primed = false;

  const loadPage = (index) => {
    const state = progress[index];
    if (state.done) return Promise.resolve();
    if (state.loading) return state.loading;
    state.page += 1;
    state.loading = sources[index].fetch(state.page)
      .then(({ results, totalPages }) => {
        if (state.page >= Math.min(totalPages, sources[index].maxPages || 5)) state.done = true;
        const fresh = results.filter(item =>
          isCandidate(item) && !served.has(shortKey(item)) && (relaxed || !isExcluded(item))
        );
        fresh.forEach(item => served.add(shortKey(item)));
        buffers[index].push(...shuffle(fresh, random));
      })
      .catch(() => {
        state.done = true;
      })
      .finally(() => {
        state.loading = null;
      });
    return state.loading;
  };

  const nextCandidate = async () => {
    for (let attempts = 0; attempts < sources.length * 4; attempts += 1) {
      const index = cursor % sources.length;
      cursor += 1;
      if (!buffers[index].length) await loadPage(index);
      if (buffers[index].length) return buffers[index].shift();

      const exhausted = progress.every(state => state.done) && buffers.every(buffer => !buffer.length);
      if (exhausted) {
        if (relaxed) return null;
        relaxed = true;
        progress.forEach(state => { state.page = 0; state.done = false; });
      }
    }
    return null;
  };

  return {
    // Hazır (fragmanı çözülmüş) en fazla `count` sahne döndürür. Boş dizi = akış bitti.
    async take(count) {
      if (!primed) {
        primed = true;
        await Promise.all(sources.map((_, index) => loadPage(index)));
      }
      while (ready.length < count) {
        const batch = [];
        while (batch.length < concurrency) {
          const candidate = await nextCandidate();
          if (!candidate) break;
          batch.push(candidate);
        }
        if (!batch.length) break;
        const resolved = await Promise.all(batch.map(async (candidate) => {
          try {
            const trailer = await resolveTrailer(candidate);
            return trailer ? { ...candidate, trailer } : null;
          } catch {
            return null;
          }
        }));
        ready.push(...resolved.filter(Boolean));
      }
      return ready.splice(0, count);
    },
    // Akışa dışarıdan eklenen (derin bağlantı, önizleme) öğelerin tekrar gelmesini engeller.
    markServed(item) {
      served.add(shortKey(item));
    },
  };
};

// ---------- Kalıcı küçük kümeler (izlenenler, oynatılamayanlar) ----------

const readList = (key) => {
  try {
    const value = JSON.parse(window.localStorage.getItem(key));
    return Array.isArray(value) ? value : [];
  } catch {
    return [];
  }
};

const createPersistentSet = (storageKey, max) => ({
  has: (value) => readList(storageKey).includes(value),
  values: () => new Set(readList(storageKey)),
  add: (value) => {
    const list = readList(storageKey).filter(entry => entry !== value);
    list.push(value);
    try {
      window.localStorage.setItem(storageKey, JSON.stringify(list.slice(-max)));
    } catch {
      // önemli değil
    }
  },
});

export const seenShorts = createPersistentSet('shortsSeen', 400);
export const blockedTrailers = createPersistentSet('shortsBlockedVideos', 300);

export const getSessionSeed = () => {
  try {
    const existing = Number(window.sessionStorage.getItem('shortsSeed'));
    if (existing) return existing;
    const seed = Math.floor(Math.random() * 2 ** 31) + 1;
    window.sessionStorage.setItem('shortsSeed', String(seed));
    return seed;
  } catch {
    return Math.floor(Math.random() * 2 ** 31) + 1;
  }
};
