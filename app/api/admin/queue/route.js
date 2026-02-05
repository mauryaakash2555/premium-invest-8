import { NextResponse } from 'next/server';
import { cookies, headers } from 'next/headers';
import { isAdminFromRequest } from '@/lib/adminSession';
import { supabaseAdmin } from '@/lib/supabaseAdmin';

export const runtime = 'nodejs';

export async function GET() {
  try {
    const cookieStore = await cookies();
    const headerStore = await headers();
    if (!isAdminFromRequest(cookieStore, headerStore)) {
      return NextResponse.json({ ok: false, error: 'unauthorized', submissions: [] }, { status: 401 });
    }

    try {
      supabaseAdmin();
    } catch {
      return NextResponse.json({ ok: false, error: 'setup_required', submissions: [] }, { status: 503 });
    }

    const sb = supabaseAdmin();

    const { data, error } = await sb
      .from('posts')
      .select('*')
      .eq('status', 'PENDING')
      .order('created_at', { ascending: false })
      .limit(120);

    if (error) {
      console.error('Queue fetch error:', error);
      return NextResponse.json({ error: 'Failed to fetch queue', submissions: [] }, { status: 500 });
    }

    const submissions = (Array.isArray(data) ? data : []).map((row) => {
      const r = row && typeof row === 'object' ? row : {};
      const pillar = String(r.pillar || r.type || 'EDITORIAL').toUpperCase();
      const type = pillar === 'IMPACT' ? 'impact' : pillar === 'GUEST' ? 'guest' : pillar === 'DEV' ? 'dev' : 'editorial';

      const baseOriginal = String(r.content_original || '').trim();
      const incident = String(r.incident_description || r.what_happened || baseOriginal || '').trim();
      const article = String(r.article_content || baseOriginal || '').trim();

      return {
        _id: String(r.id || r._id || ''),
        type,
        title: String(r.title || 'Untitled'),
        author_name: String(r.author_name || 'Unknown'),
        author_email: String(r.author_email || ''),
        submitted_at: String(r.created_at || r.submitted_at || r.received_at || new Date().toISOString()),

        // Impact-specific fields
        incident_description: incident,
        location: String(r.location || r.where_happened || ''),
        evidence: String(r.evidence || r.evidence_proof || ''),
        impact_result: String(r.impact_result || ''),
        people_affected: String(r.people_affected || r.who_affected || ''),
        proposed_solution: String(r.proposed_solution || ''),
        publish_anonymously: Boolean(r.anonymous || r.publish_anonymously),
        visual_keywords: String(r.visual_keywords || r.location_tag || ''),

        // Guest-specific fields
        article_content: article,
        expertise_area: String(r.expertise_area || ''),
        author_credentials: String(r.author_credentials || ''),
        author_bio: String(r.author_bio || ''),
        author_linkedin: String(r.author_linkedin || ''),
        sources_references: String(r.sources_references || ''),
      };
    });

    return NextResponse.json({ submissions });

  } catch (error) {
    console.error('Queue fetch error:', error);
    return NextResponse.json(
      { error: 'Failed to fetch queue', submissions: [] },
      { status: 500 }
    );
  }
}
