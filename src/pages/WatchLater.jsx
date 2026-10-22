import React from 'react';
import { FaBookmark } from 'react-icons/fa';
import { useApp } from '../contexts';
import LibraryPage from '../components/Library/LibraryPage';

const WatchLater = () => {
  const { state, actions } = useApp();

  return (
    <LibraryPage
      title="İzleme listem"
      description="Daha sonra izlemek için kaydettiklerin. Bu liste tarayıcında saklanır."
      icon={FaBookmark}
      items={state.watchLater}
      onClear={actions.clearWatchLater}
      emptyTitle="İzleme listen boş"
      emptyDescription="Kartlardaki + simgesine veya detay sayfasındaki listeye ekle butonuna dokunarak içerik ekleyebilirsin."
    />
  );
};

export default WatchLater;
