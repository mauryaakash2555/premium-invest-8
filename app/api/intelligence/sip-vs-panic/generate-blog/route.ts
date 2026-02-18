import { NextResponse } from "next/server";

export const runtime = "nodejs";

function lakhs(amount: number): string {
  const v = Number.isFinite(amount) ? Math.max(0, amount) : 0;
  return `₹${(v / 100_000).toFixed(1)}L`;
}

export async function POST(req: Request) {
  try {
    const body = await req.json().catch(() => ({}));

    const monthly = Number(body?.monthly_amount ?? 0);
    const years = Number(body?.duration_years ?? 0);
    const cost = Number(body?.behavioral_cost ?? 0);
    const scenario = String(body?.scenario_name ?? "Panic selling");
    const userCount = Number(body?.user_count ?? 0);

    const title = `Why ${scenario} Can Cost You ${lakhs(cost)} (SIP vs Panic Simulation)`;

    const md = `---\n` +
      `title: "${title.replace(/\"/g, "'")}"\n` +
      `description: "Education-only: the behavioral cost of stopping SIPs during drawdowns."\n` +
      `---\n\n` +
      `# ${title}\n\n` +
      `${userCount > 0 ? `Meta: ${userCount.toLocaleString('en-IN')} users ran a similar simulation in the last 30 days.\n\n` : ""}` +
      `Most investors feel fear around drawdowns. This simulator shows the **post-tax** cost of reacting emotionally.\n\n` +
      `## Inputs\n` +
      `- Monthly SIP: ₹${Math.max(0, monthly).toLocaleString('en-IN')}\n` +
      `- Duration: ${Math.max(0, years)} years\n\n` +
      `## The brutal math\n` +
      `- Behavioral cost: **${lakhs(cost)}**\n\n` +
      `## Why this happens\n` +
      `1. You stop buying when units are cheaper.\n` +
      `2. You miss part of the recovery rally.\n` +
      `3. Compounding never accelerates the same way.\n\n` +
      `## Try it yourself\n` +
      `Run your own simulation: https://www.bmwealth.co.in/intelligence/sip-vs-panic\n\n` +
      `> Disclaimer: Education-only. Not investment/tax/legal advice.\n`;

    return NextResponse.json({ ok: true, title, markdown: md });
  } catch (e: any) {
    return NextResponse.json({ ok: false, error: e?.message || "unknown" }, { status: 500 });
  }
}
