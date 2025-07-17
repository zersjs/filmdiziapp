import React, { useState, useEffect } from 'react';
import { useParams } from 'react-router-dom';
import { Helmet } from 'react-helmet-async';
import { discoverService, genreService } from '../services/tmdb';
import MovieCard from '../components/UI/MovieCard';
import Loading from '../components/UI/Loading';

const Genre = () => {
  const { type, id } = useParams();
  const [items, setItems] = useState([]);
  const [genreName, setGenreName] = useState('');
  const [loading, setLoading] = useState(true);
  const [page, setPage] = useState(1);
  const [totalPages, setTotalPages] = useState(0);

  useEffect(() => {
    loadGenreName();
  }, [type, id]);

  useEffect(() => {
    loadItems();
  }, [type, id, page]);

  const loadGenreName = async () => {
    try {
      const response = type === 'movie' 
        ? await genreService.getMovieList()
        : await genreService.getTvList();
      
      const genre = response.data.genres.find(g => g.id === parseInt(id));
      if (genre) {
        setGenreName(genre.name);
      }
    } catch (error) {
      console.error('Genre name error:', error);
    }
  };

  const loadItems = async () => {
    try {
      setLoading(true);
      const params = {
        with_genres: id,
        page,
        language: 'tr-TR',
        sort_by: 'popularity.desc'
      };

      const response = type === 'movie'
        ? await discoverService.movie(params)
        : await discoverService.tv(params);

      setItems(response.data.results);
      setTotalPages(response.data.total_pages);
    } catch (error) {
      console.error('Genre items error:', error);
    } finally {
      setLoading(false);
    }
  };

  const mediaType = type === 'movie' ? 'movie' : 'tv';
  const pageTitle = type === 'movie' ? 'Filmler' : 'Diziler';

  return (
    <>
      <Helmet>
        <title>{genreName} {pageTitle} - SINEFIX</title>
      </Helmet>

      <div className="min-h-screen pt-20">
        <div className="container-custom">
          <div className="mb-8">
            <h1 className="text-3xl font-bold">{genreName}</h1>
            <p className="text-gray-400 mt-2">
              {type === 'movie' ? 'Filmleri' : 'Dizileri'} keşfedin
            </p>
          </div>

          {loading ? (
            <Loading fullScreen={false} />
          ) : (
            <>
              <div className="grid grid-cols-2 sm:grid-cols-3 md:grid-cols-4 lg:grid-cols-5 xl:grid-cols-6 gap-4">
                {items.map(item => (
                  <MovieCard key={item.id} item={item} mediaType={mediaType} />
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
        </div>
      </div>
    </>
  );
};

export default Genre;
