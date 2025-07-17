import React, { useState, useEffect } from 'react';
import { Helmet } from 'react-helmet-async';
import { Link } from 'react-router-dom';
import { Swiper, SwiperSlide } from 'swiper/react';
import { Autoplay, Pagination, Navigation } from 'swiper/modules';
import { FaPlay, FaInfoCircle, FaStar, FaCalendar } from 'react-icons/fa';
import { movieService, tvService, trendingService, getImageUrl } from '../services/tmdb';
import { formatRating, getYear, truncateText, createSlug } from '../utils/helpers';
import { useApi } from '../hooks';
import { useApp } from '../contexts';
import { useToast } from '../components/UI/Toast';
import MovieCard from '../components/UI/MovieCard';
import { SkeletonList, SkeletonDetail } from '../components/UI/Loading';

// Import Swiper styles
import 'swiper/css';
import 'swiper/css/pagination';
import 'swiper/css/navigation';

const Home = () => {
  const { actions } = useApp();
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

  if (loading) return <SkeletonDetail />;

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
                  <div className="flex items-center space-x-3 mb-4">
                    <span className="px-3 py-1 bg-gray-800 text-white text-sm font-semibold rounded-full shadow-lg">
                      {featuredContent.media_type === 'movie' ? '🎬 Film' : '📺 Dizi'}
                    </span>
                    <span className="px-3 py-1 bg-black/40 backdrop-blur-sm text-white text-sm rounded-full border border-white/20">
                      Günün İçeriği
                    </span>
                  </div>

                  {/* Başlık */}
                  <h1 className="text-4xl md:text-7xl font-black mb-6 leading-tight text-white drop-shadow-2xl">
                    {featuredContent.title || featuredContent.name}
                  </h1>
                  
                  {/* Meta Bilgiler */}
                  <div className="flex items-center space-x-6 mb-6 text-base">
                    <div className="flex items-center space-x-2 bg-black/30 backdrop-blur-sm px-3 py-2 rounded-full">
                      <FaStar className="text-white text-lg" />
                      <span className="font-bold text-white">{formatRating(featuredContent.vote_average)}</span>
                      <span className="text-gray-300 text-sm">/10</span>
                    </div>
                    
                    <div className="flex items-center space-x-2 bg-black/30 backdrop-blur-sm px-3 py-2 rounded-full">
                      <FaCalendar className="text-white" />
                      <span className="font-semibold text-white">{getYear(featuredContent.release_date || featuredContent.first_air_date)}</span>
                    </div>

                    <div className="hidden md:flex items-center space-x-2 bg-black/30 backdrop-blur-sm px-3 py-2 rounded-full">
                      <span className="w-2 h-2 bg-white rounded-full animate-pulse"></span>
                      <span className="text-white font-medium">HD Kalite</span>
                    </div>
                  </div>

                  {/* Açıklama */}
                  <p className="text-lg md:text-xl text-gray-200 mb-8 line-clamp-3 leading-relaxed font-light max-w-2xl">
                    {featuredContent.overview}
                  </p>

                  {/* Action Buttons */}
                  <div className="flex flex-col sm:flex-row space-y-3 sm:space-y-0 sm:space-x-4">
                    <Link
                      to={`/watch/${featuredContent.media_type || 'movie'}/${featuredContent.id}/${createSlug(featuredContent.title || featuredContent.name)}`}
                      className="group relative overflow-hidden bg-white text-black px-8 py-4 rounded-xl font-bold text-lg transition-all duration-300 transform hover:scale-105 hover:shadow-2xl hover:shadow-white/25 flex items-center justify-center space-x-3"
                    >
                      <div className="absolute inset-0 bg-gradient-to-r from-gray-100/0 via-gray-100/20 to-gray-100/0 transform -skew-x-12 -translate-x-full group-hover:translate-x-full transition-transform duration-1000"></div>
                      <FaPlay className="text-xl relative z-10" />
                      <span className="relative z-10">Hemen İzle</span>
                    </Link>
                    
                    <Link
                      to={`/${featuredContent.media_type || 'movie'}/${featuredContent.id}/${createSlug(featuredContent.title || featuredContent.name)}`}
                      className="group bg-black/40 backdrop-blur-sm border-2 border-white/30 hover:border-white/60 text-white px-8 py-4 rounded-xl font-semibold text-lg transition-all duration-300 transform hover:scale-105 hover:bg-black/60 flex items-center justify-center space-x-3"
                    >
                      <FaInfoCircle className="text-xl group-hover:rotate-12 transition-transform duration-300" />
                      <span>Detaylar</span>
                    </Link>
                  </div>
                </div>
              </div>
            </div>
          </div>
        </section>
      )}

      {/* İçerik Bölümleri */}
      <div className="container-custom py-12 space-y-12">
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
