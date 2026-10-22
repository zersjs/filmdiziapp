import React from 'react';
import { act, renderHook } from '@testing-library/react';
import { beforeEach, describe, expect, test } from 'vitest';
import { AppProvider, useApp, libraryReducer } from '../AppContext';

const movie = { id: 550, title: 'Dövüş Kulübü', poster_path: '/a.jpg', vote_average: 8.4, release_date: '1999-10-15' };
const show = { id: 1396, name: 'Breaking Bad', poster_path: '/b.jpg', first_air_date: '2008-01-20' };

const wrapper = ({ children }) => <AppProvider>{children}</AppProvider>;

describe('libraryReducer', () => {
  const empty = { favorites: [], watchLater: [], continueWatching: [] };

  test('add en başa ekler ve kopyaları kaldırır', () => {
    let state = libraryReducer(empty, { type: 'add', list: 'favorites', item: { id: 1, media_type: 'movie' } });
    state = libraryReducer(state, { type: 'add', list: 'favorites', item: { id: 2, media_type: 'movie' } });
    state = libraryReducer(state, { type: 'add', list: 'favorites', item: { id: 1, media_type: 'movie' } });
    expect(state.favorites.map(i => i.id)).toEqual([1, 2]);
  });

  test('aynı id farklı türde ayrı tutulur', () => {
    let state = libraryReducer(empty, { type: 'add', list: 'watchLater', item: { id: 1, media_type: 'movie' } });
    state = libraryReducer(state, { type: 'add', list: 'watchLater', item: { id: 1, media_type: 'tv' } });
    state = libraryReducer(state, { type: 'remove', list: 'watchLater', id: 1, mediaType: 'movie' });
    expect(state.watchLater).toEqual([{ id: 1, media_type: 'tv' }]);
  });
});

describe('AppProvider', () => {
  beforeEach(() => window.localStorage.clear());

  test('favori ekleme/çıkarma ve localStorage kalıcılığı', () => {
    const { result } = renderHook(() => useApp(), { wrapper });

    act(() => {
      expect(result.current.actions.toggleFavorite(movie, 'movie')).toBe(true);
    });
    expect(result.current.actions.isFavorite(550, 'movie')).toBe(true);
    expect(JSON.parse(window.localStorage.getItem('favorites'))[0]).toMatchObject({ id: 550, media_type: 'movie', title: 'Dövüş Kulübü' });

    act(() => {
      expect(result.current.actions.toggleFavorite(movie, 'movie')).toBe(false);
    });
    expect(result.current.state.favorites).toHaveLength(0);
    expect(JSON.parse(window.localStorage.getItem('favorites'))).toEqual([]);
  });

  test('kayıtlı listeyi açılışta okur (eski ilk render yarışı)', () => {
    window.localStorage.setItem('watchLater', JSON.stringify([{ id: 1396, media_type: 'tv', title: 'Breaking Bad' }]));
    const { result } = renderHook(() => useApp(), { wrapper });
    expect(result.current.actions.isWatchLater(1396, 'tv')).toBe(true);
    expect(JSON.parse(window.localStorage.getItem('watchLater'))).toHaveLength(1);
  });

  test('bozuk localStorage verisi uygulamayı çökertmez', () => {
    window.localStorage.setItem('favorites', '{bozuk');
    const { result } = renderHook(() => useApp(), { wrapper });
    expect(result.current.state.favorites).toEqual([]);
  });

  test('izlemeye devam et sezon/bölüm bilgisini günceller', () => {
    const { result } = renderHook(() => useApp(), { wrapper });
    act(() => result.current.actions.addContinueWatching(show, 'tv', { season: 1, episode: 1 }));
    act(() => result.current.actions.addContinueWatching(show, 'tv', { season: 1, episode: 2, episodeName: 'Yazı Tura' }));
    expect(result.current.state.continueWatching).toHaveLength(1);
    expect(result.current.actions.getContinueWatching(1396, 'tv')).toMatchObject({ season: 1, episode: 2, episodeName: 'Yazı Tura' });
  });
});
