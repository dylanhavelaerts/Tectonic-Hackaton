import { NextRequest, NextResponse } from 'next/server';
import { getSession } from './session';
import { getUser } from './store';
import { User } from './types';

export const unauthorized = () => NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
export const notFound = () => NextResponse.json({ error: 'Not found' }, { status: 404 });
export const badRequest = () => NextResponse.json({ error: 'Invalid request' }, { status: 400 });

export async function currentUser(req: NextRequest): Promise<User | null> {
  const session = await getSession(req);
  return session ? getUser(session.userId) ?? null : null;
}

export async function readJson(req: NextRequest): Promise<unknown> {
  try {
    return await req.json();
  } catch {
    return null;
  }
}
