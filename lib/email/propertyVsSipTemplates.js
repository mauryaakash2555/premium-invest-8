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

function formatINRNumber(n) {
  const v = Number(n);
  if (!Number.isFinite(v)) return "₹0";
  return `₹${Math.round(v).toLocaleString("en-IN")}`;
}

export function buildPropertyVsSipFreeSummaryEmail({ lead, inputs, siteUrl }) {
  const name = String(lead?.name || "").trim();
  const email = String(lead?.email || "").trim();

  const propertyPriceStr = String(inputs?.propertyPrice ?? "").trim();
  const monthlySipStr = String(inputs?.monthlySip ?? "").trim();
  const yearsStr = String(inputs?.years ?? "").trim();

  const propertyPrice = parseINR(propertyPriceStr);
  const monthlySip = parseINR(monthlySipStr);
  const years = Math.max(1, Math.min(30, Math.round(Number(yearsStr || 0) || 0) || 15));

  // Import lazily to avoid circular deps.
  const { computeMumbaiPropertyVsSip } = require("@/lib/property-vs-sip");
  const model = computeMumbaiPropertyVsSip({ propertyPrice, monthlySip, years });

  const wealthGapAbs = Math.max(0, Math.abs(Number(model?.wealthGap || 0)));
  const gapCrRounded = Math.round((wealthGapAbs / 1e7) * 10) / 10;

  const dailyLeak = years > 0 ? wealthGapAbs / (years * 365) : 0;
  const monthlyLeak = dailyLeak * 30;
  const yearlyLeak = dailyLeak * 360;

  const variant = hashMod3(email);
  const subjectA = `🚨 CRITICAL: Your ${formatCrLakh(wealthGapAbs)} Wealth Leak identified`;
  const subjectB = `${name || "You"}, your ${formatCrLakh(propertyPrice)} property is bleeding money`;
  const subjectC = `This Mumbai property mistake costs ₹${Math.round(monthlyLeak).toLocaleString("en-IN")}/month`;
  const subject = variant === 1 ? subjectB : variant === 2 ? subjectC : subjectA;

  const baseUrl = String(siteUrl || process.env.NEXT_PUBLIC_SITE_URL || "https://bmwealth.co.in").replace(/\/+$/, "");
  const ctaUrl = `${baseUrl}/tools/property-vs-sip`;
  const unsubscribeUrl = `mailto:support@bmwealth.co.in?subject=${encodeURIComponent("Unsubscribe")}&body=${encodeURIComponent(
    `Please unsubscribe ${email} from Property vs SIP emails.`
  )}`;

  const propertyLine = propertyPriceStr || formatINRNumber(propertyPrice);
  const sipLine = monthlySipStr || formatINRNumber(monthlySip);
  const timelineLine = yearsStr ? `${yearsStr} years` : `${years} years`;
  const wealthGapLine = formatINRNumber(wealthGapAbs);

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
      <p style="margin:0">It’s a structured, math-first roadmap to help you act on these numbers (educational model, not advice).</p>

      <p style="margin:16px 0 16px">
        <a href="${safeHtml(ctaUrl)}" style="background:#C6A15B;color:#111;text-decoration:none;padding:12px 18px;border-radius:6px;display:inline-block">
          🔥 DOWNLOAD MY PRIVATE EXIT PLAN — ₹399
        </a>
      </p>

      <p style="margin:0"><strong>🏆 INVEST IN LOGIC. NOT EMOTION.</strong></p>
      <p style="margin:8px 0 0">Your move, ${safeHtml(name || "there")}.</p>
      <p style="margin:10px 0 0">— BM Wealth</p>
      <p style="margin:0;color:#555">ARN 90008 | Mumbai, Maharashtra</p>

      <p style="margin:16px 0 0"><strong>P.S.</strong> — Your calculation is 80% complete. The detailed action checklist is included in the Premium version.</p>
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

  return { subject, html };
}

export function buildPropertyVsSipPaidPdfEmail({ lead, pdfPayload, attachmentName }) {
  const name = String(lead?.name || "").trim();
  const blocks = pdfPayload?.blocks || {};
  const coverLines = blocks?.coverLines;
  const summaryLines = Array.isArray(blocks?.summaryLines) ? blocks.summaryLines : [];

  const wealthGapLine = summaryLines.find((l) => String(l || "").toLowerCase().includes("wealth gap")) || "";
  const wealthGapNum = Math.abs(parseINR(wealthGapLine));
  const wealthGapFormatted = wealthGapNum ? formatINRNumber(wealthGapNum) : "₹0";

  const emailFooter = String(
    pdfPayload?.meta?.emailFooter ||
      pdfPayload?.meta?.disclaimerFooter ||
      "Disclaimer: BM Wealth (ARN 90008) is an AMFI-registered Mutual Fund Distributor. This report is a mathematical projection based on historical market data (Property 4% / Equity 14.5%) and is intended for educational purposes only. This is not SEBI-regulated investment advice. Mutual fund investments are subject to market risks; read all scheme-related documents carefully."
  );

  const subject = String(pdfPayload?.meta?.emailSubject || "📥 Your Private Wealth Roadmap: Property vs SIP Analysis");

  const html = `
    <div style="font-family:Inter,Arial,sans-serif;line-height:1.55;color:#111;max-width:680px">
      <p>Dear ${safeHtml(name || "Customer")},</p>
      <p>Your payment of <strong>₹399</strong> has been successfully processed.</p>
      <p><strong>Attached is your Property vs SIP Wealth Gap Report.</strong></p>
      <p>
        This report is a cold, mathematical audit of your financial trajectory. It replaces emotional bias with the reality of compounding and maintenance drag.
      </p>

      <p style="margin:16px 0 8px"><strong>Inside your Roadmap:</strong></p>
      <ul style="margin:8px 0 0;padding-left:20px">
        <li><strong>The ${safeHtml(wealthGapFormatted)} Factor:</strong> See exactly where your wealth is leaking (model-based).</li>
        <li><strong>Locked Assumptions:</strong> Property 4% vs Equity 14.5% and the drag factors used.</li>
        <li><strong>Action Checklist:</strong> Practical next steps and common mistakes to avoid.</li>
      </ul>

      <p style="margin:16px 0 0"><strong>Why this matters:</strong> In the Mumbai of 2026, wealth is no longer about how many walls you own; it’s about how fast your capital compounds.</p>

      <p style="margin:12px 0 0;color:#555;font-size:13px">[ATTACHMENT: ${safeHtml(String(attachmentName || "BM-Wealth-Report.pdf"))}]</p>

      <p style="margin:14px 0 0"><em>Need help decoding these numbers? Reply to this email or message our desk at +91 8850977259.</em></p>
      <p style="margin:14px 0 0"><strong>Invest in Logic. Not Emotion.</strong></p>
      <p style="margin:8px 0 0">— BM Wealth (ARN 90008)</p>

      <hr style="border:none;border-top:1px solid #eee;margin:18px 0"/>
      <p style="font-size:12px;color:#555">${safeHtml(emailFooter)}</p>
    </div>
  `;

  return { subject, html };
}
