import { NextRequest, NextResponse } from 'next/server';
import { currentUser, unauthorized } from '@/lib/api';
import { projectView } from '@/lib/analysis';
import { getProject, getQuestions, getUser } from '@/lib/store';

// Questions assigned to me. The assigned expert sees the question and its conflicts, not the whole project.
export async function GET(req: NextRequest) {
  const user = await currentUser(req);
  if (!user) return unauthorized();

  return NextResponse.json(
    getQuestions()
      .filter((q) => q.expertId === user.id)
      .map((q) => {
        const project = getProject(q.projectId);
        const view = project ? projectView(project) : null;
        const titles = Object.fromEntries((view?.sources ?? []).map((s) => [s.id, s.title]));
        return {
          id: q.id,
          text: q.text,
          status: q.status,
          createdAt: q.createdAt,
          askedByName: getUser(q.askedBy)?.name ?? '',
          projectName: project?.name ?? '',
          conflicts: (view?.conflicts ?? []).map((c) => ({
            ...c,
            quotes: c.quotes.map((x) => ({ ...x, title: titles[x.sourceId] ?? x.sourceId })),
          })),
        };
      })
  );
}
