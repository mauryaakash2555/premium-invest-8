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

function startOfWeek(d) {
  const x = new Date(d);
  x.setHours(0, 0, 0, 0);
  const day = x.getDay(); // 0 Sun..6 Sat
  const diff = (day === 0 ? -6 : 1) - day;
  x.setDate(x.getDate() + diff);
  return x;
}

export async function GET(req) {
  if (!requireCronAuth(req)) {
    return new Response('Unauthorized', { status: 401 });
  }

  const prefs = await EmailPreferencesDB.getSafe();
  if (!prefs.weekly_summary) {
    return NextResponse.json({ ok: true, sent: false, skipped: 'weekly_summary_disabled' });
  }

  const sb = supabaseAdmin();
  const now = new Date();
  const weekStart = startOfWeek(now);
  const prevWeekStart = new Date(weekStart);
  prevWeekStart.setDate(prevWeekStart.getDate() - 7);

  try {
    const [weekLeadsRes, weekHotRes, prevWeekLeadsRes, revenueRes, conversionsRes, clickPlatformsRes, questionsRes] = await Promise.all([
      sb.from('leads').select('id,created_at', { count: 'exact' }).gte('created_at', weekStart.toISOString()).limit(2000),
      sb.from('leads').select('id', { count: 'exact', head: true }).gte('created_at', weekStart.toISOString()).gte('lead_score', 80),
      sb.from('leads').select('id', { count: 'exact', head: true }).gte('created_at', prevWeekStart.toISOString()).lt('created_at', weekStart.toISOString()),
      sb
        .from('events')
        .select('data,created_at')
        .gte('created_at', weekStart.toISOString())
        .filter('event_type', 'in', '("revenue","revenue_manual")')
        .limit(5000),
      sb.from('affiliate_clicks').select('id,platform,converted,converted_at', { count: 'exact' }).eq('converted', true).gte('converted_at', weekStart.toISOString()).limit(2000),
      sb.from('affiliate_clicks').select('platform,clicked_at').gte('clicked_at', weekStart.toISOString()).limit(2000),
      sb
        .from('conversations')
        .select('message,sender,created_at')
        .gte('created_at', weekStart.toISOString())
        .eq('sender', 'user')
        .limit(1500),
    ]);

    const weekLeads = weekLeadsRes.data || [];
    const weekLeadsCount = Number(weekLeadsRes.count || weekLeads.length || 0);
    const prevCount = Number(prevWeekLeadsRes.count || 0);
    const growth = prevCount > 0 ? Math.round(((weekLeadsCount - prevCount) / prevCount) * 100) : 0;

    const revenue = (revenueRes.data || []).reduce((sum, e) => {
      const n = Number(e?.data?.amount);
      return Number.isFinite(n) ? sum + n : sum;
    }, 0);

    // Best day (by leads created_at)
    const dayCounts = new Map();
    for (const l of weekLeads) {
      const iso = String(l?.created_at || '');
      const day = iso.slice(0, 10);
      if (!day) continue;
      dayCounts.set(day, (dayCounts.get(day) || 0) + 1);
    }
    const bestDayEntry = Array.from(dayCounts.entries()).sort((a, b) => b[1] - a[1])[0] || null;

    // Best platform (by clicks)
    const platformCounts = new Map();
    for (const c of clickPlatformsRes.data || []) {
      const p = String(c?.platform || '').trim();
      if (!p) continue;
      platformCounts.set(p, (platformCounts.get(p) || 0) + 1);
    }
    const bestPlatformEntry = Array.from(platformCounts.entries()).sort((a, b) => b[1] - a[1])[0] || null;

    // Top question (by frequency)
    const qMap = new Map();
    for (const c of questionsRes.data || []) {
      const msg = String(c?.message || '').trim();
      if (!msg) continue;
      if (!msg.includes('?') && msg.length > 140) continue;
      const key = msg.toLowerCase().replace(/\s+/g, ' ').slice(0, 140);
      qMap.set(key, (qMap.get(key) || 0) + 1);
    }
    const topQuestionEntry = Array.from(qMap.entries()).sort((a, b) => b[1] - a[1])[0] || null;

    await EmailService.sendWeeklySummary({
      to: prefs.email_address,
      stats: {
        totalLeads: weekLeadsCount,
        growth,
        hotLeads: Number(weekHotRes.count || 0),
        revenue,
        conversions: Number(conversionsRes.count || 0),
        bestDay: bestDayEntry ? bestDayEntry[0] : 'N/A',
        bestDayLeads: bestDayEntry ? bestDayEntry[1] : 'N/A',
        bestPlatform: bestPlatformEntry ? bestPlatformEntry[0] : 'N/A',
        topQuestion: topQuestionEntry ? topQuestionEntry[0] : 'N/A',
        recommendations: [],
      },
    });

    return NextResponse.json({ ok: true, sent: true });
  } catch (e) {
    if (prefs.error_alerts) {
      await EmailService.sendErrorAlert({
        to: prefs.email_address,
        err: { message: String(e?.message || 'weekly_summary_failed'), location: 'cron/weekly-summary', stack: String(e?.stack || '') },
      });
    }
    return NextResponse.json({ ok: false, error: String(e?.message || 'unknown') }, { status: 500 });
  }
}
