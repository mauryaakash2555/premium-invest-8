'use client';

import { useState, useCallback, useRef, useEffect } from 'react';
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

// Extract values from Form 16
const extractForm16Data = (text) => {
  const data = {
    grossSalary: 0,
    exemptions: 0,
    deduction80C: 0,
    deduction80D: 0,
    standardDeduction: 0,
    tdsDeducted: 0,
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
      /exemption[^\d]*?([\d,]+)/i,
      /hra\s*exemption[^\d]*?([\d,]+)/i,
      /house\s*rent\s*allowance[^\d]*?([\d,]+)/i,
    ],
  };
  
  for (const [field, patternList] of Object.entries(patterns)) {
    for (const pattern of patternList) {
      const match = text.match(pattern);
      if (match) {
        data[field] = parseInt(match[1].replace(/,/g, ''), 10) || 0;
        break;
      }
    }
  }
  
  return data;
};

// Extract values from AIS
const extractAISData = (text) => {
  const data = {
    interestIncome: 0,
    dividendIncome: 0,
    capitalGains: 0,
    tdsEntries: 0,
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
        data[field] = parseInt(match[1].replace(/,/g, ''), 10) || 0;
        break;
      }
    }
  }
  
  return data;
};

// Extract values from Bank Interest Statement
const extractBankInterestData = (text) => {
  const data = {
    totalInterest: 0,
    tdsOnInterest: 0,
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
        data[field] = parseInt(match[1].replace(/,/g, ''), 10) || 0;
        break;
      }
    }
  }
  
  return data;
};

// Tax calculation (FY 2025-26 slabs)
const calculateTax = (data, regime = 'new') => {
  const {
    grossSalary = 0,
    interestIncome = 0,
    dividendIncome = 0,
    otherIncome = 0,
    deduction80C = 0,
    deduction80D = 0,
    exemptions = 0,
  } = data;
  
  const totalIncome = grossSalary + interestIncome + dividendIncome + otherIncome;
  
  let taxableIncome = totalIncome;
  let deductionsApplied = {};
  
  if (regime === 'old') {
    // Old regime: standard deduction + 80C + 80D + exemptions
    const stdDed = Math.min(50000, totalIncome);
    const d80c = Math.min(deduction80C, 150000);
    const d80d = Math.min(deduction80D, 100000);
    const exempt = exemptions;
    
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
      { from: 0, to: 400000, rate: 0 },
      { from: 400000, to: 800000, rate: 0.05 },
      { from: 800000, to: 1200000, rate: 0.10 },
      { from: 1200000, to: 1600000, rate: 0.15 },
      { from: 1600000, to: 2000000, rate: 0.20 },
      { from: 2000000, to: Infinity, rate: 0.30 },
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
    
    // Rebate u/s 87A: if taxable income <= 12L, rebate up to 60,000
    if (taxableIncome <= 1200000) {
      tax = Math.max(0, tax - Math.min(60000, tax));
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

// Generate educational summary PDF (4-page structure)
const generateSummaryPDF = async (data, result, documentType) => {
  const { jsPDF } = await import('jspdf');
  const doc = new jsPDF();
  
  const today = new Date().toLocaleDateString('en-IN', { day: '2-digit', month: 'short', year: 'numeric' });
  const time = new Date().toLocaleTimeString('en-IN', { hour: '2-digit', minute: '2-digit' });
  
  // Helper function
  const addRow = (label, value, y, indent = 0) => {
    doc.text(label, 20 + indent, y);
    doc.text(formatINR(value), 170, y, { align: 'right' });
    return y + 7;
  };
  
  // ═══════════════════════════════════════════════════════════════
  // PAGE 1 — COVER
  // ═══════════════════════════════════════════════════════════════
  doc.setFillColor(26, 26, 26);
  doc.rect(0, 0, 210, 297, 'F');
  
  // Logo area
  doc.setTextColor(192, 160, 98);
  doc.setFontSize(36);
  doc.text('BM Wealth', 105, 100, { align: 'center' });
  
  doc.setTextColor(255, 255, 255);
  doc.setFontSize(24);
  doc.text('Income Tax Estimation Summary', 105, 130, { align: 'center' });
  
  doc.setFontSize(12);
  doc.setTextColor(180, 180, 180);
  doc.text(`Generated: ${today} at ${time}`, 105, 160, { align: 'center' });
  doc.text('BM Wealth Free ITR Estimation Tool', 105, 175, { align: 'center' });
  
  doc.setFontSize(10);
  doc.setTextColor(120, 120, 120);
  doc.text('Educational Estimate • Not for Official Filing', 105, 250, { align: 'center' });
  
  // ═══════════════════════════════════════════════════════════════
  // PAGE 2 — USER INPUT SUMMARY
  // ═══════════════════════════════════════════════════════════════
  doc.addPage();
  
  // Header
  doc.setFillColor(26, 26, 26);
  doc.rect(0, 0, 210, 35, 'F');
  doc.setTextColor(192, 160, 98);
  doc.setFontSize(18);
  doc.text('BM Wealth', 20, 22);
  doc.setTextColor(255, 255, 255);
  doc.setFontSize(10);
  doc.text('Income Tax Estimation Summary', 20, 30);
  
  let y = 50;
  
  // Document Type
  doc.setTextColor(0, 0, 0);
  doc.setFontSize(14);
  doc.text('Document Used', 20, y);
  y += 10;
  
  const docTypeLabels = {
    form16: 'Form 16 (Salary Certificate)',
    ais: 'Annual Information Statement (AIS)',
    bankInterest: 'Bank Interest Statement',
  };
  
  doc.setFontSize(11);
  doc.setTextColor(80, 80, 80);
  doc.text(docTypeLabels[documentType] || 'Not specified', 20, y);
  y += 15;
  
  // User Reviewed Values
  doc.setTextColor(0, 0, 0);
  doc.setFontSize(14);
  doc.text('User-Reviewed Values', 20, y);
  y += 10;
  
  doc.setFontSize(10);
  doc.setTextColor(60, 60, 60);
  doc.text('(Values confirmed by user before calculation)', 20, y);
  y += 12;
  
  // Income table
  doc.setFillColor(245, 245, 245);
  doc.rect(15, y - 5, 180, 8, 'F');
  doc.setTextColor(0, 0, 0);
  doc.setFontSize(10);
  doc.text('Income Sources', 20, y);
  y += 10;
  
  doc.setTextColor(60, 60, 60);
  if (data.grossSalary) y = addRow('Gross Salary', data.grossSalary, y, 5);
  if (data.interestIncome || data.totalInterest) y = addRow('Interest Income', data.interestIncome || data.totalInterest || 0, y, 5);
  if (data.dividendIncome) y = addRow('Dividend Income', data.dividendIncome, y, 5);
  if (data.otherIncome) y = addRow('Other Income', data.otherIncome, y, 5);
  
  y += 5;
  doc.setLineWidth(0.5);
  doc.setDrawColor(192, 160, 98);
  doc.line(20, y, 190, y);
  y += 8;
  
  doc.setTextColor(0, 0, 0);
  doc.setFontSize(11);
  y = addRow('Total Income', result.totalIncome, y);
  
  y += 10;
  
  // Deductions
  doc.setFillColor(245, 245, 245);
  doc.rect(15, y - 5, 180, 8, 'F');
  doc.setFontSize(10);
  doc.text('Deductions', 20, y);
  y += 10;
  
  doc.setTextColor(60, 60, 60);
  if (result.deductionsApplied.standardDeduction) y = addRow('Standard Deduction', result.deductionsApplied.standardDeduction, y, 5);
  if (result.regime === 'old') {
    if (result.deductionsApplied.section80C) y = addRow('Section 80C', result.deductionsApplied.section80C, y, 5);
    if (result.deductionsApplied.section80D) y = addRow('Section 80D', result.deductionsApplied.section80D, y, 5);
    if (result.deductionsApplied.exemptions) y = addRow('Exemptions (HRA, etc.)', result.deductionsApplied.exemptions, y, 5);
  }
  
  y += 5;
  doc.line(20, y, 190, y);
  y += 8;
  doc.setTextColor(0, 0, 0);
  doc.setFontSize(11);
  y = addRow('Total Deductions', result.deductionsApplied.total || 0, y);
  
  y += 10;
  
  // TDS
  doc.setFillColor(245, 245, 245);
  doc.rect(15, y - 5, 180, 8, 'F');
  doc.setFontSize(10);
  doc.text('TDS Already Paid', 20, y);
  y += 10;
  
  doc.setTextColor(60, 60, 60);
  if (data.tdsDeducted) y = addRow('TDS on Salary', data.tdsDeducted, y, 5);
  if (data.tdsOnInterest) y = addRow('TDS on Interest', data.tdsOnInterest, y, 5);
  if (data.tdsEntries) y = addRow('TDS from AIS', data.tdsEntries, y, 5);
  
  y += 5;
  doc.line(20, y, 190, y);
  y += 8;
  doc.setTextColor(0, 0, 0);
  doc.setFontSize(11);
  y = addRow('Total TDS', result.tdsAlreadyPaid, y);
  
  // ═══════════════════════════════════════════════════════════════
  // PAGE 3 — TAX ESTIMATION
  // ═══════════════════════════════════════════════════════════════
  doc.addPage();
  
  // Header
  doc.setFillColor(26, 26, 26);
  doc.rect(0, 0, 210, 35, 'F');
  doc.setTextColor(192, 160, 98);
  doc.setFontSize(18);
  doc.text('BM Wealth', 20, 22);
  doc.setTextColor(255, 255, 255);
  doc.setFontSize(10);
  doc.text('Tax Estimation', 20, 30);
  
  y = 50;
  
  // Regime info
  doc.setTextColor(0, 0, 0);
  doc.setFontSize(14);
  doc.text(`Tax Calculation (${result.regime === 'new' ? 'New' : 'Old'} Regime - FY 2025-26)`, 20, y);
  y += 15;
  
  // Summary boxes
  doc.setFillColor(248, 248, 248);
  doc.roundedRect(15, y, 85, 35, 3, 3, 'F');
  doc.roundedRect(110, y, 85, 35, 3, 3, 'F');
  
  doc.setFontSize(9);
  doc.setTextColor(100, 100, 100);
  doc.text('Taxable Income', 57.5, y + 12, { align: 'center' });
  doc.text('Estimated Tax', 152.5, y + 12, { align: 'center' });
  
  doc.setFontSize(14);
  doc.setTextColor(0, 0, 0);
  doc.text(formatINR(result.taxableIncome), 57.5, y + 26, { align: 'center' });
  doc.text(formatINR(result.totalTax), 152.5, y + 26, { align: 'center' });
  
  y += 50;
  
  // Calculation breakdown
  doc.setFontSize(12);
  doc.text('Calculation Breakdown', 20, y);
  y += 12;
  
  doc.setFontSize(10);
  doc.setTextColor(60, 60, 60);
  y = addRow('Total Income', result.totalIncome, y);
  y = addRow('Less: Deductions', result.deductionsApplied.total || 0, y);
  
  doc.setDrawColor(200, 200, 200);
  doc.line(20, y, 190, y);
  y += 8;
  doc.setTextColor(0, 0, 0);
  y = addRow('Taxable Income', result.taxableIncome, y);
  y += 5;
  
  doc.setTextColor(60, 60, 60);
  y = addRow('Tax on Slabs', result.taxBeforeCess, y);
  if (result.surcharge > 0) y = addRow('Surcharge', result.surcharge, y);
  y = addRow('Health & Education Cess (4%)', result.cess, y);
  
  doc.line(20, y, 190, y);
  y += 8;
  doc.setTextColor(0, 0, 0);
  doc.setFontSize(11);
  y = addRow('Total Estimated Tax', result.totalTax, y);
  y += 5;
  
  doc.setFontSize(10);
  doc.setTextColor(34, 139, 34);
  y = addRow('Less: TDS Already Paid', result.tdsAlreadyPaid, y);
  
  y += 5;
  doc.setLineWidth(1);
  doc.setDrawColor(192, 160, 98);
  doc.line(20, y, 190, y);
  y += 10;
  
  // Final result
  if (result.refundDue > 0) {
    doc.setFillColor(232, 245, 233);
    doc.roundedRect(15, y, 180, 25, 3, 3, 'F');
    doc.setTextColor(34, 139, 34);
    doc.setFontSize(12);
    doc.text('ESTIMATED REFUND', 25, y + 10);
    doc.setFontSize(16);
    doc.text(formatINR(result.refundDue), 180, y + 16, { align: 'right' });
  } else {
    doc.setFillColor(255, 248, 225);
    doc.roundedRect(15, y, 180, 25, 3, 3, 'F');
    doc.setTextColor(192, 160, 98);
    doc.setFontSize(12);
    doc.text('ESTIMATED TAX PAYABLE', 25, y + 10);
    doc.setFontSize(16);
    doc.text(formatINR(result.taxDue), 180, y + 16, { align: 'right' });
  }
  
  y += 40;
  
  // Indicative notice
  doc.setFillColor(240, 240, 240);
  doc.roundedRect(15, y, 180, 20, 3, 3, 'F');
  doc.setTextColor(100, 100, 100);
  doc.setFontSize(9);
  doc.text('This is an indicative estimate only. Actual tax may vary.', 105, y + 12, { align: 'center' });
  
  // ═══════════════════════════════════════════════════════════════
  // PAGE 4 — DISCLAIMERS
  // ═══════════════════════════════════════════════════════════════
  doc.addPage();
  
  // Header
  doc.setFillColor(26, 26, 26);
  doc.rect(0, 0, 210, 35, 'F');
  doc.setTextColor(192, 160, 98);
  doc.setFontSize(18);
  doc.text('BM Wealth', 20, 22);
  doc.setTextColor(255, 255, 255);
  doc.setFontSize(10);
  doc.text('Important Information', 20, 30);
  
  y = 55;
  
  doc.setTextColor(0, 0, 0);
  doc.setFontSize(14);
  doc.text('Disclaimer', 20, y);
  y += 15;
  
  doc.setFontSize(10);
  doc.setTextColor(60, 60, 60);
  
  const disclaimerText = [
    'This document is an educational estimate generated using OCR and user-reviewed inputs.',
    '',
    'It does not constitute tax advice, filing, or official computation.',
    '',
    'BM Wealth is not a Chartered Accountant firm and does not file returns.',
    '',
    'Please consult a qualified professional before submission.',
    '',
    'The accuracy of extracted values depends on document quality. Users must review',
    'and verify all figures. BM Wealth is not responsible for any errors or omissions.',
  ];
  
  disclaimerText.forEach(line => {
    doc.text(line, 20, y);
    y += 6;
  });
  
  y += 20;
  
  // Contact
  doc.setTextColor(0, 0, 0);
  doc.setFontSize(12);
  doc.text('Contact BM Wealth', 20, y);
  y += 12;
  
  doc.setFontSize(10);
  doc.setTextColor(60, 60, 60);
  doc.text('Website: www.bmwealth.in', 20, y);
  y += 7;
  doc.text('Email: info@bmwealth.in', 20, y);
  
  // Footer
  doc.setFillColor(26, 26, 26);
  doc.rect(0, 260, 210, 37, 'F');
  
  doc.setTextColor(192, 160, 98);
  doc.setFontSize(10);
  doc.text('BM Wealth', 105, 272, { align: 'center' });
  
  doc.setTextColor(150, 150, 150);
  doc.setFontSize(8);
  doc.text('PMS Certification 2430447816 | ARN 90008 | IRDAI 277925', 105, 280, { align: 'center' });
  doc.text('www.bmwealth.in', 105, 287, { align: 'center' });
  
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
  const [regime, setRegime] = useState('new');
  const [result, setResult] = useState(null);
  const [error, setError] = useState(null);
  const [processing, setProcessing] = useState(false);
  const [ocrProgress, setOcrProgress] = useState(0);
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
  }, []);
  
  // Process PDF with OCR
  const processDocument = useCallback(async () => {
    if (!file) return;
    
    setStep(STEPS.PROCESSING);
    setProcessing(true);
    setOcrProgress(0);
    setError(null);
    
    try {
      // Dynamic import of PDF.js
      const pdfjsLib = await import('pdfjs-dist');
      pdfjsLib.GlobalWorkerOptions.workerSrc = `//cdnjs.cloudflare.com/ajax/libs/pdf.js/${pdfjsLib.version}/pdf.worker.min.js`;
      
      // Dynamic import of Tesseract.js
      const Tesseract = (await import('tesseract.js')).default;
      
      // Read PDF file
      const arrayBuffer = await file.arrayBuffer();
      const pdf = await pdfjsLib.getDocument({ data: arrayBuffer }).promise;
      
      let fullText = '';
      const totalPages = pdf.numPages;
      
      // Process each page
      for (let pageNum = 1; pageNum <= Math.min(totalPages, 5); pageNum++) { // Limit to 5 pages
        const page = await pdf.getPage(pageNum);
        
        // Try to extract text directly first (for text-based PDFs)
        const textContent = await page.getTextContent();
        const pageText = textContent.items.map(item => item.str).join(' ');
        
        if (pageText.trim().length > 100) {
          // PDF has extractable text
          fullText += pageText + '\n';
        } else {
          // PDF is image-based, use OCR
          const scale = 2.0;
          const viewport = page.getViewport({ scale });
          
          const canvas = document.createElement('canvas');
          const context = canvas.getContext('2d');
          canvas.height = viewport.height;
          canvas.width = viewport.width;
          
          await page.render({
            canvasContext: context,
            viewport: viewport,
          }).promise;
          
          const imageData = canvas.toDataURL('image/png');
          
          // OCR with Tesseract
          const { data } = await Tesseract.recognize(imageData, 'eng', {
            logger: (m) => {
              if (m.status === 'recognizing text') {
                const pageProgress = ((pageNum - 1) / totalPages + m.progress / totalPages) * 100;
                setOcrProgress(Math.round(pageProgress));
              }
            },
          });
          
          fullText += data.text + '\n';
        }
        
        setOcrProgress(Math.round((pageNum / totalPages) * 100));
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
      setStep(STEPS.REVIEW);
      
    } catch (err) {
      console.error('Processing error:', err);
      setError(`Error processing document: ${err.message}. Please try a different file.`);
      setStep(STEPS.UPLOAD);
    } finally {
      setProcessing(false);
    }
  }, [file]);
  
  // Handle field edit
  const handleFieldChange = useCallback((field, value) => {
    const numValue = value === '' ? 0 : parseInt(value.replace(/,/g, ''), 10) || 0;
    setEditableData(prev => ({ ...prev, [field]: numValue }));
  }, []);
  
  // Calculate tax estimate
  const handleCalculate = useCallback(() => {
    const taxResult = calculateTax(editableData, regime);
    setResult(taxResult);
    setStep(STEPS.RESULT);
  }, [editableData, regime]);
  
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
    setResult(null);
    setError(null);
    setOcrProgress(0);
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
              <label className="block">
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
              </label>
              
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
                Extracting text using OCR (Tesseract.js - Free & Local)
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
              <button
                onClick={handleReset}
                className="text-xs text-white/50 hover:text-white/70 underline"
              >
                Upload different document
              </button>
            </div>
            
            {/* Review Notice */}
            <div className="p-3 rounded-lg border border-white/10 bg-white/5">
              <p className="text-xs text-white/60">
                <Info className="w-3 h-3 inline mr-1" />
                OCR extraction may vary in accuracy. Review and edit values as needed.
              </p>
            </div>
            
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
                    />
                    <EditableField
                      label="Exemptions (HRA, etc.)"
                      value={editableData.exemptions}
                      onChange={(v) => handleFieldChange('exemptions', v)}
                      extracted={extractedData.exemptions}
                    />
                    <EditableField
                      label="Deduction 80C"
                      value={editableData.deduction80C}
                      onChange={(v) => handleFieldChange('deduction80C', v)}
                      extracted={extractedData.deduction80C}
                      max={150000}
                    />
                    <EditableField
                      label="Deduction 80D"
                      value={editableData.deduction80D}
                      onChange={(v) => handleFieldChange('deduction80D', v)}
                      extracted={extractedData.deduction80D}
                      max={100000}
                    />
                    <EditableField
                      label="TDS Deducted"
                      value={editableData.tdsDeducted}
                      onChange={(v) => handleFieldChange('tdsDeducted', v)}
                      extracted={extractedData.tdsDeducted}
                    />
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
                    />
                    <EditableField
                      label="Dividend Income"
                      value={editableData.dividendIncome}
                      onChange={(v) => handleFieldChange('dividendIncome', v)}
                      extracted={extractedData.dividendIncome}
                    />
                    <EditableField
                      label="Capital Gains (Display Only)"
                      value={editableData.capitalGains}
                      onChange={(v) => handleFieldChange('capitalGains', v)}
                      extracted={extractedData.capitalGains}
                      hint="Not included in basic calculation"
                    />
                    <EditableField
                      label="TDS Entries"
                      value={editableData.tdsEntries}
                      onChange={(v) => handleFieldChange('tdsEntries', v)}
                      extracted={extractedData.tdsEntries}
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
                    />
                    <EditableField
                      label="TDS on Interest"
                      value={editableData.tdsOnInterest}
                      onChange={(v) => handleFieldChange('tdsOnInterest', v)}
                      extracted={extractedData.tdsOnInterest}
                    />
                  </>
                )}
                
                {/* Common additional fields for tax calculation */}
                {documentType !== 'form16' && (
                  <>
                    <EditableField
                      label="Gross Salary (if any)"
                      value={editableData.grossSalary || 0}
                      onChange={(v) => handleFieldChange('grossSalary', v)}
                      hint="Add if you have salary income"
                    />
                    <EditableField
                      label="Deduction 80C (if any)"
                      value={editableData.deduction80C || 0}
                      onChange={(v) => handleFieldChange('deduction80C', v)}
                      max={150000}
                      hint="For Old Regime only"
                    />
                  </>
                )}
              </div>
              
              {/* Map bank interest to interestIncome for calculation */}
              {documentType === 'bankInterest' && editableData.totalInterest > 0 && (
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
            
            {/* Calculate Button */}
            <button
              onClick={() => {
                // Map totalInterest to interestIncome for calculation
                if (documentType === 'bankInterest' && editableData.totalInterest) {
                  setEditableData(prev => ({
                    ...prev,
                    interestIncome: (prev.interestIncome || 0) + (prev.totalInterest || 0),
                  }));
                }
                handleCalculate();
              }}
              className="w-full py-4 rounded-xl font-semibold text-white calculator-premium-cta flex items-center justify-center gap-2"
            >
              <Calculator className="w-5 h-5" />
              Calculate Estimated Tax
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
            
            {/* Disclaimer - Subtle footer style */}
            <div className="p-4 rounded-xl border border-white/10 bg-white/5">
              <p className="text-xs text-white/50 leading-relaxed">
                This tool provides an educational estimate only. Extracted values may be inaccurate due to document quality. 
                Please review all figures before use. BM Wealth does not file returns and is not responsible for submissions. 
                For accurate tax filing, consult a qualified Chartered Accountant or use the official Income Tax portal.
              </p>
            </div>
          </div>
        )}
      </div>
    </div>
  );
}

// Editable Field Component
function EditableField({ label, value, onChange, extracted, max, hint }) {
  const [isFocused, setIsFocused] = useState(false);
  const wasEdited = value !== extracted && extracted !== undefined;
  
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
          value={isFocused ? value : (value || 0).toLocaleString('en-IN')}
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
      {extracted !== undefined && extracted > 0 && (
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
