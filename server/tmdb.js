// Sunucu tarafı TMDB istemcisi (render, sitemap). Tarayıcıdaki axios istemcisinden bağımsızdır;
// yalnızca fetch kullanır ve her istek kısa bir zaman aşımıyla sınırlanır: TMDB yavaşsa
// sayfa varsayılan etiketlerle yine de hızlıca döner.
import { DEFAULT_TMDB_API_KEY, TMDB_API_BASE, pickTmdbApiKey } from '../src/lib/tmdbConfig.js';

export class TmdbError extends Error {
  constructor(status, message) {
    super(message);
    this.status = status;
  }
}

export const createTmdbClient = ({
  apiKey = DEFAULT_TMDB_API_KEY,
  fetchImpl = fetch,
  timeoutMs = 2500,
  language = 'tr-TR',
} = {}) => async (path, params = {}) => {
  const url = new URL(`${TMDB_API_BASE}${path}`);
  Object.entries({ api_key: apiKey, language, ...params }).forEach(([key, value]) => {
    if (value !== undefined && value !== null && value !== '') url.searchParams.set(key, String(value));
  });

  const controller = new AbortController();
  const timer = setTimeout(() => controller.abort(), timeoutMs);
  try {
    const response = await fetchImpl(url, { signal: controller.signal, headers: { Accept: 'application/json' } });
    if (!response.ok) throw new TmdbError(response.status, `TMDB ${response.status} ${path}`);
    return await response.json();
  } finally {
    clearTimeout(timer);
  }
};

export const createTmdbFromEnv = (env = {}, options = {}) =>
  createTmdbClient({ apiKey: pickTmdbApiKey(env.TMDB_API_KEY, env.VITE_TMDB_API_KEY), ...options });

// Sitenin mutlak adresi: açıkça verilmişse o, değilse Vercel'in üretim alan adı, en son istek adresi.
export const resolveSiteUrl = (env = {}, requestUrl) => {
  const explicit = env.SITE_URL || env.VITE_SITE_URL;
  if (explicit) return explicit.replace(/\/$/, '');
  if (env.VERCEL_PROJECT_PRODUCTION_URL) return `https://${env.VERCEL_PROJECT_PRODUCTION_URL}`;
  return requestUrl ? new URL(requestUrl).origin : '';
};
