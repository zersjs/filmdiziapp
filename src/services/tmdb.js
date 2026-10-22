import axios from 'axios';
import {
  DEFAULT_TMDB_ACCESS_TOKEN, TMDB_API_BASE, TMDB_IMAGE_BASE, WATCH_REGION, pickTmdbApiKey,
} from '../lib/tmdbConfig';

const API_KEY = pickTmdbApiKey(import.meta.env.VITE_TMDB_API_KEY);
const ACCESS_TOKEN = import.meta.env.VITE_TMDB_ACCESS_TOKEN || DEFAULT_TMDB_ACCESS_TOKEN;
const BASE_URL = import.meta.env.VITE_TMDB_BASE_URL || TMDB_API_BASE;
const IMAGE_BASE_URL = import.meta.env.VITE_TMDB_IMAGE_BASE_URL || TMDB_IMAGE_BASE;

const tmdbApi = axios.create({
  baseURL: BASE_URL,
  timeout: 15000,
  headers: {
    Authorization: `Bearer ${ACCESS_TOKEN}`
  },
  params: {
    ...(API_KEY ? { api_key: API_KEY } : {}),
    language: 'tr-TR'
  }
});

export const getImageUrl = (path, size = 'original') => {
  if (!path) {
    return 'data:image/svg+xml;base64,PHN2ZyB3aWR0aD0iNTAwIiBoZWlnaHQ9Ijc1MCIgeG1sbnM9Imh0dHA6Ly93d3cudzMub3JnLzIwMDAvc3ZnIj48cmVjdCB3aWR0aD0iNTAwIiBoZWlnaHQ9Ijc1MCIgZmlsbD0iIzIxMjEyMSIvPjx0ZXh0IHg9IjUwJSIgeT0iNTAlIiBmb250LWZhbWlseT0iQXJpYWwiIGZvbnQtc2l6ZT0iMjQiIGZpbGw9IiM2NjY2NjYiIHRleHQtYW5jaG9yPSJtaWRkbGUiIGR5PSIuM2VtIj5Hw7Zyc2VsIFlvazwvdGV4dD48L3N2Zz4=';
  }
  return `${IMAGE_BASE_URL}/${size}${path}`;
};

export const movieService = {
  
  getPopular: (page = 1) => tmdbApi.get('/movie/popular', { params: { page } }),
  
  getNowPlaying: (page = 1) => tmdbApi.get('/movie/now_playing', { params: { page } }),
  
  getUpcoming: (page = 1) => tmdbApi.get('/movie/upcoming', { params: { page } }),
  
  getTopRated: (page = 1) => tmdbApi.get('/movie/top_rated', { params: { page } }),
  
  getBasic: (id, language) => tmdbApi.get(`/movie/${id}`, { params: { language } }),

  getDetail: (id) => tmdbApi.get(`/movie/${id}`, {
    params: {
      append_to_response: 'credits,videos,recommendations,similar,external_ids,release_dates,watch/providers',
      include_video_language: 'tr,en,null'
    }
  }),
  
  getVideos: (id) => tmdbApi.get(`/movie/${id}/videos`, { params: { include_video_language: 'tr,en,null' } }),
  
  getImages: (id) => tmdbApi.get(`/movie/${id}/images`, { params: { include_image_language: 'tr,en,null' } }),
  
  getWatchProviders: (id) => tmdbApi.get(`/movie/${id}/watch/providers`),

  getReviews: (id) => tmdbApi.get(`/movie/${id}/reviews`, { params: { language: 'en-US' } })
};

export const tvService = {
  
  getPopular: (page = 1) => tmdbApi.get('/tv/popular', { params: { page } }),
  
  getOnTheAir: (page = 1) => tmdbApi.get('/tv/on_the_air', { params: { page } }),
  
  getAiringToday: (page = 1) => tmdbApi.get('/tv/airing_today', { params: { page } }),
  
  getTopRated: (page = 1) => tmdbApi.get('/tv/top_rated', { params: { page } }),
  
  getBasic: (id, language) => tmdbApi.get(`/tv/${id}`, { params: { language } }),

  getDetail: (id) => tmdbApi.get(`/tv/${id}`, {
    params: {
      append_to_response: 'videos,recommendations,similar,external_ids,content_ratings,aggregate_credits,watch/providers',
      include_video_language: 'tr,en,null'
    }
  }),
  
  getSeasonDetail: (tvId, seasonNumber) => tmdbApi.get(`/tv/${tvId}/season/${seasonNumber}`),
  
  getEpisodeDetail: (tvId, seasonNumber, episodeNumber) => tmdbApi.get(`/tv/${tvId}/season/${seasonNumber}/episode/${episodeNumber}`, {
    params: {
      append_to_response: 'credits,videos,images'
    }
  }),
  
  getImages: (id) => tmdbApi.get(`/tv/${id}/images`, { params: { include_image_language: 'tr,en,null' } }),

  getWatchProviders: (id) => tmdbApi.get(`/tv/${id}/watch/providers`),
  
  getVideos: (id) => tmdbApi.get(`/tv/${id}/videos`, { params: { include_video_language: 'tr,en,null' } }),

  getReviews: (id) => tmdbApi.get(`/tv/${id}/reviews`, { params: { language: 'en-US' } })
};

export const personService = {
  getBasic: (id, language) => tmdbApi.get(`/person/${id}`, { params: { language } }),
  
  getPopular: (page = 1) => tmdbApi.get('/person/popular', { params: { page } }),
  
  getDetail: (id) => tmdbApi.get(`/person/${id}`, {
    params: {
      append_to_response: 'combined_credits,external_ids'
    }
  })
};

export const searchService = {
  
  multi: (query, page = 1) => tmdbApi.get('/search/multi', { params: { query, page } }),
  
  movie: (query, page = 1) => tmdbApi.get('/search/movie', { params: { query, page } }),
  
  tv: (query, page = 1) => tmdbApi.get('/search/tv', { params: { query, page } }),
  
  person: (query, page = 1) => tmdbApi.get('/search/person', { params: { query, page } }),
  
  collection: (query, page = 1) => tmdbApi.get('/search/collection', { params: { query, page } }),
  
  keyword: (query, page = 1) => tmdbApi.get('/search/keyword', { params: { query, page } })
};

export const discoverService = {
  
  movie: (params = {}) => tmdbApi.get('/discover/movie', { params }),
  
  tv: (params = {}) => tmdbApi.get('/discover/tv', { params })
};

export const genreService = {
  
  getMovieList: () => tmdbApi.get('/genre/movie/list'),
  
  getTvList: () => tmdbApi.get('/genre/tv/list')
};

export const trendingService = {
  
  getAll: (timeWindow = 'week', page = 1) => tmdbApi.get(`/trending/all/${timeWindow}`, { params: { page } }),
  
  getMovies: (timeWindow = 'week') => tmdbApi.get(`/trending/movie/${timeWindow}`),
  
  getTv: (timeWindow = 'week') => tmdbApi.get(`/trending/tv/${timeWindow}`),
  
  getPerson: (timeWindow = 'week') => tmdbApi.get(`/trending/person/${timeWindow}`)
};

export const watchProviderService = {
  // Türkiye'deki platformlar (Netflix, Prime Video, Disney+...), görüntüleme önceliğine göre
  getList: (mediaType) => tmdbApi.get(`/watch/providers/${mediaType}`, { params: { watch_region: WATCH_REGION } })
};

export const collectionService = {
  getDetail: (id) => tmdbApi.get(`/collection/${id}`, {
    params: {
      append_to_response: 'images'
    }
  })
};

export const companyService = {
  getDetail: (id) => tmdbApi.get(`/company/${id}`, {
    params: {
      append_to_response: 'images'
    }
  })
};

export const configurationService = {
  
  getApiConfiguration: () => tmdbApi.get('/configuration'),
  
  getCountries: () => tmdbApi.get('/configuration/countries'),
  
  getJobs: () => tmdbApi.get('/configuration/jobs'),
  
  getLanguages: () => tmdbApi.get('/configuration/languages'),
  
  getCertifications: () => Promise.all([
    tmdbApi.get('/certification/movie/list'),
    tmdbApi.get('/certification/tv/list')
  ])
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
  getImageUrl
};
