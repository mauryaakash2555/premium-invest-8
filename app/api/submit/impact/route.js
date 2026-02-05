/**
 * FILE: app/api/submit/impact/route.js
 * PURPOSE: Accept Community Impact story submissions, log best-effort, and notify via email.
 */

import { NextResponse } from 'next/server';
import { z } from 'zod';
import { EmailService } from '@/lib/email/emailService';
import { emailTemplate } from '@/lib/email/templates';
import { EmailPreferencesDB } from '@/lib/db/emailPreferences';
import { logEventSafe } from '@/lib/db/events';

export const runtime = 'nodejs';

const schema = z.object({
  title: z.string().min(4).max(150),
  what_happened: z.string().min(30).max(6000),
  when_happened: z.string().min(4).max(32), // date string from <input type="date">
  where_happened: z.string().min(2).max(200),
  who_affected: z.string().max(240).optional().default(''),
  evidence_proof: z.string().max(4000).optional().default(''),
  impact_result: z.string().min(10).max(4000),
  proposed_solution: z.string().max(4000).optional().default(''),
  visual_keywords: z.string().max(400).optional().default(''),
  author_name: z.string().min(2).max(160),
  author_email: z.string().email().max(240),
  author_phone: z
    .string()
    .transform((s) => String(s || '').replace(/\D+/g, ''))
    .refine((s) => /^\d{10}$/.test(s), { message: 'invalid_phone' }),
  location_tag: z.string().max(120).optional().default(''),
  anonymous: z.boolean().optional().default(false),
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
    event_type: 'submission_impact',
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
    <h2>New Community Impact Submission</h2>
    <p><strong>Title:</strong> ${safeText(data.title)}</p>
    <p><strong>When:</strong> ${safeText(data.when_happened)}</p>
    <p><strong>Where:</strong> ${safeText(data.where_happened)}</p>
    <p><strong>Location Tag:</strong> ${safeText(data.location_tag || '-')}</p>
    <p><strong>Visual Keywords:</strong> ${safeText(data.visual_keywords || '-')}</p>
    <hr />
    <p><strong>What Happened:</strong></p>
    <pre style="white-space:pre-wrap">${safeText(data.what_happened)}</pre>
    <p><strong>Who Affected:</strong> ${safeText(data.who_affected || '-')}</p>
    <p><strong>Impact/Result:</strong></p>
    <pre style="white-space:pre-wrap">${safeText(data.impact_result)}</pre>
    <p><strong>Proposed Solution:</strong></p>
    <pre style="white-space:pre-wrap">${safeText(data.proposed_solution || '-')}</pre>
    <p><strong>Evidence/Proof:</strong></p>
    <pre style="white-space:pre-wrap">${safeText(data.evidence_proof || '-')}</pre>
    <hr />
    <p><strong>Author Name:</strong> ${safeText(data.author_name)}</p>
    <p><strong>Author Email:</strong> ${safeText(data.author_email)}</p>
    <p><strong>Author Phone:</strong> ${safeText(data.author_phone)}</p>
    <p><strong>Anonymous:</strong> ${data.anonymous ? 'Yes' : 'No'}</p>
    <hr />
    <p style="font-size:12px">Meta: ip=${safeText(meta.ip || '-')}, ua=${safeText(meta.ua || '-')}</p>
  `;

  const sent = await EmailService.sendRaw({
    to,
    subject: `Impact Submission: ${data.title}`,
    html: emailTemplate(content),
  });

  const emailStatus = sent?.ok ? 'sent' : sent?.skipped ? 'skipped' : 'failed';
  const emailReason = sent?.skipped ? String(sent?.reason || 'not_configured') : sent?.ok ? null : 'send_failed';

  // If email isn't configured, still accept the submission (logged best-effort).
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
