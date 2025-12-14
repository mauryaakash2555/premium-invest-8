import { NextResponse } from 'next/server';
import { readFile } from 'fs/promises';
import { join } from 'path';

export const dynamic = 'force-dynamic';
export const revalidate = 0;

export async function GET() {
  try {
    const filePath = join(process.cwd(), 'data', 'blog.json');
    const fileContents = await readFile(filePath, 'utf8');
    const blogPosts = JSON.parse(fileContents);
    
    // Add debug info
    const debugInfo = {
      timestamp: new Date().toISOString(),
      slugs: blogPosts.map(p => p.slug),
      totalPosts: blogPosts.length,
    };
    
    return NextResponse.json({ posts: blogPosts, debug: debugInfo }, {
      headers: {
        'Cache-Control': 'no-store, no-cache, must-revalidate, max-age=0',
        'CDN-Cache-Control': 'no-store',
        'Vercel-CDN-Cache-Control': 'no-store',
        'X-Debug-Timestamp': debugInfo.timestamp,
      },
    });
  } catch (error) {
    return NextResponse.json({ error: 'Failed to load blog posts', message: error.message }, { status: 500 });
  }
}
