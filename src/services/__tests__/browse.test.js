import { describe, expect, test } from 'vitest';
import { buildDiscoverParams, parseBrowseParams } from '../browse';

const today = new Date('2026-10-22T12:00:00Z');

describe('parseBrowseParams', () => {
  test('varsayılanlar', () => {
    expect(parseBrowseParams('movie', new URLSearchParams())).toEqual({
      sort: 'popular', genre: '', year: '', rating: '', page: 1,
    });
  });

  test('geçersiz sıralama ve sayfa düzeltilir', () => {
    const params = parseBrowseParams('tv', new URLSearchParams('sort=revenue&page=9999'));
    expect(params.sort).toBe('popular');
    expect(params.page).toBe(500);
  });
});

describe('buildDiscoverParams', () => {
  test('varsayılan sıralamada tür filtresi uygulanır (eski hata)', () => {
    const params = buildDiscoverParams('movie', { sort: 'popular', genre: '28', page: 2 }, today);
    expect(params.with_genres).toBe('28');
    expect(params.sort_by).toBe('popularity.desc');
    expect(params.page).toBe(2);
  });

  test('en yeni filmler doğru alanla ve geleceği hariç tutarak sıralanır', () => {
    const params = buildDiscoverParams('movie', { sort: 'newest' }, today);
    expect(params.sort_by).toBe('primary_release_date.desc');
    expect(params['primary_release_date.lte']).toBe('2026-10-22');
  });

  test('dizilerde yıl filtresi first_air_date_year kullanır', () => {
    const params = buildDiscoverParams('tv', { sort: 'popular', year: '2020' }, today);
    expect(params.first_air_date_year).toBe('2020');
    expect(params.primary_release_year).toBeUndefined();
  });

  test('puan filtresi minimum oy sayısı ekler', () => {
    const params = buildDiscoverParams('movie', { sort: 'popular', rating: '8' }, today);
    expect(params['vote_average.gte']).toBe('8');
    expect(params['vote_count.gte']).toBe(50);
  });

  test('vizyondakiler tarih aralığı kullanır', () => {
    const params = buildDiscoverParams('movie', { sort: 'now_playing' }, today);
    expect(params['release_date.lte']).toBe('2026-10-22');
    expect(params['release_date.gte']).toBe('2026-09-07');
  });
});
