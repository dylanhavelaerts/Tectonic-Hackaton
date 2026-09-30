import { NextRequest, NextResponse } from 'next/server';
import { getSession } from '@/lib/session';

// No session → /login for pages, 401 for /api/*. Routes still check the session themselves.
export async function proxy(request: NextRequest) {
  const { pathname } = request.nextUrl;
  if (pathname === '/login' || pathname === '/api/login') return NextResponse.next();

  const session = await getSession(request);
  if (session) return NextResponse.next();

  if (pathname.startsWith('/api/')) {
    return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
  }
  return NextResponse.redirect(new URL('/login', request.url));
}

export const config = {
  matcher: ['/((?!_next/static|_next/image|favicon.ico|.*\\.svg$).*)'],
};
