import React from 'react';
import { act, renderHook, waitFor } from '@testing-library/react';
import { afterEach, beforeEach, describe, expect, test, vi } from 'vitest';
import { AppProvider, useApp, libraryReducer } from '../AppContext';
import { emptyLibrary } from '../../lib/library';
import { handleLibraryRequest } from '../../../server/libraryHandler';
import { createMemoryStore } from '../../../server/store';

const movie = { id: 550, title: 'Dövüş Kulübü', poster_path: '/a.jpg', vote_average: 8.4, release_date: '1999-10-15', genre_ids: [18] };
const show = { id: 1396, name: 'Breaking Bad', poster_path: '/b.jpg', first_air_date: '2008-01-20' };

const wrapper = ({ children }) => <AppProvider>{children}</AppProvider>;

describe('libraryReducer', () => {
  test('add en başa ekler, kopyayı kaldırır ve silme kaydını temizler', () => {
    let state = libraryReducer(emptyLibrary(), { type: 'add', list: 'favorites', item: { id: 1, media_type: 'movie' } });
    state = libraryReducer(state, { type: 'remove', list: 'favorites', id: 1, mediaType: 'movie', now: '2026-01-01T00:00:00.000Z' });
    expect(state.removed.favorites['movie-1']).toBe('2026-01-01T00:00:00.000Z');
    state = libraryReducer(state, { type: 'add', list: 'favorites', item: { id: 2, media_type: 'movie' } });
    state = libraryReducer(state, { type: 'add', list: 'favorites', item: { id: 1, media_type: 'movie' } });
    expect(state.favorites.map(i => i.id)).toEqual([1, 2]);
    expect(state.removed.favorites['movie-1']).toBeUndefined();
  });

  test('clear tüm öğeler için silme kaydı bırakır', () => {
    let state = libraryReducer(emptyLibrary(), { type: 'add', list: 'watchLater', item: { id: 1, media_type: 'tv' } });
    state = libraryReducer(state, { type: 'clear', list: 'watchLater' });
    expect(state.watchLater).toEqual([]);
    expect(Object.keys(state.removed.watchLater)).toEqual(['tv-1']);
  });
});

describe('AppProvider (yerel)', () => {
  beforeEach(() => window.localStorage.clear());

  test('favori ekleme/çıkarma ve localStorage kalıcılığı', () => {
    const { result } = renderHook(() => useApp(), { wrapper });

    act(() => {
      expect(result.current.actions.toggleFavorite(movie, 'movie')).toBe(true);
    });
    expect(result.current.actions.isFavorite(550, 'movie')).toBe(true);
    expect(JSON.parse(window.localStorage.getItem('favorites'))[0]).toMatchObject({ id: 550, media_type: 'movie', genre_ids: [18] });

    act(() => {
      expect(result.current.actions.toggleFavorite(movie, 'movie')).toBe(false);
    });
    expect(result.current.state.favorites).toHaveLength(0);
    expect(JSON.parse(window.localStorage.getItem('libraryRemoved')).favorites['movie-550']).toBeTruthy();
  });

  test('eski sürümün kaydettiği listeyi okur', () => {
    window.localStorage.setItem('watchLater', JSON.stringify([{ id: 1396, media_type: 'tv', title: 'Breaking Bad' }]));
    const { result } = renderHook(() => useApp(), { wrapper });
    expect(result.current.actions.isWatchLater(1396, 'tv')).toBe(true);
  });

  test('bozuk localStorage verisi uygulamayı çökertmez', () => {
    window.localStorage.setItem('favorites', '{bozuk');
    window.localStorage.setItem('watchLater', JSON.stringify([{ id: 'x' }, null, { id: 5, media_type: 'person' }]));
    const { result } = renderHook(() => useApp(), { wrapper });
    expect(result.current.state.favorites).toEqual([]);
    expect(result.current.state.watchLater).toEqual([]);
  });

  test('izlemeye devam et sezon/bölüm bilgisini günceller', () => {
    const { result } = renderHook(() => useApp(), { wrapper });
    act(() => result.current.actions.addContinueWatching(show, 'tv', { season: 1, episode: 1 }));
    act(() => result.current.actions.addContinueWatching(show, 'tv', { season: 1, episode: 2, episodeName: 'Yazı Tura' }));
    expect(result.current.state.continueWatching).toHaveLength(1);
    expect(result.current.actions.getContinueWatching(1396, 'tv')).toMatchObject({ season: 1, episode: 2, episodeName: 'Yazı Tura' });
  });

  test('yedek dışa/içe aktarma birleştirir', () => {
    const { result } = renderHook(() => useApp(), { wrapper });
    act(() => {
      result.current.actions.toggleFavorite(movie, 'movie');
    });
    const backup = result.current.actions.exportLibrary();
    act(() => result.current.actions.clearAll());
    expect(result.current.state.favorites).toHaveLength(0);
    // Silmeden daha yeni bir yedek öğesi geri gelir
    backup.library.favorites[0].updatedAt = new Date(Date.now() + 1000).toISOString();
    act(() => {
      expect(result.current.actions.importLibrary(backup)).toBe(1);
    });
    expect(result.current.actions.isFavorite(550, 'movie')).toBe(true);
  });
});

describe('AppProvider (cihazlar arası senkronizasyon)', () => {
  let store;
  let serverStates;

  beforeEach(() => {
    window.localStorage.clear();
    store = createMemoryStore();
    serverStates = [];
    // fetch'i gerçek sunucu handler'ına bağla; her başarılı PUT'un sonucunu kaydet
    vi.stubGlobal('fetch', async (url, init = {}) => {
      const response = await handleLibraryRequest(new Request(`http://localhost${url}`, init), { store });
      if (init.method === 'PUT' && response.ok) serverStates.push((await response.clone().json()).library);
      return response;
    });
  });

  const lastServerState = () => serverStates[serverStates.length - 1];

  afterEach(() => vi.unstubAllGlobals());

  const newDevice = () => {
    window.localStorage.clear();
    return renderHook(() => useApp(), { wrapper });
  };

  test('A cihazındaki ekleme ve silme B cihazına geçer', async () => {
    const deviceA = newDevice();
    let key;
    await act(async () => {
      key = await deviceA.result.current.sync.enable();
    });
    expect(deviceA.result.current.sync.enabled).toBe(true);

    act(() => {
      deviceA.result.current.actions.toggleFavorite(movie, 'movie');
    });
    await waitFor(() => expect(lastServerState().favorites).toHaveLength(1), { timeout: 4000 });
    deviceA.unmount();

    const deviceB = newDevice();
    await act(async () => {
      await deviceB.result.current.sync.connect(key.toLowerCase().replace(/(.{5})/g, '$1-'));
    });
    expect(deviceB.result.current.actions.isFavorite(550, 'movie')).toBe(true);

    act(() => {
      deviceB.result.current.actions.toggleFavorite(movie, 'movie');
    });
    await waitFor(() => expect(lastServerState().favorites).toHaveLength(0), { timeout: 4000 });
    deviceB.unmount();

    // A cihazı (eski yerel verisiyle) tekrar bağlanınca silinen öğe geri gelmemeli
    window.localStorage.clear();
    window.localStorage.setItem('favorites', JSON.stringify([{ ...movie, media_type: 'movie', addedAt: '2020-01-01T00:00:00.000Z' }]));
    const deviceA2 = renderHook(() => useApp(), { wrapper });
    await act(async () => {
      await deviceA2.result.current.sync.connect(key);
    });
    expect(deviceA2.result.current.actions.isFavorite(550, 'movie')).toBe(false);
  });

  test('yanlış kodla bağlanma hata verir ve senkronizasyonu açmaz', async () => {
    const device = newDevice();
    await act(async () => {
      await expect(device.result.current.sync.connect('ABCDE-ABCDE-ABCDE-ABCDE-ABCDE')).rejects.toMatchObject({ code: 'not_found' });
    });
    await act(async () => {
      await expect(device.result.current.sync.connect('kısa')).rejects.toMatchObject({ code: 'invalid_key' });
    });
    expect(device.result.current.sync.enabled).toBe(false);
  });

  test('sunucu yapılandırılmamışsa senkronizasyon açılmaz', async () => {
    vi.stubGlobal('fetch', (url, init = {}) =>
      handleLibraryRequest(new Request(`http://localhost${url}`, init), { store: null }));
    const device = newDevice();
    await act(async () => {
      await expect(device.result.current.sync.enable()).rejects.toMatchObject({ code: 'unavailable' });
    });
    expect(device.result.current.sync.enabled).toBe(false);
  });
});
