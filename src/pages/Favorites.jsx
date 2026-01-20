import React from 'react';
import { Helmet } from 'react-helmet-async';
import { FaHeart, FaTrash } from 'react-icons/fa';
import { useApp } from '../contexts';
import { useToast } from '../components/UI/Toast';
import { ConfirmModal } from '../components/UI/Modal';
import MovieCard from '../components/UI/MovieCard';

const Favorites = () => {
  const { state, actions } = useApp();
  const { toast } = useToast();
  const [showClearModal, setShowClearModal] = React.useState(false);

  const favoriteItems = state.favorites;

  const handleClearFavorites = () => {
    actions.clearFavorites();
    toast.success('Tüm favoriler temizlendi');
    setShowClearModal(false);
  };

  return (
    <>
      <Helmet>
        <title>Favorilerim - SINEFIX</title>
      </Helmet>

      <div className="min-h-screen pt-20">
        <div className="container-custom">
          <div className="mb-8 flex items-center justify-between">
            <div className="flex items-center space-x-3">
              <FaHeart className="text-red-500 text-3xl" />
              <h1 className="text-3xl font-bold">Favorilerim</h1>
            </div>
            
            {favoriteItems.length > 0 && (
              <button
                onClick={() => setShowClearModal(true)}
                className="flex items-center space-x-2 px-4 py-2 bg-red-600 hover:bg-red-700 text-white rounded-lg transition-colors"
              >
                <FaTrash />
                <span>Tümünü Temizle</span>
              </button>
            )}
          </div>

          {favoriteItems.length === 0 ? (
            <div className="text-center py-20">
              <FaHeart className="text-gray-700 text-6xl mx-auto mb-4" />
              <p className="text-gray-400 text-lg">
                Hiç favori içerik yok.
              </p>
              <p className="text-gray-500 mt-2">
                İzlemek istediğiniz içerikleri favori listenize ekleyin!
              </p>
            </div>
          ) : (
            <>
              <p className="text-gray-400 mb-6">
                {favoriteItems.length} içerik listeleniyor
              </p>
              <div className="movie-grid">
                {favoriteItems.map((item, index) => (
                  <MovieCard key={`${item.id}-${index}`} item={item} mediaType={item.media_type} />
                ))}
              </div>
            </>
          )}
        </div>
      </div>

      <ConfirmModal
        isOpen={showClearModal}
        onClose={() => setShowClearModal(false)}
        onConfirm={handleClearFavorites}
        title="Favorileri Temizle"
        message="Tüm favorilerinizi silmek istediğinizden emin misiniz? Bu işlem geri alınamaz."
        confirmText="Evet, Temizle"
        cancelText="İptal"
        type="danger"
      />
    </>
  );
};

export default Favorites;
