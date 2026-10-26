import React, { useMemo, useState } from 'react';
import { Link } from 'react-router-dom';
import { FaTrash } from 'react-icons/fa';
import MovieCard from '../UI/MovieCard';
import Seo from '../Seo';
import { ConfirmModal } from '../UI/Modal';
import { EmptyState } from '../UI/States';
import { useToast } from '../UI/Toast';
import Segmented from '../UI/Segmented';
import SlideTransition from '../UI/SlideTransition';
import { useSlideDirection } from '../../hooks/useSlideDirection';

const FILTERS = [
  { id: 'all', label: 'Tümü' },
  { id: 'movie', label: 'Filmler' },
  { id: 'tv', label: 'Diziler' },
];

const SORTS = [
  { id: 'added', label: 'Son eklenen' },
  { id: 'rating', label: 'En yüksek puan' },
  { id: 'title', label: 'Ada göre (A-Z)' },
  { id: 'year', label: 'Yıla göre' },
];

const sorters = {
  added: (a, b) => (b.updatedAt || b.addedAt || '').localeCompare(a.updatedAt || a.addedAt || ''),
  rating: (a, b) => (b.vote_average || 0) - (a.vote_average || 0),
  title: (a, b) => (a.title || '').localeCompare(b.title || '', 'tr'),
  year: (a, b) => (b.release_date || '').localeCompare(a.release_date || ''),
};

// renderItem: kartın yerine özel içerik (ör. izlenen bölüm sayısı) göstermek için.
// summary: başlığın altında kitaplığa özel kısa istatistik.
const LibraryPage = ({
  title, description, icon: Icon, items, onClear, emptyTitle, emptyDescription, renderItem, summary, clearLabel = 'Listeyi temizle',
}) => {
  const { toast } = useToast();
  const [filter, setFilter] = useState('all');
  const direction = useSlideDirection(filter, FILTERS.map(f => f.id));
  const [sort, setSort] = useState('added');
  const [confirmOpen, setConfirmOpen] = useState(false);

  const counts = {
    all: items.length,
    movie: items.filter(i => i.media_type === 'movie').length,
    tv: items.filter(i => i.media_type === 'tv').length,
  };

  const visible = useMemo(
    () => items.filter(i => filter === 'all' || i.media_type === filter).sort(sorters[sort]),
    [items, filter, sort]
  );

  return (
    <>
      <Seo title={title} noindex />

      <div className="page container-custom">
        <header className="mb-6 flex flex-wrap items-end justify-between gap-4">
          <div>
            <h1 className="page-title flex items-center gap-3">
              {Icon && <Icon className="text-[0.7em] text-white/50" />}
              {title}
            </h1>
            <p className="page-subtitle">{description}</p>
            {summary && items.length > 0 && <p className="mt-2 text-sm text-white/60">{summary}</p>}
          </div>
          {items.length > 0 && (
            <button type="button" onClick={() => setConfirmOpen(true)} className="btn btn-ghost btn-sm text-red-300 hover:!text-red-200">
              <FaTrash className="text-xs" /> {clearLabel}
            </button>
          )}
        </header>

        {items.length === 0 ? (
          <EmptyState icon={Icon} title={emptyTitle} description={emptyDescription}>
            <div className="mt-5 flex flex-wrap justify-center gap-2">
              <Link to="/movies" className="btn btn-primary">Filmlere göz at</Link>
              <Link to="/series" className="btn btn-secondary">Dizilere göz at</Link>
            </div>
          </EmptyState>
        ) : (
          <>
            <div className="mb-6 flex flex-wrap items-center justify-between gap-3">
              <Segmented
                ariaLabel="Tür filtresi"
                options={FILTERS.map(f => ({ value: f.id, label: f.label, count: counts[f.id] }))}
                value={filter}
                onChange={setFilter}
              />
              <select className="select !h-[40px] !w-auto" value={sort} onChange={(e) => setSort(e.target.value)} aria-label="Sırala">
                {SORTS.map(s => <option key={s.id} value={s.id}>{s.label}</option>)}
              </select>
            </div>

            <SlideTransition id={filter} direction={direction}>
              {visible.length === 0 ? (
                <EmptyState title="Bu filtrede içerik yok" />
              ) : (
                <div className="media-grid">
                  {visible.map(item => renderItem
                    ? renderItem(item)
                    : <MovieCard key={`${item.media_type}-${item.id}`} item={item} mediaType={item.media_type} showType={filter === 'all'} />)}
                </div>
              )}
            </SlideTransition>
          </>
        )}
      </div>

      <ConfirmModal
        isOpen={confirmOpen}
        onClose={() => setConfirmOpen(false)}
        onConfirm={() => {
          onClear();
          toast.success('Liste temizlendi');
        }}
        title={`${title} temizlensin mi?`}
        message={`${items.length} içeriğin tamamı listeden kaldırılacak. Bu işlem geri alınamaz.`}
        confirmText="Temizle"
      />
    </>
  );
};

export default LibraryPage;
