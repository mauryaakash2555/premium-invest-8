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

function safeSubjectText(s) {
  return String(s ?? "")
    .replace(/[\r\n]+/g, " ")
    .replace(/\s+/g, " ")
    .trim();
}

function formatGapCr(n) {
  const v = Math.abs(Number(n));
  if (!Number.isFinite(v) || v <= 0) return "0";
  const cr = v / 1e7;
  const rounded = Math.round(cr * 10) / 10;
  const s = String(rounded);
  return s.endsWith(".0") ? s.slice(0, -2) : s;
}

function buildEmailTracking({ baseUrl, tracking, targetUrl, label }) {
  const t = tracking || null;
  if (!t?.leadId || !t?.messageId) return targetUrl;
  const qs = new URLSearchParams();
  qs.set("u", String(targetUrl || ""));
  qs.set("lid", String(t.leadId));
  qs.set("mid", String(t.messageId));
  if (t.campaign) qs.set("c", String(t.campaign));
  if (t.template) qs.set("t", String(t.template));
  if (label) qs.set("l", String(label));
  return `${String(baseUrl || "").replace(/\/+$/, "")}/api/email/click?${qs.toString()}`;
}

function buildOpenPixelUrl({ baseUrl, tracking }) {
  const t = tracking || null;
  if (!t?.leadId || !t?.messageId) return "";
  const qs = new URLSearchParams();
  qs.set("lid", String(t.leadId));
  qs.set("mid", String(t.messageId));
  if (t.campaign) qs.set("c", String(t.campaign));
  if (t.template) qs.set("t", String(t.template));
  qs.set("v", "1");
  return `${String(baseUrl || "").replace(/\/+$/, "")}/api/email/open?${qs.toString()}`;
}

export function buildPropertyVsSipFreeSummaryEmail({ lead, inputs, siteUrl, tracking = null }) {
  const name = String(lead?.name || "").trim();
  const email = String(lead?.email || "").trim();

  const propertyPriceStr = String(inputs?.propertyPrice ?? "").trim();
  const monthlySipStr = String(inputs?.monthlySip ?? "").trim();
  const yearsStr = String(inputs?.years ?? "").trim();

  const propertyPrice = parseINR(propertyPriceStr);
  const monthlySip = parseINR(monthlySipStr);
  const years = Math.max(1, Math.min(30, Math.round(Number(yearsStr || 0) || 0) || 15));

  const gapOverride = parseINR(inputs?.gap ?? inputs?.wealthGap ?? inputs?.gapInr ?? "");

  let model = null;
  if (!gapOverride) {
    // Import lazily to avoid circular deps.
    const { computeMumbaiPropertyVsSip } = require("@/lib/property-vs-sip");
    model = computeMumbaiPropertyVsSip({ propertyPrice, monthlySip, years });
  }

  const wealthGapAbs = Math.max(0, Math.abs(Number(gapOverride || model?.wealthGap || 0)));
  const gapCrRounded = Math.round((wealthGapAbs / 1e7) * 10) / 10;

  const dailyLeak = years > 0 ? wealthGapAbs / (years * 365) : 0;
  const monthlyLeak = dailyLeak * 30;
  const yearlyLeak = dailyLeak * 360;

  const subject = safeSubjectText(`You're losing ₹${formatGapCr(wealthGapAbs)}Cr. Here's how.`);

  const baseUrl = String(siteUrl || process.env.NEXT_PUBLIC_SITE_URL || "https://bmwealth.co.in").replace(/\/+$/, "");
  const ctaUrl = `${baseUrl}/tools/property-vs-sip`;
  const openPixelUrl = buildOpenPixelUrl({ baseUrl, tracking });
  const trackedCtaUrl = buildEmailTracking({ baseUrl, tracking, targetUrl: ctaUrl, label: "cta_primary" });
  const trackedViewUrl = buildEmailTracking({ baseUrl, tracking, targetUrl: ctaUrl, label: "view_calculator" });
  const unsubscribeUrl = `mailto:support@bmwealth.co.in?subject=${encodeURIComponent("Unsubscribe")}&body=${encodeURIComponent(
    `Please unsubscribe ${email} from Property vs SIP emails.`
  )}`;

  const propertyLine = propertyPriceStr || formatINRNumber(propertyPrice);
  const sipLine = monthlySipStr || formatINRNumber(monthlySip);
  const timelineLine = yearsStr ? `${yearsStr} years` : `${years} years`;
  const wealthGapLine = formatINRNumber(wealthGapAbs);

  const html = `
    <div style="font-family:Inter,Arial,sans-serif;line-height:1.6;color:#111;max-width:700px">
      ${openPixelUrl ? `<img src="${safeHtml(openPixelUrl)}" alt="" width="1" height="1" style="display:none"/>` : ""}
      <p>Hi ${safeHtml(name || "there")},</p>

      <p>Your property vs SIP calculation is done.</p>

      <p><strong>The result:</strong> You're losing <strong>${safeHtml(formatCrLakh(wealthGapAbs))}</strong> by staying in property.</p>

      <p>Here's what that means:</p>

      <hr style="border:none;border-top:1px solid #eee;margin:18px 0"/>

      <p style="margin:0 0 10px"><strong>YOUR DETAILS:</strong></p>
      <p style="margin:0">Property: <strong>${safeHtml(propertyLine)}</strong></p>
      <p style="margin:0">Monthly SIP investing: <strong>${safeHtml(sipLine)}</strong></p>
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
      <p style="margin:0">→ Repairs</p>
      <p style="margin:0">→ Zero liquidity for ${safeHtml(String(years))} years</p>
      <p style="margin:0">→ 4% property growth vs 14.5% SIP growth (math estimate)</p>

      <hr style="border:none;border-top:1px solid #eee;margin:18px 0"/>

      <p style="margin:0 0 10px"><strong>⏰ THE DAILY LEAK:</strong></p>
      <p style="margin:0">Every day you stay in this property trap:</p>
      <p style="margin:6px 0 0">→ Your wealth gap grows by <strong>₹${Math.round(dailyLeak).toLocaleString("en-IN")}</strong> every day</p>
      <p style="margin:0">→ That’s <strong>₹${Math.round(monthlyLeak).toLocaleString("en-IN")}/month</strong></p>
      <p style="margin:0">→ Or <strong>₹${Math.round(yearlyLeak).toLocaleString("en-IN")}/year</strong></p>

      <p style="margin:10px 0 0;color:#555">Slipping away. Silently. Irreversibly.</p>

      <hr style="border:none;border-top:1px solid #eee;margin:18px 0"/>

      <p style="margin:0 0 10px"><strong>Want the full plan?</strong></p>
      <p style="margin:0">I’ve made your <strong>Property Report</strong> (₹399).</p>
      <p style="margin:10px 0 0">This is a calculator, not advice.</p>

      <p style="margin:16px 0 16px">
        <a href="${safeHtml(trackedCtaUrl)}" style="background:#C6A15B;color:#111;text-decoration:none;padding:12px 18px;border-radius:6px;display:inline-block">
          DOWNLOAD MY REPORT — ₹399
        </a>
      </p>

      <p style="margin:0"><strong>Invest with logic, not emotion.</strong></p>
      <p style="margin:8px 0 0">Your move, ${safeHtml(name || "there")}.</p>
      <p style="margin:10px 0 0">— BM Wealth</p>
      <p style="margin:0;color:#555">ARN 90008 | Mumbai, Maharashtra</p>

      <p style="margin:16px 0 0"><strong>P.S.</strong> — Your calculation is 80% complete. The detailed action checklist is included in the Premium version.</p>
      <p style="margin:10px 0 0"><strong>P.P.S.</strong> — This wealth gap keeps growing. Every day you delay costs you more. Act now.</p>

      <hr style="border:none;border-top:1px solid #eee;margin:18px 0"/>

      <p style="margin:0;font-size:12px;color:#555">
        This is a calculator, not advice. Math estimate only.
        <br/>ARN 90008 | Mumbai
        <br/><a href="${safeHtml(trackedViewUrl)}">View Full Calculator</a> | <a href="${safeHtml(unsubscribeUrl)}">Unsubscribe</a>
      </p>
    </div>
  `;

  return { subject, html };
}

export function buildPropertyVsSipPaidPdfEmail({ lead, pdfPayload, attachmentName, tracking = null }) {
  const name = String(lead?.name || "").trim();
  const blocks = pdfPayload?.blocks || {};
  const summaryLines = Array.isArray(blocks?.summaryLines) ? blocks.summaryLines : [];

  const wealthGapLine = summaryLines.find((l) => String(l || "").toLowerCase().includes("wealth gap")) || "";
  const wealthGapNum = Math.abs(parseINR(wealthGapLine));

  const subject = safeSubjectText(`Your Property Report - ₹${formatGapCr(wealthGapNum)}Cr analysis`);

  const baseUrl = String(process.env.NEXT_PUBLIC_SITE_URL || "https://bmwealth.co.in").replace(/\/+$/, "");
  const openPixelUrl = buildOpenPixelUrl({ baseUrl, tracking });

  const html = `
    <div style="font-family:Inter,Arial,sans-serif;line-height:1.55;color:#111;max-width:680px">
      ${openPixelUrl ? `<img src="${safeHtml(openPixelUrl)}" alt="" width="1" height="1" style="display:none"/>` : ""}
      <p>Hi ${safeHtml(name || "there")},</p>

      <p>Payment received (<strong>₹399</strong>).</p>

      <p>Your report is attached. It shows:</p>
      <ul style="margin:8px 0 0;padding-left:20px">
        <li>Why property grows slower</li>
        <li>Why SIP compounds faster</li>
        <li>Your exit options</li>
      </ul>

      <p style="margin:12px 0 0;color:#555;font-size:13px">[ATTACHMENT: ${safeHtml(String(attachmentName || "BM-Wealth-Report.pdf"))}]</p>

      <p style="margin:14px 0 0">Questions? WhatsApp: <strong>+91 8850977259</strong></p>
      <p style="margin:10px 0 0">— BM Wealth (ARN 90008)</p>

      <hr style="border:none;border-top:1px solid #eee;margin:18px 0"/>
      <p style="font-size:12px;color:#555">This is a calculator, not advice. ARN 90008.</p>
    </div>
  `;

  return { subject, html };
}
