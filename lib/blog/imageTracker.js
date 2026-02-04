/**
 * Blog Image Tracker
 * Prevents reuse of images across blog posts
 * 
 * Features:
 * - Tracks all used Unsplash image IDs
 * - Stores in local JSON file for persistence
 * - Checks before returning any image
 * 
 * @module lib/blog/imageTracker
 */

import fs from 'fs';
import path from 'path';

const DATA_FILE = path.join(process.cwd(), 'data', 'usedBlogImages.json');

/**
 * Load all used image IDs from storage
 */
export function getUsedImages() {
  try {
    if (fs.existsSync(DATA_FILE)) {
      const data = fs.readFileSync(DATA_FILE, 'utf8');
      const parsed = JSON.parse(data);
      return new Set(parsed.usedImageIds || []);
    }
  } catch (error) {
    console.error('[ImageTracker] Error loading used images:', error);
  }
  return new Set();
}

/**
 * Save used image IDs to storage
 */
export function saveUsedImages(imageSet) {
  try {
    const data = {
      lastUpdated: new Date().toISOString(),
      count: imageSet.size,
      usedImageIds: Array.from(imageSet)
    };
    fs.writeFileSync(DATA_FILE, JSON.stringify(data, null, 2), 'utf8');
    return true;
  } catch (error) {
    console.error('[ImageTracker] Error saving used images:', error);
    return false;
  }
}

/**
 * Mark an image as used (cannot be reused)
 */
export function markImageUsed(imageId) {
  const used = getUsedImages();
  used.add(imageId);
  return saveUsedImages(used);
}

/**
 * Check if an image has already been used
 */
export function isImageUsed(imageId) {
  const used = getUsedImages();
  return used.has(imageId);
}

/**
 * Extract Unsplash image ID from URL
 * Example: https://images.unsplash.com/photo-1554224155-6726b3ff858f?w=1200
 * Returns: photo-1554224155-6726b3ff858f
 */
export function extractUnsplashId(url) {
  if (!url || typeof url !== 'string') return null;
  
  // Match Unsplash photo ID pattern
  const match = url.match(/photo-[\w-]+/);
  return match ? match[0] : null;
}

/**
 * Get count of used images
 */
export function getUsedImageCount() {
  return getUsedImages().size;
}

/**
 * Initialize tracker by scanning existing blog images
 * Call this once to populate from existing blog.json
 */
export async function initializeFromBlogs() {
  try {
    const blogPath = path.join(process.cwd(), 'data', 'blog.json');
    if (!fs.existsSync(blogPath)) return 0;
    
    const blogs = JSON.parse(fs.readFileSync(blogPath, 'utf8'));
    const used = getUsedImages();
    let added = 0;
    
    for (const blog of blogs) {
      if (blog.imageUrl) {
        const id = extractUnsplashId(blog.imageUrl);
        if (id && !used.has(id)) {
          used.add(id);
          added++;
        }
      }
    }
    
    if (added > 0) {
      saveUsedImages(used);
    }
    
    return added;
  } catch (error) {
    console.error('[ImageTracker] Error initializing from blogs:', error);
    return 0;
  }
}

export default {
  getUsedImages,
  saveUsedImages,
  markImageUsed,
  isImageUsed,
  extractUnsplashId,
  getUsedImageCount,
  initializeFromBlogs
};
