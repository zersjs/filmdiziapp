import React from 'react';
import { FaChevronLeft, FaChevronRight } from 'react-icons/fa';

export const getPageItems = (page, totalPages, siblings = 1) => {
  if (totalPages <= 1) return [];
  const pages = new Set([1, totalPages]);
  for (let p = page - siblings; p <= page + siblings; p += 1) {
    if (p >= 1 && p <= totalPages) pages.add(p);
  }
  const sorted = [...pages].sort((a, b) => a - b);
  const items = [];
  sorted.forEach((p, index) => {
    if (index > 0 && p - sorted[index - 1] > 1) items.push(`gap-${p}`);
    items.push(p);
  });
  return items;
};

const Pagination = ({ page, totalPages, onChange }) => {
  if (totalPages <= 1) return null;
  const items = getPageItems(page, totalPages);

  return (
    <nav className="pagination" aria-label="Sayfalama">
      <button type="button" className="page-btn" onClick={() => onChange(page - 1)} disabled={page <= 1} aria-label="Önceki sayfa">
        <FaChevronLeft className="text-xs" />
        <span className="hidden sm:inline">Önceki</span>
      </button>
      {items.map(item =>
        typeof item === 'string' ? (
          <span key={item} className="page-ellipsis">…</span>
        ) : (
          <button
            type="button"
            key={item}
            className={`page-btn ${item === page ? 'active' : ''}`}
            onClick={() => onChange(item)}
            aria-current={item === page ? 'page' : undefined}
          >
            {item}
          </button>
        )
      )}
      <button type="button" className="page-btn" onClick={() => onChange(page + 1)} disabled={page >= totalPages} aria-label="Sonraki sayfa">
        <span className="hidden sm:inline">Sonraki</span>
        <FaChevronRight className="text-xs" />
      </button>
    </nav>
  );
};

export default Pagination;
