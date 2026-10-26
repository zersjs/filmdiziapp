import { describe, expect, test } from 'vitest';
import { airedEpisodes, episodeKey, nextUp, parseEpisodeKey, seasonProgress, showProgress, unwatchedBefore } from '../episodes';
import { emptyLibrary, mergeLibraries, sanitizeEpisodes, sanitizeLibrary } from '../library';

// 2 sezon (3 + 4 bölüm), 2. sezonun 2. bölümü son yayınlanan; özel bölümler (sezon 0) var.
const show = {
  id: 1,
  seasons: [
    { season_number: 0, episode_count: 5 },
    { season_number: 2, episode_count: 4 },
    { season_number: 1, episode_count: 3 },
  ],
  last_episode_to_air: { season_number: 2, episode_number: 2 },
};
const set = (...keys) => new Set(keys);

describe('bölüm sırası ve ilerleme', () => {
  test('yayınlanmamış bölümler ve özel bölümler dahil edilmez', () => {
    expect(airedEpisodes(show).map(e => episodeKey(e.season, e.episode))).toEqual(['1x1', '1x2', '1x3', '2x1', '2x2']);
    expect(airedEpisodes({ seasons: show.seasons }).length).toBe(7);
    expect(airedEpisodes({ ...show, last_episode_to_air: { season_number: 0, episode_number: 3 } }).length).toBe(7);
  });

  test('anahtar dönüşümü', () => {
    expect(parseEpisodeKey('12x305')).toEqual({ season: 12, episode: 305 });
  });

  test('sıradaki bölüm en son izlenenden sonra gelir', () => {
    expect(nextUp(show, set())).toEqual({ season: 1, episode: 1 });
    expect(nextUp(show, set('1x1', '1x2'))).toEqual({ season: 1, episode: 3 });
    expect(nextUp(show, set('1x3'))).toEqual({ season: 2, episode: 1 }); // atlanan bölümlere geri dönmez
    expect(nextUp(show, set('1x1', '1x2', '1x3', '2x1', '2x2'))).toBeNull();
  });

  test('sezon ve dizi ilerlemesi', () => {
    expect(seasonProgress(1, set('1x1', '1x3'), show)).toEqual({ watched: 2, total: 3, complete: false });
    expect(seasonProgress(2, set('2x1', '2x2', '2x3'), show)).toEqual({ watched: 2, total: 2, complete: true });
    expect(showProgress(show, set('1x1', '2x1'))).toEqual({ watched: 2, total: 5, percent: 40, complete: false });
  });

  test('öncekileri de işaretle önerisi', () => {
    expect(unwatchedBefore(1, 3, set('1x1'), show)).toEqual([{ season: 1, episode: 2 }]);
    expect(unwatchedBefore(2, 1, set(), show)).toEqual([]);
  });
});

describe('izlenenler listesi (kitaplık modeli)', () => {
  test('bölüm anahtarları doğrulanır, tekrarlar atılır, sıralanır', () => {
    expect(sanitizeEpisodes(['2x1', '1x10', '1x2', '1x2', 'x', '3x0', 5, '<script>'])).toEqual(['1x2', '1x10', '2x1']);
  });

  test('filmde bölüm alanı tutulmaz; boş kitaplıkta liste var', () => {
    const library = sanitizeLibrary({
      watched: [
        { id: 1, media_type: 'tv', episodes: ['1x1'] },
        { id: 2, media_type: 'movie', episodes: ['1x1'] },
      ],
    });
    expect(library.watched[0].episodes).toEqual(['1x1']);
    expect(library.watched[1]).not.toHaveProperty('episodes');
    expect(emptyLibrary().watched).toEqual([]);
    expect(emptyLibrary().removed.watched).toEqual({});
  });

  test('iki cihazda değişen dizi kaydında en son değişiklik kazanır', () => {
    const a = { ...emptyLibrary(), watched: [{ id: 1, media_type: 'tv', episodes: ['1x1'], updatedAt: '2026-01-01T00:00:00.000Z' }] };
    const b = { ...emptyLibrary(), watched: [{ id: 1, media_type: 'tv', episodes: ['1x1', '1x2'], updatedAt: '2026-01-02T00:00:00.000Z' }] };
    expect(mergeLibraries(a, b).watched[0].episodes).toEqual(['1x1', '1x2']);
    expect(mergeLibraries(b, a).watched[0].episodes).toEqual(['1x1', '1x2']);
  });

  test('eski sürümden gelen (izlenenler listesi olmayan) kitaplık silme yapmaz', () => {
    const local = { ...emptyLibrary(), watched: [{ id: 1, media_type: 'movie', updatedAt: '2026-01-01T00:00:00.000Z' }] };
    const old = sanitizeLibrary({ favorites: [], removed: { favorites: {} } });
    expect(mergeLibraries(local, old).watched).toHaveLength(1);
  });
});
