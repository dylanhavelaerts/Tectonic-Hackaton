import { NextRequest, NextResponse } from 'next/server';
import { z } from 'zod';
import { getSession } from '@/lib/session';
import { getUser, getProject, getProjects, createProject } from '@/lib/store';
import { isMember } from '@/lib/authz';

const createSchema = z.object({
  name: z.string(),
  clientId: z.string(),
  question: z.string(),
  memberIds: z.array(z.string()),
});

export async function GET(req: NextRequest) {
  const session = await getSession(req);
  if (!session) {
    return new NextResponse(JSON.stringify({ error: 'Unauthorized' }), {
      status: 401,
      headers: { 'content-type': 'application/json' },
    });
  }

  const projects = getProjects().filter((p) => isMember(getUser(session.userId)! as any, p));
  return NextResponse.json(projects);
}

export async function POST(req: NextRequest) {
  const session = await getSession(req);
  if (!session) {
    return new NextResponse(JSON.stringify({ error: 'Unauthorized' }), {
      status: 401,
      headers: { 'content-type': 'application/json' },
    });
  }

  try {
    const body = await req.json();
    const { name, clientId, question, memberIds } = createSchema.parse(body);

    const project = createProject({
      name,
      clientId,
      question,
      leadId: session.userId,
      memberIds: [session.userId, ...memberIds],
      sourceIds: [],
    });

    return NextResponse.json(project);
  } catch (error) {
    return new NextResponse(JSON.stringify({ error: 'Invalid request' }), {
      status: 400,
      headers: { 'content-type': 'application/json' },
    });
  }
}
