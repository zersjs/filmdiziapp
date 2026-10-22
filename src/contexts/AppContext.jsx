import React, { createContext, useCallback, useContext, useEffect, useMemo, useReducer, useRef } from 'react';
import { getMediaType, getReleaseDate, getTitle } from '../utils/helpers';

// Kullanıcının yerel kütüphanesi (favoriler, izleme listesi, izlemeye devam et).
// Tek kaynak burasıdır; tüm sayfalar bu context üzerinden okur/yazar.
export const LISTS = {
  favorites: { storageKey: 'favorites', limit: 500 },
  watchLater: { storageKey: 'watchLater', limit: 500 },
  continueWatching: { storageKey: 'continueWatching', limit: 30 },
};

const LIST_NAMES = Object.keys(LISTS);

const readList = (storageKey) => {
  try {
    const parsed = JSON.parse(window.localStorage.getItem(storageKey));
    return Array.isArray(parsed) ? parsed.filter(item => item && item.id && item.media_type) : [];
  } catch {
    return [];
  }
};

const writeList = (storageKey, items) => {
  try {
    window.localStorage.setItem(storageKey, JSON.stringify(items));
  } catch {
    // Depolama dolu veya erişilemez; uygulama bellekteki state ile çalışmaya devam eder.
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
});

export const libraryReducer = (state, action) => {
  const list = state[action.list];
  switch (action.type) {
    case 'add': {
      const { item } = action;
      const rest = list.filter(entry => !sameItem(entry, item.id, item.media_type));
      return { ...state, [action.list]: [item, ...rest].slice(0, LISTS[action.list].limit) };
    }
    case 'remove':
      return { ...state, [action.list]: list.filter(entry => !sameItem(entry, action.id, action.mediaType)) };
    case 'clear':
      return { ...state, [action.list]: [] };
    case 'hydrate':
      return { ...state, [action.list]: action.items };
    default:
      return state;
  }
};

const initState = () =>
  Object.fromEntries(LIST_NAMES.map(name => [name, readList(LISTS[name].storageKey)]));

const AppContext = createContext(null);

export const AppProvider = ({ children }) => {
  const [state, dispatch] = useReducer(libraryReducer, undefined, initState);
  const hydrated = useRef(false);

  useEffect(() => {
    if (!hydrated.current) {
      hydrated.current = true;
      return;
    }
    LIST_NAMES.forEach(name => writeList(LISTS[name].storageKey, state[name]));
  }, [state]);

  // Başka bir sekmede yapılan değişiklikleri senkronize et.
  useEffect(() => {
    const onStorage = (event) => {
      const name = LIST_NAMES.find(n => LISTS[n].storageKey === event.key);
      if (name) dispatch({ type: 'hydrate', list: name, items: readList(event.key) });
    };
    window.addEventListener('storage', onStorage);
    return () => window.removeEventListener('storage', onStorage);
  }, []);

  const has = useCallback(
    (list, id, mediaType) => state[list].some(entry => sameItem(entry, id, mediaType)),
    [state]
  );

  const toggle = useCallback((list, item, mediaType) => {
    const entry = toLibraryItem(item, mediaType);
    const exists = state[list].some(e => sameItem(e, entry.id, entry.media_type));
    if (exists) {
      dispatch({ type: 'remove', list, id: entry.id, mediaType: entry.media_type });
    } else {
      dispatch({ type: 'add', list, item: { ...entry, addedAt: new Date().toISOString() } });
    }
    return !exists;
  }, [state]);

  const actions = useMemo(() => ({
    isFavorite: (id, mediaType) => has('favorites', id, mediaType),
    toggleFavorite: (item, mediaType) => toggle('favorites', item, mediaType),
    removeFavorite: (id, mediaType) => dispatch({ type: 'remove', list: 'favorites', id, mediaType }),
    clearFavorites: () => dispatch({ type: 'clear', list: 'favorites' }),

    isWatchLater: (id, mediaType) => has('watchLater', id, mediaType),
    toggleWatchLater: (item, mediaType) => toggle('watchLater', item, mediaType),
    removeWatchLater: (id, mediaType) => dispatch({ type: 'remove', list: 'watchLater', id, mediaType }),
    clearWatchLater: () => dispatch({ type: 'clear', list: 'watchLater' }),

    addContinueWatching: (item, mediaType, { season, episode, episodeName } = {}) => {
      dispatch({
        type: 'add',
        list: 'continueWatching',
        item: {
          ...toLibraryItem(item, mediaType),
          season: season || null,
          episode: episode || null,
          episodeName: episodeName || null,
          updatedAt: new Date().toISOString(),
        },
      });
    },
    getContinueWatching: (id, mediaType) =>
      state.continueWatching.find(entry => sameItem(entry, id, mediaType)) || null,
    removeContinueWatching: (id, mediaType) =>
      dispatch({ type: 'remove', list: 'continueWatching', id, mediaType }),
    clearContinueWatching: () => dispatch({ type: 'clear', list: 'continueWatching' }),
  }), [has, toggle, state.continueWatching]);

  const value = useMemo(() => ({ state, actions }), [state, actions]);

  return <AppContext.Provider value={value}>{children}</AppContext.Provider>;
};

export const useApp = () => {
  const context = useContext(AppContext);
  if (!context) {
    throw new Error('useApp must be used within an AppProvider');
  }
  return context;
};
