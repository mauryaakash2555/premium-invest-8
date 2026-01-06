import { compareRegimesFY2526, formatINR } from "@/lib/tax-formulas";

function safeHtml(s) {
  return String(s ?? "")
    .replace(/&/g, "&amp;")
    .replace(/</g, "&lt;")
    .replace(/>/g, "&gt;")
    .replace(/\"/g, "&quot;")
    .replace(/'/g, "&#39;");
}

export function buildTaxBlueprintPaidPdfEmail({ lead, inputs }) {
  const cmp = compareRegimesFY2526(inputs || {});
  const best = cmp.winner === "old" ? "Old Regime" : cmp.winner === "new" ? "New Regime" : "Tie";

  const name = String(lead?.name || "").trim() || "there";

  const subject = "Your Tax Optimization Blueprint is Ready!";
  const html = `
    <div style="font-family:Inter,Arial,sans-serif;line-height:1.5;color:#111">
      <h2>Your Tax Optimization Blueprint is Ready</h2>
      <p>Hi ${safeHtml(name)},</p>
      <p>Payment received for <strong>BM Wealth Tax Optimization Intelligence (FY 2025–26)</strong>.</p>
      <p><strong>Optimal regime:</strong> ${safeHtml(best)}<br/>
         <strong>Estimated savings:</strong> ${safeHtml(formatINR(cmp.savings))}</p>
      <p>Your PDF is attached. If you need help, reply to this email.</p>
      <hr/>
      <p style="font-size:12px;color:#555">ARN 90008 | IRDAI 277925. Educational tool only. Not investment advice.</p>
    </div>
  `;

  return { subject, html };
}
