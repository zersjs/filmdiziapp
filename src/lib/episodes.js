// Dizi bölüm takibi: "sezon x bölüm" anahtarları, yayınlanmış bölüm sırası,
// sezon/dizi ilerlemesi ve sıradaki bölüm. Saf fonksiyonlar; TMDB dizi detayıyla çalışır.

export const episodeKey = (season, episode) => `${season}x${episode}`;

export const parseEpisodeKey = (key) => {
  const [season, episode] = String(key).split('x').map(Number);
  return { season, episode };
};

// Özel bölümler (sezon 0) ilerlemeye sayılmaz.
const regularSeasons = (media) =>
  (media?.seasons || [])
    .filter(season => season.season_number > 0 && season.episode_count > 0)
    .sort((a, b) => a.season_number - b.season_number);

// Yayınlanmış bölümler, izlenme sırasıyla. Son yayınlanan bölüm biliniyorsa sonrası (henüz
// yayınlanmamış olanlar) dahil edilmez; böylece "sıradaki" asla gelecekteki bir bölüm olmaz.
export const airedEpisodes = (media) => {
  const last = media?.last_episode_to_air?.season_number > 0 ? media.last_episode_to_air : null;
  const episodes = [];
  for (const season of regularSeasons(media)) {
    if (last && season.season_number > last.season_number) break;
    const count = last && season.season_number === last.season_number
      ? Math.min(season.episode_count, last.episode_number)
      : season.episode_count;
    for (let episode = 1; episode <= count; episode += 1) {
      episodes.push({ season: season.season_number, episode });
    }
  }
  return episodes;
};

export const seasonProgress = (season, watched, media) => {
  const aired = airedEpisodes(media).filter(e => e.season === season);
  const done = aired.filter(e => watched.has(episodeKey(e.season, e.episode))).length;
  return { watched: done, total: aired.length, complete: aired.length > 0 && done === aired.length };
};

export const showProgress = (media, watched) => {
  const aired = airedEpisodes(media);
  const done = aired.filter(e => watched.has(episodeKey(e.season, e.episode))).length;
  return {
    watched: done,
    total: aired.length,
    percent: aired.length ? Math.round((done / aired.length) * 100) : 0,
    complete: aired.length > 0 && done === aired.length,
  };
};

// Sıradaki bölüm: en son izlenen bölümden (izleme sırasına göre) sonraki ilk izlenmemiş bölüm.
// Hiç izlenmemişse ilk bölüm; tümü izlendiyse null.
export const nextUp = (media, watched) => {
  const aired = airedEpisodes(media);
  if (!aired.length) return null;
  let lastIndex = -1;
  aired.forEach((e, index) => {
    if (watched.has(episodeKey(e.season, e.episode))) lastIndex = index;
  });
  for (let index = lastIndex + 1; index < aired.length; index += 1) {
    const candidate = aired[index];
    if (!watched.has(episodeKey(candidate.season, candidate.episode))) return candidate;
  }
  return lastIndex === -1 ? aired[0] : null;
};

// Bir sezonda verilen bölümden önceki izlenmemiş bölümler ("öncekileri de işaretle" önerisi için).
export const unwatchedBefore = (season, episode, watched, media) =>
  airedEpisodes(media).filter(e => e.season === season && e.episode < episode && !watched.has(episodeKey(e.season, e.episode)));
