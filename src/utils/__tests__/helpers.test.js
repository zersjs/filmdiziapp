import { describe, expect, test } from 'vitest';
import {
  createSlug, dedupeById, formatRuntime, getDetailPath, getMediaType, getTitle, getWatchPath, getYear,
} from '../helpers';
import { createShortSlug, parseShortSlug } from '../../services/shorts';

describe('createSlug', () => {
  test('Türkçe karakterleri dönüştürür ve -izle ekler', () => {
    expect(createSlug('Dövüş Kulübü')).toBe('dovus-kulubu-izle');
    expect(createSlug('Çağrı: İlk Şafak!')).toBe('cagri-ilk-safak-izle');
  });

  test('Latin olmayan başlıklarda boş slug üretmez', () => {
    expect(createSlug('葬送のフリーレン')).toBe('izle');
    expect(createSlug('')).toBe('');
  });
});

describe('media helpers', () => {
  const movie = { id: 550, title: 'Dövüş Kulübü', release_date: '1999-10-15' };
  const tv = { id: 1396, name: 'Breaking Bad', first_air_date: '2008-01-20', media_type: 'tv' };

  test('getTitle / getMediaType', () => {
    expect(getTitle(movie)).toBe('Dövüş Kulübü');
    expect(getTitle(tv)).toBe('Breaking Bad');
    expect(getMediaType(tv, 'movie')).toBe('tv');
    expect(getMediaType(movie, 'movie')).toBe('movie');
  });

  test('getDetailPath / getWatchPath', () => {
    expect(getDetailPath(movie, 'movie')).toBe('/movie/550/dovus-kulubu-izle');
    expect(getWatchPath(movie, 'movie')).toBe('/watch/movie/550/dovus-kulubu-izle');
    expect(getWatchPath(tv, 'tv', { season: 2, episode: 5 })).toBe('/watch/tv/1396/breaking-bad-izle?season=2&episode=5');
  });

  test('getYear geçersiz tarihte boş döner', () => {
    expect(getYear('2008-01-20')).toBe(2008);
    expect(getYear('')).toBe('');
    expect(getYear('not-a-date')).toBe('');
  });

  test('formatRuntime', () => {
    expect(formatRuntime(139)).toBe('2 sa 19 dk');
    expect(formatRuntime(45)).toBe('45 dk');
    expect(formatRuntime(120)).toBe('2 sa');
    expect(formatRuntime(0)).toBeNull();
  });

  test('dedupeById aynı id + tür ikilisini tekilleştirir', () => {
    const items = [{ id: 1, media_type: 'movie' }, { id: 1, media_type: 'movie' }, { id: 1, media_type: 'tv' }];
    expect(dedupeById(items)).toHaveLength(2);
  });
});

describe('short slug', () => {
  test('oluşturulan slug geri çözülebilir', () => {
    const slug = createShortSlug({ id: 969681, media_type: 'movie', title: 'Örümcek-Adam: Yepyeni Bir Gün' });
    expect(slug).toBe('969681-movie-orumcek-adam-yepyeni-bir-gun');
    expect(parseShortSlug(slug)).toEqual({ id: 969681, mediaType: 'movie' });
  });

  test('geçersiz slug null döner', () => {
    expect(parseShortSlug('abc-movie')).toBeNull();
    expect(parseShortSlug('12-person-x')).toBeNull();
    expect(parseShortSlug('12-tv')).toEqual({ id: 12, mediaType: 'tv' });
  });
});
