import React, { useEffect, useState } from 'react';
import { NavLink, useLocation } from 'react-router-dom';
import { FaBars } from 'react-icons/fa';
import { PRIMARY_NAV, activeNavKey } from './navigation';
import MobileMenu from './MobileMenu';
import { useApp } from '../../contexts';
import { useIndicator } from '../../hooks/useIndicator';

const MENU_PATHS = ['/favorites', '/watch-later', '/izlediklerim', '/ayarlar', '/search', '/sss', '/iletisim', '/ne-izlesem'];
const ITEMS = PRIMARY_NAV.filter(item => !item.desktopOnly);
const PILL_WIDTH = 56;

const MobileBottomNav = () => {
  const [isMenuOpen, setIsMenuOpen] = useState(false);
  const { pathname } = useLocation();
  const { state } = useApp();
  const libraryCount = state.watchLater.length;
  const menuActive = isMenuOpen || MENU_PATHS.some(path => pathname.startsWith(path));
  const activeKey = menuActive ? 'menu' : activeNavKey(pathname);
  // Simgenin arkasındaki kutu seçili sekmeye kayar
  const [navRef, rect, animate] = useIndicator(activeKey ? `[data-tab-key="${activeKey}"]` : null);

  useEffect(() => setIsMenuOpen(false), [pathname]);

  return (
    <>
      <nav className="bottom-nav" aria-label="Alt menü" ref={navRef}>
        <span
          className="bottom-nav-pill"
          aria-hidden="true"
          style={rect ? {
            transform: `translate3d(${rect.x + (rect.width - PILL_WIDTH) / 2}px, 0, 0)`,
            transition: animate ? undefined : 'none',
            opacity: 1,
          } : { opacity: 0 }}
        />
        {ITEMS.map(({ key, path, icon: Icon, label }) => (
          <NavLink
            key={key}
            to={path}
            data-tab-key={key}
            className={`bottom-nav-item ${activeKey === key ? 'active' : ''}`}
            aria-current={activeKey === key ? 'page' : undefined}
          >
            <Icon />
            <span className="bottom-nav-label">{label}</span>
          </NavLink>
        ))}
        <button
          type="button"
          data-tab-key="menu"
          className={`bottom-nav-item ${activeKey === 'menu' ? 'active' : ''}`}
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
