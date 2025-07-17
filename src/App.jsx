import React from 'react';
import { BrowserRouter as Router, Routes, Route, useLocation } from 'react-router-dom';
import { HelmetProvider } from 'react-helmet-async';
import { AppProvider } from './contexts';
import { ToastProvider } from './components/UI/Toast';
import ErrorBoundary from './components/ErrorBoundary';
import Layout from './components/Layout/Layout';
import Home from './pages/Home';
import Movies from './pages/Movies';
import Series from './pages/Series';
import MovieDetail from './pages/MovieDetail';
import SeriesDetail from './pages/SeriesDetail';
import Watch from './pages/Watch';
import Search from './pages/Search';
import Person from './pages/Person';
import Genre from './pages/Genre';
import Favorites from './pages/Favorites';
import Contact from './pages/Contact';
import PrivacyPolicy from './pages/PrivacyPolicy';
import Terms from './pages/Terms';
import FAQ from './pages/FAQ';
import SEORouter from './components/SEORouter';

// ScrollToTop component to reset scroll position on page navigation
const ScrollToTop = () => {
  const { pathname } = useLocation();
  
  React.useEffect(() => {
    window.scrollTo(0, 0);
  }, [pathname]);
  
  return null;
};

function App() {
  return (
    <ErrorBoundary>
      <HelmetProvider>
        <AppProvider>
          <ToastProvider>
            <Router>
              <ScrollToTop />
              <Layout>
                <Routes>
                  <Route path="/" element={<Home />} />
                  <Route path="/movies" element={<Movies />} />
                  <Route path="/series" element={<Series />} />
                  <Route path="/movie/:id" element={<MovieDetail />} />
                  <Route path="/movie/:id/:slug" element={<MovieDetail />} />
                  <Route path="/tv/:id" element={<SeriesDetail />} />
                  <Route path="/tv/:id/:slug" element={<SeriesDetail />} />
                  <Route path="/watch/:type/:id" element={<Watch />} />
                  <Route path="/watch/:type/:id/:slug" element={<Watch />} />
                  <Route path="/search" element={<Search />} />
                  <Route path="/person/:id" element={<Person />} />
                  <Route path="/genre/:type/:id" element={<Genre />} />
                  <Route path="/favorites" element={<Favorites />} />
                  <Route path="/iletisim" element={<Contact />} />
                  <Route path="/gizlilik-politikasi" element={<PrivacyPolicy />} />
                  <Route path="/kullanim-kosullari" element={<Terms />} />
                  <Route path="/sss" element={<FAQ />} />
                </Routes>
              </Layout>
            </Router>
          </ToastProvider>
        </AppProvider>
      </HelmetProvider>
    </ErrorBoundary>
  );
}

export default App;
