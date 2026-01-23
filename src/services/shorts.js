import { movieService, tvService, trendingService, discoverService } from './tmdb';

// Fisher-Yates shuffle with seed for better randomization
const shuffleArray = (array) => {
  const shuffled = [...array];
  for (let i = shuffled.length - 1; i > 0; i--) {
    const j = Math.floor(Math.random() * (i + 1));
    [shuffled[i], shuffled[j]] = [shuffled[j], shuffled[i]];
  }
  return shuffled;
};

// Genre IDs for movies and TV shows
const movieGenres = [28, 12, 16, 35, 80, 99, 18, 10751, 14, 36, 27, 10402, 9648, 10749, 878, 10770, 53, 10752, 37];
const tvGenres = [10759, 16, 35, 80, 99, 18, 10751, 10762, 9648, 10763, 10764, 10765, 10766, 10767, 10768, 37];

export const shortsService = {
  getInfiniteContent: async (page = 1) => {
    try {
      // Her sayfa için farklı parametreler
      const sortByOptions = ['popularity.desc', 'vote_average.desc', 'revenue.desc', 'primary_release_date.desc'];
      const randomSort = sortByOptions[Math.floor(Math.random() * sortByOptions.length)];
      
      const currentYear = new Date().getFullYear();
      // Rastgele yıl aralığı - bazen eski klasikler, bazen yeni filmler
      const yearRanges = [
        { start: 2020, end: currentYear },  // Yeni içerikler
        { start: 2015, end: 2019 },          // Yakın geçmiş
        { start: 2010, end: 2014 },          // Orta geçmiş  
        { start: 2000, end: 2009 },          // Klasikler
        { start: 1990, end: 1999 },          // Nostaljik
      ];
      
      // Sayfa numarasına göre farklı yıl aralığı seç (ama rastgele de karıştır)
      const yearRangeIndex = (page + Math.floor(Math.random() * 2)) % yearRanges.length;
      const selectedYearRange = yearRanges[yearRangeIndex];
      const randomYear = selectedYearRange.start + Math.floor(Math.random() * (selectedYearRange.end - selectedYearRange.start));
      
      // Rastgele genre seç
      const randomMovieGenre = movieGenres[Math.floor(Math.random() * movieGenres.length)];
      const randomTvGenre = tvGenres[Math.floor(Math.random() * tvGenres.length)];
      
      // API sayfa numarasını da rastgeleleştir (1-500 arası)
      const apiPage = ((page * 7 + Math.floor(Math.random() * 10)) % 50) + 1;
      
      const requests = [
        // Film discover - daha yüksek kalite filtresi
        discoverService.movie({
          page: apiPage,
          sort_by: randomSort,
          'vote_count.gte': 500,  // Daha fazla oy alan filmler
          'vote_average.gte': 6.5, // Daha yüksek puan
          'primary_release_date.gte': `${randomYear}-01-01`,
          'primary_release_date.lte': `${selectedYearRange.end}-12-31`,
          with_genres: Math.random() > 0.5 ? randomMovieGenre : undefined
        }),
        // TV discover - daha yüksek kalite filtresi
        discoverService.tv({
          page: apiPage,
          sort_by: randomSort,
          'vote_count.gte': 200,  // Daha fazla oy alan diziler
          'vote_average.gte': 6.5, // Daha yüksek puan
          'first_air_date.gte': `${randomYear}-01-01`,
          'first_air_date.lte': `${selectedYearRange.end}-12-31`,
          with_genres: Math.random() > 0.5 ? randomTvGenre : undefined
        })
      ];

      // Trend içerikler sadece bazı sayfalarda
      if (page <= 3 || Math.random() > 0.7) {
        requests.push(trendingService.getAll(Math.random() > 0.5 ? 'day' : 'week'));
      }
      
      // Farklı sayfalarda farklı sorgular
      if (page % 3 === 0) {
        requests.push(movieService.getTopRated());
      } else if (page % 3 === 1) {
        requests.push(movieService.getPopular());
      } else {
        requests.push(tvService.getPopular());
      }

      const responses = await Promise.all(requests.map(p => p.catch(() => ({ data: { results: [] } }))));
      
      const movies = (responses[0]?.data?.results || []).map(item => ({ ...item, media_type: 'movie' }));
      const tvShows = (responses[1]?.data?.results || []).map(item => ({ ...item, media_type: 'tv' }));
      const trending = (responses[2]?.data?.results || []);
      const extra = (responses[3]?.data?.results || []).map(item => ({ 
        ...item, 
        media_type: item.media_type || (item.first_air_date ? 'tv' : 'movie') 
      }));

      const allContent = [...movies, ...tvShows, ...trending, ...extra];
      
      // Unique content by id + media_type + Kalite filtresi
      const uniqueContent = allContent.filter((item, index, self) =>
        item && 
        item.id && 
        item.poster_path && // Poster olmalı
        item.vote_average >= 6.0 && // Minimum 6.0 puan
        item.vote_count >= 100 && // Minimum 100 oy
        index === self.findIndex(t => t && t.id === item.id && t.media_type === item.media_type)
      );

      // Shuffle multiple times for better randomization
      let result = shuffleArray(uniqueContent);
      result = shuffleArray(result);

      return result;
    } catch (error) {
      console.error('Shorts content error:', error);
      return [];
    }
  },


  getContentWithTrailers: async (page = 1) => {
    try {
      let allValidResults = [];
      let currentPage = page;
      let attempts = 0;
      const MAX_ATTEMPTS = 3;
      const TARGET_COUNT = 12;

      while (allValidResults.length < TARGET_COUNT && attempts < MAX_ATTEMPTS) {
        const content = await shortsService.getInfiniteContent(currentPage);
        if (content.length === 0) break;

        // Batch video requests for better performance
        const batchSize = 5;
        for (let i = 0; i < content.length && allValidResults.length < TARGET_COUNT; i += batchSize) {
          const batch = content.slice(i, i + batchSize);
          
          const trailerPromises = batch.map(async (item) => {
            try {
              const service = item.media_type === 'movie' ? movieService : tvService;
              const videosRes = await service.getVideos(item.id);
              const videos = videosRes.data.results || [];

              // Priority: Official Trailer > Any Trailer > Teaser > Clip
              const trailer = 
                videos.find(v => v.site === 'YouTube' && v.type === 'Trailer' && v.official === true) ||
                videos.find(v => v.site === 'YouTube' && v.type === 'Trailer') ||
                videos.find(v => v.site === 'YouTube' && v.type === 'Teaser') ||
                videos.find(v => v.site === 'YouTube' && v.type === 'Clip');

              if (trailer) {
                return {
                  ...item,
                  trailer: {
                    key: trailer.key,
                    name: trailer.name,
                    type: trailer.type,
                    official: trailer.official
                  }
                };
              }
              return null;
            } catch (error) {
              return null;
            }
          });

          const results = await Promise.all(trailerPromises);
          const validResults = results.filter(Boolean);
          allValidResults = [...allValidResults, ...validResults];
        }
        
        if (allValidResults.length >= TARGET_COUNT) break;
        currentPage++;
        attempts++;
      }

      return shuffleArray(allValidResults);
    } catch (error) {
      console.error('Trailer fetch error:', error);
      return [];
    }
  },

  getShortById: async (id, mediaType) => {
    try {
      const service = mediaType === 'movie' ? movieService : tvService;
      const [detailsRes, videosRes] = await Promise.all([
        service.getDetails ? service.getDetails(id) : service.getDetail(id),
        service.getVideos(id)
      ]);

      const item = detailsRes.data;
      const videos = videosRes.data.results || [];
      
      const trailer = 
        videos.find(v => v.site === 'YouTube' && v.type === 'Trailer' && v.official === true) ||
        videos.find(v => v.site === 'YouTube' && v.type === 'Trailer') ||
        videos.find(v => v.site === 'YouTube' && v.type === 'Teaser') ||
        videos.find(v => v.site === 'YouTube' && v.type === 'Clip');

      if (trailer) {
        return {
          ...item,
          media_type: mediaType,
          trailer: {
            key: trailer.key,
            name: trailer.name,
            type: trailer.type,
            official: trailer.official
          }
        };
      }
      return null;
    } catch (error) {
      console.error('Get short by id error:', error);
      return null;
    }
  },

  getYouTubeEmbedUrl: (videoKey, options = {}) => {
    const {
      autoplay = 1,
      mute = 0, // Sesli başla
      controls = 0,
      loop = 1,
      start = 10
    } = options;

    const params = new URLSearchParams({
      autoplay: autoplay.toString(),
      mute: mute.toString(),
      controls: '0',
      loop: loop.toString(),
      playlist: videoKey,
      start: start.toString(),
      rel: '0',
      fs: '0',
      iv_load_policy: '3',
      disablekb: '1',
      playsinline: '1', // Mobil için kritik - video inline oynar
      enablejsapi: '1',
      modestbranding: '1',
      showinfo: '0',
      cc_load_policy: '0',
      origin: typeof window !== 'undefined' ? window.location.origin : ''
    });

    return `https://www.youtube-nocookie.com/embed/${videoKey}?${params.toString()}`;
  },

  getThumbnailUrl: (videoKey, quality = 'maxresdefault') => {
    if (!videoKey) return '';
    return `https://img.youtube.com/vi/${videoKey}/${quality}.jpg`;
  },

  // Preload next video thumbnail
  preloadThumbnail: (videoKey) => {
    if (!videoKey) return;
    const img = new Image();
    img.src = `https://img.youtube.com/vi/${videoKey}/maxresdefault.jpg`;
  }
};

export default shortsService;
