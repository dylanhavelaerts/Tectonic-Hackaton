import { NextRequest, NextResponse } from 'next/server';
import { currentUser, unauthorized } from '@/lib/api';

export async function GET(req: NextRequest) {
  const user = await currentUser(req);
  if (!user) return unauthorized();
  const { id, name, email, role, team } = user;
  return NextResponse.json({ id, name, email, role, team });
}
