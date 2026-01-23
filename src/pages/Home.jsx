import React, { useState, useEffect, useCallback } from 'react';
import { Helmet } from 'react-helmet-async';
import { Link, useNavigate } from 'react-router-dom';
import { FaFilm, FaTv, FaTimes, FaPlay, FaSearch, FaVolumeUp, FaVolumeMute, FaFire } from 'react-icons/fa';
import { movieService, tvService, trendingService, getImageUrl } from '../services/tmdb';
import { shortsService } from '../services/shorts';
import { formatRating, getYear, truncateText, createSlug } from '../utils/helpers';
import { triggerHaptic, HapticType } from '../utils/haptic';
import { useApi } from '../hooks';
import { useApp } from '../contexts';
import { useToast } from '../components/UI/Toast';
import MovieCard from '../components/UI/MovieCard';
import SearchModal from '../components/UI/SearchModal';
import { HeroSkeleton } from '../components/UI/EnhancedSkeleton';


const Home = () => {
  const { state, actions } = useApp();
  const { toast } = useToast();
  const [featuredContent, setFeaturedContent] = useState(null);
  const [isSearchOpen, setIsSearchOpen] = useState(false);
  const [shortsData, setShortsData] = useState([]);
  const [shortsLoading, setShortsLoading] = useState(true);

  const { data: trendingData, loading: trendingLoading, error: trendingError } = useApi(
    () => trendingService.getAll('day'),
    [],
    {
      onError: () => toast.error('Trend veriler yüklenirken hata oluştu')
    }
  );

  const { data: popularMoviesData, loading: moviesLoading } = useApi(
    () => movieService.getPopular(),
    [],
    {
      onError: () => toast.error('Popüler filmler yüklenirken hata oluştu')
    }
  );

  const { data: popularSeriesData, loading: seriesLoading } = useApi(
    () => tvService.getPopular(),
    [],
    {
      onError: () => toast.error('Popüler diziler yüklenirken hata oluştu')
    }
  );

  const { data: topRatedData, loading: topRatedLoading } = useApi(
    () => movieService.getTopRated(),
    [],
    {
      onError: () => toast.error('En yüksek puanlı filmler yüklenirken hata oluştu')
    }
  );

  const { data: upcomingData, loading: upcomingLoading } = useApi(
    () => movieService.getUpcoming(),
    [],
    {
      onError: () => toast.error('Yakında gelecek filmler yüklenirken hata oluştu')
    }
  );

  // Shorts içerikleri yükle
  useEffect(() => {
    const loadShorts = async () => {
      try {
        setShortsLoading(true);
        const randomPage = Math.floor(Math.random() * 5) + 1;
        const data = await shortsService.getContentWithTrailers(randomPage);
        // Rastgele 6 içerik seç
        const shuffled = data.sort(() => Math.random() - 0.5);
        setShortsData(shuffled.slice(0, 6));
      } catch (e) {
        console.error('Shorts yüklenemedi:', e);
      } finally {
        setShortsLoading(false);
      }
    };
    loadShorts();
  }, []);

  useEffect(() => {
    if (!trendingData?.results || !popularMoviesData?.results || !topRatedData?.results) {
      return;
    }

    const selectFeaturedContent = () => {
      const contentPool = [
        ...trendingData.results.filter(item => item.vote_average >= 6.5),
        ...popularMoviesData.results.map(item => ({ ...item, media_type: 'movie' })),
        ...(popularSeriesData?.results || []).map(item => ({ ...item, media_type: 'tv' }))
      ];

      const uniqueContent = Array.from(new Map(
        contentPool.map(item => [item.id, item])
      ).values());

      const randomIndex = Math.floor(Math.random() * uniqueContent.length);
      return uniqueContent[randomIndex];
    };

    setFeaturedContent(selectFeaturedContent());
  }, [trendingData, popularMoviesData, popularSeriesData, topRatedData]);

  const loading = trendingLoading || moviesLoading || seriesLoading || topRatedLoading || upcomingLoading;

  const trending = trendingData?.results || [];
  const popularMovies = popularMoviesData?.results || [];
  const popularSeries = popularSeriesData?.results || [];
  const topRatedMovies = topRatedData?.results || [];
  const upcomingMovies = upcomingData?.results || [];


  if (loading) return <HeroSkeleton />;

  const mediaLabel = featuredContent
    ? [
        featuredContent.media_type === 'movie' ? 'Film' : 'Dizi',
        getYear(featuredContent.release_date || featuredContent.first_air_date),
        featuredContent.original_language?.toUpperCase()
      ]
        .filter(Boolean)
        .join(' • ')
    : '';

  const overviewText = featuredContent?.overview
    ? truncateText(featuredContent.overview, 180)
    : 'Bu içerik için detaylar henüz paylaşılmadı.';

  const primaryCta = featuredContent?.media_type === 'tv' ? 'Diziyi İzle' : 'Filmi İzle';
  const secondaryCta = featuredContent?.media_type === 'tv' ? 'Bölümlere Git' : 'Detayları Gör';

  return (
    <>
      <Helmet>
        <title>SINEFIX - Film ve Dizi İzleme Platformu</title>
        <meta name="description" content="Binlerce film ve diziyi ücretsiz izleyin. En yeni içerikler, en kaliteli izleme deneyimi." />
      </Helmet>

      {featuredContent && (
        <section className="relative min-h-[60vh] md:min-h-[75vh] flex items-center overflow-hidden">
          <div className="absolute inset-0">
            <img
              src={getImageUrl(featuredContent.backdrop_path, 'original')}
              alt={featuredContent.title || featuredContent.name}
              className="h-full w-full object-cover opacity-50"
            />
            <div className="absolute inset-0 bg-gradient-to-t from-black via-transparent to-transparent" />
            <div className="absolute inset-0 bg-black/60" />
          </div>

          <div className="relative z-10 w-full py-12">
            <div className="container-custom flex flex-col items-center text-center">
              <div className="max-w-3xl space-y-6 flex flex-col items-center">
                {mediaLabel && (
                  <span className="inline-block text-[10px] uppercase tracking-[0.4em] text-white/40 font-medium">
                    {mediaLabel}
                  </span>
                )}

                <h1 className="text-4xl md:text-7xl font-bold leading-none tracking-tighter uppercase italic">
                  {featuredContent.title || featuredContent.name}
                </h1>

                <p className="text-base md:text-lg text-white/60 line-clamp-2 max-w-xl font-light">
                  {overviewText}
                </p>

                <div className="w-full max-w-lg relative group">
                  <button
                    onClick={() => setIsSearchOpen(true)}
                    className="w-full flex items-center bg-white/5 backdrop-blur-md border border-white/5 hover:border-white/10 transition-all duration-300 rounded-full px-5 py-3 text-white/30 hover:text-white"
                  >
                    <FaSearch className="mr-3 text-lg" />
                    <span className="text-[10px] uppercase tracking-[0.2em] font-medium">İÇERİK VEYA OYUNCU ARA...</span>
                  </button>
                </div>

                <div className="flex flex-wrap justify-center gap-4 pt-4">
                  <Link
                    to={`/watch/${featuredContent.media_type || 'movie'}/${featuredContent.id}/${createSlug(
                      featuredContent.title || featuredContent.name
                    )}`}
                    className="btn-primary px-10"
                  >
                    <FaPlay className="mr-2 text-xs" /> {primaryCta}
                  </Link>

                  <Link
                    to={`/${featuredContent.media_type || 'movie'}/${featuredContent.id}/${createSlug(
                      featuredContent.title || featuredContent.name
                    )}`}
                    className="btn-secondary px-10"
                  >
                    DETAYLAR
                  </Link>
                </div>
              </div>
            </div>
          </div>
        </section>
      )}

      <SearchModal isOpen={isSearchOpen} onClose={() => setIsSearchOpen(false)} />

      <div className="container-custom py-12 space-y-12">
        {state.continueWatching.length > 0 && (
          <ContinueWatchingSection 
            items={state.continueWatching}
          />
        )}

        <ContentSection
          title="Trend Olanlar"
          items={trending}
          viewAllLink="/trending"
        />

        {/* Shorts / Sahneler Section */}
        {shortsData.length > 0 && (
          <ShortsSection items={shortsData} loading={shortsLoading} />
        )}

        <ContentSection
          title="Popüler Filmler"
          items={popularMovies}
          viewAllLink="/movies?sort=popular"
          mediaType="movie"
        />

        <ContentSection
          title="Popüler Diziler"
          items={popularSeries}
          viewAllLink="/series?sort=popular"
          mediaType="tv"
        />

        <ContentSection
          title="En Yüksek Puanlı Filmler"
          items={topRatedMovies}
          viewAllLink="/movies?sort=top_rated"
          mediaType="movie"
        />

        <ContentSection
          title="Yakında Vizyonda"
          items={upcomingMovies}
          viewAllLink="/movies?sort=upcoming"
          mediaType="movie"
        />
      </div>
    </>
  );
};

const ContinueWatchingSection = ({ items }) => {
  return (
    <section>
      <div className="flex items-center justify-between mb-6">
        <h2 className="text-2xl font-bold flex items-center space-x-3">
          <FaPlay className="text-green-500" />
          <span>İzlemeye Devam Et</span>
        </h2>
      </div>
      
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
        {items.slice(0, 6).map((item) => (
          <ContinueWatchingCard key={`${item.id}-${item.media_type}`} item={item} />
        ))}
      </div>
    </section>
  );
};

const ContinueWatchingCard = ({ item }) => {
  const { actions } = useApp();
  const title = item.title || item.name;
  const slug = createSlug(title);
  const posterUrl = item.poster_path ? getImageUrl(item.poster_path, 'w342') : null;
  const watchPath = `/watch/${item.media_type}/${item.id}/${slug}`;

  const removeFromContinueWatching = (e) => {
    e.preventDefault();
    e.stopPropagation();
    actions.removeContinueWatching(item.id, item.media_type);
  };

  return (
    <Link to={watchPath} className="group block bg-gray-900 rounded-lg overflow-hidden hover:bg-gray-800 transition-colors">
      <div className="flex">

        <div className="w-24 h-36 flex-shrink-0">
          {posterUrl ? (
            <img
              src={posterUrl}
              alt={title}
              className="w-full h-full object-cover"
            />
          ) : (
            <div className="w-full h-full bg-gray-800 flex items-center justify-center">
              {item.media_type === 'movie' ? <FaFilm className="text-gray-500" /> : <FaTv className="text-gray-500" />}
            </div>
          )}
        </div>
        
        <div className="flex-1 p-4 flex flex-col justify-between">
          <div>
            <h3 className="font-medium text-white mb-1 line-clamp-2">{title}</h3>
            <p className="text-sm text-gray-400 mb-2">
              {item.media_type === 'movie' ? 'Film' : 'Dizi'}
              {item.season && item.episode && ` • S${item.season}E${item.episode}`}
            </p>
          </div>
          
          <div className="space-y-2">
            <div className="flex items-center justify-between text-xs text-gray-400">
              <span>{item.percentage}% tamamlandı</span>
              <button
                onClick={removeFromContinueWatching}
                className="hover:text-white transition-colors"
                title="Listeden kaldır"
              >
                <FaTimes />
              </button>
            </div>
            <div className="w-full bg-gray-700 rounded-full h-1.5">
              <div 
                className="bg-green-500 h-1.5 rounded-full transition-all duration-300"
                style={{ width: `${Math.min(item.percentage, 100)}%` }}
              ></div>
            </div>
          </div>
        </div>
      </div>
    </Link>
  );
};

const ContentSection = ({ title, items, viewAllLink, mediaType }) => {
  return (
    <section>
      <div className="flex items-center justify-between mb-6">
        <h2 className="text-2xl font-bold">{title}</h2>
        {viewAllLink && (
          <Link
            to={viewAllLink}
            className="text-gray-400 hover:text-white transition-colors"
          >
            Tümünü Gör →
          </Link>
        )}
      </div>
      
      <div className="movie-grid">
        {items.slice(0, 10).map((item) => (
          <MovieCard
            key={item.id}
            item={item}
            mediaType={mediaType || item.media_type}
          />
        ))}
      </div>
    </section>
  );
};

// Shorts Section - TikTok/Reels style preview cards
const ShortsSection = ({ items, loading }) => {
  const navigate = useNavigate();

  const handleCardClick = (item) => {
    triggerHaptic(HapticType.MEDIUM);
    const title = (item.title || item.name || '')
      .toLowerCase()
      .replace(/[^a-z0-9\s-ğüşıöçĞÜŞİÖÇ]/gi, '')
      .replace(/\s+/g, '-')
      .substring(0, 50);
    navigate(`/sahneler/${item.id}-${item.media_type}-${title}`);
  };

  if (loading) {
    return (
      <section>
        <div className="flex items-center justify-between mb-6">
          <h2 className="text-2xl font-bold flex items-center gap-3">
            <FaFire className="text-orange-500" />
            <span>Sahneler</span>
          </h2>
        </div>
        <div className="shorts-grid">
          {[...Array(6)].map((_, i) => (
            <div key={i} className="shorts-card-skeleton">
              <div className="shorts-skeleton-shimmer" />
            </div>
          ))}
        </div>
      </section>
    );
  }

  return (
    <section>
      <div className="flex items-center justify-between mb-6">
        <h2 className="text-2xl font-bold flex items-center gap-3">
          <FaFire className="text-orange-500 animate-pulse" />
          <span>Sahneler</span>
          <span className="text-xs bg-gradient-to-r from-orange-500 to-red-500 text-white px-2 py-1 rounded-full font-medium">
            YENİ
          </span>
        </h2>
        <Link
          to="/sahneler"
          className="text-gray-400 hover:text-white transition-colors flex items-center gap-2"
          onClick={() => triggerHaptic(HapticType.LIGHT)}
        >
          Tümünü Gör →
        </Link>
      </div>
      
      <div className="shorts-grid">
        {items.map((item, index) => (
          <ShortsPreviewCard 
            key={`${item.id}-${item.media_type}`} 
            item={item} 
            index={index}
            onClick={() => handleCardClick(item)}
          />
        ))}
      </div>
    </section>
  );
};

// Shorts Preview Card - TikTok/Reels style with poster
const ShortsPreviewCard = ({ item, index, onClick }) => {
  const title = item.title || item.name;
  const year = (item.release_date || item.first_air_date || '').split('-')[0];
  const rating = item.vote_average?.toFixed(1);
  // Poster kullan - daha kaliteli ve tutarlı görsel
  const posterUrl = getImageUrl(item.poster_path, 'w500');

  return (
    <div 
      className="shorts-preview-card haptic-target"
      onClick={onClick}
      style={{ animationDelay: `${index * 0.1}s` }}
    >
      <div className="shorts-preview-thumbnail">
        <img 
          src={posterUrl} 
          alt={title}
          loading="lazy"
        />
        <div className="shorts-preview-overlay" />
        
        {/* Play icon */}
        <div className="shorts-preview-play">
          <FaPlay />
        </div>
        
        {/* Media type badge */}
        <div className="shorts-preview-badge">
          {item.media_type === 'movie' ? <FaFilm /> : <FaTv />}
        </div>
        
        {/* Rating badge */}
        <div className="shorts-preview-rating-badge">
          ★ {rating}
        </div>
      </div>
      
      <div className="shorts-preview-info">
        <h4 className="shorts-preview-title">{title}</h4>
        <div className="shorts-preview-meta">
          <span className="shorts-preview-year">{year}</span>
          <span className="shorts-preview-type">
            {item.media_type === 'movie' ? 'Film' : 'Dizi'}
          </span>
        </div>
      </div>
    </div>
  );
};

export default Home;

