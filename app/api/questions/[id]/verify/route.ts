import { NextRequest, NextResponse } from 'next/server';
import { z } from 'zod';
import { getSession } from '@/lib/session';
import {
  getQuestion,
  getUser,
  updateQuestion,
  createFact,
} from '@/lib/store';
import { canVerify } from '@/lib/authz';

const schema = z.object({
  claim: z.string(),
  value: z.string(),
  statement: z.string().max(500),
});

export async function POST(
  req: NextRequest,
  { params }: { params: Promise<{ id: string }> }
) {
  const { id } = await params;
  const session = await getSession(req);
  if (!session) {
    return new NextResponse(JSON.stringify({ error: 'Unauthorized' }), {
      status: 401,
      headers: { 'content-type': 'application/json' },
    });
  }

  const user = getUser(session.userId) as any;
  const question = getQuestion(id);

  if (!question || !user || !canVerify(user, question)) {
    return new NextResponse(JSON.stringify({ error: 'Not found' }), {
      status: 404,
      headers: { 'content-type': 'application/json' },
    });
  }

  if (question.status !== 'open') {
    return new NextResponse(JSON.stringify({ error: 'Question already answered' }), {
      status: 400,
      headers: { 'content-type': 'application/json' },
    });
  }

  try {
    const body = await req.json();
    const { claim, value, statement } = schema.parse(body);

    updateQuestion(question.id, { status: 'answered' });

    const fact = createFact({
      projectId: question.projectId,
      claim,
      value,
      statement,
      verifiedBy: session.userId,
      at: new Date().toISOString(),
    });

    return NextResponse.json(fact);
  } catch (error) {
    return new NextResponse(JSON.stringify({ error: 'Invalid request' }), {
      status: 400,
      headers: { 'content-type': 'application/json' },
    });
  }
}
