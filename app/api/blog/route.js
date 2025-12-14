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
    
    return NextResponse.json(blogPosts, {
      headers: {
        'Cache-Control': 'no-store, no-cache, must-revalidate, max-age=0',
        'CDN-Cache-Control': 'no-store',
        'Vercel-CDN-Cache-Control': 'no-store',
      },
    });
  } catch (error) {
    return NextResponse.json({ error: 'Failed to load blog posts' }, { status: 500 });
  }
}
