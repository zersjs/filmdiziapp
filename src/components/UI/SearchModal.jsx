import React, { useState, useEffect, useRef } from 'react';
import { FaSearch, FaTimes, FaFilm, FaTv, FaStar } from 'react-icons/fa';
import { Link } from 'react-router-dom';
import { LazyLoadImage } from 'react-lazy-load-image-component';
import { searchService, getImageUrl } from '../../services/tmdb';
import { formatRating, getYear, createSlug } from '../../utils/helpers';

const SearchModal = ({ isOpen, onClose }) => {
  const [query, setQuery] = useState('');
  const [results, setResults] = useState([]);
  const [loading, setLoading] = useState(false);
  const [selectedIndex, setSelectedIndex] = useState(-1);
  const inputRef = useRef();
  const resultsRef = useRef();
  const debounceRef = useRef();

  useEffect(() => {
    if (debounceRef.current) {
      clearTimeout(debounceRef.current);
    }

    if (query.trim().length > 2) {
      debounceRef.current = setTimeout(() => {
        performSearch(query.trim());
      }, 300);
    } else {
      setResults([]);
      setLoading(false);
    }

    return () => {
      if (debounceRef.current) {
        clearTimeout(debounceRef.current);
      }
    };
  }, [query]);

  useEffect(() => {
    if (isOpen && inputRef.current) {
      inputRef.current.focus();
    }
  }, [isOpen]);

  useEffect(() => {
    const handleKeyDown = (e) => {
      if (!isOpen) return;

      switch (e.key) {
        case 'Escape':
          onClose();
          break;
        case 'ArrowDown':
          e.preventDefault();
          setSelectedIndex(prev => 
            prev < results.length - 1 ? prev + 1 : prev
          );
          break;
        case 'ArrowUp':
          e.preventDefault();
          setSelectedIndex(prev => prev > 0 ? prev - 1 : -1);
          break;
        case 'Enter':
          e.preventDefault();
          if (selectedIndex >= 0 && results[selectedIndex]) {
            const item = results[selectedIndex];
            const slug = createSlug(item.title || item.name);
            window.location.href = `/${item.media_type}/${item.id}/${slug}`;
          }
          break;
      }
    };

    document.addEventListener('keydown', handleKeyDown);
    return () => document.removeEventListener('keydown', handleKeyDown);
  }, [isOpen, results, selectedIndex, onClose]);

  const performSearch = async (searchQuery) => {
    try {
      setLoading(true);
      const response = await searchService.multi(searchQuery);
      const filteredResults = response.data.results
        .filter(item => item.media_type === 'movie' || item.media_type === 'tv')
        .slice(0, 8);
      setResults(filteredResults);
    } catch (error) {
      console.error('Search error:', error);
      setResults([]);
    } finally {
      setLoading(false);
    }
  };

  const handleResultClick = (item) => {
    const slug = createSlug(item.title || item.name);
    onClose();
    
    window.location.href = `/${item.media_type}/${item.id}/${slug}`;
  };

  if (!isOpen) return null;

  return (
    <div className="fixed inset-0 z-[10000] flex items-start justify-center pt-[10vh] sm:pt-[15vh]">
      <div 
        className="absolute inset-0 bg-black/90 backdrop-blur-xl animate-fade-in"
        onClick={onClose}
      />

      <div className="relative w-full max-w-3xl mx-4 animate-fade-in-up">
        {/* Search header & Input */}
        <div className="relative group">
          <div className="absolute inset-0 bg-white/5 blur-2xl rounded-2xl group-hover:bg-white/10 transition-all duration-500" />
          <div className="relative bg-[#050505] border border-white/10 rounded-2xl shadow-2xl overflow-hidden focus-within:border-white/30 transition-all duration-300">
            <div className="flex items-center px-6 py-5">
              <FaSearch className="text-gray-500 text-xl" />
              <input
                ref={inputRef}
                type="text"
                value={query}
                onChange={(e) => setQuery(e.target.value)}
                placeholder="FİLM, DİZİ VEYA OYUNCU ARA..."
                className="flex-1 bg-transparent border-none text-white placeholder-gray-700 text-sm sm:text-base ml-4 uppercase tracking-[0.2em] focus:outline-none"
              />
              <button
                onClick={onClose}
                className="ml-4 w-8 h-8 flex items-center justify-center rounded-full bg-white/5 text-gray-400 hover:text-white hover:bg-white/10 transition-all"
              >
                <FaTimes className="text-sm" />
              </button>
            </div>

            {/* Content Area */}
            <div className="max-h-[60vh] overflow-y-auto scrollbar-hide border-t border-white/5">
              {loading && (
                <div className="p-20 text-center">
                  <div className="inline-block animate-spin h-8 w-8 border-2 border-white/10 border-t-white rounded-full"></div>
                </div>
              )}

              {!loading && query.trim() === '' && (
                <div className="p-8">
                  <p className="text-[10px] uppercase tracking-[0.3em] text-gray-600 mb-6 font-bold">Popüler Kategoriler</p>
                  <div className="grid grid-cols-2 sm:grid-cols-3 gap-3">
                    {[
                      { name: 'Aksiyon', path: '/genre/movie/28' },
                      { name: 'Korku', path: '/genre/movie/27' },
                      { name: 'Bilim Kurgu', path: '/genre/movie/878' },
                      { name: 'Komedi', path: '/genre/movie/35' },
                      { name: 'Dram', path: '/genre/movie/18' },
                      { name: 'Animasyon', path: '/genre/movie/16' }
                    ].map(cat => (
                      <Link 
                        key={cat.name} 
                        to={cat.path} 
                        onClick={onClose}
                        className="p-4 rounded-xl bg-white/5 border border-white/5 hover:bg-white/10 hover:border-white/20 text-center transition-all group"
                      >
                        <span className="text-[10px] uppercase tracking-widest text-gray-400 group-hover:text-white">{cat.name}</span>
                      </Link>
                    ))}
                  </div>
                </div>
              )}

              {!loading && query.trim().length > 0 && query.trim().length <= 2 && (
                <div className="p-20 text-center">
                  <p className="text-gray-600 uppercase tracking-[0.3em] text-[10px] animate-pulse">
                    En az 3 karakter girin...
                  </p>
                </div>
              )}

              {!loading && results.length === 0 && query.trim().length > 2 && (
                <div className="p-20 text-center">
                  <p className="text-gray-600 uppercase tracking-[0.3em] text-[10px]">
                    "{query}" İÇİN SONUÇ BULUNAMADI
                  </p>
                </div>
              )}

              {!loading && results.length > 0 && (
                <div className="p-3 space-y-2">
                  {results.map((item, index) => (
                    <div
                      key={item.id}
                      onClick={() => handleResultClick(item)}
                      className={`group flex items-center p-3 sm:p-4 rounded-xl cursor-pointer transition-all duration-300 ${
                        selectedIndex === index
                          ? 'bg-white text-black translate-x-2'
                          : 'hover:bg-white/5 text-gray-400'
                      }`}
                    >
                      <div className="flex-shrink-0 w-12 h-18 sm:w-14 sm:h-20 bg-white/5 rounded-lg overflow-hidden shadow-xl border border-white/10">
                        {item.poster_path ? (
                          <LazyLoadImage
                            src={getImageUrl(item.poster_path, 'w92')}
                            alt={item.title || item.name}
                            className={`w-full h-full object-cover transition-all duration-500 ${
                              selectedIndex === index ? 'grayscale-0' : 'grayscale group-hover:grayscale-0'
                            }`}
                          />
                        ) : (
                          <div className="w-full h-full flex items-center justify-center text-xl text-gray-800">
                            {item.media_type === 'movie' ? <FaFilm /> : <FaTv />}
                          </div>
                        )}
                      </div>

                      <div className="flex-1 ml-5 min-w-0">
                        <div className="flex items-center justify-between mb-2">
                          <h3 className={`font-black text-sm sm:text-base uppercase tracking-tight truncate ${
                            selectedIndex === index ? 'text-black' : 'text-white group-hover:text-white'
                          }`}>
                            {item.title || item.name}
                          </h3>
                          <span className={`text-[9px] font-bold uppercase tracking-widest px-2 py-1 rounded bg-black/20 ${
                            selectedIndex === index ? 'bg-black/10 text-black/60' : 'text-gray-500'
                          }`}>
                            {item.media_type === 'movie' ? 'FİLM' : 'DİZİ'}
                          </span>
                        </div>
                        
                        <div className={`flex items-center space-x-4 text-[10px] font-medium uppercase tracking-tighter ${
                          selectedIndex === index ? 'text-black/50' : 'text-gray-500 group-hover:text-gray-400'
                        }`}>
                          <span className="flex items-center gap-1.5 ring-1 ring-inset ring-white/10 px-2 py-0.5 rounded">
                            {getYear(item.release_date || item.first_air_date)}
                          </span>
                          <div className="flex items-center space-x-1.5">
                            <FaStar className={selectedIndex === index ? 'text-black/60' : 'text-gray-600'} />
                            <span className="font-bold">{formatRating(item.vote_average)}</span>
                          </div>
                        </div>
                      </div>
                    </div>
                  ))}
                </div>
              )}
            </div>

            {/* Footer */}
            <div className="p-4 bg-white/5 border-t border-white/5 backdrop-blur-md">
              <div className="flex items-center justify-between pointer-events-none">
                <div className="flex items-center space-x-6 text-[9px] font-bold uppercase tracking-[0.2em] text-gray-500">
                  <span className="flex items-center gap-2"><div className="w-1.5 h-1.5 rounded-full bg-gray-700"/> NAV</span>
                  <span className="flex items-center gap-2"><div className="w-1.5 h-1.5 rounded-full bg-gray-700"/> SELECT</span>
                  <span className="flex items-center gap-2"><div className="w-1.5 h-1.5 rounded-full bg-gray-700"/> CLOSE</span>
                </div>
                <LogoShort />
              </div>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
};

const LogoShort = () => (
  <div className="flex items-center text-[10px] font-black italic tracking-tighter text-gray-700">
    SINEFIX <span className="text-gray-800 ml-1">MXXVI</span>
  </div>
);

export default SearchModal;
