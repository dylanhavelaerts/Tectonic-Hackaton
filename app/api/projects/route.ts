import { NextRequest, NextResponse } from 'next/server';
import { z } from 'zod';
import { badRequest, currentUser, notFound, readJson, unauthorized } from '@/lib/api';
import { isMember } from '@/lib/authz';
import { createProject, getClient, getProjects, getUser } from '@/lib/store';

const schema = z.object({
  name: z.string().trim().min(1).max(120),
  clientId: z.string().max(40),
  question: z.string().trim().min(1).max(500),
  memberIds: z.array(z.string().max(40)).max(20),
});

export async function GET(req: NextRequest) {
  const user = await currentUser(req);
  if (!user) return unauthorized();
  return NextResponse.json(
    getProjects()
      .filter((p) => isMember(user, p))
      .map((p) => ({ id: p.id, name: p.name, clientName: getClient(p.clientId)?.name ?? '', sourceCount: p.sourceIds.length }))
  );
}

export async function POST(req: NextRequest) {
  const user = await currentUser(req);
  if (!user) return unauthorized();
  const parsed = schema.safeParse(await readJson(req));
  if (!parsed.success) return badRequest();
  const { name, clientId, question, memberIds } = parsed.data;

  // Lead must be assigned to the client; unknown client and foreign client look the same.
  if (!getClient(clientId) || !user.clientIds.includes(clientId)) return notFound();
  if (memberIds.some((id) => !getUser(id))) return badRequest();

  const project = createProject({
    name,
    clientId,
    question,
    leadId: user.id,
    memberIds: [...new Set([user.id, ...memberIds])],
    sourceIds: [],
  });
  return NextResponse.json({ id: project.id });
}
