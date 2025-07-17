import React, { useState } from 'react';
import { LazyLoadImage } from 'react-lazy-load-image-component';
import { FaYoutube, FaTimes } from 'react-icons/fa';
import 'react-lazy-load-image-component/src/effects/blur.css';

const VideoGallery = ({ videos }) => {
  const [selectedVideo, setSelectedVideo] = useState(null);

  if (!videos || videos.length === 0) return null;

  const openVideoModal = (video) => {
    setSelectedVideo(video);
  };

  const closeVideoModal = () => {
    setSelectedVideo(null);
  };

  return (
    <div>
      <h2 className="text-2xl font-bold mb-4">Videolar</h2>
      <div className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-3 gap-4">
        {videos.map(video => (
          <VideoCard key={video.id} video={video} onClick={() => openVideoModal(video)} />
        ))}
      </div>

      {/* Video Modal */}
      {selectedVideo && (
        <div 
          className="fixed inset-0 bg-black/95 z-[10000] flex items-center justify-center p-4"
          onClick={closeVideoModal}
        >
          <div className="relative max-w-4xl w-full" onClick={(e) => e.stopPropagation()}>
            <button
              className="absolute -top-12 right-0 text-white/80 hover:text-white text-2xl z-10"
              onClick={closeVideoModal}
            >
              <FaTimes />
            </button>
            
            <div className="relative aspect-video bg-black rounded-lg overflow-hidden">
              <iframe
                src={`https://www.youtube.com/embed/${selectedVideo.key}?autoplay=1&rel=0`}
                title={selectedVideo.name}
                className="w-full h-full"
                frameBorder="0"
                allow="accelerometer; autoplay; clipboard-write; encrypted-media; gyroscope; picture-in-picture"
                allowFullScreen
              />
            </div>
            
            <div className="mt-4 text-center">
              <h3 className="text-lg font-medium text-white">{selectedVideo.name}</h3>
              <p className="text-sm text-gray-400 mt-1">{selectedVideo.type}</p>
            </div>
          </div>
        </div>
      )}
    </div>
  );
};

const VideoCard = ({ video, onClick }) => {
  return (
    <div className="relative overflow-hidden rounded-lg bg-black mb-2">
      <div
        onClick={onClick}
        className="group block cursor-pointer"
      >
        <LazyLoadImage
          src={`https://img.youtube.com/vi/${video.key}/hqdefault.jpg`}
          alt={video.name}
          effect="blur"
          className="w-full h-48 object-cover transition-transform duration-300 group-hover:scale-110"
        />
        <div className="absolute inset-0 bg-gradient-to-t from-black/80 to-transparent opacity-0 group-hover:opacity-90 transition-opacity flex items-center justify-center">
          <FaYoutube className="text-red-500 text-4xl" />
        </div>
      </div>
      <div className="mt-2">
        <h3 className="font-medium text-sm line-clamp-1 group-hover:text-gray-400 transition-colors">
          {video.name}
        </h3>
        <p className="text-xs text-gray-400 mt-1">{video.type}</p>
      </div>
    </div>
  );
};

export default VideoGallery;
