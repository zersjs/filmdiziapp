// TMDB sabitleri. Hem tarayıcı (Vite) hem sunucu (Vercel fonksiyonları) kullanır;
// bu yüzden import.meta veya process'e bağlı değildir.

export const TMDB_API_BASE = 'https://api.themoviedb.org/3';
export const TMDB_IMAGE_BASE = 'https://image.tmdb.org/t/p';

// Ortam değişkeni tanımlanmadığında kullanılan varsayılan anahtarlar.
export const DEFAULT_TMDB_API_KEY = '095262b2872d2235d6da623056c10cd9';
export const DEFAULT_TMDB_ACCESS_TOKEN =
  'eyJhbGciOiJIUzI1NiJ9.eyJhdWQiOiIwOTUyNjJiMjg3MmQyMjM1ZDZkYTYyMzA1NmMxMGNkOSIsIm5iZiI6MTY3OTE0ODgzMy41NjksInN1YiI6IjY0MTVjNzIxMGQ1ZDg1MDA5YmExOGYxOSIsInNjb3BlcyI6WyJhcGlfcmVhZCJdLCJ2ZXJzaW9uIjoxfQ.PVQYPczKDgevfrrgQyE52x7xJj0wSHUZpI6KE0Z1xGo';

// .env'deki "your_tmdb_api_key" gibi yer tutucular geçersiz anahtar olarak gönderilmesin.
export const pickTmdbApiKey = (...candidates) =>
  candidates.find(key => /^[a-f0-9]{32}$/i.test(key || '')) || DEFAULT_TMDB_API_KEY;

export const WATCH_REGION = 'TR';

export const tmdbImage = (path, size = 'original') => (path ? `${TMDB_IMAGE_BASE}/${size}${path}` : null);
