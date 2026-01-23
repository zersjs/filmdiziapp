import React, { useState } from 'react';
import { NavLink } from 'react-router-dom';
import { FaHome, FaFilm, FaTv, FaBars, FaPlay } from 'react-icons/fa';
import MobileMenu from './MobileMenu';

const MobileBottomNav = () => {
  const [isMenuOpen, setIsMenuOpen] = useState(false);

  const navItems = [
    { path: '/', icon: FaHome, label: 'Ana Sayfa' },
    { path: '/movies', icon: FaFilm, label: 'Filmler' },
    { path: '/series', icon: FaTv, label: 'Diziler' },
    { path: '/sahneler', icon: FaPlay, label: 'Sahneler', special: true },
  ];

  return (
    <>
      <div className="mobile-bottom-nav">
        {navItems.map((item) => (
          <NavLink
            key={item.path}
            to={item.path}
            className={({ isActive }) => 
              `mobile-nav-item ${isActive ? 'active' : ''} ${item.special ? 'special-shorts' : ''}`
            }
          >
            <div className={item.special ? 'shorts-icon-wrapper' : ''}>
              <item.icon />
            </div>
            <span className="mobile-nav-label">{item.label}</span>
          </NavLink>
        ))}
        <button 
          className={`mobile-nav-item ${isMenuOpen ? 'active' : ''}`}
          onClick={() => setIsMenuOpen(true)}
        >
          <FaBars />
          <span className="mobile-nav-label">Menü</span>
        </button>
      </div>

      <MobileMenu isOpen={isMenuOpen} onClose={() => setIsMenuOpen(false)} />
    </>
  );
};

export default MobileBottomNav;
