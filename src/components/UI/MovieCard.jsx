import React, { memo, useState } from 'react';
import { Link, useNavigate } from 'react-router-dom';
import { FaStar, FaHeart, FaFilm, FaTv, FaPlay, FaPlus, FaCheck, FaEye } from 'react-icons/fa';
import { getImageUrl } from '../../services/tmdb';
import {
  daysUntil, getDetailPath, getMediaLabel, getMediaType, getReleaseDate, getTitle, getWatchPath, getYear, relativeDay,
} from '../../utils/helpers';
import { useApp } from '../../contexts';
import { useToast } from './Toast';
import { pop } from '../../utils/dom';

export const PosterImage = ({ path, alt, className = '', sizes = '(min-width: 1024px) 190px, (min-width: 640px) 25vw, 45vw' }) => {
  const [loaded, setLoaded] = useState(false);
  const [failed, setFailed] = useState(false);

  if (!path || failed) return null;

  return (
    <img
      src={getImageUrl(path, 'w342')}
      srcSet={`${getImageUrl(path, 'w185')} 185w, ${getImageUrl(path, 'w342')} 342w, ${getImageUrl(path, 'w500')} 500w`}
      sizes={sizes}
      alt={alt}
      loading="lazy"
      decoding="async"
      className={`mc-img ${loaded ? 'loaded' : ''} ${className}`}
      onLoad={() => setLoaded(true)}
      onError={() => setFailed(true)}
    />
  );
};

// Henüz çıkmamış yapımlarda puan yerine ne zaman çıkacağı gösterilir.
const releaseCountdown = (dateString) => {
  const days = daysUntil(dateString);
  if (days === null || days <= 0) return null;
  if (days <= 30) return days === 1 ? 'Yarın' : `${days} gün kaldı`;
  return relativeDay(dateString, new Date(), { weekday: false });
};

const MovieCard = ({ item, mediaType, showType = false, showActions = true }) => {
  const { actions } = useApp();
  const { toast } = useToast();
  const navigate = useNavigate();

  const type = getMediaType(item, mediaType);
  const title = getTitle(item);
  const year = getYear(getReleaseDate(item));
  const countdown = releaseCountdown(getReleaseDate(item));
  const rating = !countdown && item.vote_average > 0 ? item.vote_average.toFixed(1) : null;
  const isFavorite = actions.isFavorite(item.id, type);
  const inWatchLater = actions.isWatchLater(item.id, type);
  const watched = type === 'movie' && actions.isWatched(item.id, 'movie');

  const stop = (event) => {
    event.preventDefault();
    event.stopPropagation();
  };

  const onFavorite = (event) => {
    stop(event);
    pop(event.currentTarget);
    const added = actions.toggleFavorite(item, type);
    toast.success(added ? 'Favorilere eklendi' : 'Favorilerden çıkarıldı', 2000);
  };

  const onWatchLater = (event) => {
    stop(event);
    pop(event.currentTarget);
    const added = actions.toggleWatchLater(item, type);
    toast.success(added ? 'İzleme listene eklendi' : 'İzleme listenden çıkarıldı', 2000);
  };

  const onPlay = (event) => {
    stop(event);
    navigate(getWatchPath(item, type));
  };

  return (
    <Link to={getDetailPath(item, type)} className="mc" aria-label={`${title}${year ? ` (${year})` : ''}`}>
      <div className="mc-poster">
        <div className="mc-placeholder" aria-hidden="true">
          {type === 'tv' ? <FaTv /> : <FaFilm />}
          <span className="line-clamp-3">{title}</span>
        </div>
        <PosterImage path={item.poster_path} alt="" />
        <div className="mc-shade" />

        {showType && <span className="mc-type">{getMediaLabel(type)}</span>}
        {countdown && <span className="mc-soon">{countdown}</span>}
        {watched && <span className="mc-watched" title="İzledin"><FaEye /> İzledin</span>}

        <span className="mc-play" aria-hidden="true" onClick={onPlay}>
          <FaPlay />
        </span>

        {showActions && (
          <div className="mc-actions">
            <button
              type="button"
              onClick={onFavorite}
              className={`mc-action fav ${isFavorite ? 'on' : ''}`}
              aria-label={isFavorite ? 'Favorilerden çıkar' : 'Favorilere ekle'}
              aria-pressed={isFavorite}
            >
              <FaHeart />
            </button>
            <button
              type="button"
              onClick={onWatchLater}
              className={`mc-action ${inWatchLater ? 'on' : ''}`}
              aria-label={inWatchLater ? 'İzleme listesinden çıkar' : 'İzleme listesine ekle'}
              aria-pressed={inWatchLater}
            >
              {inWatchLater ? <FaCheck /> : <FaPlus />}
            </button>
          </div>
        )}
      </div>

      <div className="mc-info">
        <h3 className="mc-title line-clamp-1">{title}</h3>
        <div className="mc-meta">
          {year && <span>{year}</span>}
          {rating && (
            <span className="rating">
              <FaStar /> {rating}
            </span>
          )}
        </div>
      </div>
    </Link>
  );
};

export default memo(MovieCard);
