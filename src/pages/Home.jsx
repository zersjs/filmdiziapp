import React, { useState, useEffect } from 'react';
import { Helmet } from 'react-helmet-async';
import { Link } from 'react-router-dom';
import { Swiper, SwiperSlide } from 'swiper/react';
import { Autoplay, Pagination, Navigation } from 'swiper/modules';
import { FaPlay, FaInfoCircle, FaStar, FaCalendar, FaFilm, FaTv, FaTimes } from 'react-icons/fa';
import { movieService, tvService, trendingService, getImageUrl } from '../services/tmdb';
import { formatRating, getYear, truncateText, createSlug } from '../utils/helpers';
import { useApi } from '../hooks';
import { useApp } from '../contexts';
import { useToast } from '../components/UI/Toast';
import MovieCard from '../components/UI/MovieCard';
import { SkeletonList, SkeletonDetail } from '../components/UI/Loading';
import { HeroSkeleton, ContentSectionSkeleton, ContinueWatchingSkeleton } from '../components/UI/EnhancedSkeleton';

// Import Swiper styles
import 'swiper/css';
import 'swiper/css/pagination';
import 'swiper/css/navigation';

const Home = () => {
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

  return (
    <>
      <Helmet>
        <title>SINEFIX - Film ve Dizi İzleme Platformu</title>
        <meta name="description" content="Binlerce film ve diziyi ücretsiz izleyin. En yeni içerikler, en kaliteli izleme deneyimi." />
      </Helmet>

      {/* Hero Section */}
      {featuredContent && (
        <section className="relative h-[85vh] min-h-[700px] overflow-hidden">
          <div className="relative h-full">
            {/* Arka plan resmi */}
            <div className="absolute inset-0">
              <img
                src={getImageUrl(featuredContent.backdrop_path, 'original')}
                alt={featuredContent.title || featuredContent.name}
                className="w-full h-full object-cover"
              />
              <div className="absolute inset-0 bg-gradient-to-t from-black via-black/50 to-transparent" />
              <div className="absolute inset-0 bg-gradient-to-r from-black via-transparent to-transparent" />
            </div>
            {/* İçerik */}
            <div className="relative h-full flex items-center">
              <div className="container-custom">
                <div className="max-w-3xl">
                  {/* Kategori Badge */}
                  <div className="flex items-center space-x-3 mb-4 animate-fade-in-left delay-100">
                    <span className="px-4 py-2 bg-gradient-to-r from-gray-800 to-gray-900 text-white text-sm font-semibold rounded-full shadow-lg border border-white/10 backdrop-blur-sm">
                      {featuredContent.media_type === 'movie' ? '🎬 Film' : '📺 Dizi'}
                    </span>
                    <span className="px-4 py-2 bg-gradient-to-r from-red-600/80 to-orange-600/80 backdrop-blur-sm text-white text-sm rounded-full border border-white/20 animate-bounce-subtle">
                      ⭐ Günün İçeriği
                    </span>
                  </div>

                  {/* Başlık */}
                  <h1 className="text-4xl md:text-7xl font-black mb-6 leading-tight text-white drop-shadow-2xl animate-fade-in-up delay-200">
                    {featuredContent.title || featuredContent.name}
                  </h1>
                  
                  {/* Meta Bilgiler */}
                  <div className="flex items-center space-x-6 mb-6 text-base animate-fade-in-left delay-300">
                    <div className="flex items-center space-x-2 bg-black/40 backdrop-blur-md px-4 py-2.5 rounded-full border border-white/10 shadow-lg">
                      <FaStar className="text-yellow-400 text-lg animate-pulse" />
                      <span className="font-bold text-white">{formatRating(featuredContent.vote_average)}</span>
                      <span className="text-gray-300 text-sm">/10</span>
                    </div>
                    
                    <div className="flex items-center space-x-2 bg-black/40 backdrop-blur-md px-4 py-2.5 rounded-full border border-white/10 shadow-lg">
                      <FaCalendar className="text-blue-400" />
                      <span className="font-semibold text-white">{getYear(featuredContent.release_date || featuredContent.first_air_date)}</span>
                    </div>

                    <div className="hidden md:flex items-center space-x-2 bg-black/40 backdrop-blur-md px-4 py-2.5 rounded-full border border-white/10 shadow-lg">
                      <div className="relative">
                        <span className="w-2 h-2 bg-green-400 rounded-full animate-pulse block"></span>
                        <span className="absolute top-0 left-0 w-2 h-2 bg-green-400 rounded-full animate-ping"></span>
                      </div>
                      <span className="text-white font-medium">4K HDR</span>
                    </div>
                  </div>

                  {/* Açıklama */}
                  <p className="text-lg md:text-xl text-gray-200 mb-8 line-clamp-3 leading-relaxed font-light max-w-2xl animate-fade-in-up delay-400">
                    {featuredContent.overview}
                  </p>

                  {/* Action Buttons */}
                  <div className="flex flex-col sm:flex-row space-y-3 sm:space-y-0 sm:space-x-4 animate-slide-in-right delay-500">
                    <Link
                      to={`/watch/${featuredContent.media_type || 'movie'}/${featuredContent.id}/${createSlug(featuredContent.title || featuredContent.name)}`}
                      className="group relative overflow-hidden bg-gradient-to-r from-white to-gray-100 text-black px-8 py-4 rounded-xl font-bold text-lg transition-all duration-300 transform hover:scale-105 hover:shadow-2xl hover:shadow-white/25 flex items-center justify-center space-x-3 border border-white/20"
                    >
                      <div className="absolute inset-0 bg-gradient-to-r from-transparent via-white/30 to-transparent transform -skew-x-12 -translate-x-full group-hover:translate-x-full transition-transform duration-1000"></div>
                      <FaPlay className="text-xl relative z-10 group-hover:scale-110 transition-transform" />
                      <span className="relative z-10">Hemen İzle</span>
                    </Link>
                    
                    <Link
                      to={`/${featuredContent.media_type || 'movie'}/${featuredContent.id}/${createSlug(featuredContent.title || featuredContent.name)}`}
                      className="group bg-black/40 backdrop-blur-md border-2 border-white/30 hover:border-white/60 text-white px-8 py-4 rounded-xl font-semibold text-lg transition-all duration-300 transform hover:scale-105 hover:bg-black/60 flex items-center justify-center space-x-3 shadow-lg"
                    >
                      <FaInfoCircle className="text-xl group-hover:rotate-12 transition-transform duration-300" />
                      <span>Detaylar</span>
                    </Link>
                  </div>

                  {/* Additional Info */}
                  <div className="mt-8 flex items-center space-x-6 text-sm text-gray-400 animate-fade-in-up delay-600">
                    <div className="flex items-center space-x-2">
                      <span className="w-1 h-1 bg-gray-400 rounded-full"></span>
                      <span>Türkçe Dublaj</span>
                    </div>
                    <div className="flex items-center space-x-2">
                      <span className="w-1 h-1 bg-gray-400 rounded-full"></span>
                      <span>Türkçe Altyazı</span>
                    </div>
                    <div className="flex items-center space-x-2">
                      <span className="w-1 h-1 bg-gray-400 rounded-full"></span>
                      <span>Reklamsız</span>
                    </div>
                  </div>
                </div>
              </div>
            </div>
          </div>
        </section>
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
