import React from 'react';
import { Helmet } from 'react-helmet-async';
import { FaClock, FaTrash, FaPlay } from 'react-icons/fa';
import { useApp } from '../contexts';
import { useToast } from '../components/UI/Toast';
import MovieCard from '../components/UI/MovieCard';

const WatchLater = () => {
  const { state, actions } = useApp();
  const { toast } = useToast();
  const watchLaterItems = state.watchLater;

  const clearAllWatchLater = () => {
    if (window.confirm('Tüm izleme listesi temizlensin mi?')) {
      actions.clearWatchLater();
      toast.success('İzleme listesi temizlendi');
    }
  };

  const removeFromWatchLater = (item) => {
    actions.removeWatchLater(item.id, item.media_type);
    toast.success('İzleme listesinden kaldırıldı');
  };

  return (
    <>
      <Helmet>
        <title>İzleme Listem - SINEFIX</title>
        <meta name="description" content="İzleme listenizdeki filmler ve diziler" />
      </Helmet>

      <div className="container-custom py-8">
        {/* Header */}
        <div className="flex items-center justify-between mb-8">
          <div className="flex items-center space-x-4">
            <div className="w-12 h-12 bg-blue-600 rounded-full flex items-center justify-center">
              <FaClock className="text-xl text-white" />
            </div>
            <div>
              <h1 className="text-3xl font-bold">İzleme Listem</h1>
              <p className="text-gray-400 mt-1">
                {watchLaterItems.length} içerik listenizde
              </p>
            </div>
          </div>
          
          {watchLaterItems.length > 0 && (
            <button
              onClick={clearAllWatchLater}
              className="flex items-center space-x-2 px-4 py-2 bg-red-600 hover:bg-red-700 text-white rounded-lg transition-colors"
            >
              <FaTrash className="text-sm" />
              <span>Tümünü Temizle</span>
            </button>
          )}
        </div>

        {/* Content */}
        {watchLaterItems.length === 0 ? (
          <div className="text-center py-20">
            <div className="w-24 h-24 bg-gray-800 rounded-full flex items-center justify-center mx-auto mb-6">
              <FaClock className="text-3xl text-gray-500" />
            </div>
            <h2 className="text-2xl font-bold mb-4">İzleme listesi boş</h2>
            <p className="text-gray-400 mb-8 max-w-md mx-auto">
              İzlemek istediğiniz film ve dizileri listinize ekleyin. 
              Böylece onları daha sonra kolayca bulabilirsiniz.
            </p>
            <a
              href="/movies"
              className="inline-flex items-center space-x-2 bg-white text-black px-6 py-3 rounded-lg font-medium hover:bg-gray-200 transition-colors"
            >
              <FaPlay className="text-sm" />
              <span>Film Keşfet</span>
            </a>
          </div>
        ) : (
          <div className="space-y-8">
            {/* Statistics */}
            <div className="grid grid-cols-1 md:grid-cols-3 gap-4 mb-8">
              <div className="bg-gray-900 rounded-lg p-4">
                <div className="text-2xl font-bold text-white">
                  {watchLaterItems.filter(item => item.media_type === 'movie').length}
                </div>
                <div className="text-gray-400 text-sm">Film</div>
              </div>
              <div className="bg-gray-900 rounded-lg p-4">
                <div className="text-2xl font-bold text-white">
                  {watchLaterItems.filter(item => item.media_type === 'tv').length}
                </div>
                <div className="text-gray-400 text-sm">Dizi</div>
              </div>
              <div className="bg-gray-900 rounded-lg p-4">
                <div className="text-2xl font-bold text-white">
                  {Math.round(watchLaterItems.reduce((acc, item) => acc + (item.vote_average || 0), 0) / watchLaterItems.length * 10) / 10}
                </div>
                <div className="text-gray-400 text-sm">Ortalama Puan</div>
              </div>
            </div>

            {/* Items Grid */}
            <div className="movie-grid">
              {watchLaterItems.map((item) => (
                <div key={`${item.id}-${item.media_type}`} className="relative group">
                  <MovieCard
                    item={item}
                    mediaType={item.media_type}
                  />
                  {/* Remove Button */}
                  <button
                    onClick={() => removeFromWatchLater(item)}
                    className="absolute top-2 left-2 w-8 h-8 bg-red-600 hover:bg-red-700 text-white rounded-full flex items-center justify-center opacity-0 group-hover:opacity-100 transition-all duration-200 z-10"
                    title="Listeden kaldır"
                  >
                    <FaTrash className="text-xs" />
                  </button>
                </div>
              ))}
            </div>
          </div>
        )}
      </div>
    </>
  );
};

export default WatchLater;