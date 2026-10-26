import { FaHome, FaFilm, FaTv, FaPlay, FaMagic } from 'react-icons/fa';

// match: bu bölüme ait sayfalar (detay sayfaları da ilgili bölümü vurgular).
export const PRIMARY_NAV = [
  { key: 'home', path: '/', icon: FaHome, label: 'Ana Sayfa', match: path => path === '/' },
  { key: 'movies', path: '/movies', icon: FaFilm, label: 'Filmler', menu: 'movie', match: path => /^\/(movies|movie\/)/.test(path) },
  { key: 'series', path: '/series', icon: FaTv, label: 'Diziler', menu: 'tv', match: path => /^\/(series|tv\/)/.test(path) },
  { key: 'shorts', path: '/sahneler', icon: FaPlay, label: 'Sahneler', match: path => path.startsWith('/sahneler') },
  // Alt menüde yer yok; mobilde "Menü" sayfasında yer alır.
  { key: 'recommend', path: '/ne-izlesem', icon: FaMagic, label: 'Ne izlesem?', desktopOnly: true, match: path => path === '/ne-izlesem' },
];

export const activeNavKey = (pathname) => PRIMARY_NAV.find(item => item.match(pathname))?.key || null;

// Başlığın görselin üzerinde saydam durduğu sayfalar (ana sayfa ve detaylar).
export const hasHeroBehindHeader = (pathname) => pathname === '/' || /^\/(movie|tv)\/\d+/.test(pathname);

// Filmler / Diziler açılır menüsündeki hızlı listeler (Browse sıralamalarıyla aynı anahtarlar).
export const MENU_SHORTCUTS = {
  movie: [
    { label: 'Popüler', query: '' },
    { label: 'En yüksek puan', query: '?sort=top_rated' },
    { label: 'Vizyonda', query: '?sort=now_playing' },
    { label: 'Yakında', query: '?sort=upcoming' },
    { label: 'En yeni', query: '?sort=newest' },
  ],
  tv: [
    { label: 'Popüler', query: '' },
    { label: 'En yüksek puan', query: '?sort=top_rated' },
    { label: 'Bu hafta yayında', query: '?sort=on_the_air' },
    { label: 'Bugün yayında', query: '?sort=airing_today' },
    { label: 'En yeni', query: '?sort=newest' },
  ],
};
