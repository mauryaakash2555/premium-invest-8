'use client';

import { useState, useCallback, useRef, useEffect, useMemo, Fragment } from 'react';
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

const clamp01 = (n) => Math.max(0, Math.min(1, Number(n) || 0));

function makeDocId() {
  // Short, collision-resistant enough for a session.
  return `doc_${Date.now().toString(36)}_${Math.random().toString(36).slice(2, 9)}`;
}

function getFileKind(file) {
  const t = String(file?.type || '').toLowerCase();
  if (t === 'application/pdf' || file?.name?.toLowerCase?.().endsWith?.('.pdf')) return 'pdf';
  if (t.startsWith('image/')) return 'image';
  return 'unknown';
}

function extractSnippet(text, idx, before = 50, after = 140) {
  const s = String(text || '');
  if (!s) return null;
  const start = Math.max(0, idx - before);
  const end = Math.min(s.length, idx + after);
  return s.slice(start, end).replace(/\s{2,}/g, ' ').trim();
}

function findEvidenceInPages(pagesText, anchors) {
  const pages = Array.isArray(pagesText) ? pagesText : [];
  const anchorList = (Array.isArray(anchors) ? anchors : [anchors]).filter(Boolean).map((a) => String(a).toLowerCase());
  if (pages.length === 0 || anchorList.length === 0) return null;

  for (let pageIdx = 0; pageIdx < pages.length; pageIdx++) {
    const pageText = String(pages[pageIdx] || '');
    const low = pageText.toLowerCase();
    for (const a of anchorList) {
      const idx = low.indexOf(a);
      if (idx >= 0) {
        return {
          page: pageIdx + 1,
          anchor: a,
          snippet: extractSnippet(pageText, idx),
        };
      }
    }
  }

  return null;
}

async function loadPdfJsWithRetry() {
  try {
    return await import('pdfjs-dist/build/pdf.mjs');
  } catch (err) {
    const message = err?.message || '';
    const isChunkLoad = err?.name === 'ChunkLoadError' || /Loading chunk .* failed/i.test(message);
    if (!isChunkLoad) throw err;
    await new Promise((r) => setTimeout(r, 300));
    return await import('pdfjs-dist/build/pdf.mjs');
  }
}

async function loadTesseractCdn() {
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
}

async function fileToDataUrl(file) {
  const f = file;
  if (!f) return null;
  return await new Promise((resolve, reject) => {
    const reader = new FileReader();
    reader.onload = () => resolve(String(reader.result || ''));
    reader.onerror = reject;
    reader.readAsDataURL(f);
  });
}

async function preprocessImageDataUrl(dataUrl, { contrast = 1.25 } = {}) {
  // Lightweight preprocessing: grayscale + contrast.
  // (Deskew is intentionally not attempted here to avoid heavy dependencies.)
  const src = String(dataUrl || '');
  if (!src.startsWith('data:image/')) return src;

  const img = await new Promise((resolve, reject) => {
    const i = new Image();
    i.onload = () => resolve(i);
    i.onerror = reject;
    i.src = src;
  });

  const canvas = document.createElement('canvas');
  canvas.width = img.width;
  canvas.height = img.height;
  const ctx = canvas.getContext('2d');
  ctx.drawImage(img, 0, 0);

  const imageData = ctx.getImageData(0, 0, canvas.width, canvas.height);
  const d = imageData.data;
  for (let i = 0; i < d.length; i += 4) {
    const r = d[i];
    const g = d[i + 1];
    const b = d[i + 2];
    // luminance
    let v = 0.2126 * r + 0.7152 * g + 0.0722 * b;
    // contrast around mid-point
    v = (v - 128) * contrast + 128;
    v = Math.max(0, Math.min(255, v));
    d[i] = d[i + 1] = d[i + 2] = v;
  }
  ctx.putImageData(imageData, 0, 0);
  return canvas.toDataURL('image/png');
}

function groupPdfJsItemsIntoLines(items) {
  // PDF.js text items include a transform matrix; transform[4] is x, transform[5] is y.
  // Bucket by y (rounded) to preserve line order.
  const byY = new Map();
  for (const item of items || []) {
    const str = String(item?.str || '').trim();
    if (!str) continue;
    const t = item?.transform;
    const x = Array.isArray(t) ? Number(t[4] || 0) : 0;
    const y = Array.isArray(t) ? Number(t[5] || 0) : 0;
    const key = Math.round(y);
    const row = byY.get(key) || [];
    row.push({ x, str });
    byY.set(key, row);
  }

  // Higher y is usually higher on the page.
  const ys = Array.from(byY.keys()).sort((a, b) => b - a);
  const lines = ys.map((y) => {
    const row = byY.get(y) || [];
    row.sort((a, b) => a.x - b.x);
    return row.map((r) => r.str).join(' ').replace(/\s{2,}/g, ' ').trim();
  });

  return lines.filter(Boolean);
}

function stripCommonHeaderFooter(pagesLines) {
  if (!Array.isArray(pagesLines) || pagesLines.length < 2) return pagesLines;

  const prefixCandidates = new Map();
  const suffixCandidates = new Map();

  for (const lines of pagesLines) {
    const prefix = (lines || []).slice(0, 3).map((s) => s.toLowerCase());
    const suffix = (lines || []).slice(-3).map((s) => s.toLowerCase());

    for (const p of prefix) {
      if (!p || p.length < 8) continue;
      prefixCandidates.set(p, (prefixCandidates.get(p) || 0) + 1);
    }
    for (const s of suffix) {
      if (!s || s.length < 8) continue;
      suffixCandidates.set(s, (suffixCandidates.get(s) || 0) + 1);
    }
  }

  const minCount = Math.max(2, Math.ceil(pagesLines.length * 0.6));
  const commonHeader = new Set(
    Array.from(prefixCandidates.entries())
      .filter(([, c]) => c >= minCount)
      .map(([t]) => t)
  );
  const commonFooter = new Set(
    Array.from(suffixCandidates.entries())
      .filter(([, c]) => c >= minCount)
      .map(([t]) => t)
  );

  return pagesLines.map((lines) => {
    const clean = [];
    for (const line of lines || []) {
      const low = String(line).toLowerCase();
      if (commonHeader.has(low) || commonFooter.has(low)) continue;
      clean.push(line);
    }
    return clean;
  });
}

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

const DOC_TYPE_LABELS = {
  form16: 'Form 16',
  ais: 'Annual Information Statement (AIS)',
  bankInterest: 'Bank Interest Statement',
  unknown: 'Unknown',
};

// Anchors used to locate evidence/snippets within pages.
const FIELD_ANCHORS = {
  grossSalary: ['gross salary', 'income from salary', 'total salary', 'salary as per provisions', 'gross total salary'],
  exemptions: ['hra exemption', 'house rent allowance', 'section 10', 'u/s 10', '10(13a)'],
  deduction80C: ['80c', 'section 80c', 'u/s 80c', 'chapter vi-a', 'chapter vi a'],
  deduction80D: ['80d', 'section 80d', 'u/s 80d', 'medical insurance'],
  deduction80DSelfFamily: ['80d', 'section 80d', 'medical insurance'],
  deduction80DParents: ['80d', 'section 80d', 'medical insurance', 'parents'],
  tdsDeducted: ['total tax deducted', 'total tax deducted at source', 'tds deducted', 'tax deducted at source', 'tds'],
  interestIncome: ['interest income', 'interest on deposits', 'savings interest', 'interest'],
  dividendIncome: ['dividend income', 'dividend'],
  capitalGains: ['capital gains', 'short term capital gain', 'long term capital gain', 'stcg', 'ltcg'],
  tdsEntries: ['tds', 'tax deducted', 'tax deducted at source'],
  totalInterest: ['total interest', 'interest paid', 'interest earned', 'gross interest', 'interest certificate'],
  tdsOnInterest: ['tds on interest', 'tax deducted on interest', 'tds', 'tax deducted'],
};

const REVIEW_FIELDS = [
  { key: 'grossSalary', label: 'Gross Salary', max: null },
  { key: 'exemptions', label: 'Exemptions (HRA, etc.)', max: null },
  { key: 'deduction80C', label: 'Deduction 80C', max: 150000, hint: 'Old Regime only' },
  { key: 'deduction80DSelfFamily', label: '80D Self/Family', max: 50000 },
  { key: 'deduction80DParents', label: '80D Parents', max: 50000 },
  { key: 'interestIncome', label: 'Interest Income', max: null },
  { key: 'dividendIncome', label: 'Dividend Income', max: null },
  { key: 'capitalGains', label: 'Capital Gains (Display Only)', max: null, hint: 'Not included in basic calculation' },
  { key: 'totalInterest', label: 'Total Interest Earned (Bank)', max: null },
  { key: 'tdsOnInterest', label: 'TDS on Interest', max: null },
  { key: 'tdsDeducted', label: 'TDS Deducted', max: null },
  { key: 'tdsEntries', label: 'TDS Entries (AIS)', max: null },
];

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

  const BRAND_LINE = 'BM Wealth • bmwealth.co.in • +91 8850977259 • ARN 90008';
  const FOOTER_TEXT =
    'This is an estimate for educational purposes only. Not a filing document. Please consult a qualified professional before submission.';

  const stampHeaderAndFooterAllPages = () => {
    const total = doc.getNumberOfPages();
    for (let i = 1; i <= total; i += 1) {
      doc.setPage(i);

      // Header
      doc.setFontSize(9);
      doc.setTextColor(80, 80, 80);
      doc.text('BM Wealth', 20, 14);
      doc.setDrawColor(220, 220, 220);
      doc.line(20, 16, 190, 16);

      // Footer
      doc.setFontSize(8);
      doc.setTextColor(120, 120, 120);
      doc.text(BRAND_LINE, 20, 284);
      const lines = doc.splitTextToSize(FOOTER_TEXT, 130);
      doc.text(lines, 20, 289);
      doc.text(`Page ${i} of ${total}`, 190, 289, { align: 'right' });
    }
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
    multiple: 'Multiple documents',
    unknown: 'Not specified',
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

  // Simple glossary to reduce jargon confusion
  y += 10;
  doc.setTextColor(0, 0, 0);
  doc.setFontSize(11);
  doc.text('Glossary (simple)', 20, y);
  y += 7;
  doc.setFontSize(9);
  doc.setTextColor(60, 60, 60);
  const glossaryLines = [
    'FY: Financial Year (income period). AY: Assessment Year (filing period).',
    'HRA: House Rent Allowance exemption (subject to rules + documentation).',
    '80C/80D: Common deduction sections (limits apply).',
    'Cess: Health & Education Cess (4% on tax + surcharge).',
  ];
  glossaryLines.forEach((line) => {
    const wrapped = doc.splitTextToSize(line, 170);
    doc.text(wrapped, 20, y);
    y += wrapped.length * 5;
  });

  // Stamp BM Wealth header/footer + page numbers on all pages
  stampHeaderAndFooterAllPages();

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
  const [documents, setDocuments] = useState([]); // [{ id, file, kind, name, size, type, objectUrl }]
  const [activeDocId, setActiveDocId] = useState(null);
  const [viewerPage, setViewerPage] = useState(1);

  // Consolidated extracted fields
  const [fieldCandidates, setFieldCandidates] = useState({}); // fieldKey -> [{ docId, docName, value, confidence, page, snippet }]
  const [fieldSelectedMeta, setFieldSelectedMeta] = useState({}); // fieldKey -> selected candidate (same shape)
  const [extractedData, setExtractedData] = useState({}); // selected extracted values (for backward UI)
  const [editableData, setEditableData] = useState({});
  const [baselineData, setBaselineData] = useState({});
  const [docAnalyses, setDocAnalyses] = useState({}); // docId -> { detectedType, method, ocrConfidence, totalPages }
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
  const [processingLabel, setProcessingLabel] = useState(null);
  const fileInputRef = useRef(null);
  const [tesseractLoaded, setTesseractLoaded] = useState(false);
  const [pdfJsLoaded, setPdfJsLoaded] = useState(false);

  const activeDoc = useMemo(() => documents.find((d) => d.id === activeDocId) || documents[0] || null, [documents, activeDocId]);

  const detectedDocLabel = useMemo(() => {
    const types = Array.from(
      new Set(
        Object.values(docAnalyses || {})
          .map((a) => a?.docType || a?.detectedType)
          .filter(Boolean)
      )
    );
    if (types.length === 0) return 'Document';
    if (types.length === 1) return DOC_TYPE_LABELS[types[0]] || 'Document';
    const parts = types.map((t) => DOC_TYPE_LABELS[t] || t);
    return `Multiple (${parts.join(', ')})`;
  }, [docAnalyses]);

  // Cleanup object URLs when documents are removed/unmounted.
  useEffect(() => {
    return () => {
      for (const d of documents) {
        try {
          if (d?.objectUrl) URL.revokeObjectURL(d.objectUrl);
        } catch {}
      }
    };
  }, [documents]);
  
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
    const selected = Array.from(e.target.files || []).filter(Boolean);
    if (selected.length === 0) return;
    
    setError(null);
    
    const MAX_BYTES = 10 * 1024 * 1024;

    const nextDocs = [];
    for (const f of selected) {
      const kind = getFileKind(f);
      if (kind === 'unknown') {
        setError('Unsupported file type. Please upload PDFs or images (JPG/PNG/WebP).');
        continue;
      }
      if (f.size > MAX_BYTES) {
        setError('One of the files is too large. Maximum 10MB per file.');
        continue;
      }

      const id = makeDocId();
      let objectUrl = null;
      try {
        objectUrl = URL.createObjectURL(f);
      } catch {}
      nextDocs.push({
        id,
        file: f,
        kind,
        name: f.name || (kind === 'pdf' ? 'document.pdf' : 'image'),
        size: f.size,
        type: f.type,
        objectUrl,
      });
    }

    setDocuments((prev) => [...prev, ...nextDocs]);
    if (!activeDocId && nextDocs[0]?.id) {
      setActiveDocId(nextDocs[0].id);
      setViewerPage(1);
    }
    setReviewConfirmed(false);
    setExtractionMethod(null);
    setOcrConfidence(null);
    setProcessingStage(null);
  }, [activeDocId]);

  const removeDocument = useCallback(
    (id) => {
      setDocuments((prev) => {
        const next = [];
        for (const d of prev || []) {
          if (d.id === id) {
            try {
              if (d?.objectUrl) URL.revokeObjectURL(d.objectUrl);
            } catch {}
            continue;
          }
          next.push(d);
        }

        if (activeDocId === id) {
          setActiveDocId(next[0]?.id || null);
          setViewerPage(1);
        }
        return next;
      });
    },
    [activeDocId]
  );

  const buildCalculationInput = useCallback((data) => {
    const base = { ...(data || {}) };
    // Multi-document: always fold bank interest into interest income for computation.
    const totalInterest = Number(base.totalInterest || 0);
    base.interestIncome = Number(base.interestIncome || 0) + (Number.isFinite(totalInterest) ? totalInterest : 0);
    return base;
  }, []);

  const liveResult = useMemo(() => {
    if (!editableData || Object.keys(editableData).length === 0) return null;
    return calculateTax(buildCalculationInput(editableData), regime);
  }, [editableData, regime, buildCalculationInput]);
  
  // Multi-document processing (PDF + images)
  const processDocuments = useCallback(async () => {
    if (!documents || documents.length === 0) return;

    setStep(STEPS.PROCESSING);
    setProcessing(true);
    setOcrProgress(0);
    setError(null);
    setExtractionMethod(null);
    setOcrConfidence(null);
    setProcessingStage('detecting');
    setProcessingLabel(null);

    try {
      const nextDocAnalyses = {};
      const nextCandidates = {};

      const totalDocs = documents.length;
      let ocrConfSum = 0;
      let ocrConfCount = 0;
      const methodSet = new Set();

      for (let docIdx = 0; docIdx < documents.length; docIdx++) {
        const doc = documents[docIdx];
        setProcessingLabel(`${doc.name} (${docIdx + 1}/${totalDocs})`);

        let pagesText = [];
        let fullText = '';
        let method = null;
        let docOcrConfidence = null;
        let totalPages = 1;

        if (doc.kind === 'pdf') {
          const arrayBuffer = await doc.file.arrayBuffer();

          // Attempt server-side pdfplumber (best for selectable text)
          let serverResult = null;
          try {
            const resp = await fetch('/api/itr/extract-text', {
              method: 'POST',
              headers: { 'content-type': 'application/pdf' },
              body: arrayBuffer,
            });
            if (resp.ok) serverResult = await resp.json();
          } catch {}

          if (serverResult?.hasSelectableText) {
            setProcessingStage('text');
            method = 'selectable-text';
            totalPages = Number(serverResult.totalPages || serverResult.pages?.length || 1);
            pagesText = (serverResult.pages || []).map((p) => String(p?.text || ''));
            fullText = pagesText.join('\n\n').trim();
          } else {
            // Client-side selectable-text via PDF.js; OCR only if needed.
            const pdfjsLib = await loadPdfJsWithRetry();
            const pdfJsVersion = pdfjsLib?.version || pdfjsLib?.default?.version;
            if (pdfjsLib?.GlobalWorkerOptions) {
              const v = pdfJsVersion || '4.10.38';
              pdfjsLib.GlobalWorkerOptions.workerSrc = `https://cdnjs.cloudflare.com/ajax/libs/pdf.js/${v}/pdf.worker.min.mjs`;
            }
            setPdfJsLoaded(true);

            const pdf = await pdfjsLib.getDocument({ data: arrayBuffer }).promise;
            totalPages = pdf.numPages;
            const pageLimit = Math.min(totalPages, 15);

            const pagesLines = [];
            for (let pageNum = 1; pageNum <= pageLimit; pageNum++) {
              const page = await pdf.getPage(pageNum);
              const content = await page.getTextContent();
              pagesLines.push(groupPdfJsItemsIntoLines(content?.items));
              const overall = ((docIdx + pageNum / Math.max(1, pageLimit)) / totalDocs) * 100;
              setOcrProgress(Math.min(99, Math.round(overall)));
            }

            const cleanedLines = stripCommonHeaderFooter(pagesLines);
            pagesText = cleanedLines.map((lines) => (lines || []).join('\n'));
            const pdfJsText = pagesText.join('\n\n').trim();
            const pdfJsSignal = pdfJsText.replace(/\s/g, '').length;

            if (pdfJsSignal > 300) {
              setProcessingStage('text');
              method = 'selectable-text';
              fullText = pdfJsText;
            } else {
              // OCR fallback
              setProcessingStage('ocr');
              method = 'ocr';

              const Tesseract = await loadTesseractCdn();
              setTesseractLoaded(true);

              const ocrPageLimit = Math.min(totalPages, 10);
              pagesText = [];
              let confSum = 0;
              let confN = 0;

              for (let pageNum = 1; pageNum <= ocrPageLimit; pageNum++) {
                const page = await pdf.getPage(pageNum);
                const scale = 2.0;
                const viewport = page.getViewport({ scale });
                const canvas = document.createElement('canvas');
                const context = canvas.getContext('2d');
                canvas.height = viewport.height;
                canvas.width = viewport.width;
                await page.render({ canvasContext: context, viewport }).promise;

                const imageDataUrl = await preprocessImageDataUrl(canvas.toDataURL('image/png'));

                const { data } = await Tesseract.recognize(imageDataUrl, 'eng', {
                  tessedit_pageseg_mode: 3,
                  preserve_interword_spaces: '1',
                  logger: (m) => {
                    if (m.status === 'recognizing text') {
                      const overall = ((docIdx + (pageNum - 1 + m.progress) / Math.max(1, ocrPageLimit)) / totalDocs) * 100;
                      setOcrProgress(Math.min(99, Math.round(overall)));
                    }
                  },
                });

                const confidencePct = Number(data?.confidence);
                if (Number.isFinite(confidencePct)) {
                  confSum += confidencePct;
                  confN += 1;
                }
                pagesText.push(String(data?.text || ''));
              }

              fullText = pagesText.join('\n\n').trim();
              if (confN > 0) docOcrConfidence = clamp01((confSum / confN) / 100);
            }
          }
        } else if (doc.kind === 'image') {
          setProcessingStage('ocr');
          method = 'ocr';
          const Tesseract = await loadTesseractCdn();
          setTesseractLoaded(true);

          const dataUrl = await fileToDataUrl(doc.file);
          const processed = await preprocessImageDataUrl(dataUrl);
          const { data } = await Tesseract.recognize(processed, 'eng', {
            tessedit_pageseg_mode: 3,
            preserve_interword_spaces: '1',
            logger: (m) => {
              if (m.status === 'recognizing text') {
                const overall = ((docIdx + m.progress) / totalDocs) * 100;
                setOcrProgress(Math.min(99, Math.round(overall)));
              }
            },
          });
          const confidencePct = Number(data?.confidence);
          if (Number.isFinite(confidencePct)) docOcrConfidence = clamp01(confidencePct / 100);
          pagesText = [String(data?.text || '')];
          fullText = pagesText[0];
          totalPages = 1;
        } else {
          nextDocAnalyses[doc.id] = { detectedType: 'unknown', method: 'unknown', ocrConfidence: null, totalPages: 0 };
          continue;
        }

        if (method) methodSet.add(method);
        if (method === 'ocr' && typeof docOcrConfidence === 'number') {
          ocrConfSum += docOcrConfidence;
          ocrConfCount += 1;
        }

        const detectedType = detectDocumentType(fullText);
        nextDocAnalyses[doc.id] = {
          detectedType,
          method,
          ocrConfidence: docOcrConfidence,
          totalPages,
          name: doc.name,
          kind: doc.kind,
        };

        // Extract values
        let extracted = {};
        if (detectedType === 'form16') extracted = extractForm16Data(fullText);
        else if (detectedType === 'ais') extracted = extractAISData(fullText);
        else if (detectedType === 'bankInterest') extracted = extractBankInterestData(fullText);

        // Build candidates with evidence
        const base = method === 'selectable-text' ? 0.98 : (typeof docOcrConfidence === 'number' ? docOcrConfidence : 0.7);
        for (const [fieldKey, v] of Object.entries(extracted || {})) {
          const value = typeof v === 'number' && Number.isFinite(v) ? v : null;
          if (value == null) continue;
          const anchors = FIELD_ANCHORS[fieldKey];
          const evidence = anchors ? findEvidenceInPages(pagesText, anchors) : null;
          let confidence = base;
          if (evidence) confidence = clamp01(confidence + 0.08);
          if (method === 'ocr' && typeof docOcrConfidence === 'number' && docOcrConfidence < 0.6) {
            confidence = clamp01(confidence * 0.85);
          }

          const cand = {
            docId: doc.id,
            docName: doc.name,
            value,
            confidence,
            page: evidence?.page || 1,
            snippet: evidence?.snippet || null,
          };
          nextCandidates[fieldKey] = [...(nextCandidates[fieldKey] || []), cand];
        }
      }

      // Consolidate: select highest-confidence candidate per field (but still show conflicts)
      const nextSelected = {};
      const nextSelectedMeta = {};
      for (const fieldKey of Object.keys(nextCandidates)) {
        const list = nextCandidates[fieldKey] || [];
        list.sort((a, b) => (b.confidence || 0) - (a.confidence || 0));
        if (list[0]) {
          nextSelected[fieldKey] = list[0].value;
          nextSelectedMeta[fieldKey] = list[0];
        }
      }

      setDocAnalyses(nextDocAnalyses);
      setFieldCandidates(nextCandidates);
      setFieldSelectedMeta(nextSelectedMeta);
      setExtractedData(nextSelected);
      setEditableData(nextSelected);
      setBaselineData(nextSelected);
      setEditedFields(new Set());
      setReviewConfirmed(false);

      // Summary method/confidence for UI
      const methods = Array.from(methodSet);
      if (methods.length === 1) setExtractionMethod(methods[0]);
      else if (methods.length > 1) setExtractionMethod('mixed');
      if (ocrConfCount > 0) setOcrConfidence(clamp01(ocrConfSum / ocrConfCount));

      setOcrProgress(100);
      setStep(STEPS.REVIEW);
    } catch (error) {
      console.error('Document processing error:', error);
      const message = error?.message || '';
      const isChunkLoad = error?.name === 'ChunkLoadError' || /Loading chunk .* failed/i.test(message);
      if (isChunkLoad) {
        setError('PDF engine failed to load (dev-server chunk mismatch). Please hard refresh (Ctrl+F5) and try again.');
      } else {
        setError(message || 'Error processing documents. Please try again.');
      }
      setStep(STEPS.UPLOAD);
    } finally {
      setProcessing(false);
      setProcessingStage(null);
      setProcessingLabel(null);
    }
  }, [documents]);
  
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
      const detectedTypes = Object.values(docAnalyses || {})
        .map((d) => d?.detectedType)
        .filter(Boolean);
      const unique = Array.from(new Set(detectedTypes));
      const docTypeForPdf = unique.length === 1 ? unique[0] : (unique.length > 1 ? 'multiple' : 'unknown');
      const doc = await generateSummaryPDF(editableData, result, docTypeForPdf);
      doc.save('BM_Wealth_Tax_Estimate.pdf');
    } catch (err) {
      console.error('PDF generation error:', err);
      setError('Error generating PDF. Please try again.');
    }
  }, [editableData, result, docAnalyses]);
  
  // Reset tool
  const handleReset = useCallback(() => {
    setStep(STEPS.UPLOAD);
    setDocuments((prev) => {
      for (const d of prev || []) {
        try {
          if (d?.objectUrl) URL.revokeObjectURL(d.objectUrl);
        } catch {}
      }
      return [];
    });
    setActiveDocId(null);
    setViewerPage(1);
    setDocAnalyses({});
    setFieldCandidates({});
    setFieldSelectedMeta({});
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
    setProcessingLabel(null);
    if (fileInputRef.current) {
      fileInputRef.current.value = '';
    }
  }, []);
  
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
                ? 'bg-gradient-to-r from-[var(--lux-accent)]/20 to-transparent text-[var(--lux-accent)]' 
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
                    ${documents?.length 
                      ? 'border-[var(--lux-accent)]/50 bg-[var(--lux-accent)]/10' 
                      : 'border-white/20 hover:border-white/40 hover:bg-white/5'}`}
                  onClick={() => fileInputRef.current?.click()}
                >
                  <input
                    ref={fileInputRef}
                    type="file"
                    multiple
                    accept=".pdf,application/pdf,image/*"
                    onChange={handleFileSelect}
                    className="hidden"
                  />
                  
                  {documents?.length ? (
                    <div className="space-y-3">
                      <FileText className="w-12 h-12 mx-auto text-[var(--lux-accent)]" />
                      <p className="text-white font-medium">
                        {documents.length} file{documents.length === 1 ? '' : 's'} added
                      </p>
                      <p className="text-xs text-white/60">
                        Click to add more, or pick an active document below.
                      </p>

                      <div className="mt-4 max-h-48 overflow-auto space-y-2 text-left">
                        {documents.map((doc) => {
                          const isActive = doc.id === activeDocId;
                          return (
                            <div
                              key={doc.id}
                              className={`p-3 rounded-lg border flex items-start justify-between gap-3 cursor-pointer transition-colors
                                ${isActive ? 'border-[var(--lux-accent)]/50 bg-[var(--lux-accent)]/10' : 'border-white/10 bg-white/5 hover:bg-white/10'}`}
                              onClick={(e) => {
                                e.stopPropagation();
                                setActiveDocId(doc.id);
                                setViewerPage(1);
                              }}
                            >
                              <div className="min-w-0">
                                <p className="text-sm text-white/90 font-medium truncate">{doc.name}</p>
                                <p className="text-xs text-white/50">
                                  {(doc.size / 1024 / 1024).toFixed(2)} MB • {doc.kind.toUpperCase()}
                                  {doc.pages ? ` • ${doc.pages} pages` : ''}
                                </p>
                              </div>
                              <button
                                onClick={(e) => {
                                  e.stopPropagation();
                                  removeDocument(doc.id);
                                  if (fileInputRef.current) fileInputRef.current.value = '';
                                }}
                                className="text-xs text-red-400 hover:text-red-300 underline shrink-0"
                              >
                                Remove
                              </button>
                            </div>
                          );
                        })}
                      </div>
                    </div>
                  ) : (
                    <div className="space-y-2">
                      <Upload className="w-12 h-12 mx-auto text-white/40" />
                      <p className="text-white/80">Click to upload PDFs or images</p>
                      <p className="text-xs text-white/50">
                        Supported: Form 16, AIS, Bank Interest Statement (PDF or photo)
                      </p>
                      <p className="text-xs text-white/40">Tip: Upload multiple documents together</p>
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
            {!!documents?.length && (
              <button
                onClick={processDocuments}
                disabled={processing}
                className="w-full py-4 rounded-xl font-semibold text-white calculator-premium-cta disabled:opacity-50 disabled:cursor-not-allowed flex items-center justify-center gap-2"
              >
                <FileText className="w-5 h-5" />
                Process Documents
              </button>
            )}
          </div>
        )}
        
        {/* STEP: PROCESSING */}
        {step === STEPS.PROCESSING && (
          <div className="py-12 text-center space-y-6">
            <Loader2 className="w-16 h-16 mx-auto text-[var(--lux-accent)] animate-spin" />
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
                  className="h-full bg-gradient-to-r from-[var(--lux-accent)] to-[#d4b77a] transition-all duration-300"
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
              <div className="inline-flex items-center gap-2 px-3 py-1.5 rounded-full bg-[var(--lux-accent)]/20 border border-[var(--lux-accent)]/30">
                <CheckCircle className="w-4 h-4 text-[var(--lux-accent)]" />
                <span className="text-sm text-[var(--lux-accent)]">
                  Detected: {detectedDocLabel}
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
                  <div className={`p-3 rounded-lg border text-center ${liveResult.refundDue > 0 ? 'bg-green-900/20 border-green-500/30' : 'bg-[var(--lux-accent)]/10 border-[var(--lux-accent)]/30'}`}>
                    <p className="text-xs text-white/50">{liveResult.refundDue > 0 ? 'Estimated Refund' : 'Estimated Tax Due'}</p>
                    <p className={`text-lg mt-1 ${liveResult.refundDue > 0 ? 'text-green-400' : 'text-[var(--lux-accent)]'}`}>
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
                <Edit3 className="w-5 h-5 text-[var(--lux-accent)]" />
                Review & Edit Extracted Values
              </h3>
              
              <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                {REVIEW_FIELDS.map((field) => {
                  const currentValue = editableData?.[field.key] ?? null;
                  const baseValue = baselineData?.[field.key] ?? null;
                  const extractedValue = extractedData?.[field.key];
                  const edited = editedFields.has(field.key) || currentValue !== baseValue;

                  const content = (
                    <EditableField
                      label={field.label}
                      value={currentValue}
                      onChange={(v) => handleFieldChange(field.key, v)}
                      extracted={extractedValue}
                      max={field.max}
                      hint={field.hint}
                      edited={edited}
                    />
                  );

                  if (field.key === 'deduction80DParents') {
                    return (
                      <Fragment key={field.key}>
                        {content}
                        <div className="sm:col-span-2 p-3 rounded-xl border border-white/10 bg-white/5">
                          <p className="text-sm text-white/80 font-medium">Section 80D (Medical insurance) — caps apply</p>
                          <p className="text-xs text-white/50 mt-1">
                            Caps are applied automatically (25k/50k for self/family and parents based on senior status).
                          </p>
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
                      </Fragment>
                    );
                  }

                  return <Fragment key={field.key}>{content}</Fragment>;
                })}

                {typeof extractedData.totalTaxAsPerDoc === 'number' && extractedData.totalTaxAsPerDoc > 0 && (
                  <div className="sm:col-span-2 p-3 rounded-lg bg-white/5 border border-white/10">
                    <p className="text-xs text-white/60">
                      <Info className="w-3 h-3 inline mr-1" />
                      Document mentions total tax: {formatINR(extractedData.totalTaxAsPerDoc)} (reference only)
                    </p>
                  </div>
                )}
              </div>
              
              {/* Bank interest is added to income */}
              {Number(editableData.totalInterest || 0) > 0 && (
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
                      ? 'border-[var(--lux-accent)] bg-[var(--lux-accent)]/20' 
                      : 'border-white/10 hover:border-white/20'}`}
                >
                  <p className="font-medium text-white">New Regime</p>
                  <p className="text-xs text-white/60 mt-1">Lower rates, fewer deductions</p>
                </button>
                <button
                  onClick={() => setRegime('old')}
                  className={`p-4 rounded-xl border transition-colors text-left
                    ${regime === 'old' 
                      ? 'border-[var(--lux-accent)] bg-[var(--lux-accent)]/20' 
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
                  : 'bg-[var(--lux-accent)]/10 border-[var(--lux-accent)]/30'
              }`}>
                <p className="text-xs text-white/50 uppercase tracking-wider">
                  {result.refundDue > 0 ? 'Estimated Refund' : 'Estimated Tax Due'}
                </p>
                <p className={`text-2xl font-bold mt-2 ${
                  result.refundDue > 0 ? 'text-green-400' : 'text-[var(--lux-accent)]'
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
                    <tr className={`${result.refundDue > 0 ? 'bg-green-900/20' : 'bg-[var(--lux-accent)]/10'}`}>
                      <td className="py-3 font-semibold text-white">
                        {result.refundDue > 0 ? 'Estimated Refund' : 'Estimated Tax Payable'}
                      </td>
                      <td className={`py-3 text-right font-semibold text-lg ${
                        result.refundDue > 0 ? 'text-green-400' : 'text-[var(--lux-accent)]'
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
            <div className="p-5 rounded-xl border border-[var(--lux-accent)]/30 bg-[var(--lux-accent)]/10 text-center">
              <p className="text-sm text-white/80 mb-3">
                Need help filing or reviewing your return?
              </p>
              <a
                href="/contact"
                className="inline-flex items-center gap-2 px-5 py-2.5 rounded-lg bg-[var(--lux-accent)]/20 border border-[var(--lux-accent)]/40 text-[var(--lux-accent)] text-sm font-medium hover:bg-[var(--lux-accent)]/30 transition-colors"
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
            focus:outline-none focus:ring-2 focus:ring-[var(--lux-accent)]/50
            ${wasEdited ? 'border-[var(--lux-accent)]/50' : 'border-white/10'}`}
        />
        {wasEdited && (
          <span className="absolute right-3 top-1/2 -translate-y-1/2">
            <Edit3 className="w-4 h-4 text-[var(--lux-accent)]" />
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
