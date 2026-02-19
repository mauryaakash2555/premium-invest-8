#!/usr/bin/env node
/**
 * Standalone test: generate the premium ITR Filing Summary PDF
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
  employerName: 'Deloitte Support Services India Private Limited',
  employerTAN: 'MUMT12345A',
  assessmentYear: '2025-26',
  hraExemption: 48000,
  regime: 'old',
  oldRegimeTax: 67600,
  newRegimeTax: 82400,
  savings: 14800,
  netTaxableIncome: 977000,
};

const fmtMoney = (n) => {
  const v = Math.round(Number(n || 0));
  return '\u20B9' + v.toLocaleString('en-IN');
};

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

// Gold palette
const GOLD = [212, 175, 55];
const DARK = [28, 28, 32];
const MID = [100, 100, 110];
const LIGHT = [160, 160, 168];

const doc = new jsPDF({ unit: 'mm', format: 'a4' });
const pw = doc.internal.pageSize.getWidth();
const ph = doc.internal.pageSize.getHeight();
const margin = 20;
const rm = pw - margin;
const cw = rm - margin;
let y = 0;

const fill = (x, _y, w, h, col) => { doc.setFillColor(...col); doc.rect(x, _y, w, h, 'F'); };
const goldLine = (_y, x1, x2) => { doc.setDrawColor(...GOLD); doc.setLineWidth(0.5); doc.line(x1 ?? margin, _y, x2 ?? rm, _y); };
const greyLine = (_y) => { doc.setDrawColor(225, 225, 228); doc.setLineWidth(0.25); doc.line(margin, _y, rm, _y); };
const pageBreak = (need = 30) => { if (y + need > ph - 25) { doc.addPage(); y = 22; } };

// ── HEADER ──
fill(0, 0, pw, 50, DARK);
doc.setDrawColor(...GOLD); doc.setLineWidth(0.8); doc.line(0, 50, pw, 50);

doc.setFont('times', 'bold'); doc.setFontSize(26); doc.setTextColor(...GOLD);
doc.text('BM Wealth', margin, 22);
doc.setFont('helvetica', 'normal'); doc.setFontSize(12); doc.setTextColor(200, 200, 210);
doc.text('ITR Filing Summary', margin, 32);
doc.setFontSize(9.5); doc.setTextColor(150, 150, 165);
doc.text('Personalised Form 16 Analysis', margin, 40);

doc.setFont('helvetica', 'bold'); doc.setFontSize(9); doc.setTextColor(...GOLD);
doc.text(employeePAN, rm, 20, { align: 'right' });
doc.setFont('helvetica', 'normal'); doc.setFontSize(8.5); doc.setTextColor(170, 170, 180);
doc.text(`Assessment Year ${assessmentYear}`, rm, 28, { align: 'right' });
doc.text(new Date().toLocaleDateString('en-IN', { day: 'numeric', month: 'long', year: 'numeric' }), rm, 36, { align: 'right' });

y = 62;

// ── SECTION 1 ──
doc.setFont('times', 'bold'); doc.setFontSize(16); doc.setTextColor(...DARK);
doc.text('Your Details', margin, y);
y += 2;
goldLine(y, margin, margin + 32);
y += 10;

const detailRows = [
  ['Employee PAN', employeePAN, false],
  ['Employer Name', employerName, false],
  ['Employer TAN', employerTAN, false],
  ['Assessment Year', assessmentYear, false],
  ['', '', 'divider'],
  ['Gross Salary', fmtMoney(grossSalary), true],
  ['HRA Exemption', fmtMoney(hraExemption), true],
  ['Standard Deduction', fmtMoney(standardDeduction), true],
  ['80C Deductions', fmtMoney(deductions80C), true],
  ['TDS Already Deducted', fmtMoney(tds), true],
  ['', '', 'divider'],
  ['Net Taxable Income', fmtMoney(netIncome), true],
  ['Tax Payable / Refund', taxOrRefund, true],
];

const labelX = margin + 2;
const valueX = rm - 2;

for (let i = 0; i < detailRows.length; i++) {
  const [label, val, isMoney] = detailRows[i];
  if (isMoney === 'divider') {
    y += 2;
    doc.setDrawColor(235, 235, 238); doc.setLineWidth(0.15);
    doc.line(margin + 2, y, rm - 2, y);
    y += 5;
    continue;
  }
  pageBreak(12);
  doc.setFont('helvetica', 'normal'); doc.setFontSize(10); doc.setTextColor(...MID);
  doc.text(label, labelX, y);
  if (label === 'Employer Name') {
    const maxValW = cw * 0.52;
    doc.setFont('helvetica', 'bold'); doc.setFontSize(10); doc.setTextColor(...DARK);
    const wrapped = doc.splitTextToSize(String(val), maxValW);
    doc.text(wrapped, valueX, y, { align: 'right' });
    y += Math.max(wrapped.length - 1, 0) * 4.5;
  } else if (isMoney) {
    doc.setFont('courier', 'bold'); doc.setFontSize(10.5); doc.setTextColor(...DARK);
    doc.text(String(val), valueX, y, { align: 'right' });
  } else {
    doc.setFont('helvetica', 'bold'); doc.setFontSize(10); doc.setTextColor(...DARK);
    doc.text(String(val), valueX, y, { align: 'right' });
  }
  y += 8.5;
}

y += 8;

// ── SECTION 2 ──
greyLine(y); y += 12;
doc.setFont('times', 'bold'); doc.setFontSize(16); doc.setTextColor(...DARK);
doc.text('Tax Regime Comparison', margin, y);
y += 2;
goldLine(y, margin, margin + 48);
y += 14;

const gap = 10;
const cardW = (cw - gap) / 2;
const cardH = 58;
const cardY = y;

const renderCard = (cx, regime, taxAmt, ded, isRec) => {
  fill(cx, cardY, cardW, cardH, isRec ? [250, 247, 235] : [248, 248, 250]);
  doc.setDrawColor(...(isRec ? GOLD : [220, 220, 225]));
  doc.setLineWidth(isRec ? 0.7 : 0.3);
  doc.rect(cx, cardY, cardW, cardH, 'S');
  if (isRec) fill(cx, cardY, cardW, 3, GOLD);
  let ty = cardY + (isRec ? 14 : 11);

  doc.setFont('times', 'bold'); doc.setFontSize(15); doc.setTextColor(...DARK);
  doc.text(`${regime} Regime`, cx + cardW / 2, ty, { align: 'center' });
  ty += 7;

  if (isRec) {
    doc.setFont('helvetica', 'bold'); doc.setFontSize(8); doc.setTextColor(...GOLD);
    const badge = 'RECOMMENDED';
    const bw = doc.getTextWidth(badge) + 8;
    const bx = cx + (cardW - bw) / 2;
    fill(bx, ty - 4, bw, 6, [250, 245, 225]);
    doc.setDrawColor(...GOLD); doc.setLineWidth(0.3);
    doc.rect(bx, ty - 4, bw, 6, 'S');
    doc.text(badge, cx + cardW / 2, ty, { align: 'center' });
    ty += 9;
  } else {
    ty += 5;
  }

  doc.setFont('helvetica', 'normal'); doc.setFontSize(9); doc.setTextColor(...MID);
  doc.text('Gross Income', cx + 8, ty);
  doc.setFont('courier', 'bold'); doc.setFontSize(9.5); doc.setTextColor(...DARK);
  doc.text(fmtMoney(grossSalary), cx + cardW - 8, ty, { align: 'right' });
  ty += 6.5;

  doc.setFont('helvetica', 'normal'); doc.setFontSize(9); doc.setTextColor(...MID);
  doc.text('Deductions', cx + 8, ty);
  doc.setFont('courier', 'bold'); doc.setFontSize(9.5); doc.setTextColor(...DARK);
  doc.text(fmtMoney(ded), cx + cardW - 8, ty, { align: 'right' });
  ty += 8;

  doc.setDrawColor(235, 235, 238); doc.setLineWidth(0.2);
  doc.line(cx + 8, ty - 3, cx + cardW - 8, ty - 3);
  doc.setFont('courier', 'bold'); doc.setFontSize(13); doc.setTextColor(...(isRec ? GOLD : DARK));
  doc.text(fmtMoney(taxAmt), cx + cardW / 2, ty + 3, { align: 'center' });
};

renderCard(margin, 'Old', oldTax, totalDeductions, recommended === 'old');
renderCard(margin + cardW + gap, 'New', newTax, 0, recommended === 'new');

y = cardY + cardH + 12;

// Savings Hero Banner
fill(margin, y, cw, 20, [252, 248, 235]);
doc.setDrawColor(...GOLD); doc.setLineWidth(0.5);
doc.rect(margin, y, cw, 20, 'S');
doc.setFont('helvetica', 'normal'); doc.setFontSize(9); doc.setTextColor(...MID);
const savLabel = 'Potential Savings by choosing ' + (recommended === 'old' ? 'Old' : 'New') + ' Regime';
doc.text(savLabel, margin + cw / 2, y + 7, { align: 'center' });
doc.setFont('times', 'bold'); doc.setFontSize(20); doc.setTextColor(...GOLD);
doc.text(fmtMoney(savings), margin + cw / 2, y + 16, { align: 'center' });

y += 32;

// ── SECTION 3 ──
greyLine(y); y += 12;
doc.setFont('times', 'bold'); doc.setFontSize(16); doc.setTextColor(...DARK);
doc.text('How to File Your ITR', margin, y);
y += 2;
goldLine(y, margin, margin + 46);
y += 12;

const filingSteps = [
  { title: 'Login to the IT Portal',
    desc: `Visit incometax.gov.in and sign in with your PAN: ${employeePAN}. First-time users can register using their Aadhaar-linked mobile number.` },
  { title: 'Start Your Return',
    desc: `Select Assessment Year ${assessmentYear} and choose ITR-1 (Sahaj) \u2014 applicable for salaried individuals with total income up to \u20B950 lakh.` },
  { title: 'Enter Salary Details',
    desc: `Enter Gross Salary: ${fmtMoney(grossSalary)} and Standard Deduction: ${fmtMoney(standardDeduction)}. Cross-check all figures against Form 16 issued by ${employerName}.` },
  { title: 'Choose Your Tax Regime',
    desc: `Select the Old Regime for estimated savings of ${fmtMoney(savings)}. For reference: Old Regime Tax = ${fmtMoney(oldTax)}, New Regime Tax = ${fmtMoney(newTax)}.` },
  { title: 'Verify TDS & Deductions',
    desc: `TDS deducted by ${employerName}: ${fmtMoney(tds)}. Ensure 80C Deductions (${fmtMoney(deductions80C)}) and HRA Exemption (${fmtMoney(hraExemption)}) match your Form 16 Part B.` },
  { title: 'Submit & e-Verify',
    desc: `Review the pre-filled summary, submit your return, then e-Verify instantly via Aadhaar OTP. Retain Form 16, AIS, and 26AS as supporting documents.` },
];

const stepIndent = 14;
const descMaxW = cw - stepIndent - 2;

for (let i = 0; i < filingSteps.length; i++) {
  const s = filingSteps[i];
  doc.setFont('helvetica', 'normal'); doc.setFontSize(9.5);
  const testLines = doc.splitTextToSize(s.desc, descMaxW);
  const estH = 8 + testLines.length * 4.2 + 8;
  pageBreak(estH);

  const circR = 4;
  const circX = margin + circR;
  const circY = y - 0.5;
  doc.setFillColor(...GOLD);
  doc.circle(circX, circY, circR, 'F');
  doc.setFont('helvetica', 'bold'); doc.setFontSize(9); doc.setTextColor(255, 255, 255);
  const numW = doc.getTextWidth(String(i + 1));
  doc.text(String(i + 1), circX - numW / 2, circY + 3);

  doc.setFont('times', 'bold'); doc.setFontSize(12); doc.setTextColor(...DARK);
  doc.text(s.title, margin + stepIndent, y + 2);
  y += 8;

  doc.setFont('helvetica', 'normal'); doc.setFontSize(9.5); doc.setTextColor(...MID);
  const descLines = doc.splitTextToSize(s.desc, descMaxW);
  doc.text(descLines, margin + stepIndent, y);
  y += descLines.length * 4.2 + 8;
}

y += 4;

// ── FOOTER ──
const footerH = 34;
const footY = Math.max(y + 4, ph - footerH - 8);
fill(0, footY, pw, footerH + 8, [245, 245, 247]);
doc.setDrawColor(...GOLD); doc.setLineWidth(0.4);
doc.line(0, footY, pw, footY);

doc.setFont('helvetica', 'bold'); doc.setFontSize(7.5); doc.setTextColor(...LIGHT);
doc.text('DISCLAIMER', margin, footY + 7);
doc.setFont('helvetica', 'normal'); doc.setFontSize(7); doc.setTextColor(...LIGHT);
const discText = 'This document is an educational summary generated from your uploaded Form 16 data. It does not constitute professional tax advice, legal opinion, or a filing recommendation. All extracted values should be independently verified against your original Form 16 (Part A & Part B), Annual Information Statement (AIS), and Form 26AS before filing. BM Wealth recommends consulting a qualified Chartered Accountant for personalised tax planning.';
const discLines = doc.splitTextToSize(discText, cw);
doc.text(discLines, margin, footY + 12);
const discEnd = footY + 12 + discLines.length * 3;

doc.setFont('times', 'bold'); doc.setFontSize(9); doc.setTextColor(...GOLD);
doc.text('BM Wealth', margin, discEnd + 5);
doc.setFont('helvetica', 'normal'); doc.setFontSize(7.5); doc.setTextColor(...MID);
doc.text('bmwealth.co.in  |  tools@bmwealth.co.in', margin + doc.getTextWidth('BM Wealth  '), discEnd + 5);

const buf = doc.output('arraybuffer');
writeFileSync('ITR-Filing-Summary-BM-Wealth.pdf', Buffer.from(buf));
console.log('PDF generated: ITR-Filing-Summary-BM-Wealth.pdf');
console.log('Size:', Buffer.from(buf).length, 'bytes');
