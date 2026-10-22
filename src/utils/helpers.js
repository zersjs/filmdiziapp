const toDate = (value) => {
  if (!value) return null;
  const date = new Date(value);
  return Number.isNaN(date.getTime()) ? null : date;
};

export const formatDate = (dateString) => {
  const date = toDate(dateString);
  if (!date) return 'Tarih bilinmiyor';
  return date.toLocaleDateString('tr-TR', { year: 'numeric', month: 'long', day: 'numeric' });
};

export const getYear = (dateString) => {
  const date = toDate(dateString);
  return date ? date.getFullYear() : '';
};

export const isFutureDate = (dateString) => {
  const date = toDate(dateString);
  return !!date && date.getTime() > Date.now();
};

export const formatRuntime = (minutes) => {
  if (!minutes) return null;
  const hours = Math.floor(minutes / 60);
  const mins = minutes % 60;
  if (hours === 0) return `${mins} dk`;
  return mins ? `${hours} sa ${mins} dk` : `${hours} sa`;
};

export const formatRating = (rating) => {
  if (!rating) return '0.0';
  return Number(rating).toFixed(1);
};

export const formatCurrency = (amount) => {
  if (!amount) return null;
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
  return `${text.substring(0, maxLength).trimEnd()}…`;
};

let languageNames;
export const getLanguageName = (languageCode) => {
  if (!languageCode) return 'Bilinmiyor';
  try {
    languageNames ??= new Intl.DisplayNames(['tr'], { type: 'language' });
    const name = languageNames.of(languageCode);
    return name ? name.charAt(0).toLocaleUpperCase('tr-TR') + name.slice(1) : languageCode.toUpperCase();
  } catch {
    return languageCode.toUpperCase();
  }
};

export const getCertification = (releaseDates) => {
  const results = releaseDates?.results;
  if (!results) return null;

  for (const country of ['TR', 'US']) {
    const release = results.find(r => r.iso_3166_1 === country);
    const certification = release?.release_dates?.find(d => d.certification)?.certification;
    if (certification) return certification;
  }
  return null;
};

export const getTvCertification = (contentRatings) => {
  const results = contentRatings?.results;
  if (!results) return null;
  return (results.find(r => r.iso_3166_1 === 'TR') || results.find(r => r.iso_3166_1 === 'US'))?.rating || null;
};

export const getGenderText = (gender) => {
  switch (gender) {
    case 1: return 'Kadın';
    case 2: return 'Erkek';
    case 3: return 'Non-binary';
    default: return null;
  }
};

export const getDepartmentText = (department) => {
  const departments = {
    'Acting': 'Oyunculuk',
    'Directing': 'Yönetmenlik',
    'Writing': 'Senaryo',
    'Production': 'Yapım',
    'Editing': 'Kurgu',
    'Camera': 'Kamera',
    'Sound': 'Ses',
    'Art': 'Sanat Yönetimi',
    'Costume & Make-Up': 'Kostüm & Makyaj',
    'Visual Effects': 'Görsel Efektler',
    'Crew': 'Ekip'
  };

  return departments[department] || department;
};

export const getStatusText = (status) => {
  const statuses = {
    'Released': 'Yayınlandı',
    'Post Production': 'Post prodüksiyon',
    'In Production': 'Yapım aşamasında',
    'Planned': 'Planlandı',
    'Rumored': 'Söylenti',
    'Canceled': 'İptal edildi',
    'Returning Series': 'Devam ediyor',
    'Ended': 'Sona erdi',
    'Pilot': 'Pilot'
  };
  return statuses[status] || status;
};

export const createSlug = (text) => {
  if (!text) return '';

  const turkishChars = {
    'ç': 'c', 'ğ': 'g', 'ı': 'i', 'ö': 'o', 'ş': 's', 'ü': 'u',
    'Ç': 'C', 'Ğ': 'G', 'İ': 'I', 'Ö': 'O', 'Ş': 'S', 'Ü': 'U'
  };

  const slug = text
    .replace(/[çğıöşüÇĞİÖŞÜ]/g, letter => turkishChars[letter])
    .toLowerCase()
    .replace(/[^a-z0-9]+/g, '-')
    .replace(/^-+|-+$/g, '');

  return slug ? `${slug}-izle` : 'izle';
};

export const getTitle = (item) => item?.title || item?.name || '';

export const getReleaseDate = (item) => item?.release_date || item?.first_air_date || '';

export const getMediaType = (item, fallback = 'movie') => {
  if (item?.media_type === 'movie' || item?.media_type === 'tv') return item.media_type;
  if (fallback) return fallback;
  return item?.first_air_date !== undefined || item?.name !== undefined ? 'tv' : 'movie';
};

export const getMediaLabel = (mediaType) => (mediaType === 'tv' ? 'Dizi' : 'Film');

export const getDetailPath = (item, mediaType = getMediaType(item)) =>
  `/${mediaType}/${item.id}/${createSlug(getTitle(item))}`;

export const getWatchPath = (item, mediaType = getMediaType(item), { season, episode } = {}) => {
  const base = `/watch/${mediaType}/${item.id}/${createSlug(getTitle(item))}`;
  if (mediaType !== 'tv' || !season) return base;
  return `${base}?season=${season}&episode=${episode || 1}`;
};

export const dedupeById = (items = []) => {
  const seen = new Set();
  return items.filter(item => {
    const key = `${item.media_type || ''}-${item.id}`;
    if (seen.has(key)) return false;
    seen.add(key);
    return true;
  });
};

export const shareOrCopy = async ({ title, text, url }) => {
  if (navigator.share) {
    try {
      await navigator.share({ title, text, url });
      return 'shared';
    } catch (error) {
      if (error?.name === 'AbortError') return 'cancelled';
    }
  }
  try {
    await navigator.clipboard.writeText(url);
    return 'copied';
  } catch {
    return 'failed';
  }
};
