import React, { useCallback, useEffect, useRef, useState } from 'react';
import { Link, NavLink, useLocation, useNavigate } from 'react-router-dom';
import { FaSearch, FaHeart, FaBookmark, FaCog } from 'react-icons/fa';
import Logo from '../UI/Logo';
import SearchModal from '../UI/SearchModal';
import ShortcutsModal, { GO_SHORTCUTS } from '../UI/ShortcutsModal';
import { isTypingTarget } from '../../utils/dom';
import { useApp } from '../../contexts';
import MobileBottomNav from './MobileBottomNav';
import Footer from './Footer';
import { PRIMARY_NAV } from './navigation';

// Senkronizasyon açıksa ayarlar ikonunda küçük bir durum noktası gösterilir.
const SyncDot = ({ className = '' }) => {
  const { sync } = useApp();
  if (!sync.enabled) return null;
  const color = sync.state === 'error' ? 'bg-red-400' : sync.state === 'syncing' ? 'bg-yellow-300' : 'bg-green-400';
  return <span className={`absolute h-2 w-2 rounded-full ring-2 ring-[#080808] ${color} ${className}`} aria-hidden="true" />;
};

const Sidebar = ({ onSearch }) => {
  const { state } = useApp();

  const libraryNav = [
    { path: '/watch-later', icon: FaBookmark, label: 'İzleme Listem', count: state.watchLater.length },
    { path: '/favorites', icon: FaHeart, label: 'Favorilerim', count: state.favorites.length },
  ];

  return (
    <aside className="sidebar" aria-label="Ana menü">
      <Link to="/" className="sidebar-logo" aria-label="SINEFIX ana sayfa">
        <Logo size={24} className="flex-shrink-0" />
        <span className="sidebar-brand">SINEFIX</span>
      </Link>

      <nav className="sidebar-nav">
        {PRIMARY_NAV.map(({ path, icon: Icon, label, end }) => (
          <NavLink key={path} to={path} end={end} className={({ isActive }) => `sidebar-item ${isActive ? 'active' : ''}`} title={label}>
            <Icon />
            <span className="sidebar-label">{label}</span>
          </NavLink>
        ))}
        <button type="button" onClick={onSearch} className="sidebar-item" title="Ara (Ctrl+K)">
          <FaSearch />
          <span className="sidebar-label">Ara</span>
          <kbd className="sidebar-label ml-auto mr-3">Ctrl K</kbd>
        </button>

        <div className="my-3 h-px bg-[#141414]" />

        {libraryNav.map(({ path, icon: Icon, label, count }) => (
          <NavLink key={path} to={path} className={({ isActive }) => `sidebar-item ${isActive ? 'active' : ''}`} title={label}>
            <Icon />
            <span className="sidebar-label">{label}</span>
            {count > 0 && <span className="sidebar-badge sidebar-label">{count > 99 ? '99+' : count}</span>}
          </NavLink>
        ))}
      </nav>

      <div className="sidebar-footer">
        <NavLink to="/ayarlar" className={({ isActive }) => `sidebar-item ${isActive ? 'active' : ''}`} title="Kitaplık ve senkronizasyon">
          <span className="relative flex flex-shrink-0">
            <FaCog />
            <SyncDot className="-right-1 -top-1" />
          </span>
          <span className="sidebar-label">Ayarlar</span>
        </NavLink>
      </div>
    </aside>
  );
};

const TopBar = ({ onSearch }) => {
  const [scrolled, setScrolled] = useState(false);

  useEffect(() => {
    const onScroll = () => setScrolled(window.scrollY > 8);
    onScroll();
    window.addEventListener('scroll', onScroll, { passive: true });
    return () => window.removeEventListener('scroll', onScroll);
  }, []);

  return (
    <header className={`topbar ${scrolled ? 'scrolled' : ''}`}>
      <div className="topbar-inner container-custom">
        <Link to="/" className="topbar-brand" aria-label="SINEFIX ana sayfa">
          <Logo size={22} />
          SINEFIX
        </Link>
        <div className="topbar-actions">
          <button type="button" onClick={onSearch} className="icon-btn" aria-label="Ara">
            <FaSearch />
          </button>
          <Link to="/ayarlar" className="icon-btn relative" aria-label="Kitaplık ve senkronizasyon">
            <FaCog />
            <SyncDot className="right-[8px] top-[8px]" />
          </Link>
        </div>
      </div>
    </header>
  );
};

const Layout = ({ children }) => {
  const { pathname } = useLocation();
  const navigate = useNavigate();
  // Arama penceresi açıldığı adrese bağlıdır: geri/ileri ile başka sayfaya geçilince kapanır,
  // ama sayfa geçişi sürerken (tembel yüklenen sayfa) açılırsa geçiş bitince kapanmaz.
  const [searchFor, setSearchFor] = useState(null);
  const searchOpen = searchFor !== null;
  const [shortcutsOpen, setShortcutsOpen] = useState(false);
  const goPending = useRef(0);
  const immersive = pathname.startsWith('/sahneler');

  const openSearch = useCallback(() => setSearchFor(window.location.pathname), []);
  const closeSearch = useCallback(() => setSearchFor(null), []);

  // Yakalama aşamasında dinlenir: "g" ile başlayan bir kısayolun ikinci tuşu
  // sayfaların kendi kısayollarına (ör. Sahneler'de "k") ulaşmadan tüketilir.
  useEffect(() => {
    const onKeyDown = (event) => {
      if ((event.ctrlKey || event.metaKey) && event.key.toLowerCase() === 'k') {
        event.preventDefault();
        setSearchFor(current => (current === null ? window.location.pathname : null));
        return;
      }
      if (event.ctrlKey || event.metaKey || event.altKey || isTypingTarget(event.target)) return;
      if (document.querySelector('[aria-modal="true"]')) return;

      if (goPending.current && Date.now() - goPending.current < 1200) {
        goPending.current = 0;
        const target = GO_SHORTCUTS[event.key.toLowerCase()];
        if (target) {
          event.preventDefault();
          event.stopPropagation();
          navigate(target.path);
        }
        return;
      }
      if (event.key === 'g') {
        goPending.current = Date.now();
      } else if (event.key === '/') {
        event.preventDefault();
        openSearch();
      } else if (event.key === '?') {
        event.preventDefault();
        setShortcutsOpen(true);
      }
    };
    document.addEventListener('keydown', onKeyDown, true);
    return () => document.removeEventListener('keydown', onKeyDown, true);
  }, [navigate, openSearch]);

  useEffect(() => {
    setSearchFor(current => (current !== null && current !== pathname ? null : current));
  }, [pathname]);

  return (
    <div className="app-layout">
      <a href="#main" className="sr-only focus:not-sr-only focus:fixed focus:left-4 focus:top-4 focus:z-[11000] focus:rounded-lg focus:bg-white focus:px-4 focus:py-2 focus:text-black">
        İçeriğe geç
      </a>
      <Sidebar onSearch={openSearch} />
      <div className="main-content">
        {!immersive && <TopBar onSearch={openSearch} />}
        <main id="main" className="main-content-inner">
          {children}
        </main>
        {!immersive && <Footer />}
      </div>
      <MobileBottomNav />
      <SearchModal isOpen={searchOpen} onClose={closeSearch} />
      <ShortcutsModal isOpen={shortcutsOpen} onClose={() => setShortcutsOpen(false)} />
    </div>
  );
};

export default Layout;
