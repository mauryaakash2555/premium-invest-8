/**
 * FILE: app/api/submit/guest/route.js
 * PURPOSE: Accept Guest Column submissions, log best-effort, and notify via email.
 */

import { NextResponse } from 'next/server';
import { z } from 'zod';
import { EmailService } from '@/lib/email/emailService';
import { emailTemplate } from '@/lib/email/templates';
import { EmailPreferencesDB } from '@/lib/db/emailPreferences';
import { logEventSafe } from '@/lib/db/events';

export const runtime = 'nodejs';

const schema = z.object({
  title: z.string().min(4).max(200),
  article_content: z.string().min(200).max(40000),
  expertise_area: z.string().min(2).max(40),
  author_name: z.string().min(2).max(160),
  author_credentials: z.string().min(2).max(240),
  author_bio: z.string().min(10).max(1200),
  author_linkedin: z.string().url().max(400),
  author_email: z.string().email().max(240),
  sources_references: z.string().max(6000).optional().default(''),
});

function safeText(s) {
  return String(s || '')
    .replace(/&/g, '&amp;')
    .replace(/</g, '&lt;')
    .replace(/>/g, '&gt;')
    .replace(/"/g, '&quot;')
    .replace(/'/g, '&#39;');
}

function getRequestMeta(req) {
  const ua = req.headers.get('user-agent') || '';
  const forwardedFor = req.headers.get('x-forwarded-for') || '';
  const ip = forwardedFor.split(',')[0]?.trim() || '';
  const referer = req.headers.get('referer') || '';
  return { ua, ip, referer };
}

export async function POST(req) {
  const body = await req.json().catch(() => ({}));
  const parsed = schema.safeParse(body);
  if (!parsed.success) {
    return NextResponse.json({ ok: false, error: 'bad_request' }, { status: 400 });
  }

  const data = parsed.data;
  const meta = getRequestMeta(req);

  await logEventSafe({
    leadId: null,
    event_type: 'submission_guest',
    data: {
      ...data,
      status: 'PENDING',
      meta,
      received_at: new Date().toISOString(),
    },
  });

  const prefs = await EmailPreferencesDB.getSafe();
  const to = String(process.env.SUBMISSIONS_NOTIFY_EMAIL || process.env.EDITORIAL_INBOX_EMAIL || prefs?.email_address || '').trim();

  const content = `
    <h2>New Guest Column Submission</h2>
    <p><strong>Title:</strong> ${safeText(data.title)}</p>
    <p><strong>Expertise:</strong> ${safeText(data.expertise_area)}</p>
    <hr />
    <p><strong>Author:</strong> ${safeText(data.author_name)}</p>
    <p><strong>Credentials:</strong> ${safeText(data.author_credentials)}</p>
    <p><strong>Email:</strong> ${safeText(data.author_email)}</p>
    <p><strong>LinkedIn:</strong> <a href="${safeText(data.author_linkedin)}">${safeText(data.author_linkedin)}</a></p>
    <p><strong>Bio:</strong></p>
    <pre style="white-space:pre-wrap">${safeText(data.author_bio)}</pre>
    <hr />
    <p><strong>Sources/References:</strong></p>
    <pre style="white-space:pre-wrap">${safeText(data.sources_references || '-')}</pre>
    <hr />
    <p><strong>Article Content:</strong></p>
    <pre style="white-space:pre-wrap">${safeText(data.article_content)}</pre>
    <hr />
    <p style="font-size:12px">Meta: ip=${safeText(meta.ip || '-')}, ua=${safeText(meta.ua || '-')}</p>
  `;

  const sent = await EmailService.sendRaw({
    to,
    subject: `Guest Column: ${data.title}`,
    html: emailTemplate(content),
  });

  const emailStatus = sent?.ok ? 'sent' : sent?.skipped ? 'skipped' : 'failed';
  const emailReason = sent?.skipped ? String(sent?.reason || 'not_configured') : sent?.ok ? null : 'send_failed';

  return NextResponse.json(
    {
      ok: true,
      emailed: Boolean(sent?.ok),
      email: {
        status: emailStatus,
        reason: emailReason,
      },
    },
    { status: 200 }
  );
}
