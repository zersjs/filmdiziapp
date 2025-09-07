import React from 'react';

// Base skeleton component
const Skeleton = ({ className = '', variant = 'rectangular', animation = 'pulse' }) => {
  const baseClasses = 'bg-gray-800 rounded';
  const variantClasses = {
    rectangular: 'rounded-lg',
    circular: 'rounded-full',
    text: 'rounded h-4'
  };
  
  const animationClasses = {
    pulse: 'animate-pulse',
    shimmer: 'animate-shimmer',
    wave: 'animate-bounce'
  };

  return (
    <div 
      className={`
        ${baseClasses} 
        ${variantClasses[variant]} 
        ${animationClasses[animation]} 
        ${className}
      `}
    />
  );
};

// Movie Card Skeleton
export const MovieCardSkeleton = () => (
  <div className="space-y-3">
    <Skeleton className="aspect-[2/3] w-full" variant="rectangular" />
    <Skeleton className="h-4 w-3/4" variant="text" />
    <Skeleton className="h-3 w-1/2" variant="text" />
  </div>
);

// Hero Section Skeleton
export const HeroSkeleton = () => (
  <div className="relative h-[85vh] min-h-[700px] bg-gray-900 overflow-hidden">
    <div className="absolute inset-0">
      <Skeleton className="w-full h-full" animation="shimmer" />
    </div>
    <div className="relative h-full flex items-center">
      <div className="container-custom">
        <div className="max-w-3xl space-y-6">
          <div className="flex items-center space-x-3">
            <Skeleton className="w-20 h-8 rounded-full" />
            <Skeleton className="w-32 h-8 rounded-full" />
          </div>
          <Skeleton className="h-16 w-full max-w-2xl" />
          <div className="flex items-center space-x-4">
            <Skeleton className="w-24 h-10 rounded-full" />
            <Skeleton className="w-20 h-10 rounded-full" />
            <Skeleton className="w-28 h-10 rounded-full" />
          </div>
          <Skeleton className="h-6 w-full max-w-xl" />
          <Skeleton className="h-6 w-4/5 max-w-xl" />
          <div className="flex space-x-4 pt-4">
            <Skeleton className="w-40 h-14 rounded-xl" />
            <Skeleton className="w-32 h-14 rounded-xl" />
          </div>
        </div>
      </div>
    </div>
  </div>
);

// Content Section Skeleton
export const ContentSectionSkeleton = ({ title = "Loading...", itemCount = 12 }) => (
  <section className="space-y-6">
    <div className="flex items-center justify-between">
      <Skeleton className="h-8 w-48" />
      <Skeleton className="h-6 w-24" />
    </div>
    <div className="movie-grid">
      {Array.from({ length: itemCount }).map((_, index) => (
        <MovieCardSkeleton key={index} />
      ))}
    </div>
  </section>
);

// Continue Watching Skeleton
export const ContinueWatchingSkeleton = () => (
  <section className="space-y-6">
    <div className="flex items-center space-x-3">
      <Skeleton className="w-6 h-6 rounded" />
      <Skeleton className="h-8 w-48" />
    </div>
    <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
      {Array.from({ length: 6 }).map((_, index) => (
        <div key={index} className="bg-gray-900 rounded-lg overflow-hidden">
          <div className="flex">
            <Skeleton className="w-24 h-36 flex-shrink-0" />
            <div className="flex-1 p-4 space-y-3">
              <Skeleton className="h-4 w-3/4" />
              <Skeleton className="h-3 w-1/2" />
              <div className="space-y-2 pt-4">
                <div className="flex justify-between">
                  <Skeleton className="h-3 w-16" />
                  <Skeleton className="h-3 w-3 rounded" />
                </div>
                <Skeleton className="h-1.5 w-full rounded-full" />
              </div>
            </div>
          </div>
        </div>
      ))}
    </div>
  </section>
);

// Search Results Skeleton
export const SearchResultsSkeleton = () => (
  <div className="space-y-6">
    <div className="flex items-center justify-between">
      <Skeleton className="h-8 w-64" />
      <Skeleton className="h-6 w-20" />
    </div>
    <div className="grid grid-cols-2 sm:grid-cols-3 md:grid-cols-4 lg:grid-cols-5 xl:grid-cols-6 gap-4">
      {Array.from({ length: 18 }).map((_, index) => (
        <MovieCardSkeleton key={index} />
      ))}
    </div>
  </div>
);

// Detail Page Skeleton
export const DetailPageSkeleton = () => (
  <div className="space-y-8">
    {/* Hero Section */}
    <div className="relative h-[70vh] bg-gray-900">
      <Skeleton className="absolute inset-0" animation="shimmer" />
      <div className="relative h-full flex items-end">
        <div className="container-custom pb-12">
          <div className="flex space-x-8">
            <Skeleton className="w-64 h-96 rounded-lg flex-shrink-0" />
            <div className="flex-1 space-y-4">
              <Skeleton className="h-12 w-3/4" />
              <div className="flex items-center space-x-4">
                <Skeleton className="w-20 h-8 rounded-full" />
                <Skeleton className="w-16 h-8 rounded-full" />
                <Skeleton className="w-24 h-8 rounded-full" />
              </div>
              <Skeleton className="h-6 w-full" />
              <Skeleton className="h-6 w-4/5" />
              <Skeleton className="h-6 w-3/5" />
              <div className="flex space-x-4 pt-4">
                <Skeleton className="w-32 h-12 rounded-lg" />
                <Skeleton className="w-32 h-12 rounded-lg" />
              </div>
            </div>
          </div>
        </div>
      </div>
    </div>
    
    {/* Content Sections */}
    <div className="container-custom space-y-12">
      <ContentSectionSkeleton title="Cast" itemCount={8} />
      <ContentSectionSkeleton title="Similar" itemCount={8} />
    </div>
  </div>
);

// List Page Skeleton
export const ListPageSkeleton = () => (
  <div className="container-custom py-8 space-y-8">
    <div className="flex items-center justify-between">
      <div className="flex items-center space-x-4">
        <Skeleton className="w-12 h-12 rounded-full" />
        <div className="space-y-2">
          <Skeleton className="h-8 w-48" />
          <Skeleton className="h-4 w-32" />
        </div>
      </div>
      <Skeleton className="w-32 h-10 rounded-lg" />
    </div>
    
    {/* Stats */}
    <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
      {Array.from({ length: 3 }).map((_, index) => (
        <div key={index} className="bg-gray-900 rounded-lg p-4 space-y-2">
          <Skeleton className="h-8 w-12" />
          <Skeleton className="h-4 w-16" />
        </div>
      ))}
    </div>
    
    <div className="movie-grid">
      {Array.from({ length: 20 }).map((_, index) => (
        <MovieCardSkeleton key={index} />
      ))}
    </div>
  </div>
);

export default Skeleton;