/**
 * Blog Image Generator API
 * 
 * Reads blog content, extracts keywords, finds unique high-quality images
 * Uses Unsplash (free) with fallback strategies
 * 
 * POST /api/blog-image
 * Body: { content: string, title?: string, markAsUsed?: boolean }
 * 
 * Returns: { success: boolean, image: Object, keywords: Object }
 */

// Force Node.js runtime (needed for fs operations in imageTracker)
export const runtime = 'nodejs';
export const dynamic = 'force-dynamic';

import { NextResponse } from 'next/server';
import { extractKeywords, analyzeBlogForImage } from '@/lib/blog/keywordExtractor';
import { searchImages, getRandomImage, getCuratedFallback, FINANCE_TOPICS } from '@/lib/blog/unsplashService';
import { markImageUsed, isImageUsed, getUsedImageCount, initializeFromBlogs } from '@/lib/blog/imageTracker';

/**
 * POST handler - Generate image for blog content
 */
export async function POST(request) {
  try {
    const body = await request.json();
    const { content, title = '', markAsUsed = false, preferHighQuality = true } = body;

    if (!content || content.trim().length < 50) {
      return NextResponse.json(
        { success: false, error: 'Content too short. Need at least 50 characters.' },
        { status: 400 }
      );
    }

    // Extract keywords and analyze content
    const analysis = extractKeywords(content, title);
    
    // Try multiple search strategies
    let image = null;
    let searchAttempts = [];

    // Strategy 1: Search with extracted keywords
    for (const query of analysis.searchQueries) {
      if (image) break;
      
      const searchResult = await searchImages(query, {
        perPage: 20,
        orientation: 'landscape',
        orderBy: 'relevant'
      });

      searchAttempts.push({
        query,
        results: searchResult.total,
        available: searchResult.available
      });

      if (searchResult.results && searchResult.results.length > 0) {
        // Pick first available (highest relevance)
        image = searchResult.results[0];
        image.searchQuery = query;
        image.quality = preferHighQuality ? 'high' : 'default';
      }
    }

    // Strategy 2: Visual theme search
    if (!image && analysis.visualTerms.length > 0) {
      for (const visualTerm of analysis.visualTerms.slice(0, 3)) {
        if (image) break;
        
        const searchResult = await searchImages(visualTerm, {
          perPage: 15,
          orientation: 'landscape'
        });

        searchAttempts.push({
          query: visualTerm,
          results: searchResult.total,
          available: searchResult.available,
          type: 'visual'
        });

        if (searchResult.results && searchResult.results.length > 0) {
          image = searchResult.results[0];
          image.searchQuery = visualTerm;
          image.strategy = 'visual';
        }
      }
    }

    // Strategy 3: Theme-based curated fallback
    if (!image) {
      const fallback = getCuratedFallback(analysis.theme);
      if (fallback) {
        image = fallback;
        image.strategy = 'curated-fallback';
      }
    }

    // Strategy 4: Random finance image
    if (!image) {
      const random = await getRandomImage({
        orientation: 'landscape',
        topics: [FINANCE_TOPICS.business]
      });
      if (random) {
        image = random;
        image.strategy = 'random';
      }
    }

    // No image found at all
    if (!image) {
      return NextResponse.json({
        success: false,
        error: 'Could not find a suitable unique image. All relevant images may have been used.',
        analysis,
        searchAttempts,
        usedImageCount: getUsedImageCount()
      }, { status: 404 });
    }

    // Mark image as used if requested
    if (markAsUsed && image.id) {
      markImageUsed(image.id);
    }

    // Build response with best URL
    const imageUrl = preferHighQuality 
      ? (image.urls?.highQuality || image.urls?.default)
      : image.urls?.default;

    return NextResponse.json({
      success: true,
      image: {
        id: image.id,
        url: imageUrl,
        urls: image.urls,
        description: image.description,
        photographer: image.photographer,
        attribution: image.attribution,
        attributionHtml: image.attributionHtml,
        strategy: image.strategy || 'keyword-search',
        searchQuery: image.searchQuery
      },
      analysis: {
        keywords: analysis.keywords,
        theme: analysis.theme,
        visualTerms: analysis.visualTerms,
        mood: detectMood(content)
      },
      meta: {
        searchAttempts: searchAttempts.length,
        usedImageCount: getUsedImageCount(),
        markedAsUsed: markAsUsed
      }
    });

  } catch (error) {
    console.error('[BlogImage API] Error:', error);
    return NextResponse.json(
      { success: false, error: error.message },
      { status: 500 }
    );
  }
}

/**
 * GET handler - Get status and used image count
 */
export async function GET(request) {
  try {
    const { searchParams } = new URL(request.url);
    const action = searchParams.get('action');

    // Initialize tracker from existing blogs
    if (action === 'init') {
      const added = await initializeFromBlogs();
      return NextResponse.json({
        success: true,
        action: 'initialized',
        imagesAdded: added,
        totalTracked: getUsedImageCount()
      });
    }

    // Return status
    return NextResponse.json({
      success: true,
      status: 'ready',
      usedImageCount: getUsedImageCount(),
      endpoints: {
        generate: 'POST /api/blog-image - Generate image for blog content',
        init: 'GET /api/blog-image?action=init - Initialize from existing blogs'
      }
    });

  } catch (error) {
    console.error('[BlogImage API] GET Error:', error);
    return NextResponse.json(
      { success: false, error: error.message },
      { status: 500 }
    );
  }
}

/**
 * Simple mood detection (duplicated for API isolation)
 */
function detectMood(content) {
  const text = content.toLowerCase();
  const positive = (text.match(/success|grow|win|achieve|happy|prosper|gain|build/g) || []).length;
  const negative = (text.match(/loss|fail|mistake|wrong|worry|fear|risk|danger|crash/g) || []).length;
  const educational = (text.match(/learn|understand|explain|guide|how to|basics|101/g) || []).length;
  
  if (educational > 3) return 'educational';
  if (positive > negative + 2) return 'optimistic';
  if (negative > positive + 2) return 'cautionary';
  return 'professional';
}
