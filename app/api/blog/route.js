/**
 * FILE: app\api\blog\route.js
 * PURPOSE: (auto-added) Explain what this file does.
 * CATEGORY: api
 *
 * DEPENDENCIES:
 * - next/server
 * - fs/promises
 * - path
 *
 * USED BY:
 * - (search the repo for this filename)
 *
 * SIMPLE EXPLANATION:
 * This file is part of the app.
 * It helps one specific feature work correctly.
 *
 * TO MODIFY:
 * - 🔧 Search for "TO MODIFY" notes inside the file.
 */

import { NextResponse } from 'next/server';
import { readFile } from 'fs/promises';
import { join } from 'path';

export const dynamic = 'force-dynamic';
export const revalidate = 0;

function toTitleCase(value) {
  return String(value || '')
    .trim()
    .replace(/\s+/g, ' ')
    .split(' ')
    .filter(Boolean)
    .map((w) => w.charAt(0).toUpperCase() + w.slice(1))
    .join(' ');
}

function normalizeCategory(post) {
  if (post && typeof post.category === 'string' && post.category.trim()) {
    return toTitleCase(post.category);
  }

  if (post && Array.isArray(post.tags) && post.tags.length > 0) {
    const firstTag = post.tags.find((t) => typeof t === 'string' && t.trim());
    if (firstTag) return toTitleCase(firstTag);
  }

  return 'General';
}

export async function GET() {
  try {
    const filePath = join(process.cwd(), 'data', 'blog.json');
    const fileContents = await readFile(filePath, 'utf8');
    const blogPostsRaw = JSON.parse(fileContents);
    const blogPosts = Array.isArray(blogPostsRaw)
      ? blogPostsRaw.map((p) => ({ ...p, category: normalizeCategory(p) }))
      : [];
    
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
