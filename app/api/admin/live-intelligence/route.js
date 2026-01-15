/**
 * Live Intelligence Admin API
 * 
 * Full CRUD for headlines management
 * Used by /admin-secret-akash Live Intelligence tab
 * 
 * @file app/api/admin/live-intelligence/route.js
 */

import { NextResponse } from 'next/server';
import { createClient } from '@supabase/supabase-js';
import { cookies } from 'next/headers';

const supabaseUrl = process.env.NEXT_PUBLIC_SUPABASE_URL;
const supabaseKey = process.env.SUPABASE_SERVICE_ROLE_KEY;

function getSupabase() {
  if (!supabaseUrl || !supabaseKey) {
    throw new Error('Supabase not configured');
  }
  return createClient(supabaseUrl, supabaseKey);
}

// Verify admin session
async function verifyAdmin() {
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
    if (new Date(data.expires_at) < new Date()) return false;
    
    return true;
  } catch {
    return false;
  }
}

export const dynamic = 'force-dynamic';

/**
 * GET - Fetch all headlines (admin + auto-generated)
 */
export async function GET() {
  try {
    const isAdmin = await verifyAdmin();
    if (!isAdmin) {
      return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
    }
    
    const supabase = getSupabase();
    
    // Fetch from intelligence_items (auto-generated from RSS)
    const { data: autoItems, error: autoError } = await supabase
      .from('intelligence_items')
      .select('*')
      .order('created_at', { ascending: false })
      .limit(50);
    
    // Fetch from live_intelligence_headlines (admin-created)
    const { data: adminItems, error: adminError } = await supabase
      .from('live_intelligence_headlines')
      .select('*')
      .eq('is_active', true)
      .order('created_at', { ascending: false })
      .limit(50);
    
    // Combine and sort by created_at
    const combined = [
      ...(autoItems || []).map(item => ({
        id: item.id,
        headline: item.block_what_happened,
        block_what_happened: item.block_what_happened,
        why_it_matters: item.block_why_it_matters,
        block_why_it_matters: item.block_why_it_matters,
        block_where_fits: item.block_where_fits,
        category: item.category,
        urgency: item.urgency,
        source: item.source_name,
        source_name: item.source_name,
        source_url: item.source_url,
        status: item.status,
        valid_until: item.valid_until,
        created_at: item.created_at,
        type: 'auto',
      })),
      ...(adminItems || []).map(item => ({
        id: item.id,
        headline: item.headline,
        why_it_matters: item.why_it_matters,
        data_point: item.data_point,
        category: item.category,
        urgency: item.urgency,
        source: item.source,
        valid_until: item.valid_until,
        created_at: item.created_at,
        type: 'admin',
      })),
    ].sort((a, b) => new Date(b.created_at) - new Date(a.created_at));
    
    return NextResponse.json({
      ok: true,
      headlines: combined,
      counts: {
        auto: (autoItems || []).length,
        admin: (adminItems || []).length,
        total: combined.length,
      },
    });
  } catch (error) {
    console.error('Live Intelligence admin GET error:', error);
    return NextResponse.json({ error: error.message }, { status: 500 });
  }
}

/**
 * POST - Create new headline
 */
export async function POST(request) {
  try {
    const isAdmin = await verifyAdmin();
    if (!isAdmin) {
      return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
    }
    
    const body = await request.json();
    
    if (!body.headline) {
      return NextResponse.json({ error: 'Headline is required' }, { status: 400 });
    }
    
    const supabase = getSupabase();
    
    const { data, error } = await supabase
      .from('live_intelligence_headlines')
      .insert({
        headline: body.headline,
        category: body.category || 'market_update',
        urgency: body.urgency || 'medium',
        why_it_matters: body.whyItMatters || body.why_it_matters || '',
        data_point: body.dataPoint || body.data_point || '',
        source: body.source || 'Admin',
        valid_from: new Date().toISOString(),
        valid_until: body.validUntil || null,
        is_active: true,
        created_by: 'admin',
      })
      .select()
      .single();
    
    if (error) throw error;
    
    return NextResponse.json(data, { status: 201 });
  } catch (error) {
    console.error('Live Intelligence admin POST error:', error);
    return NextResponse.json({ error: error.message }, { status: 500 });
  }
}

/**
 * PUT - Update existing headline
 */
export async function PUT(request) {
  try {
    const isAdmin = await verifyAdmin();
    if (!isAdmin) {
      return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
    }
    
    const { searchParams } = new URL(request.url);
    const id = searchParams.get('id');
    
    if (!id) {
      return NextResponse.json({ error: 'ID is required' }, { status: 400 });
    }
    
    const body = await request.json();
    const supabase = getSupabase();
    
    // Check if it's an admin headline or auto-generated
    // First try admin headlines table
    const { data: adminCheck } = await supabase
      .from('live_intelligence_headlines')
      .select('id')
      .eq('id', id)
      .single();
    
    if (adminCheck) {
      // Update admin headline
      const { data, error } = await supabase
        .from('live_intelligence_headlines')
        .update({
          headline: body.headline,
          category: body.category,
          urgency: body.urgency,
          why_it_matters: body.whyItMatters || body.why_it_matters,
          data_point: body.dataPoint || body.data_point,
          source: body.source,
          valid_until: body.validUntil || null,
          updated_at: new Date().toISOString(),
        })
        .eq('id', id)
        .select()
        .single();
      
      if (error) throw error;
      return NextResponse.json(data);
    }
    
    // Try intelligence_items table (auto-generated)
    const { data: autoCheck } = await supabase
      .from('intelligence_items')
      .select('id')
      .eq('id', id)
      .single();
    
    if (autoCheck) {
      // Update auto-generated headline
      const { data, error } = await supabase
        .from('intelligence_items')
        .update({
          block_what_happened: body.headline,
          category: body.category,
          urgency: body.urgency,
          block_why_it_matters: body.whyItMatters || body.why_it_matters,
          block_where_fits: body.dataPoint || body.data_point,
          source_name: body.source,
          valid_until: body.validUntil || null,
          updated_at: new Date().toISOString(),
        })
        .eq('id', id)
        .select()
        .single();
      
      if (error) throw error;
      return NextResponse.json(data);
    }
    
    return NextResponse.json({ error: 'Headline not found' }, { status: 404 });
  } catch (error) {
    console.error('Live Intelligence admin PUT error:', error);
    return NextResponse.json({ error: error.message }, { status: 500 });
  }
}

/**
 * DELETE - Remove headline (soft delete)
 */
export async function DELETE(request) {
  try {
    const isAdmin = await verifyAdmin();
    if (!isAdmin) {
      return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
    }
    
    const { searchParams } = new URL(request.url);
    const id = searchParams.get('id');
    
    if (!id) {
      return NextResponse.json({ error: 'ID is required' }, { status: 400 });
    }
    
    const supabase = getSupabase();
    
    // Try admin headlines first
    const { data: adminCheck } = await supabase
      .from('live_intelligence_headlines')
      .select('id')
      .eq('id', id)
      .single();
    
    if (adminCheck) {
      const { error } = await supabase
        .from('live_intelligence_headlines')
        .update({ is_active: false })
        .eq('id', id);
      
      if (error) throw error;
      return NextResponse.json({ success: true });
    }
    
    // Try intelligence_items
    const { data: autoCheck } = await supabase
      .from('intelligence_items')
      .select('id')
      .eq('id', id)
      .single();
    
    if (autoCheck) {
      const { error } = await supabase
        .from('intelligence_items')
        .update({ status: 'deleted' })
        .eq('id', id);
      
      if (error) throw error;
      return NextResponse.json({ success: true });
    }
    
    return NextResponse.json({ error: 'Headline not found' }, { status: 404 });
  } catch (error) {
    console.error('Live Intelligence admin DELETE error:', error);
    return NextResponse.json({ error: error.message }, { status: 500 });
  }
}
