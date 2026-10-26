import React, { useCallback, useEffect, useRef, useState } from 'react';
import { useLocation, useNavigate } from 'react-router-dom';
import SearchModal from '../UI/SearchModal';
import ShortcutsModal, { GO_SHORTCUTS } from '../UI/ShortcutsModal';
import { isTypingTarget } from '../../utils/dom';
import MobileBottomNav from './MobileBottomNav';
import SiteHeader from './SiteHeader';
import Footer from './Footer';
import { hasHeroBehindHeader } from './navigation';

const Layout = ({ children }) => {
  const { pathname } = useLocation();
  const navigate = useNavigate();
  // Arama penceresi açıldığı adrese bağlıdır: geri/ileri ile başka sayfaya geçilince kapanır,
  // ama sayfa geçişi sürerken (tembel yüklenen sayfa) açılırsa geçiş bitince kapanmaz.
  const [searchFor, setSearchFor] = useState(null);
  const searchOpen = searchFor !== null;
  const [shortcutsOpen, setShortcutsOpen] = useState(false);
  const goPending = useRef(0);
  const immersive = pathname.startsWith('/sahneler');

  const openSearch = useCallback(() => setSearchFor(window.location.pathname), []);
  const closeSearch = useCallback(() => setSearchFor(null), []);

  // Yakalama aşamasında dinlenir: "g" ile başlayan bir kısayolun ikinci tuşu
  // sayfaların kendi kısayollarına (ör. Sahneler'de "k") ulaşmadan tüketilir.
  useEffect(() => {
    const onKeyDown = (event) => {
      if ((event.ctrlKey || event.metaKey) && event.key.toLowerCase() === 'k') {
        event.preventDefault();
        setSearchFor(current => (current === null ? window.location.pathname : null));
        return;
      }
      if (event.ctrlKey || event.metaKey || event.altKey || isTypingTarget(event.target)) return;
      if (document.querySelector('[aria-modal="true"]')) return;

      if (goPending.current && Date.now() - goPending.current < 1200) {
        goPending.current = 0;
        const target = GO_SHORTCUTS[event.key.toLowerCase()];
        if (target) {
          event.preventDefault();
          event.stopPropagation();
          navigate(target.path);
        }
        return;
      }
      if (event.key === 'g') {
        goPending.current = Date.now();
      } else if (event.key === '/') {
        event.preventDefault();
        openSearch();
      } else if (event.key === '?') {
        event.preventDefault();
        setShortcutsOpen(true);
      }
    };
    document.addEventListener('keydown', onKeyDown, true);
    return () => document.removeEventListener('keydown', onKeyDown, true);
  }, [navigate, openSearch]);

  useEffect(() => {
    setSearchFor(current => (current !== null && current !== pathname ? null : current));
  }, [pathname]);

  return (
    <div className={`app-layout ${hasHeroBehindHeader(pathname) ? 'has-hero' : ''} ${immersive ? 'is-immersive' : ''}`}>
      <a href="#main" className="sr-only focus:not-sr-only focus:fixed focus:left-4 focus:top-4 focus:z-[11000] focus:rounded-lg focus:bg-white focus:px-4 focus:py-2 focus:text-black">
        İçeriğe geç
      </a>
      <SiteHeader onSearch={openSearch} immersive={immersive} />
      <div className="main-content">
        <main id="main" className="main-content-inner">
          {children}
        </main>
        {!immersive && <Footer />}
      </div>
      <MobileBottomNav />
      <SearchModal isOpen={searchOpen} onClose={closeSearch} />
      <ShortcutsModal isOpen={shortcutsOpen} onClose={() => setShortcutsOpen(false)} />
    </div>
  );
};

export default Layout;
