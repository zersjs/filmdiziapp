import React, { createContext, useContext, useReducer, useEffect } from 'react';
import { useLocalStorage } from '../hooks/useLocalStorage';

const initialState = {
  user: null,
  favorites: [],
  watchLater: [],
  watchHistory: [],
  continueWatching: [],
  settings: {
    theme: 'dark',
    language: 'tr',
    autoplay: true,
    quality: 'auto',
    subtitles: true,
    notifications: true
  },
  ui: {
    sidebarOpen: false,
    loading: false,
    error: null,
    searchQuery: '',
    currentPage: 1
  }
};

export const ActionTypes = {
  
  SET_USER: 'SET_USER',
  LOGOUT_USER: 'LOGOUT_USER',
  
  ADD_FAVORITE: 'ADD_FAVORITE',
  REMOVE_FAVORITE: 'REMOVE_FAVORITE',
  SET_FAVORITES: 'SET_FAVORITES',
  CLEAR_FAVORITES: 'CLEAR_FAVORITES',
  
  ADD_WATCH_LATER: 'ADD_WATCH_LATER',
  REMOVE_WATCH_LATER: 'REMOVE_WATCH_LATER',
  SET_WATCH_LATER: 'SET_WATCH_LATER',
  CLEAR_WATCH_LATER: 'CLEAR_WATCH_LATER',
  
  ADD_TO_HISTORY: 'ADD_TO_HISTORY',
  REMOVE_FROM_HISTORY: 'REMOVE_FROM_HISTORY',
  CLEAR_HISTORY: 'CLEAR_HISTORY',
  SET_HISTORY: 'SET_HISTORY',
  
  ADD_CONTINUE_WATCHING: 'ADD_CONTINUE_WATCHING',
  REMOVE_CONTINUE_WATCHING: 'REMOVE_CONTINUE_WATCHING',
  SET_CONTINUE_WATCHING: 'SET_CONTINUE_WATCHING',
  UPDATE_CONTINUE_WATCHING: 'UPDATE_CONTINUE_WATCHING',
  
  UPDATE_SETTING: 'UPDATE_SETTING',
  RESET_SETTINGS: 'RESET_SETTINGS',
  
  SET_LOADING: 'SET_LOADING',
  SET_ERROR: 'SET_ERROR',
  CLEAR_ERROR: 'CLEAR_ERROR',
  TOGGLE_SIDEBAR: 'TOGGLE_SIDEBAR',
  SET_SEARCH_QUERY: 'SET_SEARCH_QUERY',
  SET_CURRENT_PAGE: 'SET_CURRENT_PAGE'
};

const appReducer = (state, action) => {
  switch (action.type) {
    case ActionTypes.SET_USER:
      return {
        ...state,
        user: action.payload
      };
      
    case ActionTypes.LOGOUT_USER:
      return {
        ...state,
        user: null
      };
      
    case ActionTypes.ADD_FAVORITE:
      return {
        ...state,
        favorites: [...state.favorites.filter(f => 
          !(f.id === action.payload.id && f.media_type === action.payload.media_type)
        ), action.payload]
      };
      
    case ActionTypes.REMOVE_FAVORITE:
      return {
        ...state,
        favorites: state.favorites.filter(f => 
          !(f.id === action.payload.id && f.media_type === action.payload.mediaType)
        )
      };
      
    case ActionTypes.SET_FAVORITES:
      return {
        ...state,
        favorites: action.payload
      };
      
    case ActionTypes.CLEAR_FAVORITES:
      return {
        ...state,
        favorites: []
      };
      
    case ActionTypes.ADD_WATCH_LATER:
      return {
        ...state,
        watchLater: [...state.watchLater.filter(w => 
          !(w.id === action.payload.id && w.media_type === action.payload.media_type)
        ), action.payload]
      };
      
    case ActionTypes.REMOVE_WATCH_LATER:
      return {
        ...state,
        watchLater: state.watchLater.filter(w => 
          !(w.id === action.payload.id && w.media_type === action.payload.mediaType)
        )
      };
      
    case ActionTypes.SET_WATCH_LATER:
      return {
        ...state,
        watchLater: action.payload
      };
      
    case ActionTypes.CLEAR_WATCH_LATER:
      return {
        ...state,
        watchLater: []
      };
      
    case ActionTypes.ADD_TO_HISTORY:
      const filteredHistory = state.watchHistory.filter(h => 
        !(h.id === action.payload.id && h.media_type === action.payload.media_type)
      );
      return {
        ...state,
        watchHistory: [action.payload, ...filteredHistory].slice(0, 50)
      };
      
    case ActionTypes.REMOVE_FROM_HISTORY:
      return {
        ...state,
        watchHistory: state.watchHistory.filter(h => 
          !(h.id === action.payload.id && h.media_type === action.payload.mediaType)
        )
      };
      
    case ActionTypes.CLEAR_HISTORY:
      return {
        ...state,
        watchHistory: []
      };
      
    case ActionTypes.SET_HISTORY:
      return {
        ...state,
        watchHistory: action.payload
      };
      
    case ActionTypes.ADD_CONTINUE_WATCHING:
      const filteredContinueWatching = state.continueWatching.filter(c => 
        !(c.id === action.payload.id && c.media_type === action.payload.media_type)
      );
      return {
        ...state,
        continueWatching: [action.payload, ...filteredContinueWatching].slice(0, 20)
      };
      
    case ActionTypes.REMOVE_CONTINUE_WATCHING:
      return {
        ...state,
        continueWatching: state.continueWatching.filter(c => 
          !(c.id === action.payload.id && c.media_type === action.payload.mediaType)
        )
      };
      
    case ActionTypes.SET_CONTINUE_WATCHING:
      return {
        ...state,
        continueWatching: action.payload
      };
      
    case ActionTypes.UPDATE_CONTINUE_WATCHING:
      return {
        ...state,
        continueWatching: state.continueWatching.map(c => 
          c.id === action.payload.id && c.media_type === action.payload.media_type
            ? { ...c, ...action.payload }
            : c
        )
      };
      
    case ActionTypes.UPDATE_SETTING:
      return {
        ...state,
        settings: {
          ...state.settings,
          [action.payload.key]: action.payload.value
        }
      };
      
    case ActionTypes.RESET_SETTINGS:
      return {
        ...state,
        settings: initialState.settings
      };
      
    case ActionTypes.SET_LOADING:
      return {
        ...state,
        ui: {
          ...state.ui,
          loading: action.payload
        }
      };
      
    case ActionTypes.SET_ERROR:
      return {
        ...state,
        ui: {
          ...state.ui,
          error: action.payload
        }
      };
      
    case ActionTypes.CLEAR_ERROR:
      return {
        ...state,
        ui: {
          ...state.ui,
          error: null
        }
      };
      
    case ActionTypes.TOGGLE_SIDEBAR:
      return {
        ...state,
        ui: {
          ...state.ui,
          sidebarOpen: !state.ui.sidebarOpen
        }
      };
      
    case ActionTypes.SET_SEARCH_QUERY:
      return {
        ...state,
        ui: {
          ...state.ui,
          searchQuery: action.payload
        }
      };
      
    case ActionTypes.SET_CURRENT_PAGE:
      return {
        ...state,
        ui: {
          ...state.ui,
          currentPage: action.payload
        }
      };
      
    default:
      return state;
  }
};

const AppContext = createContext();

export const AppProvider = ({ children }) => {
  const [state, dispatch] = useReducer(appReducer, initialState);
  const [favorites, setFavorites] = useLocalStorage('favorites', []);
  const [watchLater, setWatchLater] = useLocalStorage('watchLater', []);
  const [watchHistory, setWatchHistory] = useLocalStorage('watchHistory', []);
  const [continueWatching, setContinueWatching] = useLocalStorage('continueWatching', []);
  const [settings, setSettings] = useLocalStorage('userSettings', initialState.settings);

  useEffect(() => {
    dispatch({ type: ActionTypes.SET_FAVORITES, payload: favorites });
    dispatch({ type: ActionTypes.SET_WATCH_LATER, payload: watchLater });
    dispatch({ type: ActionTypes.SET_HISTORY, payload: watchHistory });
    dispatch({ type: ActionTypes.SET_CONTINUE_WATCHING, payload: continueWatching });
    dispatch({ type: ActionTypes.UPDATE_SETTING, payload: { key: 'settings', value: settings } });
  }, []);

  useEffect(() => {
    setFavorites(state.favorites);
  }, [state.favorites, setFavorites]);

  useEffect(() => {
    setWatchLater(state.watchLater);
  }, [state.watchLater, setWatchLater]);

  useEffect(() => {
    setWatchHistory(state.watchHistory);
  }, [state.watchHistory, setWatchHistory]);

  useEffect(() => {
    setContinueWatching(state.continueWatching);
  }, [state.continueWatching, setContinueWatching]);

  useEffect(() => {
    setSettings(state.settings);
  }, [state.settings, setSettings]);

  const actions = {
    
    setUser: (user) => dispatch({ type: ActionTypes.SET_USER, payload: user }),
    logoutUser: () => dispatch({ type: ActionTypes.LOGOUT_USER }),
    
    addFavorite: (item) => {
      const favoriteItem = {
        id: item.id,
        title: item.title || item.name,
        poster_path: item.poster_path,
        media_type: item.media_type || 'movie',
        vote_average: item.vote_average,
        release_date: item.release_date || item.first_air_date,
        overview: item.overview,
        addedAt: new Date().toISOString()
      };
      dispatch({ type: ActionTypes.ADD_FAVORITE, payload: favoriteItem });
    },
    
    removeFavorite: (id, mediaType) => 
      dispatch({ type: ActionTypes.REMOVE_FAVORITE, payload: { id, mediaType } }),
    
    clearFavorites: () => dispatch({ type: ActionTypes.CLEAR_FAVORITES }),
    
    isFavorite: (id, mediaType) => 
      state.favorites.some(f => f.id === id && f.media_type === mediaType),
    
    toggleFavorite: (item) => {
      const mediaType = item.media_type || 'movie';
      if (actions.isFavorite(item.id, mediaType)) {
        actions.removeFavorite(item.id, mediaType);
      } else {
        actions.addFavorite(item);
      }
    },
    
    addWatchLater: (item) => {
      const watchLaterItem = {
        id: item.id,
        title: item.title || item.name,
        poster_path: item.poster_path,
        media_type: item.media_type || 'movie',
        vote_average: item.vote_average,
        release_date: item.release_date || item.first_air_date,
        overview: item.overview,
        addedAt: new Date().toISOString()
      };
      dispatch({ type: ActionTypes.ADD_WATCH_LATER, payload: watchLaterItem });
    },
    
    removeWatchLater: (id, mediaType) => 
      dispatch({ type: ActionTypes.REMOVE_WATCH_LATER, payload: { id, mediaType } }),
    
    clearWatchLater: () => dispatch({ type: ActionTypes.CLEAR_WATCH_LATER }),
    
    isWatchLater: (id, mediaType) => 
      state.watchLater.some(w => w.id === id && w.media_type === mediaType),
    
    toggleWatchLater: (item) => {
      const mediaType = item.media_type || 'movie';
      if (actions.isWatchLater(item.id, mediaType)) {
        actions.removeWatchLater(item.id, mediaType);
      } else {
        actions.addWatchLater(item);
      }
    },
    
    addToHistory: (item) => {
      const historyItem = {
        id: item.id,
        title: item.title || item.name,
        poster_path: item.poster_path,
        media_type: item.media_type || 'movie',
        watchedAt: new Date().toISOString(),
        season: item.season,
        episode: item.episode
      };
      dispatch({ type: ActionTypes.ADD_TO_HISTORY, payload: historyItem });
    },
    
    removeFromHistory: (id, mediaType) => 
      dispatch({ type: ActionTypes.REMOVE_FROM_HISTORY, payload: { id, mediaType } }),
    
    clearHistory: () => dispatch({ type: ActionTypes.CLEAR_HISTORY }),
    
    addContinueWatching: (item, progress = 0, duration = 0) => {
      const continueWatchingItem = {
        id: item.id,
        title: item.title || item.name,
        poster_path: item.poster_path,
        media_type: item.media_type || 'movie',
        progress: progress, 
        duration: duration, 
        percentage: duration > 0 ? Math.round((progress / duration) * 100) : 0,
        lastWatchedAt: new Date().toISOString(),
        season: item.season,
        episode: item.episode
      };
      dispatch({ type: ActionTypes.ADD_CONTINUE_WATCHING, payload: continueWatchingItem });
    },
    
    removeContinueWatching: (id, mediaType) => 
      dispatch({ type: ActionTypes.REMOVE_CONTINUE_WATCHING, payload: { id, mediaType } }),
    
    updateContinueWatching: (id, mediaType, progress, duration) => {
      const payload = {
        id,
        media_type: mediaType,
        progress,
        duration,
        percentage: duration > 0 ? Math.round((progress / duration) * 100) : 0,
        lastWatchedAt: new Date().toISOString()
      };
      dispatch({ type: ActionTypes.UPDATE_CONTINUE_WATCHING, payload });
    },
    
    updateSetting: (key, value) => 
      dispatch({ type: ActionTypes.UPDATE_SETTING, payload: { key, value } }),
    
    resetSettings: () => dispatch({ type: ActionTypes.RESET_SETTINGS }),
    
    setLoading: (loading) => dispatch({ type: ActionTypes.SET_LOADING, payload: loading }),
    setError: (error) => dispatch({ type: ActionTypes.SET_ERROR, payload: error }),
    clearError: () => dispatch({ type: ActionTypes.CLEAR_ERROR }),
    toggleSidebar: () => dispatch({ type: ActionTypes.TOGGLE_SIDEBAR }),
    setSearchQuery: (query) => dispatch({ type: ActionTypes.SET_SEARCH_QUERY, payload: query }),
    setCurrentPage: (page) => dispatch({ type: ActionTypes.SET_CURRENT_PAGE, payload: page })
  };

  return (
    <AppContext.Provider value={{ state, actions }}>
      {children}
    </AppContext.Provider>
  );
};

export const useApp = () => {
  const context = useContext(AppContext);
  if (!context) {
    throw new Error('useApp must be used within an AppProvider');
  }
  return context;
};
