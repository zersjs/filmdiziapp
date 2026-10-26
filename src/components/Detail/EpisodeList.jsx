import React from 'react';
import { Link } from 'react-router-dom';
import { FaTv, FaStar, FaCheck } from 'react-icons/fa';
import { getImageUrl } from '../../services/tmdb';
import { formatDate, formatRuntime, isFutureDate } from '../../utils/helpers';
import { Spinner } from '../UI/Loading';

// Özel bölümler (0. sezon) listenin sonuna alınır.
export const orderSeasons = (seasons = []) => {
  const regular = seasons.filter(s => s.season_number > 0);
  const specials = seasons.filter(s => s.season_number === 0);
  return [...regular, ...specials];
};

export const getSeasonLabel = (season) =>
  season.season_number === 0 ? 'Özel bölümler' : `${season.season_number}. Sezon`;

export const SeasonSelect = ({ seasons, value, onChange, className = '' }) => (
  <select
    className={`select ${className}`}
    value={value}
    onChange={(event) => onChange(Number(event.target.value))}
    aria-label="Sezon seç"
  >
    {orderSeasons(seasons).map(season => (
      <option key={season.id ?? season.season_number} value={season.season_number}>
        {getSeasonLabel(season)}{season.episode_count ? ` · ${season.episode_count} bölüm` : ''}
      </option>
    ))}
  </select>
);

// isWatched / onToggleWatched verilirse her yayınlanmış bölümün yanında "izlendi" düğmesi çıkar.
const EpisodeList = ({
  episodes, loading, error, getHref, current, dense = false, replace = false, isWatched, onToggleWatched,
}) => {
  if (loading) {
    return (
      <div className="flex justify-center py-12">
        <Spinner />
      </div>
    );
  }

  if (error) {
    return <p className="py-8 text-center text-sm text-white/45">Bölümler yüklenemedi.</p>;
  }

  if (!episodes?.length) {
    return <p className="py-8 text-center text-sm text-white/45">Bu sezon için bölüm bilgisi yok.</p>;
  }

  return (
    <ol className={dense ? 'space-y-1' : 'space-y-2'}>
      {episodes.map(episode => {
        const upcoming = !episode.air_date || isFutureDate(episode.air_date);
        const isCurrent = current === episode.episode_number;
        const watched = !upcoming && !!isWatched?.(episode);
        const trackable = !upcoming && !!onToggleWatched;
        const runtime = formatRuntime(episode.runtime);
        const content = (
          <>
            <div className="episode-thumb">
              {episode.still_path ? (
                <img src={getImageUrl(episode.still_path, dense ? 'w185' : 'w300')} alt="" loading="lazy" />
              ) : (
                <div className="flex h-full items-center justify-center text-white/15"><FaTv /></div>
              )}
              <span className="episode-num">B{episode.episode_number}</span>
              {watched && <span className="episode-watched-mark" aria-hidden="true"><FaCheck /> İzlendi</span>}
            </div>
            <div className="min-w-0 self-center">
              <p className={`font-semibold text-white/90 ${dense ? 'line-clamp-2 text-[13px] leading-snug' : 'line-clamp-1 text-sm sm:text-[15px]'}`}>
                {episode.name}
              </p>
              <p className="mt-1 flex flex-wrap items-center gap-x-2 text-xs text-white/40">
                {upcoming ? (
                  <span className="font-semibold text-white/60">{episode.air_date ? `Yakında · ${formatDate(episode.air_date)}` : 'Yakında'}</span>
                ) : (
                  <>
                    {!dense && episode.air_date && <span>{formatDate(episode.air_date)}</span>}
                    {runtime && <span>{runtime}</span>}
                    {episode.vote_average > 0 && (
                      <span className="inline-flex items-center gap-1 text-[var(--star)]">
                        <FaStar className="text-[9px]" /> {episode.vote_average.toFixed(1)}
                      </span>
                    )}
                  </>
                )}
              </p>
              {!dense && episode.overview && (
                <p className="mt-1.5 hidden text-[13px] leading-relaxed text-white/50 xs:line-clamp-2">{episode.overview}</p>
              )}
            </div>
          </>
        );

        const className = [
          'episode', dense && 'dense', isCurrent && 'current', upcoming && 'disabled', watched && 'watched', trackable && 'trackable',
        ].filter(Boolean).join(' ');
        return (
          <li key={episode.id ?? episode.episode_number} className="episode-row">
            {upcoming ? (
              <div className={className} aria-disabled="true">{content}</div>
            ) : (
              <Link to={getHref(episode)} replace={replace} className={className} aria-current={isCurrent ? 'true' : undefined}>
                {content}
              </Link>
            )}
            {trackable && (
              <button
                type="button"
                className={`episode-check ${watched ? 'on' : ''}`}
                aria-pressed={watched}
                aria-label={`${episode.episode_number}. bölüm ${watched ? 'izlendi işaretini kaldır' : 'izlendi olarak işaretle'}`}
                title={watched ? 'İzlendi' : 'İzlendi olarak işaretle'}
                onClick={(event) => onToggleWatched(episode, event)}
              >
                <FaCheck />
              </button>
            )}
          </li>
        );
      })}
    </ol>
  );
};

export default EpisodeList;
