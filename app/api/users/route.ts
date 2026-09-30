import { NextRequest, NextResponse } from 'next/server';
import { currentUser, unauthorized } from '@/lib/api';
import { getUsers } from '@/lib/store';

export async function GET(req: NextRequest) {
  if (!(await currentUser(req))) return unauthorized();
  return NextResponse.json(getUsers().map(({ id, name, role, team }) => ({ id, name, role, team })));
}
