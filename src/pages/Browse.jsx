import React, { useMemo } from 'react';
import { useSearchParams } from 'react-router-dom';
import { Helmet } from 'react-helmet-async';
import { FaFilm, FaTimes } from 'react-icons/fa';
import { useDiscover, useGenres } from '../hooks';
import { BROWSE_CONFIG, MAX_TMDB_PAGE, RATING_OPTIONS, getYearOptions, parseBrowseParams } from '../services/browse';
import MovieCard from '../components/UI/MovieCard';
import Pagination from '../components/UI/Pagination';
import { GridSkeleton } from '../components/UI/Loading';
import { EmptyState, ErrorState } from '../components/UI/States';
import { formatNumber } from '../utils/helpers';

const YEARS = getYearOptions();

const Browse = ({ mediaType }) => {
  const config = BROWSE_CONFIG[mediaType];
  const [searchParams, setSearchParams] = useSearchParams();
  const filters = useMemo(() => parseBrowseParams(mediaType, searchParams), [mediaType, searchParams]);
  const { data: genres = [] } = useGenres(mediaType);
  const { data, isLoading, isError, isPlaceholderData, refetch } = useDiscover(mediaType, filters);

  const items = data?.results || [];
  const totalPages = Math.min(data?.total_pages || 0, MAX_TMDB_PAGE);
  const genreName = genres.find(g => String(g.id) === filters.genre)?.name;
  const hasFilters = filters.genre || filters.year || filters.rating || filters.sort !== 'popular';
  const heading = genreName ? `${genreName} ${config.title.toLocaleLowerCase('tr-TR')}` : config.title;

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

  const goToPage = (page) => {
    update({ page });
    window.scrollTo({ top: 0, behavior: 'smooth' });
  };

  return (
    <>
      <Helmet>
        <title>{heading} - SINEFIX</title>
        <meta name="description" content={`${heading}: popüler, en yüksek puanlı ve en yeni içerikleri keşfedin.`} />
      </Helmet>

      <div className="page container-custom">
        <header className="mb-5 flex flex-wrap items-end justify-between gap-2">
          <div>
            <h1 className="page-title">{heading}</h1>
            {data?.total_results > 0 && (
              <p className="page-subtitle">{formatNumber(data.total_results)} sonuç</p>
            )}
          </div>
        </header>

        <div className="mb-6 grid grid-cols-2 gap-2 sm:grid-cols-4 lg:flex lg:flex-wrap lg:items-end lg:gap-3">
          <label className="col-span-2 sm:col-span-1 lg:w-52">
            <span className="field-label">Sıralama</span>
            <select className="select" value={filters.sort} onChange={(e) => update({ sort: e.target.value })}>
              {config.sorts.map(s => <option key={s.value} value={s.value}>{s.label}</option>)}
            </select>
          </label>
          <label className="lg:w-48">
            <span className="field-label">Tür</span>
            <select className="select" value={filters.genre} onChange={(e) => update({ genre: e.target.value })}>
              <option value="">Tüm türler</option>
              {genres.map(g => <option key={g.id} value={g.id}>{g.name}</option>)}
            </select>
          </label>
          <label className="lg:w-36">
            <span className="field-label">Yıl</span>
            <select className="select" value={filters.year} onChange={(e) => update({ year: e.target.value })}>
              <option value="">Tüm yıllar</option>
              {YEARS.map(y => <option key={y} value={y}>{y}</option>)}
            </select>
          </label>
          <label className="col-span-2 sm:col-span-1 lg:w-36">
            <span className="field-label">Puan</span>
            <select className="select" value={filters.rating} onChange={(e) => update({ rating: e.target.value })}>
              <option value="">Tümü</option>
              {RATING_OPTIONS.map(r => <option key={r} value={r}>{r}+ puan</option>)}
            </select>
          </label>
          {hasFilters && (
            <button
              type="button"
              onClick={() => setSearchParams({})}
              className="btn btn-ghost col-span-2 sm:col-span-4 lg:col-span-1"
            >
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
            <button type="button" className="btn btn-secondary" onClick={() => setSearchParams({})}>Filtreleri temizle</button>
          </EmptyState>
        ) : (
          <>
            <div className={`media-grid transition-opacity ${isPlaceholderData ? 'opacity-50' : ''}`}>
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
