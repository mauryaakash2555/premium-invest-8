import { BrevoClient } from "@getbrevo/brevo";

const BREVO_API_KEY = process.env.BREVO_API_KEY;
const SENDER_EMAIL = process.env.BREVO_SENDER_EMAIL || "support@bmwealth.co.in";
const SENDER_NAME = process.env.BREVO_SENDER_NAME || "BM Wealth";

function getClient() {
  if (!BREVO_API_KEY) throw new Error("BREVO_API_KEY is not configured");
  return new BrevoClient({ apiKey: BREVO_API_KEY });
}

function isPms(interest) {
  return String(interest || "").includes("PMS");
}

function buildSubject(interest) {
  return isPms(interest)
    ? "Your Portfolio Strategy Guide — BM Wealth"
    : "Your Wealth Planning Guide — BM Wealth";
}

function buildGuideDescription(interest) {
  return isPms(interest)
    ? "your <strong>Portfolio Strategy Guide</strong> — a focused overview of Portfolio Management Services for investors with ₹50L+ portfolios."
    : "your <strong>Wealth Planning Beginner Guide</strong> — a structured starting point to understand SIPs, mutual funds, and smart wealth-building strategies.";
}

function buildHtml({ name, interest, guideUrl }) {
  const firstName = String(name || "").split(" ")[0] || "there";
  const guideDesc = buildGuideDescription(interest);

  return `<!DOCTYPE html>
<html lang="en">
<head><meta charset="utf-8"><meta name="viewport" content="width=device-width,initial-scale=1.0"></head>
<body style="margin:0;padding:0;background:#111;">
<table width="100%" cellpadding="0" cellspacing="0" style="background:#111;padding:40px 0;">
<tr><td align="center">
<table width="600" cellpadding="0" cellspacing="0" style="background:#1a1a1a;border-radius:12px;overflow:hidden;max-width:100%;">

  <!-- Header -->
  <tr><td style="padding:36px 40px 20px;text-align:center;border-bottom:1px solid rgba(201,169,110,0.2);">
    <h1 style="margin:0;font-family:'Georgia',serif;font-size:26px;font-weight:400;color:#c9a96e;letter-spacing:0.5px;">
      BM Wealth
    </h1>
    <p style="margin:6px 0 0;font-family:Arial,sans-serif;font-size:11px;letter-spacing:2px;text-transform:uppercase;color:rgba(255,255,255,0.35);">
      Wealth Planning &bull; Investment Advisory
    </p>
  </td></tr>

  <!-- Body -->
  <tr><td style="padding:36px 40px;">
    <p style="margin:0 0 18px;font-family:Arial,sans-serif;font-size:15px;line-height:1.7;color:#e0e0e0;">
      Dear ${firstName},
    </p>
    <p style="margin:0 0 18px;font-family:Arial,sans-serif;font-size:15px;line-height:1.7;color:#e0e0e0;">
      Thank you for your interest in BM Wealth. We're pleased to share ${guideDesc}
    </p>
    <p style="margin:0 0 28px;font-family:Arial,sans-serif;font-size:15px;line-height:1.7;color:#e0e0e0;">
      Click the button below to download your guide:
    </p>

    <!-- CTA Button -->
    <table cellpadding="0" cellspacing="0" style="margin:0 auto 32px;">
    <tr><td align="center" style="background:#c9a96e;border-radius:6px;">
      <a href="${guideUrl}" target="_blank" rel="noopener noreferrer"
         style="display:inline-block;padding:14px 36px;font-family:Arial,sans-serif;font-size:13px;font-weight:600;letter-spacing:1.5px;text-transform:uppercase;color:#111;text-decoration:none;">
        Download Your Guide &darr;
      </a>
    </td></tr>
    </table>

    <p style="margin:0 0 8px;font-family:Arial,sans-serif;font-size:13px;color:rgba(255,255,255,0.45);text-align:center;">
      If the button doesn't work, copy and paste this link:<br>
      <a href="${guideUrl}" style="color:#c9a96e;word-break:break-all;">${guideUrl}</a>
    </p>
  </td></tr>

  <!-- Divider -->
  <tr><td style="padding:0 40px;">
    <hr style="border:none;border-top:1px solid rgba(255,255,255,0.08);margin:0;">
  </td></tr>

  <!-- Contact -->
  <tr><td style="padding:28px 40px;">
    <p style="margin:0 0 12px;font-family:Arial,sans-serif;font-size:13px;color:rgba(255,255,255,0.5);">
      Have questions? Reach out to us:
    </p>
    <p style="margin:0;font-family:Arial,sans-serif;font-size:13px;line-height:2;color:rgba(255,255,255,0.6);">
      📞&nbsp; <a href="tel:+918850977259" style="color:#c9a96e;text-decoration:none;">+91 8850977259</a><br>
      ✉️&nbsp; <a href="mailto:support@bmwealth.co.in" style="color:#c9a96e;text-decoration:none;">support@bmwealth.co.in</a><br>
      🌐&nbsp; <a href="https://bmwealth.co.in" style="color:#c9a96e;text-decoration:none;">bmwealth.co.in</a>
    </p>
  </td></tr>

  <!-- Disclaimer -->
  <tr><td style="padding:20px 40px 28px;background:rgba(0,0,0,0.3);">
    <p style="margin:0;font-family:Arial,sans-serif;font-size:10px;line-height:1.6;color:rgba(255,255,255,0.25);">
      BM Wealth is a PMS distributor (Cert. 2430447816), AMFI-registered mutual fund distributor
      (ARN 90008), and IRDAI-licensed insurance distributor (277925). This email is for educational
      purposes only and does not constitute investment advice. Mutual fund investments are subject
      to market risks.
    </p>
  </td></tr>

</table>
</td></tr>
</table>
</body>
</html>`;
}

/**
 * Send the wealth planning guide email to a lead.
 * @param {{ name: string, email: string, interest: string, guideUrl: string }} params
 * @returns {Promise<{ messageId: string }>}
 */
export async function sendGuideEmail({ name, email, interest, guideUrl }) {
  const client = getClient();
  const result = await client.transactionalEmails.sendTransacEmail({
    sender: { name: SENDER_NAME, email: SENDER_EMAIL },
    to: [{ email, name }],
    subject: buildSubject(interest),
    htmlContent: buildHtml({ name, interest, guideUrl }),
  });
  return result;
}
