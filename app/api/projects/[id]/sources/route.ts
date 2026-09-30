import { NextRequest, NextResponse } from 'next/server';
import { z } from 'zod';
import { getSession } from '@/lib/session';
import { getProject, getUser, updateProject } from '@/lib/store';
import { canAccessProject } from '@/lib/authz';

const schema = z.object({
  sourceIds: z.array(z.string()),
});

const rateLimitMap = new Map<string, { count: number; resetAt: number }>();

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

  if (!project || !user || project.leadId !== user.id) {
    return new NextResponse(JSON.stringify({ error: 'Not found' }), {
      status: 404,
      headers: { 'content-type': 'application/json' },
    });
  }

  // Rate limit: 20 calls / 10 min
  const now = Date.now();
  const key = `${session.userId}-analyse`;
  const limit = rateLimitMap.get(key);
  if (limit) {
    if (now < limit.resetAt) {
      if (limit.count >= 20) {
        return new NextResponse(JSON.stringify({ error: 'Rate limited' }), {
          status: 429,
          headers: { 'content-type': 'application/json' },
        });
      }
      limit.count++;
    } else {
      rateLimitMap.set(key, { count: 1, resetAt: now + 10 * 60 * 1000 });
    }
  } else {
    rateLimitMap.set(key, { count: 1, resetAt: now + 10 * 60 * 1000 });
  }

  try {
    const body = await req.json();
    const { sourceIds } = schema.parse(body);

    updateProject(project.id, {
      ...project,
      sourceIds: [...new Set([...project.sourceIds, ...sourceIds])],
    });

    return NextResponse.json({ success: true });
  } catch (error) {
    return new NextResponse(JSON.stringify({ error: 'Invalid request' }), {
      status: 400,
      headers: { 'content-type': 'application/json' },
    });
  }
}
