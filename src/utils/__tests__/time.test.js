import { describe, expect, test } from 'vitest';
import { daysUntil, getPersonPath, isGenericEpisodeName, relativeDay, slugify } from '../helpers';
import { routeKey } from '../dom';
import { formatTimeAt, locativeSuffix } from '../../components/Detail/AiringInfo';

const now = new Date(2026, 9, 22, 23, 30); // 22 Ekim 2026 Perşembe, 23:30

describe('relativeDay', () => {
  test('yakın günler', () => {
    expect(daysUntil('2026-10-22', now)).toBe(0);
    expect(relativeDay('2026-10-22', now)).toBe('bugün');
    expect(relativeDay('2026-10-23', now)).toBe('yarın');
    expect(relativeDay('2026-10-21', now)).toBe('dün');
    expect(relativeDay('2026-10-25', now)).toBe('3 gün sonra');
    expect(relativeDay('2026-10-18', now)).toBe('4 gün önce');
  });

  test('uzak tarihler', () => {
    expect(relativeDay('2026-11-06', now)).toBe('6 Kasım Cuma');
    expect(relativeDay('2027-03-01', now, { weekday: false })).toBe('1 Mart 2027');
    expect(relativeDay('', now)).toBe('');
  });
});

describe('Türkçe saat eki', () => {
  test.each([
    [41, 'de'], [30, 'da'], [40, 'ta'], [3, 'te'], [6, 'da'], [9, 'da'], [10, 'da'], [20, 'de'], [50, 'de'], [0, 'da'],
  ])('%i → %s', (number, suffix) => {
    expect(locativeSuffix(number)).toBe(suffix);
  });

  test('dakika sıfırsa saate bakılır', () => {
    expect(formatTimeAt(new Date(2026, 9, 22, 22, 0))).toBe("22:00'de");
    expect(formatTimeAt(new Date(2026, 9, 22, 21, 40))).toBe("21:40'ta");
    expect(formatTimeAt(new Date(2026, 9, 22, 1, 15))).toBe("01:15'te");
  });
});

describe('adres yardımcıları', () => {
  test('slugify / getPersonPath', () => {
    expect(slugify('Şükrü Özyıldız')).toBe('sukru-ozyildiz');
    expect(getPersonPath({ id: 1, name: '周星驰' })).toBe('/person/1');
  });

  test('routeKey aynı içerikte sabit kalır', () => {
    expect(routeKey('/movie/550/dovus-kulubu-izle')).toBe('/movie/550');
    expect(routeKey('/movie/550')).toBe('/movie/550');
    expect(routeKey('/watch/tv/1396/breaking-bad-izle')).toBe('/watch/tv/1396');
    expect(routeKey('/movies/genre/aksiyon')).toBe('/movies');
    expect(routeKey('/sahneler/dune-movie-438631')).toBe('/sahneler');
    expect(routeKey('/')).toBe('/');
  });
});

test('isGenericEpisodeName', () => {
  ['Bölüm 5', '823. Bölüm', 'Episode 12', '', undefined].forEach(name => expect(isGenericEpisodeName(name)).toBe(true));
  ['Pilot', 'Ölü Arının İğnesi'].forEach(name => expect(isGenericEpisodeName(name)).toBe(false));
});
