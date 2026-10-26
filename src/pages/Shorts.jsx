import React, { useCallback, useEffect, useMemo, useRef, useState } from 'react';
import { Link, useParams } from 'react-router-dom';
import { Helmet } from 'react-helmet-async';
import {
  FaChevronUp, FaChevronDown, FaExpand, FaCompress, FaForward, FaVolumeMute, FaRedo, FaExclamationTriangle,
} from 'react-icons/fa';
import ShortSlide from '../components/Shorts/ShortSlide';
import Seo from '../components/Seo';
import { STATIC_PAGES } from '../lib/seo';
import { useShortsFeed } from '../hooks/useShortsFeed';
import { useGenres } from '../hooks';
import { useApp } from '../contexts';
import { useToast } from '../components/UI/Toast';
import { Spinner } from '../components/UI/Loading';
import { blockedTrailers, createShortSlug, seenShorts, shortKey } from '../services/shorts';
import { getTitle, shareOrCopy } from '../utils/helpers';

const SEEN_AFTER_MS = 3000;
const SKIP_UNPLAYABLE_MS = 1500;

const readFlag = (storage, key, fallback) => {
  try {
    const value = window[storage].getItem(key);
    return value === null ? fallback : value === '1';
  } catch {
    return fallback;
  }
};

const writeFlag = (storage, key, value) => {
  try {
    window[storage].setItem(key, value ? '1' : '0');
  } catch {
    // tercih kaydedilemezse sorun değil
  }
};

// Veri tasarrufu veya azaltılmış hareket tercih edildiyse videolar kendiliğinden başlamaz.
const prefersManualStart = () => {
  try {
    return !!navigator.connection?.saveData || window.matchMedia('(prefers-reduced-motion: reduce)').matches;
  } catch {
    return false;
  }
};

// Fareyle tıklanan butondan odağı al; aksi halde Space kısayolu butonu yeniden tetikler.
// Klavyeyle basıldığında (detail === 0) odak korunur.
const releaseMouseFocus = (event) => {
  if (event.detail > 0) event.currentTarget.blur();
};

const StatusSlide = ({ children, loading = false }) => (
  <section className={`short-slide short-slide-status ${loading ? 'loading' : ''}`}>
    <div className="flex max-w-xs flex-col items-center gap-3 text-center">{children}</div>
  </section>
);

const Shorts = () => {
  const { slug } = useParams();
  const { items, status, notice, dismissNotice, ensureAhead, retry } = useShortsFeed(slug);
  const { actions } = useApp();
  const { toast } = useToast();
  const { data: movieGenres = [] } = useGenres('movie');
  const { data: tvGenres = [] } = useGenres('tv');
  const genreMap = useMemo(() => new Map([...movieGenres, ...tvGenres].map(g => [g.id, g.name])), [movieGenres, tvGenres]);

  const scrollerRef = useRef(null);
  const [active, setActive] = useState(0);
  const [userPaused, setUserPaused] = useState(false);
  const [pageHidden, setPageHidden] = useState(false);
  const [muted, setMuted] = useState(() => readFlag('sessionStorage', 'shortsMuted', true));
  const [fill, setFill] = useState(() => readFlag('localStorage', 'shortsFill', false));
  const [autoNext, setAutoNext] = useState(() => readFlag('localStorage', 'shortsAutoNext', true));
  const [manualStart] = useState(prefersManualStart);
  const [started, setStarted] = useState(false);
  const [soundHint, setSoundHint] = useState(() => (readFlag('sessionStorage', 'shortsMuted', true) ? 'initial' : null));
  const [apiFailed, setApiFailed] = useState(false);
  const [swipeHint, setSwipeHint] = useState(() => !readFlag('localStorage', 'shortsSwipeHintSeen', false));

  const itemsRef = useRef(items);
  itemsRef.current = items;
  const activeRef = useRef(active);
  activeRef.current = active;
  const autoNextRef = useRef(autoNext);
  autoNextRef.current = autoNext;

  const activeItem = items[active];
  const activeKey = activeItem ? shortKey(activeItem) : null;

  // ---------- Gezinme ----------

  // Sondaki durum sahnesine (bitti / hata) yalnızca yükleme bittiyse gidilebilir.
  const terminalRef = useRef(false);
  terminalRef.current = !['loading', 'ready'].includes(status);

  const go = useCallback((index) => {
    const el = scrollerRef.current;
    if (!el) return;
    const last = itemsRef.current.length - (terminalRef.current ? 0 : 1);
    const target = Math.max(0, Math.min(index, last));
    el.scrollTo({ top: target * el.clientHeight, behavior: manualStart ? 'auto' : 'smooth' });
  }, [manualStart]);

  // Aktif sahne, kaydırma durduğunda hesaplanır (kaydırma ortasında video değişmez).
  useEffect(() => {
    const el = scrollerRef.current;
    if (!el) return undefined;
    let timer;
    const settle = () => {
      clearTimeout(timer);
      setActive(Math.round(el.scrollTop / Math.max(el.clientHeight, 1)));
    };
    const onScroll = () => {
      clearTimeout(timer);
      timer = setTimeout(settle, 100);
    };
    el.addEventListener('scroll', onScroll, { passive: true });
    el.addEventListener('scrollend', settle);
    return () => {
      clearTimeout(timer);
      el.removeEventListener('scroll', onScroll);
      el.removeEventListener('scrollend', settle);
    };
  }, []);

  useEffect(() => {
    ensureAhead(active);
  }, [active, items.length, ensureAhead]);

  useEffect(() => {
    setUserPaused(false);
    if (active > 0 && swipeHint) {
      setSwipeHint(false);
      writeFlag('localStorage', 'shortsSwipeHintSeen', true);
    }
    if (!activeItem) return undefined;
    // Router'ın geçmiş kaydını koruyarak adresi güncelle (sayfa yeniden yüklenmez).
    window.history.replaceState(window.history.state, '', `/sahneler/${createShortSlug(activeItem)}`);
    const timer = setTimeout(() => seenShorts.add(activeKey), SEEN_AFTER_MS);
    return () => clearTimeout(timer);
  }, [activeKey]);

  useEffect(() => {
    const onVisibility = () => setPageHidden(document.visibilityState === 'hidden');
    document.addEventListener('visibilitychange', onVisibility);
    return () => document.removeEventListener('visibilitychange', onVisibility);
  }, []);

  useEffect(() => {
    if (!notice) return;
    toast.info(notice, 4000);
    dismissNotice();
  }, [notice]);

  // ---------- Oynatma kontrolleri ----------

  const togglePause = useCallback(() => {
    if (manualStart && !started) {
      setStarted(true);
      setUserPaused(false);
      return;
    }
    setUserPaused(paused => !paused);
  }, [manualStart, started]);

  const toggleMute = useCallback(() => {
    setMuted(value => {
      writeFlag('sessionStorage', 'shortsMuted', !value);
      return !value;
    });
    setSoundHint(null);
  }, []);

  const handleAutoplayBlocked = useCallback(() => {
    setMuted(true);
    setSoundHint('blocked');
  }, []);

  const handleEnded = useCallback((item) => {
    const current = itemsRef.current[activeRef.current];
    if (!autoNextRef.current || !current || shortKey(current) !== shortKey(item)) return false;
    go(activeRef.current + 1);
    return true;
  }, [go]);

  const handleUnplayable = useCallback((item, code) => {
    if (code === 'api') {
      setApiFailed(true);
      return;
    }
    blockedTrailers.add(item.trailer.key);
    const index = itemsRef.current.findIndex(entry => shortKey(entry) === shortKey(item));
    if (index !== activeRef.current) return;
    setTimeout(() => {
      if (activeRef.current === index) go(index + 1);
    }, SKIP_UNPLAYABLE_MS);
  }, [go]);

  // ---------- Kitaplık eylemleri ----------

  const handleLike = useCallback((item) => {
    if (actions.addFavorite(item, item.media_type)) toast.success('Favorilere eklendi', 1500);
  }, [actions, toast]);

  const handleToggleFavorite = useCallback((item) => {
    const added = actions.toggleFavorite(item, item.media_type);
    toast.success(added ? 'Favorilere eklendi' : 'Favorilerden çıkarıldı', 1500);
  }, [actions, toast]);

  const handleToggleWatchLater = useCallback((item) => {
    const added = actions.toggleWatchLater(item, item.media_type);
    toast.success(added ? 'İzleme listene eklendi' : 'İzleme listenden çıkarıldı', 1500);
  }, [actions, toast]);

  const handleShare = useCallback(async (item) => {
    const result = await shareOrCopy({ title: getTitle(item), url: `${window.location.origin}/sahneler/${createShortSlug(item)}` });
    if (result === 'copied') toast.success('Bağlantı kopyalandı', 2000);
    if (result === 'failed') toast.error('Bağlantı paylaşılamadı');
  }, [toast]);

  // ---------- Klavye ----------

  useEffect(() => {
    const onKeyDown = (event) => {
      if (event.metaKey || event.ctrlKey || event.altKey) return;
      if (event.target.closest?.('input, textarea, select, [contenteditable="true"]')) return;
      switch (event.key) {
        case 'ArrowDown':
        case 'PageDown':
        case 'j':
          event.preventDefault();
          go(activeRef.current + 1);
          break;
        case 'ArrowUp':
        case 'PageUp':
        case 'k':
          event.preventDefault();
          go(activeRef.current - 1);
          break;
        case ' ':
          if (event.target.closest?.('button, a')) return;
          event.preventDefault();
          togglePause();
          break;
        case 'm':
        case 'M':
          toggleMute();
          break;
        default:
          break;
      }
    };
    window.addEventListener('keydown', onKeyDown);
    return () => window.removeEventListener('keydown', onKeyDown);
  }, [go, togglePause, toggleMute]);

  // ---------- Görünüm ----------

  const autoplayAllowed = (!manualStart || started) && !apiFailed;
  const activeMode = autoplayAllowed && !userPaused && !pageHidden ? 'play' : 'pause';
  const title = activeItem ? getTitle(activeItem) : null;

  return (
    <div className="shorts">
      {/* Tek tek sahne adresleri aynı akışın kopyası; hepsi /sahneler'e canonical olur. */}
      <Seo
        title={title ? `${title} · Sahneler` : STATIC_PAGES['/sahneler'].title}
        description={STATIC_PAGES['/sahneler'].description}
        path="/sahneler"
      />
      <Helmet>
        <link rel="preconnect" href="https://www.youtube-nocookie.com" />
        <link rel="preconnect" href="https://i.ytimg.com" />
      </Helmet>

      <div className="shorts-topbar">
        <h1 className="shorts-heading">Sahneler</h1>
        <div className="flex items-center gap-1">
          <button
            type="button"
            className={`shorts-tool ${autoNext ? 'active' : ''}`}
            onClick={() => {
              writeFlag('localStorage', 'shortsAutoNext', !autoNext);
              toast.info(!autoNext ? 'Fragman bitince sonrakine geçilecek' : 'Fragman bitince başa sarılacak', 2000);
              setAutoNext(!autoNext);
            }}
            aria-pressed={autoNext}
            title="Fragman bitince otomatik geç"
          >
            <FaForward /> <span>Otomatik</span>
          </button>
          <button
            type="button"
            className="shorts-tool fill-toggle"
            onClick={() => {
              writeFlag('localStorage', 'shortsFill', !fill);
              setFill(!fill);
            }}
            aria-label={fill ? 'Videoyu ekrana sığdır' : 'Videoyla ekranı doldur'}
            title={fill ? 'Sığdır' : 'Doldur'}
          >
            {fill ? <FaCompress /> : <FaExpand />}
          </button>
        </div>
      </div>

      {soundHint && muted && !apiFailed && items.length > 0 && (
        <button type="button" className="shorts-sound-hint" onClick={toggleMute}>
          <FaVolumeMute /> {soundHint === 'blocked' ? 'Tarayıcı sesi kapattı — açmak için dokun' : 'Sesi açmak için dokun'}
        </button>
      )}

      {apiFailed && (
        <div className="shorts-banner" role="alert">
          <FaExclamationTriangle className="flex-shrink-0 text-yellow-400" />
          YouTube oynatıcısı yüklenemedi. Ağ bağlantını veya reklam engelleyiciyi kontrol et.
        </div>
      )}

      <div className="shorts-scroller" ref={scrollerRef} role="feed" aria-busy={status === 'loading'} aria-label="Fragman akışı">
        {items.map((item, index) => {
          const distance = index - active;
          const playerMode = distance === 0 ? activeMode : distance === 1 && !manualStart && !apiFailed ? 'preload' : null;
          return (
            <ShortSlide
              key={shortKey(item)}
              item={item}
              index={index}
              isActive={distance === 0}
              playerMode={playerMode}
              showMedia={Math.abs(distance) <= 2}
              muted={muted}
              fill={fill}
              userPaused={distance === 0 && userPaused}
              needsStart={distance === 0 && manualStart && !started}
              genreMap={genreMap}
              isFavorite={actions.isFavorite(item.id, item.media_type)}
              inWatchLater={actions.isWatchLater(item.id, item.media_type)}
              onTogglePause={togglePause}
              onToggleMute={toggleMute}
              onLike={handleLike}
              onToggleFavorite={handleToggleFavorite}
              onToggleWatchLater={handleToggleWatchLater}
              onShare={handleShare}
              onEnded={handleEnded}
              onUnplayable={handleUnplayable}
              onAutoplayBlocked={handleAutoplayBlocked}
            />
          );
        })}

        {(status === 'loading' || status === 'ready') && (
          <StatusSlide loading>
            <Spinner />
            <p className="text-sm text-white/55">{items.length ? 'Yeni sahneler yükleniyor…' : 'Sahneler hazırlanıyor…'}</p>
          </StatusSlide>
        )}
        {(status === 'error' || status === 'stalled') && (
          <StatusSlide>
            <FaExclamationTriangle className="text-2xl text-yellow-400" />
            <p className="text-sm text-white/65">Sahneler yüklenemedi. Bağlantını kontrol edip tekrar dene.</p>
            <button type="button" className="btn btn-primary btn-sm" onClick={retry}><FaRedo className="text-xs" /> Tekrar dene</button>
          </StatusSlide>
        )}
        {(status === 'end' || status === 'empty') && (
          <StatusSlide>
            <p className="text-base font-bold">{items.length ? 'Şimdilik bu kadar' : 'Gösterilecek sahne bulunamadı'}</p>
            <p className="text-sm text-white/55">Biraz sonra yeni fragmanlar eklenecek.</p>
            <div className="flex gap-2">
              {items.length > 0 && <button type="button" className="btn btn-secondary btn-sm" onClick={() => go(0)}>Başa dön</button>}
              <Link to="/movies" className="btn btn-primary btn-sm">Filmlere göz at</Link>
            </div>
          </StatusSlide>
        )}
      </div>

      <div className="shorts-nav">
        <button type="button" className="icon-btn bordered lg" onClick={(event) => { releaseMouseFocus(event); go(active - 1); }} disabled={active === 0} aria-label="Önceki sahne (↑)">
          <FaChevronUp />
        </button>
        <button type="button" className="icon-btn bordered lg" onClick={(event) => { releaseMouseFocus(event); go(active + 1); }} disabled={active >= items.length - (['loading', 'ready'].includes(status) ? 1 : 0)} aria-label="Sonraki sahne (↓)">
          <FaChevronDown />
        </button>
      </div>

      {swipeHint && active === 0 && items.length > 1 && (
        <div className="shorts-swipe-hint" aria-hidden="true">
          <FaChevronUp /> Sonraki sahne için kaydır
        </div>
      )}

      <div className="sr-only" aria-live="polite">{title}</div>
    </div>
  );
};

export default Shorts;
