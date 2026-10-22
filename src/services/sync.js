// Cihazlar arası senkronizasyon istemcisi.
// Kimlik doğrulama yerine 125 bitlik rastgele bir "senkron kodu" kullanılır:
// kod yalnızca bu tarayıcıda saklanır, sunucu kodun SHA-256 özetini anahtar olarak tutar.

const ALPHABET = '0123456789ABCDEFGHJKMNPQRSTVWXYZ'; // Crockford base32 (I, L, O, U yok)
export const SYNC_KEY_LENGTH = 25;
const KEY_PATTERN = new RegExp(`^[${ALPHABET}]{${SYNC_KEY_LENGTH}}$`);

export const generateSyncKey = (randomBytes = (n) => crypto.getRandomValues(new Uint8Array(n))) => {
  const bytes = randomBytes(16);
  let bits = 0;
  let value = 0;
  let output = '';
  for (const byte of bytes) {
    value = (value << 8) | byte;
    bits += 8;
    while (bits >= 5) {
      output += ALPHABET[(value >>> (bits - 5)) & 31];
      bits -= 5;
    }
  }
  return output.slice(0, SYNC_KEY_LENGTH);
};

// Kullanıcının yazdığı kodu düzeltir: boşluk/tire atılır, karışan harfler eşlenir.
export const normalizeSyncKey = (input = '') =>
  String(input)
    .toUpperCase()
    .replace(/[^0-9A-Z]/g, '')
    .replace(/[IL]/g, '1')
    .replace(/O/g, '0');

export const isValidSyncKey = (key) => KEY_PATTERN.test(key);

export const formatSyncKey = (key) => (key.match(/.{1,5}/g) || []).join('-');

export class SyncError extends Error {
  constructor(code, message) {
    super(message || code);
    this.code = code;
  }
}

const STATUS_CODES = {
  400: 'bad_request',
  401: 'invalid_key',
  404: 'not_found',
  413: 'too_large',
  429: 'rate_limited',
  503: 'unavailable',
};

const request = async (method, key, body) => {
  let response;
  try {
    response = await fetch('/api/library', {
      method,
      headers: {
        Authorization: `Bearer ${key}`,
        ...(body ? { 'Content-Type': 'application/json' } : {}),
      },
      body: body ? JSON.stringify(body) : undefined,
      cache: 'no-store',
    });
  } catch {
    throw new SyncError('network');
  }

  if (response.status === 204) return null;
  if (!response.ok) throw new SyncError(STATUS_CODES[response.status] || 'server_error');

  try {
    return await response.json();
  } catch {
    throw new SyncError('server_error');
  }
};

export const fetchRemoteLibrary = (key) => request('GET', key);
export const pushLibrary = (key, library) => request('PUT', key, { library });
export const deleteRemoteLibrary = (key) => request('DELETE', key);

export const SYNC_ERROR_MESSAGES = {
  network: 'Sunucuya ulaşılamadı. İnternet bağlantını kontrol et.',
  invalid_key: 'Senkron kodu geçersiz.',
  not_found: 'Bu koda ait bir kitaplık bulunamadı. Kodu kontrol et.',
  too_large: 'Kitaplık senkronize edilemeyecek kadar büyük.',
  rate_limited: 'Çok fazla istek gönderildi. Biraz sonra tekrar dene.',
  unavailable: 'Bu sitede senkronizasyon etkin değil (sunucuda depolama yapılandırılmamış).',
  bad_request: 'Veri sunucu tarafından kabul edilmedi.',
  server_error: 'Sunucuda bir hata oluştu. Daha sonra tekrar dene.',
};
