import React from 'react';

export const Spinner = ({ className = '' }) => (
  <div className={`spinner ${className}`} role="status" aria-label="Yükleniyor" />
);

export const PageLoader = () => (
  <div className="flex min-h-[60vh] items-center justify-center">
    <Spinner />
  </div>
);

export const CardSkeleton = () => (
  <div aria-hidden="true">
    <div className="skeleton aspect-[2/3] rounded-xl" />
    <div className="skeleton mt-3 h-3.5 w-4/5" />
    <div className="skeleton mt-2 h-3 w-2/5" />
  </div>
);

export const GridSkeleton = ({ count = 12, compact = false }) => (
  <div className={`media-grid ${compact ? 'compact' : ''}`}>
    {Array.from({ length: count }, (_, i) => <CardSkeleton key={i} />)}
  </div>
);

export const RowSkeleton = ({ count = 8, variant = 'poster' }) => (
  <div className="row-scroller" aria-hidden="true">
    {Array.from({ length: count }, (_, i) => (
      <div key={i} className={`row-item ${variant === 'poster' ? '' : variant}`}>
        {variant === 'poster' ? (
          <CardSkeleton />
        ) : (
          <div className={`skeleton rounded-xl ${variant === 'wide' ? 'aspect-video' : 'aspect-[9/14]'}`} />
        )}
      </div>
    ))}
  </div>
);

export const HeroSkeleton = () => (
  <section className="hero" aria-hidden="true">
    <div className="hero-content container-custom">
      <div className="hero-inner w-full">
        <div className="skeleton h-5 w-40" />
        <div className="skeleton mt-4 h-10 w-3/4 sm:h-14" />
        <div className="skeleton mt-4 h-4 w-full max-w-md" />
        <div className="skeleton mt-2 h-4 w-2/3 max-w-sm" />
        <div className="mt-6 flex gap-3">
          <div className="skeleton h-11 w-28 rounded-[10px]" />
          <div className="skeleton h-11 w-28 rounded-[10px]" />
        </div>
      </div>
    </div>
  </section>
);

export const DetailSkeleton = () => (
  <div aria-hidden="true">
    <div className="container-custom">
      <div className="detail-hero-inner">
        <div className="skeleton aspect-[2/3] rounded-xl" />
        <div>
          <div className="skeleton h-8 w-3/4 sm:h-12" />
          <div className="skeleton mt-4 h-4 w-1/2" />
          <div className="skeleton mt-3 h-4 w-1/3" />
        </div>
      </div>
      <div className="mt-6 space-y-3">
        <div className="skeleton h-4 w-full max-w-2xl" />
        <div className="skeleton h-4 w-5/6 max-w-xl" />
        <div className="skeleton h-4 w-2/3 max-w-lg" />
      </div>
    </div>
  </div>
);

export default PageLoader;
