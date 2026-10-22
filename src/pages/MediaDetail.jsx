import React, { useMemo, useState } from 'react';
import { Link, useParams, useSearchParams } from 'react-router-dom';
import { Helmet } from 'react-helmet-async';
import {
  FaPlay, FaStar, FaHeart, FaShareAlt, FaPlus, FaCheck, FaYoutube, FaImdb, FaExternalLinkAlt, FaFilm, FaTv,
} from 'react-icons/fa';
import { getImageUrl } from '../services/tmdb';
import { useDetail, useImages, useReviews, useSeason } from '../hooks';
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
  formatCurrency, formatDate, formatNumber, formatRuntime, getCertification, getLanguageName,
  getMediaLabel, getStatusText, getTvCertification, getWatchPath, getYear, shareOrCopy, truncateText,
} from '../utils/helpers';

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
                  <Link to={`/person/${person.id}`} className="text-sm font-semibold hover:underline">{person.name}</Link>
                </div>
              ))}
            </div>
          )}
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

      <MediaRow title="Bunları da beğenebilirsin" items={recommendations} mediaType={mediaType} />
    </div>
  );
};

const EpisodesTab = ({ media, initialSeason }) => {
  const seasons = orderSeasons(media.seasons);
  const defaultSeason = seasons.some(s => s.season_number === initialSeason)
    ? initialSeason
    : seasons[0]?.season_number;
  const [season, setSeason] = useState(defaultSeason);
  const { data, isLoading, isError } = useSeason(media.id, season);

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
      {data?.overview && <p className="mb-4 text-sm leading-relaxed text-white/55">{data.overview}</p>}
      <EpisodeList
        episodes={data?.episodes}
        loading={isLoading}
        error={isError}
        getHref={(episode) => getWatchPath(media, 'tv', { season, episode: episode.episode_number })}
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
  const { id } = useParams();
  const [searchParams, setSearchParams] = useSearchParams();
  const { data: media, isLoading, isError, error, refetch } = useDetail(mediaType, id);
  const { actions } = useApp();
  const { toast } = useToast();
  const [trailerOpen, setTrailerOpen] = useState(false);

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

  const setTab = (tab) => {
    const next = new URLSearchParams(searchParams);
    if (tab === 'overview') next.delete('tab');
    else next.set('tab', tab);
    setSearchParams(next, { replace: true });
  };

  if (isLoading) return <DetailSkeleton />;

  if (isError || !media) {
    const notFound = error?.response?.status === 404;
    return (
      <div className="container-custom py-10">
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
  const date = media.release_date || media.first_air_date;
  const year = getYear(date);
  const runtime = formatRuntime(isTv ? media.episode_run_time?.[0] : media.runtime);
  const certification = isTv ? getTvCertification(media.content_ratings) : getCertification(media.release_dates);
  const trailer = pickTrailer(media.videos?.results);
  const isFavorite = actions.isFavorite(media.id, mediaType);
  const inWatchLater = actions.isWatchLater(media.id, mediaType);
  const progress = actions.getContinueWatching(media.id, mediaType);

  const firstSeason = orderSeasons(media.seasons)[0]?.season_number ?? 1;
  const watchTarget = isTv
    ? progress?.season
      ? { season: progress.season, episode: progress.episode }
      : { season: firstSeason, episode: 1 }
    : undefined;
  const watchLabel = isTv
    ? progress?.season ? `Devam et S${progress.season}·B${progress.episode}` : 'İlk bölümü izle'
    : 'İzle';

  const toggleFavorite = () => {
    const added = actions.toggleFavorite(media, mediaType);
    toast.success(added ? 'Favorilere eklendi' : 'Favorilerden çıkarıldı', 2000);
  };

  const toggleWatchLater = () => {
    const added = actions.toggleWatchLater(media, mediaType);
    toast.success(added ? 'İzleme listene eklendi' : 'İzleme listenden çıkarıldı', 2000);
  };

  const share = async () => {
    const result = await shareOrCopy({ title, text: truncateText(media.overview, 120), url: window.location.href });
    if (result === 'copied') toast.success('Bağlantı kopyalandı', 2000);
    if (result === 'failed') toast.error('Bağlantı paylaşılamadı');
  };

  return (
    <>
      <Helmet>
        <title>{`${title}${year ? ` (${year})` : ''} - SINEFIX`}</title>
        <meta name="description" content={truncateText(media.overview, 160)} />
        <meta property="og:title" content={title} />
        {media.backdrop_path && <meta property="og:image" content={getImageUrl(media.backdrop_path, 'w780')} />}
      </Helmet>

      <section className="detail-hero">
        {media.backdrop_path && (
          <div className="detail-backdrop">
            <img
              src={getImageUrl(media.backdrop_path, 'w1280')}
              srcSet={`${getImageUrl(media.backdrop_path, 'w780')} 780w, ${getImageUrl(media.backdrop_path, 'w1280')} 1280w, ${getImageUrl(media.backdrop_path, 'original')} 1920w`}
              sizes="100vw"
              alt=""
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
              {media.genres?.length > 0 && (
                <div className="mt-4 hidden flex-wrap gap-2 sm:flex">
                  {media.genres.map(genre => (
                    <Link key={genre.id} to={`${isTv ? '/series' : '/movies'}?genre=${genre.id}`} className="chip !h-7 !px-3 !text-xs">
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
                    <Link key={genre.id} to={`${isTv ? '/series' : '/movies'}?genre=${genre.id}`} className="chip !h-7 flex-shrink-0 !px-3 !text-xs">
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
                    className={`detail-action ${isFavorite ? 'active-red' : ''}`}
                    aria-label={isFavorite ? 'Favorilerden çıkar' : 'Favorilere ekle'}
                    aria-pressed={isFavorite}
                    title={isFavorite ? 'Favorilerinde' : 'Favorilere ekle'}
                  >
                    <FaHeart />
                    <span>Favori</span>
                  </button>
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

      <nav className="tabs" aria-label="İçerik bölümleri">
        <div className="container-custom">
          <div className="tabs-list -mx-[14px]" role="tablist">
            {tabs.map(tab => (
              <button
                key={tab.id}
                type="button"
                role="tab"
                aria-selected={activeTab === tab.id}
                className={`tab ${activeTab === tab.id ? 'active' : ''}`}
                onClick={() => setTab(tab.id)}
              >
                {tab.label}
              </button>
            ))}
          </div>
        </div>
      </nav>

      <div className="pb-6 pt-8" key={`${mediaType}-${media.id}-${activeTab}`}>
        {activeTab === 'overview' && <OverviewTab media={media} mediaType={mediaType} onShowCast={() => setTab('cast')} />}
        {activeTab === 'episodes' && <EpisodesTab media={media} initialSeason={progress?.season} />}
        {activeTab === 'cast' && <CastTab media={media} mediaType={mediaType} />}
        {activeTab === 'media' && <MediaTab media={media} mediaType={mediaType} />}
        {activeTab === 'reviews' && <ReviewsTab media={media} mediaType={mediaType} />}
      </div>

      {trailerOpen && <VideoModal video={trailer} onClose={() => setTrailerOpen(false)} />}
    </>
  );
};

export default MediaDetail;
