import { FaHome, FaFilm, FaTv, FaPlay } from 'react-icons/fa';

export const PRIMARY_NAV = [
  { path: '/', icon: FaHome, label: 'Ana Sayfa', end: true },
  { path: '/movies', icon: FaFilm, label: 'Filmler' },
  { path: '/series', icon: FaTv, label: 'Diziler' },
  { path: '/sahneler', icon: FaPlay, label: 'Sahneler' },
];
