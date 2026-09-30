import { NextRequest, NextResponse } from 'next/server';
import { z } from 'zod';
import { badRequest, currentUser, notFound, readJson, unauthorized } from '@/lib/api';
import { canAccessProject } from '@/lib/authz';
import { addLog, createQuestion, getProject, getUser } from '@/lib/store';

const schema = z.object({ text: z.string().trim().min(1).max(500), expertId: z.string().max(40) });

export async function POST(req: NextRequest, { params }: { params: Promise<{ id: string }> }) {
  const { id } = await params;
  const user = await currentUser(req);
  if (!user) return unauthorized();
  const project = getProject(id);
  if (!project || !canAccessProject(user, project)) return notFound();

  const parsed = schema.safeParse(await readJson(req));
  if (!parsed.success) return badRequest();
  const expert = getUser(parsed.data.expertId);
  if (!expert) return badRequest();

  const q = createQuestion({ projectId: project.id, askedBy: user.id, expertId: expert.id, text: parsed.data.text });
  addLog(user.id, `asked ${expert.name}`, q.id, project.id);
  return NextResponse.json({ id: q.id });
}
