/**
 * AIO Calculator Email Result
 *
 * Sends a prefilled link + snapshot text to the user.
 * Best-effort: if Resend isn't configured, returns not_configured.
 */

import { NextResponse } from 'next/server';
import { z } from 'zod';
import { EmailService } from '@/lib/email/emailService';
import { emailTemplate } from '@/lib/email/templates';
import { logEventSafe } from '@/lib/db/events';

export const runtime = 'nodejs';

const schema = z.object({
  leadId: z.string().uuid().optional(),
  to: z.string().email(),
  name: z.string().min(2).max(120),
  title: z.string().min(1).max(180),
  text: z.string().min(1).max(3000),
  url: z.string().url(),
  calc: z.string().min(1).max(60).optional(),
  utm: z
    .object({
      utm_source: z.string().nullable().optional(),
      utm_medium: z.string().nullable().optional(),
      utm_campaign: z.string().nullable().optional(),
      utm_content: z.string().nullable().optional(),
    })
    .optional(),
});

function safeText(s) {
  return String(s || '')
    .replace(/&/g, '&amp;')
    .replace(/</g, '&lt;')
    .replace(/>/g, '&gt;')
    .replace(/"/g, '&quot;')
    .replace(/'/g, '&#39;');
}

export async function POST(req) {
  const body = await req.json().catch(() => ({}));
  const parsed = schema.safeParse(body);
  if (!parsed.success) {
    return NextResponse.json({ ok: false, error: 'bad_request' }, { status: 400 });
  }

  const { leadId, to, name, title, text, url, calc, utm } = parsed.data;

  const content = `
    <h2>Your BM Wealth calculator link is ready</h2>
    <p>Hi ${safeText(name)},</p>
    <p>${safeText(text)}</p>
    <p><a class="button" href="${safeText(url)}">Open prefilled calculator →</a></p>
    <p style="font-size:12px;color:#666">Calculator: ${safeText(calc || 'aio')}</p>
  `;

  const sent = await EmailService.sendRaw({
    to,
    subject: title,
    html: emailTemplate(content),
  });

  if (!sent?.ok) {
    // Track failure (best-effort)
    await logEventSafe({
      leadId,
      event_type: 'calculator_email_failed',
      data: {
        calculator_type: 'aio',
        calc: calc || null,
        to,
        utm: utm || null,
        reason: sent?.skipped ? 'not_configured' : 'send_failed',
      },
    });

    return NextResponse.json(
      { ok: false, error: sent?.skipped ? 'not_configured' : 'send_failed' },
      { status: sent?.skipped ? 503 : 502 }
    );
  }

  await logEventSafe({
    leadId,
    event_type: 'calculator_email_sent',
    data: {
      calculator_type: 'aio',
      calc: calc || null,
      to,
      utm: utm || null,
    },
  });

  return NextResponse.json({ ok: true });
}
