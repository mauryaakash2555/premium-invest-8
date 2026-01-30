import { NextResponse } from 'next/server';

export function middleware(request) {
  const url = request.nextUrl;
  const pathname = url.pathname;
  const rawHost = request.headers.get('x-forwarded-host') || request.headers.get('host') || '';
  const host = String(rawHost).split(',')[0].trim().toLowerCase();
  const hostNoPort = host.split(':')[0];
  const normalizedHost = hostNoPort.startsWith('www.') ? hostNoPort.slice(4) : hostNoPort;

  // Canonicalize domain/protocol to avoid duplicate indexation (www vs non-www, http vs https).
  // Preferred host: bmwealth.co.in (non-www). Store host is handled separately.
  const isStoreHost = normalizedHost === 'store.bmwealth.co.in';
  const isMainProdHost = hostNoPort === 'bmwealth.co.in' || hostNoPort === 'www.bmwealth.co.in';
  const proto = (request.headers.get('x-forwarded-proto') || '').toLowerCase();
  const canonicalUrl = url.clone();
  let shouldRedirect = false;

  if (!isStoreHost && hostNoPort === 'www.bmwealth.co.in') {
    canonicalUrl.hostname = 'bmwealth.co.in';
    shouldRedirect = true;
  }

  if (!isStoreHost && isMainProdHost && proto === 'http') {
    canonicalUrl.protocol = 'https:';
    shouldRedirect = true;
  }

  // Strip legacy homepage query variant that should not be indexed.
  if (pathname === '/' && canonicalUrl.searchParams.get('live') === '1') {
    canonicalUrl.searchParams.delete('live');
    shouldRedirect = true;
  }

  // Canonicalize legacy/duplicate paths to reduce duplicate indexation.
  // Keep this list tight: only redirect routes that are known duplicates or intentionally noindex.
  if (!isStoreHost) {
    const canonicalPathRedirects = {
      '/about': '/about-us',
      '/privacy-policy': '/privacy',
      '/terms-and-conditions': '/terms',
      '/refund-policy': '/refund',
      '/live-intel': '/live-intelligence',
      '/sitemap-page': '/sitemap',
    };

    const target = canonicalPathRedirects[pathname];
    if (target) {
      canonicalUrl.pathname = target;
      shouldRedirect = true;
    }
  }

  if (shouldRedirect) {
    return NextResponse.redirect(canonicalUrl, 308);
  }

  // Legacy internal store prefix is not used anymore.
  // Hard-block it everywhere to avoid any accidental exposure.
  if (pathname.startsWith('/_store')) {
    return new NextResponse('Not Found', { status: 404 });
  }

  // Store host must never expose the internal store path prefix.
  // External URLs stay clean (/, /products, /about...).
  if (isStoreHost && (pathname === '/store' || pathname.startsWith('/store/'))) {
    return new NextResponse('Not Found', { status: 404 });
  }

  // Block direct access to internal store routes on the main domain.
  // (Store is exposed via hostname rewrite only.)
  if (!isStoreHost && (pathname === '/store' || pathname.startsWith('/store/'))) {
    return new NextResponse('Not Found', { status: 404 });
  }

  // Block the demo /products page on the main domain. This page includes finance-style fields
  // (risk/returns/AUM) and must not be accessible on bmwealth.co.in.
  if (!isStoreHost && (pathname === '/products' || pathname.startsWith('/products/'))) {
    return new NextResponse('Not Found', { status: 404 });
  }

  // Block checkout-like routes on the main domain.
  if (!isStoreHost && (pathname === '/checkout' || pathname.startsWith('/checkout/'))) {
    return new NextResponse('Not Found', { status: 404 });
  }

  // Host-based store routing: store.bmwealth.co.in/* -> /store/* (dedicated store shell)
  // Keep /api as-is (shared infra). Everything else on store host must be store-only.
  if (isStoreHost && !pathname.startsWith('/api')) {
    const rewriteUrl = url.clone();
    rewriteUrl.pathname = `/store${pathname === '/' ? '' : pathname}`;
    return NextResponse.rewrite(rewriteUrl);
  }

  const response = NextResponse.next();

  // API: security headers (Phase 5)
  if (pathname.startsWith('/api')) {
    // PDFs are intentionally embedded in same-origin iframes (Live Intelligence PDF modal).
    // Keep a strict default, but allow framing for the public PDF endpoints.
    if (pathname.startsWith('/api/pdf')) {
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
  matcher: [
    // Run on all pages (needed for host-based store routing) but skip Next.js internals.
    '/((?!_next/static|_next/image|favicon.ico|robots.txt|sitemap.xml|manifest.json).*)',
  ],
};
