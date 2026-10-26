// Kullanıcı kitaplığının veri modeli. Hem tarayıcı (AppContext) hem de
// senkronizasyon sunucusu (api/library.js) bu modülü kullanır; bu yüzden
// tarayıcıya veya Node'a özgü API içermez.
//
// Kitaplık = dört liste + her liste için "silinenler" (tombstone) kaydı.
// "watched": izlenen filmler ve dizilerde izlenen bölümler (episodes: ["1x1", "1x2", ...]).
// Bir dizinin bölüm listesi tek bir öğedir; iki cihazda aynı anda değişirse en son değişiklik kazanır.
// Silinenler, iki cihaz birleştirilirken bir cihazda silinen öğenin diğer
// cihazdan geri gelmesini engeller.

export const LISTS = {
  favorites: { limit: 500 },
  watchLater: { limit: 500 },
  continueWatching: { limit: 30 },
  watched: { limit: 1000 },
};

export const MAX_EPISODES_PER_SHOW = 2000;
const EPISODE_KEY = /^(\d{1,4})x(\d{1,5})$/;

export const LIST_NAMES = Object.keys(LISTS);

const TOMBSTONE_TTL_MS = 90 * 24 * 60 * 60 * 1000;
const MAX_TOMBSTONES = 1000;
const MAX_TEXT = 300;

export const itemKey = (item) => `${item.media_type}-${item.id}`;

const toTime = (value) => {
  const time = typeof value === 'string' ? Date.parse(value) : NaN;
  return Number.isFinite(time) ? time : 0;
};

export const itemTime = (item) => Math.max(toTime(item.updatedAt), toTime(item.addedAt));

export const emptyLibrary = () => ({
  ...Object.fromEntries(LIST_NAMES.map(list => [list, []])),
  removed: Object.fromEntries(LIST_NAMES.map(list => [list, {}])),
});

// "3x12" biçimindeki bölüm anahtarlarını doğrular, tekrarları atar ve sezon/bölüm sırasına dizer.
export const sanitizeEpisodes = (raw) => {
  if (!Array.isArray(raw)) return [];
  const unique = new Map();
  for (const value of raw) {
    const match = typeof value === 'string' ? EPISODE_KEY.exec(value) : null;
    if (!match) continue;
    const season = Number(match[1]);
    const episode = Number(match[2]);
    if (episode < 1) continue;
    unique.set(`${season}x${episode}`, season * 100000 + episode);
    if (unique.size >= MAX_EPISODES_PER_SHOW) break;
  }
  return [...unique.entries()].sort((a, b) => a[1] - b[1]).map(([key]) => key);
};

const text = (value, max = MAX_TEXT) =>
  typeof value === 'string' && value.length > 0 ? value.slice(0, max) : null;

const isoDate = (value) => (toTime(value) ? new Date(toTime(value)).toISOString() : null);

const imagePath = (value) =>
  typeof value === 'string' && /^\/[A-Za-z0-9_\-.]{1,100}$/.test(value) ? value : null;

const releaseDate = (value) =>
  typeof value === 'string' && /^\d{4}(-\d{2}(-\d{2})?)?$/.test(value) ? value : null;

const smallInt = (value, max) =>
  Number.isInteger(value) && value >= 0 && value <= max ? value : null;

// Bilinmeyen alanları atar, türleri doğrular. Geçersiz öğe için null döner.
export const sanitizeItem = (raw) => {
  if (!raw || typeof raw !== 'object') return null;
  const id = Number(raw.id);
  if (!Number.isInteger(id) || id <= 0 || id > 1e9) return null;
  if (raw.media_type !== 'movie' && raw.media_type !== 'tv') return null;

  const rating = Number(raw.vote_average);
  const item = {
    id,
    media_type: raw.media_type,
    title: text(raw.title) || '',
    poster_path: imagePath(raw.poster_path),
    backdrop_path: imagePath(raw.backdrop_path),
    vote_average: Number.isFinite(rating) ? Math.min(Math.max(rating, 0), 10) : 0,
    release_date: releaseDate(raw.release_date),
    genre_ids: Array.isArray(raw.genre_ids)
      ? raw.genre_ids.filter(g => Number.isInteger(g) && g > 0 && g < 1e6).slice(0, 10)
      : [],
    addedAt: isoDate(raw.addedAt),
    updatedAt: isoDate(raw.updatedAt),
  };

  const season = smallInt(raw.season, 1000);
  const episode = smallInt(raw.episode, 10000);
  if (season !== null) item.season = season;
  if (episode !== null) item.episode = episode;
  const episodeName = text(raw.episodeName);
  if (episodeName) item.episodeName = episodeName;
  if (item.media_type === 'tv' && Array.isArray(raw.episodes)) item.episodes = sanitizeEpisodes(raw.episodes);

  return item;
};

const sanitizeTombstones = (raw, now) => {
  if (!raw || typeof raw !== 'object') return {};
  const entries = Object.entries(raw)
    .filter(([key, value]) => /^(movie|tv)-\d{1,10}$/.test(key) && toTime(value) && now - toTime(value) < TOMBSTONE_TTL_MS)
    .sort((a, b) => toTime(b[1]) - toTime(a[1]))
    .slice(0, MAX_TOMBSTONES);
  return Object.fromEntries(entries.map(([key, value]) => [key, new Date(toTime(value)).toISOString()]));
};

export const sanitizeLibrary = (raw, now = Date.now()) => {
  const library = emptyLibrary();
  if (!raw || typeof raw !== 'object') return library;

  for (const list of LIST_NAMES) {
    const seen = new Set();
    const items = Array.isArray(raw[list]) ? raw[list] : [];
    for (const candidate of items) {
      const item = sanitizeItem(candidate);
      if (!item || seen.has(itemKey(item))) continue;
      seen.add(itemKey(item));
      library[list].push(item);
      if (library[list].length >= LISTS[list].limit) break;
    }
    library.removed[list] = sanitizeTombstones(raw.removed?.[list], now);
  }
  return library;
};

// İki kitaplığı birleştirir. Aynı öğede en yeni zaman damgası kazanır;
// öğeden daha yeni bir silme kaydı varsa öğe düşer. Sonuç sıralıdır (yeni → eski).
export const mergeLibraries = (a, b) => {
  const merged = emptyLibrary();

  for (const list of LIST_NAMES) {
    const removed = { ...(a?.removed?.[list] || {}) };
    for (const [key, value] of Object.entries(b?.removed?.[list] || {})) {
      if (toTime(value) > toTime(removed[key])) removed[key] = value;
    }

    const byKey = new Map();
    for (const item of [...(a?.[list] || []), ...(b?.[list] || [])]) {
      const key = itemKey(item);
      const previous = byKey.get(key);
      if (!previous || itemTime(item) > itemTime(previous)) byKey.set(key, item);
    }

    const items = [...byKey.values()]
      .filter(item => !removed[itemKey(item)] || toTime(removed[itemKey(item)]) < itemTime(item))
      .sort((x, y) => itemTime(y) - itemTime(x))
      .slice(0, LISTS[list].limit);

    // Hâlâ listede olan öğelerin eski silme kayıtlarını temizle
    for (const item of items) delete removed[itemKey(item)];

    merged[list] = items;
    merged.removed[list] = removed;
  }

  return merged;
};

// Karşılaştırma için kararlı bir imza (senkronizasyonda gereksiz istekleri önler).
export const librarySignature = (library) =>
  JSON.stringify(LIST_NAMES.map(list => [
    (library[list] || []).map(item => `${itemKey(item)}@${itemTime(item)}`),
    Object.entries(library.removed?.[list] || {}).sort(([x], [y]) => x.localeCompare(y)),
  ]));
