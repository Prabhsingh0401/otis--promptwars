// proxy.ts — Route protection using session cookie (Next.js 16)
// Protects /plan, /trips, /explore, /profile from unauthenticated access

import { NextRequest, NextResponse } from 'next/server';

const PROTECTED_PATHS = ['/', '/plan', '/trips', '/profile'];
const AUTH_PATHS = ['/login', '/signup'];

export function proxy(req: NextRequest) {
  const session = req.cookies.get('session')?.value;
  const { pathname } = req.nextUrl;

  const isProtected = PROTECTED_PATHS.some((p) => 
    p === '/' ? pathname === '/' : pathname.startsWith(p)
  );
  const isAuthPath = AUTH_PATHS.some((p) => pathname.startsWith(p));

  if (isProtected && !session) {
    const loginUrl = new URL('/login', req.url);
    loginUrl.searchParams.set('callbackUrl', pathname);
    return NextResponse.redirect(loginUrl);
  }

  // Redirect authenticated users away from auth pages
  if (session && isAuthPath) {
    return NextResponse.redirect(new URL('/', req.url));
  }

  return NextResponse.next();
}

export const config = {
  matcher: [
    /*
     * Match all request paths except:
     * - _next/static (static files)
     * - _next/image (image optimization)
     * - favicon.ico
     * - public files
     * - api routes (handled separately with rate limiting)
     */
    '/((?!_next/static|_next/image|favicon.ico|.*\\.(?:svg|png|jpg|jpeg|gif|webp)$).*)',
  ],
};
