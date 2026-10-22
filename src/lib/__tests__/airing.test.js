import { describe, expect, test } from 'vitest';
import { compareAiring, followedShowIds, pickAiringEpisode } from '../airing';

const now = new Date(2026, 9, 22, 20, 0); // 22 Ekim 2026, 20:00 (yerel)

describe('pickAiringEpisode', () => {
  test('son 10 günde yayınlanan bölüm izlenebilir olarak öne çıkar', () => {
    const show = { last_episode_to_air: { air_date: '2026-10-19' }, next_episode_to_air: { air_date: '2026-10-26' } };
    expect(pickAiringEpisode(show, now)).toMatchObject({ kind: 'aired', days: -3 });
  });

  test('bugün yayınlanan bölüm', () => {
    expect(pickAiringEpisode({ last_episode_to_air: { air_date: '2026-10-22' } }, now)).toMatchObject({ kind: 'aired', days: 0 });
  });

  test('yaklaşan bölüm 14 gün içindeyse', () => {
    const show = { last_episode_to_air: { air_date: '2026-09-01' }, next_episode_to_air: { air_date: '2026-10-23' } };
    expect(pickAiringEpisode(show, now)).toMatchObject({ kind: 'upcoming', days: 1 });
    expect(pickAiringEpisode({ next_episode_to_air: { air_date: '2026-12-01' } }, now)).toBeNull();
  });

  test('bilgi yoksa null', () => {
    expect(pickAiringEpisode({}, now)).toBeNull();
    expect(pickAiringEpisode({ next_episode_to_air: { air_date: null } }, now)).toBeNull();
  });
});

test('sıralama: önce yeni yayınlananlar (en yenisi), sonra yaklaşanlar (en yakını)', () => {
  const entries = [
    { kind: 'upcoming', days: 5 }, { kind: 'aired', days: -4 }, { kind: 'upcoming', days: 1 }, { kind: 'aired', days: 0 },
  ];
  expect(entries.sort(compareAiring)).toEqual([
    { kind: 'aired', days: 0 }, { kind: 'aired', days: -4 }, { kind: 'upcoming', days: 1 }, { kind: 'upcoming', days: 5 },
  ]);
});

test('followedShowIds yalnızca dizileri, tekrarsız ve öncelik sırasıyla alır', () => {
  const library = {
    continueWatching: [{ id: 1, media_type: 'tv' }, { id: 9, media_type: 'movie' }],
    favorites: [{ id: 2, media_type: 'tv' }, { id: 1, media_type: 'tv' }],
    watchLater: [{ id: 3, media_type: 'tv' }],
  };
  expect(followedShowIds(library)).toEqual([1, 2, 3]);
  expect(followedShowIds(library, 2)).toEqual([1, 2]);
});
