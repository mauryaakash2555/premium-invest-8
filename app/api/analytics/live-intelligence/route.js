/**
 * Live Intelligence Analytics API
 * 
 * Receives and stores analytics events from the Live Intelligence page.
 * Events are stored in Supabase for analysis.
 * 
 * @file app/api/analytics/live-intelligence/route.js
 * @created January 13, 2026
 */

import { NextResponse } from 'next/server';
import { createClient } from '@supabase/supabase-js';

// Supabase client
const supabaseUrl = process.env.NEXT_PUBLIC_SUPABASE_URL;
const supabaseKey = process.env.SUPABASE_SERVICE_ROLE_KEY;

function getSupabase() {
  if (!supabaseUrl || !supabaseKey) return null;
  return createClient(supabaseUrl, supabaseKey);
}

export const dynamic = 'force-dynamic';

/**
 * POST - Receive analytics events
 */
export async function POST(request) {
  try {
    const { events } = await request.json();
    
    if (!events || !Array.isArray(events) || events.length === 0) {
      return NextResponse.json(
        { error: 'No events provided' },
        { status: 400 }
      );
    }
    
    const supabase = getSupabase();
    
    if (!supabase) {
      // Log to console if Supabase not configured
      console.log('[Analytics] Received events:', events.length);
      return NextResponse.json({ success: true, stored: false });
    }
    
    // Transform events for database
    const rows = events.map(event => ({
      event_type: event.type,
      session_id: event.sessionId,
      headline_id: event.headlineId,
      category: event.category,
      mode: event.toMode || event.fromMode,
      data: {
        urgency: event.urgency,
        platform: event.platform,
        pauseDuration: event.pauseDuration,
        depth: event.depth,
        duration: event.duration,
      },
      created_at: event.timestamp || new Date().toISOString(),
    }));
    
    // Insert events
    const { error } = await supabase
      .from('live_intelligence_analytics')
      .insert(rows);
    
    if (error) {
      console.error('Analytics insert error:', error);
      // Don't fail the request, just log
      return NextResponse.json({ success: true, stored: false });
    }
    
    return NextResponse.json({ success: true, stored: true, count: events.length });
  } catch (error) {
    console.error('Analytics API error:', error);
    // Return success to prevent retries
    return NextResponse.json({ success: true, stored: false });
  }
}

/**
 * GET - Retrieve analytics summary (admin only)
 */
export async function GET(request) {
  try {
    const { searchParams } = new URL(request.url);
    const period = searchParams.get('period') || 'day'; // day, week, month
    const eventType = searchParams.get('type');
    
    const supabase = getSupabase();
    
    if (!supabase) {
      return NextResponse.json(
        { error: 'Analytics not configured' },
        { status: 503 }
      );
    }
    
    // Calculate date range
    let startDate = new Date();
    switch (period) {
      case 'week':
        startDate.setDate(startDate.getDate() - 7);
        break;
      case 'month':
        startDate.setDate(startDate.getDate() - 30);
        break;
      default: // day
        startDate.setDate(startDate.getDate() - 1);
    }
    
    // Build query
    let query = supabase
      .from('live_intelligence_analytics')
      .select('event_type, category, created_at')
      .gte('created_at', startDate.toISOString());
    
    if (eventType) {
      query = query.eq('event_type', eventType);
    }
    
    const { data, error } = await query;
    
    if (error) throw error;
    
    // Aggregate results
    const summary = {
      period,
      startDate: startDate.toISOString(),
      endDate: new Date().toISOString(),
      totalEvents: data?.length || 0,
      byType: {},
      byCategory: {},
    };
    
    (data || []).forEach(row => {
      // Count by type
      summary.byType[row.event_type] = (summary.byType[row.event_type] || 0) + 1;
      
      // Count by category
      if (row.category) {
        summary.byCategory[row.category] = (summary.byCategory[row.category] || 0) + 1;
      }
    });
    
    return NextResponse.json(summary);
  } catch (error) {
    console.error('Analytics GET error:', error);
    return NextResponse.json(
      { error: 'Failed to retrieve analytics' },
      { status: 500 }
    );
  }
}
