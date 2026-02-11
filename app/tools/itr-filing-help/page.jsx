'use client';
import { useMemo, useState, useEffect } from 'react';
import Link from 'next/link';
import { useRouter } from 'next/navigation';
import { getMetadataBase, SITE_NAME } from '@/lib/seo/metadata';

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
  { id: 'upload', label: 'Receiving document', icon: '📥', duration: 1500 },
  { id: 'analyze', label: 'Analyzing structure', icon: '🔍', duration: 2000 },
  { id: 'ocr', label: 'Reading text (OCR)', icon: '📖', duration: 8000 },
  { id: 'extract', label: 'Extracting fields', icon: '📊', duration: 2000 },
  { id: 'validate', label: 'Validating data', icon: '✓', duration: 1000 },
];

export default function ITRFilingHelp() {
  const router = useRouter();
  const [step, setStep] = useState('upload');
  const [extractedData, setExtractedData] = useState(null);
  const [fields, setFields] = useState({});
  const [taxResult, setTaxResult] = useState(null);
  const [loadingStage, setLoadingStage] = useState(0);
  const [loadingProgress, setLoadingProgress] = useState(0);
  const [pdfBase64, setPdfBase64] = useState(null);
  const [pdfTooLarge, setPdfTooLarge] = useState(false);
  const [verified, setVerified] = useState({
    grossSalary: false,
    tds: false,
    standardDeduction: false,
    deductions80C: false,
  });

  const allVerified = Object.values(verified).every(v => v);

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

  // Handle browser back button
  useEffect(() => {
    const handlePopState = () => {
      // Always go to tools on browser back
      router.push('/tools');
    };
    window.addEventListener('popstate', handlePopState);
    return () => window.removeEventListener('popstate', handlePopState);
  }, [router]);

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
    if (step === 'review') {
      setStep('upload');
      setExtractedData(null);
      setFields({});
      setPdfBase64(null);
      setPdfTooLarge(false);
      setVerified({ grossSalary: false, tds: false, standardDeduction: false, deductions80C: false });
    } else if (step === 'payment') {
      setStep('review');
      setTaxResult(null);
    } else if (step === 'complete') {
      setStep('payment');
    } else {
      router.push('/tools');
    }
  }

  async function handleUpload(file) {
    console.log('[ITR] handleUpload called with file:', file?.name, file?.type, file?.size);
    setStep('extracting');
    setLoadingStage(0);
    setLoadingProgress(0);

    const formData = new FormData();
    formData.append('file', file);

    try {
      console.log('[ITR] Fetching /api/itr/extract-v2...');
      const res = await fetch('/api/itr/extract-v2', {
        method: 'POST',
        body: formData,
      });
      console.log('[ITR] Response status:', res.status);

      // Get raw text first to debug
      const text = await res.text();
      let data;
      try {
        data = JSON.parse(text);
      } catch (e) {
        console.error('Response was not JSON:', text.substring(0, 500));
        alert('Server error: ' + (text.substring(0, 200) || 'Empty response'));
        setStep('upload');
        return;
      }

      if (data.success) {
        setExtractedData(data);
        setFields(data.fields);
        if (data.pdfBase64) setPdfBase64(data.pdfBase64);
        setPdfTooLarge(data.pdfTooLarge || false);
        setVerified({ grossSalary: false, tds: false, standardDeduction: false, deductions80C: false });
        setStep('review');
      } else {
        alert('Extraction failed: ' + (data.error || 'Unknown error') + (data.debug ? '\n\nDebug: ' + data.debug : ''));
        setStep('upload');
      }
    } catch (err) {
      alert('Error: ' + err.message);
      setStep('upload');
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

  return (
    <div
      style={themeStyle}
      className="min-h-screen bg-[var(--lux-background)] pt-24 pb-16 px-4 text-[color:var(--lux-foreground)]"
    >
      <script
        id="itr-filing-help-tool-schema"
        type="application/ld+json"
        dangerouslySetInnerHTML={{ __html: JSON.stringify(toolSchema) }}
      />
      <div className="max-w-5xl mx-auto">
        <div className="mb-4">
          <button
            onClick={handleBack}
            className="inline-flex items-center gap-2 text-sm font-semibold text-[color:var(--lux-foreground-60)] hover:text-[color:var(--lux-foreground)] transition-colors bg-transparent border-none cursor-pointer"
          >
            <span aria-hidden="true">←</span>
            {step === 'upload' || step === 'extracting' ? 'Back to Tools' : 'Back'}
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
              step === 'payment' || step === 'complete' ? 'bg-[color:var(--lux-accent)]' : 'bg-[color:var(--lux-foreground-10)]'
            }`}
          />
          <div
            className={`flex-1 h-2 rounded ${
              step === 'complete' ? 'bg-[color:var(--lux-accent)]' : 'bg-[color:var(--lux-foreground-10)]'
            }`}
          />
        </div>

        {/* Upload */}
        {step === 'upload' && (
          <div className="bg-[color:var(--lux-card)]/70 border-2 border-dashed border-[color:var(--lux-foreground-10)] rounded-lg p-16 text-center hover:border-[color:var(--lux-accent)]/50 transition">
            <input
              type="file"
              accept=".pdf"
              onChange={(e) => {
                console.log('[ITR] File input changed:', e.target?.files?.[0]?.name);
                e.target.files[0] && handleUpload(e.target.files[0]);
              }}
              className="hidden"
              id="file-upload"
            />
            <label htmlFor="file-upload" className="cursor-pointer block">
              <div className="text-6xl mb-4">📄</div>
              <p className="text-xl font-semibold text-[color:var(--lux-foreground)] mb-2">Click to upload PDF</p>
              <p className="text-[color:var(--lux-foreground-60)]">Form 16, AIS, or Bank Statement</p>
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
              <div className="bg-[color:var(--lux-card)]/70 border border-[color:var(--lux-foreground-10)] rounded-lg p-4">
                <h3 className="font-semibold text-[color:var(--lux-foreground)] mb-3 flex items-center gap-2">
                  <span>📄</span> Your Form 16 PDF
                </h3>
                {pdfBase64 ? (
                  <iframe
                    src={`data:application/pdf;base64,${pdfBase64}`}
                    className="w-full rounded border border-[color:var(--lux-foreground-10)]"
                    style={{ height: '450px' }}
                    title="Form 16 PDF Preview"
                  />
                ) : pdfTooLarge ? (
                  <div className="h-[450px] flex flex-col items-center justify-center bg-[color:var(--lux-foreground-05)] rounded text-[color:var(--lux-foreground-60)] p-6 text-center">
                    <span className="text-4xl mb-4">📄</span>
                    <p className="font-medium mb-2">PDF too large for preview</p>
                    <p className="text-sm text-[color:var(--lux-foreground-40)]">
                      Your Form 16 is over 1MB. Please view it locally and verify the extracted values on the right.
                    </p>
                  </div>
                ) : (
                  <div className="h-[450px] flex items-center justify-center bg-[color:var(--lux-foreground-05)] rounded text-[color:var(--lux-foreground-40)]">
                    <p>PDF preview not available</p>
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

                <div className="space-y-4">
                  {[
                    { key: 'grossSalary', label: 'Gross Salary', hint: 'Section 17(1) in Form 16', tooltip: 'Find this under "Salary as per provisions contained in section 17(1)" in your Form 16 Part B' },
                    { key: 'tds', label: 'TDS Deducted', hint: 'Total Tax Deducted row', tooltip: 'Find the "Total" row in the "Amount of tax deducted" column of Form 16 Part A' },
                    { key: 'standardDeduction', label: 'Standard Deduction', hint: 'Usually ₹50,000', tooltip: 'Standard deduction under Section 16(ia) - maximum ₹50,000 for salaried individuals' },
                    { key: 'deductions80C', label: '80C Deductions', hint: 'PF, LIC, etc.', tooltip: 'Total of PF, LIC premium, ELSS, PPF, etc. claimed under Section 80C (max ₹1.5 lakh)' },
                  ].map(({ key, label, hint, tooltip }) => {
                    const fieldValue = fields[key] || 0;
                    const confidence = extractedData.confidence;
                    const bgColor = fieldValue > 0 
                      ? (confidence > 0.9 ? 'bg-[color:var(--lux-foreground-10)] border-[color:var(--lux-accent)]/30' 
                         : confidence > 0.6 ? 'bg-[color:var(--lux-foreground-05)] border-[color:var(--lux-foreground-40)]' 
                         : 'bg-[color:var(--lux-foreground-05)] border-[color:var(--lux-foreground-40)]')
                      : 'bg-[var(--lux-background)] border-[color:var(--lux-foreground-10)]';
                    
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
                            value={fieldValue}
                            onChange={(e) => handleFieldChange(key, parseInt(e.target.value) || 0)}
                            title={tooltip}
                            placeholder={`Enter ${label}`}
                            className={`flex-1 ${bgColor} border rounded px-3 py-2 text-[color:var(--lux-foreground)] focus:outline-none focus:ring-1 focus:ring-[color:var(--lux-accent)]`}
                          />
                        </div>
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

            {/* Payment CTA */}
            <div className="bg-[color:var(--lux-card)]/70 border border-[color:var(--lux-foreground-10)] rounded-lg p-8 text-center">
              <h3 className="text-xl font-bold mb-2 text-[color:var(--lux-foreground)]">Get Your Full ITR Summary</h3>
              <p className="text-[color:var(--lux-foreground-60)] mb-6">Download detailed PDF report with both tax regimes</p>
              <div className="text-4xl font-bold text-[color:var(--lux-foreground)] mb-6">₹299</div>
              <button
                onClick={() => setStep('complete')}
                className="bg-[color:var(--lux-foreground)] text-[color:var(--lux-background)] px-12 py-4 rounded-lg font-bold text-lg hover:opacity-90 transition"
              >
                Pay & Download Report
              </button>
              <p className="text-xs text-[color:var(--lux-foreground-60)] mt-4">Secure payment via Razorpay</p>
            </div>
          </>
        )}

        {/* Complete */}
        {step === 'complete' && (
          <div className="bg-[color:var(--lux-card)]/70 border border-[color:var(--lux-foreground-10)] rounded-lg p-8 text-center">
            <div className="text-6xl mb-4 text-[color:var(--lux-foreground)]">✓</div>
            <h2 className="text-2xl font-bold text-[color:var(--lux-foreground)] mb-2">Payment Successful!</h2>
            <p className="text-[color:var(--lux-foreground-60)] mb-6">Your ITR summary has been generated</p>
            <button className="bg-[color:var(--lux-foreground)] text-[color:var(--lux-background)] px-6 py-3 rounded-lg font-semibold hover:opacity-90 transition">
              Download Summary PDF
            </button>
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
