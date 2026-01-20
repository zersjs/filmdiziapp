import React from 'react';
import { NavLink } from 'react-router-dom';
import { FaHome, FaFilm, FaTv, FaPlay, FaSearch, FaHeart, FaClock, FaUser, FaSignInAlt, FaSignOutAlt } from 'react-icons/fa';
import Logo from '../UI/Logo';
import { useAuth } from '../../contexts/AuthContext';
import MobileBottomNav from './MobileBottomNav';

const Sidebar = () => {
  const { user, signOut, isAuthenticated } = useAuth();

  const navItems = [
    { path: '/', icon: FaHome, label: 'Ana Sayfa' },
    { path: '/movies', icon: FaFilm, label: 'Filmler' },
    { path: '/series', icon: FaTv, label: 'Diziler' },
    { path: '/sahneler', icon: FaPlay, label: 'Sahneler' },
    { path: '/search', icon: FaSearch, label: 'Ara' },
    { path: '/favorites', icon: FaHeart, label: 'Favoriler' },
    { path: '/watch-later', icon: FaClock, label: 'Watchlist' },
  ];

  const handleSignOut = async () => {
    await signOut();
  };

  return (
    <aside className="sidebar">
      <NavLink to="/" className="sidebar-logo">
        <Logo size={28} />
      </NavLink>

      <nav className="sidebar-nav">
        {navItems.map((item) => (
          <NavLink
            key={item.path}
            to={item.path}
            className={({ isActive }) => `sidebar-item ${isActive ? 'active' : ''}`}
            title={item.label}
          >
            <item.icon />
            <span className="sidebar-label">{item.label}</span>
          </NavLink>
        ))}
      </nav>

      <div className="sidebar-auth">
        {isAuthenticated ? (
          <>
            <NavLink
              to={`/profile/${user?.id}`}
              className="sidebar-item"
              title="Profil"
            >
              <FaUser />
              <span className="sidebar-label">{user?.user_metadata?.username || 'Profil'}</span>
            </NavLink>
            <button
              onClick={handleSignOut}
              className="sidebar-item sidebar-logout"
              title="Çıkış Yap"
            >
              <FaSignOutAlt />
              <span className="sidebar-label">Çıkış</span>
            </button>
          </>
        ) : (
          <NavLink
            to="/login"
            className={({ isActive }) => `sidebar-item ${isActive ? 'active' : ''}`}
            title="Giriş Yap"
          >
            <FaSignInAlt />
            <span className="sidebar-label">Giriş Yap</span>
          </NavLink>
        )}
      </div>
    </aside>
  );
};

const Layout = ({ children }) => {
  return (
    <div className="app-layout">
      <Sidebar />
      <main className="main-content">
        {children}
      </main>
      <MobileBottomNav />
    </div>
  );
};

export default Layout;
