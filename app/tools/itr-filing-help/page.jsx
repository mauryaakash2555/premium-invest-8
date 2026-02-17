'use client';
import { useMemo, useState, useEffect, useRef } from 'react';
import Link from 'next/link';
import { getMetadataBase, SITE_NAME } from '@/lib/seo/metadata';
import { ArrowRight } from 'lucide-react';

/**
 * ⛔⛔⛔ BANNED COLORS - DO NOT USE ⛔⛔⛔
 * 
 * NEVER use these Tailwind classes in this file:
 * ❌ bg-green-*, text-green-*, border-green-*
 * ❌ bg-yellow-*, text-yellow-*, border-yellow-*
 * ❌ bg-amber-*, text-amber-*, border-amber-*
 * ❌ bg-red-*, text-red-*, border-red-*
 * 
 * ONLY use the LUX CSS variables defined below.
 * See BANNED_COLORS.md for full details.
 * 
 * The project owner HATES muddy yellow/brown/green colors.
 */

const LUX = {
  background: 'oklch(0.06 0.005 280)',
  foreground: 'oklch(0.95 0.01 85)',
  card: 'oklch(0.10 0.005 280)',
  muted: 'oklch(0.55 0.01 85)',
  accent: 'oklch(0.78 0.08 65)',
};

const LOADING_STAGES = [
  { id: 'upload', label: 'Uploading PDF...', icon: '📤', duration: 1500 },
  { id: 'extract', label: 'Extracting data...', icon: '📄', duration: 8000 },
  { id: 'validate', label: 'Validating with AI...', icon: '✓', duration: 1500 },
];

export default function ITRFilingHelp() {
  const [step, setStep] = useState('upload');
  const [hydrated, setHydrated] = useState(false);
  const [extractedData, setExtractedData] = useState(null);
  const [fields, setFields] = useState({});
  const [taxResult, setTaxResult] = useState(null);
  const [itrDetails, setItrDetails] = useState({
    employeePAN: '',
    employerName: '',
    employerTAN: '',
    assessmentYear: '',
    hraExemption: 0,
    regime: '',
  });
  const [copiedKey, setCopiedKey] = useState('');
  const [loadingStage, setLoadingStage] = useState(0);
  const [loadingProgress, setLoadingProgress] = useState(0);
  const [pdfBase64, setPdfBase64] = useState(null);
  const [previewMimeType, setPreviewMimeType] = useState('application/pdf');
  const [pdfTooLarge, setPdfTooLarge] = useState(false);
  const [verified, setVerified] = useState({
    grossSalary: false,
    tds: false,
    standardDeduction: false,
    deductions80C: false,
  });

  const uploadRunIdRef = useRef(0);
  const uploadAbortRef = useRef(null);
  const [fileInputKey, setFileInputKey] = useState(0);

  const allVerified = Object.values(verified).every(v => v);

  useEffect(() => {
    if (!copiedKey) return;
    const t = setTimeout(() => setCopiedKey(''), 1200);
    return () => clearTimeout(t);
  }, [copiedKey]);

  // NOTE: Do not auto-advance away from the comparison step.
  // The tool may redirect to the store for payment, and we need
  // the user to explicitly proceed (and keep state stable).

  async function copyToClipboard(text, key) {
    const value = String(text ?? '').trim();
    if (!value) return;

    try {
      if (navigator?.clipboard?.writeText) {
        await navigator.clipboard.writeText(value);
        setCopiedKey(key);
        return;
      }
    } catch (e) {
      // fallback below
    }

    try {
      const el = document.createElement('textarea');
      el.value = value;
      el.setAttribute('readonly', '');
      el.style.position = 'absolute';
      el.style.left = '-9999px';
      document.body.appendChild(el);
      el.select();
      document.execCommand('copy');
      document.body.removeChild(el);
      setCopiedKey(key);
    } catch (e) {
      // ignore
    }
  }

  // E2E stability: provides a deterministic signal that client hydration completed.
  useEffect(() => {
    setHydrated(true);
  }, []);

  // Restore state after successful store payment.
  useEffect(() => {
    if (!hydrated) return;
    if (typeof window === 'undefined') return;

    const params = new URLSearchParams(window.location.search || '');
    if (params.get('payment') !== 'success') return;

    // Fix 2 — Restore from localStorage (store return)
    try {
      const saved = window.localStorage.getItem('itr_data');
      if (saved) {
        const d = JSON.parse(saved);
        setFields({
          grossSalary: d.grossSalary,
          tds: d.tds,
          standardDeduction: d.standardDeduction,
          deductions80C: d.deductions80C,
        });
        setItrDetails({
          employeePAN: d.employeePAN,
          employerName: d.employerName,
          employerTAN: d.employerTAN,
          assessmentYear: d.assessmentYear,
          hraExemption: d.hraExemption,
          regime: d.regime,
        });
        setStep('payment_success');
        window.localStorage.removeItem('itr_data');
        return;
      }
    } catch (e) {
      // ignore and fall back to legacy sessionStorage
    }

    try {
      const raw = window.sessionStorage.getItem('itr_data');
      if (!raw) return;
      const parsed = JSON.parse(raw);

      if (parsed?.fields) setFields(parsed.fields);
      if (parsed?.itrDetails) setItrDetails(parsed.itrDetails);
      if (parsed?.taxResult) setTaxResult(parsed.taxResult);
      if (parsed?.verified) setVerified(parsed.verified);

      setStep('details');

      // Let React commit restored state before opening print.
      setTimeout(() => {
        try {
          downloadSummaryPdf({
            fields: parsed?.fields,
            itrDetails: parsed?.itrDetails,
            taxResult: parsed?.taxResult,
          });
        } finally {
          window.sessionStorage.removeItem('itr_data');
        }
      }, 350);
    } catch (e) {
      console.warn('[ITR] Failed to restore itr_data from sessionStorage:', e);
    }
  }, [hydrated]);

  // Fix 3 — payment_success step UI (minimal, no restructure)
  if (step === 'payment_success')
    return (
      <div style={{ textAlign: 'center', padding: '60px 20px' }}>
        <div style={{ fontSize: '48px' }}>✓</div>
        <h2>Payment Successful</h2>
        <p>Your ITR Summary is ready</p>
        <button onClick={() => window.print()}>Download PDF</button>
      </div>
    );

  const baseUrl = getMetadataBase().origin;
  const pageUrl = `${baseUrl}/tools/itr-filing-help`;
  const toolSchema = {
    '@context': 'https://schema.org',
    '@type': 'SoftwareApplication',
    name: 'ITR Filing Help Tool',
    applicationCategory: 'BusinessApplication',
    operatingSystem: 'Web',
    url: pageUrl,
    publisher: {
      '@type': 'Organization',
      name: SITE_NAME,
      url: baseUrl,
    },
    offers: {
      '@type': 'Offer',
      price: '0',
      priceCurrency: 'INR',
      availability: 'https://schema.org/InStock',
    },
  };

  const themeStyle = useMemo(
    () =>
      /** @type {React.CSSProperties} */ ({
        '--lux-background': LUX.background,
        '--lux-foreground': LUX.foreground,
        '--lux-foreground-80': 'oklch(0.95 0.01 85 / 0.80)',
        '--lux-foreground-60': 'oklch(0.95 0.01 85 / 0.60)',
        '--lux-foreground-40': 'oklch(0.95 0.01 85 / 0.40)',
        '--lux-foreground-10': 'oklch(0.95 0.01 85 / 0.10)',
        '--lux-foreground-05': 'oklch(0.95 0.01 85 / 0.05)',
        '--lux-card': LUX.card,
        '--lux-muted': LUX.muted,
        '--lux-accent': LUX.accent,
      }),
    []
  );

  // Animate loading stages
  useEffect(() => {
    if (step !== 'extracting') return;
    
    let stageIndex = 0;
    let progress = 0;
    
    const runStages = () => {
      if (stageIndex >= LOADING_STAGES.length) return;
      
      setLoadingStage(stageIndex);
      const stage = LOADING_STAGES[stageIndex];
      const startProgress = (stageIndex / LOADING_STAGES.length) * 100;
      const endProgress = ((stageIndex + 1) / LOADING_STAGES.length) * 100;
      
      // Animate progress within this stage
      const steps = 20;
      const stepDuration = stage.duration / steps;
      let stepCount = 0;
      
      const interval = setInterval(() => {
        stepCount++;
        const p = startProgress + ((endProgress - startProgress) * (stepCount / steps));
        setLoadingProgress(p);
        
        if (stepCount >= steps) {
          clearInterval(interval);
          stageIndex++;
          if (stageIndex < LOADING_STAGES.length) {
            setTimeout(runStages, 200);
          }
        }
      }, stepDuration);
    };
    
    runStages();
  }, [step]);

  function handleBack() {
    if (step === 'payment') {
      // Go back to verification (no navigation away; keep extracted values)
      setStep('review');
      setTaxResult(null);
      return;
    }

    if (step === 'details') {
      setStep('payment');
      return;
    }

    if (step === 'complete') {
      setStep('payment');
      return;
    }

    // For upload/extracting/review (and any unknown state), reset to the start.
    try {
      uploadAbortRef.current?.abort?.();
    } catch (e) {
      // ignore
    }
    uploadAbortRef.current = null;
    uploadRunIdRef.current += 1;

    if (typeof window !== 'undefined') {
      try {
        const url = new URL(window.location.href);
        if (url.searchParams.has('payment')) {
          url.searchParams.delete('payment');
          const next = `${url.pathname}${url.searchParams.toString() ? `?${url.searchParams.toString()}` : ''}${url.hash || ''}`;
          window.history.replaceState({}, '', next);
        }
      } catch (e) {
        // ignore
      }
    }

    setStep('upload');
    setExtractedData(null);
    setFields({});
    setTaxResult(null);
    setItrDetails({ employeePAN: '', employerName: '', employerTAN: '', assessmentYear: '', hraExemption: 0, regime: '' });
    setPdfBase64(null);
    setPreviewMimeType('application/pdf');
    setPdfTooLarge(false);
    setVerified({ grossSalary: false, tds: false, standardDeduction: false, deductions80C: false });
    setCopiedKey('');
    setFileInputKey((k) => k + 1);
  }

  function downloadSummaryPdf(override) {
    const usedTaxResult = override?.taxResult ?? taxResult;
    const usedFields = override?.fields ?? fields;
    const usedItrDetails = override?.itrDetails ?? itrDetails;
    if (!usedTaxResult) return;

    const escapeHtml = (value) => {
      return String(value ?? '')
        .replace(/&/g, '&amp;')
        .replace(/</g, '&lt;')
        .replace(/>/g, '&gt;')
        .replace(/"/g, '&quot;')
        .replace(/'/g, '&#039;');
    };

    const fmtMoney = (n) => `₹${Math.round(Number(n || 0)).toLocaleString('en-IN')}`;
    const now = new Date();
    const generatedOn = now.toLocaleString('en-IN');

    const recommended = usedTaxResult.recommended === 'old' ? 'Old Regime' : 'New Regime';
    const selectedTax = usedTaxResult.recommended === 'old' ? (usedTaxResult.oldRegime?.tax || 0) : (usedTaxResult.newRegime?.tax || 0);
    const tds = Number(usedFields?.tds || 0);
    const diff = Math.round(selectedTax - tds);
    const taxPayableOrRefundText = diff > 0 ? `${fmtMoney(diff)} (Tax Payable)` : diff < 0 ? `${fmtMoney(Math.abs(diff))} (Refund Due)` : `${fmtMoney(0)} (Nil)`;

    const resolvedNetTaxableIncome =
      usedTaxResult.recommended === 'old'
        ? (usedTaxResult.oldRegime?.taxable || 0)
        : (usedTaxResult.newRegime?.taxable || 0);

    const details = [
      ['Employee PAN', usedItrDetails.employeePAN || '—'],
      ['Employer Name', usedItrDetails.employerName || '—'],
      ['Employer TAN', usedItrDetails.employerTAN || '—'],
      ['Assessment Year', usedItrDetails.assessmentYear || '—'],
      ['Gross Salary', fmtMoney(usedFields?.grossSalary || 0)],
      ['HRA Exemption', fmtMoney(usedItrDetails.hraExemption || 0)],
      ['Standard Deduction', fmtMoney(usedFields?.standardDeduction || 0)],
      ['80C Deductions', fmtMoney(usedFields?.deductions80C || 0)],
      ['Net Taxable Income', fmtMoney(resolvedNetTaxableIncome)],
      ['TDS Already Deducted', fmtMoney(usedFields?.tds || 0)],
      ['Tax Payable / Refund Due', taxPayableOrRefundText],
      ['Recommended Regime', recommended],
    ];

    const html = `<!doctype html>
<html>
  <head>
    <meta charset="utf-8" />
    <meta name="viewport" content="width=device-width, initial-scale=1" />
    <title>ITR Summary</title>
    <style>
      :root {
        --lux-background: oklch(0.06 0.005 280);
        --lux-foreground: oklch(0.95 0.01 85);
        --lux-foreground-80: oklch(0.95 0.01 85 / 0.80);
        --lux-foreground-60: oklch(0.95 0.01 85 / 0.60);
        --lux-foreground-40: oklch(0.95 0.01 85 / 0.40);
        --lux-foreground-10: oklch(0.95 0.01 85 / 0.10);
        --lux-foreground-05: oklch(0.95 0.01 85 / 0.05);
        --lux-card: oklch(0.10 0.005 280);
        --lux-accent: oklch(0.78 0.08 65);
      }
      body {
        margin: 0;
        padding: 28px;
        font-family: system-ui, -apple-system, Segoe UI, Roboto, Arial, sans-serif;
        background: var(--lux-background);
        color: var(--lux-foreground);
      }
      h1 { margin: 0 0 6px; font-size: 22px; }
      .sub { color: var(--lux-foreground-60); font-size: 12px; margin-bottom: 18px; }
      .card {
        border: 1px solid var(--lux-foreground-10);
        background: color-mix(in oklab, var(--lux-card) 70%, transparent);
        border-radius: 10px;
        padding: 14px;
        margin-bottom: 14px;
      }
      .grid { width: 100%; border-collapse: collapse; }
      .grid td { padding: 8px 10px; border-top: 1px solid var(--lux-foreground-10); vertical-align: top; }
      .grid tr:first-child td { border-top: none; }
      .k { color: var(--lux-foreground-60); width: 45%; font-size: 12px; }
      .v { color: var(--lux-foreground); font-weight: 700; font-size: 12px; }
      .gold { color: var(--lux-accent); font-weight: 800; }
      .two { display: grid; grid-template-columns: 1fr 1fr; gap: 12px; }
      .tag {
        display: inline-block;
        padding: 6px 10px;
        border-radius: 999px;
        background: var(--lux-foreground-05);
        border: 1px solid var(--lux-foreground-10);
        font-size: 12px;
        color: var(--lux-foreground-80);
      }
      .big { font-size: 18px; font-weight: 900; }
      @media print {
        body { padding: 0; -webkit-print-color-adjust: exact; print-color-adjust: exact; }
        .card { break-inside: avoid; }
      }
    </style>
  </head>
  <body>
    <h1>ITR Summary (Draft)</h1>
    <div class="sub">Generated on ${escapeHtml(generatedOn)} • Tool: ${escapeHtml(pageUrl)}</div>

    <div class="card">
      <div style="display:flex; align-items:center; justify-content:space-between; gap: 12px;">
        <div style="font-weight:800;">Your ITR Details</div>
        <div class="tag">Recommended: <span class="gold">${escapeHtml(recommended)}</span></div>
      </div>
      <table class="grid" style="margin-top: 10px;">
        ${details
          .map(([k, v]) => `<tr><td class="k">${escapeHtml(k)}</td><td class="v">${escapeHtml(v)}</td></tr>`)
          .join('')}
      </table>
    </div>

    <div class="card">
      <div style="font-weight:800; margin-bottom:10px;">Regime Comparison</div>
      <div class="two">
        <div class="card" style="margin:0;">
          <div style="font-weight:900;">Old Tax Regime</div>
          <div style="margin-top:8px; font-size:12px;">Taxable Income: <span class="gold">${escapeHtml(fmtMoney(usedTaxResult.oldRegime?.taxable || 0))}</span></div>
          <div style="margin-top:6px; font-size:12px;">Tax Payable (incl. cess): <span class="gold">${escapeHtml(fmtMoney(usedTaxResult.oldRegime?.tax || 0))}</span></div>
        </div>
        <div class="card" style="margin:0;">
          <div style="font-weight:900;">New Tax Regime</div>
          <div style="margin-top:8px; font-size:12px;">Taxable Income: <span class="gold">${escapeHtml(fmtMoney(usedTaxResult.newRegime?.taxable || 0))}</span></div>
          <div style="margin-top:6px; font-size:12px;">Tax Payable (incl. cess): <span class="gold">${escapeHtml(fmtMoney(usedTaxResult.newRegime?.tax || 0))}</span></div>
        </div>
      </div>
      <div style="margin-top: 12px; border-top: 1px solid var(--lux-foreground-10); padding-top: 12px; display:flex; justify-content:space-between; align-items:center;">
        <div style="font-size:12px; color:var(--lux-foreground-60);">Potential savings by choosing ${escapeHtml(recommended)}</div>
        <div class="big">${escapeHtml(fmtMoney(usedTaxResult.savings || 0))}</div>
      </div>
    </div>

    <script>
      // Auto-open print dialog
      setTimeout(() => { window.print(); }, 400);
    </script>
  </body>
</html>`;

    const w = window.open('', '_blank', 'noopener,noreferrer');
    if (!w) return;
    w.document.open();
    w.document.write(html);
    w.document.close();
  }

  function goToStoreForFullSummary() {
    if (typeof window === 'undefined') return;
    if (!taxResult) return;

    try {
      const payload = {
        fields,
        itrDetails,
        taxResult,
        verified,
      };
      window.sessionStorage.setItem('itr_data', JSON.stringify(payload));
    } catch (e) {
      console.warn('[ITR] Failed to save itr_data to sessionStorage:', e);
    }

    const returnTo = `${window.location.origin}/tools/itr-filing-help?payment=success`;

    // NOTE: Repo catalog confirms this is an existing ₹299 product.
    // If a dedicated ITR product is added later, update this slug.
    const storeUrl = `https://store.bmwealth.co.in/products/tax-optimization-pdf?returnTo=${encodeURIComponent(returnTo)}`;
    window.location.href = storeUrl;
  }

  async function handleUpload(file) {
    const runId = (uploadRunIdRef.current += 1);
    try {
      uploadAbortRef.current?.abort?.();
    } catch (e) {
      // ignore
    }
    const controller = new AbortController();
    uploadAbortRef.current = controller;

    console.log('[ITR] handleUpload called with file:', file?.name, file?.type, file?.size);
    setStep('extracting');
    setLoadingStage(0);
    setLoadingProgress(0);

    // Always attempt a local preview first (keeps the viewer working even if API doesn't return preview data).
    try {
      const mime = file?.type || 'application/pdf';
      setPreviewMimeType(mime);

      const PREVIEW_LIMIT_BYTES = 1_200_000;
      const tooLarge = Number(file?.size || 0) > PREVIEW_LIMIT_BYTES;
      setPdfTooLarge(tooLarge);

      if (!tooLarge && mime === 'application/pdf') {
        const base64 = await new Promise((resolve, reject) => {
          const reader = new FileReader();
          reader.onload = () => {
            const result = String(reader.result || '');
            const commaIdx = result.indexOf(',');
            resolve(commaIdx >= 0 ? result.slice(commaIdx + 1) : '');
          };
          reader.onerror = () => reject(new Error('Failed to read file for preview'));
          reader.readAsDataURL(file);
        });

        if (runId !== uploadRunIdRef.current) return;
        setPdfBase64(base64 || null);
      } else {
        if (runId !== uploadRunIdRef.current) return;
        setPdfBase64(null);
      }
    } catch (e) {
      console.warn('[ITR] Preview generation failed:', e);
      if (runId !== uploadRunIdRef.current) return;
      setPdfBase64(null);
      setPdfTooLarge(false);
      setPreviewMimeType(file?.type || 'application/pdf');
    }

    const formData = new FormData();
    formData.append('file', file);

    try {
      console.log('[ITR] Fetching /api/itr/extract-v2...');
      const res = await fetch('/api/itr/extract-v2', {
        method: 'POST',
        body: formData,
        signal: controller.signal,
      });
      console.log('[ITR] Response status:', res.status);

      // Get raw text first to debug
      const text = await res.text();
      if (runId !== uploadRunIdRef.current) return;
      let data;
      try {
        data = JSON.parse(text);
      } catch (e) {
        console.error('Response was not JSON:', text.substring(0, 500));
        // Swiss-bank reliability: if the API returns non-JSON (proxy error, HTML, etc),
        // fall back to manual review rather than blocking the user.
        const safeFields = { grossSalary: 0, tds: 0, standardDeduction: 50000, deductions80C: 0 };
        setExtractedData({
          success: true,
          confidence: 0,
          method: 'manual',
          extractedCount: '0/4',
          message: 'Could not read the server response. Please enter values from your Form 16 below.',
        });
        setFields(safeFields);
        setItrDetails({ employeePAN: '', employerName: '', employerTAN: '', assessmentYear: '', hraExemption: 0, regime: '' });
        setPdfTooLarge(false);
        setPreviewMimeType(file?.type || 'application/pdf');
        setPdfBase64(null);
        setVerified({ grossSalary: false, tds: false, standardDeduction: false, deductions80C: false });
        setStep('review');
        return;
      }

      // Swiss-bank reliability: never block the user on extraction quality.
      const isScanned = Boolean(data?.isScanned);
      const safeFields = isScanned
        ? { grossSalary: 0, tds: 0, standardDeduction: 0, deductions80C: 0 }
        : (data?.fields || { grossSalary: 0, tds: 0, standardDeduction: 50000, deductions80C: 0 });
      setExtractedData({
        success: data?.success !== false,
        confidence: typeof data?.confidence === 'number' ? data.confidence : 0,
        method: data?.method || (isScanned ? 'manual' : 'digital_pdf'),
        isScanned,
        extractedCount: data?.extractedCount,
        message: data?.message || 'Please verify and edit the values below.',
      });
      setFields(safeFields);
      setItrDetails({
        employeePAN: data?.employeePAN || '',
        employerName: data?.employerName || '',
        employerTAN: data?.employerTAN || '',
        assessmentYear: data?.assessmentYear || '',
        hraExemption: typeof data?.hraExemption === 'number' ? data.hraExemption : (parseFloat(String(data?.hraExemption || 0)) || 0),
        regime: data?.regime || '',
      });
      setVerified({ grossSalary: false, tds: false, standardDeduction: false, deductions80C: false });
      setStep('review');
    } catch (err) {
      if (runId !== uploadRunIdRef.current) return;
      if (controller?.signal?.aborted || err?.name === 'AbortError') return;
      console.error('[ITR] Upload/extract failed:', err);
      const safeFields = { grossSalary: 0, tds: 0, standardDeduction: 50000, deductions80C: 0 };
      setExtractedData({
        success: true,
        confidence: 0,
        method: 'manual',
        extractedCount: '0/4',
        message: 'Could not process the document right now. Please enter values from your Form 16 below.',
      });
      setFields(safeFields);
      setItrDetails({ employeePAN: '', employerName: '', employerTAN: '', assessmentYear: '', hraExemption: 0, regime: '' });
      setVerified({ grossSalary: false, tds: false, standardDeduction: false, deductions80C: false });
      setStep('review');
    }
  }

  function handleFieldChange(key, value) {
    setFields((prev) => ({ ...prev, [key]: value }));
  }

  function calculateTax() {
    const income = fields.grossSalary || 0;
    const deductions = (fields.standardDeduction || 0) + (fields.deductions80C || 0);

    // Old regime
    const oldTaxable = income - deductions;
    let oldTax = 0;
    if (oldTaxable <= 250000) oldTax = 0;
    else if (oldTaxable <= 500000) oldTax = (oldTaxable - 250000) * 0.05;
    else if (oldTaxable <= 1000000) oldTax = 12500 + (oldTaxable - 500000) * 0.2;
    else oldTax = 112500 + (oldTaxable - 1000000) * 0.3;
    oldTax = oldTax * 1.04; // 4% cess

    // New regime
    let newTax = 0;
    if (income <= 300000) newTax = 0;
    else if (income <= 600000) newTax = (income - 300000) * 0.05;
    else if (income <= 900000) newTax = 15000 + (income - 600000) * 0.1;
    else if (income <= 1200000) newTax = 45000 + (income - 900000) * 0.15;
    else if (income <= 1500000) newTax = 90000 + (income - 1200000) * 0.2;
    else newTax = 150000 + (income - 1500000) * 0.3;
    newTax = newTax * 1.04;

    setTaxResult({
      income,
      deductions,
      oldRegime: { taxable: oldTaxable, tax: Math.round(oldTax) },
      newRegime: { taxable: income, tax: Math.round(newTax) },
      recommended: oldTax < newTax ? 'old' : 'new',
      savings: Math.round(Math.abs(oldTax - newTax)),
    });
    setStep('payment');
  }

  const recommendedRegimeLabel = useMemo(() => {
    if (!taxResult?.recommended) return '';
    return taxResult.recommended === 'old' ? 'Old Regime' : 'New Regime';
  }, [taxResult?.recommended]);

  const netTaxableIncome = useMemo(() => {
    if (!taxResult) return 0;
    return taxResult.recommended === 'old' ? (taxResult.oldRegime?.taxable || 0) : (taxResult.newRegime?.taxable || 0);
  }, [taxResult]);

  const taxPayableOrRefund = useMemo(() => {
    if (!taxResult) return { amount: 0, label: '' };
    const tax = taxResult.recommended === 'old' ? (taxResult.oldRegime?.tax || 0) : (taxResult.newRegime?.tax || 0);
    const tds = fields?.tds || 0;
    const diff = Math.round(tax - tds);
    if (diff > 0) return { amount: diff, label: 'Tax Payable' };
    if (diff < 0) return { amount: Math.abs(diff), label: 'Refund Due' };
    return { amount: 0, label: 'Nil' };
  }, [taxResult, fields?.tds]);

  const itrDetailsRows = useMemo(() => {
    const fmtMoney = (n) => {
      const v = Number(n || 0);
      return `₹${Math.round(v).toLocaleString('en-IN')}`;
    };

    const cleanInlineText = (value, maxLen = 64) => {
      const s = String(value ?? '')
        .replace(/<[^>]*>/g, ' ')
        .replace(/\s+/g, ' ')
        .trim();
      if (!s) return '—';
      if (s.length <= maxLen) return s;
      return `${s.slice(0, Math.max(0, maxLen - 1))}…`;
    };

    const safePan = (value) => {
      const s = String(value ?? '').toUpperCase().replace(/\s+/g, '').trim();
      const m = s.match(/[A-Z]{5}[0-9]{4}[A-Z]/);
      return m?.[0] || '—';
    };

    const safeTan = (value) => {
      const s = String(value ?? '').toUpperCase().replace(/\s+/g, '').trim();
      const m = s.match(/[A-Z]{4}[0-9]{5}[A-Z]/);
      return m?.[0] || '—';
    };

    const safeAssessmentYear = (value) => {
      const s = String(value ?? '').trim();
      const m = s.match(/\b(20\d{2})-(\d{2})\b/);
      if (!m) return '—';
      return `${m[1]}-${m[2]}`;
    };

    return [
      { key: 'employeePAN', label: 'Employee PAN', value: safePan(itrDetails.employeePAN) },
      { key: 'employerName', label: 'Employer Name', value: cleanInlineText(itrDetails.employerName, 48) },
      { key: 'employerTAN', label: 'Employer TAN', value: safeTan(itrDetails.employerTAN) },
      { key: 'assessmentYear', label: 'Assessment Year', value: safeAssessmentYear(itrDetails.assessmentYear) },
      { key: 'grossSalary', label: 'Gross Salary', value: fmtMoney(fields?.grossSalary || 0) },
      { key: 'hraExemption', label: 'HRA Exemption', value: fmtMoney(itrDetails.hraExemption || 0) },
      { key: 'standardDeduction', label: 'Standard Deduction', value: fmtMoney(fields?.standardDeduction || 0) },
      { key: 'deductions80C', label: '80C Deductions', value: fmtMoney(fields?.deductions80C || 0) },
      { key: 'netTaxableIncome', label: 'Net Taxable Income', value: fmtMoney(netTaxableIncome) },
      { key: 'tds', label: 'TDS Deducted', value: fmtMoney(fields?.tds || 0) },
      { key: 'recommendedRegime', label: 'Recommended Regime', value: recommendedRegimeLabel || '—' },
    ];
  }, [fields, itrDetails, netTaxableIncome, recommendedRegimeLabel, taxPayableOrRefund, taxResult]);

  return (
    <div
      style={themeStyle}
      data-itr-hydrated={hydrated ? '1' : '0'}
      className="min-h-screen bg-[var(--lux-background)] pt-24 pb-16 px-4 text-[color:var(--lux-foreground)]"
    >
      <script
        id="itr-filing-help-tool-schema"
        type="application/ld+json"
        dangerouslySetInnerHTML={{ __html: JSON.stringify(toolSchema) }}
      />
      <div className="max-w-[1100px] mx-auto">
        <div className="mb-4">
          <button
            onClick={handleBack}
            className="inline-flex items-center gap-2 text-sm font-semibold text-[color:var(--lux-foreground-60)] hover:text-[color:var(--lux-foreground)] transition-colors bg-transparent border-none cursor-pointer"
          >
            <span aria-hidden="true">←</span>
            {step === 'upload' || step === 'extracting' ? 'Reset' : 'Back'}
          </button>
        </div>

        <div className="mb-8">
          <h1 className="text-4xl font-bold mb-2 text-[color:var(--lux-foreground)]">Free ITR Filing Help</h1>
          <p className="text-[color:var(--lux-foreground-60)]">Upload Form 16, AIS, or Bank Statement</p>
        </div>

        {/* Progress */}
        <div className="flex gap-4 mb-8">
          <div
            className={`flex-1 h-2 rounded ${
              step !== 'upload' ? 'bg-[color:var(--lux-accent)]' : 'bg-[color:var(--lux-foreground-10)]'
            }`}
          />
          <div
            className={`flex-1 h-2 rounded ${
              step === 'payment' || step === 'details' || step === 'complete' ? 'bg-[color:var(--lux-accent)]' : 'bg-[color:var(--lux-foreground-10)]'
            }`}
          />
          <div
            className={`flex-1 h-2 rounded ${
              step === 'details' || step === 'complete' ? 'bg-[color:var(--lux-accent)]' : 'bg-[color:var(--lux-foreground-10)]'
            }`}
          />
        </div>

        {/* Upload */}
        {step === 'upload' && (
          <div className="bg-[color:var(--lux-card)]/70 border-2 border-dashed border-[color:var(--lux-foreground-10)] rounded-lg p-16 text-center hover:border-[color:var(--lux-accent)]/50 transition">
            <input
              key={fileInputKey}
              type="file"
              accept=".pdf,image/*"
              onChange={(e) => {
                console.log('[ITR] File input changed:', e.target?.files?.[0]?.name);
                e.target.files[0] && handleUpload(e.target.files[0]);
              }}
              className="hidden"
              id="file-upload"
            />
            <label htmlFor="file-upload" className="cursor-pointer block">
              <div className="text-6xl mb-4">📄</div>
              <p className="text-xl font-semibold text-[color:var(--lux-foreground)] mb-2">Click to upload PDF or image</p>
              <p className="text-[color:var(--lux-foreground-60)]">Form 16, AIS, bank statement, or photo scan</p>
            </label>
          </div>
        )}

        {/* Premium Extracting Animation */}
        {step === 'extracting' && (
          <div className="bg-[color:var(--lux-card)]/70 border border-[color:var(--lux-foreground-10)] rounded-2xl p-10 md:p-16">
            {/* Animated Document Icon */}
            <div className="relative w-24 h-24 mx-auto mb-8">
              <div className="absolute inset-0 bg-gradient-to-br from-[color:var(--lux-accent)]/20 to-transparent rounded-2xl animate-pulse" />
              <div className="absolute inset-2 bg-[color:var(--lux-background)] rounded-xl flex items-center justify-center">
                <span className="text-4xl transition-all duration-300">
                  {LOADING_STAGES[loadingStage]?.icon || '📄'}
                </span>
              </div>
              {/* Orbiting dots */}
              <div className="absolute inset-0 animate-spin" style={{ animationDuration: '3s' }}>
                <div className="absolute top-0 left-1/2 w-2 h-2 -ml-1 rounded-full bg-[color:var(--lux-accent)]" />
              </div>
              <div className="absolute inset-0 animate-spin" style={{ animationDuration: '4s', animationDirection: 'reverse' }}>
                <div className="absolute bottom-0 left-1/2 w-1.5 h-1.5 -ml-0.75 rounded-full bg-[color:var(--lux-foreground-40)]" />
              </div>
            </div>

            {/* Current Stage */}
            <div className="text-center mb-8">
              <p className="text-xl font-medium text-[color:var(--lux-foreground)] mb-2">
                {LOADING_STAGES[loadingStage]?.label || 'Processing...'}
              </p>
              <p className="text-sm text-[color:var(--lux-foreground-40)]">
                This may take 15-30 seconds for scanned documents
              </p>
            </div>

            {/* Progress Bar */}
            <div className="max-w-md mx-auto mb-8">
              <div className="h-1.5 bg-[color:var(--lux-foreground-10)] rounded-full overflow-hidden">
                <div
                  className="h-full bg-gradient-to-r from-[color:var(--lux-accent)] to-[color:var(--lux-foreground)] rounded-full transition-all duration-300 ease-out"
                  style={{ width: `${loadingProgress}%` }}
                />
              </div>
              <div className="flex justify-between mt-2 text-xs text-[color:var(--lux-foreground-40)]">
                <span>{Math.round(loadingProgress)}%</span>
                <span>Step {loadingStage + 1} of {LOADING_STAGES.length}</span>
              </div>
            </div>

            {/* Stage Pills */}
            <div className="flex flex-wrap justify-center gap-2">
              {LOADING_STAGES.map((stage, idx) => (
                <div
                  key={stage.id}
                  className={`px-3 py-1.5 rounded-full text-xs font-medium transition-all duration-300 ${
                    idx < loadingStage
                      ? 'bg-[color:var(--lux-foreground)] text-[color:var(--lux-background)]'
                      : idx === loadingStage
                      ? 'bg-[color:var(--lux-foreground)]/20 text-[color:var(--lux-foreground)] ring-1 ring-[color:var(--lux-foreground)]/50'
                      : 'bg-[color:var(--lux-foreground-05)] text-[color:var(--lux-foreground-40)]'
                  }`}
                >
                  {idx < loadingStage ? '✓' : stage.icon} {stage.label}
                </div>
              ))}
            </div>
          </div>
        )}

        {/* Review - Split Screen Verify & Edit */}
        {step === 'review' && extractedData && (
          <>
            {/* Confidence Banner */}
            <div className={`mb-6 p-4 rounded-lg border ${
              extractedData.confidence > 0.9 
                ? 'bg-[color:var(--lux-foreground)]/10 border-[color:var(--lux-accent)]/50 text-[color:var(--lux-foreground)]' 
                : extractedData.confidence > 0.6 
                ? 'bg-[color:var(--lux-foreground-10)] border-[color:var(--lux-foreground-40)] text-[color:var(--lux-foreground)]'
                : 'bg-[color:var(--lux-foreground-05)] border-[color:var(--lux-foreground-40)] text-[color:var(--lux-foreground-60)]'
            }`}>
              <div className="flex items-center justify-between">
                <div className="flex items-center gap-2">
                  <span className="text-xl">{extractedData.confidence > 0.9 ? '✓' : extractedData.confidence > 0.6 ? '⚠' : '⚠'}</span>
                  <span className="font-semibold">{Math.round(extractedData.confidence * 100)}% Confidence</span>
                  {extractedData.extractedCount && <span className="text-sm opacity-70">({extractedData.extractedCount} fields)</span>}
                </div>
                <span className="text-sm opacity-70">
                  {extractedData.method?.includes('gpt') 
                    ? 'AI Enhanced' 
                    : extractedData.method === 'ocr' || extractedData.method === 'ocr_space'
                    ? 'Scanned PDF (OCR)' 
                    : extractedData.method === 'manual'
                    ? 'Manual Entry'
                    : 'Digital PDF'}
                </span>
              </div>
              {extractedData.message && <p className="text-sm mt-2 opacity-80">{extractedData.message}</p>}
            </div>

            {/* Split Screen */}
            <div className="grid lg:grid-cols-2 gap-6 mb-6">
              {/* Left: PDF Viewer */}
              <div>
                {pdfBase64 && previewMimeType === 'application/pdf' ? (
                  <div className="bg-[color:var(--lux-background)] p-6 rounded-lg h-[820px] overflow-auto border border-[color:var(--lux-foreground-10)] flex flex-col">
                    <iframe
                      src={`data:application/pdf;base64,${pdfBase64}`}
                      className="w-full flex-1 border-0"
                      title="Form 16 PDF"
                    />
                    <p className="text-xs text-[color:var(--lux-foreground-40)] mt-2 text-center">
                      Use toolbar buttons (+ / –) to zoom • Use page arrows to change pages • Ctrl + mouse wheel also zooms
                    </p>
                  </div>
                ) : pdfTooLarge ? (
                  <div className="bg-[color:var(--lux-card)]/70 border border-[color:var(--lux-foreground-10)] rounded-lg p-4 h-[820px] flex flex-col items-center justify-center text-center">
                    <span className="text-4xl mb-4">📄</span>
                    <p className="font-medium mb-2 text-[color:var(--lux-foreground)]">File too large for preview</p>
                    <p className="text-sm text-[color:var(--lux-foreground-60)]">
                      Your upload is over 1MB. Please view it locally and verify the extracted values on the right.
                    </p>
                  </div>
                ) : (
                  <div className="bg-[color:var(--lux-card)]/70 border border-[color:var(--lux-foreground-10)] rounded-lg p-4 h-[820px] flex items-center justify-center text-[color:var(--lux-foreground-60)]">
                    <p>Preview not available</p>
                  </div>
                )}
              </div>

              {/* Right: Editable Fields with Verification */}
              <div className="bg-[color:var(--lux-card)]/70 border border-[color:var(--lux-foreground-10)] rounded-lg p-4">
                <h3 className="font-semibold text-[color:var(--lux-foreground)] mb-3 flex items-center gap-2">
                  <span>✏️</span> Verify Extracted Values
                </h3>
                <p className="text-sm text-[color:var(--lux-foreground-60)] mb-4">
                  Compare with your PDF and check each field to confirm accuracy.
                </p>

                {extractedData?.isScanned && (
                  <div className="mb-4 rounded-lg border border-[color:var(--lux-accent)]/40 bg-[color:var(--lux-accent)]/10 p-3">
                    <p className="text-sm text-[color:var(--lux-foreground)] font-medium">
                      This appears to be a scanned document. Please enter values while viewing your PDF above.
                    </p>
                  </div>
                )}

                <div className="space-y-4">
                  {[
                    { key: 'grossSalary', label: 'Gross Salary', hint: 'Section 17(1) in Form 16', tooltip: 'Find this under "Salary as per provisions contained in section 17(1)" in your Form 16 Part B' },
                    { key: 'tds', label: 'TDS Deducted', hint: 'Total Tax Deducted row', tooltip: 'Find the "Total" row in the "Amount of tax deducted" column of Form 16 Part A' },
                    { key: 'standardDeduction', label: 'Standard Deduction', hint: 'Usually ₹50,000', tooltip: 'Standard deduction under Section 16(ia) - maximum ₹50,000 for salaried individuals' },
                    { key: 'deductions80C', label: '80C Deductions', hint: 'PF, LIC, etc.', tooltip: 'Total of PF, LIC premium, ELSS, PPF, etc. claimed under Section 80C (max ₹1.5 lakh)' },
                  ].map(({ key, label, hint, tooltip }) => {
                    const fieldValue = fields[key] || 0;
                    const confidence = extractedData.confidence;
                    const inputValue = extractedData?.isScanned && fieldValue === 0 ? '' : fieldValue;

                    // Highlight rules (LUX-safe):
                    // - Missing (0): strongest attention styling ("red" intent)
                    // - Partial / low confidence: medium attention styling ("yellow" intent)
                    // - Good: normal styling
                    const isMissing = fieldValue === 0;
                    const isPartial = !isMissing && confidence < 0.8;
                    const isGood = !isMissing && !isPartial;

                    const inputChrome = isMissing
                      ? 'bg-[color:var(--lux-foreground-05)] border-[color:var(--lux-accent)]/60 ring-1 ring-[color:var(--lux-accent)]/25'
                      : isPartial
                      ? 'bg-[color:var(--lux-foreground-05)] border-[color:var(--lux-accent)]/30'
                      : isGood
                      ? 'bg-[color:var(--lux-foreground-05)] border-[color:var(--lux-foreground-10)]'
                      : 'bg-[var(--lux-background)] border-[color:var(--lux-foreground-10)]';

                    const statusText = isMissing ? 'Missing — enter from your document' : isPartial ? 'Low confidence — please verify' : 'Looks OK — please verify';
                    const statusTone = isMissing ? 'text-[color:var(--lux-accent)]' : isPartial ? 'text-[color:var(--lux-foreground-60)]' : 'text-[color:var(--lux-foreground-60)]';
                    
                    return (
                      <div key={key} className="space-y-2">
                        <div className="flex items-center justify-between">
                          <label className="text-sm font-medium text-[color:var(--lux-foreground)]">{label}</label>
                          <span className="text-xs text-[color:var(--lux-foreground-40)]">{hint}</span>
                        </div>
                        <div className="flex items-center gap-3">
                          <span className="text-[color:var(--lux-foreground-60)]">₹</span>
                          <input
                            type="number"
                            value={inputValue}
                            onChange={(e) => {
                              const raw = e.target.value;
                              if (raw === '') {
                                handleFieldChange(key, 0);
                                return;
                              }
                              handleFieldChange(key, parseInt(raw) || 0);
                            }}
                            title={tooltip}
                            placeholder={`Enter ${label}`}
                            className={`flex-1 ${inputChrome} border rounded px-3 py-2 text-[color:var(--lux-foreground)] focus:outline-none focus:ring-1 focus:ring-[color:var(--lux-accent)]`}
                          />
                        </div>
                        <p className={`text-xs ${statusTone}`}>{statusText}</p>
                        <label className="flex items-center gap-2 cursor-pointer text-sm">
                          <input
                            type="checkbox"
                            checked={verified[key]}
                            onChange={(e) => setVerified(prev => ({ ...prev, [key]: e.target.checked }))}
                            className="w-4 h-4 rounded border-[color:var(--lux-foreground-40)] accent-[color:var(--lux-accent)]"
                          />
                          <span className={verified[key] ? 'text-[color:var(--lux-accent)]' : 'text-[color:var(--lux-foreground-60)]'}>
                            I verified {label} is correct
                          </span>
                        </label>
                      </div>
                    );
                  })}
                </div>

                {/* Verification Progress */}
                <div className="mt-6 pt-4 border-t border-[color:var(--lux-foreground-10)]">
                  <div className="flex items-center justify-between text-sm mb-2">
                    <span className="text-[color:var(--lux-foreground-60)]">Verification Progress</span>
                    <span className="text-[color:var(--lux-foreground)]">
                      {Object.values(verified).filter(v => v).length}/4 fields verified
                    </span>
                  </div>
                  <div className="h-2 bg-[color:var(--lux-foreground-10)] rounded-full overflow-hidden">
                    <div 
                      className="h-full bg-[color:var(--lux-accent)] rounded-full transition-all duration-300"
                      style={{ width: `${(Object.values(verified).filter(v => v).length / 4) * 100}%` }}
                    />
                  </div>
                </div>
              </div>
            </div>

            {/* Calculate Button - disabled until all verified */}
            <button
              onClick={calculateTax}
              disabled={!allVerified}
              className={`w-full px-8 py-4 rounded-lg font-semibold transition ${
                allVerified 
                  ? 'bg-[color:var(--lux-foreground)] text-[color:var(--lux-background)] hover:opacity-90 cursor-pointer' 
                  : 'bg-[color:var(--lux-foreground-10)] text-[color:var(--lux-foreground-40)] cursor-not-allowed'
              }`}
            >
              {allVerified ? 'Calculate Tax →' : `Verify all 4 fields to continue (${Object.values(verified).filter(v => v).length}/4)`}
            </button>
          </>
        )}

        {/* Payment */}
        {step === 'payment' && taxResult && (
          <>
            <div className="grid md:grid-cols-2 gap-6 mb-6">
              {/* Old Regime */}
              <div
                className={`bg-[color:var(--lux-card)]/70 border-2 rounded-lg p-6 ${
                  taxResult.recommended === 'old' ? 'border-[color:var(--lux-accent)]/50' : 'border-[color:var(--lux-foreground-10)]'
                }`}
              >
                <h3 className="text-xl font-bold mb-4 text-[color:var(--lux-foreground)]">Old Tax Regime</h3>
                <div className="space-y-2 text-[color:var(--lux-foreground-60)]">
                  <div className="flex justify-between">
                    <span>Gross Income:</span>
                    <span className="text-[color:var(--lux-foreground)]">₹{taxResult.income.toLocaleString('en-IN')}</span>
                  </div>
                  <div className="flex justify-between">
                    <span>Deductions:</span>
                    <span className="text-[color:var(--lux-foreground)]">₹{taxResult.deductions.toLocaleString('en-IN')}</span>
                  </div>
                  <div className="flex justify-between font-bold text-[color:var(--lux-foreground)] border-t border-[color:var(--lux-foreground-10)] pt-2 mt-2">
                    <span>Tax Payable:</span>
                    <span className="text-2xl text-[color:var(--lux-foreground)]">₹{taxResult.oldRegime.tax.toLocaleString('en-IN')}</span>
                  </div>
                </div>
                {taxResult.recommended === 'old' && (
                  <div className="mt-4 bg-[color:var(--lux-foreground-10)] border border-[color:var(--lux-foreground-10)] rounded px-3 py-2 text-sm text-[color:var(--lux-foreground)]">
                    ✓ Recommended
                  </div>
                )}
              </div>

              {/* New Regime */}
              <div
                className={`bg-[color:var(--lux-card)]/70 border-2 rounded-lg p-6 ${
                  taxResult.recommended === 'new' ? 'border-[color:var(--lux-accent)]/50' : 'border-[color:var(--lux-foreground-10)]'
                }`}
              >
                <h3 className="text-xl font-bold mb-4 text-[color:var(--lux-foreground)]">New Tax Regime</h3>
                <div className="space-y-2 text-[color:var(--lux-foreground-60)]">
                  <div className="flex justify-between">
                    <span>Gross Income:</span>
                    <span className="text-[color:var(--lux-foreground)]">₹{taxResult.income.toLocaleString('en-IN')}</span>
                  </div>
                  <div className="flex justify-between">
                    <span>Deductions:</span>
                    <span className="text-[color:var(--lux-foreground)]">₹0</span>
                  </div>
                  <div className="flex justify-between font-bold text-[color:var(--lux-foreground)] border-t border-[color:var(--lux-foreground-10)] pt-2 mt-2">
                    <span>Tax Payable:</span>
                    <span className="text-2xl text-[color:var(--lux-foreground)]">₹{taxResult.newRegime.tax.toLocaleString('en-IN')}</span>
                  </div>
                </div>
                {taxResult.recommended === 'new' && (
                  <div className="mt-4 bg-[color:var(--lux-foreground-10)] border border-[color:var(--lux-foreground-10)] rounded px-3 py-2 text-sm text-[color:var(--lux-foreground)]">
                    ✓ Recommended
                  </div>
                )}
              </div>
            </div>

            {/* Savings */}
            <div className="bg-[color:var(--lux-card)]/70 border border-[color:var(--lux-foreground-10)] rounded-lg p-6 text-center mb-6">
              <p className="text-[color:var(--lux-foreground-60)] mb-2">Potential Savings</p>
              <p className="text-3xl font-bold text-[color:var(--lux-foreground)]">₹{taxResult.savings.toLocaleString('en-IN')}</p>
              <p className="text-sm text-[color:var(--lux-foreground-60)] mt-2">by choosing {taxResult.recommended === 'old' ? 'Old' : 'New'} Regime</p>
            </div>

            {/* Explicit next step (no auto-advance) */}
            <div className="bg-[color:var(--lux-card)]/70 border border-[color:var(--lux-foreground-10)] rounded-lg p-8 text-center">
              <h3 className="text-xl font-bold mb-2 text-[color:var(--lux-foreground)]">Ready to file?</h3>
              <p className="text-[color:var(--lux-foreground-60)] mb-6">
                Continue to see your filing checklist with copy-paste details and the 6-step guide.
              </p>
              <button
                type="button"
                onClick={() => setStep('details')}
                className="inline-flex items-center justify-center bg-[color:var(--lux-foreground)] text-[color:var(--lux-background)] px-12 py-4 rounded-lg font-bold text-lg hover:opacity-90 transition"
              >
                Continue to Filing Checklist →
              </button>
            </div>
          </>
        )}

        {/* Step 3 — ITR Details + Filing Steps */}
        {step === 'details' && taxResult && (
          <>
            <div className="mb-6 bg-[color:var(--lux-card)]/70 border border-[color:var(--lux-foreground-10)] rounded-lg p-6">
              <h2 className="text-2xl font-bold text-[color:var(--lux-foreground)] mb-2">Step 3 — Your filing checklist</h2>
              <p className="text-[color:var(--lux-foreground-60)]">
                Everything below is based on your extracted values. Copy what you need, then file confidently.
              </p>
            </div>

            <div className="grid md:grid-cols-2 gap-6">
              {/* Section 1 */}
              <section className="bg-[color:var(--lux-card)]/70 border border-[color:var(--lux-foreground-10)] rounded-lg p-6">
                <div className="flex items-center justify-between mb-4">
                  <h3 className="text-xl font-bold text-[color:var(--lux-foreground)]">Your ITR Details</h3>
                  <span className="text-xs text-[color:var(--lux-foreground-40)]">Copy-paste ready</span>
                </div>

                <div className="border border-[color:var(--lux-foreground-10)] rounded-lg overflow-hidden">
                  <div className="hidden sm:grid grid-cols-[1fr_auto_auto] gap-4 px-4 py-2 bg-[color:var(--lux-foreground-05)] border-b border-[color:var(--lux-foreground-10)] text-xs font-semibold tracking-widest uppercase text-[color:var(--lux-foreground-40)]">
                    <div>Field</div>
                    <div className="text-right">Value</div>
                    <div className="text-right">&nbsp;</div>
                  </div>

                  <div className="divide-y divide-[color:var(--lux-foreground-10)]">
                    {itrDetailsRows.map((row) => (
                      <div
                        key={row.key}
                        className="grid grid-cols-1 sm:grid-cols-[1fr_auto_auto] items-start sm:items-center gap-2 sm:gap-4 px-4 py-3 bg-[color:var(--lux-foreground-05)]"
                      >
                        <div className="text-sm font-medium text-[color:var(--lux-foreground-60)]">{row.label}</div>
                        <div className="text-sm font-semibold text-[color:var(--lux-accent)] break-words sm:text-right">{row.value}</div>
                        <div className="sm:text-right">
                          <button
                            type="button"
                            onClick={() => copyToClipboard(row.value, row.key)}
                            className="px-2.5 py-1.5 text-xs font-semibold rounded border border-[color:var(--lux-foreground-10)] bg-[color:var(--lux-background)] text-[color:var(--lux-foreground-80)] hover:bg-[color:var(--lux-foreground-05)] transition"
                          >
                            {copiedKey === row.key ? 'Copied ✓' : 'Copy'}
                          </button>
                        </div>
                      </div>
                    ))}
                  </div>
                </div>
              </section>

              {/* Section 2 */}
              <section className="bg-[color:var(--lux-card)]/70 border border-[color:var(--lux-foreground-10)] rounded-lg p-6">
                <h3 className="text-xl font-bold text-[color:var(--lux-foreground)] mb-4">How to file in 6 steps</h3>

                {(() => {
                  const safePan = (value) => {
                    const s = String(value ?? '').toUpperCase().replace(/\s+/g, '').trim();
                    const m = s.match(/[A-Z]{5}[0-9]{4}[A-Z]/);
                    return m?.[0] || '—';
                  };
                  const safeAssessmentYear = (value) => {
                    const s = String(value ?? '').trim();
                    const m = s.match(/\b(20\d{2})-(\d{2})\b/);
                    if (!m) return '—';
                    return `${m[1]}-${m[2]}`;
                  };
                  const cleanEmployer = (value) => {
                    const s = String(value ?? '').replace(/<[^>]*>/g, ' ').replace(/\s+/g, ' ').trim();
                    if (!s) return 'your employer';
                    return s.length > 40 ? `${s.slice(0, 39)}…` : s;
                  };

                  const pan = safePan(itrDetails.employeePAN);
                  const ay = safeAssessmentYear(itrDetails.assessmentYear);
                  const grossSalary = Math.round(Number(fields?.grossSalary || 0)).toLocaleString('en-IN');
                  const standardDeduction = Math.round(Number(fields?.standardDeduction || 0)).toLocaleString('en-IN');
                  const tds = Math.round(Number(fields?.tds || 0)).toLocaleString('en-IN');
                  const employerName = cleanEmployer(itrDetails.employerName);
                  const savings = Math.round(Number(taxResult?.savings || 0)).toLocaleString('en-IN');
                  const recommended = recommendedRegimeLabel || 'Recommended';

                  const Gold = ({ children }) => (
                    <span className="text-[color:var(--lux-accent)] font-semibold">{children}</span>
                  );

                  const steps = [
                    {
                      title: 'Login to the portal',
                      desc: (
                        <>
                          Sign in at <Gold>incometax.gov.in</Gold> using PAN <Gold>{pan}</Gold>.
                        </>
                      ),
                    },
                    {
                      title: 'Start return',
                      desc: (
                        <>
                          Choose AY <Gold>{ay}</Gold> and select <Gold>ITR-1 (Sahaj)</Gold>.
                        </>
                      ),
                    },
                    {
                      title: 'Confirm salary',
                      desc: (
                        <>
                          Gross Salary <Gold>₹{grossSalary}</Gold>, Standard Deduction <Gold>₹{standardDeduction}</Gold>.
                        </>
                      ),
                    },
                    {
                      title: 'Pick regime',
                      desc: (
                        <>
                          Select <Gold>{recommended}</Gold> (est. savings <Gold>₹{savings}</Gold>).
                        </>
                      ),
                    },
                    {
                      title: 'Check TDS',
                      desc: (
                        <>
                          TDS deducted: <Gold>₹{tds}</Gold> (from <Gold>{employerName}</Gold>).
                        </>
                      ),
                    },
                    {
                      title: 'Submit & e-Verify',
                      desc: (
                        <>
                          Submit and e-Verify via <Gold>Aadhaar OTP</Gold>.
                        </>
                      ),
                    },
                  ];

                  return (
                    <div className="space-y-4">
                      {steps.map((s, idx) => (
                        <div key={s.title} className="flex gap-4">
                          <div className="shrink-0">
                            <div className="w-9 h-9 rounded-full bg-[color:var(--lux-foreground-05)] border border-[color:var(--lux-foreground-10)] flex items-center justify-center font-bold text-[color:var(--lux-foreground)]">
                              {idx + 1}
                            </div>
                          </div>
                          <div>
                            <div className="font-bold text-[color:var(--lux-foreground)]">{s.title}</div>
                            <div className="text-sm text-[color:var(--lux-foreground-60)] leading-6">{s.desc}</div>
                          </div>
                        </div>
                      ))}
                    </div>
                  );
                })()}
              </section>
            </div>

            {/* Bottom actions */}
            <div className="mt-8 flex flex-col items-center">
              <button
                type="button"
                onClick={() => {
                  // Fix 1 — Save itr_data to localStorage and redirect to store
                  const grossSalary = fields?.grossSalary;
                  const tds = fields?.tds;
                  const standardDeduction = fields?.standardDeduction;
                  const deductions80C = fields?.deductions80C;
                  const employeePAN = itrDetails?.employeePAN;
                  const employerName = itrDetails?.employerName;
                  const employerTAN = itrDetails?.employerTAN;
                  const assessmentYear = itrDetails?.assessmentYear;
                  const hraExemption = itrDetails?.hraExemption;
                  const regime = itrDetails?.regime;
                  const netTaxableIncome =
                    taxResult?.recommended === 'old'
                      ? (taxResult?.oldRegime?.taxable || 0)
                      : (taxResult?.newRegime?.taxable || 0);
                  const oldRegimeTax = taxResult?.oldRegime?.tax || 0;
                  const newRegimeTax = taxResult?.newRegime?.tax || 0;
                  const savings = taxResult?.savings || 0;

                  localStorage.setItem(
                    'itr_data',
                    JSON.stringify({
                      grossSalary,
                      tds,
                      standardDeduction,
                      deductions80C,
                      employeePAN,
                      employerName,
                      employerTAN,
                      assessmentYear,
                      hraExemption,
                      regime,
                      netTaxableIncome,
                      oldRegimeTax,
                      newRegimeTax,
                      savings,
                    })
                  );
                  window.location.href =
                    'https://store.bmwealth.co.in/products/tax-optimization-pdf?returnTo=https%3A%2F%2Fwww.bmwealth.co.in%2Ftools%2Fitr-filing-help%3Fpayment%3Dsuccess';
                }}
                className="group relative overflow-hidden px-7 md:px-8 py-3.5 md:py-4 no-underline transition-all duration-500"
                style={{
                  backgroundColor: 'var(--lux-foreground)',
                  color: 'var(--lux-background)',
                }}
              >
                <span className="relative z-10 flex items-center gap-3 font-sans text-[9px] tracking-[0.22em] uppercase font-semibold">
                  Get Full ITR Summary
                  <ArrowRight className="h-3.5 w-3.5 transition-transform duration-500 group-hover:translate-x-1.5" />
                </span>
                <span
                  aria-hidden
                  className="absolute inset-0 -translate-x-[101%] group-hover:translate-x-0 transition-transform duration-500"
                  style={{ backgroundColor: 'var(--lux-accent)' }}
                />
              </button>
              <button
                type="button"
                onClick={() => {
                  if (typeof window !== 'undefined') window.print();
                }}
                className="mt-3 text-xs text-[color:var(--lux-foreground-60)] underline underline-offset-4 hover:opacity-90"
              >
                Print this page
              </button>
            </div>
          </>
        )}

        {/* Complete */}
        {step === 'complete' && (
          <div className="bg-[color:var(--lux-card)]/70 border border-[color:var(--lux-foreground-10)] rounded-lg p-8 text-center">
            <div className="text-6xl mb-4 text-[color:var(--lux-foreground)]">✓</div>
            <h2 className="text-2xl font-bold text-[color:var(--lux-foreground)] mb-2">Ready for the full summary</h2>
            <p className="text-[color:var(--lux-foreground-60)] mb-6">Get the full ITR summary from our digital store.</p>
            <a
              href="https://store.bmwealth.co.in"
              target="_blank"
              rel="noopener noreferrer"
              className="inline-flex items-center justify-center bg-[color:var(--lux-foreground)] text-[color:var(--lux-background)] px-6 py-3 rounded-lg font-semibold hover:opacity-90 transition"
            >
              Open Store →
            </a>
          </div>
        )}

        {/* SEO content (indexable, no UI workflow change) */}
        <section className="mt-12 bg-[color:var(--lux-card)]/50 border border-[color:var(--lux-foreground-10)] rounded-lg p-6">
          <div className="flex items-center gap-3 mb-4">
            <img
              src="/logo.png"
              alt="BM Wealth"
              width={40}
              height={40}
              loading="lazy"
              className="rounded"
            />
            <div>
              <h2 className="text-xl font-bold text-[color:var(--lux-foreground)]">How to use this ITR filing helper</h2>
              <p className="text-sm text-[color:var(--lux-foreground-60)]">Educational workflow support — verify everything before filing.</p>
            </div>
          </div>

          <div className="space-y-4 text-[color:var(--lux-foreground-60)] leading-7">
            <p>
              This page is designed to reduce the “blank page” problem when you start your ITR filing journey.
              Most people are not stuck because they don’t have documents — they are stuck because they don’t know
              what to do in what order. The upload step helps you extract a small set of commonly used fields from
              a PDF document like Form 16, AIS, or a bank statement, so you can review the numbers in one place.
            </p>
            <p>
              After you verify the extracted values, the tool compares an estimated tax outcome across old and new
              tax regimes using a simplified model. This is intentionally conservative: it does not try to “auto-file”
              your return, and it should not be treated as professional advice. Treat it like a checklist and a draft.
              If your situation includes capital gains, multiple income sources, foreign assets, business income, or
              complex deductions, you should use an appropriate professional workflow.
            </p>
            <p>
              For best results, keep your inputs clean: use the total gross salary figure from Form 16, include the
              standard deduction only once, and double-check any 80C deductions against proofs. If the extracted PDF
              looks incomplete or low confidence, upload a clearer file or use the review step to overwrite values.
            </p>
            <p>
              If you want a broader planning context, explore our public resources and services pages:
              <span className="ml-2">
                <Link href="/fixed-deposits" className="underline">Fixed Deposits</Link>,{' '}
                <Link href="/mutual-funds" className="underline">Mutual Funds</Link>,{' '}
                <Link href="/portfolio-management" className="underline">Portfolio Management</Link>,{' '}
                <Link href="/tools/tax-optimization" className="underline">Tax Optimization Tool</Link>, and{' '}
                <Link href="/contact" className="underline">Contact</Link>.
              </span>
            </p>
            <p>
              Canonical URL for this tool: <span className="text-[color:var(--lux-foreground)]">{pageUrl}</span>
            </p>
          </div>
        </section>

        {/* Disclaimer */}
        <div className="mt-12 p-4 bg-[color:var(--lux-card)]/70 border border-[color:var(--lux-foreground-10)] rounded-lg text-sm text-[color:var(--lux-foreground-60)]">
          ⚠️ This tool prepares a draft. BM Wealth is not a CA or ERI. Final filing is your responsibility.
        </div>
      </div>
    </div>
  );
}
