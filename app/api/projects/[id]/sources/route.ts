import { NextRequest, NextResponse } from 'next/server';
import { z } from 'zod';
import { badRequest, currentUser, notFound, readJson, unauthorized } from '@/lib/api';
import { canSeeSource, isLead } from '@/lib/authz';
import { analyseSource } from '@/lib/analysis';
import { addLog, getProject, getSource } from '@/lib/store';

const schema = z.object({ sourceIds: z.array(z.string().max(40)).min(1).max(50) });

// 20 analyse calls / 10 min / user
const WINDOW_MS = 10 * 60 * 1000;
const calls = new Map<string, number[]>();
function rateLimited(userId: string) {
  const now = Date.now();
  const recent = (calls.get(userId) ?? []).filter((t) => now - t < WINDOW_MS);
  if (recent.length >= 20) return true;
  calls.set(userId, [...recent, now]);
  return false;
}

export async function POST(req: NextRequest, { params }: { params: Promise<{ id: string }> }) {
  const { id } = await params;
  const user = await currentUser(req);
  if (!user) return unauthorized();
  const project = getProject(id);
  if (!project || !isLead(user, project)) return notFound();

  const parsed = schema.safeParse(await readJson(req));
  if (!parsed.success) return badRequest();
  if (rateLimited(user.id)) return NextResponse.json({ error: 'Too many requests' }, { status: 429 });

  // ACL filter before analysis: only sources this user may see.
  const sources = parsed.data.sourceIds.map(getSource);
  if (sources.some((s) => !s || !canSeeSource(user, s))) return notFound();

  const added = sources.filter((s) => s && !project.sourceIds.includes(s.id));
  for (const s of added) {
    project.sourceIds.push(s!.id);
    project.analysis[s!.id] = analyseSource(s!);
  }
  addLog(user.id, `added ${added.length} source${added.length === 1 ? '' : 's'}`, project.id, project.id);
  return NextResponse.json({ added: added.length });
}
