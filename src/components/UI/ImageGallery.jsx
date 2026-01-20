import React, { useState } from 'react';
import { LazyLoadImage } from 'react-lazy-load-image-component';
import { FaTimes, FaChevronLeft, FaChevronRight } from 'react-icons/fa';
import { getImageUrl } from '../../services/tmdb';
import 'react-lazy-load-image-component/src/effects/blur.css';

const ImageGallery = ({ images, title }) => {
  const [selectedImage, setSelectedImage] = useState(null);
  const [activeTab, setActiveTab] = useState('backdrops');

  const tabs = [
    { id: 'backdrops', label: 'Arka Planlar', count: images.backdrops?.length || 0 },
    { id: 'posters', label: 'Posterler', count: images.posters?.length || 0 },
    { id: 'logos', label: 'Logolar', count: images.logos?.length || 0 }
  ].filter(tab => tab.count > 0);

  const currentImages = images[activeTab] || [];

  const openModal = (index) => {
    setSelectedImage(index);
  };

  const closeModal = () => {
    setSelectedImage(null);
  };

  const nextImage = () => {
    if (selectedImage < currentImages.length - 1) {
      setSelectedImage(selectedImage + 1);
    }
  };

  const prevImage = () => {
    if (selectedImage > 0) {
      setSelectedImage(selectedImage - 1);
    }
  };

  if (tabs.length === 0) return null;

  return (
    <div>
      <h2 className="text-2xl font-bold mb-4">Görseller</h2>
      
      <div className="flex space-x-6 mb-6 border-b border-gray-800">
        {tabs.map(tab => (
          <button
            key={tab.id}
            onClick={() => setActiveTab(tab.id)}
            className={`pb-3 px-1 transition-colors relative ${
              activeTab === tab.id
                ? 'text-white border-b-2 border-white'
                : 'text-gray-400 hover:text-white'
            }`}
          >
            {tab.label}
            <span className="ml-2 text-sm">({tab.count})</span>
          </button>
        ))}
      </div>

      <div className={`grid gap-4 ${
        activeTab === 'posters' 
          ? 'grid-cols-3 sm:grid-cols-4 md:grid-cols-6' 
          : 'grid-cols-1 sm:grid-cols-2 md:grid-cols-3'
      }`}>
        {currentImages.slice(0, 18).map((image, index) => (
          <div
            key={image.file_path}
            onClick={() => openModal(index)}
            className={`relative cursor-pointer group overflow-hidden rounded-lg bg-gray-900 transition-all duration-300 hover:shadow-2xl hover:shadow-white/10 ${
              activeTab === 'posters' ? 'aspect-[2/3]' : 'aspect-video'
            }`}
          >
            <LazyLoadImage
              src={getImageUrl(image.file_path, activeTab === 'posters' ? 'w342' : 'w780')}
              alt={`${title} ${activeTab} ${index + 1}`}
              effect="blur"
              className="w-full h-full object-cover transition-transform duration-300 group-hover:scale-110"
            />
            <div className="absolute inset-0 bg-black/0 group-hover:bg-black/20 transition-colors duration-300" />
            <div className="absolute inset-0 border-2 border-transparent group-hover:border-white/30 transition-colors duration-300 rounded-lg" />
          </div>
        ))}
      </div>

      {selectedImage !== null && (
        <div 
          className="fixed inset-0 bg-black/95 z-[10000] flex items-center justify-center p-4"
          onClick={closeModal}
        >
          <button
            className="absolute top-4 right-4 text-white/80 hover:text-white text-2xl"
            onClick={closeModal}
          >
            <FaTimes />
          </button>

          {selectedImage > 0 && (
            <button
              className="absolute left-4 text-white/80 hover:text-white text-3xl"
              onClick={(e) => {
                e.stopPropagation();
                prevImage();
              }}
            >
              <FaChevronLeft />
            </button>
          )}

          {selectedImage < currentImages.length - 1 && (
            <button
              className="absolute right-4 text-white/80 hover:text-white text-3xl"
              onClick={(e) => {
                e.stopPropagation();
                nextImage();
              }}
            >
              <FaChevronRight />
            </button>
          )}

          <img
            src={getImageUrl(currentImages[selectedImage].file_path, 'original')}
            alt={`${title} ${activeTab} ${selectedImage + 1}`}
            className="max-w-full max-h-full object-contain"
            onClick={(e) => e.stopPropagation()}
          />

          <div className="absolute bottom-4 left-1/2 transform -translate-x-1/2 text-white/80">
            {selectedImage + 1} / {currentImages.length}
          </div>
        </div>
      )}
    </div>
  );
};

export default ImageGallery;
