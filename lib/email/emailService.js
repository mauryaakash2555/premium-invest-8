/**
 * FILE: lib/email/emailService.js
 * PURPOSE: Send notification emails via Resend.
 */

import { Resend } from 'resend';
import { emailTemplate } from '@/lib/email/templates';

function getResendClient() {
  const apiKey = String(process.env.RESEND_API_KEY || '').trim();
  if (!apiKey) return null;
  return new Resend(apiKey);
}

function getFromEmail() {
  return String(process.env.RESEND_FROM_EMAIL || 'notifications@bmwealth.co.in').trim();
}

function safeHtml(s) {
  return String(s || '')
    .replace(/&/g, '&amp;')
    .replace(/</g, '&lt;')
    .replace(/>/g, '&gt;')
    .replace(/"/g, '&quot;')
    .replace(/'/g, '&#39;');
}

export const EmailService = {
  async sendRaw({ to, subject, html }) {
    const resend = getResendClient();
    const from = getFromEmail();
    const dest = String(to || '').trim();
    const subj = String(subject || '').trim();

    // Best-effort no-op when not configured.
    if (!resend || !dest || !subj) {
      return { ok: false, skipped: true, reason: 'not_configured_or_missing_fields' };
    }

    try {
      await resend.emails.send({
        from,
        to: dest,
        subject: subj,
        html: String(html || ''),
      });
      return { ok: true };
    } catch (error) {
      // Never throw from email notifications.
      return { ok: false, error };
    }
  },

  async sendHotLeadAlert({ to, lead }) {
    const dashboardUrl = String(process.env.PUBLIC_DASHBOARD_URL || 'https://bmwealth.co.in/admin-secret-akash');
    const name = safeHtml(lead?.name || 'Anonymous');
    const email = safeHtml(lead?.email || '-');
    const phone = safeHtml(lead?.phone || '-');
    const score = Number(lead?.lead_score);
    const scoreText = Number.isFinite(score) ? `${score}/100 (HOT)` : 'HOT';
    const createdAt = lead?.created_at ? new Date(lead.created_at).toLocaleString() : new Date().toLocaleString();
    const lastMessage = safeHtml(lead?.last_message || 'See dashboard for conversation');

    const content = `
      <h2>New Hot Lead Captured!</h2>
      <p><strong>Name:</strong> ${name}</p>
      <p><strong>Email:</strong> ${email}</p>
      <p><strong>Phone:</strong> ${phone}</p>
      <p><strong>Score:</strong> ${safeHtml(scoreText)}</p>
      <p><strong>Time:</strong> ${safeHtml(createdAt)}</p>
      <h3>What they asked:</h3>
      <p>${lastMessage}</p>
      <p>
        <a class="button" href="${safeHtml(dashboardUrl)}">View in Dashboard →</a>
      </p>
      <p style="color:#666;font-size:12px;">BM Wealth Auto-Notification System</p>
    `;

    return this.sendRaw({
      to,
      subject: `HOT LEAD: ${lead?.name ? String(lead.name).trim() : 'New Lead'}`,
      html: emailTemplate(content),
    });
  },

  async sendConversionAlert({ to, conversion }) {
    const platform = safeHtml(conversion?.platform || '-');
    const leadName = safeHtml(conversion?.leadName || '-');
    const amount = safeHtml(conversion?.amount != null ? String(conversion.amount) : '-');
    const when = conversion?.converted_at ? new Date(conversion.converted_at).toLocaleString() : new Date().toLocaleString();

    const content = `
      <h2>Affiliate Conversion!</h2>
      <p><strong>Platform:</strong> ${platform}</p>
      <p><strong>Lead:</strong> ${leadName}</p>
      <p><strong>Amount:</strong> ₹${amount}</p>
      <p><strong>Time:</strong> ${safeHtml(when)}</p>
      <p>Great work! Keep it up.</p>
    `;

    return this.sendRaw({
      to,
      subject: `CONVERSION: ₹${conversion?.amount != null ? String(conversion.amount) : ''}`.trim(),
      html: emailTemplate(content),
    });
  },

  async sendErrorAlert({ to, err }) {
    const message = safeHtml(err?.message || 'Unknown error');
    const location = safeHtml(err?.location || 'unknown');
    const when = safeHtml(new Date().toLocaleString());
    const stack = safeHtml(err?.stack || '');

    const content = `
      <h2>System Error Detected</h2>
      <p><strong>Error:</strong> ${message}</p>
      <p><strong>Location:</strong> ${location}</p>
      <p><strong>Time:</strong> ${when}</p>
      <pre style="background:#f5f5f5;padding:10px;white-space:pre-wrap;">${stack}</pre>
      <p>Check admin dashboard for details.</p>
    `;

    return this.sendRaw({
      to,
      subject: 'SYSTEM ERROR',
      html: emailTemplate(content),
    });
  },

  async sendDailySummary({ to, stats }) {
    const topQuestions = Array.isArray(stats?.topQuestions) ? stats.topQuestions : [];

    const content = `
      <h2>Today's Performance</h2>
      <table>
        <tr><td><strong>Leads Captured:</strong></td><td>${Number(stats?.leads || 0)}</td></tr>
        <tr><td><strong>Hot Leads:</strong></td><td>${Number(stats?.hotLeads || 0)}</td></tr>
        <tr><td><strong>Conversations:</strong></td><td>${Number(stats?.conversations || 0)}</td></tr>
        <tr><td><strong>Revenue:</strong></td><td>₹${Number(stats?.revenue || 0)}</td></tr>
        <tr><td><strong>Affiliate Clicks:</strong></td><td>${Number(stats?.affiliateClicks || 0)}</td></tr>
      </table>
      <h3>Top Questions Today:</h3>
      <ul>
        ${topQuestions.map((q) => `<li>${safeHtml(q)}</li>`).join('')}
      </ul>
      <p><a class="button" href="${safeHtml(String(process.env.PUBLIC_DASHBOARD_URL || 'https://bmwealth.co.in/admin-secret-akash'))}">View Full Dashboard →</a></p>
    `;

    return this.sendRaw({
      to,
      subject: `Daily Summary - ${new Date().toLocaleDateString()}`,
      html: emailTemplate(content),
    });
  },

  async sendWeeklySummary({ to, stats }) {
    const recommendations = Array.isArray(stats?.recommendations) ? stats.recommendations : [];

    const content = `
      <h2>This Week's Performance</h2>
      <h3>Summary:</h3>
      <ul>
        <li>Total Leads: ${safeHtml(String(stats?.totalLeads ?? 0))}</li>
        <li>Hot Leads: ${safeHtml(String(stats?.hotLeads ?? 0))}</li>
        <li>Revenue: ₹${safeHtml(String(stats?.revenue ?? 0))}</li>
        <li>Conversions: ${safeHtml(String(stats?.conversions ?? 0))}</li>
      </ul>
      <h3>Best Performing:</h3>
      <ul>
        <li>Best Day: ${safeHtml(String(stats?.bestDay ?? 'N/A'))} (${safeHtml(String(stats?.bestDayLeads ?? 'N/A'))} leads)</li>
        <li>Best Platform: ${safeHtml(String(stats?.bestPlatform ?? 'N/A'))}</li>
        <li>Most Asked: ${safeHtml(String(stats?.topQuestion ?? 'N/A'))}</li>
      </ul>
      <h3>Action Items:</h3>
      <ul>
        ${recommendations.map((r) => `<li>${safeHtml(r)}</li>`).join('')}
      </ul>
    `;

    return this.sendRaw({
      to,
      subject: `Weekly Report - Week of ${new Date().toLocaleDateString()}`,
      html: emailTemplate(content),
    });
  },
};
