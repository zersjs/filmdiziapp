import { describe, expect, test, vi } from 'vitest';
import {
  createRandom, createShortsEngine, createSources, getTrailerLabel, pickShortTrailer, shuffle, topGenres,
} from '../shorts';

const item = (id, type = 'movie', extra = {}) => ({ id, media_type: type, title: `T${id}`, poster_path: `/p${id}.jpg`, ...extra });

const source = (id, pages, maxPages = 5) => ({
  id,
  maxPages,
  fetch: vi.fn(async (page) => ({ results: pages[page - 1] || [], totalPages: pages.length })),
});

const trailerFor = (candidate) => ({ key: `yt${candidate.id}`, type: 'Trailer' });

describe('pickShortTrailer', () => {
  const videos = [
    { site: 'YouTube', key: 'a', type: 'Teaser', official: true, iso_639_1: 'tr' },
    { site: 'YouTube', key: 'b', type: 'Trailer', official: true, iso_639_1: 'en' },
    { site: 'YouTube', key: 'c', type: 'Trailer', official: true, iso_639_1: 'tr' },
    { site: 'Vimeo', key: 'd', type: 'Trailer', official: true, iso_639_1: 'tr' },
    { site: 'YouTube', key: 'e', type: 'Behind the Scenes', official: true, iso_639_1: 'tr' },
  ];

  test('Türkçe resmi fragmanı tercih eder, YouTube dışını ve uygunsuz türleri atlar', () => {
    expect(pickShortTrailer(videos).key).toBe('c');
  });

  test('oynatılamadığı bilinen videoyu atlayıp sıradakini seçer', () => {
    expect(pickShortTrailer(videos, new Set(['c'])).key).toBe('b');
    expect(pickShortTrailer([])).toBeNull();
  });

  test('etiket', () => {
    expect(getTrailerLabel({ type: 'Trailer', official: true, language: 'tr' })).toBe('Resmi fragman · Türkçe');
    expect(getTrailerLabel({ type: 'Teaser', official: false, language: 'en' })).toBe('Teaser · İngilizce');
  });
});

describe('seeded random', () => {
  test('aynı tohum aynı sırayı üretir', () => {
    const list = Array.from({ length: 20 }, (_, i) => i);
    expect(shuffle(list, createRandom(42))).toEqual(shuffle(list, createRandom(42)));
    expect(shuffle(list, createRandom(42))).not.toEqual(shuffle(list, createRandom(7)));
  });
});

describe('createShortsEngine', () => {
  test('kaynakları sırayla karıştırır ve tekrarları atar', async () => {
    const a = source('a', [[item(1), item(2), item(3)]]);
    const b = source('b', [[item(1), item(10, 'tv'), item(11, 'tv')]]);
    const engine = createShortsEngine({ sources: [a, b], resolveTrailer: trailerFor, random: () => 0, concurrency: 2 });

    const result = await engine.take(5);
    const keys = result.map(r => `${r.media_type}-${r.id}`);
    expect(new Set(keys).size).toBe(keys.length);
    expect(keys).toHaveLength(5);
    // İlk iki sahne farklı kaynaklardan gelir
    expect(result[0].media_type).not.toBe(result[1].media_type);
    expect(result.every(r => r.trailer.key === `yt${r.id}`)).toBe(true);
  });

  test('fragmanı olmayanları ve hatalı çözümlemeleri atlar', async () => {
    const s = source('s', [[item(1), item(2), item(3), item(4)]]);
    const resolveTrailer = vi.fn(async (c) => {
      if (c.id === 2) return null;
      if (c.id === 3) throw new Error('ağ');
      return trailerFor(c);
    });
    const engine = createShortsEngine({ sources: [s], resolveTrailer, random: () => 0.5 });
    const result = await engine.take(10);
    expect(result.map(r => r.id).sort()).toEqual([1, 4]);
  });

  test('geçersiz adayları (posterleri olmayan, kişi, yetişkin) atar', async () => {
    const s = source('s', [[item(1), { id: 2, media_type: 'person' }, item(3, 'movie', { poster_path: null }), item(4, 'movie', { adult: true })]]);
    const engine = createShortsEngine({ sources: [s], resolveTrailer: trailerFor });
    expect((await engine.take(10)).map(r => r.id)).toEqual([1]);
  });

  test('izlenenleri ilk turda atlar, kaynak bitince onlara da izin verir', async () => {
    const s = source('s', [[item(1), item(2)]]);
    const engine = createShortsEngine({
      sources: [s],
      resolveTrailer: trailerFor,
      isExcluded: (c) => c.id === 1,
      random: () => 0,
    });
    expect((await engine.take(1)).map(r => r.id)).toEqual([2]);
    expect((await engine.take(1)).map(r => r.id)).toEqual([1]);
    expect(await engine.take(1)).toEqual([]);
  });

  test('markServed ile eklenen öğe tekrar gelmez', async () => {
    const s = source('s', [[item(1), item(2)]]);
    const engine = createShortsEngine({ sources: [s], resolveTrailer: trailerFor });
    engine.markServed(item(1));
    expect((await engine.take(5)).map(r => r.id)).toEqual([2]);
  });

  test('sayfa başına en fazla maxPages kadar istek atar ve hatalı kaynağı bırakır', async () => {
    const paged = source('paged', [[item(1)], [item(2)], [item(3)]], 2);
    const broken = { id: 'broken', maxPages: 5, fetch: vi.fn(async () => { throw new Error('500'); }) };
    const engine = createShortsEngine({ sources: [paged, broken], resolveTrailer: trailerFor });
    const result = await engine.take(10);
    expect(result.map(r => r.id).sort()).toEqual([1, 2]);
    expect(paged.fetch.mock.calls.length).toBeLessThanOrEqual(4); // 2 sayfa × (ilk tur + ikinci tur)
  });
});

describe('kişiselleştirme', () => {
  test('topGenres en sık türleri döndürür', () => {
    expect(topGenres([{ genre_ids: [1, 2] }, { genre_ids: [2, 3] }, { genre_ids: [2] }], 2)).toEqual([2, 1]);
  });

  test('kitaplıkta tür varsa kişisel kaynaklar eklenir', () => {
    const plain = createSources({});
    const personal = createSources({ favorites: [{ media_type: 'movie', genre_ids: [28] }], watchLater: [{ media_type: 'tv', genre_ids: [18] }] });
    expect(personal.length).toBe(plain.length + 2);
    expect(personal.map(s => s.id)).toContain('for-you-movie');
    expect(personal.map(s => s.id)).toContain('for-you-tv');
  });
});
