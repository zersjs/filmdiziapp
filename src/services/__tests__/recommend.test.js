import { describe, expect, test } from 'vitest';
import {
  buildPool, buildRecommendParams, criteriaToSearch, parseCriteria, seededRandom,
} from '../recommend';

const today = new Date('2026-10-22T12:00:00Z');

describe('ölçütler ↔ adres', () => {
  test('geçersiz değerler ayıklanır', () => {
    const criteria = parseCriteria(new URLSearchParams('tur=belgesel&mod=gerilim&sure=uzun&platform=8,abc,337'));
    expect(criteria).toEqual({ type: 'any', mood: 'gerilim', runtime: '', era: '', providers: ['8', '337'] });
  });

  test('gidiş-dönüş', () => {
    const criteria = { type: 'tv', mood: 'hafif', runtime: 'kisa', era: 'yeni', providers: ['8'] };
    expect(parseCriteria(criteriaToSearch(criteria))).toEqual(criteria);
    expect(criteriaToSearch({ type: 'any', providers: [] }).toString()).toBe('');
  });
});

describe('buildRecommendParams', () => {
  test('ruh hali türleri "veya" ile, aykırı türler hariç', () => {
    const params = buildRecommendParams('movie', { mood: 'hafif' }, 1, today);
    expect(params.with_genres).toBe('35|10751|16');
    expect(params.without_genres).toBe('27,53,10752,80');
    expect(params['vote_average.gte']).toBe(6.8);
  });

  test('dizide süre bölüm uzunluğu, dönem ilk yayın tarihi', () => {
    const params = buildRecommendParams('tv', { runtime: 'kisa', era: 'yeni' }, 2, today);
    expect(params['with_runtime.lte']).toBe(35);
    expect(params['first_air_date.gte']).toBe('2023-01-01');
    expect(params['first_air_date.lte']).toBe('2026-10-22');
    expect(params['vote_count.gte']).toBe(80);
    expect(params.page).toBe(2);
  });

  test('klasikler 2000 öncesi; platformlar Türkiye abonelik kataloğu', () => {
    const params = buildRecommendParams('movie', { era: 'klasik', providers: ['8', '337'] }, 1, today);
    expect(params['primary_release_date.lte']).toBe('1999-12-31');
    expect(params.with_watch_providers).toBe('8|337');
    expect(params.watch_region).toBe('TR');
  });
});

describe('buildPool', () => {
  const item = (type, id, extra = {}) => ({ media_type: type, id, poster_path: '/p', backdrop_path: '/b', overview: 'x', ...extra });

  test('listeleri dönüşümlü birleştirir, eksik görselli ve hariç tutulanları atar', () => {
    const movies = [item('movie', 1), item('movie', 2, { backdrop_path: null }), item('movie', 3)];
    const shows = [item('tv', 1), item('tv', 2)];
    const pool = buildPool([movies, shows], { exclude: new Set(['tv-2']), random: () => 0.999999 });
    expect(pool.map(i => `${i.media_type}-${i.id}`)).toEqual(['movie-1', 'tv-1', 'movie-3']);
  });

  test('aynı tohum aynı sırayı verir', () => {
    const list = Array.from({ length: 20 }, (_, i) => item('movie', i));
    const a = buildPool([list], { random: seededRandom(42) }).map(i => i.id);
    const b = buildPool([list], { random: seededRandom(42) }).map(i => i.id);
    const c = buildPool([list], { random: seededRandom(43) }).map(i => i.id);
    expect(a).toEqual(b);
    expect(a).not.toEqual(c);
    expect([...a].sort((x, y) => x - y)).toEqual(list.map(i => i.id));
  });
});
