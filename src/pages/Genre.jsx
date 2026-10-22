import React from 'react';
import { Navigate, useParams } from 'react-router-dom';

// Eski /genre/:type/:id bağlantıları filtreli liste sayfasına yönlendirilir.
const Genre = () => {
  const { type, id } = useParams();
  const base = type === 'tv' ? '/series' : '/movies';
  return <Navigate to={`${base}?genre=${encodeURIComponent(id)}`} replace />;
};

export default Genre;
