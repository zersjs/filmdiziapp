import React, { useCallback, useEffect, useRef, useState } from 'react';
import { Link, useLocation } from 'react-router-dom';
import {
  FaSearch, FaBookmark, FaChevronDown, FaHeart, FaPlay, FaCog, FaArrowRight, FaMagic, FaEye,
} from 'react-icons/fa';
import Logo from '../UI/Logo';
import { useApp } from '../../contexts';
import { indicatorStyle, useIndicator } from '../../hooks/useIndicator';
import { useWatchProviders } from '../../hooks';
import { GENRES, genrePath } from '../../lib/genres';
import { getImageUrl } from '../../services/tmdb';
import { getMediaLabel, getWatchPath, timeAgo } from '../../utils/helpers';
import { MENU_SHORTCUTS, PRIMARY_NAV, activeNavKey } from './navigation';

const isMac = typeof navigator !== 'undefined' && /Mac|iPhone|iPad/.test(navigator.platform || navigator.userAgent);

// Kaydırma durumu: üstteyken saydam, aşağı inince dolu. Mobilde aşağı kaydırırken gizlenir,
// yukarı kaydırınca geri gelir (yön değiştikten sonra 24px eşik; titremeyi önler).
const useHeaderScroll = () => {
  const [state, setState] = useState({ scrolled: false, hidden: false });

  useEffect(() => {
    let lastY = window.scrollY;
    let anchor = lastY;
    let direction = 0;
    let frame = 0;

    const update = () => {
      frame = 0;
      const y = Math.max(window.scrollY, 0);
      const step = Math.sign(y - lastY);
      if (step && step !== direction) {
        direction = step;
        anchor = lastY;
      }
      lastY = y;
      setState(previous => {
        let hidden = previous.hidden;
        if (y < 96) hidden = false;
        else if (direction > 0 && y - anchor > 24) hidden = true;
        else if (direction < 0 && anchor - y > 24) hidden = false;
        const scrolled = y > 12;
        return previous.hidden === hidden && previous.scrolled === scrolled ? previous : { scrolled, hidden };
      });
    };

    const onScroll = () => {
      if (!frame) frame = requestAnimationFrame(update);
    };
    update();
    window.addEventListener('scroll', onScroll, { passive: true });
    return () => {
      window.removeEventListener('scroll', onScroll);
      cancelAnimationFrame(frame);
    };
  }, []);

  // Yapışkan sekmeler başlık gizlenince yukarı kayar (bkz. --sticky-top).
  useEffect(() => {
    document.documentElement.classList.toggle('header-hidden', state.hidden);
  }, [state.hidden]);

  return state;
};

// ---------- Filmler / Diziler açılır menüsü ----------

const MegaMenu = ({ mediaType, onPointerEnter, onPointerLeave }) => {
  const { data: providers = [] } = useWatchProviders(mediaType, 8);
  const base = mediaType === 'tv' ? '/series' : '/movies';
  const label = getMediaLabel(mediaType).toLocaleLowerCase('tr-TR');

  return (
    <div
      id={`menu-${mediaType}`}
      className="mega"
      onPointerEnter={onPointerEnter}
      onPointerLeave={onPointerLeave}
    >
      <div className="container-custom mega-inner">
        <section>
          <p className="mega-label">Keşfet</p>
          <ul className="mega-links">
            {MENU_SHORTCUTS[mediaType].map(item => (
              <li key={item.label}><Link to={`${base}${item.query}`}>{item.label}</Link></li>
            ))}
          </ul>
        </section>
        <section>
          <p className="mega-label">Türler</p>
          <ul className="mega-genres">
            {GENRES[mediaType].map(genre => (
              <li key={genre.id}><Link to={genrePath(mediaType, genre)}>{genre.name}</Link></li>
            ))}
          </ul>
        </section>
        <section>
          <p className="mega-label">Platformlar</p>
          <ul className="mega-providers">
            {providers.map(provider => (
              <li key={provider.provider_id}>
                <Link to={`${base}?provider=${provider.provider_id}`} title={`${provider.provider_name}'teki ${label}ler`}>
                  <img src={getImageUrl(provider.logo_path, 'w92')} alt={provider.provider_name} loading="lazy" />
                </Link>
              </li>
            ))}
          </ul>
          <Link to="/ne-izlesem" className="mega-cta">
            <FaMagic className="text-xs" />
            <span className="min-w-0 flex-1">
              <span className="block font-semibold text-white">Ne izlesem?</span>
              <span className="block text-xs text-white/45">Ruh haline göre öneri al</span>
            </span>
            <FaArrowRight className="text-xs" />
          </Link>
        </section>
      </div>
    </div>
  );
};

// Masaüstü menüsü: seçili/üzerinde durulan bağlantının arkasında kayan bir kutu.
const DesktopNav = ({ pathname, onMenuChange }) => {
  const activeKey = activeNavKey(pathname);
  const [hoverKey, setHoverKey] = useState(null);
  const [openMenu, setOpenMenu] = useState(null);
  const timers = useRef({});
  const pillKey = hoverKey || (openMenu && PRIMARY_NAV.find(item => item.menu === openMenu)?.key) || activeKey;
  const [listRef, rect, animate] = useIndicator(pillKey ? `[data-nav-key="${pillKey}"]` : null);

  useEffect(() => {
    setOpenMenu(null);
    setHoverKey(null);
  }, [pathname]);

  useEffect(() => onMenuChange(!!openMenu), [openMenu, onMenuChange]);

  useEffect(() => () => Object.values(timers.current).forEach(clearTimeout), []);

  useEffect(() => {
    if (!openMenu) return undefined;
    const onKeyDown = (event) => {
      if (event.key !== 'Escape') return;
      const caret = document.querySelector(`[aria-controls="menu-${openMenu}"]`);
      setOpenMenu(null);
      caret?.focus();
    };
    document.addEventListener('keydown', onKeyDown);
    return () => document.removeEventListener('keydown', onKeyDown);
  }, [openMenu]);

  // Fare menüye doğru giderken başka bağlantının üzerinden geçerse menü hemen kapanmasın.
  const openSoon = (menu) => {
    clearTimeout(timers.current.close);
    clearTimeout(timers.current.open);
    timers.current.open = setTimeout(() => setOpenMenu(menu), openMenu ? 60 : 160);
  };
  const closeSoon = () => {
    clearTimeout(timers.current.open);
    clearTimeout(timers.current.close);
    timers.current.close = setTimeout(() => setOpenMenu(null), 200);
  };
  const keepOpen = () => clearTimeout(timers.current.close);

  return (
    <nav className="header-nav" aria-label="Ana menü" onPointerLeave={() => { setHoverKey(null); closeSoon(); }}>
      <div className="header-nav-list" ref={listRef}>
        <span className="nav-pill" style={indicatorStyle(rect, animate)} aria-hidden="true" />
        {PRIMARY_NAV.map(item => {
          const active = activeKey === item.key;
          return (
            <div
              key={item.key}
              className="nav-entry"
              data-nav-key={item.key}
              onPointerEnter={(event) => {
                if (event.pointerType !== 'mouse') return;
                setHoverKey(item.key);
                if (item.menu) openSoon(item.menu);
                else closeSoon();
              }}
            >
              <Link to={item.path} className={`nav-link ${active ? 'active' : ''}`} aria-current={active ? 'page' : undefined}>
                {item.key === 'recommend' && <FaMagic className="text-[11px] opacity-70" />}
                {item.label}
              </Link>
              {item.menu && (
                <button
                  type="button"
                  className={`nav-caret ${openMenu === item.menu ? 'open' : ''}`}
                  aria-expanded={openMenu === item.menu}
                  aria-controls={`menu-${item.menu}`}
                  aria-label={`${item.label} menüsü`}
                  onClick={() => setOpenMenu(current => (current === item.menu ? null : item.menu))}
                >
                  <FaChevronDown />
                </button>
              )}
            </div>
          );
        })}
      </div>
      {openMenu && <MegaMenu key={openMenu} mediaType={openMenu} onPointerEnter={keepOpen} onPointerLeave={closeSoon} />}
    </nav>
  );
};

// ---------- Kitaplık paneli ----------

const SyncStatus = () => {
  const { sync } = useApp();
  if (!sync.enabled) return <p className="text-xs text-white/40">Yalnızca bu cihazda saklanıyor</p>;
  const text = sync.state === 'error'
    ? 'Senkronizasyon hatası'
    : sync.state === 'syncing'
      ? 'Eşitleniyor…'
      : `Eşitlendi${sync.lastSyncedAt ? ` · ${timeAgo(sync.lastSyncedAt)}` : ''}`;
  return (
    <p className="flex items-center gap-2 text-xs text-white/50">
      <span className={`h-1.5 w-1.5 rounded-full ${sync.state === 'error' ? 'bg-red-400' : sync.state === 'syncing' ? 'bg-yellow-300' : 'bg-green-400'}`} />
      {text}
    </p>
  );
};

const LibraryMenu = () => {
  const { state, sync } = useApp();
  const { pathname } = useLocation();
  const [open, setOpen] = useState(false);
  const rootRef = useRef(null);
  const buttonRef = useRef(null);
  const count = state.watchLater.length;
  const recent = state.continueWatching.slice(0, 3);

  useEffect(() => setOpen(false), [pathname]);

  useEffect(() => {
    if (!open) return undefined;
    const onPointerDown = (event) => {
      if (!rootRef.current?.contains(event.target)) setOpen(false);
    };
    const onKeyDown = (event) => {
      if (event.key === 'Escape') {
        setOpen(false);
        buttonRef.current?.focus();
      }
    };
    document.addEventListener('pointerdown', onPointerDown);
    document.addEventListener('keydown', onKeyDown);
    rootRef.current?.querySelector('.popover a')?.focus({ preventScroll: true });
    return () => {
      document.removeEventListener('pointerdown', onPointerDown);
      document.removeEventListener('keydown', onKeyDown);
    };
  }, [open]);

  const stats = [
    { to: '/watch-later', icon: FaBookmark, label: 'İzleme listesi', value: state.watchLater.length },
    { to: '/favorites', icon: FaHeart, label: 'Favoriler', value: state.favorites.length },
    { to: '/izlediklerim', icon: FaEye, label: 'İzlediklerim', value: state.watched.length },
  ];

  const syncColor = sync.state === 'error' ? 'bg-red-400' : sync.state === 'syncing' ? 'bg-yellow-300' : 'bg-green-400';

  return (
    <div className="library-menu" ref={rootRef}>
      <button
        ref={buttonRef}
        type="button"
        className={`icon-btn header-icon ${open ? 'active' : ''}`}
        aria-expanded={open}
        aria-haspopup="dialog"
        aria-label={`Kitaplığım${count ? ` (${count} içerik izleme listesinde)` : ''}`}
        onClick={() => setOpen(value => !value)}
      >
        <FaBookmark />
        {count > 0 && <span className="header-badge">{count > 99 ? '99+' : count}</span>}
        {sync.enabled && <span className={`header-sync-dot ${syncColor}`} aria-hidden="true" />}
      </button>

      {open && (
        <div className="popover library-popover" role="dialog" aria-label="Kitaplığım">
          <div className="mb-3">
            <p className="text-[15px] font-bold">Kitaplığım</p>
            <SyncStatus />
          </div>
          <div className="library-stats">
            {stats.map(({ to, icon: Icon, label, value }) => (
              <Link key={to} to={to} className="library-stat">
                <Icon className="text-xs text-white/45" />
                <strong>{value}</strong>
                <span>{label}</span>
              </Link>
            ))}
          </div>
          {recent.length > 0 && (
            <div className="mt-4">
              <p className="popover-label">İzlemeye devam et</p>
              <ul className="space-y-1">
                {recent.map(item => (
                  <li key={`${item.media_type}-${item.id}`}>
                    <Link to={getWatchPath(item, item.media_type, { season: item.season, episode: item.episode })} className="popover-item">
                      <span className="popover-thumb">
                        {(item.backdrop_path || item.poster_path) && (
                          <img src={getImageUrl(item.backdrop_path || item.poster_path, item.backdrop_path ? 'w300' : 'w154')} alt="" loading="lazy" />
                        )}
                        <FaPlay />
                      </span>
                      <span className="min-w-0">
                        <span className="block truncate text-sm font-semibold">{item.title}</span>
                        <span className="block truncate text-xs text-white/45">
                          {item.media_type === 'tv' && item.season ? `S${item.season} · B${item.episode}` : getMediaLabel(item.media_type)}
                          {item.updatedAt && ` · ${timeAgo(item.updatedAt)}`}
                        </span>
                      </span>
                    </Link>
                  </li>
                ))}
              </ul>
            </div>
          )}
          <Link to="/ayarlar" className="popover-footer">
            <FaCog /> <span className="flex-1">Ayarlar ve senkronizasyon</span> <FaArrowRight className="text-xs" />
          </Link>
        </div>
      )}
    </div>
  );
};

// ---------- Başlık ----------

const SiteHeader = ({ onSearch, immersive }) => {
  const { pathname } = useLocation();
  const { scrolled, hidden } = useHeaderScroll();
  const [menuOpen, setMenuOpen] = useState(false);
  const onMenuChange = useCallback((open) => setMenuOpen(open), []);

  return (
    <header
      className={[
        'site-header',
        scrolled && 'is-scrolled',
        hidden && !menuOpen && 'is-hidden',
        menuOpen && 'menu-open',
        immersive && 'is-immersive',
      ].filter(Boolean).join(' ')}
    >
      <div className="container-custom header-inner">
        <Link to="/" className="header-brand" aria-label="SINEFIX ana sayfa">
          <Logo size={24} />
          <span>SINEFIX</span>
        </Link>

        <DesktopNav pathname={pathname} onMenuChange={onMenuChange} />

        <div className="header-actions">
          <button type="button" className="header-search" onClick={onSearch} aria-label="Ara" aria-keyshortcuts="Control+K /">
            <FaSearch />
            <span className="header-search-text">Film, dizi veya kişi ara</span>
            <kbd className="header-search-kbd">{isMac ? '⌘' : 'Ctrl'} K</kbd>
          </button>
          <LibraryMenu />
        </div>
      </div>
    </header>
  );
};

export default SiteHeader;
