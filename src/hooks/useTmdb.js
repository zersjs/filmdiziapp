import { keepPreviousData, useQueries, useQuery } from '@tanstack/react-query';
import {
  collectionService,
  discoverService,
  genreService,
  movieService,
  personService,
  searchService,
  trendingService,
  tvService,
  watchProviderService,
} from '../services/tmdb';
import { WATCH_REGION } from '../lib/tmdbConfig';
import { buildDiscoverParams } from '../services/browse';
import { buildRecommendParams, typesFor } from '../services/recommend';

const unwrap = (request) => request.then(response => response.data);

const withMediaType = (data, mediaType) =>
  data && { ...data, results: (data.results || []).map(item => ({ ...item, media_type: item.media_type || mediaType })) };

export const useTrending = (timeWindow = 'day') =>
  useQuery({
    queryKey: ['trending', timeWindow],
    queryFn: () => unwrap(trendingService.getAll(timeWindow)),
    select: data => ({ ...data, results: data.results.filter(item => item.media_type !== 'person') }),
  });

const movieLists = {
  popular: movieService.getPopular,
  top_rated: movieService.getTopRated,
  now_playing: movieService.getNowPlaying,
  upcoming: movieService.getUpcoming,
};

const tvLists = {
  popular: tvService.getPopular,
  top_rated: tvService.getTopRated,
  on_the_air: tvService.getOnTheAir,
  airing_today: tvService.getAiringToday,
};

export const useMediaList = (mediaType, list) =>
  useQuery({
    queryKey: ['list', mediaType, list],
    queryFn: () => unwrap((mediaType === 'tv' ? tvLists : movieLists)[list]()),
    select: data => withMediaType(data, mediaType),
  });

// Türkçe metin yoksa İngilizcesini kullan.
const withEnglishFallback = async (data, fetchEnglish, fields) => {
  if (fields.every(field => data[field])) return data;
  try {
    const { data: english } = await fetchEnglish();
    const patch = Object.fromEntries(fields.filter(field => !data[field] && english[field]).map(field => [field, english[field]]));
    return { ...data, ...patch };
  } catch {
    return data;
  }
};

// Sahneler gibi hook dışından da aynı önbelleği kullanabilmek için paylaşılır.
export const detailQueryOptions = (mediaType, id) => ({
  queryKey: ['detail', mediaType, String(id)],
  queryFn: async () => {
    const service = mediaType === 'tv' ? tvService : movieService;
    const data = await unwrap(service.getDetail(id));
    return withEnglishFallback(data, () => service.getBasic(id, 'en-US'), ['overview']);
  },
});

export const useDetail = (mediaType, id) =>
  useQuery({
    ...detailQueryOptions(mediaType, id),
    enabled: !!id && (mediaType === 'movie' || mediaType === 'tv'),
  });

export const useSeason = (tvId, seasonNumber) =>
  useQuery({
    queryKey: ['season', String(tvId), Number(seasonNumber)],
    queryFn: () => unwrap(tvService.getSeasonDetail(tvId, seasonNumber)),
    enabled: !!tvId && seasonNumber !== null && seasonNumber !== undefined,
  });

export const useGenres = (mediaType) =>
  useQuery({
    queryKey: ['genres', mediaType],
    queryFn: () => unwrap(mediaType === 'tv' ? genreService.getTvList() : genreService.getMovieList()),
    select: data => data.genres || [],
    staleTime: Infinity,
  });

export const useDiscover = (mediaType, filters) =>
  useQuery({
    queryKey: ['discover', mediaType, filters],
    queryFn: () => unwrap(
      (mediaType === 'tv' ? discoverService.tv : discoverService.movie)(buildDiscoverParams(mediaType, filters))
    ),
    select: data => withMediaType(data, mediaType),
    placeholderData: keepPreviousData,
  });

export const useRecommendations = (criteria, page, enabled = true) =>
  useQueries({
    queries: typesFor(criteria.type).map(mediaType => ({
      queryKey: ['recommend', mediaType, criteria, page],
      queryFn: () => unwrap(
        (mediaType === 'tv' ? discoverService.tv : discoverService.movie)(buildRecommendParams(mediaType, criteria, page))
      ),
      select: data => withMediaType(data, mediaType),
      enabled,
      staleTime: 30 * 60 * 1000,
    })),
  });

// Dizilerin yayın takvimi için hafif detay (ek veri olmadan); saatlerce taze sayılır.
export const useShowsAiring = (ids) =>
  useQueries({
    queries: ids.map(id => ({
      queryKey: ['tv-basic', String(id)],
      queryFn: () => unwrap(tvService.getBasic(id, 'tr-TR')),
      staleTime: 6 * 60 * 60 * 1000,
    })),
  });

export const useCollection = (id) =>
  useQuery({
    queryKey: ['collection', String(id)],
    queryFn: () => unwrap(collectionService.getDetail(id)),
    select: data => ({
      ...data,
      parts: (data.parts || [])
        .map(part => ({ ...part, media_type: 'movie' }))
        .sort((a, b) => (a.release_date || '9999').localeCompare(b.release_date || '9999')),
    }),
    enabled: !!id,
  });

// Türkiye'de en çok kullanılan platformlar (TMDB/JustWatch görüntüleme önceliğine göre)
export const useWatchProviders = (mediaType, limit = 14) =>
  useQuery({
    queryKey: ['watch-providers', mediaType],
    queryFn: () => unwrap(watchProviderService.getList(mediaType)),
    select: data => (data.results || [])
      .filter(p => p.display_priorities?.[WATCH_REGION] !== undefined)
      .sort((a, b) => a.display_priorities[WATCH_REGION] - b.display_priorities[WATCH_REGION])
      .slice(0, limit),
    staleTime: 24 * 60 * 60 * 1000,
  });

const searchEndpoints = {
  all: searchService.multi,
  movie: searchService.movie,
  tv: searchService.tv,
  person: searchService.person,
};

export const useSearch = (query, page = 1, type = 'all') =>
  useQuery({
    queryKey: ['search', type, query, page],
    queryFn: () => unwrap((searchEndpoints[type] || searchService.multi)(query, page)),
    select: data => (type === 'all' ? data : withMediaType(data, type)),
    enabled: query.trim().length >= 2,
    placeholderData: keepPreviousData,
  });

export const usePerson = (id) =>
  useQuery({
    queryKey: ['person', String(id)],
    queryFn: async () => {
      const data = await unwrap(personService.getDetail(id));
      return withEnglishFallback(data, () => personService.getBasic(id, 'en-US'), ['biography']);
    },
    enabled: !!id,
  });

export const useImages = (mediaType, id, enabled = true) =>
  useQuery({
    queryKey: ['images', mediaType, String(id)],
    queryFn: () => unwrap(mediaType === 'tv' ? tvService.getImages(id) : movieService.getImages(id)),
    enabled: enabled && !!id,
  });

// TMDB incelemelerinin çoğu İngilizce; Türkçe dil filtresiyle neredeyse hiç sonuç dönmüyor.
export const useReviews = (mediaType, id, enabled = true) =>
  useQuery({
    queryKey: ['reviews', mediaType, String(id)],
    queryFn: () => unwrap(mediaType === 'tv' ? tvService.getReviews(id) : movieService.getReviews(id)),
    select: data => data.results || [],
    enabled: enabled && !!id,
  });
