import React, { useEffect, useMemo, useState } from 'react';
import { Helmet } from 'react-helmet-async';
import { Link, useNavigate } from 'react-router-dom';
import { FaPlay, FaStar, FaTimes, FaInfoCircle, FaPlus, FaCheck, FaFire } from 'react-icons/fa';
import { getImageUrl } from '../services/tmdb';
import { createShortSlug } from '../services/shorts';
import { useShortsPreview } from '../hooks/useShortsFeed';
import { useMediaList, useTrending } from '../hooks';
import { useApp } from '../contexts';
import { useToast } from '../components/UI/Toast';
import MediaRow, { Row } from '../components/UI/MediaRow';
import { HeroSkeleton } from '../components/UI/Loading';
import { ErrorState } from '../components/UI/States';
import {
  getDetailPath, getMediaLabel, getMediaType, getReleaseDate, getTitle, getWatchPath, getYear,
} from '../utils/helpers';

const HERO_COUNT = 6;
const HERO_INTERVAL = 9000;

const Hero = ({ items }) => {
  const [index, setIndex] = useState(0);
  const [paused, setPaused] = useState(false);
  const { actions } = useApp();
  const { toast } = useToast();
  const item = items[index];

  useEffect(() => {
    if (paused || items.length < 2) return undefined;
    const timer = setTimeout(() => setIndex(i => (i + 1) % items.length), HERO_INTERVAL);
    return () => clearTimeout(timer);
  }, [index, paused, items.length]);

  if (!item) return null;

  const type = getMediaType(item);
  const title = getTitle(item);
  const year = getYear(getReleaseDate(item));
  const inList = actions.isWatchLater(item.id, type);

  const toggleList = () => {
    const added = actions.toggleWatchLater(item, type);
    toast.success(added ? 'İzleme listene eklendi' : 'İzleme listenden çıkarıldı', 2000);
  };

  return (
    <section
      className="hero"
      onMouseEnter={() => setPaused(true)}
      onMouseLeave={() => setPaused(false)}
      aria-roledescription="carousel"
      aria-label="Öne çıkanlar"
    >
      <div className="hero-bg" key={`bg-${item.id}`}>
        <img
          src={getImageUrl(item.backdrop_path, 'w1280')}
          srcSet={`${getImageUrl(item.backdrop_path, 'w780')} 780w, ${getImageUrl(item.backdrop_path, 'w1280')} 1280w, ${getImageUrl(item.backdrop_path, 'original')} 1920w`}
          sizes="100vw"
          alt=""
          fetchpriority={index === 0 ? 'high' : 'auto'}
        />
      </div>

      <div className="hero-content container-custom">
        <div className="hero-inner" key={`content-${item.id}`}>
          <div className="meta-row">
            <span className="badge">{getMediaLabel(type)}</span>
            {year && <span>{year}</span>}
            {item.vote_average > 0 && (
              <span className="rating"><FaStar className="text-[11px]" /> {item.vote_average.toFixed(1)}</span>
            )}
          </div>
          <h1 className="hero-title">{title}</h1>
          {item.overview && <p className="hero-desc line-clamp-3">{item.overview}</p>}
          <div className="hero-actions">
            <Link to={getWatchPath(item, type)} className="btn btn-primary btn-lg">
              <FaPlay className="text-xs" /> İzle
            </Link>
            <Link to={getDetailPath(item, type)} className="btn btn-secondary btn-lg">
              <FaInfoCircle /> Detaylar
            </Link>
            <button
              type="button"
              onClick={toggleList}
              className={`icon-btn bordered lg !h-[50px] !w-[50px] ${inList ? 'active' : ''}`}
              aria-label={inList ? 'İzleme listesinden çıkar' : 'İzleme listesine ekle'}
              aria-pressed={inList}
            >
              {inList ? <FaCheck /> : <FaPlus />}
            </button>
          </div>
          {items.length > 1 && (
            <div className="hero-dots" role="tablist" aria-label="Öne çıkan içerik seç">
              {items.map((entry, i) => (
                <button
                  key={entry.id}
                  type="button"
                  role="tab"
                  aria-selected={i === index}
                  aria-label={getTitle(entry)}
                  className={`hero-dot ${i === index ? 'active' : ''}`}
                  onClick={() => setIndex(i)}
                />
              ))}
            </div>
          )}
        </div>
      </div>
    </section>
  );
};

const ContinueWatchingRow = () => {
  const { state, actions } = useApp();
  const items = state.continueWatching;
  if (items.length === 0) return null;

  return (
    <Row title="İzlemeye devam et">
      {items.slice(0, 12).map(item => {
        const episodeLabel = item.media_type === 'tv' && item.season
          ? `S${item.season} · B${item.episode}${item.episodeName ? ` · ${item.episodeName}` : ''}`
          : getMediaLabel(item.media_type);
        const image = item.backdrop_path || item.poster_path;
        return (
          <div key={`${item.media_type}-${item.id}`} className="row-item wide">
            <div className="relative">
              <Link
                to={getWatchPath(item, item.media_type, { season: item.season, episode: item.episode })}
                className="cw-card"
              >
                <div className="cw-thumb">
                  {image && <img src={getImageUrl(image, item.backdrop_path ? 'w780' : 'w342')} alt="" loading="lazy" />}
                  <div className="cw-play">
                    <span className="cw-play-icon"><FaPlay /></span>
                    <span className="min-w-0">
                      <span className="block truncate text-sm font-bold">{item.title}</span>
                      <span className="block truncate text-xs text-white/60">{episodeLabel}</span>
                    </span>
                  </div>
                </div>
              </Link>
              <button
                type="button"
                className="icon-btn cw-remove !h-8 !w-8 bg-black/60 text-xs"
                onClick={() => actions.removeContinueWatching(item.id, item.media_type)}
                aria-label={`${item.title} listeden kaldır`}
              >
                <FaTimes />
              </button>
            </div>
          </div>
        );
      })}
    </Row>
  );
};

const ShortsRow = () => {
  const navigate = useNavigate();
  const { data = [], isLoading } = useShortsPreview();

  if (!isLoading && data.length === 0) return null;

  const open = (item) => navigate(`/sahneler/${createShortSlug(item)}`);

  return (
    <Row
      title="Sahneler"
      icon={<FaFire className="text-orange-500" />}
      link="/sahneler"
      linkLabel="Akışı aç"
      loading={isLoading}
      skeleton="short"
    >
      {data.slice(0, 12).map(item => (
        <div key={`${item.media_type}-${item.id}`} className="row-item short">
          <button type="button" className="short-card" onClick={() => open(item)}>
            <img src={getImageUrl(item.poster_path, 'w342')} alt="" loading="lazy" />
            <span className="short-card-play"><FaPlay /></span>
            <span className="short-card-info">
              <span className="line-clamp-2 text-[13px] font-semibold leading-snug">{getTitle(item)}</span>
              <span className="mt-1 block text-[11px] text-white/55">
                {getYear(getReleaseDate(item))} · {getMediaLabel(item.media_type)}
              </span>
            </span>
          </button>
        </div>
      ))}
    </Row>
  );
};

const TRENDING_WINDOWS = [
  { value: 'day', label: 'Bugün' },
  { value: 'week', label: 'Bu hafta' },
];

const Home = () => {
  const { state } = useApp();
  const [trendWindow, setTrendWindow] = useState('day');
  const trendingDay = useTrending('day');
  const trending = useTrending(trendWindow);
  const popularMovies = useMediaList('movie', 'popular');
  const popularSeries = useMediaList('tv', 'popular');
  const nowPlaying = useMediaList('movie', 'now_playing');
  const topRatedMovies = useMediaList('movie', 'top_rated');
  const topRatedSeries = useMediaList('tv', 'top_rated');
  const upcoming = useMediaList('movie', 'upcoming');

  const heroItems = useMemo(
    () => (trendingDay.data?.results || [])
      .filter(item => item.backdrop_path && item.overview)
      .slice(0, HERO_COUNT),
    [trendingDay.data]
  );

  return (
    <>
      <Helmet>
        <title>SINEFIX - Film ve Dizi Platformu</title>
        <meta name="description" content="Popüler filmleri ve dizileri keşfedin, fragmanları izleyin, izleme listenizi oluşturun." />
      </Helmet>

      {trendingDay.isLoading ? (
        <HeroSkeleton />
      ) : trendingDay.isError ? (
        <div className="container-custom">
          <ErrorState description="TMDB'ye ulaşılamadı. Bağlantınızı kontrol edip tekrar deneyin." onRetry={trendingDay.refetch} />
        </div>
      ) : (
        <Hero items={heroItems} />
      )}

      <div className="pt-4 lg:pt-2">
        <ContinueWatchingRow />

        {state.watchLater.length > 0 && (
          <MediaRow title="İzleme listen" items={state.watchLater} link="/watch-later" showType />
        )}

        <MediaRow
          title="Trend olanlar"
          items={trending.data?.results}
          loading={trending.isLoading}
          showType
          actions={(
            <div className="segmented mr-1 hidden xs:inline-flex">
              {TRENDING_WINDOWS.map(w => (
                <button key={w.value} type="button" className={trendWindow === w.value ? 'active' : ''} onClick={() => setTrendWindow(w.value)}>
                  {w.label}
                </button>
              ))}
            </div>
          )}
        />

        <ShortsRow />

        <MediaRow title="Popüler filmler" items={popularMovies.data?.results} loading={popularMovies.isLoading} mediaType="movie" link="/movies" />
        <MediaRow title="Popüler diziler" items={popularSeries.data?.results} loading={popularSeries.isLoading} mediaType="tv" link="/series" />
        <MediaRow title="Vizyondakiler" items={nowPlaying.data?.results} loading={nowPlaying.isLoading} mediaType="movie" link="/movies?sort=now_playing" />
        <MediaRow title="En yüksek puanlı filmler" items={topRatedMovies.data?.results} loading={topRatedMovies.isLoading} mediaType="movie" link="/movies?sort=top_rated" />
        <MediaRow title="En yüksek puanlı diziler" items={topRatedSeries.data?.results} loading={topRatedSeries.isLoading} mediaType="tv" link="/series?sort=top_rated" />
        <MediaRow title="Yakında" items={upcoming.data?.results} loading={upcoming.isLoading} mediaType="movie" link="/movies?sort=upcoming" />
      </div>
    </>
  );
};

export default Home;
