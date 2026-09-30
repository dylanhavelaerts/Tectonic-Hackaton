import { NextRequest, NextResponse } from 'next/server';
import { currentUser, notFound, unauthorized } from '@/lib/api';
import { canAccessProject } from '@/lib/authz';
import { projectView } from '@/lib/analysis';
import { getClient, getProject, getProjectLog, getQuestions, getUser } from '@/lib/store';

export async function GET(req: NextRequest, { params }: { params: Promise<{ id: string }> }) {
  const { id } = await params;
  const user = await currentUser(req);
  if (!user) return unauthorized();
  const project = getProject(id);
  if (!project || !canAccessProject(user, project)) return notFound();

  const name = (uid: string) => getUser(uid)?.name ?? 'Unknown';
  return NextResponse.json({
    project: {
      id: project.id,
      name: project.name,
      question: project.question,
      clientName: getClient(project.clientId)?.name ?? '',
      leadName: name(project.leadId),
      isLead: project.leadId === user.id,
    },
    ...projectView(project),
    questions: getQuestions()
      .filter((q) => q.projectId === project.id)
      .map((q) => ({ ...q, askedByName: name(q.askedBy), expertName: name(q.expertId) })),
    log: getProjectLog(project.id).map((e) => ({ at: e.at, text: `${name(e.userId)} ${e.action}` })),
  });
}
