import React, { useCallback, useEffect, useMemo, useRef, useState } from 'react';
import { Link, useNavigate } from 'react-router-dom';
import {
  FaPlay, FaStar, FaTimes, FaInfoCircle, FaPlus, FaCheck, FaFire, FaCalendarAlt, FaMagic, FaArrowRight,
  FaChevronLeft, FaChevronRight,
} from 'react-icons/fa';
import { getImageUrl } from '../services/tmdb';
import { websiteJsonLd } from '../lib/seo';
import Seo, { getSiteUrl } from '../components/Seo';
import { createShortSlug } from '../services/shorts';
import { useShortsPreview } from '../hooks/useShortsFeed';
import { useMediaList, useShowsAiring, useSlideDirection, useSwipe, useTrending } from '../hooks';
import { genreById } from '../lib/genres';
import { pop } from '../utils/dom';
import Segmented from '../components/UI/Segmented';
import { compareAiring, followedShowIds, pickAiringEpisode } from '../lib/airing';
import { useApp } from '../contexts';
import { useToast } from '../components/UI/Toast';
import MediaRow, { Row } from '../components/UI/MediaRow';
import { HeroSkeleton } from '../components/UI/Loading';
import { ErrorState } from '../components/UI/States';
import {
  getDetailPath, getMediaLabel, getMediaType, getReleaseDate, getTitle, getWatchPath, getYear, isGenericEpisodeName,
  relativeDay,
} from '../utils/helpers';

const HERO_COUNT = 6;
const HERO_INTERVAL = 9000;

// Öne çıkanlar: her slaytın altında dolan ilerleme çubuğu (CSS animasyonu bitince sonraki slayta
// geçilir; böylece duraklatma çubukla birebir eşleşir). Geçiş yönü tıklanan slayta göre sağdan/soldan,
// dokunmatikte kaydırma, klavyede ←/→. Fareyle üzerine gelince, odaktayken veya sekme gizliyken durur.
const Hero = ({ items }) => {
  const [slide, setSlide] = useState({ index: 0, previous: null, direction: 1 });
  const [hovered, setHovered] = useState(false);
  const [focused, setFocused] = useState(false);
  const [hidden, setHidden] = useState(() => typeof document !== 'undefined' && document.visibilityState === 'hidden');
  const heroRef = useRef(null);
  const { actions } = useApp();
  const { toast } = useToast();
  const { index, previous, direction } = slide;
  const item = items[index];
  const paused = hovered || focused || hidden;

  const goTo = useCallback((target, dir) => {
    setSlide(current => {
      const next = (target + items.length) % items.length;
      if (next === current.index) return current;
      return { index: next, previous: current.index, direction: dir ?? (next > current.index ? 1 : -1) };
    });
  }, [items.length]);

  const step = useCallback((delta) => {
    setSlide(current => {
      const next = (current.index + delta + items.length) % items.length;
      return { index: next, previous: current.index, direction: delta };
    });
  }, [items.length]);

  useSwipe(heroRef, step);

  useEffect(() => {
    const onVisibility = () => setHidden(document.visibilityState === 'hidden');
    document.addEventListener('visibilitychange', onVisibility);
    return () => document.removeEventListener('visibilitychange', onVisibility);
  }, []);

  // Sıradaki görseli önceden indir: geçişte boş kare görünmesin.
  useEffect(() => {
    const upcoming = items[(index + 1) % items.length];
    if (upcoming?.backdrop_path) new Image().src = getImageUrl(upcoming.backdrop_path, window.innerWidth > 900 ? 'w1280' : 'w780');
  }, [index, items]);

  if (!item) return null;

  const type = getMediaType(item);
  const title = getTitle(item);
  const year = getYear(getReleaseDate(item));
  const inList = actions.isWatchLater(item.id, type);
  const genres = (item.genre_ids || []).map(id => genreById(type, id)?.name).filter(Boolean).slice(0, 2);
  const dir = direction > 0 ? 'next' : 'prev';

  const toggleList = (event) => {
    pop(event.currentTarget);
    const added = actions.toggleWatchLater(item, type);
    toast.success(added ? 'İzleme listene eklendi' : 'İzleme listenden çıkarıldı', 2000);
  };

  const backdrop = (entry, className, eager) => (
    <img
      src={getImageUrl(entry.backdrop_path, 'w1280')}
      srcSet={`${getImageUrl(entry.backdrop_path, 'w780')} 780w, ${getImageUrl(entry.backdrop_path, 'w1280')} 1280w, ${getImageUrl(entry.backdrop_path, 'original')} 1920w`}
      sizes="100vw"
      alt=""
      className={className}
      fetchpriority={eager ? 'high' : 'auto'}
    />
  );

  return (
    <section
      ref={heroRef}
      className={`hero ${paused ? 'is-paused' : ''}`}
      onMouseEnter={() => setHovered(true)}
      onMouseLeave={() => setHovered(false)}
      // Yalnızca klavye odağı durdurur; fareyle tıklanan düğmede kalan odak slaytları dondurmasın.
      onFocus={(event) => setFocused(!!event.target.matches?.(':focus-visible'))}
      onBlur={(event) => { if (!event.currentTarget.contains(event.relatedTarget)) setFocused(false); }}
      onKeyDown={(event) => {
        if (event.key === 'ArrowRight') step(1);
        if (event.key === 'ArrowLeft') step(-1);
      }}
      aria-roledescription="carousel"
      aria-label="Öne çıkanlar"
    >
      <div className="hero-bg">
        {previous !== null && items[previous] && (
          <div className="hero-bg-layer is-leaving" key={`bg-${items[previous].id}`} aria-hidden="true">
            {backdrop(items[previous], '', false)}
          </div>
        )}
        <div
          className={`hero-bg-layer ${previous !== null ? `is-entering ${dir}` : ''}`}
          key={`bg-${item.id}`}
          onAnimationEnd={(event) => {
            if (event.target === event.currentTarget) setSlide(current => ({ ...current, previous: null }));
          }}
        >
          {backdrop(item, '', index === 0)}
        </div>
      </div>

      <div className="hero-content container-custom">
        <div className={`hero-inner ${previous !== null ? `slide-${dir}` : ''}`} key={`content-${item.id}`} aria-live="polite">
          <div className="meta-row">
            <span className="badge">{getMediaLabel(type)}</span>
            {year && <span>{year}</span>}
            {item.vote_average > 0 && (
              <span className="rating"><FaStar className="text-[11px]" /> {item.vote_average.toFixed(1)}</span>
            )}
            {genres.length > 0 && <span className="hidden sm:inline">{genres.join(' · ')}</span>}
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
        </div>

        {items.length > 1 && (
          <div className="hero-controls">
            <div className="hero-progress" role="group" aria-label="Öne çıkan içerik seç">
              {items.map((entry, i) => (
                <button
                  key={entry.id}
                  type="button"
                  aria-label={`${i + 1}. ${getTitle(entry)}`}
                  aria-current={i === index ? 'true' : undefined}
                  className={`hero-progress-item ${i < index ? 'done' : ''}`}
                  onClick={() => goTo(i)}
                >
                  {i === index && (
                    <span
                      key={`fill-${index}`}
                      className="hero-progress-fill"
                      style={{ animationDuration: `${HERO_INTERVAL}ms` }}
                      onAnimationEnd={() => step(1)}
                    />
                  )}
                </button>
              ))}
            </div>
            <div className="hero-arrows">
              <button type="button" className="icon-btn bordered" onClick={() => step(-1)} aria-label="Önceki">
                <FaChevronLeft />
              </button>
              <span className="hero-counter" aria-hidden="true">{index + 1} / {items.length}</span>
              <button type="button" className="icon-btn bordered" onClick={() => step(1)} aria-label="Sonraki">
                <FaChevronRight />
              </button>
            </div>
          </div>
        )}
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

// Kitaplıktaki dizilerin yeni ya da yaklaşan bölümleri. Bilgi yalnızca TMDB'den okunur;
// hiçbir yere kayıt veya bildirim gönderilmez.
const NewEpisodesRow = () => {
  const { state } = useApp();
  const ids = useMemo(() => followedShowIds(state), [state]);
  const results = useShowsAiring(ids);
  const now = new Date();
  // Hepsi gelmeden çizilmez: sıralı satıra tek tek kart eklemek kaydırma konumunu oynatıyordu.
  if (results.some(result => result.isLoading)) return null;
  const entries = results
    .map(result => result.data)
    .filter(Boolean)
    .map(show => ({ show, ...pickAiringEpisode(show, now) }))
    .filter(entry => entry.kind)
    .sort(compareAiring);

  if (!entries.length) return null;

  return (
    <Row title="Takip ettiklerinde yeni bölümler" icon={<FaCalendarAlt className="text-[0.8em] text-white/50" />}>
      {entries.map(({ show, kind, episode }) => {
        const aired = kind === 'aired';
        const image = episode.still_path ? getImageUrl(episode.still_path, 'w300') : show.backdrop_path && getImageUrl(show.backdrop_path, 'w780');
        const href = aired
          ? getWatchPath(show, 'tv', { season: episode.season_number, episode: episode.episode_number })
          : `${getDetailPath(show, 'tv')}?tab=episodes`;
        return (
          <div key={show.id} className="row-item wide">
            <Link to={href} className="cw-card">
              <div className="cw-thumb">
                {image && <img src={image} alt="" loading="lazy" />}
                <span className={`episode-badge ${aired ? 'new' : ''}`}>
                  {aired ? 'Yeni bölüm' : relativeDay(episode.air_date, now)}
                </span>
                <div className="cw-play">
                  {aired && <span className="cw-play-icon"><FaPlay /></span>}
                  <span className="min-w-0">
                    <span className="block truncate text-sm font-bold">{getTitle(show)}</span>
                    <span className="block truncate text-xs text-white/60">
                      S{episode.season_number} · B{episode.episode_number}
                      {isGenericEpisodeName(episode.name) ? '' : ` · ${episode.name}`}
                    </span>
                  </span>
                </div>
              </div>
            </Link>
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

const RecommendBanner = () => (
  <div className="container-custom mb-9 lg:mb-12">
    <Link to="/ne-izlesem" className="promo-card">
      <span className="promo-icon"><FaMagic /></span>
      <span className="min-w-0 flex-1">
        <span className="block text-[15px] font-bold">Ne izleyeceğine karar veremedin mi?</span>
        <span className="block text-sm text-white/55">Ruh haline, vaktine ve platformlarına göre birkaç saniyede öneri al.</span>
      </span>
      <FaArrowRight className="promo-arrow" />
    </Link>
  </div>
);

const TRENDING_WINDOWS = [
  { value: 'day', label: 'Bugün' },
  { value: 'week', label: 'Bu hafta' },
];

const Home = () => {
  const { state } = useApp();
  const [trendWindow, setTrendWindow] = useState('day');
  const trendingDay = useTrending('day');
  const trending = useTrending(trendWindow);
  const trendDirection = useSlideDirection(trendWindow, TRENDING_WINDOWS.map(w => w.value));
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
      <Seo path="/" jsonLd={[websiteJsonLd(getSiteUrl())]} />

      {trendingDay.isLoading ? (
        <HeroSkeleton />
      ) : trendingDay.isError ? (
        <div className="container-custom below-header">
          <ErrorState description="TMDB'ye ulaşılamadı. Bağlantınızı kontrol edip tekrar deneyin." onRetry={trendingDay.refetch} />
        </div>
      ) : (
        <Hero items={heroItems} />
      )}

      <div className="pt-4 lg:pt-2">
        <ContinueWatchingRow />
        <NewEpisodesRow />

        {state.watchLater.length > 0 && (
          <MediaRow title="İzleme listen" items={state.watchLater} link="/watch-later" showType />
        )}

        <MediaRow
          title="Trend olanlar"
          items={trending.data?.results}
          loading={trending.isLoading}
          showType
          contentKey={trendWindow}
          contentDirection={trendDirection}
          actions={(
            <Segmented
              ariaLabel="Trend dönemi"
              className="mr-1 hidden xs:inline-flex"
              options={TRENDING_WINDOWS}
              value={trendWindow}
              onChange={setTrendWindow}
            />
          )}
        />

        <ShortsRow />
        <RecommendBanner />

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
