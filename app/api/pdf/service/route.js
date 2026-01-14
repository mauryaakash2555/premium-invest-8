import { NextResponse } from "next/server";

import { generateServiceBrochurePdfBytes } from "@/lib/pdf/serviceBrochure";

export const runtime = "nodejs";

const SERVICE_MAP = {
  "mutual-funds": { label: "Mutual Funds" },
  sip: { label: "SIP" },
  "portfolio-management": { label: "Portfolio Management (PMS/AIF)" },
  insurance: { label: "Insurance" },
  "trading-services": { label: "Trading Services" },
  "fixed-deposits": { label: "Fixed Deposits" },
};

function safe(v) {
  return String(v ?? "").trim();
}

function fallbackBrochure(serviceKey) {
  const service = SERVICE_MAP[serviceKey] || { label: "BM Wealth Service" };
  return {
    meta: {
      title: `BM Wealth | ${service.label} Brochure`,
      subject: `${service.label} brochure`,
      keywords: `BM Wealth, ${service.label}`,
      filename: `BM-Wealth-${service.label.replace(/\s+/g, "-")}-Brochure.pdf`,
    },
    title: `BM Wealth — ${service.label}`,
    subtitle: "Premium service brochure",
    overviewBullets: [
      `What it is: ${service.label} offering overview.`,
      "Who it’s for: Long-term investors looking for a disciplined approach.",
      "How it works: Goal-first planning with risk-aware implementation.",
    ],
    howWeHelpBullets: [
      "Goal discovery and risk profiling",
      "Portfolio construction and periodic rebalancing",
      "Transparent reporting and ongoing support",
    ],
    nextStepsBullets: [
      "Book a consultation",
      "Share your goals and current portfolio",
      "Get a recommended plan and execution checklist",
    ],
  };
}

async function generateWithAI({ serviceKey }) {
  const apiKey = safe(process.env.OPENAI_API_KEY);
  if (!apiKey) return null;

  // Import OpenAI only in Node.js runtime.
  const { default: OpenAI } = await import("openai");
  const client = new OpenAI({ apiKey });

  const service = SERVICE_MAP[serviceKey] || { label: "BM Wealth Service" };

  const system =
    "You are BM Wealth's brochure writer. Return ONLY valid JSON. Keep it factual, compliance-friendly, and concise. No guaranteed returns, no hype.";

  const user = `Create a 1-page brochure for the service: "${service.label}".

Return JSON with keys:
- meta: { title, subject, keywords, filename }
- title (string)
- subtitle (string)
- overviewBullets (array of 3-6 strings)
- howWeHelpBullets (array of 3-6 strings)
- nextStepsBullets (array of 3-6 strings)

Constraints:
- India context.
- Avoid performance promises.
- Plain language.
- Keep bullets short.`;

  const completion = await client.chat.completions.create({
    model: "gpt-4o-mini",
    messages: [
      { role: "system", content: system },
      { role: "user", content: user },
    ],
    temperature: 0.4,
    max_tokens: 700,
    response_format: { type: "json_object" },
  });

  const content = completion.choices?.[0]?.message?.content;
  if (!content) return null;

  try {
    const parsed = JSON.parse(content);
    return parsed;
  } catch {
    return null;
  }
}

export async function GET(req) {
  try {
    const url = new URL(req.url);
    const serviceKey = safe(url.searchParams.get("service")).toLowerCase();
    const resolvedKey = SERVICE_MAP[serviceKey] ? serviceKey : "mutual-funds";

    const aiPayload = await generateWithAI({ serviceKey: resolvedKey }).catch(() => null);
    const payload = aiPayload || fallbackBrochure(resolvedKey);

    const pdfBytes = generateServiceBrochurePdfBytes(payload);

    return new NextResponse(pdfBytes, {
      status: 200,
      headers: {
        "Content-Type": "application/pdf",
        "Content-Disposition": `inline; filename=${safe(payload?.meta?.filename) || "BM-Wealth-Service-Brochure.pdf"}`,
        "Cache-Control": "no-store",
      },
    });
  } catch {
    return NextResponse.json({ ok: false, error: "service_pdf_failed" }, { status: 500 });
  }
}
