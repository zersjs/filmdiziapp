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
    <Link to={detailPath} className="group block transition-all duration-500">
      <div className="relative aspect-[2/3] overflow-hidden rounded-xl bg-[#050505] border border-white/5 group-hover:border-white/20 transition-all duration-500 shadow-2xl">
        {posterUrl && !imageError ? (
          <LazyLoadImage
            src={posterUrl}
            alt={title}
            effect="opacity"
            className="w-full h-full object-cover opacity-60 group-hover:opacity-100 group-hover:scale-110 transition-all duration-700"
            onError={() => setImageError(true)}
            loading="lazy"
          />
        ) : (
          <div className="w-full h-full flex flex-col items-center justify-center bg-[#050505] text-gray-800">
            {mediaType === 'movie' ? <FaFilm className="text-3xl mb-3 opacity-20" /> : <FaTv className="text-3xl mb-3 opacity-20" />}
            <h3 className="text-[10px] uppercase tracking-[0.2em] text-center px-4 font-bold opacity-30">{title}</h3>
          </div>
        )}

        {/* Overlay Info */}
        <div className="absolute inset-0 bg-gradient-to-t from-black via-black/20 to-transparent opacity-0 group-hover:opacity-100 transition-all duration-500">
          <div className="absolute bottom-0 left-0 right-0 p-4 transform translate-y-4 group-hover:translate-y-0 transition-transform duration-500">
            <h3 className="font-black text-xs mb-2 line-clamp-1 uppercase tracking-tighter italic text-white">{title}</h3>
            
            <div className="flex items-center justify-between text-[9px] font-bold uppercase tracking-widest text-gray-400 mb-4">
              <span className="bg-black/40 px-2 py-0.5 rounded backdrop-blur-md border border-white/5">{getYear(releaseDate)}</span>
              <div className="flex items-center gap-1.5 bg-black/40 px-2 py-0.5 rounded backdrop-blur-md border border-white/5">
                <FaStar className="text-yellow-500 text-[8px]" />
                <span className="text-white">{formatRating(item.vote_average)}</span>
              </div>
            </div>

            <div className="flex items-center gap-2">
              <button
                to={`/watch/${mediaType}/${item.id}/${slug}`}
                className="flex-1 flex items-center justify-center gap-2 bg-white text-black py-2 rounded-lg text-[10px] font-black uppercase tracking-[0.2em] hover:bg-gray-200 transition-all active:scale-95"
                onClick={(e) => {
                  e.preventDefault();
                  e.stopPropagation();
                  window.location.href = `/watch/${mediaType}/${item.id}/${slug}`;
                }}
              >
                <FaPlay className="text-[8px]" />
                <span>İZLE</span>
              </button>
            </div>
          </div>
        </div>

        {/* Top Badge */}
        <div className="absolute top-3 left-3 bg-black/60 backdrop-blur-md px-2 py-1 border border-white/10 rounded-md text-[8px] font-black uppercase tracking-widest text-white/70">
          {mediaType === 'movie' ? 'FİLM' : 'DİZİ'}
        </div>

        {/* Favorite Button */}
        <button
          onClick={toggleFavorite}
          className={`absolute top-3 right-3 w-8 h-8 rounded-full flex items-center justify-center backdrop-blur-md transition-all duration-300 border ${
            isFavorite 
              ? 'bg-white border-white text-black' 
              : 'bg-black/40 border-white/10 text-white/50 hover:text-white hover:border-white/30'
          }`}
        >
          <FaHeart className="text-[10px]" />
        </button>
      </div>
    </Link>
  );
};

export default MovieCard;
