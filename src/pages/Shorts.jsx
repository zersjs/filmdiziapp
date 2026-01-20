import React, { useState, useEffect, useRef, useCallback } from 'react';
import { useNavigate, useParams } from 'react-router-dom';
import { Helmet } from 'react-helmet-async';
import { FaPlay, FaPause, FaVolumeUp, FaVolumeMute, FaHeart, FaRegHeart, FaBookmark, FaRegBookmark, FaShare, FaFilm, FaTv } from 'react-icons/fa';
import { useShorts } from '../hooks/useShorts';
import { shortsService } from '../services/shorts';
import { getImageUrl } from '../services/tmdb';
import { useAuth } from '../contexts/AuthContext';
import { likesService, bookmarksService } from '../services/supabase';

const ShortsCard = React.memo(({ short, isActive, isNext, isMuted, onToggleMute, user }) => {
  const navigate = useNavigate();
  const [isLiked, setIsLiked] = useState(false);
  const [isSaved, setIsSaved] = useState(false);
  const [isPlaying, setIsPlaying] = useState(true);
  const [isLoaded, setIsLoaded] = useState(false);
  const [showPlayPause, setShowPlayPause] = useState(false);
  const [likeLoading, setLikeLoading] = useState(false);
  const [saveLoading, setSaveLoading] = useState(false);
  const iframeRef = useRef(null);
  const playPauseTimer = useRef(null);

  const title = short.title || short.name;
  const year = (short.release_date || short.first_air_date || '').split('-')[0];
  const rating = short.vote_average?.toFixed(1);

  const embedUrl = shortsService.getYouTubeEmbedUrl(short.trailer.key, {
    autoplay: isActive ? 1 : (isNext ? 1 : 0),
    mute: isActive ? (isMuted ? 1 : 0) : 1, // Pre-load next one muted
    start: 15,
    controls: 0
  });

  const posterUrl = getImageUrl(short.poster_path, 'w342');
  const thumbnailUrl = shortsService.getThumbnailUrl(short.trailer.key);

  const togglePlayPause = useCallback((e) => {
    e?.stopPropagation();
    
    if (iframeRef.current) {
      const message = isPlaying ? 
        '{"event":"command","func":"pauseVideo","args":""}' : 
        '{"event":"command","func":"playVideo","args":""}';
      iframeRef.current.contentWindow?.postMessage(message, '*');
    }
    
    setIsPlaying(prev => !prev);
    setShowPlayPause(true);
    
    if (playPauseTimer.current) clearTimeout(playPauseTimer.current);
    playPauseTimer.current = setTimeout(() => setShowPlayPause(false), 800);
  }, [isPlaying]);

  useEffect(() => {
    if (isActive) {
      setIsPlaying(true);
      if (iframeRef.current && isLoaded) {
        iframeRef.current.contentWindow?.postMessage('{"event":"command","func":"playVideo","args":""}', '*');
        iframeRef.current.contentWindow?.postMessage(`{"event":"command","func":"${isMuted ? 'mute' : 'unMute'}","args":""}`, '*');
      }
    } else if (isNext) {
      // Pre-fethced next video, keep it paused or muted
      if (iframeRef.current && isLoaded) {
        iframeRef.current.contentWindow?.postMessage('{"event":"command","func":"pauseVideo","args":""}', '*');
      }
    }
    return () => {
      if (playPauseTimer.current) clearTimeout(playPauseTimer.current);
    };
  }, [isActive, isNext, isMuted, isLoaded]);

  useEffect(() => {
    const checkStatus = async () => {
      if (user?.id) {
        const liked = await likesService.isLiked(user.id, short.id, short.media_type);
        const saved = await bookmarksService.isBookmarked(user.id, short.id, short.media_type);
        setIsLiked(liked);
        setIsSaved(saved);
      }
    };
    checkStatus();
  }, [user?.id, short.id, short.media_type]);

  const handleLike = async (e) => {
    e.stopPropagation();
    if (!user) {
      navigate('/login');
      return;
    }
    if (likeLoading) return;
    
    setLikeLoading(true);
    const { liked } = await likesService.toggleLike(user.id, short.id, short.media_type);
    setIsLiked(liked);
    setLikeLoading(false);
  };

  const handleSave = async (e) => {
    e.stopPropagation();
    if (!user) {
      navigate('/login');
      return;
    }
    if (saveLoading) return;
    
    setSaveLoading(true);
    const title = short.title || short.name;
    const { bookmarked } = await bookmarksService.toggleBookmark(
      user.id, short.id, short.media_type, title, short.poster_path
    );
    setIsSaved(bookmarked);
    setSaveLoading(false);
  };

  const handleWatch = (e) => {
    e.stopPropagation();
    navigate(`/watch/${short.media_type}/${short.id}`);
  };

  const handleDetails = (e) => {
    e.stopPropagation();
    navigate(`/${short.media_type}/${short.id}`);
  };

  const handleShare = (e) => {
    e.stopPropagation();
    if (navigator.share) {
      navigator.share({
        title,
        url: `${window.location.origin}/${short.media_type}/${short.id}`
      });
    }
  };

  return (
    <div className="reels-card">
      <div 
        className="reels-bg-blur" 
        style={{ backgroundImage: `url(${thumbnailUrl})` }}
      />
      
      {(isActive || isNext) ? (
        <>
          <div className={`reels-iframe-wrapper ${isLoaded ? 'loaded' : ''}`} onClick={togglePlayPause}>
            <iframe
              ref={iframeRef}
              src={embedUrl}
              className="reels-iframe"
              allow="accelerometer; autoplay; clipboard-write; encrypted-media; gyroscope; picture-in-picture"
              allowFullScreen
              title={title}
              onLoad={() => setIsLoaded(true)}
            />
          </div>
          <div className="reels-iframe-mask" onClick={togglePlayPause} />
          
          {!isLoaded && (
            <div className="reels-thumbnail absolute inset-0 z-10">
              <img src={thumbnailUrl} alt={title} onError={(e) => { e.target.src = posterUrl; }} />
              <div className="reels-loading-spinner" />
            </div>
          )}

          <div className={`reels-play-pause-overlay ${showPlayPause ? 'visible' : ''}`}>
            {isPlaying ? <FaPause /> : <FaPlay />}
          </div>
        </>
      ) : (
        <div className="reels-thumbnail">
          <img src={thumbnailUrl} alt={title} onError={(e) => { e.target.src = posterUrl; }} />
          <div className="reels-play-overlay">
            <FaPlay />
          </div>
        </div>
      )}

      {/* Gradient overlay'i CSS'den yönetiyoruz, JSX'deki gereksiz div'i kaldırdım veya sadeleştirdim */}
      <div className="reels-overlay-minimal" />

      <div className="reels-content">
        <div className="reels-info">
          <span className="reels-badge">
            {short.media_type === 'movie' ? <><FaFilm /> Film</> : <><FaTv /> Dizi</>}
          </span>
          <h3 className="reels-title" onClick={handleDetails}>{title}</h3>
          <div className="reels-meta">
            <span className="reels-rating">★ {rating}</span>
            <span className="reels-separator">•</span>
            <span>{year}</span>
          </div>
          <button className="reels-watch-btn" onClick={handleWatch}>
            <FaPlay /> İzle
          </button>
        </div>

        <div className="reels-actions">
          <button
            className={`reels-action ${isLiked ? 'active' : ''} ${likeLoading ? 'loading' : ''}`}
            onClick={handleLike}
          >
            {isLiked ? <FaHeart /> : <FaRegHeart />}
          </button>
          <button
            className={`reels-action ${isSaved ? 'active' : ''} ${saveLoading ? 'loading' : ''}`}
            onClick={handleSave}
          >
            {isSaved ? <FaBookmark /> : <FaRegBookmark />}
          </button>
          <button className="reels-action" onClick={handleShare}>
            <FaShare />
          </button>
          <button
            className="reels-action sound-btn"
            onClick={(e) => { e.stopPropagation(); onToggleMute(); }}
          >
            {isMuted ? <FaVolumeMute /> : <FaVolumeUp />}
          </button>
          <div className="reels-poster" onClick={handleDetails}>
            <img src={posterUrl} alt={title} />
          </div>
        </div>
      </div>
    </div>
  );
});

const Shorts = () => {
  const { slug } = useParams();
  const navigate = useNavigate();
  
  const {
    shorts,
    isReady,
    currentIndex,
    goToNext,
    goToPrevious,
    goToIndex,
    isMuted,
    toggleMute,
    prependShort,
    hasContent
  } = useShorts();

  const { user } = useAuth();

  const containerRef = useRef(null);
  const touchStartRef = useRef(0);
  const lastScrollTime = useRef(0);
  const isScrolling = useRef(false);
  const initialSlugProcessed = useRef(false);

  const createSlug = (short) => {
    if (!short) return null;
    const title = (short.title || short.name || '').toLowerCase()
      .replace(/[^a-z0-9\s-ğüşıöçĞÜŞİÖÇ]/gi, '')
      .replace(/\s+/g, '-')
      .substring(0, 50);
    return `${short.id}-${short.media_type}-${title}`;
  };

  const parseSlug = (slugStr) => {
    if (!slugStr) return null;
    const parts = slugStr.split('-');
    if (parts.length < 2) return null;
    const id = parseInt(parts[0], 10);
    const mediaType = parts[1];
    if (isNaN(id)) return null;
    return { id, mediaType };
  };

  useEffect(() => {
    const processInitialSlug = async () => {
      if (slug && !initialSlugProcessed.current) {
        const parsed = parseSlug(slug);
        if (parsed) {
          // Önce mevcut listede var mı bak
          const targetIndex = shorts.findIndex(
            s => s.id === parsed.id && s.media_type === parsed.mediaType
          );

          if (targetIndex !== -1) {
            if (targetIndex !== currentIndex) {
              goToIndex(targetIndex);
            }
            initialSlugProcessed.current = true;
          } else if (isReady) {
            // Liste hazır ama içinde yoksa TMDB'den çekip başa ekle
            const singleShort = await shortsService.getShortById(parsed.id, parsed.mediaType);
            if (singleShort) {
              prependShort(singleShort);
            }
            initialSlugProcessed.current = true;
          }
        } else {
          initialSlugProcessed.current = true;
        }
      }
    };
    
    processInitialSlug();
  }, [isReady, hasContent, slug, shorts, currentIndex, goToIndex, prependShort]);

  useEffect(() => {
    if (isReady && hasContent && shorts[currentIndex]) {
      const newSlug = createSlug(shorts[currentIndex]);
      if (newSlug) {
        const currentPath = window.location.pathname;
        const expectedPath = `/sahneler/${newSlug}`;
        if (currentPath !== expectedPath) {
          window.history.replaceState(null, '', expectedPath);
        }
      }
    }
  }, [currentIndex, shorts, isReady, hasContent]);

  const handleScroll = useCallback((direction) => {
    const now = Date.now();
    if (now - lastScrollTime.current < 500) return; // Biraz daha uzun cooldown
    
    lastScrollTime.current = now;
    
    if (direction === 'down') {
      goToNext();
    } else {
      goToPrevious();
    }
  }, [goToNext, goToPrevious]);

  const handleWheel = useCallback((e) => {
    if (Math.abs(e.deltaY) > 30) {
      handleScroll(e.deltaY > 0 ? 'down' : 'up');
    }
  }, [handleScroll]);

  const handleTouchStart = useCallback((e) => {
    touchStartRef.current = e.touches[0].clientY;
  }, []);

  const handleTouchEnd = useCallback((e) => {
    const touchEnd = e.changedTouches[0].clientY;
    const diff = touchStartRef.current - touchEnd;
    
    if (Math.abs(diff) > 50) {
      handleScroll(diff > 0 ? 'down' : 'up');
    }
  }, [handleScroll]);

  const handleKeyDown = useCallback((e) => {
    if (e.key === 'ArrowDown' || e.key === 'j') {
      e.preventDefault();
      handleScroll('down');
    } else if (e.key === 'ArrowUp' || e.key === 'k') {
      e.preventDefault();
      handleScroll('up');
    } else if (e.key === 'm' || e.key === ' ') {
      e.preventDefault();
      toggleMute();
    }
  }, [handleScroll, toggleMute]);

  useEffect(() => {
    const container = containerRef.current;
    if (!container) return;

    container.addEventListener('wheel', handleWheel, { passive: true });
    container.addEventListener('touchstart', handleTouchStart, { passive: true });
    container.addEventListener('touchend', handleTouchEnd, { passive: true });
    window.addEventListener('keydown', handleKeyDown);

    return () => {
      container.removeEventListener('wheel', handleWheel);
      container.removeEventListener('touchstart', handleTouchStart);
      container.removeEventListener('touchend', handleTouchEnd);
      window.removeEventListener('keydown', handleKeyDown);
    };
  }, [handleWheel, handleTouchStart, handleTouchEnd, handleKeyDown]);

  if (!isReady || !hasContent) {
    return (
      <div className="reels-container">
        <div className="reels-skeleton">
          <div className="reels-skeleton-shimmer" />
        </div>
      </div>
    );
  }

  const currentShort = shorts[currentIndex];

  return (
    <>
      <Helmet>
        <title>Sahneler | SineFix</title>
        <meta name="description" content="Film ve dizi sahneleri" />
      </Helmet>

      <div className="reels-container" ref={containerRef}>
        <div className="reels-feed">
          <div
            className="reels-track"
            style={{
              transform: `translateY(-${currentIndex * 100}%)`,
              transition: 'transform 0.4s cubic-bezier(0.25, 0.1, 0.25, 1)'
            }}
          >
            {shorts.map((short, index) => {
              const isVisible = Math.abs(index - currentIndex) <= 2;
              if (!isVisible) return null;
              
              return (
                <div 
                  key={`${short.id}-${short.media_type}-${index}`} 
                  className="reels-slide"
                  style={{
                    top: `${index * 100}%`
                  }}
                >
                  <ShortsCard
                    short={short}
                    isActive={index === currentIndex}
                    isNext={index === currentIndex + 1}
                    isMuted={isMuted}
                    onToggleMute={toggleMute}
                    user={user}
                  />
                </div>
              );
            })}
          </div>
        </div>

        {shorts[currentIndex + 1] && (
          <link
            rel="preload"
            as="image"
            href={shortsService.getThumbnailUrl(shorts[currentIndex + 1].trailer.key)}
          />
        )}
      </div>
    </>
  );
};

export default Shorts;
