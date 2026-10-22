// @vitest-environment node
import { beforeEach, describe, expect, test } from 'vitest';
import { MAX_BODY_BYTES, RATE_LIMIT, handleLibraryRequest } from '../libraryHandler';
import { createMemoryStore, createRedisStore } from '../store';

const KEY = 'ABCDEFGHJKMNPQRSTVWXYZ012';
const OTHER_KEY = '0123456789ABCDEFGHJKMNPQR';
const THIRD_KEY = 'ZYXWVTSRQPNMKJHGFEDCBA987';

const call = (store, method, { key = KEY, body, ip = '1.2.3.4', headers = {} } = {}) =>
  handleLibraryRequest(new Request('http://localhost/api/library', {
    method,
    headers: {
      ...(key ? { Authorization: `Bearer ${key}` } : {}),
      ...(body !== undefined ? { 'Content-Type': 'application/json' } : {}),
      'x-forwarded-for': ip,
      ...headers,
    },
    body: body === undefined ? undefined : typeof body === 'string' ? body : JSON.stringify(body),
  }), { store });

const favorite = (id, addedAt = '2026-01-01T00:00:00.000Z') => ({ id, media_type: 'movie', title: `Film ${id}`, addedAt });

describe('handleLibraryRequest', () => {
  let store;
  beforeEach(() => {
    store = createMemoryStore();
  });

  test('depo yoksa 503', async () => {
    expect((await call(null, 'GET')).status).toBe(503);
  });

  test('geçersiz veya eksik kod 401', async () => {
    expect((await call(store, 'GET', { key: null })).status).toBe(401);
    expect((await call(store, 'GET', { key: 'kisa' })).status).toBe(401);
    expect((await call(store, 'GET', { key: `${KEY.slice(0, 24)}I` })).status).toBe(401);
  });

  test('desteklenmeyen yöntem 405', async () => {
    expect((await call(store, 'POST')).status).toBe(405);
  });

  test('PUT kaydeder, GET getirir, kodlar birbirinden yalıtılmıştır', async () => {
    expect((await call(store, 'GET')).status).toBe(404);
    const put = await call(store, 'PUT', { body: { library: { favorites: [favorite(1)] } } });
    expect(put.status).toBe(200);
    expect(put.headers.get('cache-control')).toBe('no-store');

    const get = await call(store, 'GET');
    expect((await get.json()).library.favorites.map(f => f.id)).toEqual([1]);
    expect((await call(store, 'GET', { key: OTHER_KEY })).status).toBe(404);
  });

  test('PUT sunucudakiyle birleştirir ve silmeleri uygular', async () => {
    await call(store, 'PUT', { body: { library: { favorites: [favorite(1), favorite(2)] } } });
    const response = await call(store, 'PUT', {
      body: { library: { favorites: [favorite(3)], removed: { favorites: { 'movie-2': new Date().toISOString() } } } },
    });
    const { library } = await response.json();
    expect(library.favorites.map(f => f.id).sort()).toEqual([1, 3]);
  });

  test('kod depoda düz metin olarak tutulmaz', async () => {
    const writes = [];
    const spy = { ...store, set: (key, value, ttl) => { writes.push(key); return store.set(key, value, ttl); } };
    await call(spy, 'PUT', { body: { library: {} } });
    expect(writes).toHaveLength(1);
    expect(writes[0]).not.toContain(KEY);
    expect(writes[0]).toMatch(/^lib:[0-9a-f]{64}$/);
  });

  test('DELETE siler', async () => {
    await call(store, 'PUT', { body: { library: { favorites: [favorite(1)] } } });
    expect((await call(store, 'DELETE')).status).toBe(204);
    expect((await call(store, 'GET')).status).toBe(404);
  });

  test('bozuk veya büyük gövdeyi reddeder', async () => {
    expect((await call(store, 'PUT', { body: '{bozuk' })).status).toBe(400);
    expect((await call(store, 'PUT', { body: { yok: true } })).status).toBe(400);
    expect((await call(store, 'PUT', { body: 'x'.repeat(MAX_BODY_BYTES + 1) })).status).toBe(413);
    const noJson = await handleLibraryRequest(new Request('http://localhost/api/library', {
      method: 'PUT', headers: { Authorization: `Bearer ${KEY}`, 'Content-Type': 'text/plain' }, body: '{}',
    }), { store });
    expect(noJson.status).toBe(415);
  });

  test('IP başına hız sınırı uygular', async () => {
    let last;
    for (let i = 0; i <= RATE_LIMIT.perIp; i += 1) {
      last = await call(store, 'GET', { key: [KEY, OTHER_KEY, THIRD_KEY][i % 3], ip: '9.9.9.9' });
    }
    expect(last.status).toBe(429);
    expect(last.headers.get('retry-after')).toBe(String(RATE_LIMIT.windowSeconds));
    expect((await call(store, 'GET', { ip: '8.8.8.8' })).status).toBe(404);
  });
});

describe('createRedisStore', () => {
  test('Upstash REST komutlarını doğru biçimde gönderir', async () => {
    const calls = [];
    const fetchImpl = async (url, init) => {
      calls.push({ url, body: JSON.parse(init.body), auth: init.headers.Authorization });
      if (url.endsWith('/pipeline')) return new Response(JSON.stringify([{ result: 'OK' }, { result: 3 }]));
      return new Response(JSON.stringify({ result: 'değer' }));
    };
    const redis = createRedisStore({ url: 'https://redis.example/', token: 'gizli', fetchImpl });

    expect(await redis.get('a')).toBe('değer');
    await redis.set('a', 'v', 60);
    expect(await redis.allow('rl', 5, 60)).toBe(true);
    expect(await redis.allow('rl', 2, 60)).toBe(false);

    expect(calls[0]).toEqual({ url: 'https://redis.example', body: ['GET', 'sinefix:a'], auth: 'Bearer gizli' });
    expect(calls[1].body).toEqual(['SET', 'sinefix:a', 'v', 'EX', '60']);
    expect(calls[2].url).toBe('https://redis.example/pipeline');
    expect(calls[2].body).toEqual([['SET', 'sinefix:rl', '0', 'EX', '60', 'NX'], ['INCR', 'sinefix:rl']]);
  });
});
