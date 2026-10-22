import React, { useEffect, useRef, useState } from 'react';
import { createPortal } from 'react-dom';
import { useNavigate } from 'react-router-dom';
import { FaSearch, FaTimes, FaFilm, FaTv, FaStar, FaArrowRight } from 'react-icons/fa';
import { getImageUrl } from '../../services/tmdb';
import { useDebounce, useSearch } from '../../hooks';
import { getDetailPath, getMediaLabel, getReleaseDate, getTitle, getYear } from '../../utils/helpers';
import { useBodyScrollLock } from './Modal';
import { Spinner } from './Loading';

export const QUICK_GENRES = [
  { name: 'Aksiyon', path: '/movies?genre=28' },
  { name: 'Komedi', path: '/movies?genre=35' },
  { name: 'Dram', path: '/movies?genre=18' },
  { name: 'Bilim Kurgu', path: '/movies?genre=878' },
  { name: 'Korku', path: '/movies?genre=27' },
  { name: 'Animasyon', path: '/movies?genre=16' },
  { name: 'Suç', path: '/series?genre=80' },
  { name: 'Belgesel', path: '/movies?genre=99' },
];

const SearchModal = ({ isOpen, onClose }) => {
  const navigate = useNavigate();
  const inputRef = useRef(null);
  const listRef = useRef(null);
  const [query, setQuery] = useState('');
  const [selected, setSelected] = useState(-1);
  const debounced = useDebounce(query.trim(), 300);
  const { data, isFetching, isError } = useSearch(isOpen ? debounced : '');

  const results = debounced.length >= 2
    ? (data?.results || []).filter(item => item.media_type === 'movie' || item.media_type === 'tv').slice(0, 8)
    : [];

  useBodyScrollLock(isOpen);

  useEffect(() => {
    if (isOpen) {
      setQuery('');
      setSelected(-1);
    }
  }, [isOpen]);

  useEffect(() => setSelected(-1), [debounced]);

  useEffect(() => {
    listRef.current?.querySelector('[data-selected="true"]')?.scrollIntoView({ block: 'nearest' });
  }, [selected]);

  const go = (path) => {
    onClose();
    navigate(path);
  };

  const showAll = () => {
    if (query.trim()) go(`/search?q=${encodeURIComponent(query.trim())}`);
  };

  const onKeyDown = (event) => {
    if (event.key === 'Escape') {
      event.preventDefault();
      onClose();
    } else if (event.key === 'ArrowDown') {
      event.preventDefault();
      setSelected(i => Math.min(i + 1, results.length - 1));
    } else if (event.key === 'ArrowUp') {
      event.preventDefault();
      setSelected(i => Math.max(i - 1, -1));
    } else if (event.key === 'Enter') {
      event.preventDefault();
      if (selected >= 0 && results[selected]) go(getDetailPath(results[selected]));
      else showAll();
    }
  };

  if (!isOpen) return null;

  const tooShort = query.trim().length > 0 && query.trim().length < 2;
  const waiting = debounced !== query.trim() || isFetching;

  return createPortal(
    <div className="modal-overlay search-overlay" onMouseDown={(event) => event.target === event.currentTarget && onClose()}>
      <div className="search-panel" role="dialog" aria-modal="true" aria-label="Arama" onKeyDown={onKeyDown}>
        <div className="flex items-center gap-3 border-b border-white/[0.06] px-4 py-3 sm:px-5">
          <FaSearch className="flex-shrink-0 text-white/40" />
          <input
            ref={inputRef}
            // Açılır açılmaz odaklan; bir kare beklemek hızlı yazılan ilk harfi kaybettiriyordu.
            autoFocus
            type="search"
            value={query}
            onChange={(event) => setQuery(event.target.value)}
            placeholder="Film veya dizi ara…"
            className="h-10 min-w-0 flex-1 bg-transparent text-base text-white placeholder-white/30 focus:outline-none"
            aria-autocomplete="list"
            enterKeyHint="search"
          />
          {waiting && debounced.length >= 2 && <Spinner className="!h-4 !w-4" />}
          <button type="button" onClick={onClose} className="icon-btn -mr-2" aria-label="Aramayı kapat">
            <FaTimes />
          </button>
        </div>

        <div ref={listRef} className="flex-1 overflow-y-auto overscroll-contain p-2 sm:p-3">
          {query.trim() === '' && (
            <div className="p-3">
              <p className="mb-3 text-xs font-semibold text-white/40">Türlere göz at</p>
              <div className="flex flex-wrap gap-2">
                {QUICK_GENRES.map(genre => (
                  <button key={genre.name} type="button" className="chip" onClick={() => go(genre.path)}>
                    {genre.name}
                  </button>
                ))}
              </div>
            </div>
          )}

          {tooShort && <p className="p-6 text-center text-sm text-white/40">Aramak için en az 2 karakter yazın.</p>}

          {isError && <p className="p-6 text-center text-sm text-white/40">Arama yapılamadı. Bağlantınızı kontrol edin.</p>}

          {!waiting && !isError && debounced.length >= 2 && results.length === 0 && (
            <p className="p-6 text-center text-sm text-white/40">“{debounced}” için sonuç bulunamadı.</p>
          )}

          {results.length > 0 && (
            <ul role="listbox" aria-label="Arama sonuçları">
              {results.map((item, index) => {
                const year = getYear(getReleaseDate(item));
                return (
                  <li key={`${item.media_type}-${item.id}`}>
                    <button
                      type="button"
                      role="option"
                      aria-selected={selected === index}
                      data-selected={selected === index}
                      className={`search-result ${selected === index ? 'selected' : ''}`}
                      onMouseEnter={() => setSelected(index)}
                      onClick={() => go(getDetailPath(item))}
                    >
                      <span className="search-result-poster">
                        {item.poster_path ? (
                          <img src={getImageUrl(item.poster_path, 'w92')} alt="" loading="lazy" />
                        ) : item.media_type === 'tv' ? <FaTv /> : <FaFilm />}
                      </span>
                      <span className="min-w-0 flex-1">
                        <span className="block truncate text-[15px] font-semibold">{getTitle(item)}</span>
                        <span className="mt-1 flex items-center gap-2 text-xs text-white/45">
                          <span>{getMediaLabel(item.media_type)}</span>
                          {year && <span>· {year}</span>}
                          {item.vote_average > 0 && (
                            <span className="inline-flex items-center gap-1 text-[var(--star)]">
                              · <FaStar className="text-[9px]" /> {item.vote_average.toFixed(1)}
                            </span>
                          )}
                        </span>
                      </span>
                    </button>
                  </li>
                );
              })}
            </ul>
          )}
        </div>

        {query.trim().length >= 2 && (
          <button
            type="button"
            onClick={showAll}
            className="flex items-center justify-between gap-3 border-t border-white/[0.06] px-5 py-3.5 text-sm font-semibold text-white/80 hover:bg-white/[0.04] hover:text-white"
          >
            <span className="truncate">“{query.trim()}” için tüm sonuçlar</span>
            <FaArrowRight className="flex-shrink-0 text-xs" />
          </button>
        )}

        <div className="hidden items-center gap-4 border-t border-white/[0.06] px-5 py-2.5 text-xs text-white/35 sm:flex">
          <span className="flex items-center gap-1.5"><kbd>↑</kbd><kbd>↓</kbd> gezin</span>
          <span className="flex items-center gap-1.5"><kbd>Enter</kbd> aç</span>
          <span className="flex items-center gap-1.5"><kbd>Esc</kbd> kapat</span>
        </div>
      </div>
    </div>,
    document.body
  );
};

export default SearchModal;
