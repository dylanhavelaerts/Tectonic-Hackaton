import { NextRequest, NextResponse } from 'next/server';
import { getSession } from '@/lib/session';
import { getUser, getSources } from '@/lib/store';
import { visibleSources } from '@/lib/authz';

export async function GET(req: NextRequest) {
  const session = await getSession(req);
  if (!session) {
    return new NextResponse(JSON.stringify({ error: 'Unauthorized' }), {
      status: 401,
      headers: { 'content-type': 'application/json' },
    });
  }

  const user = getUser(session.userId);
  if (!user) {
    return new NextResponse(JSON.stringify({ error: 'Not found' }), {
      status: 404,
      headers: { 'content-type': 'application/json' },
    });
  }

  const sources = getSources();
  const visible = sources.filter((s) => visibleSources(user, s.country, s.clientId));

  return NextResponse.json(
    visible.map((s) => ({
      id: s.id,
      type: s.type,
      title: s.title,
      owner: s.ownerId ? getUser(s.ownerId)?.name : null,
      date: s.lastEdited,
    }))
  );
}
