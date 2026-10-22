import React, { useEffect, useState } from 'react';
import { NavLink, useLocation } from 'react-router-dom';
import { FaBars } from 'react-icons/fa';
import { PRIMARY_NAV } from './navigation';
import MobileMenu from './MobileMenu';
import { useApp } from '../../contexts';

const LIBRARY_PATHS = ['/favorites', '/watch-later', '/profile', '/login', '/register', '/sss', '/iletisim'];

const MobileBottomNav = () => {
  const [isMenuOpen, setIsMenuOpen] = useState(false);
  const { pathname } = useLocation();
  const { state } = useApp();
  const libraryCount = state.watchLater.length;
  const menuActive = isMenuOpen || LIBRARY_PATHS.some(path => pathname.startsWith(path));

  useEffect(() => setIsMenuOpen(false), [pathname]);

  return (
    <>
      <nav className="bottom-nav" aria-label="Alt menü">
        {PRIMARY_NAV.map(({ path, icon: Icon, label, end }) => (
          <NavLink key={path} to={path} end={end} className={({ isActive }) => `bottom-nav-item ${isActive ? 'active' : ''}`}>
            <Icon />
            <span className="bottom-nav-label">{label}</span>
          </NavLink>
        ))}
        <button
          type="button"
          className={`bottom-nav-item ${menuActive ? 'active' : ''}`}
          onClick={() => setIsMenuOpen(true)}
          aria-haspopup="dialog"
          aria-expanded={isMenuOpen}
        >
          <FaBars />
          <span className="bottom-nav-label">Menü</span>
          {libraryCount > 0 && <span className="bottom-nav-dot">{libraryCount > 9 ? '9+' : libraryCount}</span>}
        </button>
      </nav>

      <MobileMenu isOpen={isMenuOpen} onClose={() => setIsMenuOpen(false)} />
    </>
  );
};

export default MobileBottomNav;
