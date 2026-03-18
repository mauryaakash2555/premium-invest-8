import { NextResponse } from 'next/server';
import { createClient } from '@supabase/supabase-js';

function getSupabase() {
  const url = process.env.NEXT_PUBLIC_SUPABASE_URL;
  const key = process.env.SUPABASE_SERVICE_ROLE_KEY;
  if (!url || !key) return null;
  return createClient(url, key, { auth: { persistSession: false } });
}

async function resolveCanonicalPostId(supabase, identifier) {
  const safe = String(identifier || '').trim();
  if (!safe) return { canonicalId: '', canonicalSlug: '' };

  try {
    const { data: rows } = await supabase
      .from('posts')
      .select('id,slug')
      .or(`id.eq.${safe},slug.eq.${safe}`)
      .limit(1);
    const row = Array.isArray(rows) ? rows[0] : null;
    if (row?.id) {
      return { canonicalId: String(row.id), canonicalSlug: String(row.slug || '') };
    }
  } catch {
    // ignore
  }

  // Fallback for curated/local posts (no posts row)
  return { canonicalId: safe, canonicalSlug: '' };
}

// GET comments for a post
export async function GET(request, { params }) {
  try {
    const { postId } = await params;
    
    if (!postId) {
      return NextResponse.json(
        { error: 'Post ID is required' },
        { status: 400 }
      );
    }

    const supabase = getSupabase();
    if (!supabase) {
      console.error('[Comments API] Supabase env not configured');
      return NextResponse.json([], { status: 200, headers: { 'Cache-Control': 'no-store', 'X-Comments-Count': '0' } });
    }

    const identifier = String(postId || '').trim();
    const { canonicalId } = await resolveCanonicalPostId(supabase, identifier);
    const ids = Array.from(new Set([canonicalId, identifier].filter(Boolean)));

    // Fetch approved comments
    const { data, error, count } = await supabase
      .from('comments')
      .select('*', { count: 'exact' })
      .in('post_id', ids)
      .eq('status', 'approved')
      .order('created_at', { ascending: false });

    if (error) {
      console.error('[Comments API] Supabase error:', error);
      return NextResponse.json([], { status: 200, headers: { 'Cache-Control': 'no-store', 'X-Comments-Count': '0' } });
    }

    return NextResponse.json(data || [], {
      status: 200,
      headers: {
        'Cache-Control': 'no-store',
        'X-Comments-Count': String(count || 0),
      },
    });

  } catch (error) {
    console.error('[Comments API] GET error:', error);
    // Return empty comments on error to prevent UI breakage
    return NextResponse.json([], { status: 200, headers: { 'Cache-Control': 'no-store', 'X-Comments-Count': '0' } });
  }
}

// POST a new comment
export async function POST(request, { params }) {
  try {
    const { postId } = await params;
    const body = await request.json();

    if (!postId) {
      return NextResponse.json(
        { error: 'Post ID is required' },
        { status: 400 }
      );
    }

    const supabase = getSupabase();
    if (!supabase) {
      console.error('[Comments API] Supabase env not configured');
      return NextResponse.json(
        { error: 'Comments service unavailable' },
        { status: 503 }
      );
    }

    const identifier = String(postId || '').trim();
    const { canonicalId } = await resolveCanonicalPostId(supabase, identifier);

    // Validate required fields (support legacy keys too)
    const author_name = body?.author_name ?? body?.name;
    const author_email = body?.author_email ?? body?.email;
    const comment_text = body?.comment_text ?? body?.comment;
    
    if (!author_name || !author_email || !comment_text) {
      return NextResponse.json(
        { error: 'Name, email, and comment are required' },
        { status: 400 }
      );
    }

    // Basic email validation
    const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
    if (!emailRegex.test(author_email)) {
      return NextResponse.json(
        { error: 'Invalid email format' },
        { status: 400 }
      );
    }

    // Sanitize comment (basic XSS prevention)
    const sanitizedComment = comment_text
      .replace(/</g, '&lt;')
      .replace(/>/g, '&gt;')
      .trim();

    if (sanitizedComment.length < 3) {
      return NextResponse.json(
        { error: 'Comment too short' },
        { status: 400 }
      );
    }

    if (sanitizedComment.length > 5000) {
      return NextResponse.json(
        { error: 'Comment too long (max 5000 characters)' },
        { status: 400 }
      );
    }

    // Get IP and User Agent
    const ip_address = request.headers.get('x-forwarded-for') || 
                      request.headers.get('x-real-ip') || 
                      'unknown';
    const user_agent = request.headers.get('user-agent') || 'unknown';

    // Insert comment (auto-approved for now, add moderation later)
    const { data, error } = await supabase
      .from('comments')
      .insert({
        post_id: canonicalId,
        author_name: author_name.trim(),
        author_email: author_email.trim().toLowerCase(),
        comment_text: sanitizedComment,
        status: 'approved', // Change to 'pending' if you want moderation
        ip_address,
        user_agent,
      })
      .select()
      .single();

    if (error) {
      console.error('[Comments API] Insert error:', error);
      return NextResponse.json(
        { error: 'Failed to post comment' },
        { status: 500 }
      );
    }

    return NextResponse.json({
      success: true,
      message: 'Comment posted successfully',
      comment: data,
    });

  } catch (error) {
    console.error('[Comments API] POST error:', error);
    return NextResponse.json(
      { error: 'Failed to submit comment. Please try again.' },
      { status: 500 }
    );
  }
}
