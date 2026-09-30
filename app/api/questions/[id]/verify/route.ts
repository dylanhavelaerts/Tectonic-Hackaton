import { NextRequest, NextResponse } from 'next/server';
import { z } from 'zod';
import { badRequest, currentUser, notFound, readJson, unauthorized } from '@/lib/api';
import { canVerify } from '@/lib/authz';
import { addLog, createFact, getQuestion } from '@/lib/store';
import { CLAIMS } from '@/lib/types';

const schema = z.object({
  claim: z.enum(CLAIMS),
  value: z.string().trim().min(1).max(100),
  statement: z.string().trim().min(1).max(500),
});

export async function POST(req: NextRequest, { params }: { params: Promise<{ id: string }> }) {
  const { id } = await params;
  const user = await currentUser(req);
  if (!user) return unauthorized();
  const question = getQuestion(id);
  // Not assigned, already answered, or unknown: all 404.
  if (!question || !canVerify(user, question)) return notFound();

  const parsed = schema.safeParse(await readJson(req));
  if (!parsed.success) return badRequest();

  question.status = 'answered';
  const fact = createFact({ projectId: question.projectId, ...parsed.data, verifiedBy: user.id });
  addLog(user.id, `verified: "${fact.statement}"`, fact.id, question.projectId);
  return NextResponse.json({ id: fact.id });
}
