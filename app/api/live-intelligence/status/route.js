/**
 * Live Intelligence Status API
 * 
 * Returns system health and processing stats
 * For Admin Panel transparency dashboard
 */

import { NextResponse } from 'next/server';
import { createClient } from '@supabase/supabase-js';

export const dynamic = 'force-dynamic';

const supabaseUrl = process.env.NEXT_PUBLIC_SUPABASE_URL;
const supabaseKey = process.env.SUPABASE_SERVICE_ROLE_KEY;

function getSupabase() {
  if (!supabaseUrl || !supabaseKey) return null;
  return createClient(supabaseUrl, supabaseKey);
}

/**
 * Get IST time formatted
 */
function getISTTime(date = new Date()) {
  const istOffset = 5.5 * 60 * 60 * 1000;
  const ist = new Date(date.getTime() + istOffset - date.getTimezoneOffset() * 60000);
  return ist.toLocaleString('en-IN', {
    hour: '2-digit',
    minute: '2-digit',
    hour12: true,
    day: 'numeric',
    month: 'short',
  });
}

export async function GET() {
  const supabase = getSupabase();
  
  if (!supabase) {
    return NextResponse.json({
      success: false,
      error: 'Database not configured',
    }, { status: 500 });
  }

  try {
    const now = new Date();
    const oneDayAgo = new Date(now.getTime() - 24 * 60 * 60 * 1000);
    const oneHourAgo = new Date(now.getTime() - 60 * 60 * 1000);

    // Get processing logs from last 24 hours
    const { data: logs, error: logsError } = await supabase
      .from('processing_logs')
      .select('*')
      .gte('created_at', oneDayAgo.toISOString())
      .order('created_at', { ascending: false });

    // Get headline counts
    const { count: totalHeadlines } = await supabase
      .from('intelligence_items')
      .select('*', { count: 'exact', head: true })
      .gte('created_at', oneDayAgo.toISOString());

    const { count: activeHeadlines } = await supabase
      .from('intelligence_items')
      .select('*', { count: 'exact', head: true })
      .or(`valid_until.is.null,valid_until.gt.${now.toISOString()}`);

    const { count: expiredHeadlines } = await supabase
      .from('intelligence_items')
      .select('*', { count: 'exact', head: true })
      .lt('valid_until', now.toISOString());

    // Get last ingest time
    const { data: lastIngest } = await supabase
      .from('processing_logs')
      .select('created_at')
      .eq('type', 'ingest')
      .order('created_at', { ascending: false })
      .limit(1)
      .single();

    // Get last process time
    const { data: lastProcess } = await supabase
      .from('processing_logs')
      .select('created_at, details')
      .eq('type', 'process')
      .order('created_at', { ascending: false })
      .limit(1)
      .single();

    // Calculate AI breakdown from logs
    const aiBreakdown = {
      groq_calls: 0,
      gemini_calls: 0,
      claude_calls: 0,
    };

    if (logs) {
      for (const log of logs) {
        if (log.details?.groq_calls) aiBreakdown.groq_calls += log.details.groq_calls;
        if (log.details?.gemini_calls) aiBreakdown.gemini_calls += log.details.gemini_calls;
        if (log.details?.claude_calls) aiBreakdown.claude_calls += log.details.claude_calls;
      }
    }

    // Estimate cost (rough approximation)
    // Groq: ~₹0.05 per call, Gemini: ₹0.10 per call, Claude: ₹0.15 per call
    const estimatedCost = (
      (aiBreakdown.groq_calls * 0.05) +
      (aiBreakdown.gemini_calls * 0.10) +
      (aiBreakdown.claude_calls * 0.15)
    ).toFixed(2);

    // Calculate next run times
    const nextIngest = new Date(now);
    nextIngest.setMinutes(Math.ceil(nextIngest.getMinutes() / 30) * 30, 0, 0);
    
    const nextProcess = new Date(now);
    nextProcess.setMinutes(Math.ceil(nextProcess.getMinutes() / 15) * 15, 0, 0);

    // Get recent errors
    const { data: recentErrors } = await supabase
      .from('system_alerts')
      .select('*')
      .gte('created_at', oneHourAgo.toISOString())
      .order('created_at', { ascending: false })
      .limit(5);

    // Build status response
    const status = {
      success: true,
      timestamp: now.toISOString(),
      timestamp_ist: getISTTime(now),
      
      // Last runs
      last_ingest: lastIngest?.created_at ? getISTTime(new Date(lastIngest.created_at)) : 'Never',
      last_process: lastProcess?.created_at ? getISTTime(new Date(lastProcess.created_at)) : 'Never',
      
      // Next runs
      next_ingest: getISTTime(nextIngest),
      next_process: getISTTime(nextProcess),
      
      // Headline stats
      headlines: {
        total_24h: totalHeadlines || 0,
        active: activeHeadlines || 0,
        expired: expiredHeadlines || 0,
        processed: lastProcess?.details?.processed || 0,
        rejected: lastProcess?.details?.rejected || 0,
      },
      
      // AI usage
      ai_breakdown: aiBreakdown,
      cost_estimate: `₹${estimatedCost}`,
      
      // Recent errors
      recent_errors: recentErrors?.length || 0,
      errors: recentErrors?.map(e => ({
        type: e.alert_type,
        message: e.error_message,
        time: getISTTime(new Date(e.created_at)),
      })) || [],
      
      // Health check
      health: {
        database: 'connected',
        ingest_running: lastIngest?.created_at 
          ? (now.getTime() - new Date(lastIngest.created_at).getTime()) < 60 * 60 * 1000
          : false,
        process_running: lastProcess?.created_at
          ? (now.getTime() - new Date(lastProcess.created_at).getTime()) < 30 * 60 * 1000
          : false,
      },
    };

    return NextResponse.json(status);
  } catch (error) {
    console.error('Status API error:', error);
    return NextResponse.json({
      success: false,
      error: error.message,
    }, { status: 500 });
  }
}
