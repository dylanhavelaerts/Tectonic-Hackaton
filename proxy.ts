import { NextRequest, NextResponse } from 'next/server';
import { getSession } from '@/lib/session';

export async function middleware(request: NextRequest) {
  const pathname = request.nextUrl.pathname;

  // Allow login and static
  if (pathname.startsWith('/login') || pathname.startsWith('/api/login') ||
      pathname.startsWith('/_next') || pathname.startsWith('/static')) {
    return NextResponse.next();
  }

  // Check session for pages
  if (pathname === '/') {
    const session = await getSession(request);
    if (!session) {
      return NextResponse.redirect(new URL('/login', request.url));
    }
  }

  // Check session for API routes
  if (pathname.startsWith('/api/')) {
    if (pathname === '/api/login') {
      return NextResponse.next();
    }
    const session = await getSession(request);
    if (!session) {
      return new NextResponse(JSON.stringify({ error: 'Unauthorized' }), {
        status: 401,
        headers: { 'content-type': 'application/json' },
      });
    }
  }

  return NextResponse.next();
}

export const config = {
  matcher: ['/((?!_next/static|_next/image|favicon.ico).*)'],
};
