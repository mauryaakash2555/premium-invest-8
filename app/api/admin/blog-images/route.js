/**
 * Universal Blog Image Management API
 * 
 * Manages images for ALL blog types:
 * - BM Editorial (static blogs from staticBlogData.js)
 * - Community Impact (pillar: impact)
 * - Guest Columns (pillar: guest)
 * - Developer Insight (pillar: dev)
 * 
 * Features:
 * - List all blogs with images
 * - Search Unsplash for new images
 * - Update image with history tracking
 * - Revert to previous images
 */

export const runtime = 'nodejs';
export const dynamic = 'force-dynamic';

import { NextResponse } from 'next/server';
import { cookies } from 'next/headers';
import path from 'path';
import fs from 'fs/promises';

// Import blog data sources
import { staticBlogData } from '@/data/staticBlogData';
import { getLocalCommunityPosts, clearLocalCommunityPostsCache } from '@/lib/blog/localCommunityPosts';

const UNSPLASH_ACCESS_KEY = process.env.UNSPLASH_ACCESS_KEY || '';
const IMAGE_HISTORY_PATH = path.join(process.cwd(), 'data', 'blog-image-history.json');
const EDITORIAL_OVERRIDES_PATH = path.join(process.cwd(), 'data', 'editorial-image-overrides.json');

/**
 * Load image history from JSON file
 */
async function loadImageHistory() {
  try {
    const data = await fs.readFile(IMAGE_HISTORY_PATH, 'utf8');
    return JSON.parse(data);
  } catch {
    return {};
  }
}

/**
 * Save image history to JSON file
 */
async function saveImageHistory(history) {
  await fs.writeFile(IMAGE_HISTORY_PATH, JSON.stringify(history, null, 2), 'utf8');
}

/**
 * Load editorial image overrides
 */
async function loadEditorialOverrides() {
  try {
    const data = await fs.readFile(EDITORIAL_OVERRIDES_PATH, 'utf8');
    return JSON.parse(data);
  } catch {
    return {};
  }
}

/**
 * Save editorial image overrides
 */
async function saveEditorialOverrides(overrides) {
  await fs.writeFile(EDITORIAL_OVERRIDES_PATH, JSON.stringify(overrides, null, 2), 'utf8');
}

/**
 * Add image to history for a blog
 */
async function addToHistory(blogId, imageUrl, source = 'manual') {
  const history = await loadImageHistory();
  
  if (!history[blogId]) {
    history[blogId] = [];
  }
  
  // Add current image to history if not already there
  const entry = {
    url: imageUrl,
    source,
    timestamp: new Date().toISOString()
  };
  
  // Don't add duplicates
  if (!history[blogId].some(h => h.url === imageUrl)) {
    history[blogId].unshift(entry);
    // Keep last 10 images
    history[blogId] = history[blogId].slice(0, 10);
    await saveImageHistory(history);
  }
  
  return history[blogId];
}

/**
 * Get image history for a blog
 */
async function getHistory(blogId) {
  const history = await loadImageHistory();
  return history[blogId] || [];
}

/**
 * Verify admin authentication
 */
async function verifyAdmin() {
  const cookieStore = await cookies();
  const token = cookieStore.get('bm_admin_session')?.value;
  return Boolean(token);
}

/**
 * Search Unsplash for images
 */
async function searchUnsplash(query, perPage = 12) {
  if (!UNSPLASH_ACCESS_KEY) {
    return { success: false, error: 'Unsplash API key not configured' };
  }
  
  try {
    const url = `https://api.unsplash.com/search/photos?query=${encodeURIComponent(query)}&per_page=${perPage}&orientation=landscape`;
    const res = await fetch(url, {
      headers: { 'Authorization': `Client-ID ${UNSPLASH_ACCESS_KEY}` }
    });
    
    if (!res.ok) {
      return { success: false, error: 'Unsplash API error' };
    }
    
    const data = await res.json();
    const images = (data.results || []).map(img => ({
      id: img.id,
      url: img.urls?.regular || img.urls?.small,
      thumb: img.urls?.thumb || img.urls?.small,
      alt: img.alt_description || query,
      photographer: img.user?.name,
      link: img.links?.html
    }));
    
    return { success: true, images };
  } catch (err) {
    return { success: false, error: err.message };
  }
}

/**
 * GET - List all blogs from all pillars with images
 */
export async function GET(req) {
  const isAdmin = await verifyAdmin();
  if (!isAdmin) {
    return NextResponse.json({ success: false, error: 'Unauthorized' }, { status: 401 });
  }
  
  try {
    const { searchParams } = new URL(req.url);
    const pillar = searchParams.get('pillar') || 'all';
    
    const allBlogs = [];
    const overrides = await loadEditorialOverrides();
    
    // Load Editorial blogs
    if (pillar === 'all' || pillar === 'editorial') {
      const editorialBlogs = Array.isArray(staticBlogData) ? staticBlogData : [];
      for (const blog of editorialBlogs) {
        const blogId = blog.id || blog.slug;
        const override = overrides[blogId];
        allBlogs.push({
          id: blogId,
          pillar: 'editorial',
          title: blog.title,
          author: blog.author,
          image_url: override?.image_url || blog.image_url || blog.image,
          image_original: blog.image_url || blog.image,
          image_overridden: Boolean(override?.image_url),
          slug: blog.slug,
          category: blog.category,
          date: blog.published_date || blog.date
        });
      }
    }
    
    // Load Community posts (Impact, Guest, Dev)
    if (pillar === 'all' || ['impact', 'guest', 'dev'].includes(pillar)) {
      const communityPosts = await getLocalCommunityPosts();
      for (const post of communityPosts) {
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
          date: post.approved_at || post.created_at
        });
      }
    }
    
    // Get image history for all blogs
    const history = await loadImageHistory();
    const blogsWithHistory = allBlogs.map(blog => ({
      ...blog,
      image_history: history[blog.id] || []
    }));
    
    return NextResponse.json({
      success: true,
      total: blogsWithHistory.length,
      pillars: {
        editorial: blogsWithHistory.filter(b => b.pillar === 'editorial').length,
        impact: blogsWithHistory.filter(b => b.pillar === 'impact').length,
        guest: blogsWithHistory.filter(b => b.pillar === 'guest').length,
        dev: blogsWithHistory.filter(b => b.pillar === 'dev').length
      },
      blogs: blogsWithHistory
    });
  } catch (err) {
    return NextResponse.json({ success: false, error: err.message }, { status: 500 });
  }
}

/**
 * POST - Handle actions: search, update, revert
 */
export async function POST(req) {
  const isAdmin = await verifyAdmin();
  if (!isAdmin) {
    return NextResponse.json({ success: false, error: 'Unauthorized' }, { status: 401 });
  }
  
  try {
    const body = await req.json();
    const action = body.action || 'search';
    
    switch (action) {
      case 'search': {
        const keyword = String(body.keyword || '').trim();
        if (!keyword) {
          return NextResponse.json({ success: false, error: 'Keyword required' }, { status: 400 });
        }
        return NextResponse.json(await searchUnsplash(keyword, body.perPage || 12));
      }
      
      case 'update': {
        const blogId = String(body.blogId || '').trim();
        const imageUrl = String(body.imageUrl || '').trim();
        const pillar = String(body.pillar || '').trim();
        
        if (!blogId || !imageUrl) {
          return NextResponse.json({ success: false, error: 'blogId and imageUrl required' }, { status: 400 });
        }
        
        // Save current image to history first
        const currentImage = body.currentImage;
        if (currentImage) {
          await addToHistory(blogId, currentImage, 'previous');
        }
        
        // Add new image to history
        await addToHistory(blogId, imageUrl, 'unsplash');
        
        if (pillar === 'editorial') {
          // Update editorial override
          const overrides = await loadEditorialOverrides();
          overrides[blogId] = {
            image_url: imageUrl,
            updated_at: new Date().toISOString()
          };
          await saveEditorialOverrides(overrides);
        } else {
          // Update community post in local JSON
          const postsPath = path.join(process.cwd(), 'data', 'community_posts.json');
          try {
            const postsData = await fs.readFile(postsPath, 'utf8');
            const posts = JSON.parse(postsData);
            const postIndex = posts.findIndex(p => p._id === blogId);
            if (postIndex >= 0) {
              posts[postIndex].image_url = imageUrl;
              posts[postIndex].image_updated_at = new Date().toISOString();
              await fs.writeFile(postsPath, JSON.stringify(posts, null, 2), 'utf8');
              clearLocalCommunityPostsCache();
            }
          } catch (err) {
            console.error('Failed to update community post:', err);
          }
        }
        
        const history = await getHistory(blogId);
        return NextResponse.json({ success: true, message: 'Image updated', history });
      }
      
      case 'revert': {
        const blogId = String(body.blogId || '').trim();
        const imageUrl = String(body.imageUrl || '').trim();
        const pillar = String(body.pillar || '').trim();
        
        if (!blogId || !imageUrl) {
          return NextResponse.json({ success: false, error: 'blogId and imageUrl required' }, { status: 400 });
        }
        
        if (pillar === 'editorial') {
          const overrides = await loadEditorialOverrides();
          overrides[blogId] = {
            image_url: imageUrl,
            updated_at: new Date().toISOString(),
            reverted: true
          };
          await saveEditorialOverrides(overrides);
        } else {
          const postsPath = path.join(process.cwd(), 'data', 'community_posts.json');
          try {
            const postsData = await fs.readFile(postsPath, 'utf8');
            const posts = JSON.parse(postsData);
            const postIndex = posts.findIndex(p => p._id === blogId);
            if (postIndex >= 0) {
              posts[postIndex].image_url = imageUrl;
              posts[postIndex].image_updated_at = new Date().toISOString();
              await fs.writeFile(postsPath, JSON.stringify(posts, null, 2), 'utf8');
              clearLocalCommunityPostsCache();
            }
          } catch (err) {
            console.error('Failed to revert community post:', err);
          }
        }
        
        return NextResponse.json({ success: true, message: 'Image reverted' });
      }
      
      case 'history': {
        const blogId = String(body.blogId || '').trim();
        if (!blogId) {
          return NextResponse.json({ success: false, error: 'blogId required' }, { status: 400 });
        }
        const history = await getHistory(blogId);
        return NextResponse.json({ success: true, history });
      }
      
      default:
        return NextResponse.json({ success: false, error: `Unknown action: ${action}` }, { status: 400 });
    }
  } catch (err) {
    return NextResponse.json({ success: false, error: err.message }, { status: 500 });
  }
}
