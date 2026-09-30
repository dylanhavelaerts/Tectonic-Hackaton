import { NextRequest, NextResponse } from 'next/server';
import { z } from 'zod';
import { getUsers } from '@/lib/store';
import { verifyPassword } from '@/lib/passwords';
import { signSession } from '@/lib/session';
import { readJson } from '@/lib/api';

const schema = z.object({ email: z.email().max(200), password: z.string().min(1).max(200) });

export async function POST(req: NextRequest) {
  const parsed = schema.safeParse(await readJson(req));
  const invalid = NextResponse.json({ error: 'Invalid credentials' }, { status: 401 });
  if (!parsed.success) return invalid;

  const user = getUsers().find((u) => u.email === parsed.data.email.toLowerCase());
  const hash = user ? process.env[`DEMO_PW_HASH_${user.id.replace('u-', '').toUpperCase()}`] : undefined;
  if (!user || !hash || !verifyPassword(parsed.data.password, hash)) return invalid;

  const res = NextResponse.json({ ok: true });
  res.cookies.set('ripple_session', await signSession(user), {
    httpOnly: true,
    sameSite: 'lax',
    secure: process.env.NODE_ENV === 'production',
    path: '/',
    maxAge: 2 * 60 * 60,
  });
  return res;
}
