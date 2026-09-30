import { NextRequest, NextResponse } from 'next/server';
import { z } from 'zod';
import { getSession } from '@/lib/session';
import { getProject, getUser, createQuestion } from '@/lib/store';
import { canAccessProject } from '@/lib/authz';

const schema = z.object({
  text: z.string().max(500),
  expertId: z.string(),
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
  const project = getProject(id);

  if (!project || !user || !canAccessProject(user, project)) {
    return new NextResponse(JSON.stringify({ error: 'Not found' }), {
      status: 404,
      headers: { 'content-type': 'application/json' },
    });
  }

  try {
    const body = await req.json();
    const { text, expertId } = schema.parse(body);

    const question = createQuestion({
      projectId: project.id,
      askedBy: session.userId,
      expertId,
      text,
      status: 'open',
    });

    return NextResponse.json(question);
  } catch (error) {
    return new NextResponse(JSON.stringify({ error: 'Invalid request' }), {
      status: 400,
      headers: { 'content-type': 'application/json' },
    });
  }
}
