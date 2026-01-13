/**
 * Breaking News API for Live Intelligence
 * 
 * Manages breaking news interrupts that take priority
 * over regular headlines for 30 seconds.
 * 
 * @file app/api/breaking-news/route.js
 * @created January 13, 2026
 */

import { NextResponse } from 'next/server';
import { createClient } from '@supabase/supabase-js';
import { cookies } from 'next/headers';

// In-memory cache for breaking news (no DB dependency for speed)
let currentBreakingNews = null;
let breakingExpiry = null;

// Supabase client (for admin verification)
const supabaseUrl = process.env.NEXT_PUBLIC_SUPABASE_URL;
const supabaseKey = process.env.SUPABASE_SERVICE_ROLE_KEY;

function getSupabase() {
  if (!supabaseUrl || !supabaseKey) return null;
  return createClient(supabaseUrl, supabaseKey);
}

// Verify admin session
async function verifyAdmin() {
  try {
    const supabase = getSupabase();
    if (!supabase) return false;
    
    const cookieStore = await cookies();
    const sessionToken = cookieStore.get('admin_session')?.value;
    
    if (!sessionToken) return false;
    
    const { data, error } = await supabase
      .from('admin_sessions')
      .select('*')
      .eq('token', sessionToken)
      .single();
    
    if (error || !data) return false;
    if (new Date(data.expires_at) < new Date()) return false;
    
    return true;
  } catch {
    return false;
  }
}

export const dynamic = 'force-dynamic';

/**
 * GET - Check for active breaking news
 */
export async function GET() {
  try {
    // Check if breaking news is expired
    if (breakingExpiry && Date.now() > breakingExpiry) {
      currentBreakingNews = null;
      breakingExpiry = null;
    }
    
    if (!currentBreakingNews) {
      return NextResponse.json({ isBreaking: false });
    }
    
    return NextResponse.json({
      isBreaking: true,
      ...currentBreakingNews,
      expiresIn: breakingExpiry - Date.now(),
    });
  } catch (error) {
    console.error('Breaking news GET error:', error);
    return NextResponse.json({ isBreaking: false });
  }
}

/**
 * POST - Trigger breaking news (admin only)
 * 
 * Expected body:
 * {
 *   headline: "Breaking headline text",
 *   category: "breaking",
 *   whyItMatters: "Why this is important",
 *   dataPoint: "Key data",
 *   source: "Source name",
 *   duration: 30000  // optional, defaults to 30 seconds
 * }
 */
export async function POST(request) {
  try {
    // Verify admin
    const isAdmin = await verifyAdmin();
    if (!isAdmin) {
      return NextResponse.json(
        { error: 'Unauthorized' },
        { status: 401 }
      );
    }
    
    const body = await request.json();
    
    if (!body.headline) {
      return NextResponse.json(
        { error: 'Missing headline' },
        { status: 400 }
      );
    }
    
    // Set breaking news
    const duration = body.duration || 30000; // Default 30 seconds
    
    currentBreakingNews = {
      id: `breaking-${Date.now()}`,
      category: 'breaking',
      icon: '🔴',
      headline: body.headline,
      whyItMatters: body.whyItMatters || 'Breaking development',
      urgency: 'BREAKING',
      timestamp: new Date().toISOString(),
      dataPoint: body.dataPoint,
      source: body.source || 'Admin',
      isBreaking: true,
    };
    
    breakingExpiry = Date.now() + duration;
    
    // Log to Supabase for history (non-blocking)
    const supabase = getSupabase();
    if (supabase) {
      supabase
        .from('breaking_news_log')
        .insert({
          headline: body.headline,
          category: 'breaking',
          duration_ms: duration,
          triggered_at: new Date().toISOString(),
        })
        .then(() => {})
        .catch((err) => console.warn('Failed to log breaking news:', err));
    }
    
    return NextResponse.json({
      success: true,
      headline: currentBreakingNews,
      expiresAt: new Date(breakingExpiry).toISOString(),
    });
  } catch (error) {
    console.error('Breaking news POST error:', error);
    return NextResponse.json(
      { error: 'Failed to trigger breaking news' },
      { status: 500 }
    );
  }
}

/**
 * DELETE - Clear breaking news immediately (admin only)
 */
export async function DELETE() {
  try {
    const isAdmin = await verifyAdmin();
    if (!isAdmin) {
      return NextResponse.json(
        { error: 'Unauthorized' },
        { status: 401 }
      );
    }
    
    currentBreakingNews = null;
    breakingExpiry = null;
    
    return NextResponse.json({ success: true });
  } catch (error) {
    console.error('Breaking news DELETE error:', error);
    return NextResponse.json(
      { error: 'Failed to clear breaking news' },
      { status: 500 }
    );
  }
}
