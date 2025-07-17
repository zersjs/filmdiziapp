import React, { useState, useEffect } from 'react';
import { useParams, Link, useNavigate } from 'react-router-dom';
import { Helmet } from 'react-helmet-async';
import { Swiper, SwiperSlide } from 'swiper/react';
import { Navigation, FreeMode } from 'swiper/modules';
import { 
  FaPlay, FaStar, FaHeart, FaShare, FaCalendar, FaClock, 
  FaDollarSign, FaGlobe, FaFilm, FaUsers, FaTags,
  FaImdb, FaYoutube, FaExternalLinkAlt 
} from 'react-icons/fa';
import { movieService, mediaService, getImageUrl } from '../services/tmdb';
import { 
  formatDate, formatRuntime, formatRating, formatCurrency, 
  getLanguageName, getCertification, favorites, watchHistory,
  truncateText 
} from '../utils/helpers';
import Loading from '../components/UI/Loading';
import MovieCard from '../components/UI/MovieCard';
import PersonCard from '../components/UI/PersonCard';
import ImageGallery from '../components/UI/ImageGallery';
import VideoGallery from '../components/UI/VideoGallery';
import Reviews from '../components/UI/Reviews';

import 'swiper/css';
import 'swiper/css/navigation';
import 'swiper/css/free-mode';

const MovieDetail = () => {
  const { id } = useParams();
  const navigate = useNavigate();
  const [movie, setMovie] = useState(null);
  const [loading, setLoading] = useState(true);
  const [activeTab, setActiveTab] = useState('overview');
  const [isFavorite, setIsFavorite] = useState(false);
  const [mediaContent, setMediaContent] = useState(null);
  const [mediaLoading, setMediaLoading] = useState(false);
  const [showTrailerModal, setShowTrailerModal] = useState(false);

  useEffect(() => {
    loadMovieData();
  }, [id]);

  const loadMovieData = async () => {
    try {
      setLoading(true);
      const response = await movieService.getDetail(id);
      setMovie(response.data);
      setIsFavorite(favorites.isFavorite(response.data.id, 'movie'));
      
      // İzleme geçmişine ekle
      watchHistory.add({
        id: response.data.id,
        title: response.data.title,
        poster_path: response.data.poster_path,
        vote_average: response.data.vote_average,
        media_type: 'movie'
      });
    } catch (error) {
      console.error('Movie detail error:', error);
      navigate('/404');
    } finally {
      setLoading(false);
    }
  };

  const toggleFavorite = () => {
    if (isFavorite) {
      favorites.remove(movie.id, 'movie');
    } else {
      favorites.add({
        id: movie.id,
        title: movie.title,
        poster_path: movie.poster_path,
        vote_average: movie.vote_average,
        release_date: movie.release_date,
        media_type: 'movie'
      });
    }
    setIsFavorite(!isFavorite);
  };

  const handleShare = () => {
    if (navigator.share) {
      navigator.share({
        title: movie.title,
        text: movie.overview,
        url: window.location.href
      });
    }
  };

  const loadMediaContent = async () => {
    if (mediaContent) return; // Zaten yüklendiyse tekrar yükleme
    
    try {
      setMediaLoading(true);
      const media = await mediaService.getMovieMedia(id);
      setMediaContent(media);
    } catch (error) {
      console.error('Media loading error:', error);
    } finally {
      setMediaLoading(false);
    }
  };

  const handleTabChange = (tabId) => {
    setActiveTab(tabId);
    if (tabId === 'media') {
      loadMediaContent();
    }
  };

  const openTrailerModal = () => {
    setShowTrailerModal(true);
  };

  const closeTrailerModal = () => {
    setShowTrailerModal(false);
  };

  if (loading) return <Loading />;
  if (!movie) return null;

  const certification = getCertification(movie.release_dates);
  const director = movie.credits?.crew?.find(person => person.job === 'Director');
  const trailer = movie.videos?.results?.find(video => 
    video.type === 'Trailer' && video.site === 'YouTube'
  );

  return (
    <>
      <Helmet>
        <title>{movie.title} - SINEFIX</title>
        <meta name="description" content={movie.overview} />
      </Helmet>

      {/* Hero Section */}
      <section className="relative min-h-[70vh] flex items-end">
        {/* Backdrop */}
        <div className="absolute inset-0">
          <img
            src={getImageUrl(movie.backdrop_path, 'original')}
            alt={movie.title}
            className="w-full h-full object-cover"
          />
          <div className="absolute inset-0 bg-gradient-to-t from-black via-black/70 to-black/40" />
        </div>

        {/* Content */}
        <div className="relative z-10 w-full pb-8 pt-32">
          <div className="container-custom">
            <div className="flex flex-col md:flex-row gap-8">
              {/* Poster */}
              <div className="flex-shrink-0">
                <img
                  src={getImageUrl(movie.poster_path, 'w342')}
                  alt={movie.title}
                  className="w-48 md:w-64 rounded-lg shadow-2xl"
                />
              </div>

              {/* Info */}
              <div className="flex-grow">
                <h1 className="text-4xl md:text-5xl font-bold mb-4">
                  {movie.title}
                </h1>

                {movie.tagline && (
                  <p className="text-xl text-gray-300 italic mb-4">"{movie.tagline}"</p>
                )}

                <div className="flex flex-wrap items-center gap-4 mb-6 text-sm">
                  <span className="flex items-center">
                    <FaStar className="text-yellow-500 mr-1" />
                    <strong>{formatRating(movie.vote_average)}</strong>
                    <span className="text-gray-400 ml-1">({movie.vote_count} oy)</span>
                  </span>
                  
                  <span className="flex items-center">
                    <FaCalendar className="mr-1" />
                    {formatDate(movie.release_date)}
                  </span>
                  
                  <span className="flex items-center">
                    <FaClock className="mr-1" />
                    {formatRuntime(movie.runtime)}
                  </span>
                  
                  {certification && (
                    <span className="px-2 py-1 border border-gray-600 rounded">
                      {certification}
                    </span>
                  )}
                </div>

                {/* Genres */}
                <div className="flex flex-wrap gap-2 mb-6">
                  {movie.genres?.map(genre => (
                    <Link
                      key={genre.id}
                      to={`/genre/movie/${genre.id}`}
                      className="px-3 py-1 bg-gray-800 rounded-full text-sm hover:bg-gray-700 transition-colors"
                    >
                      {genre.name}
                    </Link>
                  ))}
                </div>

                {/* Actions */}
                <div className="flex flex-wrap gap-4">
                  <Link
                    to={`/watch/movie/${movie.id}`}
                    className="btn-primary flex items-center space-x-2"
                  >
                    <FaPlay />
                    <span>Hemen İzle</span>
                  </Link>
                  
                  {trailer && (
                    <a
                      href={`https://www.youtube.com/watch?v=${trailer.key}`}
                      target="_blank"
                      rel="noopener noreferrer"
                      className="btn-secondary flex items-center space-x-2"
                    >
                      <FaYoutube />
                      <span>Fragman</span>
                    </a>
                  )}
                  
                  <button
                    onClick={toggleFavorite}
                    className={`p-3 rounded-lg transition-colors ${
                      isFavorite 
                        ? 'bg-red-600 hover:bg-red-700' 
                        : 'bg-gray-800 hover:bg-gray-700'
                    }`}
                  >
                    <FaHeart />
                  </button>
                  
                  <button
                    onClick={handleShare}
                    className="p-3 bg-gray-800 rounded-lg hover:bg-gray-700 transition-colors"
                  >
                    <FaShare />
                  </button>
                </div>
              </div>
            </div>
          </div>
        </div>
      </section>

      {/* Tabs */}
      <section className="border-b border-gray-800 sticky top-16 bg-black z-20">
        <div className="container-custom">
          <div className="flex overflow-x-auto scrollbar-hide">
            {[
              { id: 'overview', label: 'Genel Bakış' },
              { id: 'cast', label: 'Oyuncular' },
              { id: 'media', label: 'Medya' },
              { id: 'details', label: 'Detaylar' },
              { id: 'reviews', label: 'Yorumlar' },
              { id: 'similar', label: 'Benzer Filmler' }
            ].map(tab => (
              <button
                key={tab.id}
                onClick={() => handleTabChange(tab.id)}
                className={`px-6 py-4 whitespace-nowrap transition-colors ${
                  activeTab === tab.id
                    ? 'text-white border-b-2 border-white'
                    : 'text-gray-400 hover:text-white'
                }`}
              >
                {tab.label}
              </button>
            ))}
          </div>
        </div>
      </section>

      {/* Tab Content */}
      <section className="container-custom py-8">
        {activeTab === 'overview' && (
          <div className="max-w-4xl">
            <h2 className="text-2xl font-bold mb-4">Özet</h2>
            <p className="text-gray-300 leading-relaxed mb-8">
              {movie.overview || 'Özet bilgisi bulunmamaktadır.'}
            </p>

            {director && (
              <div className="mb-6">
                <h3 className="text-lg font-semibold mb-2">Yönetmen</h3>
                <Link
                  to={`/person/${director.id}`}
                  className="inline-flex items-center space-x-3 hover:text-gray-300"
                >
                  <img
                    src={getImageUrl(director.profile_path, 'w185')}
                    alt={director.name}
                    className="w-12 h-12 rounded-full object-cover"
                  />
                  <span>{director.name}</span>
                </Link>
              </div>
            )}

            {/* Keywords */}
            {movie.keywords?.keywords?.length > 0 && (
              <div>
                <h3 className="text-lg font-semibold mb-3">Anahtar Kelimeler</h3>
                <div className="flex flex-wrap gap-2">
                  {movie.keywords.keywords.map(keyword => (
                    <span
                      key={keyword.id}
                      className="px-3 py-1 bg-gray-800 rounded-full text-sm"
                    >
                      {keyword.name}
                    </span>
                  ))}
                </div>
              </div>
            )}
          </div>
        )}

        {activeTab === 'cast' && (
          <div>
            <h2 className="text-2xl font-bold mb-6">Oyuncu Kadrosu</h2>
            <div className="grid grid-cols-2 sm:grid-cols-3 md:grid-cols-4 lg:grid-cols-6 gap-4">
              {movie.credits?.cast?.slice(0, 12).map(person => (
                <PersonCard key={person.id} person={person} />
              ))}
            </div>
          </div>
        )}

        {activeTab === 'media' && (
          <div className="space-y-8">
            {mediaLoading ? (
              <div className="flex justify-center items-center py-20">
                <Loading />
              </div>
            ) : (
              <>
                {mediaContent?.videos?.results?.length > 0 && (
                  <VideoGallery videos={mediaContent.videos.results} />
                )}
                {mediaContent?.images && (
                  <ImageGallery images={mediaContent.images} title={movie.title} />
                )}
                {(!mediaContent?.videos?.results?.length && !mediaContent?.images?.backdrops?.length && !mediaContent?.images?.posters?.length) && (
                  <div className="text-center py-20">
                    <p className="text-gray-400">Bu içerik için medya bulunamadı.</p>
                  </div>
                )}
              </>
            )}
          </div>
        )}

        {activeTab === 'details' && (
          <div className="grid md:grid-cols-2 gap-8 max-w-4xl">
            <div className="space-y-4">
              <h3 className="text-xl font-bold mb-4">Film Bilgileri</h3>
              
              <div>
                <span className="text-gray-400">Orijinal Başlık:</span>
                <p className="font-medium">{movie.original_title}</p>
              </div>
              
              <div>
                <span className="text-gray-400">Durum:</span>
                <p className="font-medium">{movie.status}</p>
              </div>
              
              <div>
                <span className="text-gray-400">Orijinal Dil:</span>
                <p className="font-medium">{getLanguageName(movie.original_language)}</p>
              </div>
              
              <div>
                <span className="text-gray-400">Bütçe:</span>
                <p className="font-medium">{formatCurrency(movie.budget)}</p>
              </div>
              
              <div>
                <span className="text-gray-400">Hasılat:</span>
                <p className="font-medium">{formatCurrency(movie.revenue)}</p>
              </div>
            </div>

            <div className="space-y-4">
              <h3 className="text-xl font-bold mb-4">Yapım Bilgileri</h3>
              
              {movie.production_companies?.length > 0 && (
                <div>
                  <span className="text-gray-400">Yapım Şirketleri:</span>
                  <div className="mt-2 space-y-2">
                    {movie.production_companies.map(company => (
                      <div key={company.id} className="flex items-center space-x-2">
                        {company.logo_path && (
                          <img
                            src={getImageUrl(company.logo_path, 'w92')}
                            alt={company.name}
                            className="h-8 object-contain"
                          />
                        )}
                        <span>{company.name}</span>
                      </div>
                    ))}
                  </div>
                </div>
              )}
              
              {movie.production_countries?.length > 0 && (
                <div>
                  <span className="text-gray-400">Yapım Ülkeleri:</span>
                  <p className="font-medium">
                    {movie.production_countries.map(c => c.name).join(', ')}
                  </p>
                </div>
              )}

              {/* External Links */}
              <div className="flex items-center space-x-4 pt-4">
                {movie.imdb_id && (
                  <a
                    href={`https://www.imdb.com/title/${movie.imdb_id}`}
                    target="_blank"
                    rel="noopener noreferrer"
                    className="flex items-center space-x-2 text-yellow-500 hover:text-yellow-400"
                  >
                    <FaImdb size={24} />
                    <span>IMDb</span>
                  </a>
                )}
                {movie.homepage && (
                  <a
                    href={movie.homepage}
                    target="_blank"
                    rel="noopener noreferrer"
                    className="flex items-center space-x-2 text-gray-400 hover:text-white"
                  >
                    <FaExternalLinkAlt />
                    <span>Resmi Site</span>
                  </a>
                )}
              </div>
            </div>
          </div>
        )}

        {activeTab === 'reviews' && (
          <Reviews reviews={movie.reviews?.results || []} />
        )}

        {activeTab === 'similar' && (
          <div>
            <h2 className="text-2xl font-bold mb-6">Benzer Filmler</h2>
            <div className="grid grid-cols-2 sm:grid-cols-3 md:grid-cols-4 lg:grid-cols-6 gap-4">
              {movie.similar?.results?.slice(0, 12).map(item => (
                <MovieCard key={item.id} item={item} mediaType="movie" />
              ))}
            </div>
          </div>
        )}
      </section>
    </>
  );
};

export default MovieDetail;
