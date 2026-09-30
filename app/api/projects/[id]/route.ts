import { NextRequest, NextResponse } from 'next/server';
import { getSession } from '@/lib/session';
import {
  getProject,
  getUser,
  getSources,
  getQuestions,
  getFacts,
  getLog,
  getUsers,
  getClients,
} from '@/lib/store';
import { canAccessProject } from '@/lib/authz';
import { scoreProject } from '@/lib/scoring';

export async function GET(
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

  const sources = getSources() as any[];
  const users = getUsers() as any[];
  const facts = getFacts(project.id);
  const scores = scoreProject(project, sources, users, facts, '2026-09-30');
  const questions = getQuestions(project.id);
  const log = getLog();
  const projectLog = log.filter((e) => e.targetId.includes(project.id));

  return NextResponse.json({
    project,
    scores,
    questions,
    facts,
    log: projectLog,
  });
}
