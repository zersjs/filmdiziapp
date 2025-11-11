import React, { useState, useEffect } from 'react';
import { Helmet } from 'react-helmet-async';
import { Link } from 'react-router-dom';
import { FaFilm, FaTv, FaTimes, FaPlay, FaInfoCircle } from 'react-icons/fa';
import { motion } from 'framer-motion';
import { useTranslation } from 'react-i18next';
import { movieService, tvService, trendingService, getImageUrl } from '../services/tmdb';
import { formatRating, getYear, truncateText, createSlug } from '../utils/helpers';
import { useApi } from '../hooks';
import { useApp } from '../contexts';
import { useToast } from '../components/UI/Toast';
import MovieCard from '../components/UI/MovieCard';
import { HeroSkeleton } from '../components/UI/EnhancedSkeleton';

const createAccentPalette = (voteAverage = 0, popularity = 0) => {
  const normalizedVote = Math.min(Math.max(voteAverage || 0, 0), 10) / 10;
  const normalizedPopularity = Math.min(Math.max(popularity || 0, 0), 1000) / 1000;

  const baseHue = Math.round(200 - normalizedVote * 140);
  const accentHue = (baseHue + 110) % 360;

  const intensity = 0.45 + normalizedPopularity * 0.35;
  const glow = 40 + normalizedPopularity * 30;

  return {
    primary: `hsla(${baseHue}, 82%, ${Math.min(glow, 72)}%, ${Math.min(intensity + 0.2, 0.85)})`,
    secondary: `hsla(${accentHue}, 78%, ${Math.min(glow + 8, 80)}%, ${Math.min(intensity, 0.7)})`
  };
};

const Home = () => {
  const { t } = useTranslation();
  const { state, actions } = useApp();
  const { toast } = useToast();
  const [featuredContent, setFeaturedContent] = useState(null);

  // API hook'larını kullan
  const { data: trendingData, loading: trendingLoading, error: trendingError } = useApi(
    () => trendingService.getAll('week'),
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

  // Günün içeriğini seçmek için algoritma
  useEffect(() => {
    if (!trendingData?.results || !popularMoviesData?.results || !topRatedData?.results) {
      return;
    }

    const selectFeaturedContent = () => {
      // Gelişmiş içerik seçim algoritması
      const today = new Date();
      const dailySeed = today.getFullYear() * 10000 + (today.getMonth() + 1) * 100 + today.getDate();
      
      // 1. İçerikleri puanlama kriterleriyle değerlendir
      const evaluateContent = (item) => {
        let score = 0;
        
        // Temel puan kriterleri
        score += item.vote_average * 10; // IMDB puanı ağırlığı
        score += Math.min(item.vote_count / 1000, 20); // Oy sayısı (max 20 puan)
        score += item.popularity / 100; // Popülerlik puanı
        
        // Bonus puanlar
        if (item.original_language === 'tr') score += 15; // Türkçe içeriğe bonus
        if (item.release_date) {
          const releaseYear = new Date(item.release_date).getFullYear();
          const age = today.getFullYear() - releaseYear;
          score += Math.max(10 - age, 0); // Yeni içeriğe bonus (max 10 puan)
        }
        
        // Tür bazlı bonuslar
        const genreBonus = {
          28: 51,  // Aksiyon
          12: 5,  // Macera
          16: 2,  // Animasyon
          35: 4,  // Komedi
          80: 5,  // Suç
          18: 5,  // Drama
          14: 4,  // Fantastik
          27: 3,  // Korku
          9648: 4 // Gizem
        };
        
        if (item.genre_ids) {
          item.genre_ids.forEach(genreId => {
            score += genreBonus[genreId] || 0;
          });
        }

        return score;
      };

      // 2. Tüm içerikleri birleştir ve filtrele
      const contentPool = [
        ...trendingData.results.filter(item => item.vote_average >= 6.5),
        ...popularMoviesData.results.filter(item => item.vote_average >= 7.0),
        ...topRatedData.results.filter(item => item.vote_average >= 7.5)
      ];

      // 3. Dublikleri kaldır ve puanla
      const uniqueContent = Array.from(new Map(
        contentPool.map(item => [item.id, item])
      ).values());

      // 4. İçerikleri puanlarına göre sırala
      const scoredContent = uniqueContent
        .map(item => ({
          ...item,
          algorithmScore: evaluateContent(item)
        }))
        .sort((a, b) => b.algorithmScore - a.algorithmScore);

      // 5. Günlük rotasyon için top 10'dan seç
      const topContent = scoredContent.slice(0, 10);
      const rotationIndex = dailySeed % topContent.length;
      
      return topContent[rotationIndex] || scoredContent[0] || trendingData.results[0];
    };

    setFeaturedContent(selectFeaturedContent());
  }, [trendingData, popularMoviesData, topRatedData]);

  const loading = trendingLoading || moviesLoading || seriesLoading || topRatedLoading || upcomingLoading;

  // Verileri hazırla
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
    ? truncateText(featuredContent.overview, 220)
    : 'Bu içerik için detaylar henüz TMDB tarafından paylaşılmadı.';

  const metrics = featuredContent
    ? [
        {
          label: featuredContent.media_type === 'movie' ? 'Puan' : 'Bölüm Puanı',
          value: formatRating(featuredContent.vote_average),
          description: `${featuredContent.vote_count?.toLocaleString('tr-TR') || '0'} oy`
        },
        {
          label: featuredContent.media_type === 'movie' ? 'Vizyon Yılı' : 'İlk Yayın',
          value: getYear(featuredContent.release_date || featuredContent.first_air_date),
          description: new Date(
            featuredContent.release_date || featuredContent.first_air_date || Date.now()
          ).toLocaleDateString('tr-TR', { dateStyle: 'long' })
        },
        {
          label: 'Popülerlik',
          value: Math.round(featuredContent.popularity || 0),
          description: 'TMDB trend skoru'
        }
      ]
    : [];

  const primaryCta = featuredContent?.media_type === 'tv' ? 'Diziyi İzle' : 'Filmi İzle';
  const secondaryCta = featuredContent?.media_type === 'tv' ? 'Bölümlere Git' : 'Detayları Gör';

  return (
    <>
      <Helmet>
        <title>SINEFIX - Film ve Dizi İzleme Platformu</title>
        <meta name="description" content="Binlerce film ve diziyi ücretsiz izleyin. En yeni içerikler, en kaliteli izleme deneyimi." />
      </Helmet>

      {/* Hero Section - Enhanced with better visibility */}
      {featuredContent && (
        <motion.section
          initial={{ opacity: 0 }}
          animate={{ opacity: 1 }}
          transition={{ duration: 0.8 }}
          className="relative min-h-[75vh] md:min-h-[85vh] lg:min-h-[90vh] overflow-hidden text-white"
        >
          {/* Background Image with improved visibility */}
          <div className="absolute inset-0">
            <motion.img
              initial={{ scale: 1.1 }}
              animate={{ scale: 1 }}
              transition={{ duration: 1.5 }}
              src={getImageUrl(featuredContent.backdrop_path, 'original')}
              alt={featuredContent.title || featuredContent.name}
              className="h-full w-full object-cover opacity-70"
            />
            {/* Enhanced gradient overlay for better readability */}
            <div className="absolute inset-0 bg-gradient-to-t from-black via-black/70 to-black/40" />
            <div className="absolute inset-0 bg-gradient-to-r from-black/80 via-transparent to-transparent" />
          </div>

          {/* Content */}
          <div className="relative z-10">
            <div className="container-custom py-24 md:py-32 lg:py-40">
              <motion.div
                initial={{ opacity: 0, y: 30 }}
                animate={{ opacity: 1, y: 0 }}
                transition={{ duration: 0.8, delay: 0.2 }}
                className="max-w-4xl space-y-6 md:space-y-8"
              >
                {/* Media Label */}
                {mediaLabel && (
                  <motion.span
                    initial={{ opacity: 0 }}
                    animate={{ opacity: 1 }}
                    transition={{ delay: 0.3 }}
                    className="inline-flex items-center text-xs md:text-sm uppercase tracking-[0.4em] text-white/80 font-semibold"
                  >
                    {mediaLabel}
                  </motion.span>
                )}

                {/* Title */}
                <motion.h1
                  initial={{ opacity: 0, y: 20 }}
                  animate={{ opacity: 1, y: 0 }}
                  transition={{ delay: 0.4 }}
                  className="text-4xl md:text-6xl lg:text-7xl xl:text-8xl font-black leading-tight tracking-tight drop-shadow-2xl"
                >
                  {featuredContent.title || featuredContent.name}
                </motion.h1>

                {/* Description */}
                <motion.p
                  initial={{ opacity: 0 }}
                  animate={{ opacity: 1 }}
                  transition={{ delay: 0.5 }}
                  className="text-base md:text-lg lg:text-xl leading-relaxed text-white/90 max-w-3xl drop-shadow-lg"
                >
                  {overviewText}
                </motion.p>

                {/* Metrics */}
                <motion.div
                  initial={{ opacity: 0, y: 20 }}
                  animate={{ opacity: 1, y: 0 }}
                  transition={{ delay: 0.6 }}
                  className="grid grid-cols-1 gap-3 sm:grid-cols-3 sm:gap-4 max-w-2xl"
                >
                  {metrics.map((metric, index) => (
                    <motion.div
                      key={metric.label}
                      initial={{ opacity: 0, scale: 0.9 }}
                      animate={{ opacity: 1, scale: 1 }}
                      transition={{ delay: 0.7 + index * 0.1 }}
                      whileHover={{ scale: 1.05 }}
                      className="rounded-2xl border border-white/20 bg-white/10 backdrop-blur-md p-5 hover:bg-white/15 transition-all duration-300"
                    >
                      <span className="text-xs uppercase tracking-widest text-white/70 font-medium">
                        {metric.label}
                      </span>
                      <p className="mt-2 text-3xl font-bold text-white drop-shadow-md">{metric.value}</p>
                      <p className="mt-1 text-xs text-white/70">{metric.description}</p>
                    </motion.div>
                  ))}
                </motion.div>

                {/* Action Buttons */}
                <motion.div
                  initial={{ opacity: 0, y: 20 }}
                  animate={{ opacity: 1, y: 0 }}
                  transition={{ delay: 0.9 }}
                  className="flex flex-col gap-4 pt-4 sm:flex-row"
                >
                  <Link
                    to={`/watch/${featuredContent.media_type || 'movie'}/${featuredContent.id}/${createSlug(
                      featuredContent.title || featuredContent.name
                    )}`}
                    className="group inline-flex items-center justify-center gap-3 rounded-full bg-gradient-to-r from-red-600 to-orange-600 px-10 py-4 text-base font-bold uppercase tracking-wide text-white shadow-2xl transition-all duration-300 hover:from-red-700 hover:to-orange-700 hover:scale-105 hover:shadow-red-500/50"
                  >
                    <FaPlay className="text-sm group-hover:scale-110 transition-transform" />
                    <span>{primaryCta}</span>
                  </Link>

                  <Link
                    to={`/${featuredContent.media_type || 'movie'}/${featuredContent.id}/${createSlug(
                      featuredContent.title || featuredContent.name
                    )}`}
                    className="group inline-flex items-center justify-center gap-3 rounded-full border-2 border-white/40 bg-white/10 backdrop-blur-md px-10 py-4 text-base font-bold uppercase tracking-wide text-white transition-all duration-300 hover:border-white hover:bg-white/20 hover:scale-105"
                  >
                    <FaInfoCircle className="text-sm group-hover:scale-110 transition-transform" />
                    <span>{secondaryCta}</span>
                  </Link>
                </motion.div>
              </motion.div>
            </div>
          </div>
        </motion.section>
      )}

      {/* İçerik Bölümleri */}
      <div className="container-custom py-12 space-y-12">
        {/* Continue Watching */}
        {state.continueWatching.length > 0 && (
          <ContinueWatchingSection 
            items={state.continueWatching}
          />
        )}

        {/* Trend Olanlar */}
        <ContentSection
          title="Trend Olanlar"
          items={trending}
          viewAllLink="/trending"
        />

        {/* Popüler Filmler */}
        <ContentSection
          title="Popüler Filmler"
          items={popularMovies}
          viewAllLink="/movies?sort=popular"
          mediaType="movie"
        />

        {/* Popüler Diziler */}
        <ContentSection
          title="Popüler Diziler"
          items={popularSeries}
          viewAllLink="/series?sort=popular"
          mediaType="tv"
        />

        {/* En Yüksek Puanlı Filmler */}
        <ContentSection
          title="En Yüksek Puanlı Filmler"
          items={topRatedMovies}
          viewAllLink="/movies?sort=top_rated"
          mediaType="movie"
        />

        {/* Yakında Vizyonda */}
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

// Continue Watching bileşeni
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

// Continue Watching Card bileşeni
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
        {/* Poster */}
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
        
        {/* Content */}
        <div className="flex-1 p-4 flex flex-col justify-between">
          <div>
            <h3 className="font-medium text-white mb-1 line-clamp-2">{title}</h3>
            <p className="text-sm text-gray-400 mb-2">
              {item.media_type === 'movie' ? 'Film' : 'Dizi'}
              {item.season && item.episode && ` • S${item.season}E${item.episode}`}
            </p>
          </div>
          
          {/* Progress Bar */}
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

// İçerik bölümü bileşeni
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
        {items.slice(0, 12).map((item) => (
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

export default Home;
