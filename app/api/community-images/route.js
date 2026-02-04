/**
 * Community Post Image Management API
 * 
 * GET /api/community-images - List all community posts with images
 * POST /api/community-images/search - Search for images by keyword
 * POST /api/community-images/update - Update a post's image
 * POST /api/community-images/rotate - Rotate to next fallback image
 * POST /api/community-images/batch - Auto-generate images for all posts
 */

export const runtime = 'nodejs';
export const dynamic = 'force-dynamic';

import { NextResponse } from 'next/server';
import { getLocalCommunityPosts, clearLocalCommunityPostsCache } from '@/lib/blog/localCommunityPosts';
import { 
  updatePostImage, 
  rotatePostImage, 
  batchGenerateImages, 
  searchImagesByKeyword 
} from '@/lib/blog/communityImageService';

/**
 * GET - List all community posts with their image data
 */
export async function GET(req) {
  try {
    const posts = await getLocalCommunityPosts();
    
    const summary = posts.map(p => ({
      _id: p._id,
      pillar: p.pillar,
      title: p.title,
      author: p.author_name,
      image_url: p.image_url,
      image_keywords: p.image_keywords,
      image_source: p.image_source,
      image_updated_at: p.image_updated_at,
      has_image: Boolean(p.image_url)
    }));
    
    return NextResponse.json({
      success: true,
      total: posts.length,
      with_images: summary.filter(p => p.has_image).length,
      posts: summary
    });
  } catch (err) {
    return NextResponse.json({ success: false, error: err.message }, { status: 500 });
  }
}

/**
 * POST - Handle different actions
 */
export async function POST(req) {
  try {
    const body = await req.json();
    const action = body.action || 'search';
    
    switch (action) {
      case 'search': {
        // Search for images by keyword
        const keyword = String(body.keyword || '').trim();
        if (!keyword) {
          return NextResponse.json({ success: false, error: 'Keyword required' }, { status: 400 });
        }
        const result = await searchImagesByKeyword(keyword, { 
          perPage: body.perPage || 12,
          page: body.page || 1 
        });
        return NextResponse.json(result);
      }
      
      case 'update': {
        // Update a specific post's image
        const postId = String(body.postId || '').trim();
        const imageUrl = String(body.imageUrl || '').trim();
        const keywords = Array.isArray(body.keywords) ? body.keywords : [];
        
        if (!postId || !imageUrl) {
          return NextResponse.json({ success: false, error: 'postId and imageUrl required' }, { status: 400 });
        }
        
        const result = await updatePostImage(postId, imageUrl, keywords);
        
        // Clear cache so changes take effect immediately
        if (result.success) {
          clearLocalCommunityPostsCache();
        }
        
        return NextResponse.json(result);
      }
      
      case 'rotate': {
        // Rotate to next fallback image
        const postId = String(body.postId || '').trim();
        if (!postId) {
          return NextResponse.json({ success: false, error: 'postId required' }, { status: 400 });
        }
        
        const result = await rotatePostImage(postId);
        
        // Clear cache so changes take effect immediately
        if (result.success) {
          clearLocalCommunityPostsCache();
        }
        
        return NextResponse.json(result);
      }
      
      case 'batch': {
        // Auto-generate images for all posts missing images
        const dryRun = Boolean(body.dryRun);
        const limit = Number(body.limit) || 50;
        
        const result = await batchGenerateImages({ dryRun, limit });
        
        // Clear cache so changes take effect immediately
        if (result.success && !dryRun) {
          clearLocalCommunityPostsCache();
        }
        
        return NextResponse.json(result);
      }
      
      default:
        return NextResponse.json({ success: false, error: `Unknown action: ${action}` }, { status: 400 });
    }
  } catch (err) {
    return NextResponse.json({ success: false, error: err.message }, { status: 500 });
  }
}
