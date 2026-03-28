import React from 'react';
import { Link } from 'react-router-dom';

const Footer = () => {
  const year = new Date().getFullYear();

  return (
    <footer className="footer-minimal">
      <div className="container-custom">
        <div className="footer-top">
          <div className="footer-brand">
            <Link to="/" className="footer-logo">SINEFIX</Link>
            <p className="footer-tagline">Film ve dizi izleme platformu</p>
          </div>
          <div className="footer-links-row">
            <Link to="/movies">Filmler</Link>
            <Link to="/series">Diziler</Link>
            <Link to="/sahneler">Sahneler</Link>
            <Link to="/iletisim">İletişim</Link>
            <Link to="/gizlilik-politikasi">Gizlilik</Link>
            <Link to="/kullanim-kosullari">Koşullar</Link>
            <Link to="/sss">SSS</Link>
          </div>
        </div>
        <div className="footer-bottom">
          <p>© {year} SINEFIX. TMDB API kullanılmaktadır.</p>
        </div>
      </div>
    </footer>
  );
};

export default Footer;
