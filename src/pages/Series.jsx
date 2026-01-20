import React, { useState, useEffect } from 'react';
import { useSearchParams } from 'react-router-dom';
import { Helmet } from 'react-helmet-async';
import { FaFilter, FaSortAmountDown, FaCalendar, FaStar, FaGlobe } from 'react-icons/fa';
import { tvService, genreService, discoverService } from '../services/tmdb';
import MovieCard from '../components/UI/MovieCard';
import Loading from '../components/UI/Loading';

const Series = () => {
  const [searchParams, setSearchParams] = useSearchParams();
  const [series, setSeries] = useState([]);
  const [genres, setGenres] = useState([]);
  const [loading, setLoading] = useState(true);
  const [page, setPage] = useState(1);
  const [totalPages, setTotalPages] = useState(0);
  const [showFilters, setShowFilters] = useState(false);

  const sort = searchParams.get('sort') || 'popular';
  const genre = searchParams.get('genre') || '';
  const year = searchParams.get('year') || '';
  const rating = searchParams.get('rating') || '';

  useEffect(() => {
    loadGenres();
  }, []);

  useEffect(() => {
    loadSeries();
  }, [sort, genre, year, rating, page]);

  const loadGenres = async () => {
    try {
      const response = await genreService.getTvList();
      setGenres(response.data.genres);
    } catch (error) {
      console.error('Genre load error:', error);
    }
  };

  const loadSeries = async () => {
    try {
      setLoading(true);
      let response;

      if (sort === 'popular' || sort === 'top_rated' || sort === 'on_the_air' || sort === 'airing_today') {
        
        switch (sort) {
          case 'popular':
            response = await tvService.getPopular(page);
            break;
          case 'top_rated':
            response = await tvService.getTopRated(page);
            break;
          case 'on_the_air':
            response = await tvService.getOnTheAir(page);
            break;
          case 'airing_today':
            response = await tvService.getAiringToday(page);
            break;
        }
      } else {
        
        const params = {
          page,
          sort_by: getSortBy(sort),
          language: 'tr-TR',
          include_adult: false
        };

        if (genre) params.with_genres = genre;
        if (year) params.first_air_date_year = year;
        if (rating) params['vote_average.gte'] = rating;

        response = await discoverService.tv(params);
      }

      setSeries(response.data.results);
      setTotalPages(response.data.total_pages);
    } catch (error) {
      console.error('Series load error:', error);
    } finally {
      setLoading(false);
    }
  };

  const getSortBy = (sort) => {
    const sortMap = {
      'first_air_date': 'first_air_date.desc',
      'popularity': 'popularity.desc',
      'vote_average': 'vote_average.desc',
      'vote_count': 'vote_count.desc'
    };
    return sortMap[sort] || 'popularity.desc';
  };

  const updateFilter = (key, value) => {
    const params = new URLSearchParams(searchParams);
    if (value) {
      params.set(key, value);
    } else {
      params.delete(key);
    }
    setSearchParams(params);
    setPage(1);
  };

  const clearFilters = () => {
    setSearchParams({ sort: 'popular' });
    setPage(1);
  };

  return (
    <>
      <Helmet>
        <title>Diziler - SINEFIX</title>
      </Helmet>

      <div className="min-h-screen pt-20">
        <div className="container-custom">
          <div className="flex items-center justify-between mb-8">
            <h1 className="text-3xl font-bold">Diziler</h1>
            <button
              onClick={() => setShowFilters(!showFilters)}
              className="flex items-center space-x-2 px-4 py-2 bg-gray-800 rounded-lg hover:bg-gray-700 transition-colors md:hidden"
            >
              <FaFilter />
              <span>Filtreler</span>
            </button>
          </div>

          <div className="flex gap-8">
            <aside className={`w-full md:w-64 flex-shrink-0 ${showFilters ? 'block' : 'hidden md:block'}`}>
              <div className="bg-[#0a0a0a] border border-[#1a1a1a] rounded-lg p-6 space-y-6">
                <div>
                  <h3 className="font-semibold mb-3 flex items-center text-sm uppercase tracking-wider text-gray-400">
                    <FaSortAmountDown className="mr-2" />
                    Sıralama
                  </h3>
                  <select
                    value={sort}
                    onChange={(e) => updateFilter('sort', e.target.value)}
                    className="w-full bg-black border border-[#222] text-white rounded px-3 py-2 text-sm focus:outline-none focus:border-gray-500"
                  >
                    <option value="popular">Popüler</option>
                    <option value="top_rated">En Yüksek Puan</option>
                    <option value="on_the_air">Yayında</option>
                    <option value="airing_today">Bugün</option>
                    <option value="first_air_date">En Yeni</option>
                    <option value="vote_count">En Çok Oy Alan</option>
                  </select>
                </div>

                <div>
                  <h3 className="font-semibold mb-3 flex items-center text-sm uppercase tracking-wider text-gray-400">
                    <FaGlobe className="mr-2" />
                    Tür
                  </h3>
                  <select
                    value={genre}
                    onChange={(e) => updateFilter('genre', e.target.value)}
                    className="w-full bg-black border border-[#222] text-white rounded px-3 py-2 text-sm focus:outline-none focus:border-gray-500"
                  >
                    <option value="">Tüm Türler</option>
                    {genres.map((g) => (
                      <option key={g.id} value={g.id}>{g.name}</option>
                    ))}
                  </select>
                </div>

                <div>
                  <h3 className="font-semibold mb-3 flex items-center text-sm uppercase tracking-wider text-gray-400">
                    <FaCalendar className="mr-2" />
                    Yıl
                  </h3>
                  <select
                    value={year}
                    onChange={(e) => updateFilter('year', e.target.value)}
                    className="w-full bg-black border border-[#222] text-white rounded px-3 py-2 text-sm focus:outline-none focus:border-gray-500"
                  >
                    <option value="">Tüm Yıllar</option>
                    {Array.from({ length: 50 }, (_, i) => new Date().getFullYear() - i).map((y) => (
                      <option key={y} value={y}>{y}</option>
                    ))}
                  </select>
                </div>

                <div>
                  <h3 className="font-semibold mb-3 flex items-center text-sm uppercase tracking-wider text-gray-400">
                    <FaStar className="mr-2" />
                    Puan
                  </h3>
                  <select
                    value={rating}
                    onChange={(e) => updateFilter('rating', e.target.value)}
                    className="w-full bg-black border border-[#222] text-white rounded px-3 py-2 text-sm focus:outline-none focus:border-gray-500"
                  >
                    <option value="">Tüm Puanlar</option>
                    <option value="9">9+ Puan</option>
                    <option value="8">8+ Puan</option>
                    <option value="7">7+ Puan</option>
                    <option value="6">6+ Puan</option>
                    <option value="5">5+ Puan</option>
                  </select>
                </div>

                {(genre || year || rating || sort !== 'popular') && (
                  <button
                    onClick={clearFilters}
                    className="w-full py-2 text-xs uppercase tracking-widest text-gray-500 hover:text-white transition-colors border border-[#222] rounded"
                  >
                    Filtreleri Temizle
                  </button>
                )}
              </div>
            </aside>

            <main className="flex-grow">
              {loading ? (
                <Loading fullScreen={false} />
              ) : (
                <>
                  <div className="movie-grid">
                    {series.map(s => (
                      <MovieCard key={s.id} item={s} mediaType="tv" />
                    ))}
                  </div>

                  {totalPages > 1 && (
                    <div className="flex justify-center mt-12 space-x-2">
                      <button
                        onClick={() => setPage(Math.max(1, page - 1))}
                        disabled={page === 1}
                        className="btn-secondary"
                      >
                        Önceki
                      </button>
                      <span className="flex items-center px-4 font-medium">
                        {page} / {Math.min(totalPages, 500)}
                      </span>
                      <button
                        onClick={() => setPage(Math.min(totalPages, page + 1))}
                        disabled={page === totalPages}
                        className="btn-secondary"
                      >
                        Sonraki
                      </button>
                    </div>
                  )}
                </>
              )}
            </main>
          </div>
        </div>
      </div>
    </>
  );
};

export default Series;
