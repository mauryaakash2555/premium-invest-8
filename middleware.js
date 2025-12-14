import { NextResponse } from 'next/server';

export function middleware(request) {
  const response = NextResponse.next();

  // Disable all caching for blog routes
  if (request.nextUrl.pathname.startsWith('/blog')) {
    response.headers.set('Cache-Control', 'no-store, no-cache, must-revalidate, proxy-revalidate, max-age=0');
    response.headers.set('CDN-Cache-Control', 'no-store');
    response.headers.set('Vercel-CDN-Cache-Control', 'no-store');
    response.headers.set('X-Vercel-Cache', 'MISS');
  }

  return response;
}

export const config = {
  matcher: '/blog/:path*',
};
