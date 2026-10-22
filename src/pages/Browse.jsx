import React, { useEffect, useMemo, useRef } from 'react';
import { Link, Navigate, useLocation, useNavigate, useParams, useSearchParams } from 'react-router-dom';
import { FaFilm, FaTimes } from 'react-icons/fa';
import { useDiscover, useWatchProviders } from '../hooks';
import {
  BROWSE_CONFIG, MAX_TMDB_PAGE, RATING_OPTIONS, getYearOptions, hasRefiningFilters, parseBrowseParams,
} from '../services/browse';
import { GENRES, genreById, genreBySlug, genreHeading, genrePath } from '../lib/genres';
import { STATIC_PAGES, genreSeo } from '../lib/seo';
import Seo, { getSiteUrl } from '../components/Seo';
import Breadcrumbs from '../components/UI/Breadcrumbs';
import MovieCard from '../components/UI/MovieCard';
import Pagination from '../components/UI/Pagination';
import { GridSkeleton } from '../components/UI/Loading';
import { EmptyState, ErrorState } from '../components/UI/States';
import { formatNumber } from '../utils/helpers';
import NotFound from './NotFound';

const YEARS = getYearOptions();

// Tür seçimi adres yolunu değiştirir; diğer filtreler (sayfa hariç) korunur.
const withoutPage = (searchParams) => {
  const next = new URLSearchParams(searchParams);
  next.delete('page');
  next.delete('genre');
  const query = next.toString();
  return query ? `?${query}` : '';
};

const GenreChips = ({ mediaType, active }) => {
  const { search } = useLocation();
  const listRef = useRef(null);
  const basePath = BROWSE_CONFIG[mediaType].path;
  const query = withoutPage(new URLSearchParams(search));

  useEffect(() => {
    const chip = listRef.current?.querySelector('[aria-current="page"]');
    if (!chip) return;
    const list = listRef.current;
    list.scrollLeft = chip.offsetLeft - (list.clientWidth - chip.clientWidth) / 2;
  }, [active]);

  return (
    <nav aria-label="Türler" className="genre-chips no-scrollbar" ref={listRef}>
      <Link to={`${basePath}${query}`} className={`chip ${!active ? 'active' : ''}`} aria-current={!active ? 'page' : undefined}>
        Tümü
      </Link>
      {GENRES[mediaType].map(genre => (
        <Link
          key={genre.id}
          to={`${genrePath(mediaType, genre)}${query}`}
          className={`chip ${active?.id === genre.id ? 'active' : ''}`}
          aria-current={active?.id === genre.id ? 'page' : undefined}
        >
          {genre.name}
        </Link>
      ))}
    </nav>
  );
};

const Browse = ({ mediaType }) => {
  const config = BROWSE_CONFIG[mediaType];
  const { genreSlug } = useParams();
  const [searchParams, setSearchParams] = useSearchParams();
  const navigate = useNavigate();
  const genre = genreSlug ? genreBySlug(mediaType, genreSlug) : null;
  const filters = useMemo(() => parseBrowseParams(mediaType, searchParams, genre?.id), [mediaType, searchParams, genre]);
  const { data, isLoading, isError, isPlaceholderData, refetch } = useDiscover(mediaType, filters);
  const { data: providers = [] } = useWatchProviders(mediaType);

  // Eski ?genre=28 bağlantıları kalıcı tür adresine taşınır.
  const legacyGenre = genreById(mediaType, searchParams.get('genre'));
  if (!genreSlug && legacyGenre) {
    return <Navigate to={`${genrePath(mediaType, legacyGenre)}${withoutPage(searchParams)}`} replace />;
  }
  if (genreSlug && !genre) return <NotFound />;

  const items = data?.results || [];
  const totalPages = Math.min(data?.total_pages || 0, MAX_TMDB_PAGE);
  const basePath = genre ? genrePath(mediaType, genre) : config.path;
  const heading = genre ? genreHeading(mediaType, genre) : config.title;
  const refining = hasRefiningFilters(filters);
  const provider = providers.find(p => String(p.provider_id) === filters.provider);

  const seo = genre
    ? genreSeo(mediaType, genre, getSiteUrl(), isPlaceholderData ? [] : items)
    : { ...STATIC_PAGES[config.path], path: config.path, jsonLd: [] };
  // Filtre kombinasyonları ana sayfaya, sayfalama kendi adresine canonical olur.
  const canonical = refining || filters.page === 1 ? basePath : `${basePath}?page=${filters.page}`;
  const pageSuffix = filters.page > 1 ? ` (Sayfa ${filters.page})` : '';

  const update = (changes) => {
    const next = new URLSearchParams(searchParams);
    Object.entries(changes).forEach(([key, value]) => {
      if (value && !(key === 'sort' && value === 'popular') && !(key === 'page' && Number(value) === 1)) {
        next.set(key, value);
      } else {
        next.delete(key);
      }
    });
    if (!('page' in changes)) next.delete('page');
    setSearchParams(next);
  };

  const clearFilters = () => navigate(config.path);

  const goToPage = (page) => {
    update({ page });
    window.scrollTo({ top: 0, behavior: 'smooth' });
  };

  return (
    <>
      <Seo
        title={`${seo.title}${pageSuffix}`}
        description={seo.description}
        path={canonical}
        jsonLd={seo.jsonLd}
      />

      <div className="page container-custom">
        {genre && <Breadcrumbs items={seo.breadcrumbs} className="mb-3" />}
        <header className="mb-4">
          <h1 className="page-title">
            {heading}
            {provider && <span className="text-white/45"> · {provider.provider_name}</span>}
          </h1>
          <p className="page-subtitle">
            {data?.total_results > 0 ? `${formatNumber(data.total_results)} sonuç` : ' '}
            {genre && filters.page === 1 && !refining && (
              <span className="hidden sm:inline"> · {seo.description}</span>
            )}
          </p>
        </header>

        <GenreChips mediaType={mediaType} active={genre} />

        <div className="mb-6 mt-4 grid grid-cols-2 gap-2 sm:grid-cols-4 lg:flex lg:flex-wrap lg:items-end lg:gap-3">
          <label className="lg:w-52">
            <span className="field-label">Sıralama</span>
            <select className="select" value={filters.sort} onChange={(e) => update({ sort: e.target.value })}>
              {config.sorts.map(s => <option key={s.value} value={s.value}>{s.label}</option>)}
            </select>
          </label>
          <label className="lg:w-48">
            <span className="field-label">Platform</span>
            <select className="select" value={filters.provider} onChange={(e) => update({ provider: e.target.value })}>
              <option value="">Tüm platformlar</option>
              {providers.map(p => <option key={p.provider_id} value={p.provider_id}>{p.provider_name}</option>)}
            </select>
          </label>
          <label className="lg:w-36">
            <span className="field-label">Yıl</span>
            <select className="select" value={filters.year} onChange={(e) => update({ year: e.target.value })}>
              <option value="">Tüm yıllar</option>
              {YEARS.map(y => <option key={y} value={y}>{y}</option>)}
            </select>
          </label>
          <label className="lg:w-36">
            <span className="field-label">Puan</span>
            <select className="select" value={filters.rating} onChange={(e) => update({ rating: e.target.value })}>
              <option value="">Tümü</option>
              {RATING_OPTIONS.map(r => <option key={r} value={r}>{r}+ puan</option>)}
            </select>
          </label>
          {(refining || genre) && (
            <button type="button" onClick={clearFilters} className="btn btn-ghost col-span-2 sm:col-span-4 lg:col-span-1">
              <FaTimes className="text-xs" /> Filtreleri temizle
            </button>
          )}
        </div>

        {isError ? (
          <ErrorState onRetry={refetch} />
        ) : isLoading ? (
          <GridSkeleton count={18} />
        ) : items.length === 0 ? (
          <EmptyState
            icon={FaFilm}
            title="Sonuç bulunamadı"
            description="Bu filtrelerle eşleşen içerik yok. Filtreleri değiştirmeyi veya temizlemeyi deneyin."
          >
            <button type="button" className="btn btn-secondary" onClick={clearFilters}>Filtreleri temizle</button>
          </EmptyState>
        ) : (
          <>
            {/* Anahtarsız: yalnızca yeni gelen kartlar belirme animasyonu oynatır. */}
            <div className={`media-grid stagger transition-opacity ${isPlaceholderData ? 'opacity-50' : ''}`}>
              {items.map(item => <MovieCard key={item.id} item={item} mediaType={mediaType} />)}
            </div>
            <Pagination page={filters.page} totalPages={totalPages} onChange={goToPage} />
          </>
        )}
      </div>
    </>
  );
};

export default Browse;
