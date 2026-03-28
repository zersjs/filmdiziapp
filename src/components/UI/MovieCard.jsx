import React, { useState } from 'react';
import { Link, useNavigate } from 'react-router-dom';
import { LazyLoadImage } from 'react-lazy-load-image-component';
import { FaStar, FaHeart, FaFilm, FaTv, FaPlay } from 'react-icons/fa';
import { getImageUrl } from '../../services/tmdb';
import { formatRating, getYear, createSlug } from '../../utils/helpers';
import { useApp } from '../../contexts';
import { useToast } from './Toast';
import 'react-lazy-load-image-component/src/effects/blur.css';

const MovieCard = ({ item, mediaType = 'movie' }) => {
  const { actions } = useApp();
  const { toast } = useToast();
  const navigate = useNavigate();
  const [imageError, setImageError] = useState(false);

  const isFavorite = actions.isFavorite(item.id, mediaType);

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

  const handleWatch = (e) => {
    e.preventDefault();
    e.stopPropagation();
    navigate(`/watch/${mediaType}/${item.id}/${slug}`);
  };

  const title = item.title || item.name;
  const releaseDate = item.release_date || item.first_air_date;
  const slug = createSlug(title);
  const detailPath = `/${mediaType}/${item.id}/${slug}`;
  const posterUrl = item.poster_path ? getImageUrl(item.poster_path, 'w342') : null;
  const rating = formatRating(item.vote_average);
  const year = getYear(releaseDate);

  return (
    <Link to={detailPath} className="sf-movie-card group">
      <div className="sf-movie-card-poster">
        {posterUrl && !imageError ? (
          <LazyLoadImage
            src={posterUrl}
            alt={title}
            effect="opacity"
            className="sf-movie-card-img"
            onError={() => setImageError(true)}
            loading="lazy"
          />
        ) : (
          <div className="sf-movie-card-placeholder">
            {mediaType === 'movie' ? <FaFilm /> : <FaTv />}
            <span>{title}</span>
          </div>
        )}

        <div className="sf-movie-card-overlay">
          <div className="sf-movie-card-actions">
            <button className="sf-movie-card-play" onClick={handleWatch}>
              <FaPlay />
            </button>
          </div>
        </div>

        <div className="sf-movie-card-type-badge">
          {mediaType === 'movie' ? 'Film' : 'Dizi'}
        </div>

        <button
          onClick={toggleFavorite}
          className={`sf-movie-card-fav ${isFavorite ? 'active' : ''}`}
        >
          <FaHeart />
        </button>

        {rating > 0 && (
          <div className="sf-movie-card-rating">
            <FaStar />
            <span>{rating}</span>
          </div>
        )}
      </div>

      <div className="sf-movie-card-info">
        <h3 className="sf-movie-card-title">{title}</h3>
        <span className="sf-movie-card-year">{year}</span>
      </div>
    </Link>
  );
};

export default MovieCard;
