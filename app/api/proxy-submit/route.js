import { NextResponse } from "next/server";
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

export async function POST(req) {
  let payload;
  try {
    payload = await req.json();
  } catch {
    return json(400, { success: false, detail: "Invalid JSON" });
  }

  try {
    let sb;
    try {
      sb = supabaseAdmin();
    } catch {
      return json(503, { success: false, detail: 'setup_required' });
    }

    if (!payload?.title || !payload?.author_email) {
      return json(400, { success: false, detail: 'Missing required fields' });
    }

    const pillar = String(payload?.type || '').toLowerCase() === 'impact' ? 'IMPACT' : 'GUEST';
    const contentOriginal = String(payload?.article_content || payload?.what_happened || payload?.incident_description || '');

    await sb
      .from('posts')
      .insert({
        pillar,
        status: 'PENDING',
        title: payload.title,
        author_name: payload.author_name || null,
        author_email: payload.author_email,
        author_phone: payload.author_phone || null,
        content_original: contentOriginal,
        content_enhanced: null,
        tags: [],
        views: 0,
      })
      .throwOnError();

    return json(200, { success: true });
  } catch {
    return json(500, { success: false, detail: 'Submit failed' });
  }
}
