function safeHtml(s) {
  return String(s || "")
    .replace(/&/g, "&amp;")
    .replace(/</g, "&lt;")
    .replace(/>/g, "&gt;")
    .replace(/"/g, "&quot;")
    .replace(/'/g, "&#39;");
}

function getBaseUrlSafe() {
  return String(process.env.NEXT_PUBLIC_SITE_URL || "https://bmwealth.co.in").replace(/\/+$/, "");
}

export function buildTaxOptimizationFollowupEmail({
  step = 1,
  leadName,
  executionUrl,
}) {
  const name = safeHtml(String(leadName || "there").trim() || "there");
  const base = getBaseUrlSafe();
  const exec = safeHtml(String(executionUrl || `${base}/execution-partners`).trim());

  if (Number(step) === 2) {
    return {
      subject: "BM Wealth — quick reminder: want us to optimize your tax plan?",
      html: `
        <div style="font-family:Inter,Arial,sans-serif;line-height:1.55;color:#111">
          <h2>Hi ${name},</h2>
          <p>Just checking in — if you want, we can help you execute a clean tax-optimization plan (FY 2025–26) based on your situation.</p>
          <p>
            <a href="${exec}" style="display:inline-block;padding:12px 18px;background:#111;color:#fff;text-decoration:none;border-radius:10px">Talk to an expert →</a>
          </p>
          <p style="font-size:12px;color:#555">BM Wealth | ARN 90008 | Educational guidance, not tax advice.</p>
        </div>
      `,
    };
  }

  return {
    subject: "BM Wealth — your Tax Optimization next steps",
    html: `
      <div style="font-family:Inter,Arial,sans-serif;line-height:1.55;color:#111">
        <h2>Hi ${name},</h2>
        <p>Thanks for using our Tax Optimization Intelligence. If you want, we’ll help you execute the next steps with a short, practical checklist.</p>
        <ul>
          <li>Confirm the correct regime choice for your income + deductions</li>
          <li>Spot missing deduction items (80C/80D/NPS/HRA/home-loan)</li>
          <li>Create a simple monthly action plan</li>
        </ul>
        <p>
          <a href="${exec}" style="display:inline-block;padding:12px 18px;background:#111;color:#fff;text-decoration:none;border-radius:10px">Talk to an expert →</a>
        </p>
        <p style="font-size:12px;color:#555">BM Wealth | ARN 90008 | Educational guidance, not tax advice.</p>
      </div>
    `,
  };
}
