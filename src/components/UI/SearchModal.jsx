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

  // Manual debounce implementation
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

  // Focus input when modal opens
  useEffect(() => {
    if (isOpen && inputRef.current) {
      inputRef.current.focus();
    }
  }, [isOpen]);

  // Keyboard navigation
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
    // Navigate to detail page with slug
    window.location.href = `/${item.media_type}/${item.id}/${slug}`;
  };

  if (!isOpen) return null;

  return (
    <div className="fixed inset-0 z-[10000] flex items-start justify-center pt-20">
      {/* Backdrop */}
      <div 
        className="absolute inset-0 bg-black/80 backdrop-blur-sm"
        onClick={onClose}
      />

      {/* Modal */}
      <div className="relative w-full max-w-2xl mx-4 bg-gray-900 rounded-2xl shadow-2xl border border-gray-700 overflow-hidden">
        {/* Search Input */}
        <div className="relative p-6 border-b border-gray-700">
          <div className="relative">
            <FaSearch className="absolute left-4 top-1/2 transform -translate-y-1/2 text-gray-400 text-lg" />
            <input
              ref={inputRef}
              type="text"
              value={query}
              onChange={(e) => setQuery(e.target.value)}
              placeholder="Film, dizi ara... (En az 3 karakter)"
              className="w-full pl-12 pr-12 py-4 bg-gray-800 border border-gray-600 rounded-xl text-white placeholder-gray-400 focus:outline-none focus:border-blue-500 focus:ring-2 focus:ring-blue-500/20 transition-all duration-200"
            />
            <button
              onClick={onClose}
              className="absolute right-4 top-1/2 transform -translate-y-1/2 text-gray-400 hover:text-white transition-colors"
            >
              <FaTimes className="text-lg" />
            </button>
          </div>
        </div>

        {/* Results */}
        <div className="max-h-96 overflow-y-auto" ref={resultsRef}>
          {loading && (
            <div className="p-8 text-center">
              <div className="inline-block animate-spin rounded-full h-8 w-8 border-b-2 border-white"></div>
              <p className="mt-2 text-gray-400">Aranıyor...</p>
            </div>
          )}

          {!loading && query.trim().length > 0 && query.trim().length <= 2 && (
            <div className="p-8 text-center text-gray-400">
              <FaSearch className="mx-auto text-4xl mb-4 opacity-50" />
              <p>Arama yapmak için en az 3 karakter girin</p>
            </div>
          )}

          {!loading && results.length === 0 && query.trim().length > 2 && (
            <div className="p-8 text-center text-gray-400">
              <FaSearch className="mx-auto text-4xl mb-4 opacity-50" />
              <p>"{query}" için sonuç bulunamadı</p>
              <p className="text-sm mt-2">Farklı anahtar kelimeler deneyin</p>
            </div>
          )}

          {!loading && results.length > 0 && (
            <div className="p-4">
              <p className="text-sm text-gray-400 mb-4 px-2">
                {results.length} sonuç bulundu
              </p>
              <div className="space-y-2">
                {results.map((item, index) => (
                  <div
                    key={item.id}
                    onClick={() => handleResultClick(item)}
                    className={`flex items-center p-3 rounded-xl cursor-pointer transition-all duration-200 ${
                      selectedIndex === index
                        ? 'bg-blue-600/20 border border-blue-500/30'
                        : 'hover:bg-gray-800 border border-transparent'
                    }`}
                  >
                    {/* Poster */}
                    <div className="flex-shrink-0 w-12 h-16 rounded-lg overflow-hidden bg-gray-800">
                      {item.poster_path ? (
                        <LazyLoadImage
                          src={getImageUrl(item.poster_path, 'w92')}
                          alt={item.title || item.name}
                          className="w-full h-full object-cover"
                        />
                      ) : (
                        <div className="w-full h-full flex items-center justify-center text-gray-500">
                          {item.media_type === 'movie' ? <FaFilm /> : <FaTv />}
                        </div>
                      )}
                    </div>

                    {/* Info */}
                    <div className="flex-1 ml-4 min-w-0">
                      <div className="flex items-center space-x-2 mb-1">
                        <h3 className="font-semibold text-white truncate">
                          {item.title || item.name}
                        </h3>
                        <span className={`px-2 py-1 text-xs rounded-full ${
                          item.media_type === 'movie' 
                            ? 'bg-blue-500/20 text-blue-400' 
                            : 'bg-green-500/20 text-green-400'
                        }`}>
                          {item.media_type === 'movie' ? 'Film' : 'Dizi'}
                        </span>
                      </div>
                      
                      <div className="flex items-center space-x-4 text-sm text-gray-400">
                        <span>{getYear(item.release_date || item.first_air_date)}</span>
                        <div className="flex items-center space-x-1">
                          <FaStar className="text-yellow-400 text-xs" />
                          <span>{formatRating(item.vote_average)}</span>
                        </div>
                      </div>
                    </div>

                    {/* Arrow */}
                    <div className="flex-shrink-0 text-gray-400">
                      <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 5l7 7-7 7" />
                      </svg>
                    </div>
                  </div>
                ))}
              </div>
            </div>
          )}
        </div>

        {/* Footer */}
        <div className="p-4 border-t border-gray-700 bg-gray-800/50">
          <div className="flex items-center justify-between text-sm text-gray-400">
            <div className="flex items-center space-x-4">
              <span>↑↓ Gezin</span>
              <span>Enter Seç</span>
              <span>Esc Kapat</span>
            </div>
            <span>SINEFIX Arama</span>
          </div>
        </div>
      </div>
    </div>
  );
};

export default SearchModal;