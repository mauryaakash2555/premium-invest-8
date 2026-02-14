function safe(v) {
  return String(v ?? '').trim();
}

function firstName(fullName) {
  const n = safe(fullName);
  if (!n) return '';
  return n.split(/\s+/)[0] || '';
}

function formatINRCompact(n) {
  const v = Number(n);
  if (!Number.isFinite(v)) return '₹0';
  if (v >= 1e7) {
    const cr = v / 1e7;
    const rounded = Math.round(cr * 10) / 10;
    const clean = String(rounded).endsWith('.0') ? String(Math.round(rounded)) : String(rounded);
    return `₹${clean}Cr`;
  }
  if (v >= 1e5) {
    const lakh = v / 1e5;
    const rounded = Math.round(lakh * 10) / 10;
    const clean = String(rounded).endsWith('.0') ? String(Math.round(rounded)) : String(rounded);
    return `₹${clean}L`;
  }
  if (v >= 1e3) {
    const k = v / 1e3;
    const rounded = Math.round(k);
    return `₹${rounded}K`;
  }
  return `₹${Math.round(v).toLocaleString('en-IN')}`;
}

function formatCr1(n) {
  const v = Math.abs(Number(n));
  if (!Number.isFinite(v)) return '₹0Cr';
  const cr = v / 1e7;
  const rounded = Math.round(cr * 10) / 10;
  const clean = String(rounded).endsWith('.0') ? String(Math.round(rounded)) : String(rounded);
  return `₹${clean}Cr`;
}

export function buildPropertyVsSipWhatsAppSequence({
  leadName,
  propertyPrice,
  monthlySip,
  years,
  wealthGap,
  paymentLink,
  agentName,
  agentSignature,
}) {
  const fn = firstName(leadName) || 'there';

  const propLine = formatINRCompact(propertyPrice);
  const sipLine = formatINRCompact(monthlySip);
  const yearsLine = `${Number(years) || 15}-year timeline`;

  const gapCr = formatCr1(wealthGap);

  const agent = safe(agentName) || 'Brahmdeo';
  const signature = safe(agentSignature) || `— ${agent}\nBM Wealth | ARN 90008`;

  const link = safe(paymentLink) || '';

  const message1 = `Hi ${fn},\n\n${agent} from BM Wealth here.\n\nSaw your Property vs SIP analysis earlier today.\n\nThat ${gapCr} gap is exactly why we're helping 50+ Mumbai families move to Liquid PMS this quarter.\n\nQuick question: Did you get the Private Exit Plan yet, or should I send the payment link here?\n\nNo pressure - just want to make sure you have the roadmap if you need it.\n\n${signature}`;

  const message2 = `${fn}, quick follow-up.\n\nI'm looking at your calculation again:\n- ${propLine} property\n- ${sipLine} monthly capacity\n- ${safe(yearsLine)}\n\nThe ${gapCr} gap is real.\n\nBut here's what most people miss:\n\nThe FIRST YEAR is the most critical.\n\nIf you don't optimize in Year 1, the compounding effect makes it nearly impossible to catch up.\n\nYour Exit Plan shows you exactly what to do in Month 1, 2, 3... all the way to Year ${Number(years) || 15}.\n\nWant me to send the link?\n\n— ${agent}`;

  const message3 = `${fn}, last message from me.\n\nI don't want to spam you.\n\nBut I also don't want you to look back in ${new Date().getFullYear() + (Number(years) || 15)} and realize you could've saved ${gapCr} by taking action in ${new Date().getFullYear()}.\n\nYour analysis is archived after 48 hours.\n\nIf you want the Exit Plan, grab it now:\n👉 ${link || '[Payment Link]'}\n\nIf not, no worries. You know where to find us.\n\nBest of luck with your wealth journey.\n\n— ${agent} Maurya\nBM Wealth | Mumbai`;

  return {
    message1,
    message2,
    message3,
    meta: { fn, propLine, sipLine, yearsLine, gapCr },
  };
}
