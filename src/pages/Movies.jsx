import React, { useState, useEffect } from 'react';
import { useSearchParams } from 'react-router-dom';
import { Helmet } from 'react-helmet-async';
import { FaFilter, FaSortAmountDown, FaCalendar, FaStar, FaGlobe } from 'react-icons/fa';
import { movieService, genreService, discoverService } from '../services/tmdb';
import MovieCard from '../components/UI/MovieCard';
import Loading from '../components/UI/Loading';

const Movies = () => {
  const [searchParams, setSearchParams] = useSearchParams();
  const [movies, setMovies] = useState([]);
  const [genres, setGenres] = useState([]);
  const [loading, setLoading] = useState(true);
  const [page, setPage] = useState(1);
  const [totalPages, setTotalPages] = useState(0);
  const [showFilters, setShowFilters] = useState(false);

  // Filter values
  const sort = searchParams.get('sort') || 'popular';
  const genre = searchParams.get('genre') || '';
  const year = searchParams.get('year') || '';
  const rating = searchParams.get('rating') || '';

  useEffect(() => {
    loadGenres();
  }, []);

  useEffect(() => {
    loadMovies();
  }, [sort, genre, year, rating, page]);

  const loadGenres = async () => {
    try {
      const response = await genreService.getMovieList();
      setGenres(response.data.genres);
    } catch (error) {
      console.error('Genre load error:', error);
    }
  };

  const loadMovies = async () => {
    try {
      setLoading(true);
      let response;

      if (sort === 'popular' || sort === 'top_rated' || sort === 'now_playing' || sort === 'upcoming') {
        // Predefined lists
        switch (sort) {
          case 'popular':
            response = await movieService.getPopular(page);
            break;
          case 'top_rated':
            response = await movieService.getTopRated(page);
            break;
          case 'now_playing':
            response = await movieService.getNowPlaying(page);
            break;
          case 'upcoming':
            response = await movieService.getUpcoming(page);
            break;
        }
      } else {
        // Custom discover query
        const params = {
          page,
          sort_by: getSortBy(sort),
          language: 'tr-TR',
          include_adult: false
        };

        if (genre) params.with_genres = genre;
        if (year) params.primary_release_year = year;
        if (rating) params['vote_average.gte'] = rating;

        response = await discoverService.movie(params);
      }

      setMovies(response.data.results);
      setTotalPages(response.data.total_pages);
    } catch (error) {
      console.error('Movies load error:', error);
    } finally {
      setLoading(false);
    }
  };

  const getSortBy = (sort) => {
    const sortMap = {
      'release_date': 'release_date.desc',
      'revenue': 'revenue.desc',
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
        <title>Filmler - SINEFIX</title>
      </Helmet>

      <div className="min-h-screen pt-20">
        <div className="container-custom">
          {/* Header */}
          <div className="flex items-center justify-between mb-8">
            <h1 className="text-3xl font-bold">Filmler</h1>
            <button
              onClick={() => setShowFilters(!showFilters)}
              className="flex items-center space-x-2 px-4 py-2 bg-gray-800 rounded-lg hover:bg-gray-700 transition-colors md:hidden"
            >
              <FaFilter />
              <span>Filtreler</span>
            </button>
          </div>

          <div className="flex gap-8">
            {/* Filters Sidebar */}
            <aside className={`w-full md:w-64 flex-shrink-0 ${showFilters ? 'block' : 'hidden md:block'}`}>
              <div className="bg-gray-900 rounded-lg p-6 space-y-6">
                {/* Sort */}
                <div>
                  <h3 className="font-semibold mb-3 flex items-center">
                    <FaSortAmountDown className="mr-2" />
                    Sıralama
                  </h3>
                  <select
                    value={sort}
                    onChange={(e) => updateFilter('sort', e.target.value)}
                    className="w-full bg-gray-800 border border-gray-700 rounded-lg px-3 py-2 focus:outline-none focus:border-gray-500"
                  >
                    <option value="popular">Popüler</option>
                    <option value="top_rated">En Yüksek Puan</option>
                    <option value="now_playing">Vizyonda</option>
                    <option value="upcoming">Yakında</option>
                    <option value="release_date">En Yeni</option>
                    <option value="revenue">En Çok Hasılat</option>
                    <option value="vote_count">En Çok Oy Alan</option>
                  </select>
                </div>

                {/* Genre Filter */}
                <div>
                  <h3 className="font-semibold mb-3 flex items-center">
                    <FaGlobe className="mr-2" />
                    Tür
                  </h3>
                  <select
                    value={genre}
                    onChange={(e) => updateFilter('genre', e.target.value)}
                    className="w-full bg-gray-800 border border-gray-700 rounded-lg px-3 py-2 focus:outline-none focus:border-gray-500"
                  >
                    <option value="">Tüm Türler</option>
                    {genres.map(g => (
                      <option key={g.id} value={g.id}>{g.name}</option>
                    ))}
                  </select>
                </div>

                {/* Year Filter */}
                <div>
                  <h3 className="font-semibold mb-3 flex items-center">
                    <FaCalendar className="mr-2" />
                    Yıl
                  </h3>
                  <select
                    value={year}
                    onChange={(e) => updateFilter('year', e.target.value)}
                    className="w-full bg-gray-800 border border-gray-700 rounded-lg px-3 py-2 focus:outline-none focus:border-gray-500"
                  >
                    <option value="">Tüm Yıllar</option>
                    {Array.from({ length: 50 }, (_, i) => new Date().getFullYear() - i).map(y => (
                      <option key={y} value={y}>{y}</option>
                    ))}
                  </select>
                </div>

                {/* Rating Filter */}
                <div>
                  <h3 className="font-semibold mb-3 flex items-center">
                    <FaStar className="mr-2" />
                    Minimum Puan
                  </h3>
                  <select
                    value={rating}
                    onChange={(e) => updateFilter('rating', e.target.value)}
                    className="w-full bg-gray-800 border border-gray-700 rounded-lg px-3 py-2 focus:outline-none focus:border-gray-500"
                  >
                    <option value="">Tüm Puanlar</option>
                    <option value="9">9+ Puan</option>
                    <option value="8">8+ Puan</option>
                    <option value="7">7+ Puan</option>
                    <option value="6">6+ Puan</option>
                    <option value="5">5+ Puan</option>
                  </select>
                </div>

                {/* Clear Filters */}
                {(genre || year || rating || sort !== 'popular') && (
                  <button
                    onClick={clearFilters}
                    className="w-full py-2 bg-gray-800 rounded-lg hover:bg-gray-700 transition-colors text-sm"
                  >
                    Filtreleri Temizle
                  </button>
                )}
              </div>
            </aside>

            {/* Movies Grid */}
            <main className="flex-grow">
              {loading ? (
                <Loading fullScreen={false} />
              ) : (
                <>
                  <div className="grid grid-cols-2 sm:grid-cols-3 md:grid-cols-3 lg:grid-cols-4 xl:grid-cols-5 gap-4">
                    {movies.map(movie => (
                      <MovieCard key={movie.id} item={movie} mediaType="movie" />
                    ))}
                  </div>

                  {/* Pagination */}
                  {totalPages > 1 && (
                    <div className="flex justify-center mt-8 space-x-2">
                      <button
                        onClick={() => setPage(Math.max(1, page - 1))}
                        disabled={page === 1}
                        className="px-4 py-2 bg-gray-800 rounded-lg hover:bg-gray-700 disabled:opacity-50 disabled:cursor-not-allowed transition-colors"
                      >
                        Önceki
                      </button>
                      <span className="px-4 py-2">
                        {page} / {totalPages}
                      </span>
                      <button
                        onClick={() => setPage(Math.min(totalPages, page + 1))}
                        disabled={page === totalPages}
                        className="px-4 py-2 bg-gray-800 rounded-lg hover:bg-gray-700 disabled:opacity-50 disabled:cursor-not-allowed transition-colors"
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

export default Movies;
