import { NextResponse } from 'next/server';
import { EmailService } from '@/lib/email/emailService';
import { EmailPreferencesDB } from '@/lib/db/emailPreferences';
import { supabaseAdmin } from '@/lib/supabaseAdmin';

function requireCronAuth(req) {
  const h = req.headers.get('authorization') || '';
  const secret = String(process.env.CRON_SECRET || '').trim();
  if (!secret) return false;
  return h === `Bearer ${secret}`;
}

export async function GET(req) {
  if (!requireCronAuth(req)) {
    return new Response('Unauthorized', { status: 401 });
  }

  const prefs = await EmailPreferencesDB.getSafe();
  if (!prefs.daily_summary) {
    return NextResponse.json({ ok: true, sent: false, skipped: 'daily_summary_disabled' });
  }

  const sb = supabaseAdmin();
  const dayStart = new Date();
  dayStart.setHours(0, 0, 0, 0);
  const sinceIso = dayStart.toISOString();

  try {
    const [leadsRes, hotRes, convRes, revenueRes, clicksRes, questionsRes] = await Promise.all([
      sb.from('leads').select('id', { count: 'exact', head: true }).gte('created_at', sinceIso),
      sb.from('leads').select('id', { count: 'exact', head: true }).gte('created_at', sinceIso).gte('lead_score', 80),
      sb.from('conversations').select('id', { count: 'exact', head: true }).gte('created_at', sinceIso),
      sb
        .from('events')
        .select('data,created_at')
        .gte('created_at', sinceIso)
        .filter('event_type', 'in', '("revenue","revenue_manual")')
        .limit(1000),
      sb.from('affiliate_clicks').select('id', { count: 'exact', head: true }).gte('clicked_at', sinceIso),
      sb
        .from('conversations')
        .select('message,sender,created_at')
        .gte('created_at', sinceIso)
        .eq('sender', 'user')
        .limit(500),
    ]);

    const revenue = (revenueRes.data || []).reduce((sum, e) => {
      const n = Number(e?.data?.amount);
      return Number.isFinite(n) ? sum + n : sum;
    }, 0);

    const qMap = new Map();
    for (const c of questionsRes.data || []) {
      const msg = String(c?.message || '').trim();
      if (!msg) continue;
      if (!msg.includes('?') && msg.length > 140) continue;
      const key = msg.toLowerCase().replace(/\s+/g, ' ').slice(0, 140);
      qMap.set(key, (qMap.get(key) || 0) + 1);
    }
    const topQuestions = Array.from(qMap.entries())
      .sort((a, b) => b[1] - a[1])
      .slice(0, 5)
      .map(([q]) => q);

    await EmailService.sendDailySummary({
      to: prefs.email_address,
      stats: {
        leads: Number(leadsRes.count || 0),
        hotLeads: Number(hotRes.count || 0),
        conversations: Number(convRes.count || 0),
        revenue,
        affiliateClicks: Number(clicksRes.count || 0),
        topQuestions,
      },
    });

    return NextResponse.json({ ok: true, sent: true });
  } catch (e) {
    if (prefs.error_alerts) {
      await EmailService.sendErrorAlert({
        to: prefs.email_address,
        err: { message: String(e?.message || 'daily_summary_failed'), location: 'cron/daily-summary', stack: String(e?.stack || '') },
      });
    }
    return NextResponse.json({ ok: false, error: String(e?.message || 'unknown') }, { status: 500 });
  }
}
