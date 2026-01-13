/**
 * Admin Headlines API for Live Intelligence
 * 
 * Allows admins to manually create, update, and manage headlines.
 * Uses Supabase for storage.
 * 
 * @file app/api/admin/headlines/route.js
 * @created January 13, 2026
 */

import { NextResponse } from 'next/server';
import { createClient } from '@supabase/supabase-js';
import { cookies } from 'next/headers';

// Supabase client
const supabaseUrl = process.env.NEXT_PUBLIC_SUPABASE_URL;
const supabaseKey = process.env.SUPABASE_SERVICE_ROLE_KEY;

function getSupabase() {
  if (!supabaseUrl || !supabaseKey) {
    throw new Error('Supabase not configured');
  }
  return createClient(supabaseUrl, supabaseKey);
}

// Verify admin session
async function verifyAdmin(request) {
  try {
    const cookieStore = await cookies();
    const sessionToken = cookieStore.get('admin_session')?.value;
    
    if (!sessionToken) return false;
    
    const supabase = getSupabase();
    const { data, error } = await supabase
      .from('admin_sessions')
      .select('*')
      .eq('token', sessionToken)
      .single();
    
    if (error || !data) return false;
    
    // Check if session is expired
    if (new Date(data.expires_at) < new Date()) return false;
    
    return true;
  } catch {
    return false;
  }
}

export const dynamic = 'force-dynamic';

/**
 * GET - Fetch all active headlines
 */
export async function GET(request) {
  try {
    const supabase = getSupabase();
    
    const { data, error } = await supabase
      .from('live_intelligence_headlines')
      .select('*')
      .eq('is_active', true)
      .order('created_at', { ascending: false })
      .limit(20);
    
    if (error) throw error;
    
    // Transform to frontend format
    const headlines = (data || []).map(row => ({
      id: row.id,
      category: row.category,
      icon: row.icon,
      headline: row.headline,
      whyItMatters: row.why_it_matters,
      urgency: row.urgency,
      timestamp: row.created_at,
      dataPoint: row.data_point,
      source: row.source,
      ctaButton: row.cta_button,
      validFrom: row.valid_from,
      validUntil: row.valid_until,
      isAdmin: true,
    }));
    
    return NextResponse.json(headlines);
  } catch (error) {
    console.error('Failed to fetch admin headlines:', error);
    
    // Return empty array on error (graceful degradation)
    return NextResponse.json([]);
  }
}

/**
 * POST - Create new headline (admin only)
 */
export async function POST(request) {
  try {
    // Verify admin
    const isAdmin = await verifyAdmin(request);
    if (!isAdmin) {
      return NextResponse.json(
        { error: 'Unauthorized' },
        { status: 401 }
      );
    }
    
    const body = await request.json();
    
    // Validate required fields
    const required = ['category', 'headline', 'urgency'];
    for (const field of required) {
      if (!body[field]) {
        return NextResponse.json(
          { error: `Missing required field: ${field}` },
          { status: 400 }
        );
      }
    }
    
    const supabase = getSupabase();
    
    const { data, error } = await supabase
      .from('live_intelligence_headlines')
      .insert({
        category: body.category,
        icon: body.icon || '📰',
        headline: body.headline,
        why_it_matters: body.whyItMatters || body.why_it_matters,
        urgency: body.urgency,
        data_point: body.dataPoint || body.data_point,
        source: body.source || 'Admin',
        cta_button: body.ctaButton || body.cta_button,
        valid_from: body.validFrom || new Date().toISOString(),
        valid_until: body.validUntil,
        is_active: true,
        created_by: 'admin',
      })
      .select()
      .single();
    
    if (error) throw error;
    
    return NextResponse.json(data, { status: 201 });
  } catch (error) {
    console.error('Failed to create headline:', error);
    return NextResponse.json(
      { error: 'Failed to create headline' },
      { status: 500 }
    );
  }
}

/**
 * DELETE - Remove headline (admin only)
 */
export async function DELETE(request) {
  try {
    const isAdmin = await verifyAdmin(request);
    if (!isAdmin) {
      return NextResponse.json(
        { error: 'Unauthorized' },
        { status: 401 }
      );
    }
    
    const { searchParams } = new URL(request.url);
    const id = searchParams.get('id');
    
    if (!id) {
      return NextResponse.json(
        { error: 'Missing headline ID' },
        { status: 400 }
      );
    }
    
    const supabase = getSupabase();
    
    // Soft delete (set is_active to false)
    const { error } = await supabase
      .from('live_intelligence_headlines')
      .update({ is_active: false })
      .eq('id', id);
    
    if (error) throw error;
    
    return NextResponse.json({ success: true });
  } catch (error) {
    console.error('Failed to delete headline:', error);
    return NextResponse.json(
      { error: 'Failed to delete headline' },
      { status: 500 }
    );
  }
}
