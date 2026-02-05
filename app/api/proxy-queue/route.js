import { NextResponse } from "next/server";
import { cookies, headers } from 'next/headers';
import { isAdminFromRequest } from '@/lib/adminSession';
import { supabaseAdmin } from '@/lib/supabaseAdmin';

function json(status, body) {
  return NextResponse.json(body, {
    status,
    headers: {
      "Cache-Control": "no-store",
      "X-Deprecated-Endpoint": "true",
    },
  });
}

export async function GET() {
  try {
    const cookieStore = await cookies();
    const headerStore = await headers();
    if (!isAdminFromRequest(cookieStore, headerStore)) {
      return json(401, { ok: false, error: 'unauthorized', submissions: [] });
    }

    let sb;
    try {
      sb = supabaseAdmin();
    } catch {
      return json(503, { ok: false, error: 'setup_required', submissions: [] });
    }

    const { data, error } = await sb
      .from('posts')
      .select('*')
      .eq('status', 'PENDING')
      .order('created_at', { ascending: false })
      .limit(120);

    if (error) return json(500, { error: 'Failed to fetch queue', submissions: [] });

    const submissions = (Array.isArray(data) ? data : []).map((r) => ({
      _id: String(r.id || r._id || ''),
      type: String(r.pillar || r.type || 'EDITORIAL').toUpperCase() === 'IMPACT' ? 'impact' : 'guest',
      title: r.title || 'Untitled',
      author_name: r.author_name || 'Unknown',
      author_email: r.author_email || '',
      submitted_at: r.created_at || new Date().toISOString(),
      incident_description: r.incident_description || r.content_original || '',
      article_content: r.article_content || r.content_original || '',
      location: r.location || '',
      evidence: r.evidence || '',
      visual_keywords: r.visual_keywords || r.location_tag || '',
      expertise_area: r.expertise_area || '',
      author_credentials: r.author_credentials || '',
      author_bio: r.author_bio || '',
      author_linkedin: r.author_linkedin || '',
      sources_references: r.sources_references || '',
    }));

    return json(200, { submissions });
  } catch {
    return json(500, { error: 'Failed to fetch queue', submissions: [] });
  }
}
