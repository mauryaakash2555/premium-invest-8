'use client';

import { useState, useCallback, useRef, useEffect, useMemo } from 'react';
import { Upload, FileText, AlertTriangle, CheckCircle, Edit3, Calculator, Download, Trash2, Loader2, Info, XCircle } from 'lucide-react';

/**
 * ITRFilingHelp - Free OCR-based Tax Estimation Tool
 * 
 * ⚠️ CRITICAL RULES:
 * - NO direct ITR filing
 * - NO paid APIs (uses Tesseract.js - free, client-side)
 * - NO CA/ERI responsibility
 * - EDUCATIONAL/ESTIMATION only
 * - User MUST review all extracted data
 * 
 * Supports: Form 16, AIS, Bank Interest Statement (PDF only)
 */

// Format to Indian currency
const formatINR = (n) => {
  if (!n || isNaN(n)) return '₹0';
  const num = Math.abs(Number(n));
  const sign = Number(n) < 0 ? '-' : '';
  if (num >= 10000000) {
    const cr = num / 10000000;
    return `${sign}₹${cr >= 100 ? cr.toFixed(0) : cr.toFixed(2)} Cr`;
  }
  if (num >= 100000) {
    const lakh = num / 100000;
    return `${sign}₹${lakh >= 100 ? lakh.toFixed(0) : lakh.toFixed(2)} L`;
  }
  if (num >= 1000) {
    return `${sign}₹${Math.round(num).toLocaleString('en-IN')}`;
  }
  return `${sign}₹${Math.round(num)}`;
};

// Document type detection based on content patterns
const detectDocumentType = (text) => {
  const lowerText = text.toLowerCase();
  
  // Form 16 patterns
  if (
    lowerText.includes('form no. 16') ||
    lowerText.includes('form 16') ||
    lowerText.includes('certificate under section 203') ||
    lowerText.includes('part a') && lowerText.includes('part b') ||
    lowerText.includes('salary as per provisions')
  ) {
    return 'form16';
  }
  
  // AIS patterns
  if (
    lowerText.includes('annual information statement') ||
    lowerText.includes('ais') && (lowerText.includes('tds') || lowerText.includes('tcs')) ||
    lowerText.includes('information relating to')
  ) {
    return 'ais';
  }
  
  // Bank Interest Statement patterns
  if (
    lowerText.includes('interest certificate') ||
    lowerText.includes('interest paid') ||
    lowerText.includes('tds on interest') ||
    (lowerText.includes('bank') && lowerText.includes('interest')) ||
    lowerText.includes('form 16a')
  ) {
    return 'bankInterest';
  }
  
  return 'unknown';
};

const normalizeForAnchorSearch = (text) =>
  String(text || '')
    .replace(/\u00A0/g, ' ')
    .replace(/[\t\r]+/g, ' ')
    .replace(/\n{3,}/g, '\n\n')
    .replace(/[ ]{2,}/g, ' ')
    .trim();

const parseFirstNumber = (raw) => {
  if (!raw) return null;
  const cleaned = String(raw)
    .replace(/₹/g, '')
    .replace(/,/g, '')
    .replace(/\s/g, '');
  const m = cleaned.match(/\d+(?:\.\d+)?/);
  if (!m) return null;
  const n = Number(m[0]);
  return Number.isFinite(n) ? n : null;
};

const parseIntSafe = (raw) => {
  if (raw == null) return null;
  const cleaned = String(raw).replace(/,/g, '').trim();
  if (!cleaned) return null;
  const n = parseInt(cleaned, 10);
  return Number.isFinite(n) ? n : null;
};

// Anchor-based extraction: finds a number near any of the anchor phrases.
// Useful when OCR introduces spacing/line breaks.
const extractNumberNearAnchors = (text, anchors, opts = {}) => {
  const {
    windowChars = 140,
    min = 0,
    max = 2_00_00_00_000, // 200 Cr sanity upper bound
    pick = 'max', // 'first' | 'max'
  } = opts;

  const hay = normalizeForAnchorSearch(text).toLowerCase();
  const anchorList = (Array.isArray(anchors) ? anchors : [anchors]).filter(Boolean);
  if (!hay || anchorList.length === 0) return null;

  const candidates = [];
  for (const anchor of anchorList) {
    const a = String(anchor).toLowerCase();
    let idx = 0;
    while (idx >= 0) {
      idx = hay.indexOf(a, idx);
      if (idx < 0) break;
      const start = idx + a.length;
      const slice = hay.slice(start, start + windowChars);
      const numberMatch = slice.match(/(?:₹\s*)?\d[\d,\s]*(?:\.\d+)?/);
      const val = parseFirstNumber(numberMatch?.[0]);
      if (val != null && val >= min && val <= max) candidates.push(val);
      idx = start;
    }
  }

  if (candidates.length === 0) return null;
  if (pick === 'first') return Math.round(candidates[0]);
  return Math.round(Math.max(...candidates));
};

// Extract values from Form 16
const extractForm16Data = (text) => {
  const data = {
    grossSalary: null,
    exemptions: null,
    deduction80C: null,
    deduction80D: null,
    deduction80DSelfFamily: null,
    deduction80DParents: null,
    selfFamilySenior: false,
    parentsSenior: false,
    standardDeduction: 0,
    tdsDeducted: null,
    totalTaxAsPerDoc: null,
    netTaxableIncome: 0,
  };
  
  // Patterns for Form 16 extraction (common formats)
  const patterns = {
    grossSalary: [
      /gross\s*salary[^\d]*?([\d,]+)/i,
      /salary\s*as\s*per\s*provisions[^\d]*?([\d,]+)/i,
      /total\s*salary[^\d]*?([\d,]+)/i,
      /income\s*from\s*salary[^\d]*?([\d,]+)/i,
    ],
    tdsDeducted: [
      /tax\s*deducted[^\d]*?([\d,]+)/i,
      /tds\s*deducted[^\d]*?([\d,]+)/i,
      /total\s*tax\s*deducted[^\d]*?([\d,]+)/i,
      /amount\s*of\s*tax\s*deducted[^\d]*?([\d,]+)/i,
    ],
    deduction80C: [
      /80c[^\d]*?([\d,]+)/i,
      /section\s*80c[^\d]*?([\d,]+)/i,
      /deduction.*80c[^\d]*?([\d,]+)/i,
    ],
    deduction80D: [
      /80d[^\d]*?([\d,]+)/i,
      /section\s*80d[^\d]*?([\d,]+)/i,
      /medical\s*insurance[^\d]*?([\d,]+)/i,
    ],
    standardDeduction: [
      /standard\s*deduction[^\d]*?([\d,]+)/i,
    ],
    exemptions: [
      /hra\s*exemption[^\d]*?([\d,]+)/i,
      /house\s*rent\s*allowance[^\d]*?([\d,]+)/i,
    ],
  };
  
  for (const [field, patternList] of Object.entries(patterns)) {
    for (const pattern of patternList) {
      const match = text.match(pattern);
      if (match) {
        data[field] = parseIntSafe(match[1]);
        break;
      }
    }
  }

  // Anchor-based refinements (more resilient for OCR + varied layouts)
  const grossSalary = extractNumberNearAnchors(text, [
    'gross salary',
    'income from salary',
    'total salary',
    'salary as per provisions',
    'gross total salary',
  ]);
  if (grossSalary != null) data.grossSalary = grossSalary;

  // Exemptions are highly error-prone with OCR; keep anchors narrow to avoid false positives.
  // If we can't find a strong HRA/Section 10 style anchor, leave empty for the user to review.
  const hraOrExemption = extractNumberNearAnchors(
    text,
    ['hra exemption', 'house rent allowance', 'section 10', 'u/s 10', '10(13a)'],
    { windowChars: 90, pick: 'first' }
  );
  if (hraOrExemption != null) data.exemptions = hraOrExemption;

  const d80c = extractNumberNearAnchors(text, ['80c', 'section 80c', 'u/s 80c', 'chapter vi-a', 'chapter vi a'], {
    max: 150000,
    pick: 'max',
  });
  if (d80c != null) data.deduction80C = d80c;

  const d80d = extractNumberNearAnchors(text, ['80d', 'section 80d', 'u/s 80d', 'medical insurance'], {
    max: 100000,
    pick: 'max',
  });
  if (d80d != null) {
    data.deduction80D = d80d;
    data.deduction80DSelfFamily = d80d;
  }

  // TDS: prefer explicit "Total Tax Deducted" anchor.
  const tdsExact = extractNumberNearAnchors(text, ['total tax deducted', 'total tax deducted at source'], { pick: 'first' });
  const tdsFallback = extractNumberNearAnchors(text, ['tds', 'tax deducted', 'tax deducted at source'], { pick: 'max' });
  if (tdsExact != null || tdsFallback != null) data.tdsDeducted = (tdsExact ?? tdsFallback);

  // "Total Tax" reference only (do not auto-apply)
  const totalTaxRef = extractNumberNearAnchors(text, ['total tax', 'total tax payable', 'tax on total income'], { max: 5_00_00_000 });
  if (totalTaxRef != null) data.totalTaxAsPerDoc = totalTaxRef;
  
  return data;
};

// Extract values from AIS
const extractAISData = (text) => {
  const data = {
    interestIncome: null,
    dividendIncome: null,
    capitalGains: null,
    tdsEntries: null,
    otherIncome: 0,
  };
  
  const patterns = {
    interestIncome: [
      /interest[^\d]*?([\d,]+)/i,
      /savings\s*interest[^\d]*?([\d,]+)/i,
      /interest\s*on\s*deposits[^\d]*?([\d,]+)/i,
    ],
    dividendIncome: [
      /dividend[^\d]*?([\d,]+)/i,
      /dividend\s*income[^\d]*?([\d,]+)/i,
    ],
    capitalGains: [
      /capital\s*gain[^\d]*?([\d,]+)/i,
      /sale\s*of\s*securities[^\d]*?([\d,]+)/i,
      /equity[^\d]*?([\d,]+)/i,
    ],
    tdsEntries: [
      /tds[^\d]*?([\d,]+)/i,
      /tax\s*deducted[^\d]*?([\d,]+)/i,
    ],
  };
  
  for (const [field, patternList] of Object.entries(patterns)) {
    for (const pattern of patternList) {
      const match = text.match(pattern);
      if (match) {
        data[field] = parseIntSafe(match[1]);
        break;
      }
    }
  }
  
  return data;
};

// Extract values from Bank Interest Statement
const extractBankInterestData = (text) => {
  const data = {
    totalInterest: null,
    tdsOnInterest: null,
  };
  
  const patterns = {
    totalInterest: [
      /total\s*interest[^\d]*?([\d,]+)/i,
      /interest\s*paid[^\d]*?([\d,]+)/i,
      /interest\s*earned[^\d]*?([\d,]+)/i,
      /gross\s*interest[^\d]*?([\d,]+)/i,
    ],
    tdsOnInterest: [
      /tds[^\d]*?([\d,]+)/i,
      /tax\s*deducted[^\d]*?([\d,]+)/i,
      /tds\s*on\s*interest[^\d]*?([\d,]+)/i,
    ],
  };
  
  for (const [field, patternList] of Object.entries(patterns)) {
    for (const pattern of patternList) {
      const match = text.match(pattern);
      if (match) {
        data[field] = parseIntSafe(match[1]);
        break;
      }
    }
  }
  
  return data;
};

// Tax calculation (FY 2025-26 slabs)
const calculateTax = (data, regime = 'new') => {
  const num = (v) => {
    const n = Number(v);
    return Number.isFinite(n) ? n : 0;
  };
  const {
    grossSalary = 0,
    interestIncome = 0,
    dividendIncome = 0,
    otherIncome = 0,
    deduction80C = 0,
    deduction80D = 0,
    deduction80DSelfFamily,
    deduction80DParents,
    selfFamilySenior,
    parentsSenior,
    exemptions = 0,
  } = data;

  const totalIncome = num(grossSalary) + num(interestIncome) + num(dividendIncome) + num(otherIncome);
  
  let taxableIncome = totalIncome;
  let deductionsApplied = {};
  
  if (regime === 'old') {
    // Old regime: standard deduction + 80C + 80D + exemptions
    const stdDed = Math.min(50000, totalIncome);
    const d80c = Math.min(num(deduction80C), 150000);
    // 80D cap rules (simplified but rule-based):
    // - Self/Family: 25k (or 50k if senior)
    // - Parents: 25k (or 50k if senior)
    // - Combined max: 100k
    const selfCap = selfFamilySenior ? 50000 : 25000;
    const parentsCap = parentsSenior ? 50000 : 25000;
    const selfVal =
      deduction80DSelfFamily != null ? num(deduction80DSelfFamily) : num(deduction80D);
    const parentsVal = deduction80DParents != null ? num(deduction80DParents) : 0;
    const d80dSelf = Math.min(selfVal, selfCap);
    const d80dPar = Math.min(parentsVal, parentsCap);
    const d80d = Math.min(d80dSelf + d80dPar, 100000);
    const exempt = num(exemptions);
    
    taxableIncome = Math.max(0, totalIncome - stdDed - d80c - d80d - exempt);
    deductionsApplied = {
      standardDeduction: stdDed,
      section80C: d80c,
      section80D: d80d,
      exemptions: exempt,
      total: stdDed + d80c + d80d + exempt,
    };
  } else {
    // New regime (FY 2025-26): standard deduction ₹75,000
    const stdDed = Math.min(75000, totalIncome);
    taxableIncome = Math.max(0, totalIncome - stdDed);
    deductionsApplied = {
      standardDeduction: stdDed,
      total: stdDed,
    };
  }
  
  // Tax slabs FY 2025-26
  let tax = 0;
  const slabBreakdown = [];
  
  if (regime === 'new') {
    // New regime slabs FY 2025-26
    const slabs = [
      { from: 0, to: 300000, rate: 0 },
      { from: 300000, to: 600000, rate: 0.05 },
      { from: 600000, to: 900000, rate: 0.10 },
      { from: 900000, to: 1200000, rate: 0.15 },
      { from: 1200000, to: 1500000, rate: 0.20 },
      { from: 1500000, to: Infinity, rate: 0.30 },
    ];
    
    let remaining = taxableIncome;
    let lastLimit = 0;
    
    for (const slab of slabs) {
      if (remaining <= 0) break;
      const slabWidth = slab.to - slab.from;
      const amountInSlab = Math.min(remaining, slabWidth);
      const slabTax = amountInSlab * slab.rate;
      tax += slabTax;
      if (amountInSlab > 0) {
        slabBreakdown.push({
          from: slab.from,
          to: Math.min(slab.to, slab.from + amountInSlab),
          rate: slab.rate * 100,
          amount: amountInSlab,
          tax: slabTax,
        });
      }
      remaining -= amountInSlab;
      lastLimit = slab.to;
    }
    
    // Rebate u/s 87A (commonly applied threshold for new regime)
    if (taxableIncome <= 700000) {
      tax = Math.max(0, tax - Math.min(25000, tax));
    }
  } else {
    // Old regime slabs FY 2025-26
    const slabs = [
      { from: 0, to: 250000, rate: 0 },
      { from: 250000, to: 500000, rate: 0.05 },
      { from: 500000, to: 1000000, rate: 0.20 },
      { from: 1000000, to: Infinity, rate: 0.30 },
    ];
    
    let remaining = taxableIncome;
    
    for (const slab of slabs) {
      if (remaining <= 0) break;
      const slabWidth = slab.to - slab.from;
      const amountInSlab = Math.min(remaining, slabWidth);
      const slabTax = amountInSlab * slab.rate;
      tax += slabTax;
      if (amountInSlab > 0) {
        slabBreakdown.push({
          from: slab.from,
          to: Math.min(slab.to, slab.from + amountInSlab),
          rate: slab.rate * 100,
          amount: amountInSlab,
          tax: slabTax,
        });
      }
      remaining -= amountInSlab;
    }
    
    // Rebate u/s 87A: if taxable income <= 5L, rebate up to 12,500
    if (taxableIncome <= 500000) {
      tax = Math.max(0, tax - Math.min(12500, tax));
    }
  }
  
  // Surcharge (simplified)
  let surcharge = 0;
  if (taxableIncome > 50000000) {
    surcharge = tax * 0.37;
  } else if (taxableIncome > 20000000) {
    surcharge = tax * 0.25;
  } else if (taxableIncome > 10000000) {
    surcharge = tax * 0.15;
  } else if (taxableIncome > 5000000) {
    surcharge = tax * 0.10;
  }
  
  const taxWithSurcharge = tax + surcharge;
  const cess = taxWithSurcharge * 0.04;
  const totalTax = taxWithSurcharge + cess;
  
  // Calculate TDS already paid
  const tdsAlreadyPaid = (data.tdsDeducted || 0) + (data.tdsOnInterest || 0) + (data.tdsEntries || 0);
  const netPayable = totalTax - tdsAlreadyPaid;
  
  return {
    regime,
    totalIncome,
    taxableIncome,
    deductionsApplied,
    slabBreakdown,
    taxBeforeCess: tax,
    surcharge,
    cess,
    totalTax,
    tdsAlreadyPaid,
    netPayable,
    refundDue: netPayable < 0 ? Math.abs(netPayable) : 0,
    taxDue: netPayable > 0 ? netPayable : 0,
  };
};

// Generate educational summary PDF (4-page locked structure)
const generateSummaryPDF = async (data, result, documentType) => {
  const { jsPDF } = await import('jspdf');
  const doc = new jsPDF();

  const today = new Date().toLocaleDateString('en-IN', { day: '2-digit', month: 'short', year: 'numeric' });
  const time = new Date().toLocaleTimeString('en-IN', { hour: '2-digit', minute: '2-digit' });

  const FOOTER_TEXT =
    'This is an estimate generated for educational purposes. Not a filing document. Consult a qualified professional before submission.';

  const addFooter = () => {
    doc.setFontSize(8);
    doc.setTextColor(120, 120, 120);
    const lines = doc.splitTextToSize(FOOTER_TEXT, 170);
    doc.text(lines, 20, 290);
  };

  const addRow = (label, value, y, indent = 0) => {
    doc.text(label, 20 + indent, y);
    doc.text(formatINR(value), 170, y, { align: 'right' });
    return y + 7;
  };

  const fyLabel = 'FY 2025–26';
  const ayLabel = 'AY 2026–27';
  const docTypeLabels = {
    form16: 'Form 16 (Salary Certificate)',
    ais: 'Annual Information Statement (AIS)',
    bankInterest: 'Bank Interest Statement',
  };

  // PAGE 1 — SUMMARY
  doc.setTextColor(0, 0, 0);
  doc.setFontSize(18);
  doc.text('Income Tax Estimation Summary', 20, 25);
  doc.setFontSize(10);
  doc.setTextColor(80, 80, 80);
  doc.text(`Generated: ${today} ${time}`, 20, 33);
  doc.text(`Regime: ${result.regime === 'new' ? 'New' : 'Old'} | ${fyLabel} (${ayLabel})`, 20, 40);
  doc.text(`Document: ${docTypeLabels[documentType] || 'Not specified'}`, 20, 47);
  doc.setDrawColor(220, 220, 220);
  doc.line(20, 55, 190, 55);

  doc.setFontSize(12);
  doc.setTextColor(0, 0, 0);
  doc.text('Estimated outcome', 20, 70);
  doc.setFontSize(22);
  doc.setTextColor(34, 34, 34);
  doc.text(formatINR(result.refundDue > 0 ? result.refundDue : result.taxDue), 20, 85);
  doc.setFontSize(10);
  doc.setTextColor(80, 80, 80);
  doc.text(result.refundDue > 0 ? 'Estimated Refund' : 'Estimated Tax Due', 20, 92);
  doc.setFontSize(10);
  doc.setTextColor(60, 60, 60);
  doc.text('Extraction status: Assisted (Review required)', 20, 110);
  addFooter();

  // PAGE 2 — INCOME BREAKDOWN
  doc.addPage();
  doc.setTextColor(0, 0, 0);
  doc.setFontSize(14);
  doc.text('Income Breakdown', 20, 22);
  doc.setFontSize(10);
  doc.setTextColor(80, 80, 80);
  doc.text('User-reviewed values', 20, 30);

  let y = 45;
  doc.setFillColor(245, 245, 245);
  doc.rect(15, y - 6, 180, 9, 'F');
  doc.setTextColor(0, 0, 0);
  doc.setFontSize(10);
  doc.text('Income Sources', 20, y);
  y += 12;
  doc.setTextColor(60, 60, 60);
  if (data.grossSalary != null) y = addRow('Salary (Gross)', data.grossSalary, y, 5);
  if (data.interestIncome != null || data.totalInterest != null) y = addRow('Interest', (data.interestIncome ?? data.totalInterest ?? 0), y, 5);
  if (data.dividendIncome != null) y = addRow('Dividends', data.dividendIncome, y, 5);
  if (data.otherIncome) y = addRow('Other Income', data.otherIncome, y, 5);
  y += 5;
  doc.setDrawColor(220, 220, 220);
  doc.line(20, y, 190, y);
  y += 10;
  doc.setTextColor(0, 0, 0);
  doc.setFontSize(11);
  y = addRow('Gross Total Income', result.totalIncome, y);
  addFooter();

  // PAGE 3 — DEDUCTIONS
  doc.addPage();
  doc.setTextColor(0, 0, 0);
  doc.setFontSize(14);
  doc.text('Deductions', 20, 22);
  doc.setFontSize(10);
  doc.setTextColor(80, 80, 80);
  doc.text(`Regime: ${result.regime === 'new' ? 'New' : 'Old'}`, 20, 30);
  y = 45;
  doc.setFillColor(245, 245, 245);
  doc.rect(15, y - 6, 180, 9, 'F');
  doc.setTextColor(0, 0, 0);
  doc.setFontSize(10);
  doc.text('Applied Deductions', 20, y);
  y += 12;
  doc.setTextColor(60, 60, 60);
  if (result.deductionsApplied.standardDeduction) y = addRow('Standard Deduction', result.deductionsApplied.standardDeduction, y, 5);
  if (result.regime === 'old') {
    if (result.deductionsApplied.section80C) y = addRow('Section 80C', result.deductionsApplied.section80C, y, 5);
    if (result.deductionsApplied.section80D) y = addRow('Section 80D', result.deductionsApplied.section80D, y, 5);
    if (result.deductionsApplied.exemptions) y = addRow('Exemptions (HRA, etc.)', result.deductionsApplied.exemptions, y, 5);
  }
  y += 5;
  doc.setDrawColor(220, 220, 220);
  doc.line(20, y, 190, y);
  y += 10;
  doc.setTextColor(0, 0, 0);
  doc.setFontSize(11);
  y = addRow('Total Deductions', result.deductionsApplied.total || 0, y);
  addFooter();

  // PAGE 4 — TAX COMPUTATION
  doc.addPage();
  doc.setTextColor(0, 0, 0);
  doc.setFontSize(14);
  doc.text('Tax Computation', 20, 22);
  doc.setFontSize(10);
  doc.setTextColor(80, 80, 80);
  doc.text(`${fyLabel} (${ayLabel})`, 20, 30);
  y = 45;
  doc.setTextColor(60, 60, 60);
  y = addRow('Tax before cess', result.taxBeforeCess, y);
  if (result.surcharge > 0) y = addRow('Surcharge', result.surcharge, y);
  y = addRow('Health & Education Cess (4%)', result.cess, y);
  doc.setDrawColor(220, 220, 220);
  doc.line(20, y, 190, y);
  y += 10;
  doc.setTextColor(0, 0, 0);
  doc.setFontSize(11);
  y = addRow('Total Estimated Tax', result.totalTax, y);
  y += 6;
  doc.setFontSize(10);
  doc.setTextColor(60, 60, 60);
  y = addRow('TDS Already Paid', result.tdsAlreadyPaid, y);
  doc.setDrawColor(220, 220, 220);
  doc.line(20, y, 190, y);
  y += 10;
  doc.setTextColor(0, 0, 0);
  doc.setFontSize(12);
  if (result.refundDue > 0) {
    y = addRow('Net Refund (estimate)', result.refundDue, y);
  } else {
    y = addRow('Net Payable (estimate)', result.taxDue, y);
  }
  addFooter();

  return doc;
};

// Steps enum
const STEPS = {
  UPLOAD: 'upload',
  PROCESSING: 'processing',
  REVIEW: 'review',
  RESULT: 'result',
};

export default function ITRFilingHelp() {
  const [step, setStep] = useState(STEPS.UPLOAD);
  const [file, setFile] = useState(null);
  const [documentType, setDocumentType] = useState(null);
  const [extractedData, setExtractedData] = useState({});
  const [editableData, setEditableData] = useState({});
  const [baselineData, setBaselineData] = useState({});
  const [editedFields, setEditedFields] = useState(() => new Set());
  const [reviewConfirmed, setReviewConfirmed] = useState(false);
  const [regime, setRegime] = useState('new');
  const [result, setResult] = useState(null);
  const [error, setError] = useState(null);
  const [processing, setProcessing] = useState(false);
  const [ocrProgress, setOcrProgress] = useState(0);
  const [extractionMethod, setExtractionMethod] = useState(null); // 'selectable-text' | 'ocr' | 'mixed'
  const [ocrConfidence, setOcrConfidence] = useState(null); // 0..1 when OCR used
  const [processingStage, setProcessingStage] = useState(null); // 'detecting' | 'text' | 'ocr'
  const fileInputRef = useRef(null);
  const [tesseractLoaded, setTesseractLoaded] = useState(false);
  const [pdfJsLoaded, setPdfJsLoaded] = useState(false);
  
  // Load Tesseract.js dynamically
  useEffect(() => {
    const loadLibraries = async () => {
      try {
        // Check if already loaded
        if (typeof window !== 'undefined' && window.Tesseract) {
          setTesseractLoaded(true);
        }
        if (typeof window !== 'undefined' && window.pdfjsLib) {
          setPdfJsLoaded(true);
        }
      } catch (e) {
        console.error('Error checking libraries:', e);
      }
    };
    loadLibraries();
  }, []);
  
  // Handle file selection
  const handleFileSelect = useCallback((e) => {
    const selectedFile = e.target.files?.[0];
    if (!selectedFile) return;
    
    setError(null);
    
    // Validate file type
    if (selectedFile.type !== 'application/pdf') {
      setError('Only PDF files are supported. Please upload a PDF document.');
      return;
    }
    
    // Validate file size (max 10MB)
    if (selectedFile.size > 10 * 1024 * 1024) {
      setError('File size too large. Maximum 10MB allowed.');
      return;
    }
    
    setFile(selectedFile);
    setReviewConfirmed(false);
    setExtractionMethod(null);
    setOcrConfidence(null);
    setProcessingStage(null);
  }, []);

  const buildCalculationInput = useCallback((data) => {
    const base = { ...(data || {}) };
    // If Bank Interest, include interest into interestIncome for calculation.
    if (documentType === 'bankInterest') {
      const totalInterest = Number(base.totalInterest || 0);
      base.interestIncome = Number(base.interestIncome || 0) + (Number.isFinite(totalInterest) ? totalInterest : 0);
    }
    return base;
  }, [documentType]);

  const liveResult = useMemo(() => {
    if (!editableData || Object.keys(editableData).length === 0) return null;
    return calculateTax(buildCalculationInput(editableData), regime);
  }, [editableData, regime, buildCalculationInput]);
  
  // Process PDF with OCR
  const processDocument = useCallback(async () => {
    if (!file) return;
    
    setStep(STEPS.PROCESSING);
    setProcessing(true);
    setOcrProgress(0);
    setError(null);
    setExtractionMethod(null);
    setOcrConfidence(null);
    setProcessingStage('detecting');
    
    try {
      // Read PDF file
      const arrayBuffer = await file.arrayBuffer();

      let fullText = '';
      let usedText = false;
      let usedOcr = false;
      let ocrConfidenceSum = 0;
      let ocrConfidenceCount = 0;

      // 1) Selectable-text-first extraction using server-side pdfplumber.
      // Strict: we do NOT fall back to client-side text extraction.
      let serverResult;
      const resp = await fetch('/api/itr/extract-text', {
        method: 'POST',
        headers: { 'content-type': 'application/pdf' },
        body: arrayBuffer,
      });
      if (!resp.ok) {
        const payload = await resp.json().catch(() => ({}));
        throw new Error(payload?.message || 'Text extractor unavailable. Please try again later.');
      }
      serverResult = await resp.json();

      if (serverResult?.hasSelectableText) {
        setProcessingStage('text');
        usedText = true;
        fullText = (serverResult.pages || []).map((p) => p.text).join('\n\n').trim();
        setOcrProgress(100);
      } else {
        // Dynamic import of PDF.js (explicit ESM entry). In dev, a stale client can
        // occasionally request a non-existent chunk after restarts; retry once.
        const loadPdfJs = async () => {
          try {
            return await import('pdfjs-dist/build/pdf.mjs');
          } catch (err) {
            const message = err?.message || '';
            const isChunkLoad = err?.name === 'ChunkLoadError' || /Loading chunk .* failed/i.test(message);
            if (!isChunkLoad) throw err;
            await new Promise((r) => setTimeout(r, 300));
            return await import('pdfjs-dist/build/pdf.mjs');
          }
        };

        const pdfjsLib = await loadPdfJs();
        const pdfJsVersion = pdfjsLib?.version || pdfjsLib?.default?.version;
        if (pdfjsLib?.GlobalWorkerOptions) {
          const v = pdfJsVersion || '4.10.38';
          pdfjsLib.GlobalWorkerOptions.workerSrc = `https://cdnjs.cloudflare.com/ajax/libs/pdf.js/${v}/pdf.worker.min.mjs`;
        }
        setPdfJsLoaded(true);

        // Load Tesseract in-browser via CDN to avoid bundler resolution issues.
        // (Next dev can otherwise emit a runtime "Cannot find module 'tesseract.js'".)
        const loadTesseract = async () => {
          if (typeof window === 'undefined') {
            throw new Error('Tesseract can only be loaded in the browser');
          }
          if (window.Tesseract) return window.Tesseract;

          const src = 'https://cdn.jsdelivr.net/npm/tesseract.js@7.0.0/dist/tesseract.min.js';
          await new Promise((resolve, reject) => {
            const existing = document.querySelector('script[data-tesseract="1"]');
            if (existing) {
              existing.addEventListener('load', resolve, { once: true });
              existing.addEventListener('error', reject, { once: true });
              return;
            }
            const script = document.createElement('script');
            script.src = src;
            script.async = true;
            script.defer = true;
            script.dataset.tesseract = '1';
            script.onload = resolve;
            script.onerror = reject;
            document.head.appendChild(script);
          });

          if (!window.Tesseract) {
            throw new Error('Tesseract failed to initialize');
          }
          return window.Tesseract;
        };

        const Tesseract = await loadTesseract();
        setTesseractLoaded(true);
        const pdf = await pdfjsLib.getDocument({ data: arrayBuffer }).promise;
        const totalPages = pdf.numPages;
        const pageLimit = Math.min(totalPages, 5);

        setProcessingStage('ocr');
        for (let pageNum = 1; pageNum <= pageLimit; pageNum++) {
          const page = await pdf.getPage(pageNum);

          usedOcr = true;
          const scale = 2.0;
          const viewport = page.getViewport({ scale });

          const canvas = document.createElement('canvas');
          const context = canvas.getContext('2d');
          canvas.height = viewport.height;
          canvas.width = viewport.width;

          await page.render({ canvasContext: context, viewport }).promise;
          const imageData = canvas.toDataURL('image/png');

          const { data } = await Tesseract.recognize(imageData, 'eng', {
            tessedit_pageseg_mode: 3,
            preserve_interword_spaces: '1',
            logger: (m) => {
              if (m.status === 'recognizing text') {
                const pageProgress = ((pageNum - 1) / totalPages + m.progress / totalPages) * 100;
                setOcrProgress(Math.round(pageProgress));
              }
            },
          });

          const confidencePct = Number(data?.confidence);
          if (Number.isFinite(confidencePct)) {
            ocrConfidenceSum += confidencePct;
            ocrConfidenceCount += 1;
          }

          fullText += (data?.text || '') + '\n';
          setOcrProgress(Math.round((pageNum / totalPages) * 100));
        }
      }

      if (serverResult?.method === 'pdfplumber') {
        setExtractionMethod('selectable-text');
      } else if (usedText && usedOcr) setExtractionMethod('mixed');
      else if (usedText) setExtractionMethod('selectable-text');
      else if (usedOcr) setExtractionMethod('ocr');

      if (usedOcr && ocrConfidenceCount > 0) {
        setOcrConfidence(Math.max(0, Math.min(1, (ocrConfidenceSum / ocrConfidenceCount) / 100)));
      }
      
      // Detect document type
      const detectedType = detectDocumentType(fullText);
      
      if (detectedType === 'unknown') {
        setError('Could not identify document type. Please upload Form 16, AIS, or Bank Interest Statement.');
        setStep(STEPS.UPLOAD);
        setProcessing(false);
        return;
      }
      
      setDocumentType(detectedType);
      
      // Extract data based on document type
      let extracted = {};
      
      if (detectedType === 'form16') {
        extracted = extractForm16Data(fullText);
      } else if (detectedType === 'ais') {
        extracted = extractAISData(fullText);
      } else if (detectedType === 'bankInterest') {
        extracted = extractBankInterestData(fullText);
      }
      
      setExtractedData(extracted);
      setEditableData(extracted);
      setBaselineData(extracted);
      setEditedFields(new Set());
      setReviewConfirmed(false);
      setStep(STEPS.REVIEW);
      
    } catch (error) {
      console.error('Document processing error:', error);
      const message = error?.message || '';
      const isChunkLoad = error?.name === 'ChunkLoadError' || /Loading chunk .* failed/i.test(message);
      if (isChunkLoad) {
        setError('PDF engine failed to load (dev-server chunk mismatch). Please hard refresh (Ctrl+F5) and try again.');
      } else {
        setError('Error processing document. Please try again with a different PDF.');
      }
      setStep(STEPS.UPLOAD);
    } finally {
      setProcessing(false);
      setProcessingStage(null);
    }
  }, [file]);
  
  // Handle field edit
  const handleFieldChange = useCallback((field, value) => {
    const raw = String(value ?? '').trim();
    const parsed = raw === '' ? null : parseInt(raw.replace(/,/g, ''), 10);
    const nextValue = raw === '' ? null : (Number.isFinite(parsed) ? parsed : null);
    setEditableData(prev => ({ ...prev, [field]: nextValue }));
    setEditedFields((prev) => {
      const next = new Set(prev);
      next.add(field);
      return next;
    });
    setReviewConfirmed(false);
  }, []);
  
  const handleProceedToResult = useCallback(() => {
    if (!reviewConfirmed) {
      setError('Please confirm you have reviewed the extracted values before proceeding.');
      return;
    }
    if (!liveResult) {
      setError('Nothing to calculate yet. Please upload a document and review values.');
      return;
    }
    setResult(liveResult);
    setStep(STEPS.RESULT);
  }, [reviewConfirmed, liveResult]);
  
  // Download PDF summary
  const handleDownloadPDF = useCallback(async () => {
    if (!result) return;
    
    try {
      const doc = await generateSummaryPDF(editableData, result, documentType);
      doc.save('BM_Wealth_Tax_Estimate.pdf');
    } catch (err) {
      console.error('PDF generation error:', err);
      setError('Error generating PDF. Please try again.');
    }
  }, [editableData, result, documentType]);
  
  // Reset tool
  const handleReset = useCallback(() => {
    setStep(STEPS.UPLOAD);
    setFile(null);
    setDocumentType(null);
    setExtractedData({});
    setEditableData({});
    setBaselineData({});
    setEditedFields(new Set());
    setReviewConfirmed(false);
    setResult(null);
    setError(null);
    setOcrProgress(0);
    setExtractionMethod(null);
    setOcrConfidence(null);
    setProcessingStage(null);
    if (fileInputRef.current) {
      fileInputRef.current.value = '';
    }
  }, []);
  
  // Document type labels
  const documentTypeLabels = {
    form16: 'Form 16',
    ais: 'Annual Information Statement (AIS)',
    bankInterest: 'Bank Interest Statement',
  };
  
  // Render based on step
  return (
    <div className="rounded-2xl border border-white/10 ultra-luxury-glass gold-grain-texture overflow-hidden">
      {/* Step Indicator */}
      <div className="flex border-b border-white/10">
        {[
          { key: STEPS.UPLOAD, label: 'Upload', icon: Upload },
          { key: STEPS.REVIEW, label: 'Review', icon: Edit3 },
          { key: STEPS.RESULT, label: 'Result', icon: Calculator },
        ].map((s, idx) => (
          <div
            key={s.key}
            className={`flex-1 py-4 px-4 flex items-center justify-center gap-2 text-sm font-medium transition-colors
              ${step === s.key || (step === STEPS.PROCESSING && s.key === STEPS.UPLOAD) 
                ? 'bg-gradient-to-r from-[#c0a062]/20 to-transparent text-[#c0a062]' 
                : 'text-white/50'}`}
          >
            <s.icon className="w-4 h-4" />
            <span className="hidden sm:inline">{s.label}</span>
            <span className="sm:hidden">{idx + 1}</span>
          </div>
        ))}
      </div>
      
      <div className="p-6 sm:p-8">
        {/* Error Display */}
        {error && (
          <div className="mb-6 p-4 rounded-xl border border-red-500/30 bg-red-900/20 flex items-start gap-3">
            <XCircle className="w-5 h-5 text-red-400 shrink-0 mt-0.5" />
            <div>
              <p className="text-sm text-red-200">{error}</p>
              <button
                onClick={() => setError(null)}
                className="text-xs text-red-300 underline mt-1"
              >
                Dismiss
              </button>
            </div>
          </div>
        )}
        
        {/* STEP: UPLOAD */}
        {step === STEPS.UPLOAD && (
          <div className="space-y-6">
            
            {/* File Upload Area */}
            <div className="space-y-4">
              <div className="block">
                <div 
                  className={`border-2 border-dashed rounded-xl p-8 text-center cursor-pointer transition-colors
                    ${file 
                      ? 'border-[#c0a062]/50 bg-[#c0a062]/10' 
                      : 'border-white/20 hover:border-white/40 hover:bg-white/5'}`}
                  onClick={() => fileInputRef.current?.click()}
                >
                  <input
                    ref={fileInputRef}
                    type="file"
                    accept=".pdf,application/pdf"
                    onChange={handleFileSelect}
                    className="hidden"
                  />
                  
                  {file ? (
                    <div className="space-y-2">
                      <FileText className="w-12 h-12 mx-auto text-[#c0a062]" />
                      <p className="text-white font-medium">{file.name}</p>
                      <p className="text-xs text-white/60">
                        {(file.size / 1024 / 1024).toFixed(2)} MB
                      </p>
                      <button
                        onClick={(e) => {
                          e.stopPropagation();
                          setFile(null);
                          if (fileInputRef.current) fileInputRef.current.value = '';
                        }}
                        className="text-xs text-red-400 hover:text-red-300 underline"
                      >
                        Remove
                      </button>
                    </div>
                  ) : (
                    <div className="space-y-2">
                      <Upload className="w-12 h-12 mx-auto text-white/40" />
                      <p className="text-white/80">Click to upload PDF</p>
                      <p className="text-xs text-white/50">
                        Supported: Form 16, AIS, Bank Interest Statement
                      </p>
                      <p className="text-xs text-white/40">Maximum 10MB</p>
                    </div>
                  )}
                </div>
              </div>
              
              {/* Supported Documents Info */}
              <div className="grid grid-cols-1 sm:grid-cols-3 gap-3">
                {[
                  { name: 'Form 16', desc: 'Salary certificate from employer' },
                  { name: 'AIS', desc: 'Annual Information Statement' },
                  { name: 'Bank Interest', desc: 'Interest certificate from bank' },
                ].map((doc) => (
                  <div key={doc.name} className="p-3 rounded-lg bg-white/5 border border-white/10">
                    <p className="text-sm text-white/80 font-medium">{doc.name}</p>
                    <p className="text-xs text-white/50">{doc.desc}</p>
                  </div>
                ))}
              </div>
            </div>
            
            {/* Process Button */}
            {file && (
              <button
                onClick={processDocument}
                disabled={processing}
                className="w-full py-4 rounded-xl font-semibold text-white calculator-premium-cta disabled:opacity-50 disabled:cursor-not-allowed flex items-center justify-center gap-2"
              >
                <FileText className="w-5 h-5" />
                Extract Data from PDF
              </button>
            )}
          </div>
        )}
        
        {/* STEP: PROCESSING */}
        {step === STEPS.PROCESSING && (
          <div className="py-12 text-center space-y-6">
            <Loader2 className="w-16 h-16 mx-auto text-[#c0a062] animate-spin" />
            <div>
              <p className="text-lg text-white font-medium">Processing Document...</p>
              <p className="text-sm text-white/60 mt-2">
                {processingStage === 'text'
                  ? 'Extracting selectable text (server-assisted)'
                  : processingStage === 'ocr'
                    ? 'Extracting text using OCR (Tesseract.js - Free & Local)'
                    : 'Detecting best extraction method...'}
              </p>
            </div>
            
            {/* Progress Bar */}
            <div className="max-w-md mx-auto">
              <div className="h-2 bg-white/10 rounded-full overflow-hidden">
                <div 
                  className="h-full bg-gradient-to-r from-[#c0a062] to-[#d4b77a] transition-all duration-300"
                  style={{ width: `${ocrProgress}%` }}
                />
              </div>
              <p className="text-sm text-white/60 mt-2">{ocrProgress}% complete</p>
            </div>
            
            <p className="text-xs text-white/40">
              This may take 30-60 seconds depending on document size
            </p>
          </div>
        )}
        
        {/* STEP: REVIEW */}
        {step === STEPS.REVIEW && (
          <div className="space-y-6">
            {/* Document Type Badge */}
            <div className="flex items-center gap-3 flex-wrap">
              <div className="inline-flex items-center gap-2 px-3 py-1.5 rounded-full bg-[#c0a062]/20 border border-[#c0a062]/30">
                <CheckCircle className="w-4 h-4 text-[#c0a062]" />
                <span className="text-sm text-[#c0a062]">
                  Detected: {documentTypeLabels[documentType] || 'Document'}
                </span>
              </div>
              <div className="inline-flex items-center gap-2 px-3 py-1.5 rounded-full bg-white/10 border border-white/15">
                <span className="text-sm text-white/80">Extraction status: Assisted (Review required)</span>
              </div>
              <button
                onClick={handleReset}
                className="text-xs text-white/50 hover:text-white/70 underline"
              >
                Upload different document
              </button>
            </div>

            {(extractionMethod || typeof ocrConfidence === 'number') && (
              <div className="p-3 rounded-lg border border-white/10 bg-white/5">
                <p className="text-xs text-white/70">
                  <span className="text-white/60">Method:</span>{' '}
                  {extractionMethod === 'selectable-text'
                    ? 'Selectable text'
                    : extractionMethod === 'ocr'
                      ? 'OCR'
                      : extractionMethod === 'mixed'
                        ? 'Mixed (text + OCR)'
                        : 'Unknown'}
                  {typeof ocrConfidence === 'number' && (
                    <>
                      {' '}<span className="text-white/40">•</span>{' '}
                      <span className="text-white/60">OCR confidence:</span>{' '}
                      {Math.round(ocrConfidence * 100)}%
                    </>
                  )}
                </p>
                {typeof ocrConfidence === 'number' && (
                  <p className="text-xs text-white/50 mt-2">
                    <Info className="w-3 h-3 inline mr-1" />
                    OCR confidence is an estimate. This tool is educational only — review and edit all values before proceeding.
                  </p>
                )}
                {typeof ocrConfidence === 'number' && ocrConfidence < 0.6 && (
                  <p className="text-xs text-amber-200 mt-2">
                    <Info className="w-3 h-3 inline mr-1" />
                    OCR confidence is below 60%. Please verify every value carefully or upload a clearer PDF.
                  </p>
                )}
              </div>
            )}
            
            {/* Review Notice */}
            <div className="p-3 rounded-lg border border-white/10 bg-white/5">
              <p className="text-xs text-white/60">
                <Info className="w-3 h-3 inline mr-1" />
                If the PDF contains selectable text, it is extracted using server-side parsing (pdfplumber). Otherwise OCR is used. Review and edit values as needed.
              </p>
            </div>

            {/* Live preview (recalculates on edit) */}
            {liveResult && (
              <div className="p-4 rounded-xl border border-white/10 bg-white/5">
                <p className="text-xs text-white/50 uppercase tracking-wider">Live estimate preview</p>
                <div className="mt-3 grid grid-cols-1 sm:grid-cols-3 gap-3">
                  <div className="p-3 rounded-lg bg-white/5 border border-white/10 text-center">
                    <p className="text-xs text-white/50">Total Income</p>
                    <p className="text-lg text-white mt-1">{formatINR(liveResult.totalIncome)}</p>
                  </div>
                  <div className="p-3 rounded-lg bg-white/5 border border-white/10 text-center">
                    <p className="text-xs text-white/50">Taxable Income</p>
                    <p className="text-lg text-white mt-1">{formatINR(liveResult.taxableIncome)}</p>
                  </div>
                  <div className={`p-3 rounded-lg border text-center ${liveResult.refundDue > 0 ? 'bg-green-900/20 border-green-500/30' : 'bg-[#c0a062]/10 border-[#c0a062]/30'}`}>
                    <p className="text-xs text-white/50">{liveResult.refundDue > 0 ? 'Estimated Refund' : 'Estimated Tax Due'}</p>
                    <p className={`text-lg mt-1 ${liveResult.refundDue > 0 ? 'text-green-400' : 'text-[#c0a062]'}`}>
                      {formatINR(liveResult.refundDue > 0 ? liveResult.refundDue : liveResult.taxDue)}
                    </p>
                  </div>
                </div>
                <p className="text-xs text-white/40 mt-3">
                  Updates automatically as you edit. Values are not auto-submitted or filed.
                </p>
              </div>
            )}
            
            {/* Editable Form */}
            <div className="space-y-4">
              <h3 className="text-lg font-semibold text-white flex items-center gap-2">
                <Edit3 className="w-5 h-5 text-[#c0a062]" />
                Review & Edit Extracted Values
              </h3>
              
              <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                {/* Form 16 Fields */}
                {documentType === 'form16' && (
                  <>
                    <EditableField
                      label="Gross Salary"
                      value={editableData.grossSalary}
                      onChange={(v) => handleFieldChange('grossSalary', v)}
                      extracted={extractedData.grossSalary}
                      edited={editedFields.has('grossSalary') || editableData.grossSalary !== baselineData.grossSalary}
                    />
                    <EditableField
                      label="Exemptions (HRA, etc.)"
                      value={editableData.exemptions}
                      onChange={(v) => handleFieldChange('exemptions', v)}
                      extracted={extractedData.exemptions}
                      edited={editedFields.has('exemptions') || editableData.exemptions !== baselineData.exemptions}
                    />
                    <EditableField
                      label="Deduction 80C"
                      value={editableData.deduction80C}
                      onChange={(v) => handleFieldChange('deduction80C', v)}
                      extracted={extractedData.deduction80C}
                      max={150000}
                      edited={editedFields.has('deduction80C') || editableData.deduction80C !== baselineData.deduction80C}
                    />
                    <div className="sm:col-span-2 p-3 rounded-xl border border-white/10 bg-white/5">
                      <p className="text-sm text-white/80 font-medium">Section 80D (Medical insurance) — review required</p>
                      <p className="text-xs text-white/50 mt-1">
                        Caps are applied automatically (25k/50k for self/family and parents based on senior status).
                      </p>
                      <div className="grid grid-cols-1 sm:grid-cols-2 gap-4 mt-4">
                        <EditableField
                          label="80D Self/Family"
                          value={editableData.deduction80DSelfFamily ?? editableData.deduction80D ?? null}
                          onChange={(v) => handleFieldChange('deduction80DSelfFamily', v)}
                          extracted={extractedData.deduction80DSelfFamily ?? extractedData.deduction80D}
                          max={50000}
                          edited={
                            editedFields.has('deduction80DSelfFamily') ||
                            (editableData.deduction80DSelfFamily ?? null) !== (baselineData.deduction80DSelfFamily ?? null)
                          }
                        />
                        <EditableField
                          label="80D Parents"
                          value={editableData.deduction80DParents ?? null}
                          onChange={(v) => handleFieldChange('deduction80DParents', v)}
                          extracted={extractedData.deduction80DParents}
                          max={50000}
                          edited={
                            editedFields.has('deduction80DParents') ||
                            (editableData.deduction80DParents ?? null) !== (baselineData.deduction80DParents ?? null)
                          }
                        />
                      </div>
                      <div className="grid grid-cols-1 sm:grid-cols-2 gap-3 mt-4">
                        <label className="flex items-start gap-2 text-xs text-white/70">
                          <input
                            type="checkbox"
                            checked={Boolean(editableData.selfFamilySenior)}
                            onChange={(e) => {
                              setEditableData((prev) => ({ ...prev, selfFamilySenior: e.target.checked }));
                              setEditedFields((prev) => {
                                const next = new Set(prev);
                                next.add('selfFamilySenior');
                                return next;
                              });
                              setReviewConfirmed(false);
                            }}
                            className="mt-0.5"
                          />
                          Self/Family is senior citizen (60+)
                        </label>
                        <label className="flex items-start gap-2 text-xs text-white/70">
                          <input
                            type="checkbox"
                            checked={Boolean(editableData.parentsSenior)}
                            onChange={(e) => {
                              setEditableData((prev) => ({ ...prev, parentsSenior: e.target.checked }));
                              setEditedFields((prev) => {
                                const next = new Set(prev);
                                next.add('parentsSenior');
                                return next;
                              });
                              setReviewConfirmed(false);
                            }}
                            className="mt-0.5"
                          />
                          Parents are senior citizens (60+)
                        </label>
                      </div>
                    </div>
                    <EditableField
                      label="TDS Deducted"
                      value={editableData.tdsDeducted}
                      onChange={(v) => handleFieldChange('tdsDeducted', v)}
                      extracted={extractedData.tdsDeducted}
                      edited={editedFields.has('tdsDeducted') || editableData.tdsDeducted !== baselineData.tdsDeducted}
                    />
                    {typeof extractedData.totalTaxAsPerDoc === 'number' && extractedData.totalTaxAsPerDoc > 0 && (
                      <div className="sm:col-span-2 p-3 rounded-lg bg-white/5 border border-white/10">
                        <p className="text-xs text-white/60">
                          <Info className="w-3 h-3 inline mr-1" />
                          Document mentions total tax: {formatINR(extractedData.totalTaxAsPerDoc)} (reference only)
                        </p>
                      </div>
                    )}
                  </>
                )}
                
                {/* AIS Fields */}
                {documentType === 'ais' && (
                  <>
                    <EditableField
                      label="Interest Income"
                      value={editableData.interestIncome}
                      onChange={(v) => handleFieldChange('interestIncome', v)}
                      extracted={extractedData.interestIncome}
                      edited={editedFields.has('interestIncome') || editableData.interestIncome !== baselineData.interestIncome}
                    />
                    <EditableField
                      label="Dividend Income"
                      value={editableData.dividendIncome}
                      onChange={(v) => handleFieldChange('dividendIncome', v)}
                      extracted={extractedData.dividendIncome}
                      edited={editedFields.has('dividendIncome') || editableData.dividendIncome !== baselineData.dividendIncome}
                    />
                    <EditableField
                      label="Capital Gains (Display Only)"
                      value={editableData.capitalGains}
                      onChange={(v) => handleFieldChange('capitalGains', v)}
                      extracted={extractedData.capitalGains}
                      hint="Not included in basic calculation"
                      edited={editedFields.has('capitalGains') || editableData.capitalGains !== baselineData.capitalGains}
                    />
                    <EditableField
                      label="TDS Entries"
                      value={editableData.tdsEntries}
                      onChange={(v) => handleFieldChange('tdsEntries', v)}
                      extracted={extractedData.tdsEntries}
                      edited={editedFields.has('tdsEntries') || editableData.tdsEntries !== baselineData.tdsEntries}
                    />
                  </>
                )}
                
                {/* Bank Interest Fields */}
                {documentType === 'bankInterest' && (
                  <>
                    <EditableField
                      label="Total Interest Earned"
                      value={editableData.totalInterest}
                      onChange={(v) => handleFieldChange('totalInterest', v)}
                      extracted={extractedData.totalInterest}
                      edited={editedFields.has('totalInterest') || editableData.totalInterest !== baselineData.totalInterest}
                    />
                    <EditableField
                      label="TDS on Interest"
                      value={editableData.tdsOnInterest}
                      onChange={(v) => handleFieldChange('tdsOnInterest', v)}
                      extracted={extractedData.tdsOnInterest}
                      edited={editedFields.has('tdsOnInterest') || editableData.tdsOnInterest !== baselineData.tdsOnInterest}
                    />
                  </>
                )}
                
                {/* Common additional fields for tax calculation */}
                {documentType !== 'form16' && (
                  <>
                    <EditableField
                      label="Gross Salary (if any)"
                      value={editableData.grossSalary ?? null}
                      onChange={(v) => handleFieldChange('grossSalary', v)}
                      hint="Add if you have salary income"
                      edited={editedFields.has('grossSalary') || (editableData.grossSalary ?? null) !== (baselineData.grossSalary ?? null)}
                    />
                    <EditableField
                      label="Deduction 80C (if any)"
                      value={editableData.deduction80C ?? null}
                      onChange={(v) => handleFieldChange('deduction80C', v)}
                      max={150000}
                      hint="For Old Regime only"
                      edited={editedFields.has('deduction80C') || (editableData.deduction80C ?? null) !== (baselineData.deduction80C ?? null)}
                    />
                  </>
                )}
              </div>
              
              {/* Map bank interest to interestIncome for calculation */}
              {documentType === 'bankInterest' && Number(editableData.totalInterest || 0) > 0 && (
                <div className="p-3 rounded-lg bg-white/5 border border-white/10">
                  <p className="text-xs text-white/60">
                    <Info className="w-3 h-3 inline mr-1" />
                    Bank interest of {formatINR(editableData.totalInterest)} will be added to your income.
                  </p>
                </div>
              )}
            </div>
            
            {/* Regime Selection */}
            <div className="space-y-3">
              <h3 className="text-sm font-medium text-white/80">Select Tax Regime</h3>
              <div className="grid grid-cols-2 gap-3">
                <button
                  onClick={() => setRegime('new')}
                  className={`p-4 rounded-xl border transition-colors text-left
                    ${regime === 'new' 
                      ? 'border-[#c0a062] bg-[#c0a062]/20' 
                      : 'border-white/10 hover:border-white/20'}`}
                >
                  <p className="font-medium text-white">New Regime</p>
                  <p className="text-xs text-white/60 mt-1">Lower rates, fewer deductions</p>
                </button>
                <button
                  onClick={() => setRegime('old')}
                  className={`p-4 rounded-xl border transition-colors text-left
                    ${regime === 'old' 
                      ? 'border-[#c0a062] bg-[#c0a062]/20' 
                      : 'border-white/10 hover:border-white/20'}`}
                >
                  <p className="font-medium text-white">Old Regime</p>
                  <p className="text-xs text-white/60 mt-1">80C, 80D, HRA deductions</p>
                </button>
              </div>
            </div>

            {/* Review confirmation gate */}
            <div className="p-4 rounded-xl border border-white/10 bg-white/5">
              <label className="flex items-start gap-3 cursor-pointer">
                <input
                  type="checkbox"
                  checked={reviewConfirmed}
                  onChange={(e) => setReviewConfirmed(e.target.checked)}
                  className="mt-1"
                />
                <span className="text-sm text-white/70">
                  I have reviewed these values and understand this tool only provides an estimate (it does not file/submit anything).
                </span>
              </label>
            </div>
            
            {/* Proceed Button (Result screen) */}
            <button
              onClick={handleProceedToResult}
              disabled={!reviewConfirmed}
              className="w-full py-4 rounded-xl font-semibold text-white calculator-premium-cta flex items-center justify-center gap-2 disabled:opacity-50 disabled:cursor-not-allowed"
            >
              <Calculator className="w-5 h-5" />
              Continue to Result
            </button>
          </div>
        )}
        
        {/* STEP: RESULT */}
        {step === STEPS.RESULT && result && (
          <div className="space-y-6">
            
            {/* Result Summary */}
            <div className="grid grid-cols-1 sm:grid-cols-3 gap-4">
              <div className="p-5 rounded-xl bg-white/5 border border-white/10 text-center">
                <p className="text-xs text-white/50 uppercase tracking-wider">Total Income</p>
                <p className="text-2xl font-bold text-white mt-2">{formatINR(result.totalIncome)}</p>
              </div>
              <div className="p-5 rounded-xl bg-white/5 border border-white/10 text-center">
                <p className="text-xs text-white/50 uppercase tracking-wider">Taxable Income</p>
                <p className="text-2xl font-bold text-white mt-2">{formatINR(result.taxableIncome)}</p>
              </div>
              <div className={`p-5 rounded-xl border text-center ${
                result.refundDue > 0 
                  ? 'bg-green-900/20 border-green-500/30' 
                  : 'bg-[#c0a062]/10 border-[#c0a062]/30'
              }`}>
                <p className="text-xs text-white/50 uppercase tracking-wider">
                  {result.refundDue > 0 ? 'Estimated Refund' : 'Estimated Tax Due'}
                </p>
                <p className={`text-2xl font-bold mt-2 ${
                  result.refundDue > 0 ? 'text-green-400' : 'text-[#c0a062]'
                }`}>
                  {formatINR(result.refundDue > 0 ? result.refundDue : result.taxDue)}
                </p>
              </div>
            </div>
            
            {/* Regime Badge */}
            <div className="inline-flex items-center gap-2 px-3 py-1.5 rounded-full bg-white/10">
              <span className="text-sm text-white/70">
                Calculated using <strong className="text-white">{result.regime === 'new' ? 'New' : 'Old'} Regime</strong> (FY 2025-26)
              </span>
            </div>
            
            {/* Breakdown Table */}
            <div className="space-y-4">
              <h3 className="text-lg font-semibold text-white">Calculation Breakdown</h3>
              
              <div className="overflow-x-auto">
                <table className="w-full text-sm">
                  <thead>
                    <tr className="border-b border-white/10">
                      <th className="text-left py-3 text-white/60 font-medium">Description</th>
                      <th className="text-right py-3 text-white/60 font-medium">Amount</th>
                    </tr>
                  </thead>
                  <tbody className="divide-y divide-white/5">
                    <tr>
                      <td className="py-3 text-white/80">Gross Income</td>
                      <td className="py-3 text-right text-white">{formatINR(result.totalIncome)}</td>
                    </tr>
                    <tr>
                      <td className="py-3 text-white/80">
                        Total Deductions
                        <span className="text-xs text-white/50 block">
                          {result.regime === 'new' ? 'Std. Deduction ₹75,000' : 'Std. + 80C + 80D + Exemptions'}
                        </span>
                      </td>
                      <td className="py-3 text-right text-white">- {formatINR(result.deductionsApplied.total || 0)}</td>
                    </tr>
                    <tr className="bg-white/5">
                      <td className="py-3 text-white font-medium">Taxable Income</td>
                      <td className="py-3 text-right text-white font-medium">{formatINR(result.taxableIncome)}</td>
                    </tr>
                    <tr>
                      <td className="py-3 text-white/80">Tax (before cess)</td>
                      <td className="py-3 text-right text-white">{formatINR(result.taxBeforeCess)}</td>
                    </tr>
                    {result.surcharge > 0 && (
                      <tr>
                        <td className="py-3 text-white/80">Surcharge</td>
                        <td className="py-3 text-right text-white">{formatINR(result.surcharge)}</td>
                      </tr>
                    )}
                    <tr>
                      <td className="py-3 text-white/80">Health & Education Cess (4%)</td>
                      <td className="py-3 text-right text-white">{formatINR(result.cess)}</td>
                    </tr>
                    <tr className="bg-white/5">
                      <td className="py-3 text-white font-medium">Total Estimated Tax</td>
                      <td className="py-3 text-right text-white font-medium">{formatINR(result.totalTax)}</td>
                    </tr>
                    <tr>
                      <td className="py-3 text-white/80">TDS Already Paid</td>
                      <td className="py-3 text-right text-green-400">- {formatINR(result.tdsAlreadyPaid)}</td>
                    </tr>
                    <tr className={`${result.refundDue > 0 ? 'bg-green-900/20' : 'bg-[#c0a062]/10'}`}>
                      <td className="py-3 font-semibold text-white">
                        {result.refundDue > 0 ? 'Estimated Refund' : 'Estimated Tax Payable'}
                      </td>
                      <td className={`py-3 text-right font-semibold text-lg ${
                        result.refundDue > 0 ? 'text-green-400' : 'text-[#c0a062]'
                      }`}>
                        {formatINR(result.refundDue > 0 ? result.refundDue : result.taxDue)}
                      </td>
                    </tr>
                  </tbody>
                </table>
              </div>
            </div>
            
            {/* Slab Breakdown */}
            {result.slabBreakdown.length > 0 && (
              <div className="space-y-3">
                <h4 className="text-sm font-medium text-white/80">Tax Slab Breakdown</h4>
                <div className="overflow-x-auto">
                  <table className="w-full text-sm">
                    <thead>
                      <tr className="border-b border-white/10">
                        <th className="text-left py-2 text-white/50 text-xs">Slab</th>
                        <th className="text-center py-2 text-white/50 text-xs">Rate</th>
                        <th className="text-right py-2 text-white/50 text-xs">Amount</th>
                        <th className="text-right py-2 text-white/50 text-xs">Tax</th>
                      </tr>
                    </thead>
                    <tbody className="divide-y divide-white/5">
                      {result.slabBreakdown.map((slab, idx) => (
                        <tr key={idx}>
                          <td className="py-2 text-white/70">
                            {formatINR(slab.from)} - {slab.to === Infinity ? '∞' : formatINR(slab.to)}
                          </td>
                          <td className="py-2 text-center text-white/70">{slab.rate}%</td>
                          <td className="py-2 text-right text-white/70">{formatINR(slab.amount)}</td>
                          <td className="py-2 text-right text-white">{formatINR(slab.tax)}</td>
                        </tr>
                      ))}
                    </tbody>
                  </table>
                </div>
              </div>
            )}
            
            {/* Action Buttons */}
            <div className="flex flex-col sm:flex-row gap-3">
              <button
                onClick={handleDownloadPDF}
                className="flex-1 py-3 rounded-xl font-medium text-white calculator-premium-cta flex items-center justify-center gap-2"
              >
                <Download className="w-5 h-5" />
                Download PDF Summary
              </button>
              <button
                onClick={() => setStep(STEPS.REVIEW)}
                className="flex-1 py-3 rounded-xl font-medium text-white border border-white/20 hover:bg-white/5 flex items-center justify-center gap-2"
              >
                <Edit3 className="w-5 h-5" />
                Edit Values
              </button>
              <button
                onClick={handleReset}
                className="py-3 px-6 rounded-xl font-medium text-white/70 border border-white/10 hover:bg-white/5 flex items-center justify-center gap-2"
              >
                <Trash2 className="w-5 h-5" />
                Start Over
              </button>
            </div>
            
            {/* Soft CTA */}
            <div className="p-5 rounded-xl border border-[#c0a062]/30 bg-[#c0a062]/10 text-center">
              <p className="text-sm text-white/80 mb-3">
                Need help filing or reviewing your return?
              </p>
              <a
                href="/contact"
                className="inline-flex items-center gap-2 px-5 py-2.5 rounded-lg bg-[#c0a062]/20 border border-[#c0a062]/40 text-[#c0a062] text-sm font-medium hover:bg-[#c0a062]/30 transition-colors"
              >
                Talk to a BM Wealth professional
              </a>
            </div>
            
          </div>
        )}
      </div>
    </div>
  );
}

// Editable Field Component
function EditableField({ label, value, onChange, extracted, edited, max, hint }) {
  const [isFocused, setIsFocused] = useState(false);
  const wasEdited = Boolean(edited ?? (extracted !== undefined && value !== extracted));
  const numericValue = typeof value === 'number' && Number.isFinite(value) ? value : null;
  const displayValue = isFocused
    ? (numericValue == null ? '' : String(numericValue))
    : (numericValue == null ? '' : numericValue.toLocaleString('en-IN'));
  
  return (
    <div className="space-y-1.5">
      <label className="block text-sm text-white/70">
        {label}
        {max && <span className="text-xs text-white/40 ml-1">(Max: {formatINR(max)})</span>}
      </label>
      <div className="relative">
        <span className="absolute left-3 top-1/2 -translate-y-1/2 text-white/50">₹</span>
        <input
          type="text"
          value={displayValue}
          onChange={(e) => onChange(e.target.value)}
          onFocus={() => setIsFocused(true)}
          onBlur={() => setIsFocused(false)}
          className={`w-full pl-8 pr-4 py-3 rounded-lg bg-white/5 border text-white 
            focus:outline-none focus:ring-2 focus:ring-[#c0a062]/50
            ${wasEdited ? 'border-[#c0a062]/50' : 'border-white/10'}`}
        />
        {wasEdited && (
          <span className="absolute right-3 top-1/2 -translate-y-1/2">
            <Edit3 className="w-4 h-4 text-[#c0a062]" />
          </span>
        )}
      </div>
      {typeof extracted === 'number' && extracted > 0 && (
        <p className="text-xs text-white/40">
          OCR extracted: {formatINR(extracted)}
          {wasEdited && ' (edited)'}
        </p>
      )}
      {hint && (
        <p className="text-xs text-white/40 flex items-center gap-1">
          <Info className="w-3 h-3" />
          {hint}
        </p>
      )}
    </div>
  );
}
