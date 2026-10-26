import React, { useEffect, useMemo, useRef, useState } from 'react';
import { Link, useNavigate, useParams, useSearchParams } from 'react-router-dom';
import { FaArrowLeft, FaChevronLeft, FaChevronRight, FaStar, FaInfoCircle, FaCheck, FaEye } from 'react-icons/fa';
import { getImageUrl } from '../services/tmdb';
import { playerService } from '../services/player';
import { useDetail, useSeason } from '../hooks';
import { useApp } from '../contexts';
import Seo from '../components/Seo';
import Segmented from '../components/UI/Segmented';
import EpisodeList, { SeasonSelect, orderSeasons } from '../components/Detail/EpisodeList';
import { Spinner } from '../components/UI/Loading';
import { EmptyState, ErrorState } from '../components/UI/States';
import { useToast } from '../components/UI/Toast';
import { pop } from '../utils/dom';
import {
  formatDate, formatRuntime, getDetailPath, getMediaLabel, getReleaseDate, getTitle, getWatchPath, getYear, isFutureDate,
} from '../utils/helpers';

const PROVIDERS = ['vidsrc', 'vidfast'];
const PROVIDER_KEY = 'preferredPlayerSource';

const readPreferredProvider = () => {
  try {
    return window.localStorage.getItem(PROVIDER_KEY);
  } catch {
    return null;
  }
};

const isReleased = (season) => season && season.air_date && !isFutureDate(season.air_date);

// Bir önceki/sonraki bölümü sezon sınırlarını aşarak bul.
export const getAdjacentEpisode = (seasons, season, episode, episodeCount, direction) => {
  const ordered = seasons.filter(s => s.season_number > 0);
  const index = ordered.findIndex(s => s.season_number === season);
  if (direction > 0) {
    if (episode < episodeCount) return { season, episode: episode + 1 };
    const next = ordered[index + 1];
    return next && isReleased(next) ? { season: next.season_number, episode: 1 } : null;
  }
  if (episode > 1) return { season, episode: episode - 1 };
  const prev = ordered[index - 1];
  return prev && prev.episode_count ? { season: prev.season_number, episode: prev.episode_count } : null;
};

const Watch = () => {
  const { type, id } = useParams();
  const [searchParams] = useSearchParams();
  const navigate = useNavigate();
  const isTv = type === 'tv';
  const { data: media, isLoading, isError, error, refetch } = useDetail(type, id);
  const { actions } = useApp();
  const { toast } = useToast();
  const addContinueWatching = useRef(actions.addContinueWatching);
  addContinueWatching.current = actions.addContinueWatching;

  const seasons = useMemo(() => orderSeasons(media?.seasons), [media]);
  const defaultSeason = seasons.find(s => s.season_number > 0)?.season_number ?? seasons[0]?.season_number ?? 1;
  const season = Number(searchParams.get('season')) || defaultSeason;
  const episode = Number(searchParams.get('episode')) || 1;
  const seasonQuery = useSeason(isTv && media ? id : null, season);
  const episodes = seasonQuery.data?.episodes || [];
  const currentEpisode = episodes.find(e => e.episode_number === episode);

  const sources = useMemo(
    () => (isTv ? playerService.getTvUrl(id, season, episode, PROVIDERS) : playerService.getMovieUrl(id, PROVIDERS)),
    [isTv, id, season, episode]
  );
  const [provider, setProvider] = useState(() => {
    const saved = readPreferredProvider();
    return PROVIDERS.includes(saved) ? saved : PROVIDERS[0];
  });
  const source = sources.find(s => s.provider === provider) || sources[0];

  const chooseProvider = (value) => {
    setProvider(value);
    try {
      window.localStorage.setItem(PROVIDER_KEY, value);
    } catch {
      // tercih kaydedilemezse sorun değil
    }
  };

  // Bölüm değişince (özellikle mobilde liste oynatıcının altındayken) oynatıcıya dön.
  const firstRender = useRef(true);
  useEffect(() => {
    if (firstRender.current) {
      firstRender.current = false;
      return;
    }
    window.scrollTo({ top: 0, behavior: 'smooth' });
  }, [season, episode]);

  // "İzlemeye devam et" listesini güncelle
  useEffect(() => {
    if (!media) return;
    addContinueWatching.current(media, type, isTv ? { season, episode, episodeName: currentEpisode?.name } : {});
  }, [media, type, isTv, season, episode, currentEpisode?.name]);

  if (isLoading) {
    return <div className="flex min-h-[60vh] items-center justify-center"><Spinner /></div>;
  }

  if (isError || !media) {
    return (
      <div className="container-custom py-10">
        {error?.response?.status === 404 ? (
          <EmptyState title="İçerik bulunamadı" description="Bağlantı hatalı olabilir.">
            <Link to="/" className="btn btn-secondary">Ana sayfaya dön</Link>
          </EmptyState>
        ) : (
          <ErrorState onRetry={refetch} />
        )}
      </div>
    );
  }

  const title = getTitle(media);
  const episodeCount = seasons.find(s => s.season_number === season)?.episode_count || episodes.length;
  const prev = isTv ? getAdjacentEpisode(seasons, season, episode, episodeCount, -1) : null;
  const next = isTv ? getAdjacentEpisode(seasons, season, episode, episodeCount, 1) : null;
  const related = (media.recommendations?.results?.length ? media.recommendations.results : media.similar?.results || []).slice(0, 8);
  const subtitle = isTv
    ? `${season}. Sezon · ${episode}. Bölüm${currentEpisode?.name ? ` · ${currentEpisode.name}` : ''}`
    : [getYear(media.release_date), formatRuntime(media.runtime)].filter(Boolean).join(' · ');
  const overview = (isTv && currentEpisode?.overview) || media.overview;
  const watchedNow = isTv ? actions.isEpisodeWatched(media.id, season, episode) : actions.isWatched(media.id, 'movie');
  const watchedEpisodes = isTv ? actions.getWatchedEpisodes(media.id) : null;

  const toggleWatchedNow = (event) => {
    pop(event.currentTarget);
    if (isTv) {
      const marked = actions.toggleEpisodeWatched(media, season, episode);
      toast.success(marked ? `S${season}·B${episode} izlendi` : 'İzlendi işareti kaldırıldı', 2000);
    } else {
      const marked = actions.toggleWatched(media, 'movie');
      toast.success(marked ? 'İzlediklerine eklendi' : 'İzlediklerinden çıkarıldı', 2000);
    }
  };

  // "Sonraki bölüm"e geçmek, bu bölümün izlendiği anlamına gelir.
  const markCurrentAndContinue = () => {
    if (!actions.isEpisodeWatched(media.id, season, episode)) {
      actions.setEpisodesWatched(media, [{ season, episode }], true);
      toast.success(`S${season}·B${episode} izlendi olarak işaretlendi`, 2500, {
        label: 'Geri al',
        onClick: () => actions.setEpisodesWatched(media, [{ season, episode }], false),
      });
    }
  };

  return (
    <>
      <Seo title={`${title}${isTv ? ` S${season} B${episode}` : ''} izle`} noindex />

      <div className="container-custom flex items-center gap-3 py-3 lg:py-5">
        <Link to={getDetailPath(media, type)} className="icon-btn bordered flex-shrink-0" aria-label={`${title} detayına dön`}>
          <FaArrowLeft className="text-sm" />
        </Link>
        <div className="min-w-0">
          <h1 className="truncate text-base font-bold sm:text-lg lg:text-xl">{title}</h1>
          {subtitle && <p className="truncate text-xs text-white/45 sm:text-sm">{subtitle}</p>}
        </div>
      </div>

      <div className="mx-auto grid max-w-[var(--container)] gap-6 sm:px-[var(--gutter)] lg:grid-cols-[minmax(0,1fr)_360px] lg:gap-8">
        <div className="min-w-0">
          <div className="player-frame">
            {source ? (
              <iframe
                key={source.url}
                src={source.url}
                title={`${title} oynatıcı`}
                referrerPolicy="origin"
                allow="autoplay; encrypted-media; fullscreen; picture-in-picture"
              />
            ) : (
              <div className="flex h-full items-center justify-center text-sm text-white/50">Kaynak bulunamadı</div>
            )}
          </div>

          <div className="mt-4 space-y-5 px-[var(--gutter)] sm:px-0">
            <div className="flex flex-col gap-3 sm:flex-row sm:items-center sm:justify-between">
              <div className="flex items-center gap-3">
                <span className="text-xs font-semibold text-white/40">Kaynak</span>
                <Segmented
                  ariaLabel="Oynatıcı kaynağı"
                  options={sources.map((s, i) => ({ value: s.provider, label: `${i + 1}. ${s.name}` }))}
                  value={source?.provider}
                  onChange={chooseProvider}
                />
              </div>

              {isTv && (
                <div className="flex gap-2">
                  <Link
                    to={prev ? getWatchPath(media, 'tv', prev) : '#'}
                    className={`btn btn-secondary btn-sm flex-1 sm:flex-none ${prev ? '' : 'pointer-events-none opacity-40'}`}
                    aria-disabled={!prev}
                    replace
                  >
                    <FaChevronLeft className="text-[10px]" /> Önceki
                  </Link>
                  <Link
                    to={next ? getWatchPath(media, 'tv', next) : '#'}
                    className={`btn btn-primary btn-sm flex-1 sm:flex-none ${next ? '' : 'pointer-events-none opacity-40'}`}
                    aria-disabled={!next}
                    onClick={() => next && markCurrentAndContinue()}
                    replace
                  >
                    Sonraki bölüm <FaChevronRight className="text-[10px]" />
                  </Link>
                </div>
              )}
            </div>

            <p className="flex items-start gap-2 text-xs leading-relaxed text-white/40">
              <FaInfoCircle className="mt-0.5 flex-shrink-0" />
              Oynatıcı üçüncü taraf bir kaynaktan yüklenir. Video açılmazsa diğer kaynağı deneyin.
            </p>

            <section className="surface p-4 sm:p-5">
              <div className="flex gap-4">
                {isTv && currentEpisode?.still_path && (
                  <img
                    src={getImageUrl(currentEpisode.still_path, 'w300')}
                    alt=""
                    className="hidden aspect-video w-40 flex-shrink-0 rounded-lg object-cover sm:block"
                  />
                )}
                <div className="min-w-0 flex-1">
                  <div className="flex items-start justify-between gap-3">
                    <h2 className="font-bold">
                      {isTv ? currentEpisode?.name || `${episode}. Bölüm` : title}
                    </h2>
                    <button
                      type="button"
                      onClick={toggleWatchedNow}
                      className={`btn btn-sm flex-shrink-0 ${watchedNow ? 'btn-primary' : 'btn-secondary'}`}
                      aria-pressed={watchedNow}
                    >
                      {watchedNow ? <FaCheck className="text-[10px]" /> : <FaEye className="text-xs" />}
                      {watchedNow ? 'İzlendi' : 'İzledim'}
                    </button>
                  </div>
                  <div className="meta-row mt-1">
                    {(isTv ? currentEpisode?.vote_average : media.vote_average) > 0 && (
                      <span className="rating">
                        <FaStar className="text-[10px]" /> {(isTv ? currentEpisode.vote_average : media.vote_average).toFixed(1)}
                      </span>
                    )}
                    {isTv && currentEpisode?.air_date && <span>{formatDate(currentEpisode.air_date)}</span>}
                    {isTv && formatRuntime(currentEpisode?.runtime) && <span>{formatRuntime(currentEpisode.runtime)}</span>}
                    {media.genres?.slice(0, 3).map(g => <span key={g.id}>{g.name}</span>)}
                  </div>
                  {overview && <p className="mt-3 text-sm leading-relaxed text-white/65">{overview}</p>}
                </div>
              </div>
            </section>
          </div>
        </div>

        <aside className="min-w-0 space-y-6 px-[var(--gutter)] pb-4 sm:px-0">
          {isTv && seasons.length > 0 && (
            <section className="surface p-3 sm:p-4 lg:sticky lg:top-[calc(var(--sticky-top)+24px)]">
              <div className="mb-3 flex items-center justify-between gap-3">
                <h2 className="text-sm font-bold">Bölümler</h2>
                <SeasonSelect
                  seasons={seasons}
                  value={season}
                  onChange={(value) => navigate(getWatchPath(media, 'tv', { season: value, episode: 1 }), { replace: true })}
                  className="!h-9 max-w-[200px] !text-[13px]"
                />
              </div>
              <div className="no-scrollbar max-h-[420px] overflow-y-auto lg:max-h-[calc(100dvh-160px)]">
                <EpisodeList
                  dense
                  replace
                  episodes={episodes}
                  loading={seasonQuery.isLoading}
                  error={seasonQuery.isError}
                  current={episode}
                  getHref={(ep) => getWatchPath(media, 'tv', { season, episode: ep.episode_number })}
                  isWatched={(ep) => watchedEpisodes.has(`${season}x${ep.episode_number}`)}
                  onToggleWatched={(ep, event) => {
                    pop(event?.currentTarget);
                    actions.toggleEpisodeWatched(media, season, ep.episode_number);
                  }}
                />
              </div>
            </section>
          )}

          {related.length > 0 && (
            <section>
              <h2 className="mb-3 text-sm font-bold">Benzer içerikler</h2>
              <ul className="grid grid-cols-1 gap-1 xs:grid-cols-2 lg:grid-cols-1">
                {related.map(item => {
                  const itemType = item.media_type || type;
                  return (
                    <li key={item.id}>
                      <Link to={getDetailPath(item, itemType)} className="flex items-center gap-3 rounded-lg p-2 hover:bg-white/[0.04]">
                        <span className="h-[72px] w-12 flex-shrink-0 overflow-hidden rounded-md bg-white/5">
                          {item.poster_path && <img src={getImageUrl(item.poster_path, 'w92')} alt="" loading="lazy" className="h-full w-full object-cover" />}
                        </span>
                        <span className="min-w-0">
                          <span className="line-clamp-2 text-sm font-semibold">{getTitle(item)}</span>
                          <span className="mt-0.5 block text-xs text-white/40">
                            {getMediaLabel(itemType)}{getYear(getReleaseDate(item)) ? ` · ${getYear(getReleaseDate(item))}` : ''}
                          </span>
                        </span>
                      </Link>
                    </li>
                  );
                })}
              </ul>
            </section>
          )}
        </aside>
      </div>
    </>
  );
};

export default Watch;
