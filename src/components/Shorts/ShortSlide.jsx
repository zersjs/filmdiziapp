import React, { memo, useEffect, useRef, useState } from 'react';
import { Link } from 'react-router-dom';
import {
  FaHeart, FaBookmark, FaRegBookmark, FaShare, FaVolumeUp, FaVolumeMute, FaPlay, FaFilm, FaTv, FaStar,
  FaExclamationTriangle, FaYoutube, FaInfoCircle,
} from 'react-icons/fa';
import ShortPlayer from './ShortPlayer';
import { getImageUrl } from '../../services/tmdb';
import { getTrailerLabel } from '../../services/shorts';
import { youtubeThumbnail, youtubeWatchUrl } from '../../services/youtube';
import { getDetailPath, getMediaLabel, getReleaseDate, getTitle, getWatchPath, getYear } from '../../utils/helpers';
import { Spinner } from '../UI/Loading';

const DOUBLE_TAP_MS = 280;
const TAP_SLOP_PX = 12;
// Çoğu fragman stüdyo logolarıyla başlar; birkaç saniyeyi atla.
const START_AT = { Trailer: 4, Teaser: 2 };

const Thumbnail = ({ item, hidden }) => {
  const [stage, setStage] = useState(0);
  const sources = [
    youtubeThumbnail(item.trailer.key, 'maxresdefault'),
    youtubeThumbnail(item.trailer.key, 'hqdefault'),
    item.backdrop_path ? getImageUrl(item.backdrop_path, 'w780') : null,
  ].filter(Boolean);
  if (stage >= sources.length) return null;
  return (
    <img
      src={sources[stage]}
      alt=""
      className={`short-thumb ${hidden ? 'hidden' : ''}`}
      onError={() => setStage(s => s + 1)}
      onLoad={(event) => {
        // YouTube olmayan maxres için 120x90 gri yer tutucu döndürür
        if (stage === 0 && event.currentTarget.naturalWidth <= 120) setStage(1);
      }}
      decoding="async"
    />
  );
};

const ActionButton = ({ icon, label, active, activeClass = 'active', onClick, pressed }) => (
  <button
    type="button"
    className={`short-action ${active ? activeClass : ''}`}
    onClick={onClick}
    aria-label={label}
    aria-pressed={pressed}
  >
    <span className="short-action-icon">{icon}</span>
    <span className="short-action-label">{label}</span>
  </button>
);

const ShortSlide = ({
  item,
  index,
  playerMode,
  showMedia,
  isActive,
  muted,
  fill,
  userPaused,
  needsStart,
  genreMap,
  isFavorite,
  inWatchLater,
  onTogglePause,
  onToggleMute,
  onLike,
  onToggleFavorite,
  onToggleWatchLater,
  onShare,
  onEnded,
  onUnplayable,
  onAutoplayBlocked,
}) => {
  const [status, setStatus] = useState('idle');
  const [hasPlayed, setHasPlayed] = useState(false);
  const [unplayable, setUnplayable] = useState(null);
  const [bursts, setBursts] = useState([]);
  const [expanded, setExpanded] = useState(false);
  const progressRef = useRef(null);
  const playerRef = useRef(null);
  const tap = useRef({ x: 0, y: 0, at: 0, last: 0, timer: null });

  const title = getTitle(item);
  const year = getYear(getReleaseDate(item));
  const type = item.media_type;
  const trailerLabel = getTrailerLabel(item.trailer);
  const backdrop = item.backdrop_path || item.poster_path;
  const genreNames = (item.genre_ids || []).map(id => genreMap.get(id)).filter(Boolean);

  useEffect(() => () => clearTimeout(tap.current.timer), []);

  useEffect(() => {
    if (!isActive) setExpanded(false);
  }, [isActive]);

  // Oynatıcı kaldırıldıysa (sahne uzaklaştı) tekrar yaklaşınca küçük resimle başla
  useEffect(() => {
    if (!playerMode) {
      setHasPlayed(false);
      setStatus('idle');
    }
  }, [playerMode]);

  const handleStatus = (next) => {
    setStatus(next);
    if (next === 'playing') setHasPlayed(true);
  };

  const onPointerDown = (event) => {
    tap.current.x = event.clientX;
    tap.current.y = event.clientY;
    tap.current.at = performance.now();
  };

  const onPointerUp = (event) => {
    const moved = Math.hypot(event.clientX - tap.current.x, event.clientY - tap.current.y);
    if (moved > TAP_SLOP_PX || performance.now() - tap.current.at > 500) return; // kaydırma, dokunma değil
    const now = performance.now();
    const rect = event.currentTarget.getBoundingClientRect();
    if (now - tap.current.last < DOUBLE_TAP_MS) {
      clearTimeout(tap.current.timer);
      tap.current.last = 0;
      const id = now;
      setBursts(list => [...list, { id, x: event.clientX - rect.left, y: event.clientY - rect.top }]);
      setTimeout(() => setBursts(list => list.filter(b => b.id !== id)), 900);
      onLike(item);
      return;
    }
    tap.current.last = now;
    tap.current.timer = setTimeout(() => onTogglePause(), DOUBLE_TAP_MS);
  };

  const onSeek = (event) => {
    event.stopPropagation();
    const rect = event.currentTarget.getBoundingClientRect();
    playerRef.current?.seekToFraction((event.clientX - rect.left) / rect.width);
  };

  const handleEnded = () => {
    if (!onEnded(item)) playerRef.current?.restart();
  };

  const handleUnplayable = (code) => {
    setUnplayable(code);
    onUnplayable(item, code);
  };

  // Önceden yüklenirken hata veren sahneye gelindiğinde de atlansın
  const unplayableRef = useRef(null);
  unplayableRef.current = unplayable;
  useEffect(() => {
    if (isActive && unplayableRef.current && unplayableRef.current !== 'api') onUnplayable(item, unplayableRef.current);
  }, [isActive]);

  const showSpinner = isActive && playerMode === 'play' && !unplayable && (status === 'loading' || status === 'buffering' || (!hasPlayed && status !== 'error'));

  return (
    <section
      className="short-slide"
      data-index={index}
      aria-roledescription="sahne"
      aria-label={`${title} — ${trailerLabel || 'fragman'}`}
    >
      {showMedia && backdrop && (
        <div className="short-bg" style={{ backgroundImage: `url(${getImageUrl(backdrop, 'w300')})` }} aria-hidden="true" />
      )}

      <div className="short-layout">
        <div
          className="short-stage"
          onPointerDown={onPointerDown}
          onPointerUp={onPointerUp}
          role="button"
          tabIndex={-1}
          aria-label={userPaused ? 'Oynat' : 'Duraklat'}
        >
          <div className={`short-video ${fill ? 'fill' : ''}`}>
            {showMedia && <Thumbnail item={item} hidden={hasPlayed && !unplayable} />}
            {playerMode && !unplayable && (
              <ShortPlayer
                ref={playerRef}
                videoKey={item.trailer.key}
                mode={playerMode}
                muted={muted}
                startSeconds={START_AT[item.trailer.type] || 0}
                progressRef={progressRef}
                onStatus={handleStatus}
                onEnded={handleEnded}
                onUnplayable={handleUnplayable}
                onAutoplayBlocked={onAutoplayBlocked}
              />
            )}
          </div>

          {isActive && (
            <div className="short-center" aria-hidden="true">
              {unplayable ? null : showSpinner && !needsStart ? (
                <Spinner />
              ) : (userPaused || needsStart) ? (
                <span className="short-play-icon"><FaPlay /></span>
              ) : null}
            </div>
          )}

          {bursts.map(burst => (
            <FaHeart key={burst.id} className="short-burst" style={{ left: burst.x, top: burst.y }} aria-hidden="true" />
          ))}

          {unplayable && isActive && (
            <div className="short-error" onPointerUp={(e) => e.stopPropagation()}>
              <FaExclamationTriangle className="text-2xl text-yellow-400" />
              <p className="text-sm font-semibold">
                {unplayable === 'api' ? 'YouTube oynatıcısı yüklenemedi' : 'Bu fragman burada oynatılamıyor'}
              </p>
              <p className="text-xs text-white/55">
                {unplayable === 'api' ? 'Ağ bağlantısı veya bir reklam engelleyici YouTube’u engelliyor olabilir.' : 'Sonraki sahneye geçiliyor…'}
              </p>
              <a href={youtubeWatchUrl(item.trailer.key)} target="_blank" rel="noopener noreferrer" className="btn btn-secondary btn-sm mt-1">
                <FaYoutube /> YouTube'da aç
              </a>
            </div>
          )}

          <div className="short-progress" onPointerUp={(e) => e.stopPropagation()} onClick={onSeek} aria-hidden="true">
            <div className="short-progress-track">
              <div ref={progressRef} className="short-progress-bar" />
            </div>
          </div>
        </div>

        <div className="short-shade" aria-hidden="true" />

        <div className="short-panel">
          <div className="flex items-center gap-3">
            <Link to={getDetailPath(item, type)} className="short-poster" aria-label={`${title} detayları`}>
              {item.poster_path ? <img src={getImageUrl(item.poster_path, 'w92')} alt="" /> : (type === 'tv' ? <FaTv /> : <FaFilm />)}
            </Link>
            <div className="min-w-0">
              <Link to={getDetailPath(item, type)} className="short-title">{title}</Link>
              <div className="short-meta">
                <span>{getMediaLabel(type)}</span>
                {year && <span>{year}</span>}
                {item.vote_average > 0 && (
                  <span className="text-[var(--star)]"><FaStar className="mr-1 inline text-[10px]" />{item.vote_average.toFixed(1)}</span>
                )}
              </div>
            </div>
          </div>

          {trailerLabel && <p className="short-trailer-label">{trailerLabel}</p>}

          {item.overview && (
            <button
              type="button"
              className={`short-overview ${expanded ? 'expanded' : ''}`}
              onClick={() => setExpanded(v => !v)}
              aria-expanded={expanded}
            >
              {item.overview}
            </button>
          )}

          {genreNames.length > 0 && (
            <div className="short-genres">
              {genreNames.slice(0, 3).map(name => <span key={name}>#{name.replace(/\s+/g, '')}</span>)}
            </div>
          )}

          <div className="short-cta">
            <Link to={getWatchPath(item, type)} className="btn btn-primary btn-sm">
              <FaPlay className="text-[10px]" /> İzle
            </Link>
            <Link to={getDetailPath(item, type)} className="btn btn-secondary btn-sm">
              <FaInfoCircle className="text-xs" /> Detaylar
            </Link>
          </div>
        </div>

        <div className="short-actions">
          <ActionButton
            icon={<FaHeart />}
            label={isFavorite ? 'Beğendin' : 'Beğen'}
            active={isFavorite}
            activeClass="liked"
            pressed={isFavorite}
            onClick={() => onToggleFavorite(item)}
          />
          <ActionButton
            icon={inWatchLater ? <FaBookmark /> : <FaRegBookmark />}
            label={inWatchLater ? 'Listende' : 'Listeye ekle'}
            active={inWatchLater}
            pressed={inWatchLater}
            onClick={() => onToggleWatchLater(item)}
          />
          <ActionButton icon={<FaShare />} label="Paylaş" onClick={() => onShare(item)} />
          <ActionButton
            icon={muted ? <FaVolumeMute /> : <FaVolumeUp />}
            label={muted ? 'Sesi aç' : 'Sesi kapat'}
            pressed={!muted}
            onClick={onToggleMute}
          />
        </div>
      </div>
    </section>
  );
};

export default memo(ShortSlide);
