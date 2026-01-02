import { NextResponse } from 'next/server';
import { cookies, headers } from 'next/headers';
import { z } from 'zod';
import { isAdminFromRequest } from '@/lib/adminSession';
import { EmailPreferencesDB } from '@/lib/db/emailPreferences';

const prefsSchema = z.object({
  email_address: z.string().email().max(200),
  hot_lead_alerts: z.boolean().optional(),
  daily_summary: z.boolean().optional(),
  weekly_summary: z.boolean().optional(),
  conversion_alerts: z.boolean().optional(),
  error_alerts: z.boolean().optional(),
});

export async function GET() {
  const cookieStore = await cookies();
  const headerStore = await headers();
  if (!isAdminFromRequest(cookieStore, headerStore)) {
    return NextResponse.json({ ok: false, error: 'unauthorized' }, { status: 401 });
  }

  const prefs = await EmailPreferencesDB.getSafe();
  return NextResponse.json({ ok: true, prefs });
}

export async function POST(req) {
  const cookieStore = await cookies();
  const headerStore = await headers();
  if (!isAdminFromRequest(cookieStore, headerStore)) {
    return NextResponse.json({ ok: false, error: 'unauthorized' }, { status: 401 });
  }

  const body = await req.json().catch(() => ({}));
  const parsed = prefsSchema.safeParse(body);
  if (!parsed.success) {
    return NextResponse.json({ ok: false, error: 'bad_request' }, { status: 400 });
  }

  try {
    const prefs = await EmailPreferencesDB.upsert(parsed.data);
    return NextResponse.json({ ok: true, prefs });
  } catch (e) {
    return NextResponse.json({ ok: false, error: String(e?.message || 'unknown') }, { status: 500 });
  }
}
