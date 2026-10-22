import { describe, expect, test } from 'vitest';
import { getPageItems } from '../UI/Pagination';
import { getAdjacentEpisode } from '../../pages/Watch';

describe('getPageItems', () => {
  test('tek sayfada boş', () => {
    expect(getPageItems(1, 1)).toEqual([]);
  });

  test('baş, son ve komşu sayfaları boşluklarla gösterir', () => {
    expect(getPageItems(5, 20)).toEqual([1, 'gap-4', 4, 5, 6, 'gap-20', 20]);
    expect(getPageItems(1, 3)).toEqual([1, 2, 3]);
    expect(getPageItems(20, 20)).toEqual([1, 'gap-19', 19, 20]);
  });
});

describe('getAdjacentEpisode', () => {
  const seasons = [
    { season_number: 0, episode_count: 3, air_date: '2008-01-01' },
    { season_number: 1, episode_count: 7, air_date: '2008-01-20' },
    { season_number: 2, episode_count: 13, air_date: '2009-03-08' },
    { season_number: 3, episode_count: 10, air_date: '2099-01-01' },
  ];

  test('aynı sezon içinde ilerler/geriler', () => {
    expect(getAdjacentEpisode(seasons, 1, 3, 7, 1)).toEqual({ season: 1, episode: 4 });
    expect(getAdjacentEpisode(seasons, 1, 3, 7, -1)).toEqual({ season: 1, episode: 2 });
  });

  test('sezon sınırını geçer, özel bölümleri atlar', () => {
    expect(getAdjacentEpisode(seasons, 1, 7, 7, 1)).toEqual({ season: 2, episode: 1 });
    expect(getAdjacentEpisode(seasons, 2, 1, 13, -1)).toEqual({ season: 1, episode: 7 });
    expect(getAdjacentEpisode(seasons, 1, 1, 7, -1)).toBeNull();
  });

  test('henüz yayınlanmamış sezona geçmez', () => {
    expect(getAdjacentEpisode(seasons, 2, 13, 13, 1)).toBeNull();
  });
});
