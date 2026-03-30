/**
 * Backfill missing images for existing Live Intelligence headlines.
 *
 * POST /api/admin/live-intelligence/backfill-images
 *
 * Fetches all admin headlines that have NULL image_url, then auto-fetches
 * an image for each via Unsplash and updates the row.
 */

import { NextResponse } from 'next/server';
import { createClient } from '@supabase/supabase-js';
import { cookies } from 'next/headers';
import { getHeadlineImage } from '@/lib/images/unsplash';

const supabaseUrl = process.env.NEXT_PUBLIC_SUPABASE_URL;
const supabaseKey = process.env.SUPABASE_SERVICE_ROLE_KEY;

function getSupabase() {
  if (!supabaseUrl || !supabaseKey) {
    throw new Error('Supabase not configured');
  }
  return createClient(supabaseUrl, supabaseKey);
}

async function verifyAdmin() {
  try {
    const cookieStore = await cookies();
    const sessionToken = cookieStore.get('admin_session')?.value;
    if (!sessionToken) return false;
    const supabase = getSupabase();
    const { data } = await supabase
      .from('admin_sessions')
      .select('id')
      .eq('session_token', sessionToken)
      .gt('expires_at', new Date().toISOString())
      .single();
    return Boolean(data);
  } catch {
    return false;
  }
}

export async function POST() {
  try {
    const isAdmin = await verifyAdmin();
    if (!isAdmin) {
      return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
    }

    const supabase = getSupabase();

    // Fetch headlines with missing images
    const { data: rows, error: fetchErr } = await supabase
      .from('live_intelligence_headlines')
      .select('id, headline, category')
      .is('image_url', null)
      .eq('is_active', true)
      .order('created_at', { ascending: false })
      .limit(50);

    if (fetchErr) throw fetchErr;
    if (!rows || rows.length === 0) {
      return NextResponse.json({ ok: true, updated: 0, message: 'All headlines already have images' });
    }

    let updated = 0;
    const errors = [];

    for (const row of rows) {
      try {
        const imageUrl = await getHeadlineImage(row.headline, row.category || 'market');
        if (imageUrl) {
          const { error: updErr } = await supabase
            .from('live_intelligence_headlines')
            .update({ image_url: imageUrl, updated_at: new Date().toISOString() })
            .eq('id', row.id);

          if (updErr) {
            errors.push({ id: row.id, error: updErr.message });
          } else {
            updated++;
          }
        }
      } catch (e) {
        errors.push({ id: row.id, error: e.message });
      }
    }

    return NextResponse.json({
      ok: true,
      total: rows.length,
      updated,
      errors: errors.length > 0 ? errors : undefined,
    });
  } catch (error) {
    console.error('Backfill images error:', error);
    return NextResponse.json({ error: error.message }, { status: 500 });
  }
}
