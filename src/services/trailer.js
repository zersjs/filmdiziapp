import { playerService } from './player';
import { movieService, tvService } from './tmdb';

export const trailerService = {
  
  getContentTrailer: async (contentId, contentType = 'movie', preferredLanguages = ['tr', 'en']) => {
    try {
      let service = contentType === 'movie' ? movieService : tvService;
      const videosResponse = await service.getVideos(contentId);
      
      if (!videosResponse.data || !videosResponse.data.results || videosResponse.data.results.length === 0) {
        return { found: false };
      }

      const allVideos = videosResponse.data.results;
      const trailers = allVideos.filter(v => v.type.toLowerCase() === 'trailer');
      const teasers = allVideos.filter(v => v.type.toLowerCase() === 'teaser');
      
      for (const lang of preferredLanguages) {
        
        const langTrailer = trailers.find(t => t.iso_639_1 === lang);
        if (langTrailer) {
          return {
            found: true,
            key: langTrailer.key,
            language: lang,
            type: 'trailer',
            name: langTrailer.name,
            site: langTrailer.site
          };
        }
        
        const langTeaser = teasers.find(t => t.iso_639_1 === lang);
        if (langTeaser) {
          return {
            found: true,
            key: langTeaser.key,
            language: lang,
            type: 'teaser',
            name: langTeaser.name,
            site: langTeaser.site
          };
        }
      }
      
      if (trailers.length > 0) {
        const firstTrailer = trailers[0];
        return {
          found: true,
          key: firstTrailer.key,
          language: firstTrailer.iso_639_1,
          type: 'trailer',
          name: firstTrailer.name,
          site: firstTrailer.site
        };
      }
      
      if (teasers.length > 0) {
        const firstTeaser = teasers[0];
        return {
          found: true,
          key: firstTeaser.key,
          language: firstTeaser.iso_639_1,
          type: 'teaser',
          name: firstTeaser.name,
          site: firstTeaser.site
        };
      }
      
      return { found: false };
    } catch (error) {
      console.error('Fragman getirme hatası:', error);
      return { found: false, error: error.message };
    }
  },

  getTrailerUrl: (trailerData, autoplay = false) => {
    if (!trailerData || !trailerData.found || !trailerData.key) {
      return null;
    }
    
    if (trailerData.site === 'YouTube') {
      return playerService.getYoutubeUrl(trailerData.key);
    }
    
    return null;
  },
  
  getTrailerThumbnail: (trailerData) => {
    if (!trailerData || !trailerData.found || !trailerData.key) {
      return null;
    }
    
    if (trailerData.site === 'YouTube') {
      return `https://img.youtube.com/vi/${trailerData.key}/maxresdefault.jpg`;
    }
    
    return null;
  },

  getTrailerLabel: (trailerData) => {
    if (!trailerData || !trailerData.found) {
      return '🎬 Fragman';
    }
    
    const langLabels = {
      'tr': 'Türkçe',
      'en': 'İngilizce'
    };
    
    const typeLabels = {
      'trailer': 'Fragman',
      'teaser': 'Teaser'
    };
    
    const langLabel = langLabels[trailerData.language] || trailerData.language.toUpperCase();
    const typeLabel = typeLabels[trailerData.type] || trailerData.type;
    
    return `🎬 ${langLabel} ${typeLabel}`;
  }
};

export default trailerService; 
