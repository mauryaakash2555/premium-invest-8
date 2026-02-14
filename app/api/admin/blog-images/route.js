/**
 * Universal Blog Image Management API
 *
 * Manages images for ALL blog types:
 * - BM Editorial (static blogs from staticBlogData.js)
 * - Community Impact (pillar: impact)
 * - Guest Columns (pillar: guest)
 * - Developer Insight (pillar: dev)
 *
 * Image sources:
 * - Unsplash (requires UNSPLASH_ACCESS_KEY env var)
 * - Lorem Picsum (free, no key)
 * - Direct URL (paste any image URL)
 *
 * Features:
 * - List all blogs with images
 * - Multi-source image search with pagination
 * - Update image with history tracking
 * - Revert to previous images
 */

export const runtime = 'nodejs';
export const dynamic = 'force-dynamic';

import { NextResponse } from 'next/server';
import { cookies, headers } from 'next/headers';
import path from 'path';
import fs from 'fs/promises';

import { getSuperAdminPayloadFromRequest } from '@/lib/adminSession';
import { staticBlogData } from '@/data/staticBlogData';
import { getLocalCommunityPosts, clearLocalCommunityPostsCache } from '@/lib/blog/localCommunityPosts';

const UNSPLASH_ACCESS_KEY = process.env.UNSPLASH_ACCESS_KEY || '';
const IMAGE_HISTORY_PATH = path.join(process.cwd(), 'data', 'blog-image-history.json');
const EDITORIAL_OVERRIDES_PATH = path.join(process.cwd(), 'data', 'editorial-image-overrides.json');

/* ─── helpers ───────────────────────────────────────────────────── */

async function loadJSON(filePath) {
  try { return JSON.parse(await fs.readFile(filePath, 'utf8')); } catch { return {}; }
}
async function saveJSON(filePath, data) {
  await fs.writeFile(filePath, JSON.stringify(data, null, 2), 'utf8');
}

const loadImageHistory = () => loadJSON(IMAGE_HISTORY_PATH);
const saveImageHistory = (h) => saveJSON(IMAGE_HISTORY_PATH, h);
const loadEditorialOverrides = () => loadJSON(EDITORIAL_OVERRIDES_PATH);
const saveEditorialOverrides = (o) => saveJSON(EDITORIAL_OVERRIDES_PATH, o);

async function addToHistory(blogId, imageUrl, source = 'manual') {
  const history = await loadImageHistory();
  if (!history[blogId]) history[blogId] = [];
  const entry = { url: imageUrl, source, timestamp: new Date().toISOString() };
  if (!history[blogId].some((h) => h.url === imageUrl)) {
    history[blogId].unshift(entry);
    history[blogId] = history[blogId].slice(0, 10);
    await saveImageHistory(history);
  }
  return history[blogId];
}

async function getHistory(blogId) {
  return (await loadImageHistory())[blogId] || [];
}

/* ─── auth (uses shared admin session – cookie + header) ──────── */

async function verifyAdmin() {
  const cookieStore = await cookies();
  const headerStore = await headers();
  return Boolean(getSuperAdminPayloadFromRequest(cookieStore, headerStore));
}

/* ─── image sources ─────────────────────────────────────────────── */

/** Unsplash search (requires env key) */
async function searchUnsplash(query, page = 1, perPage = 12) {
  if (!UNSPLASH_ACCESS_KEY) return { images: [], total: 0, provider: 'unsplash', error: 'Unsplash API key not configured' };
  try {
    const url = `https://api.unsplash.com/search/photos?query=${encodeURIComponent(query)}&page=${page}&per_page=${perPage}&orientation=landscape`;
    const res = await fetch(url, { headers: { Authorization: `Client-ID ${UNSPLASH_ACCESS_KEY}` } });
    if (!res.ok) return { images: [], total: 0, provider: 'unsplash', error: `Unsplash ${res.status}` };
    const data = await res.json();
    const images = (data.results || []).map((img) => ({
      id: img.id,
      url: img.urls?.regular || img.urls?.small,
      thumb: img.urls?.thumb || img.urls?.small,
      alt: img.alt_description || query,
      photographer: img.user?.name || '',
      link: img.links?.html || '',
      provider: 'unsplash',
    }));
    return { images, total: data.total || 0, totalPages: data.total_pages || 1, provider: 'unsplash' };
  } catch (err) {
    return { images: [], total: 0, provider: 'unsplash', error: err.message };
  }
}

/** Lorem Picsum – high-quality free images, no key needed */
async function searchPicsum(page = 1, perPage = 12) {
  try {
    const res = await fetch(`https://picsum.photos/v2/list?page=${page}&limit=${perPage}`);
    if (!res.ok) return { images: [], provider: 'picsum', error: `Picsum ${res.status}` };
    const data = await res.json();
    const images = data.map((img) => ({
      id: `picsum-${img.id}`,
      url: `https://picsum.photos/id/${img.id}/1200/630`,
      thumb: `https://picsum.photos/id/${img.id}/300/200`,
      alt: `Photo by ${img.author}`,
      photographer: img.author,
      link: img.url || '',
      provider: 'picsum',
    }));
    return { images, provider: 'picsum' };
  } catch (err) {
    return { images: [], provider: 'picsum', error: err.message };
  }
}

/* ─── GET – list blogs ──────────────────────────────────────────── */

export async function GET(req) {
  if (!(await verifyAdmin())) {
    return NextResponse.json({ success: false, error: 'Unauthorized' }, { status: 401 });
  }

  try {
    const pillar = new URL(req.url).searchParams.get('pillar') || 'all';
    const allBlogs = [];
    const overrides = await loadEditorialOverrides();

    if (pillar === 'all' || pillar === 'editorial') {
      for (const blog of Array.isArray(staticBlogData) ? staticBlogData : []) {
        const blogId = blog.id || blog.slug;
        const ov = overrides[blogId];
        allBlogs.push({
          id: blogId,
          pillar: 'editorial',
          title: blog.title,
          author: blog.author,
          image_url: ov?.image_url || blog.image_url || blog.image,
          image_original: blog.image_url || blog.image,
          image_overridden: Boolean(ov?.image_url),
          slug: blog.slug,
          category: blog.category,
          date: blog.published_date || blog.date,
        });
      }
    }

    if (pillar === 'all' || ['impact', 'guest', 'dev'].includes(pillar)) {
      for (const post of await getLocalCommunityPosts()) {
        if (pillar !== 'all' && post.pillar !== pillar) continue;
        allBlogs.push({
          id: post._id,
          pillar: post.pillar,
          title: post.title,
          author: post.author_name,
          image_url: post.image_url,
          image_original: post.image_url,
          image_overridden: false,
          category: post.category,
          date: post.approved_at || post.created_at,
        });
      }
    }

    const history = await loadImageHistory();
    const blogs = allBlogs.map((b) => ({ ...b, image_history: history[b.id] || [] }));

    return NextResponse.json({
      success: true,
      total: blogs.length,
      pillars: {
        editorial: blogs.filter((b) => b.pillar === 'editorial').length,
        impact: blogs.filter((b) => b.pillar === 'impact').length,
        guest: blogs.filter((b) => b.pillar === 'guest').length,
        dev: blogs.filter((b) => b.pillar === 'dev').length,
      },
      blogs,
    });
  } catch (err) {
    return NextResponse.json({ success: false, error: err.message }, { status: 500 });
  }
}

/* ─── POST – actions ────────────────────────────────────────────── */

export async function POST(req) {
  if (!(await verifyAdmin())) {
    return NextResponse.json({ success: false, error: 'Unauthorized' }, { status: 401 });
  }

  try {
    const body = await req.json();
    const action = body.action || 'search';

    switch (action) {
      /* ── search (multi-source) ─────────────────────── */
      case 'search': {
        const keyword = String(body.keyword || '').trim();
        const source = String(body.source || 'unsplash').trim();
        const page = Number(body.page) || 1;
        const perPage = Math.min(Number(body.perPage) || 12, 30);

        if (source === 'picsum') {
          return NextResponse.json({ success: true, ...(await searchPicsum(page, perPage)) });
        }

        // default: unsplash
        if (!keyword) return NextResponse.json({ success: false, error: 'Keyword required for Unsplash search' }, { status: 400 });
        return NextResponse.json({ success: true, ...(await searchUnsplash(keyword, page, perPage)) });
      }

      /* ── update ────────────────────────────────────── */
      case 'update': {
        const blogId = String(body.blogId || '').trim();
        const imageUrl = String(body.imageUrl || '').trim();
        const pillar = String(body.pillar || '').trim();
        if (!blogId || !imageUrl) return NextResponse.json({ success: false, error: 'blogId and imageUrl required' }, { status: 400 });

        if (body.currentImage) await addToHistory(blogId, body.currentImage, 'previous');
        await addToHistory(blogId, imageUrl, body.imageSource || 'manual');

        if (pillar === 'editorial') {
          const ov = await loadEditorialOverrides();
          ov[blogId] = { image_url: imageUrl, updated_at: new Date().toISOString() };
          await saveEditorialOverrides(ov);
        } else {
          const postsPath = path.join(process.cwd(), 'data', 'community_posts.json');
          try {
            const posts = JSON.parse(await fs.readFile(postsPath, 'utf8'));
            const idx = posts.findIndex((p) => p._id === blogId);
            if (idx >= 0) {
              posts[idx].image_url = imageUrl;
              posts[idx].image_updated_at = new Date().toISOString();
              await fs.writeFile(postsPath, JSON.stringify(posts, null, 2), 'utf8');
              clearLocalCommunityPostsCache();
            }
          } catch (e) {
            console.error('Failed to update community post:', e);
          }
        }

        return NextResponse.json({ success: true, message: 'Image updated', history: await getHistory(blogId) });
      }

      /* ── revert ────────────────────────────────────── */
      case 'revert': {
        const blogId = String(body.blogId || '').trim();
        const imageUrl = String(body.imageUrl || '').trim();
        const pillar = String(body.pillar || '').trim();
        if (!blogId || !imageUrl) return NextResponse.json({ success: false, error: 'blogId and imageUrl required' }, { status: 400 });

        if (pillar === 'editorial') {
          const ov = await loadEditorialOverrides();
          ov[blogId] = { image_url: imageUrl, updated_at: new Date().toISOString(), reverted: true };
          await saveEditorialOverrides(ov);
        } else {
          const postsPath = path.join(process.cwd(), 'data', 'community_posts.json');
          try {
            const posts = JSON.parse(await fs.readFile(postsPath, 'utf8'));
            const idx = posts.findIndex((p) => p._id === blogId);
            if (idx >= 0) {
              posts[idx].image_url = imageUrl;
              posts[idx].image_updated_at = new Date().toISOString();
              await fs.writeFile(postsPath, JSON.stringify(posts, null, 2), 'utf8');
              clearLocalCommunityPostsCache();
            }
          } catch (e) {
            console.error('Failed to revert community post:', e);
          }
        }

        return NextResponse.json({ success: true, message: 'Image reverted' });
      }

      /* ── history ───────────────────────────────────── */
      case 'history': {
        const blogId = String(body.blogId || '').trim();
        if (!blogId) return NextResponse.json({ success: false, error: 'blogId required' }, { status: 400 });
        return NextResponse.json({ success: true, history: await getHistory(blogId) });
      }

      default:
        return NextResponse.json({ success: false, error: `Unknown action: ${action}` }, { status: 400 });
    }
  } catch (err) {
    return NextResponse.json({ success: false, error: err.message }, { status: 500 });
  }
}
