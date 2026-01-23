import React, { useState, useEffect, useRef, useCallback, useMemo } from 'react';
import { useNavigate, useParams } from 'react-router-dom';
import { Helmet } from 'react-helmet-async';
import { FaPlay, FaPause, FaVolumeUp, FaVolumeMute, FaHeart, FaRegHeart, FaBookmark, FaRegBookmark, FaShare, FaFilm, FaTv, FaExclamationTriangle, FaComment } from 'react-icons/fa';
import { useShorts } from '../hooks/useShorts';
import { shortsService } from '../services/shorts';
import { getImageUrl } from '../services/tmdb';
import { useAuth } from '../contexts/AuthContext';
import { likesService, bookmarksService, commentsService } from '../services/supabase';
import { triggerHaptic, HapticType } from '../utils/haptic';
import CommentsModal from '../components/UI/CommentsModal';


const ShortsCard = React.memo(({ short, isActive, isNext, isMuted, onToggleMute, user, onOpenComments }) => {
  const navigate = useNavigate();
  const [isLiked, setIsLiked] = useState(false);
  const [isSaved, setIsSaved] = useState(false);
  const [isPlaying, setIsPlaying] = useState(true);
  const [isLoaded, setIsLoaded] = useState(false);
  const [hasError, setHasError] = useState(false);
  const [showPlayPause, setShowPlayPause] = useState(false);
  const [likeLoading, setLikeLoading] = useState(false);
  const [saveLoading, setSaveLoading] = useState(false);
  const [commentCount, setCommentCount] = useState(0);
  const iframeRef = useRef(null);
  const playPauseTimer = useRef(null);
  const loadTimeoutRef = useRef(null);
  const retryCountRef = useRef(0);

  const title = short.title || short.name;
  const year = (short.release_date || short.first_air_date || '').split('-')[0];
  const rating = short.vote_average?.toFixed(1);

  // Mobil için autoplay ve muted ile başla
  const embedUrl = useMemo(() => {
    if (!short?.trailer?.key) return null;
    return shortsService.getYouTubeEmbedUrl(short.trailer.key, {
      autoplay: 1, // Her zaman autoplay
      mute: isMuted ? 1 : 0,
      start: 10, // Biraz daha erken başlat
      controls: 0,
      playsinline: 1 // Mobil için kritik
    });
  }, [short?.trailer?.key, isMuted]);

  const posterUrl = getImageUrl(short.poster_path, 'w342');
  const thumbnailUrl = shortsService.getThumbnailUrl(short.trailer.key);

  // Cleanup function
  useEffect(() => {
    return () => {
      if (playPauseTimer.current) clearTimeout(playPauseTimer.current);
      if (loadTimeoutRef.current) clearTimeout(loadTimeoutRef.current);
    };
  }, []);

  const sendCommand = useCallback((command) => {
    if (iframeRef.current?.contentWindow) {
      try {
        iframeRef.current.contentWindow.postMessage(
          JSON.stringify({ event: 'command', func: command, args: '' }),
          '*'
        );
      } catch (e) {
        console.warn('YouTube command error:', e);
      }
    }
  }, []);

  const togglePlayPause = useCallback((e) => {
    e?.stopPropagation();
    
    sendCommand(isPlaying ? 'pauseVideo' : 'playVideo');
    setIsPlaying(prev => !prev);
    setShowPlayPause(true);
    
    if (playPauseTimer.current) clearTimeout(playPauseTimer.current);
    playPauseTimer.current = setTimeout(() => setShowPlayPause(false), 600);
  }, [isPlaying, sendCommand]);

  // Active/Next video management
  useEffect(() => {
    if (!isLoaded) return;

    if (isActive) {
      setIsPlaying(true);
      sendCommand('playVideo');
      sendCommand(isMuted ? 'mute' : 'unMute');
    } else {
      sendCommand('pauseVideo');
      setIsPlaying(false);
    }
  }, [isActive, isLoaded, isMuted, sendCommand]);

  // Video load timeout handler
  useEffect(() => {
    if ((isActive || isNext) && !isLoaded && !hasError) {
      loadTimeoutRef.current = setTimeout(() => {
        if (!isLoaded && retryCountRef.current < 2) {
          retryCountRef.current += 1;
          setIsLoaded(false);
          // Force iframe reload
          if (iframeRef.current) {
            const src = iframeRef.current.src;
            iframeRef.current.src = '';
            setTimeout(() => {
              if (iframeRef.current) iframeRef.current.src = src;
            }, 100);
          }
        } else if (retryCountRef.current >= 2) {
          setHasError(true);
        }
      }, 8000); // 8 saniye timeout
    }

    return () => {
      if (loadTimeoutRef.current) clearTimeout(loadTimeoutRef.current);
    };
  }, [isActive, isNext, isLoaded, hasError]);

  const handleIframeLoad = useCallback(() => {
    setIsLoaded(true);
    setHasError(false);
    retryCountRef.current = 0;
    if (loadTimeoutRef.current) clearTimeout(loadTimeoutRef.current);
    
    // Mobil için hemen oynat
    if (isActive) {
      setTimeout(() => {
        sendCommand('playVideo');
        sendCommand(isMuted ? 'mute' : 'unMute');
      }, 300);
    }
  }, [isActive, isMuted, sendCommand]);

  // User status check + comment count
  useEffect(() => {
    const checkStatus = async () => {
      // Yorum sayısını her zaman yükle
      const count = await commentsService.getCommentCount(short.id, short.media_type);
      setCommentCount(count);

      if (user?.id) {
        try {
          const [liked, saved] = await Promise.all([
            likesService.isLiked(user.id, short.id, short.media_type),
            bookmarksService.isBookmarked(user.id, short.id, short.media_type)
          ]);
          setIsLiked(liked);
          setIsSaved(saved);
        } catch (e) {
          console.warn('Status check error:', e);
        }
      }
    };
    if (isActive) checkStatus();
  }, [user?.id, short.id, short.media_type, isActive]);

  const handleLike = async (e) => {
    e.stopPropagation();
    triggerHaptic(HapticType.MEDIUM, e.currentTarget);
    if (!user) {
      navigate('/login');
      return;
    }
    if (likeLoading) return;
    
    setLikeLoading(true);
    try {
      const { liked } = await likesService.toggleLike(user.id, short.id, short.media_type);
      setIsLiked(liked);
      triggerHaptic(liked ? HapticType.SUCCESS : HapticType.LIGHT);
    } catch (e) {
      console.error('Like error:', e);
      triggerHaptic(HapticType.ERROR);
    }
    setLikeLoading(false);
  };

  const handleSave = async (e) => {
    e.stopPropagation();
    triggerHaptic(HapticType.MEDIUM, e.currentTarget);
    if (!user) {
      navigate('/login');
      return;
    }
    if (saveLoading) return;
    
    setSaveLoading(true);
    try {
      const { bookmarked } = await bookmarksService.toggleBookmark(
        user.id, short.id, short.media_type, title, short.poster_path
      );
      setIsSaved(bookmarked);
      triggerHaptic(bookmarked ? HapticType.SUCCESS : HapticType.LIGHT);
    } catch (e) {
      console.error('Save error:', e);
      triggerHaptic(HapticType.ERROR);
    }
    setSaveLoading(false);
  };

  const handleWatch = (e) => {
    e.stopPropagation();
    triggerHaptic(HapticType.HEAVY, e.currentTarget);
    navigate(`/watch/${short.media_type}/${short.id}`);
  };

  const handleDetails = (e) => {
    e.stopPropagation();
    navigate(`/${short.media_type}/${short.id}`);
  };

  const handleShare = (e) => {
    e.stopPropagation();
    triggerHaptic(HapticType.LIGHT, e.currentTarget);
    if (navigator.share) {
      navigator.share({
        title,
        url: `${window.location.origin}/${short.media_type}/${short.id}`
      }).then(() => triggerHaptic(HapticType.SUCCESS)).catch(() => {});
    } else {
      navigator.clipboard?.writeText(`${window.location.origin}/${short.media_type}/${short.id}`);
      triggerHaptic(HapticType.SUCCESS);
    }
  };

  const handleRetry = (e) => {
    e.stopPropagation();
    setHasError(false);
    setIsLoaded(false);
    retryCountRef.current = 0;
  };

  // Render nothing if no trailer
  if (!short?.trailer?.key) return null;

  return (
    <div className="reels-card">
      <div 
        className="reels-bg-blur" 
        style={{ backgroundImage: `url(${thumbnailUrl})` }}
      />
      
      {(isActive || isNext) && !hasError ? (
        <>
          <div className={`reels-iframe-wrapper ${isLoaded ? 'loaded' : ''}`} onClick={togglePlayPause}>
            <iframe
              ref={iframeRef}
              src={embedUrl}
              className="reels-iframe"
              allow="accelerometer; autoplay; clipboard-write; encrypted-media; gyroscope; picture-in-picture; web-share"
              allowFullScreen
              title={title}
              onLoad={handleIframeLoad}
              loading={isActive ? 'eager' : 'lazy'}
            />
          </div>
          <div className="reels-iframe-mask" onClick={togglePlayPause} />
          
          {!isLoaded && (
            <div className="reels-thumbnail absolute inset-0 z-10">
              <img src={thumbnailUrl} alt={title} onError={(e) => { e.target.src = posterUrl; }} />
            </div>
          )}

          <div className={`reels-play-pause-overlay ${showPlayPause ? 'visible' : ''}`}>
            {isPlaying ? <FaPause /> : <FaPlay />}
          </div>
        </>
      ) : hasError ? (
        <div className="reels-error-state" onClick={handleRetry}>
          <FaExclamationTriangle className="text-4xl text-yellow-500 mb-3" />
          <p className="text-sm text-gray-400 mb-3">Video yüklenemedi</p>
          <button className="reels-retry-btn">Tekrar Dene</button>
        </div>
      ) : (
        <div className="reels-thumbnail">
          <img src={thumbnailUrl} alt={title} onError={(e) => { e.target.src = posterUrl; }} />
          <div className="reels-play-overlay">
            <FaPlay />
          </div>
        </div>
      )}

      <div className="reels-overlay-minimal" />

      <div className="reels-content">
        <div className="reels-info">
          <div className="reels-creator">
            <div className="reels-poster-small" onClick={handleDetails}>
              <img src={posterUrl} alt={title} />
            </div>
            <div className="reels-creator-info">
              <h3 className="reels-title" onClick={handleDetails}>{title}</h3>
              <div className="reels-meta">
                <span className="reels-badge-inline">
                  {short.media_type === 'movie' ? <><FaFilm /> Film</> : <><FaTv /> Dizi</>}
                </span>
                <span className="reels-separator">•</span>
                <span className="reels-rating">★ {rating}</span>
                <span className="reels-separator">•</span>
                <span>{year}</span>
              </div>
            </div>
          </div>
          
          {short.overview && (
            <p className="reels-description">
              {short.overview.length > 120 ? `${short.overview.substring(0, 120)}...` : short.overview}
            </p>
          )}

          {short.genres?.length > 0 && (
            <div className="reels-tags">
              {short.genres.slice(0, 3).map(genre => (
                <span key={genre.id} className="reels-tag">#{genre.name.replace(/\s+/g, '')}</span>
              ))}
            </div>
          )}

          <button className="reels-watch-btn" onClick={handleWatch}>
            <FaPlay /> Hemen İzle
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
            className="reels-action comment-btn"
            onClick={(e) => { e.stopPropagation(); onOpenComments(short, title); }}
          >
            <FaComment />
            {commentCount > 0 && <span className="reels-action-count">{commentCount}</span>}
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
        </div>
      </div>

      {/* Progress indicator - her video için sıfırdan başlar */}
      {isActive && isLoaded && (
        <div className="reels-progress-container">
          <div 
            key={`progress-${short.id}-${short.media_type}`} 
            className="reels-progress-bar" 
          />
        </div>
      )}
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
    hasContent,
    cleanupOldItems
  } = useShorts();

  const { user } = useAuth();

  // Yorum modalı state
  const [commentsModal, setCommentsModal] = useState({
    isOpen: false,
    short: null,
    title: ''
  });

  // Native swipe state
  const [dragOffset, setDragOffset] = useState(0);
  const [isDragging, setIsDragging] = useState(false);
  const [swipeDirection, setSwipeDirection] = useState(null);

  const containerRef = useRef(null);
  const touchStartRef = useRef({ y: 0, x: 0, time: 0 });
  const lastScrollTime = useRef(0);
  const initialSlugProcessed = useRef(false);
  const isTransitioning = useRef(false);
  const velocityRef = useRef(0);
  const lastTouchY = useRef(0);
  const animationFrameRef = useRef(null);

  const openCommentsModal = useCallback((short, title) => {
    setCommentsModal({ isOpen: true, short, title });
  }, []);

  const closeCommentsModal = useCallback(() => {
    setCommentsModal({ isOpen: false, short: null, title: '' });
  }, []);

  const createSlug = useCallback((short) => {
    if (!short) return null;
    const title = (short.title || short.name || '')
      .toLowerCase()
      .replace(/[^a-z0-9\s-ğüşıöçĞÜŞİÖÇ]/gi, '')
      .replace(/\s+/g, '-')
      .substring(0, 50);
    return `${short.id}-${short.media_type}-${title}`;
  }, []);

  const parseSlug = useCallback((slugStr) => {
    if (!slugStr) return null;
    const parts = slugStr.split('-');
    if (parts.length < 2) return null;
    const id = parseInt(parts[0], 10);
    const mediaType = parts[1];
    if (isNaN(id) || !['movie', 'tv'].includes(mediaType)) return null;
    return { id, mediaType };
  }, []);

  // Initial slug processing
  useEffect(() => {
    const processInitialSlug = async () => {
      if (slug && !initialSlugProcessed.current && isReady) {
        const parsed = parseSlug(slug);
        if (parsed) {
          const targetIndex = shorts.findIndex(
            s => s.id === parsed.id && s.media_type === parsed.mediaType
          );

          if (targetIndex !== -1) {
            if (targetIndex !== currentIndex) {
              goToIndex(targetIndex);
            }
          } else {
            try {
              const singleShort = await shortsService.getShortById(parsed.id, parsed.mediaType);
              if (singleShort) {
                prependShort(singleShort);
              }
            } catch (e) {
              console.warn('Failed to load short from slug:', e);
            }
          }
        }
        initialSlugProcessed.current = true;
      }
    };
    
    processInitialSlug();
  }, [isReady, slug, shorts, currentIndex, goToIndex, prependShort, parseSlug]);

  // URL update
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
  }, [currentIndex, shorts, isReady, hasContent, createSlug]);

  // Scroll handler with momentum
  const handleScroll = useCallback((direction) => {
    const now = Date.now();
    if (now - lastScrollTime.current < 250 || isTransitioning.current) return;
    
    lastScrollTime.current = now;
    isTransitioning.current = true;
    
    // Haptic feedback simulation - visual pulse
    if (containerRef.current) {
      containerRef.current.classList.add('reels-haptic');
      setTimeout(() => {
        containerRef.current?.classList.remove('reels-haptic');
      }, 100);
    }
    
    if (direction === 'down') {
      goToNext();
    } else {
      goToPrevious();
    }

    // Memory cleanup when scrolling far
    if (currentIndex > 50) {
      cleanupOldItems();
    }
    
    setTimeout(() => {
      isTransitioning.current = false;
    }, 300);
  }, [goToNext, goToPrevious, currentIndex, cleanupOldItems]);

  // Wheel event with momentum
  const handleWheel = useCallback((e) => {
    if (commentsModal.isOpen) return;
    if (Math.abs(e.deltaY) > 15) {
      handleScroll(e.deltaY > 0 ? 'down' : 'up');
    }
  }, [handleScroll, commentsModal.isOpen]);

  // Native touch events with visual feedback
  const handleTouchStart = useCallback((e) => {
    if (commentsModal.isOpen) return;
    
    const touch = e.touches[0];
    touchStartRef.current = {
      y: touch.clientY,
      x: touch.clientX,
      time: Date.now()
    };
    lastTouchY.current = touch.clientY;
    velocityRef.current = 0;
    setIsDragging(true);
    setSwipeDirection(null);
  }, [commentsModal.isOpen]);

  const handleTouchMove = useCallback((e) => {
    if (!isDragging || commentsModal.isOpen) return;
    
    const touch = e.touches[0];
    const deltaY = touchStartRef.current.y - touch.clientY;
    const deltaX = Math.abs(touchStartRef.current.x - touch.clientX);
    
    // Yatay hareketi engelle (sayfa geçişleri için)
    if (deltaX > Math.abs(deltaY) && Math.abs(deltaY) < 30) {
      return;
    }
    
    // Velocity hesapla
    velocityRef.current = touch.clientY - lastTouchY.current;
    lastTouchY.current = touch.clientY;
    
    // Swipe yönünü belirle
    if (Math.abs(deltaY) > 10 && !swipeDirection) {
      setSwipeDirection(deltaY > 0 ? 'up' : 'down');
    }
    
    // Rubber band effect
    const maxDrag = 100;
    const dampedDelta = deltaY > 0 
      ? Math.min(deltaY * 0.4, maxDrag)
      : Math.max(deltaY * 0.4, -maxDrag);
    
    if (animationFrameRef.current) {
      cancelAnimationFrame(animationFrameRef.current);
    }
    
    animationFrameRef.current = requestAnimationFrame(() => {
      setDragOffset(dampedDelta);
    });
    
    e.preventDefault();
  }, [isDragging, commentsModal.isOpen, swipeDirection]);

  const handleTouchEnd = useCallback((e) => {
    if (!isDragging || commentsModal.isOpen) {
      setIsDragging(false);
      setDragOffset(0);
      setSwipeDirection(null);
      return;
    }
    
    const touch = e.changedTouches[0];
    const deltaY = touchStartRef.current.y - touch.clientY;
    const timeDiff = Date.now() - touchStartRef.current.time;
    const velocity = Math.abs(velocityRef.current);
    
    // Hızlı flick gesture (velocity based)
    const isQuickFlick = timeDiff < 300 && Math.abs(deltaY) > 15;
    // Normal swipe (distance based)
    const isSwipe = Math.abs(deltaY) > 40;
    // Momentum based (velocity)
    const hasMomentum = velocity > 3;
    
    if (isQuickFlick || isSwipe || hasMomentum) {
      handleScroll(deltaY > 0 ? 'down' : 'up');
    }
    
    // Reset with spring animation
    setDragOffset(0);
    setIsDragging(false);
    setSwipeDirection(null);
    
    if (animationFrameRef.current) {
      cancelAnimationFrame(animationFrameRef.current);
    }
  }, [isDragging, commentsModal.isOpen, handleScroll]);

  // Cleanup animation frame on unmount
  useEffect(() => {
    return () => {
      if (animationFrameRef.current) {
        cancelAnimationFrame(animationFrameRef.current);
      }
    };
  }, []);

  // Keyboard events
  const handleKeyDown = useCallback((e) => {
    if (commentsModal.isOpen) return;
    if (['INPUT', 'TEXTAREA'].includes(document.activeElement.tagName)) {
      return;
    }

    if (e.key === 'ArrowDown' || e.key === 'j') {
      e.preventDefault();
      handleScroll('down');
    } else if (e.key === 'ArrowUp' || e.key === 'k') {
      e.preventDefault();
      handleScroll('up');
    } else if (e.key === 'm') {
      e.preventDefault();
      toggleMute();
    } else if (e.key === ' ') {
      e.preventDefault();
    }
  }, [handleScroll, toggleMute, commentsModal.isOpen]);

  // Event listeners
  useEffect(() => {
    const container = containerRef.current;
    if (!container) return;

    container.addEventListener('wheel', handleWheel, { passive: false });
    container.addEventListener('touchstart', handleTouchStart, { passive: true });
    container.addEventListener('touchmove', handleTouchMove, { passive: false });
    container.addEventListener('touchend', handleTouchEnd, { passive: true });
    window.addEventListener('keydown', handleKeyDown);

    return () => {
      container.removeEventListener('wheel', handleWheel);
      container.removeEventListener('touchstart', handleTouchStart);
      container.removeEventListener('touchmove', handleTouchMove);
      container.removeEventListener('touchend', handleTouchEnd);
      window.removeEventListener('keydown', handleKeyDown);
    };
  }, [handleWheel, handleTouchStart, handleTouchMove, handleTouchEnd, handleKeyDown]);

  // Visible items (only render ±1 for performance)
  const visibleItems = useMemo(() => {
    return shorts.map((short, index) => {
      const isVisible = Math.abs(index - currentIndex) <= 1;
      return { short, index, isVisible };
    }).filter(item => item.isVisible);
  }, [shorts, currentIndex]);

  if (!isReady || !hasContent) {
    return (
      <div className="reels-container">
        <div className="reels-skeleton">
          <div className="reels-skeleton-shimmer" />
          <div className="reels-skeleton-content">
            <div className="reels-skeleton-badge" />
            <div className="reels-skeleton-title" />
            <div className="reels-skeleton-meta" />
            <div className="reels-skeleton-button" />
          </div>
        </div>
      </div>
    );
  }

  // Calculate transform with drag offset
  const trackTransform = isDragging 
    ? `translateY(calc(-${currentIndex * 100}% - ${dragOffset}px))`
    : `translateY(-${currentIndex * 100}%)`;

  return (
    <>
      <Helmet>
        <title>Sahneler | SineFix</title>
        <meta name="description" content="Film ve dizi sahneleri" />
      </Helmet>

      <div 
        className={`reels-container ${isDragging ? 'is-dragging' : ''}`} 
        ref={containerRef}
      >
        <div className="reels-feed">
          <div
            className="reels-track"
            style={{
              transform: trackTransform,
              transition: isDragging ? 'none' : 'transform 0.35s cubic-bezier(0.32, 0.72, 0, 1)'
            }}
          >
            {visibleItems.map(({ short, index }) => (
              <div 
                key={`${short.id}-${short.media_type}`} 
                className="reels-slide"
                style={{ top: `${index * 100}%` }}
              >
                <ShortsCard
                  short={short}
                  isActive={index === currentIndex}
                  isNext={index === currentIndex + 1}
                  isMuted={isMuted}
                  onToggleMute={toggleMute}
                  user={user}
                  onOpenComments={openCommentsModal}
                />
              </div>
            ))}
          </div>
        </div>

        {/* Swipe direction indicator */}
        {isDragging && swipeDirection && (
          <div className={`reels-swipe-indicator ${swipeDirection}`}>
            <span>{swipeDirection === 'up' ? '↑' : '↓'}</span>
          </div>
        )}

        {/* Swipe hint - sadece ilk video için göster */}
        {currentIndex === 0 && !isDragging && (
          <div className="reels-swipe-hint visible">
            <span>↑ Kaydır ↓</span>
          </div>
        )}

        {/* Preload next thumbnail */}
        {shorts[currentIndex + 1]?.trailer?.key && (
          <link
            rel="preload"
            as="image"
            href={shortsService.getThumbnailUrl(shorts[currentIndex + 1].trailer.key)}
          />
        )}
      </div>

      {/* Yorum Modalı */}
      <CommentsModal
        isOpen={commentsModal.isOpen}
        onClose={closeCommentsModal}
        mediaId={commentsModal.short?.id}
        mediaType={commentsModal.short?.media_type}
        title={commentsModal.title}
      />
    </>
  );
};

export default Shorts;
