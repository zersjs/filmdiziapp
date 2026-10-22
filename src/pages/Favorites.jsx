import React from 'react';
import { FaHeart } from 'react-icons/fa';
import { useApp } from '../contexts';
import LibraryPage from '../components/Library/LibraryPage';

const Favorites = () => {
  const { state, actions } = useApp();

  return (
    <LibraryPage
      title="Favorilerim"
      description="Beğendiğin filmler ve diziler. Bu liste tarayıcında saklanır."
      icon={FaHeart}
      items={state.favorites}
      onClear={actions.clearFavorites}
      emptyTitle="Henüz favorin yok"
      emptyDescription="Bir film veya dizinin kalp ikonuna dokunarak favorilerine ekleyebilirsin."
    />
  );
};

export default Favorites;
