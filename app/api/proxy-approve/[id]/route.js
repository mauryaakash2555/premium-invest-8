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

export async function POST(req, { params }) {
  const id = (await params)?.id;
  let payload;
  try {
    payload = await req.json();
  } catch {
    return json(400, { success: false, detail: "Invalid JSON" });
  }

  try {
    const cookieStore = await cookies();
    const headerStore = await headers();
    if (!isAdminFromRequest(cookieStore, headerStore)) {
      return json(401, { ok: false, error: 'unauthorized' });
    }

    let sb;
    try {
      sb = supabaseAdmin();
    } catch {
      return json(503, { ok: false, error: 'setup_required' });
    }

    const safeId = String(id || '').trim();
    if (!safeId) return json(400, { error: 'Post ID is required' });

    const updated = {
      status: 'APPROVED',
      approved_at: new Date().toISOString(),
      content_enhanced: payload?.content_enhanced,
      image_url: payload?.image_url,
      affiliate_link: payload?.affiliate_link,
      sponsored_by: payload?.sponsored_by,
      tags: payload?.tags_to_add || [],
    };

    const { error } = await sb.from('posts').update(updated).eq('id', safeId);
    if (error) return json(500, { success: false, detail: 'Approve failed' });
    return json(200, { success: true });
  } catch {
    return json(500, { success: false, detail: 'Approve failed' });
  }
}
