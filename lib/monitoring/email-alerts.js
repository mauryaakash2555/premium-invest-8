/**
 * Email Alert System for BM Wealth
 * 
 * Sends critical alerts via email when APIs fail
 * Will migrate to WhatsApp Business API once approved
 * 
 * Primary Email: mauryaakash2555@gmail.com
 * Phone (for future WhatsApp): +91 88509 77259
 */

import { createClient } from '@supabase/supabase-js';

const ALERT_EMAIL = 'mauryaakash2555@gmail.com';
const SITE_URL = process.env.NEXT_PUBLIC_SITE_URL || 'https://www.bmwealth.co.in';

// Supabase client for logging
function getSupabase() {
  const url = process.env.NEXT_PUBLIC_SUPABASE_URL;
  const key = process.env.SUPABASE_SERVICE_ROLE_KEY;
  if (!url || !key) return null;
  return createClient(url, key);
}

/**
 * Alert types with severity levels
 */
export const ALERT_TYPES = {
  API_FAILURE: { severity: 'CRITICAL', emoji: '🚨' },
  EXPIRY_WARNING: { severity: 'WARNING', emoji: '⚠️' },
  PROCESSING_ERROR: { severity: 'ERROR', emoji: '❌' },
  DAILY_SUMMARY: { severity: 'INFO', emoji: '📊' },
  RSS_FAILURE: { severity: 'ERROR', emoji: '📡' },
  AI_FAILURE: { severity: 'ERROR', emoji: '🤖' },
};

/**
 * Get current IST time formatted
 */
function getISTTime() {
  const now = new Date();
  const istOffset = 5.5 * 60 * 60 * 1000;
  const ist = new Date(now.getTime() + istOffset - now.getTimezoneOffset() * 60000);
  return ist.toLocaleString('en-IN', {
    hour: '2-digit',
    minute: '2-digit',
    hour12: true,
    day: 'numeric',
    month: 'short',
  });
}

/**
 * Log alert to Supabase
 */
async function logAlertToSupabase(alertData) {
  const supabase = getSupabase();
  if (!supabase) return;

  try {
    await supabase.from('system_alerts').insert({
      alert_type: alertData.type,
      severity: alertData.severity,
      endpoint: alertData.endpoint,
      error_message: alertData.error,
      fallback_used: alertData.fallback,
      created_at: new Date().toISOString(),
    });
  } catch (err) {
    console.error('Failed to log alert to Supabase:', err);
  }
}

/**
 * Send email alert using Resend API
 */
async function sendEmailViaResend(subject, htmlBody, textBody) {
  const apiKey = process.env.RESEND_API_KEY;
  
  if (!apiKey) {
    console.error('[ALERT] No RESEND_API_KEY - falling back to console log');
    console.error(`\n${'='.repeat(60)}\n${subject}\n${'='.repeat(60)}\n${textBody}\n${'='.repeat(60)}\n`);
    return { success: false, error: 'No API key' };
  }

  try {
    const response = await fetch('https://api.resend.com/emails', {
      method: 'POST',
      headers: {
        'Authorization': `Bearer ${apiKey}`,
        'Content-Type': 'application/json',
      },
      body: JSON.stringify({
        from: 'BM Wealth Alerts <alerts@bmwealth.co.in>',
        to: [ALERT_EMAIL],
        subject: subject,
        html: htmlBody,
        text: textBody,
      }),
    });

    if (!response.ok) {
      throw new Error(`Resend API error: ${response.status}`);
    }

    return { success: true };
  } catch (err) {
    console.error('[ALERT] Email send failed:', err);
    return { success: false, error: err.message };
  }
}

/**
 * Format alert as HTML email
 */
function formatAlertHTML(alertData) {
  const { type, emoji, severity, endpoint, error, fallback, action, impact } = alertData;
  
  const severityColors = {
    CRITICAL: '#dc2626',
    ERROR: '#ea580c',
    WARNING: '#ca8a04',
    INFO: '#2563eb',
  };
  
  return `
<!DOCTYPE html>
<html>
<head>
  <style>
    body { font-family: -apple-system, BlinkMacSystemFont, 'Segoe UI', sans-serif; background: #0a0a0a; color: #e5e5e5; padding: 20px; }
    .container { max-width: 600px; margin: 0 auto; background: #111; border: 1px solid #333; border-radius: 12px; padding: 24px; }
    .header { font-size: 24px; font-weight: bold; margin-bottom: 20px; }
    .badge { display: inline-block; padding: 4px 12px; border-radius: 4px; font-size: 12px; font-weight: 600; }
    .section { margin: 16px 0; padding: 16px; background: #1a1a1a; border-radius: 8px; border-left: 3px solid ${severityColors[severity]}; }
    .label { color: #888; font-size: 12px; text-transform: uppercase; letter-spacing: 0.1em; }
    .value { color: #fff; font-size: 14px; margin-top: 4px; }
    .action { background: #172554; border-color: #1d4ed8; }
    .footer { margin-top: 24px; padding-top: 16px; border-top: 1px solid #333; font-size: 12px; color: #666; }
    a { color: #60a5fa; }
  </style>
</head>
<body>
  <div class="container">
    <div class="header">
      ${emoji} BM WEALTH ALERT
      <span class="badge" style="background: ${severityColors[severity]}20; color: ${severityColors[severity]}; margin-left: 12px;">
        ${severity}
      </span>
    </div>
    
    <div class="section">
      <div class="label">System</div>
      <div class="value">${type.replace(/_/g, ' ')}</div>
    </div>
    
    ${endpoint ? `
    <div class="section">
      <div class="label">Endpoint</div>
      <div class="value" style="font-family: monospace;">${endpoint}</div>
    </div>
    ` : ''}
    
    <div class="section">
      <div class="label">Time (IST)</div>
      <div class="value">${getISTTime()}</div>
    </div>
    
    ${error ? `
    <div class="section">
      <div class="label">Error</div>
      <div class="value" style="color: #f87171;">${error}</div>
    </div>
    ` : ''}
    
    ${impact ? `
    <div class="section">
      <div class="label">Impact</div>
      <div class="value">${impact}</div>
    </div>
    ` : ''}
    
    ${fallback ? `
    <div class="section">
      <div class="label">Fallback</div>
      <div class="value">${fallback}</div>
    </div>
    ` : ''}
    
    ${action ? `
    <div class="section action">
      <div class="label">Action Required</div>
      <div class="value">${action}</div>
    </div>
    ` : ''}
    
    <div class="footer">
      <a href="${SITE_URL}/admin-secret-akash">Open Admin Panel</a> · 
      <a href="${SITE_URL}/admin-secret-akash/live-intelligence">Live Intelligence Dashboard</a>
      <br><br>
      This is an automated alert from BM Wealth monitoring system.
    </div>
  </div>
</body>
</html>
  `;
}

/**
 * Format alert as plain text
 */
function formatAlertText(alertData) {
  const { type, emoji, severity, endpoint, error, fallback, action, impact } = alertData;
  
  let text = `${emoji} BM WEALTH ALERT\n${'='.repeat(40)}\n\n`;
  text += `System: ${type.replace(/_/g, ' ')}\n`;
  text += `Severity: ${severity}\n`;
  text += `Time: ${getISTTime()}\n`;
  
  if (endpoint) text += `\nEndpoint: ${endpoint}\n`;
  if (error) text += `\nError: ${error}\n`;
  if (impact) text += `\nImpact: ${impact}\n`;
  if (fallback) text += `\nFallback: ${fallback}\n`;
  if (action) text += `\nAction Required: ${action}\n`;
  
  text += `\n${'='.repeat(40)}\n`;
  text += `Admin: ${SITE_URL}/admin-secret-akash\n`;
  
  return text;
}

/**
 * Send alert (main function)
 */
export async function sendAlert({
  type,
  endpoint = null,
  error = null,
  fallback = null,
  action = null,
  impact = null,
}) {
  const alertConfig = ALERT_TYPES[type] || ALERT_TYPES.API_FAILURE;
  
  const alertData = {
    type,
    emoji: alertConfig.emoji,
    severity: alertConfig.severity,
    endpoint,
    error,
    fallback,
    action,
    impact,
  };

  // Log to Supabase
  await logAlertToSupabase(alertData);

  // Send email
  const subject = `${alertConfig.emoji} [${alertConfig.severity}] ${type.replace(/_/g, ' ')} - BM Wealth`;
  const htmlBody = formatAlertHTML(alertData);
  const textBody = formatAlertText(alertData);

  return await sendEmailViaResend(subject, htmlBody, textBody);
}

/**
 * Send API failure alert
 */
export async function sendAPIFailureAlert(endpoint, error, fallbackUsed = null) {
  return sendAlert({
    type: 'API_FAILURE',
    endpoint,
    error: error?.message || String(error),
    fallback: fallbackUsed,
    impact: 'Live data not updating. Users may see stale content.',
    action: 'Check server logs and RSS feed sources.',
  });
}

/**
 * Send expiry warning alert
 */
export async function sendExpiryAlert(expiredCount, remainingCount) {
  return sendAlert({
    type: 'EXPIRY_WARNING',
    error: `${expiredCount} headlines expired in the last hour`,
    impact: `Only ${remainingCount} active headlines remaining`,
    action: 'Check if RSS ingestion is working. May need manual headline entry.',
  });
}

/**
 * Send RSS failure alert
 */
export async function sendRSSFailureAlert(source, error) {
  return sendAlert({
    type: 'RSS_FAILURE',
    endpoint: `/api/live-intelligence/ingest (${source})`,
    error: error?.message || String(error),
    impact: 'New headlines not being fetched from this source.',
    action: 'Check RSS feed URL. Source may be temporarily down.',
  });
}

/**
 * Send AI processing failure alert
 */
export async function sendAIFailureAlert(provider, error) {
  return sendAlert({
    type: 'AI_FAILURE',
    endpoint: `AI Provider: ${provider}`,
    error: error?.message || String(error),
    impact: 'Headlines not being processed/classified.',
    action: 'Check API key validity and rate limits.',
  });
}

/**
 * Send daily summary (9 PM IST)
 */
export async function sendDailySummary(stats) {
  return sendAlert({
    type: 'DAILY_SUMMARY',
    error: null,
    impact: `Headlines: ${stats.headlinesProcessed} | Errors: ${stats.errors} | Cost: ₹${stats.estimatedCost}`,
    action: stats.errors > 0 ? 'Review error logs in admin panel.' : 'All systems operational.',
  });
}

export default {
  sendAlert,
  sendAPIFailureAlert,
  sendExpiryAlert,
  sendRSSFailureAlert,
  sendAIFailureAlert,
  sendDailySummary,
  ALERT_TYPES,
};
