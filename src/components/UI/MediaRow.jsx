import React, { useCallback, useEffect, useLayoutEffect, useRef, useState } from 'react';
import { Link } from 'react-router-dom';
import { FaChevronLeft, FaChevronRight } from 'react-icons/fa';
import MovieCard from './MovieCard';
import { RowSkeleton } from './Loading';

// Ekranın altında başlayan satırlar görünür alana girince belirir. İlk çizimde
// görünür olan satırlar hiç gizlenmez (içerik kayması ve yanıp sönme olmaz).
const useReveal = () => {
  const ref = useRef(null);
  const [state, setState] = useState('idle');

  useLayoutEffect(() => {
    const el = ref.current;
    if (!el || typeof IntersectionObserver === 'undefined') return undefined;
    if (el.getBoundingClientRect().top < window.innerHeight) return undefined;
    setState('pending');
    const observer = new IntersectionObserver((entries) => {
      if (entries.some(entry => entry.isIntersecting)) {
        setState('revealed');
        observer.disconnect();
      }
    }, { rootMargin: '0px 0px -8% 0px' });
    observer.observe(el);
    return () => observer.disconnect();
  }, []);

  return [ref, state === 'pending' ? 'reveal-pending' : state === 'revealed' ? 'revealed' : ''];
};

// Yatay kaydırmalı içerik satırı. Kaydırıcı ekran kenarına kadar uzanır,
// ilk kart ise sayfa kapsayıcısıyla hizalı başlar.
export const Row = ({ title, icon, link, linkLabel = 'Tümü', actions, loading, skeleton = 'poster', children }) => {
  const scrollerRef = useRef(null);
  const [revealRef, revealClass] = useReveal();
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
    <section className={`row ${revealClass}`} ref={revealRef}>
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

const MediaRow = ({ items = [], mediaType, showType = false, limit = 20, emptyHidden = true, currentId, ...rowProps }) => {
  if (!rowProps.loading && emptyHidden && items.length === 0) return null;

  return (
    <Row {...rowProps}>
      {items.slice(0, limit).map(item => (
        <div
          key={`${item.media_type || mediaType}-${item.id}`}
          className={`row-item ${item.id === currentId ? 'is-current' : ''}`}
          aria-current={item.id === currentId ? 'page' : undefined}
        >
          <MovieCard item={item} mediaType={mediaType} showType={showType} />
        </div>
      ))}
    </Row>
  );
};

export default MediaRow;
