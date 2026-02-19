#!/usr/bin/env node
/**
 * Standalone test: generate the ITR Filing Summary PDF with sample data
 * to verify all real numbers appear correctly.
 * Usage: node scripts/test-pdf-gen.mjs
 */
import { jsPDF } from 'jspdf';
import { writeFileSync } from 'fs';

const d = {
  grossSalary: 1250000,
  tds: 85000,
  standardDeduction: 75000,
  deductions80C: 150000,
  employeePAN: 'ATOPM4017E',
  employerName: 'Tata Consultancy Services Limited',
  employerTAN: 'MUMT12345A',
  assessmentYear: '2025-26',
  hraExemption: 48000,
  regime: 'old',
  oldRegimeTax: 67600,
  newRegimeTax: 82400,
  savings: 14800,
  netTaxableIncome: 977000,
};

const fmtMoney = (n) => `₹${Math.round(Number(n || 0)).toLocaleString('en-IN')}`;

const employeePAN = String(d.employeePAN).toUpperCase().trim();
const employerName = String(d.employerName).trim();
const employerTAN = String(d.employerTAN).toUpperCase().trim();
const assessmentYear = String(d.assessmentYear).trim();
const hraExemption = Number(d.hraExemption);
const grossSalary = Number(d.grossSalary);
const tds = Number(d.tds);
const standardDeduction = Number(d.standardDeduction);
const deductions80C = Number(d.deductions80C);
const oldTax = Number(d.oldRegimeTax);
const newTax = Number(d.newRegimeTax);
const savings = Number(d.savings);
const recommended = String(d.regime).toLowerCase();
const netIncome = Number(d.netTaxableIncome);
const totalDeductions = standardDeduction + deductions80C + hraExemption;
const selectedTax = recommended === 'old' ? oldTax : newTax;
const diff = Math.round(selectedTax - tds);
const taxOrRefund = diff > 0 ? `${fmtMoney(diff)} Tax Payable` : diff < 0 ? `${fmtMoney(Math.abs(diff))} Refund Due` : `${fmtMoney(0)} Nil`;

const doc = new jsPDF({ unit: 'mm', format: 'a4' });
const pw = doc.internal.pageSize.getWidth();
const ph = doc.internal.pageSize.getHeight();
const lm = 18;
const rm = pw - 18;
const contentWidth = rm - lm;
let y = 0;

const drawRect = (x, _y, w, h, r, g, b) => {
  doc.setFillColor(r, g, b);
  doc.rect(x, _y, w, h, 'F');
};
const checkPage = (needed = 25) => {
  if (y + needed > ph - 20) { doc.addPage(); y = 20; }
};

// ═══ HEADER ═══
drawRect(0, 0, pw, 44, 15, 15, 20);
doc.setFont('helvetica', 'bold');
doc.setFontSize(22);
doc.setTextColor(255, 255, 255);
doc.text('BM Wealth', lm, 18);
doc.setFont('helvetica', 'normal');
doc.setFontSize(11);
doc.setTextColor(180, 190, 210);
doc.text('ITR Filing Summary — Form 16 Analysis', lm, 28);
doc.setFontSize(9);
doc.setTextColor(140, 150, 170);
doc.text(`Generated: ${new Date().toLocaleDateString('en-IN', { day: 'numeric', month: 'long', year: 'numeric' })}`, lm, 37);
doc.setFont('helvetica', 'bold');
doc.setFontSize(10);
doc.setTextColor(100, 181, 246);
doc.text(`PAN: ${employeePAN}`, rm, 18, { align: 'right' });
doc.setFontSize(9);
doc.setTextColor(140, 150, 170);
doc.text(`AY: ${assessmentYear}`, rm, 28, { align: 'right' });
y = 52;

// ═══ SECTION 1 ═══
doc.setFont('helvetica', 'bold');
doc.setFontSize(13);
doc.setTextColor(15, 15, 20);
doc.text('SECTION 1 — Your Details', lm, y);
y += 3;
doc.setDrawColor(100, 181, 246);
doc.setLineWidth(0.8);
doc.line(lm, y, lm + 55, y);
y += 7;

drawRect(lm, y, contentWidth, 8, 240, 245, 250);
doc.setFont('helvetica', 'bold');
doc.setFontSize(8);
doc.setTextColor(80, 80, 90);
doc.text('FIELD', lm + 4, y + 5.5);
doc.text('VALUE', lm + 75, y + 5.5);
y += 10;

const detailRows = [
  ['Employee PAN', employeePAN],
  ['Employer Name', employerName.length > 45 ? employerName.slice(0, 44) + '...' : employerName],
  ['Employer TAN', employerTAN],
  ['Assessment Year', assessmentYear],
  ['Gross Salary', fmtMoney(grossSalary)],
  ['HRA Exemption', fmtMoney(hraExemption)],
  ['Standard Deduction', fmtMoney(standardDeduction)],
  ['80C Deductions', fmtMoney(deductions80C)],
  ['TDS Already Deducted', fmtMoney(tds)],
  ['Net Taxable Income', fmtMoney(netIncome)],
  ['Tax Payable / Refund', taxOrRefund],
];

doc.setFontSize(9.5);
for (let i = 0; i < detailRows.length; i++) {
  const [label, val] = detailRows[i];
  if (i % 2 === 0) drawRect(lm, y - 3.5, contentWidth, 7.5, 248, 250, 252);
  doc.setFont('helvetica', 'normal');
  doc.setTextColor(90, 90, 100);
  doc.text(label, lm + 4, y);
  doc.setFont('helvetica', 'bold');
  doc.setTextColor(15, 15, 20);
  doc.text(String(val || '—'), lm + 75, y);
  y += 7.5;
}
y += 6;

// ═══ SECTION 2 ═══
checkPage(70);
doc.setDrawColor(220, 220, 225);
doc.setLineWidth(0.3);
doc.line(lm, y, rm, y);
y += 8;
doc.setFont('helvetica', 'bold');
doc.setFontSize(13);
doc.setTextColor(15, 15, 20);
doc.text('SECTION 2 — Tax Regime Comparison', lm, y);
y += 3;
doc.setDrawColor(100, 181, 246);
doc.setLineWidth(0.8);
doc.line(lm, y, lm + 70, y);
y += 10;

const cardW = (contentWidth - 8) / 2;
const cardH = 46;
const cardY = y;

const oldIsRecommended = recommended === 'old';
drawRect(lm, cardY, cardW, cardH, oldIsRecommended ? 235 : 248, oldIsRecommended ? 245 : 250, oldIsRecommended ? 255 : 252);
if (oldIsRecommended) {
  doc.setDrawColor(100, 181, 246);
  doc.setLineWidth(0.6);
  doc.rect(lm, cardY, cardW, cardH, 'S');
}
doc.setFont('helvetica', 'bold');
doc.setFontSize(11);
doc.setTextColor(15, 15, 20);
doc.text('Old Regime', lm + 6, cardY + 10);
if (oldIsRecommended) {
  doc.setFontSize(7);
  doc.setTextColor(100, 181, 246);
  doc.text('✓ RECOMMENDED', lm + 6, cardY + 16);
}
doc.setFont('helvetica', 'normal');
doc.setFontSize(9);
doc.setTextColor(90, 90, 100);
doc.text(`Gross Income: ${fmtMoney(grossSalary)}`, lm + 6, cardY + 24);
doc.text(`Deductions: ${fmtMoney(totalDeductions)}`, lm + 6, cardY + 31);
doc.setFont('helvetica', 'bold');
doc.setFontSize(10);
doc.setTextColor(15, 15, 20);
doc.text(`Tax Payable: ${fmtMoney(oldTax)}`, lm + 6, cardY + 40);

const newCardX = lm + cardW + 8;
const newIsRecommended = recommended === 'new';
drawRect(newCardX, cardY, cardW, cardH, newIsRecommended ? 235 : 248, newIsRecommended ? 245 : 250, newIsRecommended ? 255 : 252);
if (newIsRecommended) {
  doc.setDrawColor(100, 181, 246);
  doc.setLineWidth(0.6);
  doc.rect(newCardX, cardY, cardW, cardH, 'S');
}
doc.setFont('helvetica', 'bold');
doc.setFontSize(11);
doc.setTextColor(15, 15, 20);
doc.text('New Regime', newCardX + 6, cardY + 10);
if (newIsRecommended) {
  doc.setFontSize(7);
  doc.setTextColor(100, 181, 246);
  doc.text('✓ RECOMMENDED', newCardX + 6, cardY + 16);
}
doc.setFont('helvetica', 'normal');
doc.setFontSize(9);
doc.setTextColor(90, 90, 100);
doc.text(`Gross Income: ${fmtMoney(grossSalary)}`, newCardX + 6, cardY + 24);
doc.text(`Deductions: ${fmtMoney(0)} (not applicable)`, newCardX + 6, cardY + 31);
doc.setFont('helvetica', 'bold');
doc.setFontSize(10);
doc.setTextColor(15, 15, 20);
doc.text(`Tax Payable: ${fmtMoney(newTax)}`, newCardX + 6, cardY + 40);

y = cardY + cardH + 8;

drawRect(lm, y, contentWidth, 16, 235, 245, 255);
doc.setDrawColor(100, 181, 246);
doc.setLineWidth(0.4);
doc.rect(lm, y, contentWidth, 16, 'S');
doc.setFont('helvetica', 'bold');
doc.setFontSize(12);
doc.setTextColor(15, 15, 20);
const savingsText = `Potential Savings: ${fmtMoney(savings)}`;
const savingsTextW = doc.getTextWidth(savingsText);
doc.text(savingsText, lm + (contentWidth - savingsTextW) / 2, y + 10.5);
y += 24;

// ═══ SECTION 3 ═══
checkPage(75);
doc.setDrawColor(220, 220, 225);
doc.setLineWidth(0.3);
doc.line(lm, y, rm, y);
y += 8;
doc.setFont('helvetica', 'bold');
doc.setFontSize(13);
doc.setTextColor(15, 15, 20);
doc.text('SECTION 3 — How to File in 6 Steps', lm, y);
y += 3;
doc.setDrawColor(100, 181, 246);
doc.setLineWidth(0.8);
doc.line(lm, y, lm + 65, y);
y += 10;

const filingSteps = [
  {
    title: 'Login to the IT Portal',
    desc: `Go to incometax.gov.in and sign in using your PAN: ${employeePAN}. If first time, register with Aadhaar-linked mobile.`,
  },
  {
    title: 'Start Your Return',
    desc: `Select Assessment Year ${assessmentYear} and choose ITR-1 (Sahaj) — for salaried individuals with income up to ₹50 lakh.`,
  },
  {
    title: 'Enter Salary Details',
    desc: `Enter Gross Salary: ${fmtMoney(grossSalary)}, Standard Deduction: ${fmtMoney(standardDeduction)}. Cross-check against Form 16 from ${employerName.length > 35 ? employerName.slice(0, 34) + '...' : employerName}.`,
  },
  {
    title: 'Choose Your Tax Regime',
    desc: `Select Old Regime (estimated savings: ${fmtMoney(savings)}). Old Regime Tax: ${fmtMoney(oldTax)} vs New Regime Tax: ${fmtMoney(newTax)}.`,
  },
  {
    title: 'Verify TDS & Deductions',
    desc: `TDS deducted by ${employerName.length > 30 ? employerName.slice(0, 29) + '...' : employerName}: ${fmtMoney(tds)}. 80C Deductions: ${fmtMoney(deductions80C)}. HRA Exemption: ${fmtMoney(hraExemption)}.`,
  },
  {
    title: 'Submit & e-Verify',
    desc: `Review the summary, submit the return, then e-Verify via Aadhaar OTP (fastest method). Keep Form 16, AIS, and 26AS for records.`,
  },
];

for (let i = 0; i < filingSteps.length; i++) {
  const step = filingSteps[i];
  checkPage(22);
  drawRect(lm, y - 3, 7, 7, 100, 181, 246);
  doc.setFont('helvetica', 'bold');
  doc.setFontSize(8);
  doc.setTextColor(255, 255, 255);
  doc.text(String(i + 1), lm + 2.3, y + 1.5);
  doc.setFont('helvetica', 'bold');
  doc.setFontSize(10.5);
  doc.setTextColor(15, 15, 20);
  doc.text(step.title, lm + 12, y + 1);
  y += 6;
  doc.setFont('helvetica', 'normal');
  doc.setFontSize(9);
  doc.setTextColor(80, 80, 90);
  const descLines = doc.splitTextToSize(step.desc, contentWidth - 14);
  doc.text(descLines, lm + 12, y);
  y += descLines.length * 4.5 + 5;
}
y += 4;

// ═══ FOOTER ═══
checkPage(30);
doc.setDrawColor(220, 220, 225);
doc.setLineWidth(0.3);
doc.line(lm, y, rm, y);
y += 8;
doc.setFont('helvetica', 'bold');
doc.setFontSize(8);
doc.setTextColor(140, 140, 150);
doc.text('DISCLAIMER', lm, y);
y += 5;
doc.setFont('helvetica', 'normal');
doc.setFontSize(7.5);
doc.setTextColor(140, 140, 150);
const disclaimerText = 'This is an educational summary for reference only. It does not constitute professional tax advice. All values are extracted from your uploaded document and may require verification. Please cross-check every figure with your original Form 16, AIS, and 26AS before filing. Consult a Chartered Accountant for personalised tax guidance.';
const disclaimerLines = doc.splitTextToSize(disclaimerText, contentWidth);
doc.text(disclaimerLines, lm, y);
y += disclaimerLines.length * 3.5 + 6;
doc.setFont('helvetica', 'bold');
doc.setFontSize(8);
doc.setTextColor(100, 181, 246);
doc.text('BM Wealth', lm, y);
doc.setFont('helvetica', 'normal');
doc.setFontSize(7.5);
doc.setTextColor(100, 100, 110);
doc.text('  |  www.bmwealth.co.in  |  tools@bmwealth.co.in', lm + doc.getTextWidth('BM Wealth'), y);

const buf = doc.output('arraybuffer');
writeFileSync('ITR-Filing-Summary-BM-Wealth.pdf', Buffer.from(buf));
console.log('PDF generated: ITR-Filing-Summary-BM-Wealth.pdf');
console.log('Size:', Buffer.from(buf).length, 'bytes');
