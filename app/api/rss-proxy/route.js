/**
 * RSS Proxy API for Live Intelligence
 * 
 * Proxies RSS feed requests to avoid CORS issues.
 * Used by the headline feed to fetch news from various sources.
 * 
 * @file app/api/rss-proxy/route.js
 * @created January 13, 2026
 */

import { NextResponse } from 'next/server';

// Allowed RSS sources (whitelist for security)
const ALLOWED_HOSTS = [
  'www.moneycontrol.com',
  'economictimes.indiatimes.com',
  'www.livemint.com',
  'feeds.feedburner.com',
  'www.bseindia.com',
  'www.nseindia.com',
];

// Cache for RSS responses (5 minutes)
const RSS_CACHE = new Map();
const CACHE_TTL = 5 * 60 * 1000;

export const dynamic = 'force-dynamic';

export async function GET(request) {
  try {
    const feedUrl = request.nextUrl.searchParams.get('url');

    if (!feedUrl) {
      return NextResponse.json(
        { error: 'Missing url parameter' },
        { status: 400 }
      );
    }

    // Validate URL is in whitelist
    const url = new URL(feedUrl);
    if (!ALLOWED_HOSTS.includes(url.hostname)) {
      return NextResponse.json(
        { error: 'RSS source not allowed' },
        { status: 403 }
      );
    }

    // Check cache
    const cached = RSS_CACHE.get(feedUrl);
    if (cached && Date.now() - cached.timestamp < CACHE_TTL) {
      return new NextResponse(cached.data, {
        status: 200,
        headers: {
          'Content-Type': 'application/xml',
          'X-Cache': 'HIT',
          'Cache-Control': 'public, max-age=300',
        },
      });
    }

    // Fetch RSS feed
    const response = await fetch(feedUrl, {
      headers: {
        'User-Agent': 'BMWealth/1.0 RSS Reader',
        Accept: 'application/rss+xml, application/xml, text/xml',
      },
      next: { revalidate: 300 }, // Next.js cache for 5 minutes
    });

    if (!response.ok) {
      return NextResponse.json(
        { error: `Failed to fetch RSS: ${response.status}` },
        { status: response.status }
      );
    }

    const xml = await response.text();

    // Update cache
    RSS_CACHE.set(feedUrl, {
      data: xml,
      timestamp: Date.now(),
    });

    return new NextResponse(xml, {
      status: 200,
      headers: {
        'Content-Type': 'application/xml',
        'X-Cache': 'MISS',
        'Cache-Control': 'public, max-age=300',
      },
    });
  } catch (error) {
    console.error('RSS proxy error:', error);
    return NextResponse.json(
      { error: 'Failed to fetch RSS feed' },
      { status: 500 }
    );
  }
}
