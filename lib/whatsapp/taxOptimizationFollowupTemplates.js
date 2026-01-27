function formatINRShort(n) {
  const x = Number(n);
  if (!Number.isFinite(x) || x <= 0) return "₹0";
  if (x >= 1_00_00_000) return `₹${(x / 1_00_00_000).toFixed(1).replace(/\.0$/, "")}Cr`;
  if (x >= 1_00_000) return `₹${(x / 1_00_000).toFixed(1).replace(/\.0$/, "")}L`;
  return `₹${Math.round(x)}`;
}

export function buildTaxOptimizationWhatsAppSequence({
  leadName,
  executionLink,
  estSavingsInr,
  agentName = "BM Wealth",
}) {
  const name = String(leadName || "").trim() || "there";
  const link = String(executionLink || "").trim();
  const savings = formatINRShort(estSavingsInr);

  return {
    message1: `Hi ${name} — ${agentName} here. I saw you used the Tax Optimization calculator. Want a quick next-step plan to execute it?${estSavingsInr ? ` (potential savings ~ ${savings})` : ""}\n\nReply YES and I’ll guide you. ${link}`.trim(),
    message2: `Quick reminder ${name}: if you want help executing your tax plan (FY 2025–26), reply YES and we’ll take it forward. ${link}`.trim(),
  };
}
