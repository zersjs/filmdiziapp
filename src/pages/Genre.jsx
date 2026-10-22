import React from 'react';
import { Navigate, useParams } from 'react-router-dom';
import { genreById, genrePath } from '../lib/genres';

// Eski /genre/:type/:id bağlantıları kalıcı tür adresine yönlendirilir.
const Genre = () => {
  const { type, id } = useParams();
  const mediaType = type === 'tv' ? 'tv' : 'movie';
  const genre = genreById(mediaType, id);
  return <Navigate to={genre ? genrePath(mediaType, genre) : mediaType === 'tv' ? '/series' : '/movies'} replace />;
};

export default Genre;
