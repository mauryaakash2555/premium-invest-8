/**
 * Expiry Monitoring Cron Job
 * 
 * Runs ONCE DAILY at 8 AM UTC (1:30 PM IST) to:
 * 1. Check for expired headlines
 * 2. Send alert ONLY if situation is genuinely critical
 * 3. Auto-delete old expired headlines
 * 4. Log to Supabase
 * 
 * Vercel Cron: 0 8 * * * (once per day)
 * Throttle: max 1 email per 12 hours
 */

import { NextResponse } from 'next/server';
import { createClient } from '@supabase/supabase-js';
import { sendExpiryAlert } from '@/lib/monitoring/email-alerts';

export const dynamic = 'force-dynamic';
export const maxDuration = 30;

const supabaseUrl = process.env.NEXT_PUBLIC_SUPABASE_URL;
const supabaseKey = process.env.SUPABASE_SERVICE_ROLE_KEY;

function getSupabase() {
  if (!supabaseUrl || !supabaseKey) return null;
  return createClient(supabaseUrl, supabaseKey);
}

export async function GET(request) {
  // Verify cron secret
  const authHeader = request.headers.get('authorization');
  const cronSecret = process.env.CRON_SECRET;
  
  if (cronSecret && authHeader !== `Bearer ${cronSecret}`) {
    return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
  }

  const supabase = getSupabase();
  if (!supabase) {
    return NextResponse.json({ error: 'Database not configured' }, { status: 500 });
  }

  try {
    const now = new Date();
    const oneHourAgo = new Date(now.getTime() - 60 * 60 * 1000);
    const oneWeekAgo = new Date(now.getTime() - 7 * 24 * 60 * 60 * 1000);

    // Count headlines that expired in the last hour
    const { count: recentlyExpired } = await supabase
      .from('intelligence_items')
      .select('*', { count: 'exact', head: true })
      .lt('valid_until', now.toISOString())
      .gte('valid_until', oneHourAgo.toISOString());

    // Count total active headlines
    const { count: activeHeadlines } = await supabase
      .from('intelligence_items')
      .select('*', { count: 'exact', head: true })
      .or(`valid_until.is.null,valid_until.gt.${now.toISOString()}`);

    // Count total expired headlines
    const { count: totalExpired } = await supabase
      .from('intelligence_items')
      .select('*', { count: 'exact', head: true })
      .lt('valid_until', now.toISOString());

    // ── Throttle: check if we already sent an alert in the last 12 hours ──
    const twelveHoursAgo = new Date(now.getTime() - 12 * 60 * 60 * 1000);
    const { count: recentAlerts } = await supabase
      .from('processing_logs')
      .select('*', { count: 'exact', head: true })
      .eq('type', 'expiry_check')
      .gte('created_at', twelveHoursAgo.toISOString())
      .not('details->alert_sent', 'eq', false);

    const alreadySentRecently = (recentAlerts || 0) > 0;

    // Only alert if truly critical AND no recent alert sent:
    // - More than 25 headlines expired in the last hour, OR
    // - Active headlines dropped below 3 (site nearly empty)
    let alertSent = false;
    if (!alreadySentRecently) {
      if (recentlyExpired > 25 || activeHeadlines < 3) {
        await sendExpiryAlert(recentlyExpired || 0, activeHeadlines);
        alertSent = true;
      }
    }

    // Auto-delete headlines expired more than 1 week ago
    const { count: deleted } = await supabase
      .from('intelligence_items')
      .delete()
      .lt('valid_until', oneWeekAgo.toISOString())
      .select('*', { count: 'exact', head: true });

    // Log this check to Supabase
    await supabase.from('processing_logs').insert({
      type: 'expiry_check',
      created_at: now.toISOString(),
      details: {
        recently_expired: recentlyExpired || 0,
        total_expired: totalExpired || 0,
        active: activeHeadlines || 0,
        deleted: deleted || 0,
        alert_sent: alertSent,
      },
    });

    return NextResponse.json({
      success: true,
      timestamp: now.toISOString(),
      stats: {
        recently_expired: recentlyExpired || 0,
        total_expired: totalExpired || 0,
        active: activeHeadlines || 0,
        deleted: deleted || 0,
      },
      alert_sent: alertSent,
    });
  } catch (error) {
    console.error('Expiry check failed:', error);
    return NextResponse.json({
      success: false,
      error: error.message,
    }, { status: 500 });
  }
}
