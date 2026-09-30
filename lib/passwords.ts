import crypto from 'crypto';

// Format: "<salt hex>:<scrypt hash hex>" — salt bytes decoded from hex, same as scripts/hash-pw.mjs
export function verifyPassword(password: string, stored: string): boolean {
  try {
    const [saltHex, hashHex] = stored.split(':');
    if (!saltHex || !hashHex) return false;
    const expected = Buffer.from(hashHex, 'hex');
    const computed = crypto.scryptSync(password, Buffer.from(saltHex, 'hex'), expected.length);
    return crypto.timingSafeEqual(computed, expected);
  } catch {
    return false;
  }
}
