import React, { useState } from 'react';
import { Link } from 'react-router-dom';
import { LazyLoadImage } from 'react-lazy-load-image-component';
import { FaStar, FaHeart, FaFilm, FaTv, FaClock, FaPlay } from 'react-icons/fa';
import { getImageUrl } from '../../services/tmdb';
import { formatRating, getYear, createSlug } from '../../utils/helpers';
import { useApp } from '../../contexts';
import { useToast } from './Toast';
import 'react-lazy-load-image-component/src/effects/blur.css';

const MovieCard = ({ item, mediaType = 'movie' }) => {
  const { actions } = useApp();
  const { toast } = useToast();
  const [imageError, setImageError] = useState(false);

  const isFavorite = actions.isFavorite(item.id, mediaType);
  const isWatchLater = actions.isWatchLater(item.id, mediaType);

  const toggleFavorite = (e) => {
    e.preventDefault();
    e.stopPropagation();
    
    try {
      actions.toggleFavorite({ ...item, media_type: mediaType });
      toast.success(isFavorite ? 'Favorilerden kaldırıldı' : 'Favorilere eklendi');
    } catch (error) {
      toast.error('Favori işlemi sırasında hata oluştu');
    }
  };

  const toggleWatchLater = (e) => {
    e.preventDefault();
    e.stopPropagation();
    
    try {
      actions.toggleWatchLater({ ...item, media_type: mediaType });
      toast.success(isWatchLater ? 'İzleme listesinden kaldırıldı' : 'İzleme listesine eklendi');
    } catch (error) {
      toast.error('İzleme listesi işlemi sırasında hata oluştu');
    }
  };

  const title = item.title || item.name;
  const releaseDate = item.release_date || item.first_air_date;
  const slug = createSlug(title);
  const detailPath = `/${mediaType}/${item.id}/${slug}`;
  const posterUrl = item.poster_path ? getImageUrl(item.poster_path, 'w342') : null;

  return (
    <Link to={detailPath} className="group block transition-transform duration-300 hover:scale-105">
      <div className="relative aspect-[2/3] overflow-hidden rounded-lg bg-gray-900 shadow-lg">
        {/* Poster */}
        {posterUrl && !imageError ? (
          <LazyLoadImage
            src={posterUrl}
            alt={title}
            effect="opacity"
            className="w-full h-full object-cover"
            onError={() => setImageError(true)}
            loading="lazy"
          />
        ) : (
          <div className="w-full h-full flex flex-col items-center justify-center bg-gray-800 text-gray-500">
            {mediaType === 'movie' ? <FaFilm className="text-3xl mb-2" /> : <FaTv className="text-3xl mb-2" />}
            <h3 className="text-sm text-center px-3">{title}</h3>
            <p className="text-xs mt-1">{getYear(releaseDate)}</p>
          </div>
        )}

        {/* Overlay */}
        <div className="absolute inset-0 bg-gradient-to-t from-black/90 to-transparent opacity-0 group-hover:opacity-100 transition-opacity duration-300">
          <div className="absolute bottom-0 left-0 right-0 p-3 text-white">
            <h3 className="font-medium text-sm mb-2 line-clamp-2">{title}</h3>
            <div className="flex items-center justify-between text-xs mb-2">
              <span>{getYear(releaseDate)}</span>
              <div className="flex items-center space-x-1">
                <FaStar className="text-yellow-400" />
                <span>{formatRating(item.vote_average)}</span>
              </div>
            </div>
            {/* Quick Action Buttons */}
            <div className="flex items-center space-x-2">
              <Link
                to={`/watch/${mediaType}/${item.id}/${slug}`}
                className="flex-1 flex items-center justify-center space-x-1 bg-white text-black px-2 py-1 rounded text-xs font-medium hover:bg-gray-200 transition-colors"
                onClick={(e) => e.stopPropagation()}
              >
                <FaPlay className="text-xs" />
                <span>İzle</span>
              </Link>
              <button
                onClick={toggleWatchLater}
                className={`p-1.5 rounded transition-colors ${
                  isWatchLater ? 'bg-blue-500 text-white' : 'bg-black/60 hover:bg-black/80 text-white'
                }`}
                title={isWatchLater ? 'İzleme listesinden kaldır' : 'İzleme listesine ekle'}
              >
                <FaClock className="text-xs" />
              </button>
            </div>
          </div>
        </div>

        {/* Favorite Button */}
        <button
          onClick={toggleFavorite}
          className={`absolute top-2 right-2 w-8 h-8 rounded-full flex items-center justify-center transition-colors ${
            isFavorite ? 'bg-red-500' : 'bg-black/60 hover:bg-black/80'
          }`}
        >
          <FaHeart className={`text-sm ${isFavorite ? 'text-white' : 'text-white/80'}`} />
        </button>

        {/* Media Type Badge */}
        <div className="absolute top-2 left-2 bg-black/60 px-2 py-1 rounded-full text-xs text-white">
          {mediaType === 'movie' ? 'Film' : 'Dizi'}
        </div>
      </div>
    </Link>
  );
};

export default MovieCard;
