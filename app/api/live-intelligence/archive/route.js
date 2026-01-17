/**
 * Archive API Route
 * @file app/api/live-intelligence/archive/route.js
 * 
 * Fetches historical headlines with search, filter, and pagination
 * Uses the 'headlines' table (same as feed API)
 */

import { NextResponse } from 'next/server';
import { createClient } from '@supabase/supabase-js';

const supabaseUrl = process.env.NEXT_PUBLIC_SUPABASE_URL;
const supabaseKey = process.env.SUPABASE_SERVICE_ROLE_KEY;

function getSupabase() {
  if (!supabaseUrl || !supabaseKey) return null;
  return createClient(supabaseUrl, supabaseKey);
}

export const dynamic = 'force-dynamic';

export async function GET(request) {
  try {
    const { searchParams } = new URL(request.url);
    const category = searchParams.get('category') || 'all';
    const dateRange = searchParams.get('dateRange') || '30days';
    const search = searchParams.get('search') || '';
    const limit = Math.min(parseInt(searchParams.get('limit') || '100', 10), 500);
    const offset = parseInt(searchParams.get('offset') || '0', 10);
    
    const supabase = getSupabase();
    
    if (!supabase) {
      return NextResponse.json({
        success: false,
        error: 'Database not configured',
        headlines: []
      }, { status: 500 });
    }
    
    // Calculate date filter
    let dateFilter = null;
    const now = new Date();
    
    switch (dateRange) {
      case '7days':
        dateFilter = new Date(now.getTime() - 7 * 24 * 60 * 60 * 1000);
        break;
      case '30days':
        dateFilter = new Date(now.getTime() - 30 * 24 * 60 * 60 * 1000);
        break;
      case '90days':
        dateFilter = new Date(now.getTime() - 90 * 24 * 60 * 60 * 1000);
        break;
      case 'all':
      default:
        dateFilter = null;
        break;
    }
    
    // Safe query wrapper
    const safeQuery = async (query) => {
      try {
        const result = await query;
        return result;
      } catch (e) {
        console.error('Query error:', e.message);
        return { data: [], error: e };
      }
    };
    
    // Query headlines table (cron-populated from RSS)
    let headlinesQuery = supabase
      .from('headlines')
      .select('*')
      .order('published_at', { ascending: false })
      .range(offset, offset + limit - 1);
    
    // Query live_intelligence_headlines table (admin-created)
    let adminQuery = supabase
      .from('live_intelligence_headlines')
      .select('*')
      .order('created_at', { ascending: false })
      .range(offset, offset + limit - 1);
    
    // Apply category filter
    if (category && category !== 'all') {
      headlinesQuery = headlinesQuery.eq('category', category);
      adminQuery = adminQuery.eq('category', category);
    }
    
    // Apply date filter
    if (dateFilter) {
      headlinesQuery = headlinesQuery.gte('published_at', dateFilter.toISOString());
      adminQuery = adminQuery.gte('created_at', dateFilter.toISOString());
    }
    
    // Apply search filter
    if (search) {
      headlinesQuery = headlinesQuery.or(`headline.ilike.%${search}%,why_it_matters.ilike.%${search}%,source.ilike.%${search}%`);
      adminQuery = adminQuery.or(`headline.ilike.%${search}%,why_it_matters.ilike.%${search}%,source.ilike.%${search}%`);
    }
    
    // Execute both queries
    const [headlinesResult, adminResult] = await Promise.all([
      safeQuery(headlinesQuery),
      safeQuery(adminQuery),
    ]);
    
    // Combine and deduplicate by headline text
    const allData = [...(headlinesResult.data || []), ...(adminResult.data || [])];
    const seen = new Set();
    const uniqueData = allData.filter(item => {
      const key = (item.headline || item.block_what_happened || '').toLowerCase().trim();
      if (seen.has(key)) return false;
      seen.add(key);
      return true;
    });
    
    // Sort by date
    uniqueData.sort((a, b) => {
      const dateA = new Date(a.published_at || a.created_at);
      const dateB = new Date(b.published_at || b.created_at);
      return dateB - dateA;
    });
    
    // Apply limit
    const limitedData = uniqueData.slice(0, limit);
    
    // Map data to consistent format (use snake_case from database)
    const headlines = limitedData.map(item => ({
      id: item.id,
      headline: item.headline || item.block_what_happened,
      summary: item.why_it_matters || item.block_why_it_matters || item.whyItMatters,
      data_point: item.data_point || item.block_where_fits || item.dataPoint,
      category: item.category || 'market_update',
      urgency: item.urgency || 'REGULAR',
      source: item.source || 'Unknown',
      published_at: item.published_at || item.created_at,
      created_at: item.created_at,
      valid_until: item.valid_until
    }));
    
    // Total is from unique combined data
    const total = uniqueData.length;
    
    return NextResponse.json({
      success: true,
      headlines,
      count: headlines.length,
      total: total,
      offset,
      limit,
      hasMore: offset + headlines.length < total
    });
    
  } catch (error) {
    console.error('Archive fetch error:', error);
    return NextResponse.json({
      success: false,
      error: error.message,
      headlines: []
    }, { status: 500 });
  }
}
