import * as jose from 'jose';
import { User } from './types';

if (!process.env.SESSION_SECRET) throw new Error('SESSION_SECRET is not set');
const secret = new TextEncoder().encode(process.env.SESSION_SECRET);

export async function signSession(user: User): Promise<string> {
  return new jose.SignJWT({ userId: user.id, email: user.email })
    .setProtectedHeader({ alg: 'HS256' })
    .setExpirationTime('2h')
    .sign(secret);
}

export async function verifySession(token: string): Promise<{ userId: string; email: string } | null> {
  try {
    const verified = await jose.jwtVerify(token, secret);
    return verified.payload as { userId: string; email: string };
  } catch {
    return null;
  }
}

export async function getSession(
  req: Request
): Promise<{ userId: string; email: string } | null> {
  const cookie = req.headers.get('cookie');
  if (!cookie) return null;

  const match = cookie.match(/ripple_session=([^;]+)/);
  if (!match) return null;

  return verifySession(match[1]);
}
