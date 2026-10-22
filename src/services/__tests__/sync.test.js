import { describe, expect, test } from 'vitest';
import { SYNC_KEY_LENGTH, formatSyncKey, generateSyncKey, isValidSyncKey, normalizeSyncKey } from '../sync';

describe('senkron kodu', () => {
  test('üretilen kod geçerli ve benzersiz', () => {
    const keys = new Set(Array.from({ length: 200 }, () => generateSyncKey()));
    expect(keys.size).toBe(200);
    keys.forEach(key => {
      expect(key).toHaveLength(SYNC_KEY_LENGTH);
      expect(isValidSyncKey(key)).toBe(true);
    });
  });

  test('aynı rastgele baytlar aynı kodu üretir (deterministik kodlama)', () => {
    const bytes = () => new Uint8Array(16).fill(255);
    expect(generateSyncKey(bytes)).toBe('Z'.repeat(SYNC_KEY_LENGTH));
  });

  test('kullanıcı girdisini düzeltir', () => {
    expect(normalizeSyncKey(' abcde-fghjk mnpqr_stvwx-yz01o ')).toBe('ABCDEFGHJKMNPQRSTVWXYZ010');
    expect(normalizeSyncKey('IL')).toBe('11');
    expect(isValidSyncKey(normalizeSyncKey('uuuuu-uuuuu-uuuuu-uuuuu-uuuuu'))).toBe(false);
  });

  test('beşli gruplar halinde gösterir', () => {
    expect(formatSyncKey('ABCDEFGHJKMNPQRSTVWXYZ012')).toBe('ABCDE-FGHJK-MNPQR-STVWX-YZ012');
  });
});
