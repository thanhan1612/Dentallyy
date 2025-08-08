import { NextResponse } from 'next/server';
import type { NextRequest } from 'next/server';

const publicRoutes = ['/login', '/forgot-password'];

export function middleware(request: NextRequest) {
  const { pathname } = request.nextUrl;
  
  if (publicRoutes.includes(pathname)) {
    return NextResponse.next();
  }

  //const authSession = request.cookies.get('auth_session')?.value;

  // if (!authSession) {
  //   const loginUrl = new URL('/login', request.url);
  //   return NextResponse.redirect(loginUrl);
  // }

  const response = NextResponse.next();
  return response;
}

export const config = {
  matcher: [
    /*
     * Match all request paths except for the ones starting with:
     * - api (API routes)
     * - _next/static (static files)
     * - _next/image (image optimization files)
     * - public folder
     */
    '/((?!api|_next/static|_next/image|public).*)',
  ],
}; 