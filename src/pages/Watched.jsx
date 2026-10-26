import React from 'react';
import { FaEye } from 'react-icons/fa';
import { useApp } from '../contexts';
import LibraryPage from '../components/Library/LibraryPage';
import MovieCard from '../components/UI/MovieCard';

// İzlenen filmler ve bölümleri işaretlenen diziler. Dizilerde kaç bölüm izlendiği kartın üstünde yazar.
const Watched = () => {
  const { state, actions } = useApp();
  const movies = state.watched.filter(item => item.media_type === 'movie').length;
  const shows = state.watched.filter(item => item.media_type === 'tv');
  const episodes = shows.reduce((sum, item) => sum + (item.episodes?.length || 0), 0);

  return (
    <LibraryPage
      title="İzlediklerim"
      description="İzlendi olarak işaretlediğin filmler ve dizi bölümleri. Senkronizasyon açıksa diğer cihazlarınla eşitlenir."
      summary={`${movies} film · ${shows.length} dizi · ${episodes} bölüm`}
      icon={FaEye}
      items={state.watched}
      onClear={actions.clearWatched}
      clearLabel="Geçmişi temizle"
      emptyTitle="Henüz bir şey işaretlemedin"
      emptyDescription="Film sayfasındaki “İzledim” düğmesiyle veya dizilerin bölüm listesindeki onay işaretleriyle izlediklerini takip edebilirsin."
      renderItem={(item) => (
        <div key={`${item.media_type}-${item.id}`} className="relative">
          <MovieCard item={item} mediaType={item.media_type} showType={false} />
          {item.media_type === 'tv' && item.episodes?.length > 0 && (
            <span className="mc-episodes">{item.episodes.length} bölüm</span>
          )}
        </div>
      )}
    />
  );
};

export default Watched;
