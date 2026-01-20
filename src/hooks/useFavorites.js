import { useState, useEffect, useCallback } from 'react';
import { favorites as favoritesHelper } from '../utils/helpers';

export const useFavorites = () => {
  const [favorites, setFavorites] = useState([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    try {
      const savedFavorites = favoritesHelper.getAll();
      setFavorites(savedFavorites);
    } catch (error) {
      console.error('Favoriler yüklenirken hata:', error);
    } finally {
      setLoading(false);
    }
  }, []);

  const addFavorite = useCallback((item) => {
    try {
      const favoriteItem = {
        id: item.id,
        title: item.title || item.name,
        poster_path: item.poster_path,
        media_type: item.media_type || 'movie',
        vote_average: item.vote_average,
        release_date: item.release_date || item.first_air_date,
        overview: item.overview
      };

      favoritesHelper.add(favoriteItem);
      setFavorites(favoritesHelper.getAll());
      return true;
    } catch (error) {
      console.error('Favori eklenirken hata:', error);
      return false;
    }
  }, []);

  const removeFavorite = useCallback((id, mediaType) => {
    try {
      favoritesHelper.remove(id, mediaType);
      setFavorites(favoritesHelper.getAll());
      return true;
    } catch (error) {
      console.error('Favori kaldırılırken hata:', error);
      return false;
    }
  }, []);

  const isFavorite = useCallback((id, mediaType) => {
    return favoritesHelper.isFavorite(id, mediaType);
  }, []);

  const toggleFavorite = useCallback((item) => {
    const mediaType = item.media_type || 'movie';
    if (isFavorite(item.id, mediaType)) {
      return removeFavorite(item.id, mediaType);
    } else {
      return addFavorite(item);
    }
  }, [isFavorite, addFavorite, removeFavorite]);

  const clearFavorites = useCallback(() => {
    try {
      localStorage.removeItem('favorites');
      setFavorites([]);
      return true;
    } catch (error) {
      console.error('Favoriler temizlenirken hata:', error);
      return false;
    }
  }, []);

  const getFavoritesByType = useCallback((mediaType) => {
    return favorites.filter(item => item.media_type === mediaType);
  }, [favorites]);

  return {
    favorites,
    loading,
    addFavorite,
    removeFavorite,
    isFavorite,
    toggleFavorite,
    clearFavorites,
    getFavoritesByType,
    count: favorites.length
  };
};
