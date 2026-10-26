import React, { useEffect, useRef, useState } from 'react';
import { Link, useSearchParams } from 'react-router-dom';
import { FaSearch, FaTimes } from 'react-icons/fa';
import { useDebounce, useSearch, useTrending } from '../hooks';
import MovieCard from '../components/UI/MovieCard';
import Segmented from '../components/UI/Segmented';
import Seo from '../components/Seo';
import PersonCard from '../components/UI/PersonCard';
import Pagination from '../components/UI/Pagination';
import MediaRow from '../components/UI/MediaRow';
import { GridSkeleton, Spinner } from '../components/UI/Loading';
import { EmptyState, ErrorState } from '../components/UI/States';
import { QUICK_GENRES } from '../components/UI/SearchModal';
import { formatNumber } from '../utils/helpers';

const FILTERS = [
  { id: 'all', label: 'Tümü' },
  { id: 'movie', label: 'Filmler' },
  { id: 'tv', label: 'Diziler' },
  { id: 'person', label: 'Kişiler' },
];

const MAX_PAGE = 500;

const Search = () => {
  const [searchParams, setSearchParams] = useSearchParams();
  const urlQuery = searchParams.get('q') || '';
  const page = Math.max(1, Number(searchParams.get('page')) || 1);
  const filter = FILTERS.some(f => f.id === searchParams.get('type')) ? searchParams.get('type') : 'all';

  const [input, setInput] = useState(urlQuery);
  const debounced = useDebounce(input.trim(), 400);
  const inputRef = useRef(null);
  const query = urlQuery.trim();

  const { data, isLoading, isFetching, isError, refetch } = useSearch(query, page, filter);
  const trending = useTrending('week');

  // Tarayıcı geri/ileri tuşlarıyla URL değişirse input'u güncelle
  useEffect(() => {
    setInput(current => (current.trim() === urlQuery ? current : urlQuery));
  }, [urlQuery]);

  // Yazdıkça URL'yi güncelle (geçmişi kirletmeden)
  useEffect(() => {
    if (debounced === query) return;
    const next = new URLSearchParams();
    if (debounced) next.set('q', debounced);
    if (filter !== 'all') next.set('type', filter);
    setSearchParams(next, { replace: true });
  }, [debounced]);

  useEffect(() => {
    if (!query) inputRef.current?.focus();
  }, []);

  const setParam = (changes) => {
    const next = new URLSearchParams(searchParams);
    Object.entries(changes).forEach(([key, value]) => {
      if (value && value !== 'all' && !(key === 'page' && value === 1)) next.set(key, value);
      else next.delete(key);
    });
    setSearchParams(next);
  };

  const results = (data?.results || []).filter(item =>
    filter === 'all' ? ['movie', 'tv', 'person'].includes(item.media_type) : item.media_type === filter
  );
  const people = results.filter(item => item.media_type === 'person');
  const titles = results.filter(item => item.media_type !== 'person');
  const totalPages = Math.min(data?.total_pages || 0, MAX_PAGE);
  const tooShort = query.length > 0 && query.length < 2;

  return (
    <>
      <Seo title={query ? `“${query}” arama sonuçları` : 'Ara'} noindex />

      <div className="page container-custom">
        <form
          role="search"
          className="mb-5"
          onSubmit={(event) => {
            event.preventDefault();
            setParam({ q: input.trim(), page: 1 });
            inputRef.current?.blur();
          }}
        >
          <label htmlFor="search-input" className="sr-only">Film, dizi veya kişi ara</label>
          <div className="input-with-icon">
            <FaSearch />
            <input
              id="search-input"
              ref={inputRef}
              type="search"
              value={input}
              onChange={(event) => setInput(event.target.value)}
              placeholder="Film, dizi veya kişi ara…"
              className="input !h-12 !pr-12 !text-base"
              enterKeyHint="search"
              autoComplete="off"
            />
            {input && (
              <button
                type="button"
                onClick={() => {
                  setInput('');
                  inputRef.current?.focus();
                }}
                className="icon-btn absolute right-1 top-1/2 -translate-y-1/2"
                aria-label="Aramayı temizle"
              >
                <FaTimes className="text-sm" />
              </button>
            )}
          </div>
        </form>

        {query.length >= 2 && (
          <div className="mb-6 flex flex-wrap items-center justify-between gap-3">
            <Segmented
              ariaLabel="Sonuç türü"
              options={FILTERS.map(f => ({ value: f.id, label: f.label }))}
              value={filter}
              onChange={(type) => setParam({ type, page: 1 })}
            />
            <div className="flex items-center gap-2 text-sm text-white/45">
              {isFetching && <Spinner className="!h-4 !w-4" />}
              {data && `${formatNumber(data.total_results)} sonuç`}
            </div>
          </div>
        )}

        {!query || tooShort ? (
          <div className="space-y-8">
            {tooShort && <p className="text-sm text-white/45">Aramak için en az 2 karakter yazın.</p>}
            <div>
              <h2 className="section-title mb-3">Türlere göz at</h2>
              <div className="flex flex-wrap gap-2">
                {QUICK_GENRES.map(genre => (
                  <Link key={genre.name} to={genre.path} className="chip">{genre.name}</Link>
                ))}
              </div>
            </div>
            <div className="-mx-[var(--gutter)]">
              <MediaRow title="Bu hafta popüler" items={trending.data?.results} loading={trending.isLoading} showType />
            </div>
          </div>
        ) : isError ? (
          <ErrorState onRetry={refetch} />
        ) : isLoading ? (
          <GridSkeleton count={12} />
        ) : results.length === 0 ? (
          <EmptyState
            icon={FaSearch}
            title="Sonuç bulunamadı"
            description={`“${query}” için ${filter === 'all' ? '' : `${FILTERS.find(f => f.id === filter).label.toLocaleLowerCase('tr-TR')} arasında `}sonuç yok. Yazımı kontrol edin veya farklı bir kelime deneyin.`}
          />
        ) : (
          <>
            {people.length > 0 && (
              <section className="mb-10">
                {filter === 'all' && <h2 className="section-title mb-4">Kişiler</h2>}
                <div className="media-grid compact">
                  {people.map(person => <PersonCard key={person.id} person={person} />)}
                </div>
              </section>
            )}
            {titles.length > 0 && (
              <section>
                {filter === 'all' && people.length > 0 && <h2 className="section-title mb-4">Film ve diziler</h2>}
                <div className="media-grid">
                  {titles.map(item => <MovieCard key={`${item.media_type}-${item.id}`} item={item} showType />)}
                </div>
              </section>
            )}
            <Pagination
              page={page}
              totalPages={totalPages}
              onChange={(p) => {
                setParam({ page: p });
                window.scrollTo({ top: 0, behavior: 'smooth' });
              }}
            />
          </>
        )}
      </div>
    </>
  );
};

export default Search;
