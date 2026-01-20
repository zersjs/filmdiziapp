import { useState, useEffect, useCallback } from 'react';

export const useLocalStorage = (key, initialValue) => {
  
  const [storedValue, setStoredValue] = useState(() => {
    try {
      const item = window.localStorage.getItem(key);
      return item ? JSON.parse(item) : initialValue;
    } catch (error) {
      console.error(`LocalStorage okuma hatası (${key}):`, error);
      return initialValue;
    }
  });

  const setValue = useCallback((value) => {
    try {
      
      const valueToStore = value instanceof Function ? value(storedValue) : value;
      setStoredValue(valueToStore);
      
      if (valueToStore === undefined) {
        window.localStorage.removeItem(key);
      } else {
        window.localStorage.setItem(key, JSON.stringify(valueToStore));
      }
    } catch (error) {
      console.error(`LocalStorage yazma hatası (${key}):`, error);
    }
  }, [key, storedValue]);

  const removeValue = useCallback(() => {
    try {
      window.localStorage.removeItem(key);
      setStoredValue(initialValue);
    } catch (error) {
      console.error(`LocalStorage silme hatası (${key}):`, error);
    }
  }, [key, initialValue]);

  useEffect(() => {
    const handleStorageChange = (e) => {
      if (e.key === key && e.newValue !== null) {
        try {
          setStoredValue(JSON.parse(e.newValue));
        } catch (error) {
          console.error(`Storage event parse hatası (${key}):`, error);
        }
      }
    };

    window.addEventListener('storage', handleStorageChange);
    return () => window.removeEventListener('storage', handleStorageChange);
  }, [key]);

  return [storedValue, setValue, removeValue];
};

export const useWatchHistory = () => {
  const [history, setHistory, removeHistory] = useLocalStorage('watchHistory', []);

  const addToHistory = useCallback((item) => {
    const historyItem = {
      id: item.id,
      title: item.title || item.name,
      poster_path: item.poster_path,
      media_type: item.media_type || 'movie',
      watchedAt: new Date().toISOString(),
      season: item.season,
      episode: item.episode
    };

    setHistory(prevHistory => {
      
      const filtered = prevHistory.filter(h => 
        !(h.id === item.id && h.media_type === historyItem.media_type)
      );
      
      const newHistory = [historyItem, ...filtered];
      
      return newHistory.slice(0, 50);
    });
  }, [setHistory]);

  const clearHistory = useCallback(() => {
    removeHistory();
  }, [removeHistory]);

  const removeFromHistory = useCallback((id, mediaType) => {
    setHistory(prevHistory => 
      prevHistory.filter(item => 
        !(item.id === id && item.media_type === mediaType)
      )
    );
  }, [setHistory]);

  return {
    history,
    addToHistory,
    clearHistory,
    removeFromHistory
  };
};

export const useSettings = () => {
  const [settings, setSettings] = useLocalStorage('userSettings', {
    theme: 'dark',
    language: 'tr',
    autoplay: true,
    quality: 'auto',
    subtitles: true,
    notifications: true
  });

  const updateSetting = useCallback((key, value) => {
    setSettings(prev => ({
      ...prev,
      [key]: value
    }));
  }, [setSettings]);

  const resetSettings = useCallback(() => {
    setSettings({
      theme: 'dark',
      language: 'tr',
      autoplay: true,
      quality: 'auto',
      subtitles: true,
      notifications: true
    });
  }, [setSettings]);

  return {
    settings,
    updateSetting,
    resetSettings
  };
};
