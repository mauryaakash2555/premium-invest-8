import { NextResponse } from "next/server";

import { EmailService } from "@/lib/email/emailService";
import { LeadsDB } from "@/lib/db/leads";
import { logEventSafe } from "@/lib/db/events";
import { computeMumbaiPropertyVsSip } from "@/lib/property-vs-sip";

export const runtime = "nodejs";

function isValidEmail(v) {
  return /^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(String(v || "").trim());
}

function normalizePhone(v) {
  const raw = String(v || "").trim();
  if (!raw) return "";
  const digits = raw.replace(/\D+/g, "");
  if (!digits) return "";
  if (digits.length === 10) return `+91${digits}`;
  if (digits.length === 12 && digits.startsWith("91")) return `+${digits}`;
  if (raw.startsWith("+") && digits.length >= 10) return `+${digits}`;
  return "";
}

function safeStr(v) {
  return String(v ?? "").trim();
}

function safeHtml(s) {
  return String(s ?? "")
    .replace(/&/g, "&amp;")
    .replace(/</g, "&lt;")
    .replace(/>/g, "&gt;")
    .replace(/\"/g, "&quot;")
    .replace(/'/g, "&#39;");
}

function parseINR(v) {
  const raw = String(v ?? "").trim();
  if (!raw) return 0;
  const cleaned = raw.replace(/[^0-9\-\.]/g, "");
  const n = Number(cleaned);
  return Number.isFinite(n) ? n : 0;
}

function hashMod3(s) {
  const str = String(s ?? "");
  let h = 0;
  for (let i = 0; i < str.length; i++) {
    h = (h + str.charCodeAt(i)) % 3;
  }
  return h;
}

function formatCrLakh(n) {
  const v = Number(n);
  if (!Number.isFinite(v) || v <= 0) return "₹0";
  const cr = v / 1e7;
  if (cr >= 1) {
    const rounded = Math.round(cr * 10) / 10;
    const clean = String(rounded).endsWith(".0") ? String(Math.round(rounded)) : String(rounded);
    return `₹${clean}Cr`;
  }
  const lakh = v / 1e5;
  if (lakh >= 1) {
    const rounded = Math.round(lakh * 10) / 10;
    const clean = String(rounded).endsWith(".0") ? String(Math.round(rounded)) : String(rounded);
    return `₹${clean}L`;
  }
  return `₹${Math.round(v).toLocaleString("en-IN")}`;
}

export async function POST(req) {
  try {
    const body = await req.json().catch(() => ({}));

    const lead = body?.lead || {};
    const name = safeStr(lead?.name);
    const email = safeStr(lead?.email);
    const phone = normalizePhone(lead?.phone || lead?.whatsapp || lead?.contact);
    const whatsappOptIn = Boolean(lead?.whatsappOptIn);

    const inputs = body?.inputs || {};
    const results = body?.results || {};

    if (!name || name.length < 2 || !isValidEmail(email)) {
      return NextResponse.json({ ok: false, error: "invalid_fields" }, { status: 400 });
    }

    const propertyPriceStr = safeStr(inputs?.propertyPrice);
    const monthlySipStr = safeStr(inputs?.monthlySip);
    const yearsStr = safeStr(inputs?.years);

    const propertyPrice = parseINR(propertyPriceStr);
    const monthlySip = parseINR(monthlySipStr);
    const years = Math.max(1, Math.min(30, Math.round(Number(yearsStr || 0) || 0) || 15));

    const model = computeMumbaiPropertyVsSip({ propertyPrice, monthlySip, years });

    const wealthGapNum = Number(model?.wealthGap || 0);
    const wealthGapAbs = Math.max(0, Math.abs(wealthGapNum));
    const gapCrRounded = Math.round((wealthGapAbs / 1e7) * 10) / 10;

    const dailyLeak = years > 0 ? wealthGapAbs / (years * 365) : 0;
    const monthlyLeak = dailyLeak * 30;
    const yearlyLeak = dailyLeak * 360;

    const variant = hashMod3(email);
    const subjectA = `🚨 CRITICAL: Your ${formatCrLakh(wealthGapAbs)} Wealth Leak identified`;
    const subjectB = `${name || "You"}, your ${formatCrLakh(propertyPrice)} property is bleeding money`;
    const subjectC = `This Mumbai property mistake costs ₹${Math.round(monthlyLeak).toLocaleString("en-IN")}/month`;
    const subject = variant === 1 ? subjectB : variant === 2 ? subjectC : subjectA;

    const ctaUrl = String(process.env.NEXT_PUBLIC_SITE_URL || "https://bmwealth.co.in").replace(/\/+$/, "") +
      "/tools/property-vs-sip";
    const unsubscribeUrl = `mailto:support@bmwealth.co.in?subject=${encodeURIComponent("Unsubscribe")}&body=${encodeURIComponent(
      `Please unsubscribe ${email} from Property vs SIP emails.`
    )}`;

    const propertyLine = propertyPriceStr || `₹${Math.round(propertyPrice).toLocaleString("en-IN")}`;
    const sipLine = monthlySipStr || `₹${Math.round(monthlySip).toLocaleString("en-IN")}`;
    const timelineLine = yearsStr ? `${yearsStr} years` : `${years} years`;
    const wealthGapLine = `₹${Math.round(wealthGapAbs).toLocaleString("en-IN")}`;

    const html = `
      <div style="font-family:Inter,Arial,sans-serif;line-height:1.6;color:#111;max-width:700px">
        <p>Hi ${safeHtml(name || "there")},</p>

        <p>You just ran the numbers.</p>

        <p>Most people in Mumbai think their property is their “Golden Nest Egg.”</p>
        <p><strong>The math says otherwise.</strong></p>

        <hr style="border:none;border-top:1px solid #eee;margin:18px 0"/>

        <p style="margin:0 0 10px"><strong>🚨 YOUR SPECIFIC ANALYSIS:</strong></p>
        <p style="margin:0">Property: <strong>${safeHtml(propertyLine)}</strong></p>
        <p style="margin:0">Monthly Deployment: <strong>${safeHtml(sipLine)}</strong></p>
        <p style="margin:0">Timeline: <strong>${safeHtml(timelineLine)}</strong></p>

        <p style="margin:14px 0 8px"><strong>Wealth Gap: ${safeHtml(wealthGapLine)}</strong>${gapCrRounded ? ` <span style="color:#555">(≈ ${safeHtml(formatCrLakh(wealthGapAbs))})</span>` : ""}</p>

        <p style="margin:0">This isn’t just a number.</p>
        <p style="margin:10px 0 6px">This is:</p>
        <ul style="margin:6px 0 0;padding-left:20px">
          <li>A luxury retirement in Goa (₹5Cr villa)</li>
          <li>Your child’s Ivy League education (₹1.5Cr)</li>
          <li>Years of absolute financial freedom (liquid corpus)</li>
        </ul>

        <p style="margin:14px 0 0">That’s currently leaking into:</p>
        <p style="margin:6px 0 0">→ Society maintenance</p>
        <p style="margin:0">→ Property tax</p>
        <p style="margin:0">→ Repairs & depreciation</p>
        <p style="margin:0">→ Zero liquidity for ${safeHtml(String(years))} years</p>
        <p style="margin:0">→ 4% appreciation vs 14.5% compounding (model assumption)</p>

        <hr style="border:none;border-top:1px solid #eee;margin:18px 0"/>

        <p style="margin:0 0 10px"><strong>⏰ THE DAILY LEAK:</strong></p>
        <p style="margin:0">Every day you stay in this property trap:</p>
        <p style="margin:6px 0 0">→ You lose <strong>₹${Math.round(dailyLeak).toLocaleString("en-IN")}</strong> in potential compounding</p>
        <p style="margin:0">→ That’s <strong>₹${Math.round(monthlyLeak).toLocaleString("en-IN")}/month</strong></p>
        <p style="margin:0">→ Or <strong>₹${Math.round(yearlyLeak).toLocaleString("en-IN")}/year</strong></p>

        <p style="margin:10px 0 0;color:#555">Slipping away. Silently. Irreversibly.</p>

        <hr style="border:none;border-top:1px solid #eee;margin:18px 0"/>

        <p style="margin:0 0 10px"><strong>💼 WHY WAIT TO LOSE MORE?</strong></p>
        <p style="margin:0">I’ve prepared your <strong>Private Exit Plan</strong> (Premium Blueprint).</p>
        <p style="margin:10px 0 0">This isn’t a generic PDF.</p>
        <p style="margin:0">It’s a structured transition strategy designed to help you exit the “Concrete Trap” and build a liquid portfolio (educational model, not advice).</p>

        <hr style="border:none;border-top:1px solid #eee;margin:18px 0"/>

        <p style="margin:0 0 10px"><strong>🎯 WHAT’S INSIDE YOUR BESPOKE STRATEGY:</strong></p>
        <p style="margin:0 0 6px"><strong>🏠 PROPERTY EXIT ARCHITECTURE</strong></p>
        <p style="margin:0">→ Month-by-month exit timeline (your scenario)</p>
        <p style="margin:0">→ Micro-market timing framework (locality context)</p>
        <p style="margin:0">→ Buyer psychology tactics</p>
        <p style="margin:0">→ Society clearance checklist</p>

        <p style="margin:12px 0 6px"><strong>💰 TAX HARVESTING BLUEPRINT</strong></p>
        <p style="margin:0">→ Capital gains framework for your property</p>
        <p style="margin:0">→ Indexation logic</p>
        <p style="margin:0">→ Section 54 model scenarios</p>
        <p style="margin:0">→ Reinvestment math (deployment planning)</p>

        <p style="margin:12px 0 6px"><strong>📊 LIQUID EMPIRE DEPLOYMENT</strong></p>
        <p style="margin:0">→ Mutual Fund + PMS allocation concepts (model)</p>
        <p style="margin:0">→ SIP optimization framework</p>
        <p style="margin:0">→ Rebalancing triggers</p>
        <p style="margin:0">→ Downside risk framing</p>

        <p style="margin:12px 0 6px"><strong>🛡️ RISK MITIGATION FRAMEWORK</strong></p>
        <p style="margin:0">→ Stress-test scenarios</p>
        <p style="margin:0">→ Emergency liquidity vs lock-in trade-offs</p>
        <p style="margin:0">→ Insurance continuity considerations</p>
        <p style="margin:0">→ Hybrid allocation models (70–30 / 50–50)</p>

        <p style="margin:12px 0 6px"><strong>👨‍👩‍👧‍👦 FAMILY OFFICE CONVERSATION SCRIPT</strong></p>
        <p style="margin:0">→ Handling “property = security” mindset</p>
        <p style="margin:0">→ Talking points for family alignment</p>
        <p style="margin:0">→ Case-style examples (for learning)</p>

        <p style="margin:12px 0 6px"><strong>🏙️ MUMBAI WEALTH INTELLIGENCE</strong></p>
        <p style="margin:0">→ Rental yield reality checks</p>
        <p style="margin:0">→ When property can make sense (edge cases)</p>

        <hr style="border:none;border-top:1px solid #eee;margin:18px 0"/>

        <p style="margin:0 0 10px"><strong>⚡ THIS IS WHAT BM WEALTH CHARGES ₹50,000 FOR</strong></p>
        <p style="margin:0">You’re getting it for <strong>₹399</strong>.</p>
        <p style="margin:10px 0 0">Why?</p>
        <p style="margin:0">Because we’re building our brand on <strong>logic, not emotion</strong>.</p>
        <p style="margin:0">We want you to experience our Family Office thinking.</p>

        <hr style="border:none;border-top:1px solid #eee;margin:18px 0"/>

        <p style="margin:0 0 10px"><strong>🎁 INSTANT ACCESS:</strong></p>
        <p style="margin:0">✓ Premium PDF blueprint</p>
        <p style="margin:0">✓ Delivered to email + instant download</p>
        <p style="margin:0">✓ Clear next steps for Monday morning</p>

        <hr style="border:none;border-top:1px solid #eee;margin:18px 0"/>

        <p style="margin:0 0 10px"><strong>💡 THE LUXURY BARRIER:</strong></p>
        <p style="margin:0">Mumbai HNIs don’t want “calculators.”</p>
        <p style="margin:0"><strong>They want bespoke wealth architecture.</strong></p>
        <p style="margin:0">This is it.</p>
        <p style="margin:10px 0 0;color:#555">For the price of dinner at Soho House.</p>

        <p style="margin:16px 0 16px">
          <a href="${safeHtml(ctaUrl)}" style="background:#C6A15B;color:#111;text-decoration:none;padding:12px 18px;border-radius:6px;display:inline-block">
            🔥 DOWNLOAD MY PRIVATE EXIT PLAN — ₹399
          </a>
        </p>

        <p style="margin:0"><strong>🏆 INVEST IN LOGIC. NOT EMOTION.</strong></p>
        <p style="margin:8px 0 0">Your move, ${safeHtml(name || "there")}.</p>
        <p style="margin:10px 0 0">— BM Wealth</p>
        <p style="margin:0;color:#555">ARN 90008 | Mumbai, Maharashtra</p>

        <p style="margin:16px 0 0"><strong>P.S.</strong> — Your calculation is 80% complete. The “Tax Harvesting Blueprint” and “Micro-Market Heatmap” are locked in the Premium version.</p>
        <p style="margin:10px 0 0"><strong>P.P.S.</strong> — That daily leak compounds. Every day you delay costs you more. Act now.</p>

        <hr style="border:none;border-top:1px solid #eee;margin:18px 0"/>

        <p style="margin:0;font-size:12px;color:#555">
          This is an illustrative educational tool and mathematical projection. Not SEBI-regulated investment advice.
          Consult your financial advisor before making decisions.
          Mutual fund investments are subject to market risks; read all scheme-related documents carefully.
          <br/>ARN 90008 | IRDAI 277925 | Mumbai
          <br/><a href="${safeHtml(ctaUrl)}">View Full Calculator</a> | <a href="${safeHtml(unsubscribeUrl)}">Unsubscribe</a>
        </p>
      </div>
    `;

    const { lead: savedLead, error: leadError } = await LeadsDB.create({ name, email, phone: phone || null });
    if (leadError) {
      return NextResponse.json({ ok: false, error: "lead_save_failed" }, { status: 500 });
    }

    await logEventSafe({
      event_type: "lead_captured",
      data: {
        source: "property_vs_sip",
        email,
        phone: phone || null,
        whatsappOptIn,
      },
    });

    const emailRes = await EmailService.sendRaw({
      to: email,
      subject,
      html,
    });

    if (!emailRes?.ok) {
      const err = emailRes?.skipped ? "email_not_configured" : "email_send_failed";
      return NextResponse.json({ ok: false, error: err }, { status: 500 });
    }

    return NextResponse.json({ ok: true, leadId: savedLead?.id || null });
  } catch {
    return NextResponse.json({ ok: false, error: "server_error" }, { status: 500 });
  }
}
