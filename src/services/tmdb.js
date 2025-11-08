import axios from 'axios';

const API_KEY = import.meta.env.VITE_TMDB_API_KEY || '095262b2872d2235d6da623056c10cd9';
const ACCESS_TOKEN =
  import.meta.env.VITE_TMDB_ACCESS_TOKEN ||
  'eyJhbGciOiJIUzI1NiJ9.eyJhdWQiOiIwOTUyNjJiMjg3MmQyMjM1ZDZkYTYyMzA1NmMxMGNkOSIsIm5iZiI6MTY3OTE0ODgzMy41NjksInN1YiI6IjY0MTVjNzIxMGQ1ZDg1MDA5YmExOGYxOSIsInNjb3BlcyI6WyJhcGlfcmVhZCJdLCJ2ZXJzaW9uIjoxfQ.PVQYPczKDgevfrrgQyE52x7xJj0wSHUZpI6KE0Z1xGo';
const BASE_URL = import.meta.env.VITE_TMDB_BASE_URL || 'https://api.themoviedb.org/3';
const IMAGE_BASE_URL = import.meta.env.VITE_TMDB_IMAGE_BASE_URL || 'https://image.tmdb.org/t/p';

const tmdbApi = axios.create({
  baseURL: BASE_URL,
  headers: {
    Authorization: `Bearer ${ACCESS_TOKEN}`,
    'Content-Type': 'application/json;charset=utf-8'
  },
  params: {
    ...(API_KEY ? { api_key: API_KEY } : {}),
    language: 'tr-TR'
  }
});

// Resim URL'leri için yardımcı fonksiyonlar
export const getImageUrl = (path, size = 'original') => {
  if (!path) {
    // SVG placeholder as data URL
    return 'data:image/svg+xml;base64,PHN2ZyB3aWR0aD0iNTAwIiBoZWlnaHQ9Ijc1MCIgeG1sbnM9Imh0dHA6Ly93d3cudzMub3JnLzIwMDAvc3ZnIj48cmVjdCB3aWR0aD0iNTAwIiBoZWlnaHQ9Ijc1MCIgZmlsbD0iIzIxMjEyMSIvPjx0ZXh0IHg9IjUwJSIgeT0iNTAlIiBmb250LWZhbWlseT0iQXJpYWwiIGZvbnQtc2l6ZT0iMjQiIGZpbGw9IiM2NjY2NjYiIHRleHQtYW5jaG9yPSJtaWRkbGUiIGR5PSIuM2VtIj5Hw7Zyc2VsIFlvazwvdGV4dD48L3N2Zz4=';
  }
  return `${IMAGE_BASE_URL}/${size}${path}`;
};

// Film servisleri
export const movieService = {
  // Popüler filmler
  getPopular: (page = 1) => tmdbApi.get('/movie/popular', { params: { page } }),
  
  // Vizyondaki filmler
  getNowPlaying: (page = 1) => tmdbApi.get('/movie/now_playing', { params: { page } }),
  
  // Yakında gelecek filmler
  getUpcoming: (page = 1) => tmdbApi.get('/movie/upcoming', { params: { page } }),
  
  // En yüksek puanlı filmler
  getTopRated: (page = 1) => tmdbApi.get('/movie/top_rated', { params: { page } }),
  
  // Film detayı
  getDetail: (id) => tmdbApi.get(`/movie/${id}`, {
    params: {
      append_to_response: 'credits,videos,images,keywords,reviews,recommendations,similar,external_ids,release_dates'
    }
  }),
  
  // Film videoları
  getVideos: (id) => tmdbApi.get(`/movie/${id}/videos`),
  
  // Film görselleri
  getImages: (id) => tmdbApi.get(`/movie/${id}/images`, { params: { include_image_language: 'tr,en,null' } }),
  
  // Film sağlayıcıları (nereden izlenebilir)
  getWatchProviders: (id) => tmdbApi.get(`/movie/${id}/watch/providers`)
};

// Dizi servisleri
export const tvService = {
  // Popüler diziler
  getPopular: (page = 1) => tmdbApi.get('/tv/popular', { params: { page } }),
  
  // Yayında olan diziler
  getOnTheAir: (page = 1) => tmdbApi.get('/tv/on_the_air', { params: { page } }),
  
  // Bugün yayınlanacak diziler
  getAiringToday: (page = 1) => tmdbApi.get('/tv/airing_today', { params: { page } }),
  
  // En yüksek puanlı diziler
  getTopRated: (page = 1) => tmdbApi.get('/tv/top_rated', { params: { page } }),
  
  // Dizi detayı
  getDetail: (id) => tmdbApi.get(`/tv/${id}`, {
    params: {
      append_to_response: 'credits,videos,images,keywords,reviews,recommendations,similar,external_ids,content_ratings,aggregate_credits'
    }
  }),
  
  // Sezon detayı
  getSeasonDetail: (tvId, seasonNumber) => tmdbApi.get(`/tv/${tvId}/season/${seasonNumber}`, {
    params: {
      append_to_response: 'credits,videos,images'
    }
  }),
  
  // Bölüm detayı
  getEpisodeDetail: (tvId, seasonNumber, episodeNumber) => tmdbApi.get(`/tv/${tvId}/season/${seasonNumber}/episode/${episodeNumber}`, {
    params: {
      append_to_response: 'credits,videos,images'
    }
  }),
  
  // Dizi sağlayıcıları
  getWatchProviders: (id) => tmdbApi.get(`/tv/${id}/watch/providers`)
};

// Kişi servisleri
export const personService = {
  // Popüler kişiler
  getPopular: (page = 1) => tmdbApi.get('/person/popular', { params: { page } }),
  
  // Kişi detayı
  getDetail: (id) => tmdbApi.get(`/person/${id}`, {
    params: {
      append_to_response: 'movie_credits,tv_credits,images,external_ids,combined_credits'
    }
  })
};

// Arama servisleri
export const searchService = {
  // Çoklu arama (film, dizi, kişi)
  multi: (query, page = 1) => tmdbApi.get('/search/multi', { params: { query, page } }),
  
  // Film araması
  movie: (query, page = 1) => tmdbApi.get('/search/movie', { params: { query, page } }),
  
  // Dizi araması
  tv: (query, page = 1) => tmdbApi.get('/search/tv', { params: { query, page } }),
  
  // Kişi araması
  person: (query, page = 1) => tmdbApi.get('/search/person', { params: { query, page } }),
  
  // Koleksiyon araması
  collection: (query, page = 1) => tmdbApi.get('/search/collection', { params: { query, page } }),
  
  // Anahtar kelime araması
  keyword: (query, page = 1) => tmdbApi.get('/search/keyword', { params: { query, page } })
};

// Keşfet servisleri
export const discoverService = {
  // Film keşfet
  movie: (params = {}) => tmdbApi.get('/discover/movie', { params }),
  
  // Dizi keşfet
  tv: (params = {}) => tmdbApi.get('/discover/tv', { params })
};

// Tür servisleri
export const genreService = {
  // Film türleri
  getMovieList: () => tmdbApi.get('/genre/movie/list'),
  
  // Dizi türleri
  getTvList: () => tmdbApi.get('/genre/tv/list')
};

// Trend servisleri
export const trendingService = {
  // Tüm trendler
  getAll: (timeWindow = 'week') => tmdbApi.get(`/trending/all/${timeWindow}`),
  
  // Film trendleri
  getMovies: (timeWindow = 'week') => tmdbApi.get(`/trending/movie/${timeWindow}`),
  
  // Dizi trendleri
  getTv: (timeWindow = 'week') => tmdbApi.get(`/trending/tv/${timeWindow}`),
  
  // Kişi trendleri
  getPerson: (timeWindow = 'week') => tmdbApi.get(`/trending/person/${timeWindow}`)
};

// Koleksiyon servisleri
export const collectionService = {
  getDetail: (id) => tmdbApi.get(`/collection/${id}`, {
    params: {
      append_to_response: 'images'
    }
  })
};

// Şirket servisleri
export const companyService = {
  getDetail: (id) => tmdbApi.get(`/company/${id}`, {
    params: {
      append_to_response: 'images'
    }
  })
};

// Yapılandırma servisleri
export const configurationService = {
  // API yapılandırması
  getApiConfiguration: () => tmdbApi.get('/configuration'),
  
  // Ülkeler
  getCountries: () => tmdbApi.get('/configuration/countries'),
  
  // İşler
  getJobs: () => tmdbApi.get('/configuration/jobs'),
  
  // Diller
  getLanguages: () => tmdbApi.get('/configuration/languages'),
  
  // Sertifikasyonlar
  getCertifications: () => Promise.all([
    tmdbApi.get('/certification/movie/list'),
    tmdbApi.get('/certification/tv/list')
  ])
};

// Medya içeriği için fallback fonksiyonları
export const mediaService = {
  // Film medya içeriği (TR + EN fallback)
  getMovieMedia: async (id) => {
    try {
      // Önce Türkçe içeriği dene
      const [trVideos, trImages] = await Promise.all([
        tmdbApi.get(`/movie/${id}/videos`, { params: { language: 'tr-TR' } }),
        tmdbApi.get(`/movie/${id}/images`, { params: { include_image_language: 'tr,en,null' } })
      ]);
      
      // Eğer Türkçe videolar yoksa İngilizce videolar al
      let finalVideos = trVideos.data.results;
      if (finalVideos.length === 0) {
        const enVideos = await tmdbApi.get(`/movie/${id}/videos`, { params: { language: 'en-US' } });
        finalVideos = enVideos.data.results;
      }
      
      return {
        videos: { results: finalVideos },
        images: trImages.data
      };
    } catch (error) {
      console.error('Media service error:', error);
      return { videos: { results: [] }, images: { backdrops: [], posters: [], logos: [] } };
    }
  },
  
  // Dizi medya içeriği (TR + EN fallback)
  getTvMedia: async (id) => {
    try {
      // Önce Türkçe içeriği dene
      const [trVideos, trImages] = await Promise.all([
        tmdbApi.get(`/tv/${id}/videos`, { params: { language: 'tr-TR' } }),
        tmdbApi.get(`/tv/${id}/images`, { params: { include_image_language: 'tr,en,null' } })
      ]);
      
      // Eğer Türkçe videolar yoksa İngilizce videolar al
      let finalVideos = trVideos.data.results;
      if (finalVideos.length === 0) {
        const enVideos = await tmdbApi.get(`/tv/${id}/videos`, { params: { language: 'en-US' } });
        finalVideos = enVideos.data.results;
      }
      
      return {
        videos: { results: finalVideos },
        images: trImages.data
      };
    } catch (error) {
      console.error('Media service error:', error);
      return { videos: { results: [] }, images: { backdrops: [], posters: [], logos: [] } };
    }
  }
};

export default {
  movieService,
  tvService,
  personService,
  searchService,
  discoverService,
  genreService,
  trendingService,
  collectionService,
  companyService,
  configurationService,
  mediaService,
  getImageUrl
};
