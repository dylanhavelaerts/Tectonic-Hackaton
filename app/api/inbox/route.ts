import { NextRequest, NextResponse } from 'next/server';
import { getSession } from '@/lib/session';
import { getUser, getQuestions } from '@/lib/store';

export async function GET(req: NextRequest) {
  const session = await getSession(req);
  if (!session) {
    return new NextResponse(JSON.stringify({ error: 'Unauthorized' }), {
      status: 401,
      headers: { 'content-type': 'application/json' },
    });
  }

  const user = getUser(session.userId) as any;
  if (!user) {
    return new NextResponse(JSON.stringify({ error: 'Not found' }), {
      status: 404,
      headers: { 'content-type': 'application/json' },
    });
  }

  const questions = getQuestions().filter(
    (q) => q.expertId === session.userId && q.status === 'open'
  );

  return NextResponse.json(questions);
}
