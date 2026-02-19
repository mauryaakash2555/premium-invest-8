import { NextResponse } from 'next/server';

export function middleware(request) {
  const url = request.nextUrl;
  const pathname = url.pathname;
  const rawHost = request.headers.get('x-forwarded-host') || request.headers.get('host') || '';
  const host = String(rawHost).split(',')[0].trim().toLowerCase();
  const hostNoPort = host.split(':')[0];
  const normalizedHost = hostNoPort.startsWith('www.') ? hostNoPort.slice(4) : hostNoPort;

  // Legacy store prefix (/_store/*) previously lived on the main domain.
  // Permanently redirect to the store subdomain to consolidate signals and clean up index coverage.
  if (pathname === '/_store' || pathname.startsWith('/_store/')) {
    const target = url.clone();
    target.protocol = 'https:';
    target.hostname = 'store.bmwealth.co.in';
    const nextPath = pathname.replace(/^\/_store(\/|$)/, '/');
    target.pathname = nextPath === '' ? '/' : nextPath;
    const res = NextResponse.redirect(target, 301);
    res.headers.set('X-Robots-Tag', 'noindex');
    return res;
  }

  // Canonicalize domain/protocol to avoid duplicate indexation (www vs non-www, http vs https).
  // Preferred host: bmwealth.co.in (non-www). Store host is handled separately.
  const isStoreHost = normalizedHost === 'store.bmwealth.co.in';
  const isMainProdHost = hostNoPort === 'bmwealth.co.in' || hostNoPort === 'www.bmwealth.co.in';
  const protoHeader = (request.headers.get('x-forwarded-proto') || '').toLowerCase();
  const protoFromHeader = protoHeader.split(',')[0].trim();
  const proto = (protoFromHeader || String(url.protocol || '').replace(':', '')).toLowerCase();
  const canonicalUrl = url.clone();
  let shouldRedirect = false;

  // Store shell internal routes can leak as /store/* on the main host.
  // Redirect to the clean store hostname URLs instead of returning 404s.
  if (!isStoreHost && (pathname === '/store' || pathname.startsWith('/store/'))) {
    const target = url.clone();
    target.protocol = 'https:';
    target.hostname = 'store.bmwealth.co.in';
    const nextPath = pathname.replace(/^\/store(\/|$)/, '/');
    target.pathname = nextPath === '' ? '/' : nextPath;
    const res = NextResponse.redirect(target, 301);
    res.headers.set('X-Robots-Tag', 'noindex');
    return res;
  }

  // If Google discovers Cloudflare email-protection URLs, avoid a hard 404.
  // Redirect to the Contact page (safe, user-intent-aligned).
  if (pathname === '/cdn-cgi/l/email-protection' || pathname.startsWith('/cdn-cgi/l/email-protection/')) {
    const target = url.clone();
    target.pathname = '/contact';
    target.search = '';
    const res = NextResponse.redirect(target, 301);
    res.headers.set('X-Robots-Tag', 'noindex');
    return res;
  }

  // Domain redirect (www → non-www) and protocol upgrade (http → https) are
  // handled exclusively by vercel.json + Cloudflare.  Do NOT duplicate here
  // to avoid redirect loops when Cloudflare "Always Use HTTPS" is active.

  // Strip legacy homepage query variant that should not be indexed.
  if (pathname === '/' && canonicalUrl.searchParams.get('live') === '1') {
    canonicalUrl.searchParams.delete('live');
    shouldRedirect = true;
  }

  // Canonicalize legacy/duplicate paths to reduce duplicate indexation.
  // Keep this list tight: only redirect routes that are known duplicates or intentionally noindex.
  if (!isStoreHost) {
    const canonicalPathRedirects = {
      // Canonical public pages
      '/about': '/about-us',
      '/privacy-policy': '/privacy',
      '/terms': '/terms-and-conditions',
      '/refund-policy': '/refund',
      '/live': '/live-intelligence',
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
    // 301 to align with Google Search Console expectations for permanent canonicalization.
    return NextResponse.redirect(canonicalUrl, 301);
  }

  // Store host must never expose the internal store path prefix.
  // External URLs stay clean (/, /products, /about...).
  if (isStoreHost && (pathname === '/store' || pathname.startsWith('/store/'))) {
    return new NextResponse('Not Found', { status: 404 });
  }

  // Block direct access to internal store routes on the main domain.
  // (Store is exposed via hostname rewrite only.)
  // (Handled above via redirect to store hostname.)

  // Block the demo /products page on the main domain. This page includes finance-style fields
  // (risk/returns/AUM) and must not be accessible on bmwealth.co.in.
  if (!isStoreHost && (pathname === '/products' || pathname.startsWith('/products/'))) {
    const target = url.clone();
    target.protocol = 'https:';
    target.hostname = 'store.bmwealth.co.in';
    const res = NextResponse.redirect(target, 301);
    res.headers.set('X-Robots-Tag', 'noindex');
    return res;
  }

  // Block checkout-like routes on the main domain.
  if (!isStoreHost && (pathname === '/checkout' || pathname.startsWith('/checkout/'))) {
    const target = url.clone();
    target.protocol = 'https:';
    target.hostname = 'store.bmwealth.co.in';
    const res = NextResponse.redirect(target, 301);
    res.headers.set('X-Robots-Tag', 'noindex');
    return res;
  }

  // Host-based store routing: store.bmwealth.co.in/* -> /store/* (dedicated store shell)
  // Keep /api as-is (shared infra). Everything else on store host must be store-only.
  if (isStoreHost && !pathname.startsWith('/api')) {
    const rewriteUrl = url.clone();
    rewriteUrl.pathname = `/store${pathname === '/' ? '' : pathname}`;
    return NextResponse.rewrite(rewriteUrl);
  }

  const response = NextResponse.next();

  // Ensure certain utility/private routes never get indexed on the main host.
  if (!isStoreHost) {
    const noindexExact = new Set(['/login', '/payment-success', '/payment-failed', '/v0-test', '/submit']);
    const noindexPrefix = ['/dashboard', '/client-portal', '/embed'];
    const shouldNoindex =
      noindexExact.has(pathname) || noindexPrefix.some((p) => pathname === p || pathname.startsWith(`${p}/`));
    if (shouldNoindex) response.headers.set('X-Robots-Tag', 'noindex, nofollow');
  }

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
