import { NextRequest, NextResponse } from 'next/server';
import { getSession } from '@/lib/session';
import { getUsers } from '@/lib/store';

export async function GET(req: NextRequest) {
  const session = await getSession(req);
  if (!session) {
    return new NextResponse(JSON.stringify({ error: 'Unauthorized' }), {
      status: 401,
      headers: { 'content-type': 'application/json' },
    });
  }

  const users = getUsers();
  return NextResponse.json(
    users.map((u) => ({
      id: u.id,
      name: u.name,
      role: u.role,
      team: u.team,
    }))
  );
}
