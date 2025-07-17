import { playerService } from './player';
import { movieService, tvService } from './tmdb';

export const trailerService = {
  // Ana fragman fonksiyonu - dil desteği ile
  getContentTrailer: async (contentId, contentType = 'movie', preferredLanguages = ['tr', 'en']) => {
    try {
      let service = contentType === 'movie' ? movieService : tvService;
      const videosResponse = await service.getVideos(contentId);
      
      if (!videosResponse.data || !videosResponse.data.results || videosResponse.data.results.length === 0) {
        return { found: false };
      }

      // Tüm videolardan trailer ve teaser tipleri
      const allVideos = videosResponse.data.results;
      const trailers = allVideos.filter(v => v.type.toLowerCase() === 'trailer');
      const teasers = allVideos.filter(v => v.type.toLowerCase() === 'teaser');
      
      // Tercih edilen dillerde fragman bul
      for (const lang of preferredLanguages) {
        // Önce fragman tipinde ara
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
        
        // Fragman yoksa teaser ara
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
      
      // Tercih edilen dillerde bulunamazsa, herhangi bir fragman döndür
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

  // URL oluştur
  getTrailerUrl: (trailerData, autoplay = false) => {
    if (!trailerData || !trailerData.found || !trailerData.key) {
      return null;
    }
    
    if (trailerData.site === 'YouTube') {
      return playerService.getYoutubeUrl(trailerData.key);
    }
    
    // Diğer sitelere destek eklenebilir
    return null;
  },
  
  // Fragman önizleme resmi
  getTrailerThumbnail: (trailerData) => {
    if (!trailerData || !trailerData.found || !trailerData.key) {
      return null;
    }
    
    if (trailerData.site === 'YouTube') {
      return `https://img.youtube.com/vi/${trailerData.key}/maxresdefault.jpg`;
    }
    
    return null;
  },

  // Fragman başlık etiketini oluştur
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