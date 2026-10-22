import { FaHome, FaFilm, FaTv, FaPlay, FaMagic } from 'react-icons/fa';

export const PRIMARY_NAV = [
  { path: '/', icon: FaHome, label: 'Ana Sayfa', end: true },
  { path: '/movies', icon: FaFilm, label: 'Filmler' },
  { path: '/series', icon: FaTv, label: 'Diziler' },
  { path: '/sahneler', icon: FaPlay, label: 'Sahneler' },
  // Alt menüde yer yok; mobilde "Menü" sayfasında yer alır.
  { path: '/ne-izlesem', icon: FaMagic, label: 'Ne izlesem?', desktopOnly: true },
];
