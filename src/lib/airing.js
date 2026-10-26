import { daysUntil } from '../utils/helpers.js';

export const RECENT_DAYS = 10;
export const UPCOMING_DAYS = 14;

// Takip edilen bir dizi için gösterilecek bölüm: son 10 günde yayınlanan bölüm
// (hemen izlenebilir) ya da önümüzdeki 14 gün içinde yayınlanacak olan.
export const pickAiringEpisode = (show, now = new Date()) => {
  const last = show?.last_episode_to_air;
  const lastDays = daysUntil(last?.air_date, now);
  if (lastDays !== null && lastDays <= 0 && lastDays >= -RECENT_DAYS) {
    return { kind: 'aired', episode: last, days: lastDays };
  }
  const next = show?.next_episode_to_air;
  const nextDays = daysUntil(next?.air_date, now);
  if (nextDays !== null && nextDays >= 0 && nextDays <= UPCOMING_DAYS) {
    return { kind: 'upcoming', episode: next, days: nextDays };
  }
  return null;
};

// Önce izlenebilir yeni bölümler (en yenisi başta), sonra yaklaşanlar (en yakını başta).
export const compareAiring = (a, b) => {
  if (a.kind !== b.kind) return a.kind === 'aired' ? -1 : 1;
  return a.kind === 'aired' ? b.days - a.days : a.days - b.days;
};

// Kitaplıktaki diziler: önce izlenmeye devam edilenler, sonra favoriler ve izleme listesi.
export const followedShowIds = ({ continueWatching = [], favorites = [], watchLater = [] }, limit = 20) => {
  const ids = [];
  [...continueWatching, ...favorites, ...watchLater].forEach(item => {
    if (item.media_type === 'tv' && !ids.includes(item.id)) ids.push(item.id);
  });
  return ids.slice(0, limit);
};
