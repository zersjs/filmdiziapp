// Filmler / Diziler sayfalarının filtre ve sıralama mantığı.
// Tüm sorgular /discover üzerinden yapılır; böylece tür, yıl ve puan filtreleri
// her sıralama seçeneğiyle birlikte çalışır.

export const MAX_TMDB_PAGE = 500;

export const BROWSE_CONFIG = {
  movie: {
    title: 'Filmler',
    path: '/movies',
    sorts: [
      { value: 'popular', label: 'Popüler' },
      { value: 'top_rated', label: 'En yüksek puan' },
      { value: 'now_playing', label: 'Vizyonda' },
      { value: 'upcoming', label: 'Yakında' },
      { value: 'newest', label: 'En yeni' },
      { value: 'revenue', label: 'En çok hasılat' },
      { value: 'vote_count', label: 'En çok oy alan' },
    ],
  },
  tv: {
    title: 'Diziler',
    path: '/series',
    sorts: [
      { value: 'popular', label: 'Popüler' },
      { value: 'top_rated', label: 'En yüksek puan' },
      { value: 'on_the_air', label: 'Yayında' },
      { value: 'airing_today', label: 'Bugün yayında' },
      { value: 'newest', label: 'En yeni' },
      { value: 'vote_count', label: 'En çok oy alan' },
    ],
  },
};

export const RATING_OPTIONS = [9, 8, 7, 6, 5];

export const getYearOptions = (count = 60, now = new Date()) =>
  Array.from({ length: count }, (_, i) => now.getFullYear() + 1 - i);

const toIsoDate = (date) => date.toISOString().slice(0, 10);

const shiftDays = (base, days) => {
  const date = new Date(base);
  date.setDate(date.getDate() + days);
  return toIsoDate(date);
};

export const parseBrowseParams = (type, searchParams) => {
  const sorts = BROWSE_CONFIG[type].sorts.map(s => s.value);
  const sort = searchParams.get('sort');
  const page = parseInt(searchParams.get('page'), 10);
  return {
    sort: sorts.includes(sort) ? sort : 'popular',
    genre: searchParams.get('genre') || '',
    year: searchParams.get('year') || '',
    rating: searchParams.get('rating') || '',
    page: Number.isFinite(page) ? Math.min(Math.max(page, 1), MAX_TMDB_PAGE) : 1,
  };
};

export const buildDiscoverParams = (type, { sort, genre, year, rating, page = 1 }, today = new Date()) => {
  const isMovie = type === 'movie';
  const dateField = isMovie ? 'primary_release_date' : 'first_air_date';
  const params = {
    page,
    include_adult: false,
    sort_by: 'popularity.desc',
  };

  switch (sort) {
    case 'top_rated':
      params.sort_by = 'vote_average.desc';
      params['vote_count.gte'] = isMovie ? 300 : 150;
      break;
    case 'now_playing':
      params.with_release_type = '2|3';
      params['release_date.gte'] = shiftDays(today, -45);
      params['release_date.lte'] = toIsoDate(today);
      break;
    case 'upcoming':
      params.with_release_type = '2|3';
      params['release_date.gte'] = shiftDays(today, 1);
      params['release_date.lte'] = shiftDays(today, 180);
      break;
    case 'on_the_air':
      params['air_date.gte'] = toIsoDate(today);
      params['air_date.lte'] = shiftDays(today, 7);
      break;
    case 'airing_today':
      params['air_date.gte'] = toIsoDate(today);
      params['air_date.lte'] = toIsoDate(today);
      break;
    case 'newest':
      params.sort_by = `${dateField}.desc`;
      params[`${dateField}.lte`] = toIsoDate(today);
      params['vote_count.gte'] = 10;
      break;
    case 'revenue':
      params.sort_by = 'revenue.desc';
      break;
    case 'vote_count':
      params.sort_by = 'vote_count.desc';
      break;
    default:
      break;
  }

  if (genre) params.with_genres = genre;
  if (year) params[isMovie ? 'primary_release_year' : 'first_air_date_year'] = year;
  if (rating) {
    params['vote_average.gte'] = rating;
    params['vote_count.gte'] = Math.max(params['vote_count.gte'] || 0, 50);
  }

  return params;
};
