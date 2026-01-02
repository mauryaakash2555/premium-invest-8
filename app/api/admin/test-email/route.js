import { NextResponse } from 'next/server';
import { cookies, headers } from 'next/headers';
import { z } from 'zod';
import { isAdminFromRequest } from '@/lib/adminSession';
import { EmailPreferencesDB } from '@/lib/db/emailPreferences';
import { EmailService } from '@/lib/email/emailService';

const reqSchema = z.object({
  type: z.enum(['hot_lead', 'daily_summary', 'conversion', 'error']),
});

export async function POST(req) {
  const cookieStore = await cookies();
  const headerStore = await headers();
  if (!isAdminFromRequest(cookieStore, headerStore)) {
    return NextResponse.json({ ok: false, error: 'unauthorized' }, { status: 401 });
  }

  const body = await req.json().catch(() => ({}));
  const parsed = reqSchema.safeParse(body);
  if (!parsed.success) {
    return NextResponse.json({ ok: false, error: 'bad_request' }, { status: 400 });
  }

  const prefs = await EmailPreferencesDB.getSafe();
  const to = prefs.email_address;

  try {
    let result = null;

    if (parsed.data.type === 'hot_lead') {
      result = await EmailService.sendHotLeadAlert({
        to,
        lead: {
          name: 'Test User',
          email: 'test@example.com',
          phone: '9999999999',
          lead_score: 95,
          created_at: new Date().toISOString(),
          last_message: 'I want to invest ₹10 lakh',
        },
      });
    }

    if (parsed.data.type === 'daily_summary') {
      result = await EmailService.sendDailySummary({
        to,
        stats: {
          leads: 12,
          hotLeads: 3,
          conversations: 45,
          revenue: 8500,
          affiliateClicks: 15,
          topQuestions: ['What is SIP?', 'How to invest?', 'How does insurance work?'],
        },
      });
    }

    if (parsed.data.type === 'conversion') {
      result = await EmailService.sendConversionAlert({
        to,
        conversion: {
          platform: 'Zerodha',
          leadName: 'Test User',
          amount: 500,
          converted_at: new Date().toISOString(),
        },
      });
    }

    if (parsed.data.type === 'error') {
      result = await EmailService.sendErrorAlert({
        to,
        err: {
          message: 'Test error alert',
          location: 'admin/test-email',
          stack: 'Test stack trace',
        },
      });
    }

    if (result?.ok) {
      return NextResponse.json({ ok: true, sent: true });
    }

    if (result?.skipped) {
      return NextResponse.json(
        {
          ok: false,
          sent: false,
          skipped: true,
          reason: String(result?.reason || 'skipped'),
        },
        { status: 503 }
      );
    }

    const errMsg = result?.error?.message ? String(result.error.message) : String(result?.error || 'send_failed');
    return NextResponse.json({ ok: false, sent: false, error: errMsg }, { status: 500 });
  } catch (e) {
    return NextResponse.json({ ok: false, error: String(e?.message || 'unknown') }, { status: 500 });
  }
}
