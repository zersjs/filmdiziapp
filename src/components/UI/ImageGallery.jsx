import React, { useCallback, useEffect, useState } from 'react';
import { createPortal } from 'react-dom';
import { FaTimes, FaChevronLeft, FaChevronRight } from 'react-icons/fa';
import { getImageUrl } from '../../services/tmdb';
import { useBodyScrollLock, useEscapeKey } from './Modal';

const TABS = [
  { id: 'backdrops', label: 'Sahneler' },
  { id: 'posters', label: 'Posterler' },
  { id: 'logos', label: 'Logolar' },
];

const MAX_IMAGES = 24;

const ImageGallery = ({ images, title }) => {
  const tabs = TABS
    .map(tab => ({ ...tab, count: Math.min(images?.[tab.id]?.length || 0, MAX_IMAGES) }))
    .filter(tab => tab.count > 0);
  const [activeTab, setActiveTab] = useState(tabs[0]?.id);
  const [index, setIndex] = useState(null);

  const current = (images?.[activeTab] || []).slice(0, MAX_IMAGES);
  const isOpen = index !== null;

  const go = useCallback((delta) => {
    setIndex(i => (i === null ? i : Math.min(Math.max(i + delta, 0), current.length - 1)));
  }, [current.length]);

  useBodyScrollLock(isOpen);
  useEscapeKey(isOpen, () => setIndex(null));

  useEffect(() => {
    if (!isOpen) return undefined;
    const onKey = (event) => {
      if (event.key === 'ArrowRight') go(1);
      if (event.key === 'ArrowLeft') go(-1);
    };
    window.addEventListener('keydown', onKey);
    return () => window.removeEventListener('keydown', onKey);
  }, [isOpen, go]);

  if (tabs.length === 0) return null;

  const isPoster = activeTab === 'posters';
  const isLogo = activeTab === 'logos';

  return (
    <section>
      <div className="mb-4 flex flex-wrap items-center justify-between gap-3">
        <h2 className="section-title">Görseller</h2>
        {tabs.length > 1 && (
          <div className="segmented">
            {tabs.map(tab => (
              <button key={tab.id} type="button" className={activeTab === tab.id ? 'active' : ''} onClick={() => setActiveTab(tab.id)}>
                {tab.label} <span className="opacity-60">{tab.count}</span>
              </button>
            ))}
          </div>
        )}
      </div>

      <div className={`grid gap-3 ${isPoster ? 'grid-cols-3 sm:grid-cols-4 lg:grid-cols-6' : 'grid-cols-1 xs:grid-cols-2 lg:grid-cols-3'}`}>
        {current.map((image, i) => (
          <button
            key={image.file_path}
            type="button"
            onClick={() => setIndex(i)}
            className={`group relative overflow-hidden rounded-xl bg-[#111] ${isPoster ? 'aspect-[2/3]' : 'aspect-video'} ${isLogo ? 'p-6' : ''}`}
            aria-label={`${title} görsel ${i + 1}`}
          >
            <img
              src={getImageUrl(image.file_path, isPoster ? 'w342' : 'w780')}
              alt=""
              loading="lazy"
              className={`h-full w-full transition-transform duration-500 group-hover:scale-105 ${isLogo ? 'object-contain' : 'object-cover'}`}
            />
          </button>
        ))}
      </div>

      {isOpen && current[index] && createPortal(
        <div className="modal-overlay !p-0" onMouseDown={(event) => event.target === event.currentTarget && setIndex(null)}>
          <button type="button" className="icon-btn bordered absolute right-4 top-4 z-10" onClick={() => setIndex(null)} aria-label="Kapat">
            <FaTimes />
          </button>
          {index > 0 && (
            <button type="button" className="icon-btn bordered lg absolute left-3 top-1/2 z-10 -translate-y-1/2" onClick={() => go(-1)} aria-label="Önceki">
              <FaChevronLeft />
            </button>
          )}
          {index < current.length - 1 && (
            <button type="button" className="icon-btn bordered lg absolute right-3 top-1/2 z-10 -translate-y-1/2" onClick={() => go(1)} aria-label="Sonraki">
              <FaChevronRight />
            </button>
          )}
          <img
            src={getImageUrl(current[index].file_path, 'original')}
            alt={`${title} görsel ${index + 1}`}
            className="max-h-[85dvh] max-w-[calc(100%-32px)] rounded-lg object-contain"
          />
          <div className="absolute bottom-4 left-1/2 -translate-x-1/2 rounded-full bg-black/60 px-3 py-1 text-xs text-white/80">
            {index + 1} / {current.length}
          </div>
        </div>,
        document.body
      )}
    </section>
  );
};

export default ImageGallery;
