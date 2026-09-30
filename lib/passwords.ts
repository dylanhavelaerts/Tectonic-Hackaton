import crypto from 'crypto';

export function verifyPassword(
  password: string,
  hash: string
): boolean {
  try {
    const [saltHex, hashHex] = hash.split(':');
    const salt = Buffer.from(saltHex, 'hex');
    const computed = crypto.scryptSync(password, salt, 32).toString('hex');
    return crypto.timingSafeEqual(Buffer.from(computed), Buffer.from(hashHex));
  } catch {
    return false;
  }
}
