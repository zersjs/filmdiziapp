
export const playerService = {
  
  getMovieUrl: (tmdbId, providers = ['vidsrc', 'vidfast']) => {
    const urls = {
      
      vidsrc: `https://vidsrc.to/embed/movie/${tmdbId}`,
      vidsrcme: `https://vidsrc.me/embed/movie?tmdb=${tmdbId}`,
      '2embed': `https://2embed.org/embed/tmdb/movie?id=${tmdbId}`,
      superembed: `https://multiembed.mov/?video_id=${tmdbId}&tmdb=1`,
      embedsu: `https://embed.su/embed/movie/${tmdbId}`,
      vidsrcpro: `https://vidsrc.pro/embed/movie/${tmdbId}`,

      videasy: `https://www.videasy.net/embed/movie/${tmdbId}`,
      vidfast: `https://vidfast.pro/embed/movie/${tmdbId}`,
      vidplay: `https://vidsrc.xyz/embed/movie?tmdb=${tmdbId}`,
      smashystream: `https://embed.smashystream.com/playere.php?tmdb=${tmdbId}`,
      moviesapi: `https://moviesapi.club/movie/${tmdbId}`,
      autoembed: `https://player.autoembed.cc/embed/movie/${tmdbId}`,

      fragman: `trailer-${tmdbId}`,
      fragman_en: `trailer-en-${tmdbId}` 
    };

    return providers.map(provider => ({
      provider,
      url: urls[provider] || null,
      name: getProviderName(provider),
      type: provider === 'fragman' || provider === 'fragman_en' ? 'trailer' : 'stream',
      quality: getProviderQuality(provider),
      reliability: getProviderReliability(provider)
    })).filter(item => item.url);
  },

  getTvUrl: (tmdbId, season, episode, providers = ['vidsrc', 'vidfast']) => {
    const urls = {
      
      vidsrc: `https://vidsrc.to/embed/tv/${tmdbId}/${season}/${episode}`,
      vidsrcme: `https://vidsrc.me/embed/tv?tmdb=${tmdbId}&season=${season}&episode=${episode}`,
      '2embed': `https://2embed.org/embed/tmdb/tv?id=${tmdbId}&s=${season}&e=${episode}`,
      superembed: `https://multiembed.mov/?video_id=${tmdbId}&tmdb=1&season=${season}&episode=${episode}`,
      embedsu: `https://embed.su/embed/tv/${tmdbId}/${season}/${episode}`,
      vidsrcpro: `https://vidsrc.pro/embed/tv/${tmdbId}/${season}/${episode}`,

      videasy: `https://www.videasy.net/embed/tv/${tmdbId}/${season}/${episode}`,
      vidfast: `https://vidfast.pro/embed/tv/${tmdbId}/${season}/${episode}`,
      vidplay: `https://vidsrc.xyz/embed/tv?tmdb=${tmdbId}&season=${season}&episode=${episode}`,
      smashystream: `https://embed.smashystream.com/playere.php?tmdb=${tmdbId}&season=${season}&episode=${episode}`,
      moviesapi: `https://moviesapi.club/tv/${tmdbId}/${season}/${episode}`,
      autoembed: `https://player.autoembed.cc/embed/tv/${tmdbId}/${season}/${episode}`,

      fragman: `trailer-${tmdbId}`,
      fragman_en: `trailer-en-${tmdbId}` 
    };

    return providers.map(provider => ({
      provider,
      url: urls[provider] || null,
      name: getProviderName(provider),
      type: provider === 'fragman' || provider === 'fragman_en' ? 'trailer' : 'stream',
      quality: getProviderQuality(provider),
      reliability: getProviderReliability(provider)
    })).filter(item => item.url);
  },

  getMovieUrlByImdb: (imdbId) => {
    return {
      vidsrc: `https://vidsrc.to/embed/movie/${imdbId}`,
      vidsrcme: `https://vidsrc.me/embed/movie?imdb=${imdbId}`,
      '2embed': `https://2embed.org/embed/imdb/movie?id=${imdbId}`,
      videasy: `https://www.videasy.net/embed/movie/imdb/${imdbId}`,
      vidfast: `https://vidfast.pro/embed/movie/imdb/${imdbId}`,
      vidplay: `https://vidsrc.xyz/embed/movie?imdb=${imdbId}`,
      smashystream: `https://embed.smashystream.com/playere.php?imdb=${imdbId}`,
      filmix: `https://filmix.film/embed/${imdbId}`
    };
  },

  getYoutubeUrl: (key) => {
    return `https://www.youtube.com/embed/${key}?autoplay=1&mute=0&controls=1`;
  },

  getTrailerUrl: (videoKey, autoplay = false, language = 'tr') => {
    if (!videoKey) return null;
    const params = new URLSearchParams({
      autoplay: autoplay ? '1' : '0',
      mute: autoplay ? '1' : '0',
      controls: '1',
      rel: '0',
      modestbranding: '1',
      hl: language 
    });
    return `https://www.youtube.com/embed/${videoKey}?${params.toString()}`;
  },

  checkProviderStatus: async (provider) => {
    try {
      const testUrl = provider.url;
      const response = await fetch(testUrl, {
        method: 'HEAD',
        mode: 'no-cors',
        timeout: 5000
      });
      return { status: 'online', provider: provider.provider };
    } catch (error) {
      return { status: 'offline', provider: provider.provider, error: error.message };
    }
  },

  getBestProvider: (providers) => {
    
    const trailerProvider = providers.find(p => p.type === 'trailer');
    if (trailerProvider) {
      return trailerProvider;
    }

    const priorityOrder = ['videasy', 'vidfast', 'vidsrc', 'vidsrcme', '2embed', 'vidplay', 'superembed'];

    for (const priority of priorityOrder) {
      const provider = providers.find(p => p.provider === priority);
      if (provider && provider.reliability === 'high') {
        return provider;
      }
    }

    return providers.find(p => p.type === 'stream') || providers[0];
  },

  getProvidersByCategory: (providers) => {
    return {
      premium: providers.filter(p => ['videasy', 'vidfast', 'vidsrc', 'vidsrcme'].includes(p.provider)),
      standard: providers.filter(p => ['2embed', 'vidplay', 'superembed'].includes(p.provider)),
      alternative: providers.filter(p => ['embedsu', 'smashystream', 'moviesapi'].includes(p.provider)),
      trailer: providers.filter(p => p.type === 'trailer')
    };
  },

  getTrailerWithLanguageFallback: async (tmdbId, preferredLanguage = 'tr') => {
    
    try {
      
      return {
        key: 'trailer-key', 
        language: 'tr', 
        found: true
      };
    } catch (error) {
      console.error('Fragman alınırken hata:', error);
      return { found: false };
    }
  }
};

const getProviderName = (provider) => {
  const names = {
    vidsrc: 'VidSrc',
    vidsrcme: 'VidSrc.me',
    '2embed': '2Embed',
    superembed: 'SuperEmbed',
    embedsu: 'EmbedSu',
    vidsrcpro: 'VidSrc Pro',
    fragman: '🎬 Türkçe Fragman',
    fragman_en: '🎬 İngilizce Fragman',
    videasy: 'Videasy',
    vidfast: 'VidFast Pro',
    vidplay: 'VidPlay',
    smashystream: 'SmashyStream',
    filmix: 'Filmix',
    moviesapi: 'MoviesAPI',
    autoembed: 'AutoEmbed'
  };
  return names[provider] || provider;
};

const getProviderQuality = (provider) => {
  const qualities = {
    vidsrc: 'HD+',
    vidsrcme: 'HD+',
    '2embed': 'HD',
    videasy: 'FHD',
    vidfast: 'FHD',
    vidplay: 'HD',
    superembed: 'HD',
    embedsu: 'SD+',
    vidsrcpro: 'HD+',
    smashystream: 'HD',
    moviesapi: 'HD',
    autoembed: 'SD+',
    fragman: 'HD',
    fragman_en: 'HD'
  };
  return qualities[provider] || 'SD';
};

const getProviderReliability = (provider) => {
  const reliability = {
    vidsrc: 'high',
    vidsrcme: 'high',
    '2embed': 'medium',
    videasy: 'high', 
    vidfast: 'high',
    vidplay: 'medium',
    superembed: 'medium',
    embedsu: 'low',
    vidsrcpro: 'high',
    smashystream: 'low',
    moviesapi: 'medium',
    autoembed: 'low',
    fragman: 'high',
    fragman_en: 'high'
  };
  return reliability[provider] || 'unknown';
};

export const getProviderTheme = (provider) => {
  const themes = {
    
    vidsrc: { bg: 'bg-blue-600', hover: 'hover:bg-blue-700', text: 'text-white' },
    vidsrcme: { bg: 'bg-blue-500', hover: 'hover:bg-blue-600', text: 'text-white' },
    '2embed': { bg: 'bg-indigo-600', hover: 'hover:bg-indigo-700', text: 'text-white' },
    vidplay: { bg: 'bg-purple-600', hover: 'hover:bg-purple-700', text: 'text-white' },
    
    videasy: { bg: 'bg-green-600', hover: 'hover:bg-green-700', text: 'text-white' },
    vidfast: { bg: 'bg-teal-600', hover: 'hover:bg-teal-700', text: 'text-white' },

    superembed: { bg: 'bg-gray-600', hover: 'hover:bg-gray-700', text: 'text-white' },
    embedsu: { bg: 'bg-gray-500', hover: 'hover:bg-gray-600', text: 'text-white' },
    smashystream: { bg: 'bg-slate-600', hover: 'hover:bg-slate-700', text: 'text-white' },
    moviesapi: { bg: 'bg-zinc-600', hover: 'hover:bg-zinc-700', text: 'text-white' },
    autoembed: { bg: 'bg-neutral-600', hover: 'hover:bg-neutral-700', text: 'text-white' },
    
    fragman: {
      bg: 'bg-gradient-to-r from-gray-900 to-black',
      hover: 'hover:from-black hover:to-gray-900',
      text: 'text-white',
      icon: '🎬',
      special: true
    },
    
    fragman_en: {
      bg: 'bg-gradient-to-r from-gray-800 to-gray-900',
      hover: 'hover:from-gray-900 hover:to-gray-800', 
      text: 'text-white',
      icon: '🎬',
      special: true
    }
  };

  return themes[provider] || { bg: 'bg-gray-600', hover: 'hover:bg-gray-700', text: 'text-white' };
};

export default playerService;
