import { NextRequest, NextResponse } from 'next/server';
import { z } from 'zod';
import { getUser, getUsers } from '@/lib/store';
import { verifyPassword } from '@/lib/passwords';
import { signSession } from '@/lib/session';

const schema = z.object({
  email: z.string().email(),
  password: z.string(),
});

export async function POST(req: NextRequest) {
  try {
    const body = await req.json();
    const { email, password } = schema.parse(body);

    const users = getUsers() as any[];
    const user = users.find((u) => u.email === email);
    if (!user) {
      return new NextResponse(JSON.stringify({ error: 'Invalid credentials' }), {
        status: 401,
        headers: { 'content-type': 'application/json' },
      });
    }

    const hashEnv = `DEMO_PW_HASH_${user.name.split(' ')[0].toUpperCase()}`;
    const hash = process.env[hashEnv];
    if (!hash || !verifyPassword(password, hash)) {
      return new NextResponse(JSON.stringify({ error: 'Invalid credentials' }), {
        status: 401,
        headers: { 'content-type': 'application/json' },
      });
    }

    const token = await signSession(user as any);
    const response = NextResponse.json({ user: { id: user.id, name: user.name, email: user.email } });
    response.cookies.set('ripple_session', token, {
      httpOnly: true,
      sameSite: 'lax',
      secure: process.env.NODE_ENV === 'production',
      maxAge: 2 * 60 * 60,
    });
    return response;
  } catch (error) {
    return new NextResponse(JSON.stringify({ error: 'Invalid request' }), {
      status: 400,
      headers: { 'content-type': 'application/json' },
    });
  }
}
