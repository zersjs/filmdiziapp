import { movieService, tvService, trendingService, discoverService } from './tmdb';

const shuffleArray = (array) => {
  const shuffled = [...array];
  for (let i = shuffled.length - 1; i > 0; i--) {
    const j = Math.floor(Math.random() * (i + 1));
    [shuffled[i], shuffled[j]] = [shuffled[j], shuffled[i]];
  }
  return shuffled;
};

export const shortsService = {
  getInfiniteContent: async (page = 1) => {
    try {
      const sortByOptions = ['popularity.desc', 'vote_average.desc', 'revenue.desc'];
      const sortBy = sortByOptions[Math.floor(Math.random() * sortByOptions.length)];
      
      const currentYear = new Date().getFullYear();
      const randomYearStart = 2010 + Math.floor(Math.random() * (currentYear - 2010));
      
      const requests = [
        discoverService.movie({
          page: (page % 50) + 1,
          sort_by: sortBy,
          'vote_count.gte': 150,
          'vote_average.gte': 5.5,
          'primary_release_date.gte': `${randomYearStart}-01-01`
        }),
        discoverService.tv({
          page: (page % 50) + 1,
          sort_by: sortBy,
          'vote_count.gte': 80,
          'vote_average.gte': 5.5,
          'first_air_date.gte': `${randomYearStart}-01-01`
        })
      ];

      if (page <= 5) {
        requests.push(trendingService.getAll('day'));
      }

      const responses = await Promise.all(requests.map(p => p.catch(() => ({ data: { results: [] } }))));
      
      const movies = (responses[0]?.data?.results || []).map(item => ({ ...item, media_type: 'movie' }));
      const tvShows = (responses[1]?.data?.results || []).map(item => ({ ...item, media_type: 'tv' }));
      const trending = (responses[2]?.data?.results || []);

      const allContent = [...movies, ...tvShows, ...trending];
      const uniqueContent = allContent.filter((item, index, self) =>
        item && item.id && index === self.findIndex(t => t && t.id === item.id && t.media_type === item.media_type)
      );

      return shuffleArray(uniqueContent);
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

      while (allValidResults.length < 10 && attempts < MAX_ATTEMPTS) {
        const content = await shortsService.getInfiniteContent(currentPage);
        if (content.length === 0) break;

        const trailerPromises = content.map(async (item) => {
          try {
            const service = item.media_type === 'movie' ? movieService : tvService;
            const videosRes = await service.getVideos(item.id);
            const videos = videosRes.data.results || [];

            const trailer = videos.find(v =>
              v.site === 'YouTube' &&
              v.type === 'Trailer' &&
              v.official !== false
            ) || videos.find(v =>
              v.site === 'YouTube' &&
              (v.type === 'Trailer' || v.type === 'Teaser' || v.type === 'Clip')
            );

            if (trailer) {
              return {
                ...item,
                trailer: {
                  key: trailer.key,
                  name: trailer.name,
                  type: trailer.type
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
        
        if (allValidResults.length >= 10) break;
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
        service.getDetails(id),
        service.getVideos(id)
      ]);

      const item = detailsRes.data;
      const videos = videosRes.data.results || [];
      const trailer = videos.find(v =>
        v.site === 'YouTube' &&
        v.type === 'Trailer' &&
        v.official !== false
      ) || videos.find(v =>
        v.site === 'YouTube' &&
        (v.type === 'Trailer' || v.type === 'Teaser' || v.type === 'Clip')
      );

      if (trailer) {
        return {
          ...item,
          media_type: mediaType,
          trailer: {
            key: trailer.key,
            name: trailer.name,
            type: trailer.type
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
      mute = 0,
      controls = 0,
      loop = 1,
      start = 0
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
      playsinline: '1',
      enablejsapi: '1',
      modestbranding: '1',
      showinfo: '0',
      cc_load_policy: '0',
      origin: window.location.origin
    });

    return `https://www.youtube-nocookie.com/embed/${videoKey}?${params.toString()}`;
  },

  getThumbnailUrl: (videoKey, quality = 'maxresdefault') => {
    return `https://img.youtube.com/vi/${videoKey}/${quality}.jpg`;
  }
};

export default shortsService;
