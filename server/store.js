// Senkronizasyon için anahtar-değer deposu.
// Üretimde Upstash Redis'in REST API'si kullanılır (Vercel Marketplace'ten
// eklendiğinde KV_REST_API_URL / KV_REST_API_TOKEN değişkenleri otomatik tanımlanır).
// Ek bir paket gerekmez; istekler fetch ile yapılır.

const PREFIX = 'sinefix:';

export const createRedisStore = ({ url, token, fetchImpl = fetch }) => {
  const call = async (path, body) => {
    const response = await fetchImpl(`${url.replace(/\/$/, '')}${path}`, {
      method: 'POST',
      headers: { Authorization: `Bearer ${token}`, 'Content-Type': 'application/json' },
      body: JSON.stringify(body),
    });
    if (!response.ok) throw new Error(`Redis isteği başarısız: ${response.status}`);
    return response.json();
  };

  return {
    async get(key) {
      const { result } = await call('', ['GET', PREFIX + key]);
      return result ?? null;
    },
    async set(key, value, ttlSeconds) {
      await call('', ['SET', PREFIX + key, value, 'EX', String(ttlSeconds)]);
    },
    async del(key) {
      await call('', ['DEL', PREFIX + key]);
    },
    // Sabit pencereli hız sınırı: sayaç penceresi ilk istekte başlar.
    async allow(key, limit, windowSeconds) {
      const results = await call('/pipeline', [
        ['SET', PREFIX + key, '0', 'EX', String(windowSeconds), 'NX'],
        ['INCR', PREFIX + key],
      ]);
      return Number(results[1]?.result) <= limit;
    },
  };
};

export const createMemoryStore = ({ now = () => Date.now() } = {}) => {
  const data = new Map();
  const read = (key) => {
    const entry = data.get(key);
    if (!entry) return null;
    if (entry.expiresAt && entry.expiresAt <= now()) {
      data.delete(key);
      return null;
    }
    return entry;
  };

  return {
    async get(key) {
      return read(key)?.value ?? null;
    },
    async set(key, value, ttlSeconds) {
      data.set(key, { value, expiresAt: now() + ttlSeconds * 1000 });
    },
    async del(key) {
      data.delete(key);
    },
    async allow(key, limit, windowSeconds) {
      const entry = read(key) || { value: 0, expiresAt: now() + windowSeconds * 1000 };
      entry.value += 1;
      data.set(key, entry);
      return entry.value <= limit;
    },
  };
};

let devStore;

export const createStoreFromEnv = (env, { allowMemory = false } = {}) => {
  const url = env.KV_REST_API_URL || env.UPSTASH_REDIS_REST_URL;
  const token = env.KV_REST_API_TOKEN || env.UPSTASH_REDIS_REST_TOKEN;
  if (url && token) return createRedisStore({ url, token });
  if (allowMemory) {
    devStore ??= createMemoryStore();
    return devStore;
  }
  return null;
};
