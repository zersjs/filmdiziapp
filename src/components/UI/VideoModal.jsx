import React from 'react';
import { createPortal } from 'react-dom';
import { FaTimes } from 'react-icons/fa';
import { useBodyScrollLock, useEscapeKey } from './Modal';

export const pickTrailer = (videos = []) => {
  const youtube = videos.filter(v => v.site === 'YouTube');
  return (
    youtube.find(v => v.type === 'Trailer' && v.official && v.iso_639_1 === 'tr') ||
    youtube.find(v => v.type === 'Trailer' && v.iso_639_1 === 'tr') ||
    youtube.find(v => v.type === 'Trailer' && v.official) ||
    youtube.find(v => v.type === 'Trailer') ||
    youtube.find(v => v.type === 'Teaser') ||
    youtube[0] ||
    null
  );
};

const VideoModal = ({ video, onClose }) => {
  useBodyScrollLock(!!video);
  useEscapeKey(!!video, onClose);

  if (!video) return null;

  return createPortal(
    <div className="modal-overlay" onMouseDown={(event) => event.target === event.currentTarget && onClose()}>
      <div className="w-full max-w-5xl animate-fade-in">
        <div className="mb-3 flex items-center justify-between gap-4">
          <p className="truncate text-sm font-semibold text-white/80">{video.name}</p>
          <button type="button" onClick={onClose} className="icon-btn bordered" aria-label="Kapat">
            <FaTimes />
          </button>
        </div>
        <div className="relative aspect-video overflow-hidden rounded-xl bg-black">
          <iframe
            src={`https://www.youtube-nocookie.com/embed/${video.key}?autoplay=1&rel=0&modestbranding=1&playsinline=1`}
            title={video.name}
            className="absolute inset-0 h-full w-full"
            allow="accelerometer; autoplay; clipboard-write; encrypted-media; gyroscope; picture-in-picture"
            allowFullScreen
          />
        </div>
      </div>
    </div>,
    document.body
  );
};

export default VideoModal;
