import React, { useCallback, useEffect, useRef, useState } from 'react';
import { Link } from 'react-router-dom';
import { FaChevronLeft, FaChevronRight } from 'react-icons/fa';
import MovieCard from './MovieCard';
import { RowSkeleton } from './Loading';

// Yatay kaydırmalı içerik satırı. Kaydırıcı ekran kenarına kadar uzanır,
// ilk kart ise sayfa kapsayıcısıyla hizalı başlar.
export const Row = ({ title, icon, link, linkLabel = 'Tümü', actions, loading, skeleton = 'poster', children }) => {
  const scrollerRef = useRef(null);
  const [edges, setEdges] = useState({ start: true, end: false });
  const itemCount = React.Children.count(children);

  const updateEdges = useCallback(() => {
    const el = scrollerRef.current;
    if (!el) return;
    setEdges({
      start: el.scrollLeft <= 8,
      end: el.scrollLeft + el.clientWidth >= el.scrollWidth - 8,
    });
  }, []);

  useEffect(() => {
    updateEdges();
    const el = scrollerRef.current;
    if (!el || typeof ResizeObserver === 'undefined') return undefined;
    const observer = new ResizeObserver(updateEdges);
    observer.observe(el);
    return () => observer.disconnect();
  }, [updateEdges, loading, itemCount]);

  const scrollBy = (direction) => {
    const el = scrollerRef.current;
    if (!el) return;
    el.scrollBy({ left: direction * el.clientWidth * 0.8, behavior: 'smooth' });
  };

  return (
    <section className="row">
      <div className="row-header container-custom">
        <h2 className="row-title section-title">
          {icon}
          <span className="truncate">{title}</span>
        </h2>
        <div className="row-controls">
          {actions}
          {link && <Link to={link} className="row-link">{linkLabel}</Link>}
          <button type="button" className="icon-btn bordered row-arrow" onClick={() => scrollBy(-1)} disabled={edges.start} aria-label="Geri kaydır">
            <FaChevronLeft />
          </button>
          <button type="button" className="icon-btn bordered row-arrow" onClick={() => scrollBy(1)} disabled={edges.end} aria-label="İleri kaydır">
            <FaChevronRight />
          </button>
        </div>
      </div>
      {loading ? (
        <RowSkeleton variant={skeleton} />
      ) : (
        <div className="row-scroller" ref={scrollerRef} onScroll={updateEdges}>
          {children}
        </div>
      )}
    </section>
  );
};

const MediaRow = ({ items = [], mediaType, showType = false, limit = 20, emptyHidden = true, ...rowProps }) => {
  if (!rowProps.loading && emptyHidden && items.length === 0) return null;

  return (
    <Row {...rowProps}>
      {items.slice(0, limit).map(item => (
        <div key={`${item.media_type || mediaType}-${item.id}`} className="row-item">
          <MovieCard item={item} mediaType={mediaType} showType={showType} />
        </div>
      ))}
    </Row>
  );
};

export default MediaRow;
