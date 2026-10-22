import React, { Suspense, lazy, useLayoutEffect } from 'react';
import { BrowserRouter as Router, Routes, Route, useLocation, useNavigationType } from 'react-router-dom';
import { HelmetProvider } from 'react-helmet-async';
import { QueryClient, QueryClientProvider } from '@tanstack/react-query';
import { AppProvider } from './contexts';
import { AuthProvider } from './contexts/AuthContext';
import { ToastProvider } from './components/UI/Toast';
import ErrorBoundary from './components/ErrorBoundary';
import Layout from './components/Layout/Layout';
import { PageLoader } from './components/UI/Loading';
import Home from './pages/Home';

const Movies = lazy(() => import('./pages/Movies'));
const Series = lazy(() => import('./pages/Series'));
const MovieDetail = lazy(() => import('./pages/MovieDetail'));
const SeriesDetail = lazy(() => import('./pages/SeriesDetail'));
const Watch = lazy(() => import('./pages/Watch'));
const Search = lazy(() => import('./pages/Search'));
const Person = lazy(() => import('./pages/Person'));
const Genre = lazy(() => import('./pages/Genre'));
const Favorites = lazy(() => import('./pages/Favorites'));
const WatchLater = lazy(() => import('./pages/WatchLater'));
const Contact = lazy(() => import('./pages/Contact'));
const PrivacyPolicy = lazy(() => import('./pages/PrivacyPolicy'));
const Terms = lazy(() => import('./pages/Terms'));
const FAQ = lazy(() => import('./pages/FAQ'));
const Profile = lazy(() => import('./pages/Profile'));
const Shorts = lazy(() => import('./pages/Shorts'));
const Login = lazy(() => import('./pages/Login'));
const Register = lazy(() => import('./pages/Register'));
const ForgotPassword = lazy(() => import('./pages/ForgotPassword'));
const NotFound = lazy(() => import('./pages/NotFound'));

const queryClient = new QueryClient({
  defaultOptions: {
    queries: {
      staleTime: 5 * 60 * 1000,
      gcTime: 30 * 60 * 1000,
      retry: 1,
      refetchOnWindowFocus: false,
    },
  },
});

// Yeni sayfaya geçince başa kaydır; geri/ileri gezinmede tarayıcının konumu korunur.
const ScrollToTop = () => {
  const { pathname } = useLocation();
  const navigationType = useNavigationType();

  useLayoutEffect(() => {
    if (navigationType !== 'POP') window.scrollTo(0, 0);
  }, [pathname, navigationType]);

  return null;
};

const AppRoutes = () => {
  const { pathname } = useLocation();

  return (
    <Layout>
      <ErrorBoundary resetKey={pathname}>
        <Suspense fallback={<PageLoader />}>
          <Routes>
            <Route path="/" element={<Home />} />
            <Route path="/movies" element={<Movies />} />
            <Route path="/series" element={<Series />} />
            <Route path="/movie/:id/:slug?" element={<MovieDetail />} />
            <Route path="/tv/:id/:slug?" element={<SeriesDetail />} />
            <Route path="/watch/:type/:id/:slug?" element={<Watch />} />
            <Route path="/search" element={<Search />} />
            <Route path="/person/:id/:slug?" element={<Person />} />
            <Route path="/genre/:type/:id" element={<Genre />} />
            <Route path="/favorites" element={<Favorites />} />
            <Route path="/watch-later" element={<WatchLater />} />
            <Route path="/iletisim" element={<Contact />} />
            <Route path="/gizlilik-politikasi" element={<PrivacyPolicy />} />
            <Route path="/kullanim-kosullari" element={<Terms />} />
            <Route path="/sss" element={<FAQ />} />
            <Route path="/profile/:userId" element={<Profile />} />
            <Route path="/sahneler/:slug?" element={<Shorts />} />
            <Route path="/login" element={<Login />} />
            <Route path="/register" element={<Register />} />
            <Route path="/forgot-password" element={<ForgotPassword />} />
            <Route path="*" element={<NotFound />} />
          </Routes>
        </Suspense>
      </ErrorBoundary>
    </Layout>
  );
};

function App() {
  return (
    <ErrorBoundary>
      <HelmetProvider>
        <QueryClientProvider client={queryClient}>
          <AuthProvider>
            <AppProvider>
              <ToastProvider>
                <Router future={{ v7_startTransition: true, v7_relativeSplatPath: true }}>
                  <ScrollToTop />
                  <AppRoutes />
                </Router>
              </ToastProvider>
            </AppProvider>
          </AuthProvider>
        </QueryClientProvider>
      </HelmetProvider>
    </ErrorBoundary>
  );
}

export default App;
