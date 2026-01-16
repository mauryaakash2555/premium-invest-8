/**
 * Archive API Route
 * @file app/api/live-intelligence/archive/route.js
 * 
 * Fetches historical headlines with search, filter, and pagination
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
    
    // Build query for intelligence_items
    let query = supabase
      .from('intelligence_items')
      .select('id, category, urgency, block_what_happened, block_why_it_matters, block_where_fits, source_name, created_at, published_at, status')
      .order('created_at', { ascending: false })
      .range(offset, offset + limit - 1);
    
    // Apply category filter
    if (category && category !== 'all') {
      query = query.eq('category', category);
    }
    
    // Apply date filter
    if (dateFilter) {
      query = query.gte('created_at', dateFilter.toISOString());
    }
    
    // Apply search filter (using ilike for case-insensitive search)
    if (search) {
      query = query.or(`block_what_happened.ilike.%${search}%,block_why_it_matters.ilike.%${search}%,block_where_fits.ilike.%${search}%`);
    }
    
    const { data, error, count } = await query;
    
    if (error) {
      console.error('Archive query error:', error);
      throw error;
    }
    
    // Map data to consistent format
    const headlines = (data || []).map(item => ({
      id: item.id,
      headline: item.block_what_happened,
      summary: item.block_why_it_matters,
      data_point: item.block_where_fits,
      category: item.category || 'market_update',
      urgency: item.urgency || 'REGULAR',
      source: item.source_name || 'Unknown',
      published_at: item.published_at || item.created_at,
      created_at: item.created_at,
      status: item.status
    }));
    
    // Get total count for pagination
    let totalQuery = supabase
      .from('intelligence_items')
      .select('id', { count: 'exact', head: true });
    
    if (category && category !== 'all') {
      totalQuery = totalQuery.eq('category', category);
    }
    if (dateFilter) {
      totalQuery = totalQuery.gte('created_at', dateFilter.toISOString());
    }
    if (search) {
      totalQuery = totalQuery.or(`block_what_happened.ilike.%${search}%,block_why_it_matters.ilike.%${search}%`);
    }
    
    const { count: totalCount } = await totalQuery;
    
    return NextResponse.json({
      success: true,
      headlines,
      count: headlines.length,
      total: totalCount || headlines.length,
      offset,
      limit,
      hasMore: offset + headlines.length < (totalCount || 0)
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
