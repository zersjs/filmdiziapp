import React from 'react';
import { Link } from 'react-router-dom';
import { genreBySlug, genreHeading, genrePath } from '../../lib/genres';

const LINKS = [
  { to: '/movies', label: 'Filmler' },
  { to: '/series', label: 'Diziler' },
  { to: '/sahneler', label: 'Sahneler' },
  { to: '/ne-izlesem', label: 'Ne izlesem?' },
  { to: '/sss', label: 'SSS' },
  { to: '/iletisim', label: 'İletişim' },
  { to: '/gizlilik-politikasi', label: 'Gizlilik' },
  { to: '/kullanim-kosullari', label: 'Kullanım koşulları' },
];

// Arama motorlarının tür sayfalarını keşfetmesi için her sayfada sabit iç bağlantılar
const POPULAR_GENRES = [
  ['movie', 'aksiyon'], ['movie', 'komedi'], ['movie', 'korku'], ['movie', 'bilim-kurgu'],
  ['movie', 'animasyon'], ['movie', 'romantik'], ['tv', 'dram'], ['tv', 'suc'],
  ['tv', 'bilim-kurgu-fantazi'], ['tv', 'komedi'],
].map(([mediaType, slug]) => {
  const genre = genreBySlug(mediaType, slug);
  return { to: genrePath(mediaType, genre), label: genreHeading(mediaType, genre) };
});

const Footer = () => (
  <footer className="site-footer">
    <div className="container-custom">
      <div className="footer-top">
        <div>
          <Link to="/" className="footer-logo">SINEFIX</Link>
          <p className="footer-tagline">Film ve dizi keşif platformu</p>
        </div>
        <nav className="footer-links" aria-label="Alt bağlantılar">
          {LINKS.map(link => <Link key={link.to} to={link.to}>{link.label}</Link>)}
        </nav>
      </div>
      <nav className="footer-genres" aria-label="Popüler türler">
        {POPULAR_GENRES.map(link => <Link key={link.to} to={link.to}>{link.label}</Link>)}
      </nav>
      <div className="footer-bottom">
        © {new Date().getFullYear()} SINEFIX. Film ve dizi verileri{' '}
        <a href="https://www.themoviedb.org" target="_blank" rel="noopener noreferrer" className="underline underline-offset-2 hover:text-white">
          TMDB
        </a>{' '}
        API'si ile sağlanır; bu ürün TMDB tarafından onaylanmamıştır.
      </div>
    </div>
  </footer>
);

export default Footer;
