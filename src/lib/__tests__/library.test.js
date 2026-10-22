import { describe, expect, test } from 'vitest';
import { emptyLibrary, librarySignature, mergeLibraries, sanitizeLibrary } from '../library';

const t = (minutes) => new Date(Date.UTC(2026, 0, 1, 0, minutes)).toISOString();

describe('sanitizeLibrary', () => {
  test('geçersiz öğeleri ve bilinmeyen alanları atar', () => {
    const library = sanitizeLibrary({
      favorites: [
        { id: 1, media_type: 'movie', title: 'A', evil: '<script>', poster_path: 'javascript:alert(1)', vote_average: 99 },
        { id: -3, media_type: 'movie' },
        { id: 2, media_type: 'person' },
        { id: 1, media_type: 'movie', title: 'kopya' },
        'string',
      ],
      watchLater: 'liste değil',
      removed: { favorites: { 'movie-9': t(1), '<x>': t(1), 'tv-2': 'tarih değil' } },
    }, Date.parse(t(2)));

    expect(library.favorites).toHaveLength(1);
    expect(library.favorites[0]).not.toHaveProperty('evil');
    expect(library.favorites[0].poster_path).toBeNull();
    expect(library.favorites[0].vote_average).toBe(10);
    expect(library.watchLater).toEqual([]);
    expect(library.removed.favorites).toEqual({ 'movie-9': t(1) });
  });

  test('liste sınırlarını uygular ve eski silme kayıtlarını atar', () => {
    const many = Array.from({ length: 50 }, (_, i) => ({ id: i + 1, media_type: 'tv' }));
    const now = Date.parse('2026-06-01T00:00:00.000Z');
    const library = sanitizeLibrary({
      continueWatching: many,
      removed: { watchLater: { 'tv-1': '2025-01-01T00:00:00.000Z', 'tv-2': '2026-05-30T00:00:00.000Z' } },
    }, now);
    expect(library.continueWatching).toHaveLength(30);
    expect(Object.keys(library.removed.watchLater)).toEqual(['tv-2']);
  });
});

describe('mergeLibraries', () => {
  test('iki cihazın öğelerini birleştirir, aynı öğede yeni olan kazanır', () => {
    const a = { ...emptyLibrary(), continueWatching: [{ id: 1, media_type: 'tv', season: 1, episode: 2, updatedAt: t(5) }] };
    const b = {
      ...emptyLibrary(),
      continueWatching: [{ id: 1, media_type: 'tv', season: 1, episode: 4, updatedAt: t(9) }],
      favorites: [{ id: 7, media_type: 'movie', addedAt: t(1) }],
    };
    const merged = mergeLibraries(a, b);
    expect(merged.continueWatching).toEqual([{ id: 1, media_type: 'tv', season: 1, episode: 4, updatedAt: t(9) }]);
    expect(merged.favorites).toHaveLength(1);
  });

  test('silme kaydı daha eski öğeyi düşürür, silmeden sonra yeniden ekleme kazanır', () => {
    const deviceA = { ...emptyLibrary(), favorites: [{ id: 1, media_type: 'movie', addedAt: t(1) }] };
    const deviceB = { ...emptyLibrary(), removed: { ...emptyLibrary().removed, favorites: { 'movie-1': t(3) } } };
    expect(mergeLibraries(deviceA, deviceB).favorites).toEqual([]);
    expect(mergeLibraries(deviceB, deviceA).favorites).toEqual([]);

    const readded = { ...emptyLibrary(), favorites: [{ id: 1, media_type: 'movie', addedAt: t(1), updatedAt: t(6) }] };
    const merged = mergeLibraries(deviceB, readded);
    expect(merged.favorites).toHaveLength(1);
    expect(merged.removed.favorites).toEqual({});
  });

  test('birleştirme yer değiştirmeli ve idempotent', () => {
    const a = { ...emptyLibrary(), favorites: [{ id: 1, media_type: 'movie', addedAt: t(2) }], removed: { ...emptyLibrary().removed, watchLater: { 'tv-5': t(4) } } };
    const b = { ...emptyLibrary(), favorites: [{ id: 2, media_type: 'tv', addedAt: t(3) }], watchLater: [{ id: 5, media_type: 'tv', addedAt: t(1) }] };
    const ab = mergeLibraries(a, b);
    expect(librarySignature(ab)).toBe(librarySignature(mergeLibraries(b, a)));
    expect(librarySignature(mergeLibraries(ab, ab))).toBe(librarySignature(ab));
    expect(ab.watchLater).toEqual([]);
  });
});
