
export const formatDate = (dateString) => {
  if (!dateString) return 'Tarih bilinmiyor';
  
  const date = new Date(dateString);
  const options = { year: 'numeric', month: 'long', day: 'numeric' };
  return date.toLocaleDateString('tr-TR', options);
};

export const getYear = (dateString) => {
  if (!dateString) return '';
  return new Date(dateString).getFullYear();
};

export const formatRuntime = (minutes) => {
  if (!minutes) return 'Süre bilinmiyor';
  
  const hours = Math.floor(minutes / 60);
  const mins = minutes % 60;
  
  if (hours === 0) return `${mins}dk`;
  return `${hours}sa ${mins}dk`;
};

export const formatRating = (rating) => {
  if (!rating) return '0.0';
  return rating.toFixed(1);
};

export const formatCurrency = (amount) => {
  if (!amount) return 'Bilinmiyor';
  
  return new Intl.NumberFormat('tr-TR', {
    style: 'currency',
    currency: 'USD',
    maximumFractionDigits: 0
  }).format(amount);
};

export const formatNumber = (number) => {
  if (!number) return '0';
  return new Intl.NumberFormat('tr-TR').format(number);
};

export const truncateText = (text, maxLength = 150) => {
  if (!text) return '';
  if (text.length <= maxLength) return text;
  return text.substring(0, maxLength) + '...';
};

export const getLanguageName = (languageCode) => {
  const languages = {
    'en': 'İngilizce',
    'tr': 'Türkçe',
    'de': 'Almanca',
    'fr': 'Fransızca',
    'es': 'İspanyolca',
    'it': 'İtalyanca',
    'ja': 'Japonca',
    'ko': 'Korece',
    'ru': 'Rusça',
    'zh': 'Çince',
    'ar': 'Arapça',
    'hi': 'Hintçe',
    'pt': 'Portekizce'
  };
  
  return languages[languageCode] || languageCode.toUpperCase();
};

export const getCertification = (releaseDates) => {
  if (!releaseDates || !releaseDates.results) return null;
  
  const trRelease = releaseDates.results.find(r => r.iso_3166_1 === 'TR');
  const usRelease = releaseDates.results.find(r => r.iso_3166_1 === 'US');
  
  if (trRelease && trRelease.release_dates.length > 0) {
    return trRelease.release_dates[0].certification || null;
  }
  
  if (usRelease && usRelease.release_dates.length > 0) {
    return usRelease.release_dates[0].certification || null;
  }
  
  return null;
};

export const getGenderText = (gender) => {
  switch (gender) {
    case 1: return 'Kadın';
    case 2: return 'Erkek';
    default: return 'Bilinmiyor';
  }
};

export const getDepartmentText = (department) => {
  const departments = {
    'Acting': 'Oyunculuk',
    'Directing': 'Yönetmenlik',
    'Writing': 'Senarist',
    'Production': 'Yapımcı',
    'Editing': 'Kurgu',
    'Camera': 'Kamera',
    'Sound': 'Ses',
    'Art': 'Sanat Yönetmeni',
    'Costume & Make-Up': 'Kostüm & Makyaj',
    'Visual Effects': 'Görsel Efektler',
    'Crew': 'Ekip'
  };
  
  return departments[department] || department;
};

export const storage = {
  get: (key) => {
    try {
      const item = localStorage.getItem(key);
      return item ? JSON.parse(item) : null;
    } catch (error) {
      console.error('Storage get error:', error);
      return null;
    }
  },
  
  set: (key, value) => {
    try {
      localStorage.setItem(key, JSON.stringify(value));
    } catch (error) {
      console.error('Storage set error:', error);
    }
  },
  
  remove: (key) => {
    try {
      localStorage.removeItem(key);
    } catch (error) {
      console.error('Storage remove error:', error);
    }
  }
};

export const favorites = {
  getAll: () => storage.get('favorites') || [],
  
  add: (item) => {
    const favs = favorites.getAll();
    if (!favs.find(f => f.id === item.id && f.media_type === item.media_type)) {
      favs.push({ ...item, addedAt: new Date().toISOString() });
      storage.set('favorites', favs);
    }
  },
  
  remove: (id, mediaType) => {
    const favs = favorites.getAll();
    const filtered = favs.filter(f => !(f.id === id && f.media_type === mediaType));
    storage.set('favorites', filtered);
  },
  
  isFavorite: (id, mediaType) => {
    const favs = favorites.getAll();
    return favs.some(f => f.id === id && f.media_type === mediaType);
  }
};

export const watchHistory = {
  getAll: () => storage.get('watchHistory') || [],
  
  add: (item) => {
    const history = watchHistory.getAll();
    const existingIndex = history.findIndex(h => h.id === item.id && h.media_type === item.media_type);
    
    if (existingIndex !== -1) {
      history.splice(existingIndex, 1);
    }
    
    history.unshift({ ...item, watchedAt: new Date().toISOString() });
    
    if (history.length > 50) {
      history.splice(50);
    }
    
    storage.set('watchHistory', history);
  }
};

export const createSlug = (text) => {
  if (!text) return '';
  
  const turkishChars = {
    'ç': 'c', 'ğ': 'g', 'ı': 'i', 'ö': 'o', 'ş': 's', 'ü': 'u',
    'Ç': 'C', 'Ğ': 'G', 'İ': 'I', 'Ö': 'O', 'Ş': 'S', 'Ü': 'U'
  };
  
  return text
    .replace(/[çğıöşüÇĞİÖŞÜ]/g, letter => turkishChars[letter])
    .toLowerCase()
    .replace(/[^a-z0-9]+/g, '-')
    .replace(/^-+|-+$/g, '')
    + '-izle'; 
};
