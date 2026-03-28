import React, { useState, useEffect, useRef } from 'react';
import { Helmet } from 'react-helmet-async';
import { Link, useNavigate } from 'react-router-dom';
import { FaFilm, FaTv, FaTimes, FaPlay, FaSearch, FaFire, FaChevronLeft, FaChevronRight, FaStar } from 'react-icons/fa';
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

  const { data: trendingData, loading: trendingLoading } = useApi(
    () => trendingService.getAll('day'), [], { onError: () => toast.error('Trend veriler yüklenirken hata oluştu') }
  );
  const { data: popularMoviesData, loading: moviesLoading } = useApi(
    () => movieService.getPopular(), [], { onError: () => toast.error('Popüler filmler yüklenirken hata oluştu') }
  );
  const { data: popularSeriesData, loading: seriesLoading } = useApi(
    () => tvService.getPopular(), [], { onError: () => toast.error('Popüler diziler yüklenirken hata oluştu') }
  );
  const { data: topRatedData, loading: topRatedLoading } = useApi(
    () => movieService.getTopRated(), [], { onError: () => toast.error('En yüksek puanlı filmler yüklenirken hata oluştu') }
  );
  const { data: upcomingData, loading: upcomingLoading } = useApi(
    () => movieService.getUpcoming(), [], { onError: () => toast.error('Yakında gelecek filmler yüklenirken hata oluştu') }
  );

  useEffect(() => {
    const loadShorts = async () => {
      try {
        setShortsLoading(true);
        const randomPage = Math.floor(Math.random() * 5) + 1;
        const data = await shortsService.getContentWithTrailers(randomPage);
        const shuffled = data.sort(() => Math.random() - 0.5);
        setShortsData(shuffled.slice(0, 8));
      } catch (e) {
        console.error('Shorts yüklenemedi:', e);
      } finally {
        setShortsLoading(false);
      }
    };
    loadShorts();
  }, []);

  useEffect(() => {
    if (!trendingData?.results || !popularMoviesData?.results) return;
    const pool = [
      ...trendingData.results.filter(i => i.vote_average >= 7 && i.backdrop_path),
      ...popularMoviesData.results.filter(i => i.backdrop_path).map(i => ({ ...i, media_type: 'movie' })),
    ];
    const unique = Array.from(new Map(pool.map(i => [i.id, i])).values());
    if (unique.length > 0) setFeaturedContent(unique[Math.floor(Math.random() * Math.min(unique.length, 8))]);
  }, [trendingData, popularMoviesData]);

  const loading = trendingLoading || moviesLoading || seriesLoading || topRatedLoading || upcomingLoading;
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
        <meta name="description" content="Binlerce film ve diziyi ücretsiz izleyin." />
      </Helmet>

      {featuredContent && <HeroSection content={featuredContent} onSearchOpen={() => setIsSearchOpen(true)} />}

      <SearchModal isOpen={isSearchOpen} onClose={() => setIsSearchOpen(false)} />

      <div className="home-content">
        {state.continueWatching.length > 0 && (
          <ContinueWatchingSection items={state.continueWatching} />
        )}

        <ScrollSection title="Trend Olanlar" items={trending} viewAllLink="/trending" icon={<FaFire className="text-orange-500" />} />

        {shortsData.length > 0 && <ShortsSection items={shortsData} loading={shortsLoading} />}

        <ScrollSection title="Popüler Filmler" items={popularMovies} viewAllLink="/movies?sort=popular" mediaType="movie" />
        <ScrollSection title="Popüler Diziler" items={popularSeries} viewAllLink="/series?sort=popular" mediaType="tv" />
        <ScrollSection title="En İyi Filmler" items={topRatedMovies} viewAllLink="/movies?sort=top_rated" mediaType="movie" />
        <ScrollSection title="Yakında Vizyonda" items={upcomingMovies} viewAllLink="/movies?sort=upcoming" mediaType="movie" />
      </div>
    </>
  );
};

const HeroSection = ({ content, onSearchOpen }) => {
  const type = content.media_type || 'movie';
  const title = content.title || content.name;
  const slug = createSlug(title);
  const year = getYear(content.release_date || content.first_air_date);
  const rating = formatRating(content.vote_average);

  return (
    <section className="hero-compact">
      <div className="hero-compact-bg">
        <img src={getImageUrl(content.backdrop_path, 'w1280')} alt={title} />
        <div className="hero-compact-gradient" />
      </div>
      <div className="hero-compact-content container-custom">
        <div className="hero-compact-meta">
          <span className="hero-compact-badge">{type === 'movie' ? 'Film' : 'Dizi'}</span>
          {year && <span className="hero-compact-year">{year}</span>}
          {rating > 0 && <span className="hero-compact-rating"><FaStar /> {rating}</span>}
        </div>
        <h1 className="hero-compact-title">{title}</h1>
        <p className="hero-compact-desc">{truncateText(content.overview || '', 160)}</p>
        <div className="hero-compact-actions">
          <Link to={`/watch/${type}/${content.id}/${slug}`} className="btn-primary">
            <FaPlay className="text-xs" /> İzle
          </Link>
          <Link to={`/${type}/${content.id}/${slug}`} className="btn-secondary">
            Detaylar
          </Link>
          <button onClick={onSearchOpen} className="hero-search-btn">
            <FaSearch />
          </button>
        </div>
      </div>
    </section>
  );
};

const ScrollSection = ({ title, items, viewAllLink, mediaType, icon }) => {
  const scrollRef = useRef(null);
  const [canScrollLeft, setCanScrollLeft] = useState(false);
  const [canScrollRight, setCanScrollRight] = useState(true);

  const checkScroll = () => {
    if (!scrollRef.current) return;
    const { scrollLeft, scrollWidth, clientWidth } = scrollRef.current;
    setCanScrollLeft(scrollLeft > 10);
    setCanScrollRight(scrollLeft < scrollWidth - clientWidth - 10);
  };

  const scroll = (dir) => {
    if (!scrollRef.current) return;
    const amount = scrollRef.current.clientWidth * 0.75;
    scrollRef.current.scrollBy({ left: dir === 'left' ? -amount : amount, behavior: 'smooth' });
  };

  useEffect(() => { checkScroll(); }, [items]);

  return (
    <section className="scroll-section">
      <div className="scroll-section-header container-custom">
        <h2 className="scroll-section-title">
          {icon && <span className="scroll-section-icon">{icon}</span>}
          {title}
        </h2>
        <div className="scroll-section-controls">
          {viewAllLink && <Link to={viewAllLink} className="scroll-section-link">Tümü</Link>}
          <button className="scroll-arrow" disabled={!canScrollLeft} onClick={() => scroll('left')}><FaChevronLeft /></button>
          <button className="scroll-arrow" disabled={!canScrollRight} onClick={() => scroll('right')}><FaChevronRight /></button>
        </div>
      </div>
      <div className="scroll-row-wrapper">
        <div className="scroll-row container-custom" ref={scrollRef} onScroll={checkScroll}>
          {items.slice(0, 20).map((item) => (
            <div key={item.id} className="scroll-row-item">
              <MovieCard item={item} mediaType={mediaType || item.media_type} />
            </div>
          ))}
        </div>
      </div>
    </section>
  );
};

const ContinueWatchingSection = ({ items }) => {
  return (
    <section className="scroll-section container-custom">
      <div className="scroll-section-header" style={{ padding: 0 }}>
        <h2 className="scroll-section-title">
          <FaPlay className="text-green-500 text-sm" /> İzlemeye Devam Et
        </h2>
      </div>
      <div className="cw-grid">
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

  return (
    <Link to={watchPath} className="cw-card">
      <div className="cw-card-poster">
        {posterUrl ? <img src={posterUrl} alt={title} /> : (
          <div className="cw-card-placeholder">{item.media_type === 'movie' ? <FaFilm /> : <FaTv />}</div>
        )}
      </div>
      <div className="cw-card-info">
        <h3 className="cw-card-title">{title}</h3>
        <span className="cw-card-meta">
          {item.media_type === 'movie' ? 'Film' : 'Dizi'}
          {item.season && item.episode && ` · S${item.season}E${item.episode}`}
        </span>
        <div className="cw-progress">
          <div className="cw-progress-bar" style={{ width: `${Math.min(item.percentage, 100)}%` }} />
        </div>
      </div>
      <button
        onClick={(e) => { e.preventDefault(); e.stopPropagation(); actions.removeContinueWatching(item.id, item.media_type); }}
        className="cw-card-remove"
      >
        <FaTimes />
      </button>
    </Link>
  );
};

const ShortsSection = ({ items, loading }) => {
  const navigate = useNavigate();
  const scrollRef = useRef(null);

  const handleCardClick = (item) => {
    triggerHaptic(HapticType.MEDIUM);
    const title = (item.title || item.name || '').toLowerCase().replace(/[^a-z0-9\s\-]/gi, '').replace(/\s+/g, '-').substring(0, 50);
    navigate(`/sahneler/${item.id}-${item.media_type}-${title}`);
  };

  if (loading) return null;

  return (
    <section className="scroll-section">
      <div className="scroll-section-header container-custom">
        <h2 className="scroll-section-title">
          <FaFire className="text-orange-500" /> Sahneler
          <span className="scroll-section-badge">Yeni</span>
        </h2>
        <Link to="/sahneler" className="scroll-section-link">Tümü</Link>
      </div>
      <div className="scroll-row-wrapper">
        <div className="scroll-row scroll-row-shorts container-custom" ref={scrollRef}>
          {items.map((item, i) => (
            <div key={`${item.id}-${item.media_type}`} className="scroll-row-short-item" style={{ animationDelay: `${i * 0.06}s` }}>
              <div className="short-card" onClick={() => handleCardClick(item)}>
                <div className="short-card-thumb">
                  <img src={getImageUrl(item.poster_path, 'w500')} alt={item.title || item.name} loading="lazy" />
                  <div className="short-card-overlay" />
                  <div className="short-card-play"><FaPlay /></div>
                  <div className="short-card-rating">★ {item.vote_average?.toFixed(1)}</div>
                </div>
                <div className="short-card-info">
                  <h4>{item.title || item.name}</h4>
                  <span>{(item.release_date || item.first_air_date || '').split('-')[0]} · {item.media_type === 'movie' ? 'Film' : 'Dizi'}</span>
                </div>
              </div>
            </div>
          ))}
        </div>
      </div>
    </section>
  );
};

export default Home;
