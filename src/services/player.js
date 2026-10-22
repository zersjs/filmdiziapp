// Oynatıcı kaynakları. URL'ler üçüncü taraf gömme (embed) servislerine aittir.
const movieUrls = {
  vidsrc: (id) => `https://vidsrc.to/embed/movie/${id}`,
  vidfast: (id) => `https://vidfast.pro/embed/movie/${id}`,
};

const tvUrls = {
  vidsrc: (id, season, episode) => `https://vidsrc.to/embed/tv/${id}/${season}/${episode}`,
  vidfast: (id, season, episode) => `https://vidfast.pro/embed/tv/${id}/${season}/${episode}`,
};

const providerNames = {
  vidsrc: 'VidSrc',
  vidfast: 'VidFast Pro',
};

const toSources = (providers, buildUrl) =>
  providers
    .filter(provider => buildUrl[provider])
    .map(provider => ({
      provider,
      name: providerNames[provider] || provider,
      url: buildUrl[provider](),
    }));

export const playerService = {
  getMovieUrl: (tmdbId, providers = Object.keys(movieUrls)) =>
    toSources(providers, Object.fromEntries(
      Object.entries(movieUrls).map(([key, build]) => [key, () => build(tmdbId)])
    )),

  getTvUrl: (tmdbId, season, episode, providers = Object.keys(tvUrls)) =>
    toSources(providers, Object.fromEntries(
      Object.entries(tvUrls).map(([key, build]) => [key, () => build(tmdbId, season, episode)])
    )),
};

export default playerService;
