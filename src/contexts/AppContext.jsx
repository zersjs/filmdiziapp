import React, { createContext, useCallback, useContext, useEffect, useMemo, useReducer, useRef, useState } from 'react';
import { getMediaType, getReleaseDate, getTitle } from '../utils/helpers';
import {
  LISTS, LIST_NAMES, emptyLibrary, itemKey, librarySignature, mergeLibraries, sanitizeEpisodes, sanitizeLibrary,
} from '../lib/library';
import { episodeKey } from '../lib/episodes';
import {
  SyncError, deleteRemoteLibrary, fetchRemoteLibrary, generateSyncKey, isValidSyncKey, normalizeSyncKey, pushLibrary,
} from '../services/sync';

// Kullanıcının kitaplığı (favoriler, izleme listesi, izlemeye devam et, izlenenler).
// Tek kaynak burasıdır; veriler tarayıcıda saklanır, isteğe bağlı olarak
// senkron koduyla diğer cihazlarla eşitlenir.

const STORAGE_KEYS = {
  favorites: 'favorites',
  watchLater: 'watchLater',
  continueWatching: 'continueWatching',
  watched: 'watched',
  removed: 'libraryRemoved',
  syncKey: 'syncKey',
  lastSyncedAt: 'syncLastSyncedAt',
};

const SYNC_DEBOUNCE_MS = 1500;
const SYNC_FOCUS_THROTTLE_MS = 30 * 1000;

const readJson = (key) => {
  try {
    return JSON.parse(window.localStorage.getItem(key));
  } catch {
    return null;
  }
};

const writeValue = (key, value) => {
  try {
    if (value === null || value === undefined) window.localStorage.removeItem(key);
    else window.localStorage.setItem(key, typeof value === 'string' ? value : JSON.stringify(value));
  } catch {
    // Depolama dolu veya erişilemez; uygulama bellekteki state ile çalışmaya devam eder.
  }
};

const readLibrary = () => sanitizeLibrary({
  ...Object.fromEntries(LIST_NAMES.map(list => [list, readJson(STORAGE_KEYS[list])])),
  removed: readJson(STORAGE_KEYS.removed),
});

const writeLibrary = (library) => {
  LIST_NAMES.forEach(list => writeValue(STORAGE_KEYS[list], library[list]));
  writeValue(STORAGE_KEYS.removed, library.removed);
};

const readSyncKey = () => {
  try {
    const key = window.localStorage.getItem(STORAGE_KEYS.syncKey);
    return key && isValidSyncKey(key) ? key : null;
  } catch {
    return null;
  }
};

export const sameItem = (a, id, mediaType) => a.id === id && a.media_type === mediaType;

export const toLibraryItem = (item, mediaType) => ({
  id: item.id,
  media_type: getMediaType(item, mediaType),
  title: getTitle(item),
  poster_path: item.poster_path || null,
  backdrop_path: item.backdrop_path || null,
  vote_average: item.vote_average || 0,
  release_date: getReleaseDate(item) || null,
  genre_ids: item.genre_ids || item.genres?.map(g => g.id) || [],
});

export const libraryReducer = (state, action) => {
  const now = action.now || new Date().toISOString();
  switch (action.type) {
    case 'add': {
      const { item } = action;
      const key = itemKey(item);
      const rest = state[action.list].filter(entry => itemKey(entry) !== key);
      const { [key]: _removed, ...removed } = state.removed[action.list];
      return {
        ...state,
        [action.list]: [{ ...item, updatedAt: now }, ...rest].slice(0, LISTS[action.list].limit),
        removed: { ...state.removed, [action.list]: removed },
      };
    }
    case 'remove': {
      const key = `${action.mediaType}-${action.id}`;
      return {
        ...state,
        [action.list]: state[action.list].filter(entry => !sameItem(entry, action.id, action.mediaType)),
        removed: { ...state.removed, [action.list]: { ...state.removed[action.list], [key]: now } },
      };
    }
    case 'clear': {
      const tombstones = Object.fromEntries(state[action.list].map(entry => [itemKey(entry), now]));
      return {
        ...state,
        [action.list]: [],
        removed: { ...state.removed, [action.list]: { ...state.removed[action.list], ...tombstones } },
      };
    }
    // Dizide bölüm işaretleri; her zaman güncel state üzerinden hesaplanır (eski kapanışlarla
    // tetiklenen "Geri al" / "öncekileri de işaretle" eylemleri değişiklik kaybetmesin).
    case 'episodes': {
      const key = `tv-${action.show.id}`;
      const entry = state.watched.find(item => itemKey(item) === key);
      const episodes = new Set(entry?.episodes || []);
      action.episodes.forEach(({ season, episode }) => {
        if (action.watched) episodes.add(episodeKey(season, episode));
        else episodes.delete(episodeKey(season, episode));
      });
      const next = sanitizeEpisodes([...episodes]);
      if (next.length === 0) {
        return entry ? libraryReducer(state, { type: 'remove', list: 'watched', id: action.show.id, mediaType: 'tv', now }) : state;
      }
      return libraryReducer(state, {
        type: 'add',
        list: 'watched',
        now,
        item: { ...toLibraryItem(action.show, 'tv'), addedAt: entry?.addedAt || now, episodes: next },
      });
    }
    case 'replace':
      return action.library;
    default:
      return state;
  }
};

const AppContext = createContext(null);

const useLibrarySync = (library, dispatch) => {
  const [syncKey, setSyncKey] = useState(readSyncKey);
  const [status, setStatus] = useState(() => ({
    state: 'idle',
    error: null,
    lastSyncedAt: readJson(STORAGE_KEYS.lastSyncedAt),
  }));
  const libraryRef = useRef(library);
  libraryRef.current = library;
  const remoteSignature = useRef(null);
  const inFlight = useRef(false);
  const queued = useRef(false);
  const lastAttempt = useRef(0);

  const runSync = useCallback(async (key) => {
    if (inFlight.current) {
      queued.current = true;
      return;
    }
    inFlight.current = true;
    lastAttempt.current = Date.now();
    setStatus(s => ({ ...s, state: 'syncing' }));
    try {
      const { library: remote, updatedAt } = await pushLibrary(key, libraryRef.current);
      const remoteLibrary = sanitizeLibrary(remote);
      remoteSignature.current = librarySignature(remoteLibrary);
      // İstek sürerken yerelde değişiklik olduysa kaybolmasın diye tekrar birleştir.
      const merged = mergeLibraries(libraryRef.current, remoteLibrary);
      if (librarySignature(merged) !== librarySignature(libraryRef.current)) {
        dispatch({ type: 'replace', library: merged });
      }
      writeValue(STORAGE_KEYS.lastSyncedAt, updatedAt);
      setStatus({ state: 'ok', error: null, lastSyncedAt: updatedAt });
    } catch (error) {
      setStatus(s => ({ ...s, state: 'error', error: error instanceof SyncError ? error.code : 'server_error' }));
    } finally {
      inFlight.current = false;
      if (queued.current) {
        queued.current = false;
        runSync(key);
      }
    }
  }, [dispatch]);

  // Yerel değişiklikleri kısa bir gecikmeyle gönder
  const signature = useMemo(() => librarySignature(library), [library]);
  useEffect(() => {
    if (!syncKey || signature === remoteSignature.current) return undefined;
    const timer = setTimeout(() => runSync(syncKey), remoteSignature.current === null ? 0 : SYNC_DEBOUNCE_MS);
    return () => clearTimeout(timer);
  }, [syncKey, signature, runSync]);

  // Sekmeye dönünce / bağlantı gelince diğer cihazlardaki değişiklikleri çek
  useEffect(() => {
    if (!syncKey) return undefined;
    const refresh = () => {
      if (document.visibilityState === 'hidden') return;
      if (Date.now() - lastAttempt.current < SYNC_FOCUS_THROTTLE_MS) return;
      runSync(syncKey);
    };
    document.addEventListener('visibilitychange', refresh);
    window.addEventListener('online', refresh);
    return () => {
      document.removeEventListener('visibilitychange', refresh);
      window.removeEventListener('online', refresh);
    };
  }, [syncKey, runSync]);

  const saveKey = (key) => {
    writeValue(STORAGE_KEYS.syncKey, key);
    remoteSignature.current = null;
    setSyncKey(key);
  };

  return useMemo(() => ({
    key: syncKey,
    enabled: !!syncKey,
    ...status,
    syncNow: () => syncKey && runSync(syncKey),
    // Yeni kod oluştur; sunucu ilk isteği kabul ederse etkinleştir.
    enable: async () => {
      const key = generateSyncKey();
      const { library: remote, updatedAt } = await pushLibrary(key, libraryRef.current);
      remoteSignature.current = librarySignature(sanitizeLibrary(remote));
      writeValue(STORAGE_KEYS.lastSyncedAt, updatedAt);
      setStatus({ state: 'ok', error: null, lastSyncedAt: updatedAt });
      writeValue(STORAGE_KEYS.syncKey, key);
      setSyncKey(key);
      return key;
    },
    // Var olan koda bağlan: önce sunucudaki kitaplığı çek, yerelle birleştir.
    connect: async (input) => {
      const key = normalizeSyncKey(input);
      if (!isValidSyncKey(key)) throw new SyncError('invalid_key');
      const { library: remote } = await fetchRemoteLibrary(key);
      dispatch({ type: 'replace', library: mergeLibraries(libraryRef.current, sanitizeLibrary(remote)) });
      saveKey(key);
      return key;
    },
    disconnect: () => {
      writeValue(STORAGE_KEYS.syncKey, null);
      writeValue(STORAGE_KEYS.lastSyncedAt, null);
      remoteSignature.current = null;
      setSyncKey(null);
      setStatus({ state: 'idle', error: null, lastSyncedAt: null });
    },
    deleteRemote: async () => {
      if (syncKey) await deleteRemoteLibrary(syncKey);
    },
  }), [syncKey, status, runSync, dispatch]);
};

export const AppProvider = ({ children }) => {
  const [library, dispatch] = useReducer(libraryReducer, undefined, () => {
    try {
      return readLibrary();
    } catch {
      return emptyLibrary();
    }
  });
  const hydrated = useRef(false);
  const sync = useLibrarySync(library, dispatch);

  useEffect(() => {
    if (!hydrated.current) {
      hydrated.current = true;
      return;
    }
    writeLibrary(library);
  }, [library]);

  // Başka bir sekmede yapılan değişiklikleri al
  useEffect(() => {
    const keys = [...LIST_NAMES.map(list => STORAGE_KEYS[list]), STORAGE_KEYS.removed];
    const onStorage = (event) => {
      if (keys.includes(event.key)) dispatch({ type: 'replace', library: readLibrary() });
    };
    window.addEventListener('storage', onStorage);
    return () => window.removeEventListener('storage', onStorage);
  }, []);

  const has = useCallback(
    (list, id, mediaType) => library[list].some(entry => sameItem(entry, id, mediaType)),
    [library]
  );

  const toggle = useCallback((list, item, mediaType) => {
    const entry = toLibraryItem(item, mediaType);
    const exists = library[list].some(e => sameItem(e, entry.id, entry.media_type));
    if (exists) {
      dispatch({ type: 'remove', list, id: entry.id, mediaType: entry.media_type });
    } else {
      dispatch({ type: 'add', list, item: { ...entry, addedAt: new Date().toISOString() } });
    }
    return !exists;
  }, [library]);

  const watchedEntry = useCallback(
    (id, mediaType) => library.watched.find(entry => sameItem(entry, id, mediaType)) || null,
    [library]
  );

  // Bölüm işaretlerini günceller; hiç bölüm kalmazsa dizi izlenenlerden çıkar (silme kaydıyla).
  const setEpisodes = useCallback((show, episodes, watched) => {
    dispatch({ type: 'episodes', show, episodes, watched });
  }, []);

  const actions = useMemo(() => ({
    isFavorite: (id, mediaType) => has('favorites', id, mediaType),
    toggleFavorite: (item, mediaType) => toggle('favorites', item, mediaType),
    addFavorite: (item, mediaType) => {
      if (has('favorites', item.id, getMediaType(item, mediaType))) return false;
      return toggle('favorites', item, mediaType);
    },
    removeFavorite: (id, mediaType) => dispatch({ type: 'remove', list: 'favorites', id, mediaType }),
    clearFavorites: () => dispatch({ type: 'clear', list: 'favorites' }),

    isWatchLater: (id, mediaType) => has('watchLater', id, mediaType),
    toggleWatchLater: (item, mediaType) => toggle('watchLater', item, mediaType),
    removeWatchLater: (id, mediaType) => dispatch({ type: 'remove', list: 'watchLater', id, mediaType }),
    clearWatchLater: () => dispatch({ type: 'clear', list: 'watchLater' }),

    addContinueWatching: (item, mediaType, { season, episode, episodeName } = {}) => {
      const previous = library.continueWatching.find(e => sameItem(e, item.id, getMediaType(item, mediaType)));
      dispatch({
        type: 'add',
        list: 'continueWatching',
        item: {
          ...toLibraryItem(item, mediaType),
          addedAt: previous?.addedAt || new Date().toISOString(),
          ...(season ? { season } : {}),
          ...(episode ? { episode } : {}),
          ...(episodeName ? { episodeName } : {}),
        },
      });
    },
    getContinueWatching: (id, mediaType) =>
      library.continueWatching.find(entry => sameItem(entry, id, mediaType)) || null,
    removeContinueWatching: (id, mediaType) =>
      dispatch({ type: 'remove', list: 'continueWatching', id, mediaType }),
    clearContinueWatching: () => dispatch({ type: 'clear', list: 'continueWatching' }),

    // Filmler: izlendi işareti. Diziler: bölüm bazında.
    isWatched: (id, mediaType) => !!watchedEntry(id, mediaType),
    toggleWatched: (item, mediaType) => toggle('watched', item, mediaType),
    getWatchedEpisodes: (showId) => new Set(watchedEntry(showId, 'tv')?.episodes || []),
    isEpisodeWatched: (showId, season, episode) =>
      !!watchedEntry(showId, 'tv')?.episodes?.includes(episodeKey(season, episode)),
    setEpisodesWatched: (show, episodes, watched = true) => setEpisodes(show, episodes, watched),
    toggleEpisodeWatched: (show, season, episode) => {
      const watched = !watchedEntry(show.id, 'tv')?.episodes?.includes(episodeKey(season, episode));
      setEpisodes(show, [{ season, episode }], watched);
      return watched;
    },
    removeWatched: (id, mediaType) => dispatch({ type: 'remove', list: 'watched', id, mediaType }),
    clearWatched: () => dispatch({ type: 'clear', list: 'watched' }),

    clearAll: () => LIST_NAMES.forEach(list => dispatch({ type: 'clear', list })),
    importLibrary: (data) => {
      const incoming = sanitizeLibrary(data?.library ?? data);
      const count = LIST_NAMES.reduce((sum, list) => sum + incoming[list].length, 0);
      dispatch({ type: 'replace', library: mergeLibraries(library, incoming) });
      return count;
    },
    exportLibrary: () => ({
      app: 'sinefix',
      version: 1,
      exportedAt: new Date().toISOString(),
      library,
    }),
  }), [has, toggle, library, watchedEntry, setEpisodes]);

  const value = useMemo(() => ({ state: library, actions, sync }), [library, actions, sync]);

  return <AppContext.Provider value={value}>{children}</AppContext.Provider>;
};

export const useApp = () => {
  const context = useContext(AppContext);
  if (!context) {
    throw new Error('useApp must be used within an AppProvider');
  }
  return context;
};
