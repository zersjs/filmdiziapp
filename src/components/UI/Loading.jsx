import React from 'react';
import { FaSpinner } from 'react-icons/fa';

// Ana loading bileşeni
const Loading = ({ size = 'large', text = 'Yükleniyor...', className = '', fullScreen = false }) => {
  const sizeClasses = {
    small: 'h-4 w-4',
    medium: 'h-8 w-8',
    large: 'h-16 w-16',
    xlarge: 'h-32 w-32'
  };

  const content = (
    <div className={`flex flex-col items-center justify-center space-y-4 ${className}`}>
      <div className="relative">
        <div className={`border-4 border-gray-800 rounded-full ${sizeClasses[size]}`}></div>
        <div className={`absolute top-0 left-0 border-4 border-white border-t-transparent rounded-full animate-spin ${sizeClasses[size]}`}></div>
      </div>
      {text && <p className="text-gray-400">{text}</p>}
    </div>
  );

  if (fullScreen) {
    return (
      <div className="fixed inset-0 bg-black flex items-center justify-center z-50">
        {content}
      </div>
    );
  }

  return (
    <div className="flex items-center justify-center py-20">
      {content}
    </div>
  );
};

// Sayfa loading'i
export const PageLoading = ({ text = 'Sayfa yükleniyor...' }) => {
  return (
    <div className="min-h-screen bg-black text-white flex items-center justify-center">
      <Loading size="large" text={text} />
    </div>
  );
};

// İçerik loading'i
export const ContentLoading = ({ text = 'İçerik yükleniyor...' }) => {
  return (
    <div className="flex items-center justify-center py-12">
      <Loading size="medium" text={text} />
    </div>
  );
};

// Buton loading'i
export const ButtonLoading = ({ text = 'Yükleniyor...' }) => {
  return (
    <div className="flex items-center space-x-2">
      <FaSpinner className="animate-spin" />
      <span>{text}</span>
    </div>
  );
};

// Skeleton loading bileşenleri
export const SkeletonCard = () => {
  return (
    <div className="animate-pulse">
      <div className="bg-gray-800 rounded-lg aspect-[2/3] mb-2"></div>
      <div className="space-y-2">
        <div className="h-4 bg-gray-800 rounded w-3/4"></div>
        <div className="h-3 bg-gray-800 rounded w-1/2"></div>
      </div>
    </div>
  );
};

export const SkeletonList = ({ count = 6 }) => {
  return (
    <div className="grid grid-cols-2 sm:grid-cols-3 md:grid-cols-4 lg:grid-cols-5 xl:grid-cols-6 gap-4">
      {Array.from({ length: count }).map((_, index) => (
        <SkeletonCard key={index} />
      ))}
    </div>
  );
};

export const SkeletonDetail = () => {
  return (
    <div className="animate-pulse">
      <div className="relative h-[50vh] bg-gray-800 mb-8">
        <div className="absolute bottom-0 left-0 right-0 p-8">
          <div className="h-8 bg-gray-700 rounded w-1/2 mb-4"></div>
          <div className="space-y-2 mb-4">
            <div className="h-4 bg-gray-700 rounded w-full"></div>
            <div className="h-4 bg-gray-700 rounded w-3/4"></div>
            <div className="h-4 bg-gray-700 rounded w-1/2"></div>
          </div>
          <div className="flex space-x-4">
            <div className="h-12 bg-gray-700 rounded w-32"></div>
            <div className="h-12 bg-gray-700 rounded w-32"></div>
          </div>
        </div>
      </div>
      
      <div className="container-custom">
        <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
          <div className="lg:col-span-2 space-y-6">
            <div className="space-y-4">
              <div className="h-6 bg-gray-800 rounded w-1/4"></div>
              <div className="space-y-2">
                <div className="h-4 bg-gray-800 rounded w-full"></div>
                <div className="h-4 bg-gray-800 rounded w-full"></div>
                <div className="h-4 bg-gray-800 rounded w-3/4"></div>
              </div>
            </div>
          </div>
          
          <div className="space-y-6">
            <div className="space-y-4">
              <div className="h-6 bg-gray-800 rounded w-1/2"></div>
              <div className="space-y-2">
                <div className="h-4 bg-gray-800 rounded w-full"></div>
                <div className="h-4 bg-gray-800 rounded w-2/3"></div>
                <div className="h-4 bg-gray-800 rounded w-3/4"></div>
              </div>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
};

// Inline loading (küçük alanlar için)
export const InlineLoading = ({ size = 'small' }) => {
  return <Loading size={size} className="py-4" />;
};

export default Loading;
