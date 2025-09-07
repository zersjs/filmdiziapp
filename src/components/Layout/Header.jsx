import React, { useState, useEffect } from 'react';
import { Link, useNavigate, useLocation } from 'react-router-dom';
import { FaSearch, FaBars, FaTimes, FaHeart, FaFilm, FaTv, FaHome, FaClock } from 'react-icons/fa';
import { useApp } from '../../contexts';
import { useSearchDebounce, useScrollPosition } from '../../hooks';
import SearchModal from '../UI/SearchModal';

const Header = () => {
  const { state } = useApp();
  const [isOpen, setIsOpen] = useState(false);
  const [searchQuery, setSearchQuery] = useState('');
  const [isSearchModalOpen, setIsSearchModalOpen] = useState(false);
  const navigate = useNavigate();
  const location = useLocation();
  const scrollPosition = useScrollPosition();
  
  const isScrolled = scrollPosition.y > 10;
  const favoritesCount = state.favorites.length;
  const watchLaterCount = state.watchLater.length;

  // Ctrl+K shortcut for search
  useEffect(() => {
    const handleKeyDown = (e) => {
      if ((e.ctrlKey || e.metaKey) && e.key === 'k') {
        e.preventDefault();
        setIsSearchModalOpen(true);
      }
    };

    document.addEventListener('keydown', handleKeyDown);
    return () => document.removeEventListener('keydown', handleKeyDown);
  }, []);



  const handleSearch = (e) => {
    e.preventDefault();
    if (searchQuery.trim()) {
      navigate(`/search?q=${encodeURIComponent(searchQuery)}`);
      setSearchQuery('');
    }
  };

  const navLinks = [
    { path: '/', label: 'Ana Sayfa', icon: <FaHome /> },
    { path: '/movies', label: 'Filmler', icon: <FaFilm /> },
    { path: '/series', label: 'Diziler', icon: <FaTv /> },
    { 
      path: '/favorites', 
      label: 'Favorilerim', 
      icon: <FaHeart />,
      badge: favoritesCount > 0 ? favoritesCount : null
    },
    { 
      path: '/watch-later', 
      label: 'İzleme Listem', 
      icon: <FaClock />,
      badge: watchLaterCount > 0 ? watchLaterCount : null
    },
  ];

  return (
    <header className={`fixed top-0 left-0 right-0 z-[9999] transition-all duration-300 ${
      isScrolled ? 'bg-black/95 backdrop-blur-sm shadow-lg' : 'bg-gradient-to-b from-black to-transparent'
    }`}>
      <div className="container-custom">
        <nav className="flex items-center justify-between h-16">
          {/* Logo */}
          <Link to="/" className="flex items-center space-x-2">
            <span className="text-2xl font-bold tracking-tight">SINE<span className="text-gray-500">FIX</span></span>
          </Link>

          {/* Desktop Navigation */}
          <div className="hidden md:flex items-center space-x-8">
            {navLinks.map((link) => (
              <Link
                key={link.path}
                to={link.path}
                className={`flex items-center space-x-2 transition-colors duration-200 relative ${
                  location.pathname === link.path 
                    ? 'text-white font-medium' 
                    : 'text-gray-400 hover:text-white'
                }`}
              >
                <span className="text-lg relative">
                  {link.icon}
                  {link.badge && (
                    <span className="absolute -top-2 -right-2 bg-red-500 text-white text-xs rounded-full h-5 w-5 flex items-center justify-center">
                      {link.badge > 99 ? '99+' : link.badge}
                    </span>
                  )}
                </span>
                <span>{link.label}</span>
              </Link>
            ))}
          </div>

          {/* Search Button - Opens Modal */}
          <button
            onClick={() => setIsSearchModalOpen(true)}
            className="hidden md:flex items-center space-x-2 px-4 py-2 bg-gray-900 border border-gray-800 rounded-full text-sm text-gray-400 hover:text-white hover:border-gray-600 transition-all duration-200 group"
          >
            <FaSearch className="group-hover:scale-110 transition-transform" />
            <span>Film, dizi ara...</span>
            <kbd className="px-2 py-1 bg-gray-800 rounded text-xs">Ctrl K</kbd>
          </button>

          {/* Mobile Menu Button - Animated Hamburger */}
          <button
            onClick={() => setIsOpen(!isOpen)}
            className="md:hidden relative w-10 h-10 flex items-center justify-center text-white focus:outline-none"
            aria-label="Menu"
          >
            <div className="hamburger-menu">
              <span className={`hamburger-line ${isOpen ? 'rotate-45 translate-y-2' : ''}`}></span>
              <span className={`hamburger-line ${isOpen ? 'opacity-0' : ''}`}></span>
              <span className={`hamburger-line ${isOpen ? '-rotate-45 -translate-y-2' : ''}`}></span>
            </div>
          </button>
        </nav>

        {/* Mobile Menu Overlay */}
        <div className={`md:hidden fixed inset-0 top-16 z-50 transition-all duration-300 ${
          isOpen ? 'opacity-100 visible' : 'opacity-0 invisible'
        }`}>
          {/* Backdrop */}
          <div 
            className={`absolute inset-0 bg-black/50 backdrop-blur-sm transition-opacity duration-300 ${
              isOpen ? 'opacity-100' : 'opacity-0'
            }`}
            onClick={() => setIsOpen(false)}
          ></div>
          
          {/* Menu Content */}
          <div className={`relative bg-black/95 backdrop-blur-md border-t border-gray-800 shadow-2xl transform transition-all duration-300 ${
            isOpen ? 'translate-y-0' : '-translate-y-full'
          }`}>
            <div className="px-6 py-6 space-y-6">
              {/* Mobile Search Button */}
              <button
                onClick={() => {
                  setIsSearchModalOpen(true);
                  setIsOpen(false);
                }}
                className="w-full flex items-center space-x-3 p-4 bg-gray-800/50 rounded-xl border border-gray-700 hover:bg-gray-700/50 transition-all duration-200"
              >
                <FaSearch className="text-gray-400" />
                <span className="text-gray-300">Film, dizi ara...</span>
              </button>

              {/* Mobile Nav Links */}
              <div className="space-y-2">
                {navLinks.map((link, index) => (
                  <Link
                    key={link.path}
                    to={link.path}
                    onClick={() => setIsOpen(false)}
                    className={`mobile-nav-link group flex items-center justify-between p-4 rounded-xl transition-all duration-200 ${
                      location.pathname === link.path 
                        ? 'bg-gradient-to-r from-red-500/20 to-orange-500/20 text-white border border-red-500/30' 
                        : 'text-gray-300 hover:text-white hover:bg-gray-800/50'
                    }`}
                    style={{ animationDelay: `${index * 50}ms` }}
                  >
                    <div className="flex items-center space-x-4">
                      <div className="relative">
                        <span className="text-xl">{link.icon}</span>
                        {link.badge && (
                          <span className="absolute -top-2 -right-2 bg-red-500 text-white text-xs rounded-full h-5 w-5 flex items-center justify-center animate-pulse">
                            {link.badge > 99 ? '99+' : link.badge}
                          </span>
                        )}
                      </div>
                      <span className="font-medium text-lg">{link.label}</span>
                    </div>
                    
                    {location.pathname === link.path && (
                      <div className="w-2 h-2 bg-red-500 rounded-full animate-pulse"></div>
                    )}
                  </Link>
                ))}
              </div>

              {/* Mobile Menu Footer */}
              <div className="pt-4 border-t border-gray-800">
                <div className="text-center text-gray-500 text-sm">
                  <span className="font-bold text-white">SINE<span className="text-gray-500">FIX</span></span>
                  <p className="mt-1">Premium Film & Dizi Deneyimi</p>
                </div>
              </div>
            </div>
          </div>
        </div>
      </div>

      {/* Search Modal */}
      <SearchModal 
        isOpen={isSearchModalOpen} 
        onClose={() => setIsSearchModalOpen(false)} 
      />
    </header>
  );
};

export default Header;
