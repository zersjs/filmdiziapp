import { describe, expect, test } from 'vitest';
import { buildDiscoverParams, hasRefiningFilters, parseBrowseParams } from '../browse';

const today = new Date('2026-10-22T12:00:00Z');

describe('parseBrowseParams', () => {
  test('varsayılanlar', () => {
    expect(parseBrowseParams('movie', new URLSearchParams())).toEqual({
      sort: 'popular', genre: '', year: '', rating: '', provider: '', page: 1,
    });
  });

  test('tür adres yolundan gelir, sorgudaki genre yok sayılır', () => {
    const params = parseBrowseParams('movie', new URLSearchParams('genre=99'), 28);
    expect(params.genre).toBe('28');
  });

  test('geçersiz platform kimliği yok sayılır', () => {
    expect(parseBrowseParams('movie', new URLSearchParams('provider=8')).provider).toBe('8');
    expect(parseBrowseParams('movie', new URLSearchParams('provider=netflix')).provider).toBe('');
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

  test('platform filtresi Türkiye abonelik kataloğunu sorgular', () => {
    const params = buildDiscoverParams('tv', { sort: 'popular', provider: '8' }, today);
    expect(params.with_watch_providers).toBe('8');
    expect(params.watch_region).toBe('TR');
    expect(params.with_watch_monetization_types).toBe('flatrate|free|ads');
  });

  test('vizyondakiler tarih aralığı kullanır', () => {
    const params = buildDiscoverParams('movie', { sort: 'now_playing' }, today);
    expect(params['release_date.lte']).toBe('2026-10-22');
    expect(params['release_date.gte']).toBe('2026-09-07');
  });
});

describe('hasRefiningFilters', () => {
  test('yalnızca tür seçiliyse sayfa canonical kalır', () => {
    expect(hasRefiningFilters({ sort: 'popular', genre: '28', year: '', rating: '', provider: '' })).toBe(false);
    expect(hasRefiningFilters({ sort: 'top_rated', genre: '', year: '', rating: '', provider: '' })).toBe(true);
    expect(hasRefiningFilters({ sort: 'popular', genre: '', year: '', rating: '', provider: '8' })).toBe(true);
  });
});
