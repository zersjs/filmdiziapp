import { mergeLibraries, sanitizeLibrary } from '../src/lib/library.js';

// GET    → kitaplığı getir (yoksa 404)
// PUT    → gelen kitaplığı sunucudakiyle birleştir, kaydet ve birleşmiş hâli döndür
// DELETE → sunucudaki kitaplığı sil
// Kimlik: "Authorization: Bearer <senkron kodu>". Kod saklanmaz, SHA-256 özeti anahtar olur.

const KEY_PATTERN = /^[0-9A-HJKMNP-TV-Z]{25}$/;
export const MAX_BODY_BYTES = 256 * 1024;
const DATA_TTL_SECONDS = 400 * 24 * 60 * 60; // kullanılmayan kitaplıklar ~13 ay sonra silinir
export const RATE_LIMIT = { perIp: 60, perKey: 30, windowSeconds: 60 };

const json = (status, body, headers = {}) =>
  new Response(body === null ? null : JSON.stringify(body), {
    status,
    headers: {
      'Content-Type': 'application/json; charset=utf-8',
      'Cache-Control': 'no-store',
      'X-Content-Type-Options': 'nosniff',
      ...headers,
    },
  });

const sha256 = async (value) => {
  const digest = await crypto.subtle.digest('SHA-256', new TextEncoder().encode(value));
  return [...new Uint8Array(digest)].map(b => b.toString(16).padStart(2, '0')).join('');
};

const clientIp = (request) =>
  request.headers.get('x-forwarded-for')?.split(',')[0].trim() ||
  request.headers.get('x-real-ip') ||
  'unknown';

const readStored = (raw) => {
  if (!raw) return null;
  try {
    const parsed = JSON.parse(raw);
    return { library: sanitizeLibrary(parsed.library), updatedAt: parsed.updatedAt || null };
  } catch {
    return null;
  }
};

export const handleLibraryRequest = async (request, { store, now = () => Date.now() }) => {
  if (!store) return json(503, { error: 'sync_unavailable' });

  const { method } = request;
  if (!['GET', 'PUT', 'DELETE'].includes(method)) {
    return json(405, { error: 'method_not_allowed' }, { Allow: 'GET, PUT, DELETE' });
  }

  try {
    const ipHash = (await sha256(clientIp(request))).slice(0, 32);
    if (!(await store.allow(`rl:ip:${ipHash}`, RATE_LIMIT.perIp, RATE_LIMIT.windowSeconds))) {
      return json(429, { error: 'rate_limited' }, { 'Retry-After': String(RATE_LIMIT.windowSeconds) });
    }

    const key = (request.headers.get('authorization') || '').replace(/^Bearer\s+/i, '').trim();
    if (!KEY_PATTERN.test(key)) return json(401, { error: 'invalid_key' });

    const id = await sha256(key);
    if (!(await store.allow(`rl:key:${id}`, RATE_LIMIT.perKey, RATE_LIMIT.windowSeconds))) {
      return json(429, { error: 'rate_limited' }, { 'Retry-After': String(RATE_LIMIT.windowSeconds) });
    }

    const storageKey = `lib:${id}`;

    if (method === 'GET') {
      const stored = readStored(await store.get(storageKey));
      return stored ? json(200, stored) : json(404, { error: 'not_found' });
    }

    if (method === 'DELETE') {
      await store.del(storageKey);
      return json(204, null);
    }

    if (!(request.headers.get('content-type') || '').includes('application/json')) {
      return json(415, { error: 'unsupported_media_type' });
    }
    const declaredLength = Number(request.headers.get('content-length') || 0);
    if (declaredLength > MAX_BODY_BYTES) return json(413, { error: 'too_large' });

    const text = await request.text();
    if (new TextEncoder().encode(text).length > MAX_BODY_BYTES) return json(413, { error: 'too_large' });

    let body;
    try {
      body = JSON.parse(text);
    } catch {
      return json(400, { error: 'invalid_json' });
    }
    if (!body || typeof body !== 'object' || typeof body.library !== 'object') {
      return json(400, { error: 'invalid_body' });
    }

    const incoming = sanitizeLibrary(body.library, now());
    const existing = readStored(await store.get(storageKey));
    const library = existing ? mergeLibraries(existing.library, incoming) : incoming;
    const updatedAt = new Date(now()).toISOString();

    await store.set(storageKey, JSON.stringify({ library, updatedAt }), DATA_TTL_SECONDS);
    return json(200, { library, updatedAt });
  } catch (error) {
    console.error('library sync error', error);
    return json(500, { error: 'server_error' });
  }
};
