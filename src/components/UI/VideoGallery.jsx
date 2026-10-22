import React, { useState } from 'react';
import { FaPlay } from 'react-icons/fa';
import VideoModal from './VideoModal';

const TYPE_LABELS = {
  Trailer: 'Fragman',
  Teaser: 'Teaser',
  Clip: 'Klip',
  Featurette: 'Kamera arkası',
  'Behind the Scenes': 'Kamera arkası',
  Bloopers: 'Bloopers',
  'Opening Credits': 'Jenerik',
};

const VideoGallery = ({ videos }) => {
  const [selected, setSelected] = useState(null);
  const youtube = (videos || []).filter(v => v.site === 'YouTube');

  if (youtube.length === 0) return null;

  return (
    <section>
      <h2 className="section-title mb-4">Videolar <span className="text-sm font-medium text-white/40">({youtube.length})</span></h2>
      <div className="grid grid-cols-1 gap-x-4 gap-y-6 xs:grid-cols-2 lg:grid-cols-3">
        {youtube.map(video => (
          <button key={video.id} type="button" onClick={() => setSelected(video)} className="group text-left">
            <div className="relative aspect-video overflow-hidden rounded-xl bg-[#111]">
              <img
                src={`https://i.ytimg.com/vi/${video.key}/hqdefault.jpg`}
                alt=""
                loading="lazy"
                className="h-full w-full object-cover transition-transform duration-500 group-hover:scale-105"
              />
              <div className="absolute inset-0 flex items-center justify-center bg-black/25 transition-colors group-hover:bg-black/10">
                <span className="flex h-12 w-12 items-center justify-center rounded-full bg-white pl-1 text-sm text-black shadow-lg">
                  <FaPlay />
                </span>
              </div>
            </div>
            <p className="mt-2 line-clamp-1 text-sm font-semibold text-white/90">{video.name}</p>
            <p className="text-xs text-white/40">{TYPE_LABELS[video.type] || video.type}</p>
          </button>
        ))}
      </div>
      <VideoModal video={selected} onClose={() => setSelected(null)} />
    </section>
  );
};

export default VideoGallery;
