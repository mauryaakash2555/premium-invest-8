/**
 * Community Posts Image Service
 * 
 * Auto-generates images for community posts based on content/keywords
 * Supports manual override, rotation, and admin management
 * 
 * @module lib/blog/communityImageService
 */

import { searchImages, getRandomImage, getCuratedFallback } from './unsplashService';
import { extractKeywords } from './keywordExtractor';
import { readFile, writeFile } from 'fs/promises';
import { join } from 'path';

// Default images per pillar type (fallbacks)
const PILLAR_FALLBACK_IMAGES = {
  IMPACT: [
    'https://images.unsplash.com/photo-1509099836639-18ba1795216d?w=800&h=500&fit=crop&auto=format&fm=webp&q=75', // community
    'https://images.unsplash.com/photo-1542744173-8e7e53415bb0?w=800&h=500&fit=crop&auto=format&fm=webp&q=75', // impact
    'https://images.unsplash.com/photo-1573497019940-1c28c88b4f3e?w=800&h=500&fit=crop&auto=format&fm=webp&q=75', // people
  ],
  GUEST: [
    'https://images.unsplash.com/photo-1554224155-6726b3ff858f?w=800&h=500&fit=crop&auto=format&fm=webp&q=75', // business
    'https://images.unsplash.com/photo-1454165804606-c3d57bc86b40?w=800&h=500&fit=crop&auto=format&fm=webp&q=75', // professional
    'https://images.unsplash.com/photo-1521791136064-7986c2920216?w=800&h=500&fit=crop&auto=format&fm=webp&q=75', // collaboration
  ],
  DEV: [
    'https://images.unsplash.com/photo-1461749280684-dccba630e2f6?w=800&h=500&fit=crop&auto=format&fm=webp&q=75', // coding
    'https://images.unsplash.com/photo-1555066931-4365d14bab8c?w=800&h=500&fit=crop&auto=format&fm=webp&q=75', // developer
    'https://images.unsplash.com/photo-1517694712202-14dd9538aa97?w=800&h=500&fit=crop&auto=format&fm=webp&q=75', // tech
  ],
  EDITORIAL: [
    'https://images.unsplash.com/photo-1460925895917-afdab827c52f?w=800&h=500&fit=crop&auto=format&fm=webp&q=75', // finance
    'https://images.unsplash.com/photo-1579532537598-459ecdaf39cc?w=800&h=500&fit=crop&auto=format&fm=webp&q=75', // wealth
  ]
};

// Keywords per pillar for contextual search
const PILLAR_KEYWORDS = {
  IMPACT: ['community', 'impact', 'people', 'change', 'social', 'urban', 'city', 'life'],
  GUEST: ['professional', 'business', 'expert', 'insight', 'column', 'opinion', 'analysis'],
  DEV: ['technology', 'code', 'developer', 'programming', 'software', 'AI', 'digital'],
  EDITORIAL: ['finance', 'investment', 'wealth', 'money', 'economy', 'growth']
};

/**
 * Extract keywords from post content/title for image search
 */
export function getPostKeywords(post) {
  const parts = [];
  
  if (post.title) parts.push(post.title);
  if (post.content_original) parts.push(post.content_original.slice(0, 500));
  if (post.content_enhanced) parts.push(post.content_enhanced.slice(0, 500));
  
  const text = parts.join(' ');
  
  if (!text) {
    // Use pillar-based keywords
    const pillar = String(post.pillar || 'EDITORIAL').toUpperCase();
    return PILLAR_KEYWORDS[pillar] || PILLAR_KEYWORDS.EDITORIAL;
  }
  
  // Extract keywords using the existing service
  try {
    const keywords = extractKeywords(text, { limit: 5 });
    return keywords.primary || [text.split(' ').slice(0, 3).join(' ')];
  } catch {
    return [text.split(' ').slice(0, 3).join(' ')];
  }
}

/**
 * Get a fallback image for a pillar type
 */
export function getFallbackImage(pillar, index = 0) {
  const p = String(pillar || 'EDITORIAL').toUpperCase();
  const images = PILLAR_FALLBACK_IMAGES[p] || PILLAR_FALLBACK_IMAGES.EDITORIAL;
  return images[index % images.length];
}

/**
 * Get a rotating image for a post (changes based on index/time)
 */
export function getRotatingImage(post, seed = 0) {
  const pillar = String(post.pillar || 'EDITORIAL').toUpperCase();
  const images = PILLAR_FALLBACK_IMAGES[pillar] || PILLAR_FALLBACK_IMAGES.EDITORIAL;
  
  // Use post ID + seed to deterministically select image
  const hash = String(post._id || '').split('').reduce((a, c) => a + c.charCodeAt(0), seed);
  return images[hash % images.length];
}

/**
 * Auto-generate image URL for a community post
 * Priority: 1) Explicit image_url, 2) Search by keywords, 3) Pillar fallback
 */
export async function generateImageForPost(post, options = {}) {
  const { forceRefresh = false, useFallback = true } = options;
  
  // If post already has an image and we're not forcing refresh, use it
  if (!forceRefresh && post.image_url) {
    return {
      url: post.image_url,
      source: 'existing',
      keywords: post.image_keywords || []
    };
  }
  
  // Extract keywords from post
  const keywords = getPostKeywords(post);
  
  // Try to search Unsplash for matching image
  try {
    const searchResult = await searchImages(keywords, { perPage: 5 });
    
    if (searchResult.results && searchResult.results.length > 0) {
      const img = searchResult.results[0];
      const url = `${img.urls.regular}&w=800&h=500&fit=crop`;
      return {
        url,
        source: 'unsplash',
        keywords,
        unsplashId: img.id,
        photographer: img.user?.name || 'Unknown',
        photographerUrl: img.user?.links?.html
      };
    }
  } catch (err) {
    console.warn('[CommunityImageService] Unsplash search failed:', err.message);
  }
  
  // Use fallback image
  if (useFallback) {
    const url = getRotatingImage(post);
    return {
      url,
      source: 'fallback',
      keywords
    };
  }
  
  return { url: null, source: 'none', keywords };
}

/**
 * Update posts.json with new image data
 */
export async function updatePostImage(postId, imageUrl, imageKeywords = []) {
  const postsPath = join(process.cwd(), 'data', 'community_posts', 'posts.json');
  
  try {
    const raw = await readFile(postsPath, 'utf8');
    const posts = JSON.parse(raw);
    
    const idx = posts.findIndex(p => String(p._id) === String(postId));
    if (idx === -1) {
      return { success: false, error: 'Post not found' };
    }
    
    posts[idx].image_url = imageUrl;
    posts[idx].image_keywords = imageKeywords;
    posts[idx].image_updated_at = new Date().toISOString();
    
    await writeFile(postsPath, JSON.stringify(posts, null, 2), 'utf8');
    
    return { success: true, post: posts[idx] };
  } catch (err) {
    console.error('[CommunityImageService] Failed to update post image:', err);
    return { success: false, error: err.message };
  }
}

/**
 * Batch generate images for all posts missing images
 */
export async function batchGenerateImages(options = {}) {
  const { dryRun = false, limit = 50 } = options;
  const postsPath = join(process.cwd(), 'data', 'community_posts', 'posts.json');
  
  try {
    const raw = await readFile(postsPath, 'utf8');
    const posts = JSON.parse(raw);
    
    const results = [];
    let updated = 0;
    
    for (const post of posts) {
      if (updated >= limit) break;
      
      // Skip posts that already have images
      if (post.image_url) {
        results.push({ _id: post._id, skipped: true, reason: 'has_image' });
        continue;
      }
      
      const imageResult = await generateImageForPost(post, { forceRefresh: true });
      
      if (imageResult.url) {
        if (!dryRun) {
          post.image_url = imageResult.url;
          post.image_keywords = imageResult.keywords;
          post.image_source = imageResult.source;
          post.image_updated_at = new Date().toISOString();
        }
        
        results.push({
          _id: post._id,
          title: post.title,
          image_url: imageResult.url,
          source: imageResult.source,
          keywords: imageResult.keywords
        });
        
        updated++;
      }
    }
    
    if (!dryRun && updated > 0) {
      await writeFile(postsPath, JSON.stringify(posts, null, 2), 'utf8');
    }
    
    return {
      success: true,
      total: posts.length,
      updated,
      dryRun,
      results
    };
  } catch (err) {
    console.error('[CommunityImageService] Batch generation failed:', err);
    return { success: false, error: err.message };
  }
}

/**
 * Rotate image for a specific post (cycle through fallbacks)
 */
export async function rotatePostImage(postId) {
  const postsPath = join(process.cwd(), 'data', 'community_posts', 'posts.json');
  
  try {
    const raw = await readFile(postsPath, 'utf8');
    const posts = JSON.parse(raw);
    
    const idx = posts.findIndex(p => String(p._id) === String(postId));
    if (idx === -1) {
      return { success: false, error: 'Post not found' };
    }
    
    const post = posts[idx];
    const pillar = String(post.pillar || 'EDITORIAL').toUpperCase();
    const images = PILLAR_FALLBACK_IMAGES[pillar] || PILLAR_FALLBACK_IMAGES.EDITORIAL;
    
    // Find current index and move to next
    const currentUrl = post.image_url || '';
    const currentIdx = images.findIndex(img => currentUrl.includes(img.split('?')[0].split('/').pop()));
    const nextIdx = (currentIdx + 1) % images.length;
    
    post.image_url = images[nextIdx];
    post.image_source = 'rotated';
    post.image_updated_at = new Date().toISOString();
    
    await writeFile(postsPath, JSON.stringify(posts, null, 2), 'utf8');
    
    return {
      success: true,
      post,
      previousUrl: currentUrl,
      newUrl: post.image_url
    };
  } catch (err) {
    console.error('[CommunityImageService] Rotate failed:', err);
    return { success: false, error: err.message };
  }
}

/**
 * Search for images by keyword (for admin UI)
 */
export async function searchImagesByKeyword(keyword, options = {}) {
  const { perPage = 12, page = 1 } = options;
  
  try {
    const result = await searchImages([keyword], { perPage, page });
    
    return {
      success: true,
      keyword,
      total: result.total || 0,
      images: (result.results || []).map(img => ({
        id: img.id,
        url: `${img.urls.regular}&w=800&h=500&fit=crop`,
        thumbnail: img.urls.thumb,
        description: img.description || img.alt_description,
        photographer: img.user?.name,
        photographerUrl: img.user?.links?.html
      }))
    };
  } catch (err) {
    return {
      success: false,
      error: err.message,
      keyword,
      images: []
    };
  }
}
