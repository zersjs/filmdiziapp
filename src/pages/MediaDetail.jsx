import React, { useEffect, useMemo, useRef, useState } from 'react';
import { Link, Navigate, useLocation, useParams, useSearchParams } from 'react-router-dom';
import {
  FaPlay, FaStar, FaHeart, FaShareAlt, FaPlus, FaCheck, FaYoutube, FaImdb, FaExternalLinkAlt, FaFilm, FaTv, FaEye,
} from 'react-icons/fa';
import { getImageUrl } from '../services/tmdb';
import { useCollection, useDetail, useImages, useReviews, useSeason } from '../hooks';
import { genreById, genrePath } from '../lib/genres';
import { nextUp, seasonProgress, showProgress, unwatchedBefore } from '../lib/episodes';
import { mediaSeo } from '../lib/seo';
import Seo, { getSiteUrl } from '../components/Seo';
import Breadcrumbs from '../components/UI/Breadcrumbs';
import WatchProviders from '../components/Detail/WatchProviders';
import { MovieEndTime, NextEpisode } from '../components/Detail/AiringInfo';
import { isTypingTarget, pop } from '../utils/dom';
import { useIndicator } from '../hooks/useIndicator';
import { useSlideDirection } from '../hooks/useSlideDirection';
import SlideTransition from '../components/UI/SlideTransition';
import { useApp } from '../contexts';
import { useToast } from '../components/UI/Toast';
import MediaRow, { Row } from '../components/UI/MediaRow';
import PersonCard from '../components/UI/PersonCard';
import VideoGallery from '../components/UI/VideoGallery';
import ImageGallery from '../components/UI/ImageGallery';
import Reviews from '../components/UI/Reviews';
import VideoModal, { pickTrailer } from '../components/UI/VideoModal';
import EpisodeList, { SeasonSelect, orderSeasons } from '../components/Detail/EpisodeList';
import { DetailSkeleton, Spinner } from '../components/UI/Loading';
import { EmptyState, ErrorState } from '../components/UI/States';
import {
  createSlug, formatCurrency, formatDate, formatNumber, formatRuntime, getCertification, getLanguageName,
  getMediaLabel, getPersonPath, getStatusText, getTvCertification, getWatchPath, getYear, isFutureDate,
  shareOrCopy, truncateText,
} from '../utils/helpers';

// Sekme çubuğu: seçili sekmenin arkasında kayan kutu, ok tuşlarıyla gezinme (WAI-ARIA sekme deseni).
// Detay görseli ekrandan çıkınca sol tarafta küçük afiş + başlık, sağda "İzle" düğmesi belirir.
const TAB_PILL_HEIGHT = 34;

const TabBar = ({ tabs, activeTab, onSelect, compact, info, barRef }) => {
  const [listRef, rect, animate] = useIndicator(`[data-tab="${activeTab}"]`);

  // Kaydırılabilir sekme listesinde seçili sekme görünür kalsın.
  useEffect(() => {
    const list = listRef.current;
    const tab = list?.querySelector(`[data-tab="${activeTab}"]`);
    if (!tab) return;
    const start = list.scrollLeft;
    const end = start + list.clientWidth;
    if (tab.offsetLeft < start || tab.offsetLeft + tab.offsetWidth > end) {
      list.scrollTo({ left: tab.offsetLeft - 16, behavior: 'smooth' });
    }
  }, [activeTab, listRef]);

  const onKeyDown = (event) => {
    const step = { ArrowRight: 1, ArrowLeft: -1 }[event.key];
    const index = tabs.findIndex(tab => tab.id === activeTab);
    let next = null;
    if (step) next = tabs[(index + step + tabs.length) % tabs.length];
    if (event.key === 'Home') next = tabs[0];
    if (event.key === 'End') next = tabs[tabs.length - 1];
    if (!next) return;
    event.preventDefault();
    onSelect(next.id);
    listRef.current?.querySelector(`[data-tab="${next.id}"]`)?.focus();
  };

  return (
    <nav ref={barRef} className={`tabs ${compact ? 'is-compact' : ''}`} aria-label="İçerik bölümleri">
      <div className="container-custom tabs-bar">
        <div className="tabs-compact" aria-hidden={!compact}>
          {info.poster && <img src={getImageUrl(info.poster, 'w92')} alt="" />}
          <span className="truncate">{info.title}</span>
        </div>
        <div ref={listRef} className="tabs-list" role="tablist" onKeyDown={onKeyDown}>
          <span
            className="tab-pill"
            aria-hidden="true"
            style={rect ? {
              width: rect.width,
              height: TAB_PILL_HEIGHT,
              transform: `translate3d(${rect.x}px, ${rect.y + (rect.height - TAB_PILL_HEIGHT) / 2}px, 0)`,
              transition: animate ? undefined : 'none',
              opacity: 1,
            } : { opacity: 0 }}
          />
          {tabs.map(tab => {
            const selected = activeTab === tab.id;
            return (
              <button
                key={tab.id}
                type="button"
                role="tab"
                id={`tab-${tab.id}`}
                aria-controls="tab-panel"
                aria-selected={selected}
                tabIndex={selected ? 0 : -1}
                data-tab={tab.id}
                className={`tab ${selected ? 'active' : ''}`}
                onClick={() => onSelect(tab.id)}
              >
                {tab.label}
                {tab.count > 0 && <span className="tab-count">{tab.count}</span>}
              </button>
            );
          })}
        </div>
        <Link to={info.watchHref} className="btn btn-primary btn-sm tabs-play" tabIndex={compact ? 0 : -1} aria-hidden={!compact}>
          <FaPlay className="text-[10px]" /> <span className="hidden sm:inline">{info.watchLabel}</span>
        </Link>
      </div>
    </nav>
  );
};

const Fact = ({ label, children }) => (children ? (
  <div className="fact">
    <dt>{label}</dt>
    <dd>{children}</dd>
  </div>
) : null);

const OverviewTab = ({ media, mediaType, onShowCast }) => {
  const isTv = mediaType === 'tv';
  const cast = (isTv ? media.aggregate_credits?.cast : media.credits?.cast) || [];
  const crew = media.credits?.crew || [];
  const directors = crew.filter(p => p.job === 'Director');
  const writers = crew.filter(p => ['Screenplay', 'Writer', 'Story', 'Novel'].includes(p.job))
    .filter((p, i, arr) => arr.findIndex(x => x.id === p.id) === i)
    .slice(0, 3);
  const creators = media.created_by || [];
  const recommendations = (media.recommendations?.results?.length ? media.recommendations.results : media.similar?.results) || [];
  const imdbId = media.imdb_id || media.external_ids?.imdb_id;

  const people = [
    ...directors.map(p => ({ ...p, role: 'Yönetmen' })),
    ...creators.map(p => ({ ...p, role: 'Yaratıcı' })),
    ...writers.map(p => ({ ...p, role: 'Senaryo' })),
  ];

  return (
    <div className="space-y-10">
      <div className="container-custom grid gap-10 lg:grid-cols-[minmax(0,1fr)_340px]">
        <div className="min-w-0">
          <h2 className="section-title mb-3">Özet</h2>
          <p className="max-w-3xl text-[15px] leading-relaxed text-white/75">
            {media.overview || 'Bu içerik için henüz özet eklenmemiş.'}
          </p>

          {people.length > 0 && (
            <div className="mt-6 flex flex-wrap gap-x-8 gap-y-3">
              {people.map(person => (
                <div key={`${person.role}-${person.id}`}>
                  <p className="text-xs text-white/40">{person.role}</p>
                  <Link to={getPersonPath(person)} className="text-sm font-semibold hover:underline">{person.name}</Link>
                </div>
              ))}
            </div>
          )}

          <div className="mt-8">
            <WatchProviders media={media} mediaType={mediaType} />
          </div>
        </div>

        <aside className="surface p-5">
          <h2 className="mb-4 text-sm font-bold text-white/80">Bilgiler</h2>
          <dl className="grid grid-cols-2 gap-4 lg:grid-cols-1">
            <Fact label="Orijinal adı">{media.original_title || media.original_name}</Fact>
            <Fact label="Durum">{getStatusText(media.status)}</Fact>
            <Fact label="Orijinal dil">{getLanguageName(media.original_language)}</Fact>
            {isTv ? (
              <>
                <Fact label="İlk yayın">{media.first_air_date && formatDate(media.first_air_date)}</Fact>
                <Fact label="Son yayın">{media.last_air_date && formatDate(media.last_air_date)}</Fact>
                <Fact label="Kanal">{media.networks?.map(n => n.name).join(', ')}</Fact>
              </>
            ) : (
              <>
                <Fact label="Vizyon tarihi">{media.release_date && formatDate(media.release_date)}</Fact>
                <Fact label="Bütçe">{formatCurrency(media.budget)}</Fact>
                <Fact label="Hasılat">{formatCurrency(media.revenue)}</Fact>
              </>
            )}
            <Fact label="Yapım">{media.production_companies?.slice(0, 3).map(c => c.name).join(', ')}</Fact>
            <Fact label="Ülke">{media.production_countries?.map(c => c.name).join(', ')}</Fact>
          </dl>
          {(imdbId || media.homepage) && (
            <div className="mt-5 flex flex-wrap gap-2 border-t border-white/[0.06] pt-4">
              {imdbId && (
                <a href={`https://www.imdb.com/title/${imdbId}`} target="_blank" rel="noopener noreferrer" className="btn btn-secondary btn-sm">
                  <FaImdb className="text-base text-[var(--star)]" /> IMDb
                </a>
              )}
              {media.homepage && (
                <a href={media.homepage} target="_blank" rel="noopener noreferrer" className="btn btn-secondary btn-sm">
                  <FaExternalLinkAlt className="text-[11px]" /> Resmi site
                </a>
              )}
            </div>
          )}
        </aside>
      </div>

      {cast.length > 0 && (
        <Row
          title="Oyuncular"
          actions={cast.length > 12 && (
            <button type="button" className="row-link" onClick={onShowCast}>Tümü</button>
          )}
        >
          {cast.slice(0, 15).map(person => (
            <div key={person.id} className="row-item !basis-[28%] xs:!basis-[22%] md:!basis-[150px]">
              <PersonCard person={person} />
            </div>
          ))}
        </Row>
      )}

      {media.belongs_to_collection && <CollectionRow collection={media.belongs_to_collection} currentId={media.id} />}

      <MediaRow title="Bunları da beğenebilirsin" items={recommendations} mediaType={mediaType} />
    </div>
  );
};

// Serinin tüm filmleri vizyon sırasıyla; bulunulan film işaretlenir.
const CollectionRow = ({ collection, currentId }) => {
  const { data, isLoading } = useCollection(collection.id);
  const parts = data?.parts || [];
  if (!isLoading && parts.length < 2) return null;
  const position = parts.findIndex(part => part.id === currentId);
  return (
    <MediaRow
      title={data?.name || collection.name}
      actions={position >= 0 && <span className="text-xs text-white/40">{position + 1}. film · {parts.length} film</span>}
      items={parts}
      mediaType="movie"
      loading={isLoading}
      currentId={currentId}
    />
  );
};

const EpisodesTab = ({ media, initialSeason }) => {
  const { actions } = useApp();
  const { toast } = useToast();
  const seasons = orderSeasons(media.seasons);
  const defaultSeason = seasons.some(s => s.season_number === initialSeason)
    ? initialSeason
    : seasons[0]?.season_number;
  const [season, setSeason] = useState(defaultSeason);
  const { data, isLoading, isError } = useSeason(media.id, season);
  const watched = actions.getWatchedEpisodes(media.id);
  const progress = seasonProgress(season, watched, media);
  const airedInSeason = (data?.episodes || [])
    .filter(e => e.air_date && !isFutureDate(e.air_date))
    .map(e => ({ season, episode: e.episode_number }));

  const toggleEpisode = (episode, event) => {
    pop(event?.currentTarget);
    const number = episode.episode_number;
    const nowWatched = actions.toggleEpisodeWatched(media, season, number);
    if (!nowWatched) {
      toast.info(`S${season}·B${number} izlenmedi olarak işaretlendi`, 2500);
      return;
    }
    // Atlanmış önceki bölümler varsa tek dokunuşla onları da işaretlemeyi öner.
    const earlier = unwatchedBefore(season, number, watched, media);
    toast.success(
      `S${season}·B${number} izlendi`,
      2500,
      earlier.length
        ? { label: `Önceki ${earlier.length} bölümü de işaretle`, onClick: () => actions.setEpisodesWatched(media, earlier, true) }
        : null
    );
  };

  const toggleSeason = () => {
    const mark = !progress.complete;
    actions.setEpisodesWatched(media, airedInSeason, mark);
    toast.success(mark ? `${season}. sezon izlendi olarak işaretlendi` : `${season}. sezonun işaretleri kaldırıldı`, 2500, {
      label: 'Geri al',
      onClick: () => actions.setEpisodesWatched(
        media,
        airedInSeason.filter(e => watched.has(`${e.season}x${e.episode}`) !== mark),
        !mark
      ),
    });
  };

  if (!seasons.length) {
    return <div className="container-custom"><EmptyState icon={FaTv} title="Bölüm bilgisi yok" /></div>;
  }

  const currentSeason = seasons.find(s => s.season_number === season);

  return (
    <div className="container-custom max-w-4xl">
      <div className="mb-4 flex flex-col gap-3 sm:flex-row sm:items-center sm:justify-between">
        <SeasonSelect seasons={seasons} value={season} onChange={setSeason} className="sm:w-64" />
        {currentSeason?.air_date && (
          <p className="text-sm text-white/40">{getYear(currentSeason.air_date)} · {currentSeason.episode_count} bölüm</p>
        )}
      </div>
      {progress.total > 0 && season > 0 && (
        <div className="mb-4 flex flex-wrap items-center gap-x-4 gap-y-2">
          <div className="progress-line min-w-[220px] flex-1">
            <div className="progress-bar" role="progressbar" aria-valuemin={0} aria-valuemax={progress.total} aria-valuenow={progress.watched} aria-label={`${season}. sezon izleme ilerlemesi`}>
              <span style={{ width: `${(progress.watched / progress.total) * 100}%` }} />
            </div>
            <span className="whitespace-nowrap">{progress.watched}/{progress.total} bölüm izlendi</span>
          </div>
          <button type="button" className="btn btn-ghost btn-sm" onClick={toggleSeason} disabled={!airedInSeason.length}>
            <FaCheck className="text-[10px]" /> {progress.complete ? 'İşaretleri kaldır' : 'Sezonu izlendi işaretle'}
          </button>
        </div>
      )}
      {data?.overview && <p className="mb-4 text-sm leading-relaxed text-white/55">{data.overview}</p>}
      <EpisodeList
        episodes={data?.episodes}
        loading={isLoading}
        error={isError}
        getHref={(episode) => getWatchPath(media, 'tv', { season, episode: episode.episode_number })}
        isWatched={(episode) => watched.has(`${season}x${episode.episode_number}`)}
        onToggleWatched={toggleEpisode}
      />
    </div>
  );
};

const CastTab = ({ media, mediaType }) => {
  const cast = (mediaType === 'tv' ? media.aggregate_credits?.cast : media.credits?.cast) || [];
  if (!cast.length) {
    return <div className="container-custom"><EmptyState title="Oyuncu bilgisi yok" /></div>;
  }
  return (
    <div className="container-custom">
      <div className="media-grid compact">
        {cast.slice(0, 60).map(person => (
          <PersonCard
            key={person.id}
            person={person}
            subtitle={mediaType === 'tv'
              ? [person.roles?.[0]?.character, person.total_episode_count && `${person.total_episode_count} bölüm`].filter(Boolean).join(' · ')
              : person.character}
          />
        ))}
      </div>
    </div>
  );
};

const MediaTab = ({ media, mediaType }) => {
  const { data: images, isLoading } = useImages(mediaType, media.id);
  const videos = media.videos?.results || [];
  const hasImages = images && (images.backdrops?.length || images.posters?.length || images.logos?.length);

  return (
    <div className="container-custom space-y-10">
      <VideoGallery videos={videos} />
      {isLoading ? (
        <div className="flex justify-center py-10"><Spinner /></div>
      ) : hasImages ? (
        <ImageGallery images={images} title={media.title || media.name} />
      ) : null}
      {!isLoading && !hasImages && !videos.length && (
        <EmptyState title="Medya bulunamadı" description="Bu içerik için video veya görsel yok." />
      )}
    </div>
  );
};

const ReviewsTab = ({ media, mediaType }) => {
  const { data, isLoading } = useReviews(mediaType, media.id);
  return (
    <div className="container-custom">
      {isLoading ? <div className="flex justify-center py-10"><Spinner /></div> : <Reviews reviews={data} />}
    </div>
  );
};

const MediaDetail = ({ mediaType }) => {
  const { id, slug } = useParams();
  const location = useLocation();
  const [searchParams, setSearchParams] = useSearchParams();
  const { data: media, isLoading, isError, error, refetch } = useDetail(mediaType, id);
  const { actions } = useApp();
  const { toast } = useToast();
  const [trailerOpen, setTrailerOpen] = useState(false);
  const shortcuts = useRef({});

  // t: fragman, l: izleme listesi, f: favori (bkz. "?" kısayol penceresi)
  useEffect(() => {
    const onKeyDown = (event) => {
      if (event.ctrlKey || event.metaKey || event.altKey || isTypingTarget(event.target)) return;
      if (document.querySelector('[aria-modal="true"]')) return;
      const handler = shortcuts.current[event.key];
      if (handler) {
        event.preventDefault();
        handler();
      }
    };
    document.addEventListener('keydown', onKeyDown);
    return () => document.removeEventListener('keydown', onKeyDown);
  }, []);

  const isTv = mediaType === 'tv';
  const tabs = useMemo(() => [
    { id: 'overview', label: 'Genel bakış' },
    ...(isTv ? [{ id: 'episodes', label: 'Bölümler' }] : []),
    { id: 'cast', label: 'Oyuncular' },
    { id: 'media', label: 'Medya' },
    { id: 'reviews', label: 'İncelemeler' },
  ], [isTv]);

  const requestedTab = searchParams.get('tab');
  const activeTab = tabs.some(t => t.id === requestedTab) ? requestedTab : 'overview';

  const direction = useSlideDirection(activeTab, tabs.map(t => t.id));
  const tabBarRef = useRef(null);
  const tabAnchorRef = useRef(null);
  const [heroEl, setHeroEl] = useState(null);
  const [compact, setCompact] = useState(false);

  // Detay görseli başlığın arkasına girince sekme çubuğu kompakt bilgiyi gösterir.
  useEffect(() => {
    if (!heroEl || typeof IntersectionObserver === 'undefined') return undefined;
    const observer = new IntersectionObserver(
      ([entry]) => setCompact(!entry.isIntersecting && entry.boundingClientRect.top < 0),
      { rootMargin: '-120px 0px 0px 0px' }
    );
    observer.observe(heroEl);
    return () => observer.disconnect();
  }, [heroEl]);

  const setTab = (tab) => {
    if (tab === activeTab) return;
    const next = new URLSearchParams(searchParams);
    if (tab === 'overview') next.delete('tab');
    else next.set('tab', tab);
    setSearchParams(next, { replace: true });
    // Sekme çubuğu yapışık durumdaysa yeni içerik baştan görünsün diye çubuğun hizasına çık.
    const bar = tabBarRef.current;
    const anchor = tabAnchorRef.current;
    if (bar && anchor) {
      const stickyTop = parseFloat(getComputedStyle(bar).top) || 0;
      const target = anchor.getBoundingClientRect().top + window.scrollY - stickyTop;
      if (window.scrollY > target + 1) {
        const reduce = window.matchMedia('(prefers-reduced-motion: reduce)').matches;
        window.scrollTo({ top: target, behavior: reduce ? 'auto' : 'smooth' });
      }
    }
  };

  const swipeTab = (step) => {
    const index = tabs.findIndex(t => t.id === activeTab);
    const next = tabs[index + step];
    if (next) setTab(next.id);
  };

  if (isLoading) return <DetailSkeleton />;

  if (isError || !media) {
    const notFound = error?.response?.status === 404;
    return (
      <div className="container-custom below-header py-10">
        {notFound ? (
          <EmptyState
            icon={isTv ? FaTv : FaFilm}
            title={`${getMediaLabel(mediaType)} bulunamadı`}
            description="Aradığınız içerik kaldırılmış ya da bağlantı hatalı olabilir."
          >
            <Link to={isTv ? '/series' : '/movies'} className="btn btn-secondary">{isTv ? 'Dizilere' : 'Filmlere'} göz at</Link>
          </EmptyState>
        ) : (
          <ErrorState onRetry={refetch} />
        )}
      </div>
    );
  }

  const title = media.title || media.name;
  // Eksik veya eski slug'lı adresler tek bir kalıcı adrese toplanır (çift içerik önlenir).
  const canonicalSlug = createSlug(title);
  if (slug !== canonicalSlug || String(media.id) !== id) {
    return <Navigate to={`/${mediaType}/${media.id}/${canonicalSlug}${location.search}`} replace />;
  }
  const seo = mediaSeo(mediaType, media, getSiteUrl());
  const date = media.release_date || media.first_air_date;
  const year = getYear(date);
  const runtime = formatRuntime(isTv ? media.episode_run_time?.[0] : media.runtime);
  const certification = isTv ? getTvCertification(media.content_ratings) : getCertification(media.release_dates);
  const trailer = pickTrailer(media.videos?.results);
  const isFavorite = actions.isFavorite(media.id, mediaType);
  const inWatchLater = actions.isWatchLater(media.id, mediaType);
  const progress = actions.getContinueWatching(media.id, mediaType);

  const isWatchedMovie = !isTv && actions.isWatched(media.id, 'movie');
  // Diziler: izlenen bölümler varsa sıradaki bölüm, yoksa kaldığın bölüm, o da yoksa ilk bölüm.
  const watchedEpisodes = isTv ? actions.getWatchedEpisodes(media.id) : null;
  const tracked = isTv && watchedEpisodes.size > 0;
  const upNext = tracked ? nextUp(media, watchedEpisodes) : null;
  const tvProgress = tracked ? showProgress(media, watchedEpisodes) : null;
  const firstSeason = orderSeasons(media.seasons)[0]?.season_number ?? 1;
  const watchTarget = !isTv
    ? undefined
    : upNext
      ? { season: upNext.season, episode: upNext.episode }
      : progress?.season && !tvProgress?.complete
        ? { season: progress.season, episode: progress.episode }
        : { season: firstSeason, episode: 1 };
  const castCount = ((isTv ? media.aggregate_credits?.cast : media.credits?.cast) || []).length;
  const watchLabel = !isTv
    ? 'İzle'
    : upNext
      ? `Sıradaki: S${upNext.season}·B${upNext.episode}`
      : tvProgress?.complete
        ? 'Baştan izle'
        : progress?.season ? `Devam et S${progress.season}·B${progress.episode}` : 'İlk bölümü izle';

  const genreLink = (genre) => {
    const known = genreById(mediaType, genre.id);
    return known ? genrePath(mediaType, known) : isTv ? '/series' : '/movies';
  };

  const toggleFavorite = (event) => {
    pop(event?.currentTarget || document.querySelector('[data-action="favorite"]'));
    const added = actions.toggleFavorite(media, mediaType);
    toast.success(added ? 'Favorilere eklendi' : 'Favorilerden çıkarıldı', 2000);
  };

  const toggleWatchLater = (event) => {
    pop(event?.currentTarget || document.querySelector('[data-action="watch-later"]'));
    const added = actions.toggleWatchLater(media, mediaType);
    toast.success(added ? 'İzleme listene eklendi' : 'İzleme listenden çıkarıldı', 2000);
  };

  const toggleWatched = (event) => {
    pop(event?.currentTarget || document.querySelector('[data-action="watched"]'));
    const added = actions.toggleWatched(media, 'movie');
    toast.success(added ? 'İzlediklerine eklendi' : 'İzlediklerinden çıkarıldı', 2500, added
      ? { label: 'Geri al', onClick: () => actions.removeWatched(media.id, 'movie') }
      : null);
  };

  shortcuts.current = {
    t: trailer ? () => setTrailerOpen(true) : undefined,
    l: toggleWatchLater,
    f: toggleFavorite,
    w: isTv ? undefined : toggleWatched,
  };

  const share = async () => {
    const result = await shareOrCopy({ title, text: truncateText(media.overview, 120), url: window.location.href });
    if (result === 'copied') toast.success('Bağlantı kopyalandı', 2000);
    if (result === 'failed') toast.error('Bağlantı paylaşılamadı');
  };

  return (
    <>
      <Seo
        title={seo.title}
        description={seo.description}
        path={seo.path}
        image={seo.image}
        imageAlt={seo.imageAlt}
        type={seo.ogType}
        jsonLd={seo.jsonLd}
      />

      <section className="detail-hero" ref={setHeroEl}>
        {media.backdrop_path && (
          <div className="detail-backdrop">
            <img
              src={getImageUrl(media.backdrop_path, 'w1280')}
              srcSet={`${getImageUrl(media.backdrop_path, 'w780')} 780w, ${getImageUrl(media.backdrop_path, 'w1280')} 1280w, ${getImageUrl(media.backdrop_path, 'original')} 1920w`}
              sizes="100vw"
              alt=""
              fetchpriority="high"
            />
          </div>
        )}

        <div className="container-custom">
          <div className="detail-hero-inner">
            <div className="detail-poster self-start sm:self-end">
              {media.poster_path ? (
                <img src={getImageUrl(media.poster_path, 'w500')} alt={title} />
              ) : (
                <div className="flex h-full items-center justify-center text-3xl text-white/15">{isTv ? <FaTv /> : <FaFilm />}</div>
              )}
            </div>

            <div className="min-w-0 self-end">
              <Breadcrumbs items={seo.breadcrumbs} hideCurrent className="detail-breadcrumbs mb-3 hidden sm:block" />
              <div className="mb-2 flex flex-wrap items-center gap-2">
                <span className="badge">{getMediaLabel(mediaType)}</span>
                {certification && <span className="badge border border-white/15 bg-transparent">{certification}</span>}
              </div>
              <h1 className="detail-title">{title}</h1>
              {media.tagline && <p className="detail-tagline">{media.tagline}</p>}
              <div className="meta-row mt-3">
                {media.vote_average > 0 && (
                  <span className="rating">
                    <FaStar className="text-[11px]" /> {media.vote_average.toFixed(1)}
                    <span className="font-normal text-white/40">({formatNumber(media.vote_count)})</span>
                  </span>
                )}
                {year && <span>{isTv && media.status === 'Ended' && media.last_air_date && getYear(media.last_air_date) !== year ? `${year}–${getYear(media.last_air_date)}` : year}</span>}
                {runtime && <span>{runtime}</span>}
                {isTv && media.number_of_seasons > 0 && (
                  <span>{media.number_of_seasons} sezon · {media.number_of_episodes} bölüm</span>
                )}
              </div>
              {tvProgress && (
                <div className="progress-line show-progress">
                  <div className="progress-bar" role="progressbar" aria-valuemin={0} aria-valuemax={tvProgress.total} aria-valuenow={tvProgress.watched} aria-label="Dizi izleme ilerlemesi">
                    <span style={{ width: `${tvProgress.percent}%` }} />
                  </div>
                  <span className="whitespace-nowrap">
                    {tvProgress.complete ? 'Tüm bölümleri izledin' : `${tvProgress.watched}/${tvProgress.total} bölüm · %${tvProgress.percent}`}
                  </span>
                </div>
              )}
              {isTv ? (
                <NextEpisode media={media} />
              ) : (
                !isFutureDate(media.release_date) && <MovieEndTime runtime={media.runtime} />
              )}
              {media.genres?.length > 0 && (
                <div className="mt-4 hidden flex-wrap gap-2 sm:flex">
                  {media.genres.map(genre => (
                    <Link key={genre.id} to={genreLink(genre)} className="chip !h-7 !px-3 !text-xs">
                      {genre.name}
                    </Link>
                  ))}
                </div>
              )}
            </div>

            <div className="detail-below">
              {media.genres?.length > 0 && (
                <div className="no-scrollbar -mx-[var(--gutter)] mb-4 flex gap-2 overflow-x-auto px-[var(--gutter)] sm:hidden">
                  {media.genres.map(genre => (
                    <Link key={genre.id} to={genreLink(genre)} className="chip !h-7 flex-shrink-0 !px-3 !text-xs">
                      {genre.name}
                    </Link>
                  ))}
                </div>
              )}
              <div className="detail-actions">
                <div className="detail-actions-main">
                  <Link to={getWatchPath(media, mediaType, watchTarget)} className="btn btn-primary btn-lg">
                    <FaPlay className="text-xs" /> <span className="truncate">{watchLabel}</span>
                  </Link>
                  {trailer && (
                    <button type="button" onClick={() => setTrailerOpen(true)} className="btn btn-secondary btn-lg">
                      <FaYoutube /> Fragman
                    </button>
                  )}
                </div>
                <div className="detail-actions-secondary">
                  <button
                    type="button"
                    onClick={toggleWatchLater}
                    data-action="watch-later"
                    className={`detail-action ${inWatchLater ? 'active' : ''}`}
                    aria-label={inWatchLater ? 'İzleme listesinden çıkar' : 'İzleme listesine ekle'}
                    aria-pressed={inWatchLater}
                    title={inWatchLater ? 'İzleme listende' : 'İzleme listesine ekle'}
                  >
                    {inWatchLater ? <FaCheck /> : <FaPlus />}
                    <span>Listem</span>
                  </button>
                  <button
                    type="button"
                    onClick={toggleFavorite}
                    data-action="favorite"
                    className={`detail-action ${isFavorite ? 'active-red' : ''}`}
                    aria-label={isFavorite ? 'Favorilerden çıkar' : 'Favorilere ekle'}
                    aria-pressed={isFavorite}
                    title={isFavorite ? 'Favorilerinde' : 'Favorilere ekle'}
                  >
                    <FaHeart />
                    <span>Favori</span>
                  </button>
                  {!isTv && (
                    <button
                      type="button"
                      onClick={toggleWatched}
                      data-action="watched"
                      className={`detail-action ${isWatchedMovie ? 'active' : ''}`}
                      aria-label={isWatchedMovie ? 'İzledim işaretini kaldır' : 'İzledim olarak işaretle'}
                      aria-pressed={isWatchedMovie}
                      title={isWatchedMovie ? 'İzledin' : 'İzledim olarak işaretle (W)'}
                    >
                      <FaEye />
                      <span>{isWatchedMovie ? 'İzledin' : 'İzledim'}</span>
                    </button>
                  )}
                  <button type="button" onClick={share} className="detail-action" aria-label="Paylaş" title="Paylaş">
                    <FaShareAlt />
                    <span>Paylaş</span>
                  </button>
                </div>
              </div>
            </div>
          </div>
        </div>
      </section>

      <div ref={tabAnchorRef} aria-hidden="true" />
      <TabBar
        barRef={tabBarRef}
        tabs={tabs.map(tab => ({
          ...tab,
          count: tab.id === 'episodes' ? media.number_of_episodes : tab.id === 'cast' ? castCount : undefined,
        }))}
        activeTab={activeTab}
        onSelect={setTab}
        compact={compact}
        info={{ title, poster: media.poster_path, watchHref: getWatchPath(media, mediaType, watchTarget), watchLabel }}
      />

      <div id="tab-panel" role="tabpanel" aria-labelledby={`tab-${activeTab}`} className="pb-6 pt-8">
        <SlideTransition key={`${mediaType}-${media.id}`} id={activeTab} direction={direction} onSwipe={swipeTab}>
          {activeTab === 'overview' && <OverviewTab media={media} mediaType={mediaType} onShowCast={() => setTab('cast')} />}
          {activeTab === 'episodes' && <EpisodesTab media={media} initialSeason={progress?.season} />}
          {activeTab === 'cast' && <CastTab media={media} mediaType={mediaType} />}
          {activeTab === 'media' && <MediaTab media={media} mediaType={mediaType} />}
          {activeTab === 'reviews' && <ReviewsTab media={media} mediaType={mediaType} />}
        </SlideTransition>
      </div>

      {trailerOpen && <VideoModal video={trailer} onClose={() => setTrailerOpen(false)} />}
    </>
  );
};

export default MediaDetail;
