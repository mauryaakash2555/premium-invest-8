import { NextResponse } from "next/server";
import { cookies, headers } from "next/headers";
import { z } from "zod";

import { isAdminFromRequest } from "@/lib/adminSession";
import { EmailService } from "@/lib/email/emailService";
import { computeMumbaiPropertyVsSip, buildMumbaiPropertyVsSipPdfPayload } from "@/lib/property-vs-sip";
import { generateBmWealthBlueprint15PdfBytes } from "@/lib/pdf/bmWealthBlueprint15";
import { buildPropertyVsSipFreeSummaryEmail, buildPropertyVsSipPaidPdfEmail } from "@/lib/email/propertyVsSipTemplates";

export const runtime = "nodejs";

const reqSchema = z.object({
  to: z.string().email().optional(),
  name: z.string().min(1).optional(),
});

export async function POST(req) {
  const cookieStore = await cookies();
  const headerStore = await headers();
  if (!isAdminFromRequest(cookieStore, headerStore)) {
    return NextResponse.json({ ok: false, error: "unauthorized" }, { status: 401 });
  }

  const body = await req.json().catch(() => ({}));
  const parsed = reqSchema.safeParse(body);
  if (!parsed.success) {
    return NextResponse.json({ ok: false, error: "bad_request" }, { status: 400 });
  }

  const to = parsed.data.to || "mauryaaksh2555@gmail.com";
  const displayName = String(parsed.data.name || "Dev").trim();

  // Deterministic sample data.
  const lead = {
    name: displayName,
    email: to,
    phone: "+918850977259",
  };

  const inputs = {
    propertyPrice: 20000000, // 2Cr
    monthlySip: 50000,
    years: 15,
  };

  const model = computeMumbaiPropertyVsSip(inputs);
  const pdfPayload = buildMumbaiPropertyVsSipPdfPayload({ lead, model });
  const pdfBytes = generateBmWealthBlueprint15PdfBytes(pdfPayload);

  const baseUrl = String(process.env.NEXT_PUBLIC_SITE_URL || "https://bmwealth.co.in").replace(/\/+$/, "");

  const freeEmail = buildPropertyVsSipFreeSummaryEmail({ lead, inputs, siteUrl: baseUrl });
  const paidEmail = buildPropertyVsSipPaidPdfEmail({ lead, pdfPayload, attachmentName: pdfPayload?.meta?.filename });

  const freeRes = await EmailService.sendRaw({
    to,
    subject: freeEmail.subject,
    html: freeEmail.html,
  });

  const paidRes = await EmailService.sendWithAttachments({
    to,
    subject: paidEmail.subject,
    html: paidEmail.html,
    attachments: [
      {
        filename: `${displayName.replace(/\s+/g, "_")}_Report.pdf`,
        content: pdfBytes,
        contentType: "application/pdf",
      },
    ],
  });

  return NextResponse.json({
    ok: true,
    to,
    free: freeRes,
    paid: paidRes,
    note: "If emails are skipped, configure RESEND_API_KEY and RESEND_FROM_EMAIL in the environment.",
  });
}
