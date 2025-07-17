import { useState, useEffect, useCallback } from 'react';

export const useLocalStorage = (key, initialValue) => {
  // State'i lazy initialize et
  const [storedValue, setStoredValue] = useState(() => {
    try {
      const item = window.localStorage.getItem(key);
      return item ? JSON.parse(item) : initialValue;
    } catch (error) {
      console.error(`LocalStorage okuma hatası (${key}):`, error);
      return initialValue;
    }
  });

  // Değeri localStorage'a kaydet
  const setValue = useCallback((value) => {
    try {
      // Fonksiyon ise çalıştır
      const valueToStore = value instanceof Function ? value(storedValue) : value;
      setStoredValue(valueToStore);
      
      // localStorage'a kaydet
      if (valueToStore === undefined) {
        window.localStorage.removeItem(key);
      } else {
        window.localStorage.setItem(key, JSON.stringify(valueToStore));
      }
    } catch (error) {
      console.error(`LocalStorage yazma hatası (${key}):`, error);
    }
  }, [key, storedValue]);

  // Değeri kaldır
  const removeValue = useCallback(() => {
    try {
      window.localStorage.removeItem(key);
      setStoredValue(initialValue);
    } catch (error) {
      console.error(`LocalStorage silme hatası (${key}):`, error);
    }
  }, [key, initialValue]);

  // Storage event listener (diğer tab'lardan değişiklikleri dinle)
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

// Özel localStorage hook'ları
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
      // Aynı öğe varsa kaldır
      const filtered = prevHistory.filter(h => 
        !(h.id === item.id && h.media_type === historyItem.media_type)
      );
      
      // En başa ekle
      const newHistory = [historyItem, ...filtered];
      
      // Son 50 öğeyi tut
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