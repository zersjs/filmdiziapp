import React, { useState, useEffect } from 'react';
import { useLocation } from 'react-router-dom';
import { Helmet } from 'react-helmet-async';
import { searchService } from '../services/tmdb';
import { useSearchDebounce, useApi } from '../hooks';
import { useToast } from '../components/UI/Toast';
import MovieCard from '../components/UI/MovieCard';
import { SkeletonList } from '../components/UI/Loading';

const Search = () => {
  const location = useLocation();
  const { toast } = useToast();
  const [currentQuery, setCurrentQuery] = useState(new URLSearchParams(location.search).get('q') || '');

  // API hook ile arama
  const { data: searchData, loading, execute: performSearch } = useApi(
    (query) => searchService.multi(query),
    [],
    {
      immediate: false,
      onError: () => toast.error('Arama sırasında hata oluştu')
    }
  );

  useEffect(() => {
    const searchQuery = new URLSearchParams(location.search).get('q');
    if (searchQuery && searchQuery !== currentQuery) {
      setCurrentQuery(searchQuery);
      performSearch(searchQuery);
    }
  }, [location.search, currentQuery, performSearch]);

  const results = searchData?.results || [];
  const filteredResults = results.filter(result => result.media_type === 'movie' || result.media_type === 'tv');

  return (
    <>
      <Helmet>
        <title>SINEFIX - "{currentQuery}" İçin Arama Sonuçları</title>
      </Helmet>

      <div className="min-h-screen pt-20">
        <div className="container-custom">
          <div className="mb-8">
            <h1 className="text-3xl font-bold">
              "{currentQuery}" için arama sonuçları
            </h1>
            <p className="text-gray-400 mt-2">
              {loading ? 'Aranıyor...' : `${filteredResults.length} sonuç bulundu`}
            </p>
          </div>

          {loading ? (
            <SkeletonList count={12} />
          ) : (
            <div className="movie-grid">
              {filteredResults.map(result => (
                <MovieCard key={result.id} item={result} mediaType={result.media_type} />
              ))}
            </div>
          )}
          
          {!loading && filteredResults.length === 0 && currentQuery && (
            <div className="text-center py-20">
              <p className="text-gray-400 text-lg">Aradığınız içerik bulunamadı.</p>
              <p className="text-gray-500 text-sm mt-2">Farklı anahtar kelimeler deneyebilirsiniz.</p>
            </div>
          )}
        </div>
      </div>
    </>
  );
};

export default Search;
