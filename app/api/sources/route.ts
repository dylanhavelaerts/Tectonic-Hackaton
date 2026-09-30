import { NextRequest, NextResponse } from 'next/server';
import { currentUser, unauthorized } from '@/lib/api';
import { canSeeSource } from '@/lib/authz';
import { getSources, getUser } from '@/lib/store';

export async function GET(req: NextRequest) {
  const user = await currentUser(req);
  if (!user) return unauthorized();
  return NextResponse.json(
    getSources()
      .filter((s) => canSeeSource(user, s))
      .map((s) => ({
        id: s.id,
        type: s.type,
        title: s.title,
        owner: s.ownerId ? getUser(s.ownerId)?.name ?? null : null,
        lastEdited: s.lastEdited,
      }))
  );
}
