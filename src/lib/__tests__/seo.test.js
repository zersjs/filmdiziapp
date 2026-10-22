import { describe, expect, test } from 'vitest';
import {
  clampText, formatPageTitle, genreSeo, isNoindexPath, isoDuration, mediaJsonLd, mediaSeo, personSeo,
} from '../seo';
import { GENRES, genreById, genreBySlug, genrePath } from '../genres';

const SITE = 'https://sinefix.example';

describe('metin yardımcıları', () => {
  test('clampText kelime sınırında keser', () => {
    const text = 'kelime '.repeat(40);
    const clamped = clampText(text, 50);
    expect(clamped.length).toBeLessThanOrEqual(50);
    expect(clamped.endsWith('kelime…')).toBe(true);
    expect(clampText('  kısa   metin ')).toBe('kısa metin');
  });

  test('isoDuration', () => {
    expect(isoDuration(139)).toBe('PT2H19M');
    expect(isoDuration(60)).toBe('PT1H');
    expect(isoDuration(45)).toBe('PT45M');
    expect(isoDuration(0)).toBeUndefined();
  });

  test('formatPageTitle ve noindex yolları', () => {
    expect(formatPageTitle('Diziler')).toBe('Diziler | SINEFIX');
    expect(formatPageTitle()).toBe('SINEFIX — Film ve dizi keşfet');
    expect(isNoindexPath('/watch/movie/1/x')).toBe(true);
    expect(isNoindexPath('/search')).toBe(true);
    expect(isNoindexPath('/movies')).toBe(false);
  });
});

describe('mediaSeo / mediaJsonLd', () => {
  const tv = {
    id: 1399,
    name: 'Taht Oyunları',
    original_name: 'Game of Thrones',
    first_air_date: '2011-04-17',
    last_air_date: '2019-05-19',
    status: 'Ended',
    number_of_seasons: 8,
    genres: [{ id: 10765, name: 'Bilim Kurgu & Fantazi' }, { id: 18, name: 'Dram' }],
    created_by: [{ id: 9813, name: 'David Benioff' }],
    aggregate_credits: { cast: [{ id: 22970, name: 'Peter Dinklage' }] },
    vote_average: 8.5,
    vote_count: 25000,
    external_ids: { imdb_id: 'tt0944947' },
    videos: { results: [{ site: 'YouTube', type: 'Trailer', official: true, key: 'abc', published_at: '2011-03-01T00:00:00Z' }] },
  };

  test('dizi JSON-LD', () => {
    const data = mediaJsonLd('tv', tv, SITE);
    expect(data['@type']).toBe('TVSeries');
    expect(data.alternateName).toBe('Game of Thrones');
    expect(data.endDate).toBe('2019-05-19');
    expect(data.creator[0]).toEqual({ '@type': 'Person', name: 'David Benioff', url: `${SITE}/person/9813/david-benioff` });
    expect(data.actor[0].name).toBe('Peter Dinklage');
    expect(data.trailer.embedUrl).toBe('https://www.youtube.com/embed/abc');
    expect(data.sameAs).toEqual(['https://www.imdb.com/title/tt0944947/']);
    expect(data).not.toHaveProperty('aggregateRating');
    expect(data).not.toHaveProperty('image'); // afiş yoksa boş alan basılmaz
  });

  test('breadcrumb ilk bilinen türü kullanır', () => {
    const seo = mediaSeo('tv', tv, SITE);
    expect(seo.title).toBe('Taht Oyunları (2011)');
    expect(seo.path).toBe('/tv/1399/taht-oyunlari-izle');
    expect(seo.breadcrumbs.map(c => c.path)).toEqual(['/', '/series', '/series/genre/bilim-kurgu-fantazi', '/tv/1399/taht-oyunlari-izle']);
    expect(seo.description).toContain('Taht Oyunları (2011) dizi hakkında');
    expect(seo.ogType).toBe('video.tv_show');
  });
});

describe('personSeo / genreSeo', () => {
  test('kişi', () => {
    const seo = personSeo({ id: 287, name: 'Brad Pitt', birthday: '1963-12-18', external_ids: { imdb_id: 'nm0000093' } }, SITE);
    expect(seo.path).toBe('/person/287/brad-pitt');
    expect(seo.jsonLd[0].sameAs).toEqual(['https://www.imdb.com/name/nm0000093/']);
    expect(seo.description).toBe('Brad Pitt filmleri, dizileri ve biyografisi.');
  });

  test('tür sayfası ItemList', () => {
    const genre = genreBySlug('movie', 'korku');
    const seo = genreSeo('movie', genre, SITE, [{ id: 1, title: 'A' }, { id: 2, title: 'B' }]);
    expect(seo.title).toBe('Korku filmleri: popüler ve en iyi filmler');
    expect(seo.jsonLd[1].itemListElement[1]).toEqual({ '@type': 'ListItem', position: 2, url: `${SITE}/movie/2/b-izle` });
  });
});

describe('genres', () => {
  test.each(['movie', 'tv'])('%s tür adresleri benzersiz ve URL güvenli', (type) => {
    const slugs = GENRES[type].map(g => g.slug);
    expect(new Set(slugs).size).toBe(slugs.length);
    slugs.forEach(slug => expect(slug).toMatch(/^[a-z0-9-]+$/));
  });

  test('kimlik ↔ adres', () => {
    expect(genrePath('tv', genreById('tv', '10759'))).toBe('/series/genre/aksiyon-macera');
    expect(genreById('movie', 10759)).toBeNull();
  });
});
