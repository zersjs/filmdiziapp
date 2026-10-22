import React, { useCallback, useEffect, useState } from 'react';
import { Link, NavLink, useLocation } from 'react-router-dom';
import { FaSearch, FaHeart, FaBookmark, FaCog } from 'react-icons/fa';
import Logo from '../UI/Logo';
import SearchModal from '../UI/SearchModal';
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
  const [searchOpen, setSearchOpen] = useState(false);
  const immersive = pathname.startsWith('/sahneler');

  const openSearch = useCallback(() => setSearchOpen(true), []);
  const closeSearch = useCallback(() => setSearchOpen(false), []);

  useEffect(() => {
    const onKeyDown = (event) => {
      if ((event.ctrlKey || event.metaKey) && event.key.toLowerCase() === 'k') {
        event.preventDefault();
        setSearchOpen(open => !open);
      } else if (event.key === '/' && !['INPUT', 'TEXTAREA', 'SELECT'].includes(document.activeElement?.tagName)) {
        event.preventDefault();
        setSearchOpen(true);
      }
    };
    document.addEventListener('keydown', onKeyDown);
    return () => document.removeEventListener('keydown', onKeyDown);
  }, []);

  useEffect(() => {
    setSearchOpen(false);
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
    </div>
  );
};

export default Layout;
