import { NextResponse } from 'next/server';

export function middleware(request) {
  const response = NextResponse.next();

  // Blog: disable caching (existing behavior)
  if (request.nextUrl.pathname.startsWith('/blog')) {
    response.headers.set('Cache-Control', 'no-store, no-cache, must-revalidate, proxy-revalidate, max-age=0');
    response.headers.set('CDN-Cache-Control', 'no-store');
    response.headers.set('Vercel-CDN-Cache-Control', 'no-store');
    response.headers.set('X-Vercel-Cache', 'MISS');
  }

  // API: security headers (Phase 5)
  if (request.nextUrl.pathname.startsWith('/api')) {
    // PDFs are intentionally embedded in same-origin iframes (Live Intelligence PDF modal).
    // Keep a strict default, but allow framing for the public PDF endpoints.
    if (request.nextUrl.pathname.startsWith('/api/pdf')) {
      // Intentionally omit X-Frame-Options so the PDF can render inside iframes
      // (some webviews/dev browsers don't behave as strict same-origin).
    } else {
      response.headers.set('X-Frame-Options', 'DENY');
    }
    response.headers.set('X-Content-Type-Options', 'nosniff');
    response.headers.set('Referrer-Policy', 'strict-origin-when-cross-origin');
    response.headers.set('Permissions-Policy', 'geolocation=(), microphone=(), camera=()');
  }

  return response;
}

export const config = {
  matcher: ['/blog/:path*', '/api/:path*'],
};
