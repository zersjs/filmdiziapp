import React from 'react';
import { Link } from 'react-router-dom';

const LINKS = [
  { to: '/movies', label: 'Filmler' },
  { to: '/series', label: 'Diziler' },
  { to: '/sahneler', label: 'Sahneler' },
  { to: '/sss', label: 'SSS' },
  { to: '/iletisim', label: 'İletişim' },
  { to: '/gizlilik-politikasi', label: 'Gizlilik' },
  { to: '/kullanim-kosullari', label: 'Kullanım koşulları' },
];

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
