'use client';
import { useMemo, useState } from 'react';
import Link from 'next/link';
import { getMetadataBase, SITE_NAME } from '@/lib/seo/metadata';

const LUX = {
  background: 'oklch(0.06 0.005 280)',
  foreground: 'oklch(0.95 0.01 85)',
  card: 'oklch(0.10 0.005 280)',
  muted: 'oklch(0.55 0.01 85)',
  accent: 'oklch(0.78 0.08 65)',
};

export default function ITRFilingHelp() {
  const [step, setStep] = useState('upload');
  const [extractedData, setExtractedData] = useState(null);
  const [fields, setFields] = useState({});
  const [taxResult, setTaxResult] = useState(null);

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

  async function handleUpload(file) {
    setStep('extracting');

    const formData = new FormData();
    formData.append('file', file);

    try {
      const res = await fetch('/api/itr/extract', {
        method: 'POST',
        body: formData,
      });

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
          <Link
            href="/tools"
            className="inline-flex items-center gap-2 text-sm font-semibold text-[color:var(--lux-foreground-60)] hover:text-[color:var(--lux-foreground)]"
          >
            <span aria-hidden="true">←</span>
            Back to Tools
          </Link>
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
              onChange={(e) => e.target.files[0] && handleUpload(e.target.files[0])}
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

        {/* Extracting */}
        {step === 'extracting' && (
          <div className="bg-[color:var(--lux-card)]/70 border border-[color:var(--lux-foreground-10)] rounded-lg p-12 text-center">
            <div className="animate-spin w-12 h-12 border-4 border-[color:var(--lux-accent)] border-t-transparent rounded-full mx-auto mb-4" />
            <p className="text-[color:var(--lux-foreground-60)]">Extracting data from your PDF...</p>
          </div>
        )}

        {/* Review */}
        {step === 'review' && extractedData && (
          <>
            <div className="bg-[color:var(--lux-card)]/70 border border-[color:var(--lux-foreground-10)] rounded-lg p-6 mb-6">
              <div className="flex justify-between items-center mb-6">
                <h3 className="text-xl font-bold text-[color:var(--lux-foreground)]">Extracted Fields</h3>
                <span
                  className={`px-3 py-1 rounded text-sm ${
                    extractedData.confidence > 0.9
                      ? 'bg-[color:var(--lux-foreground)] text-[color:var(--lux-background)]'
                      : 'bg-[color:var(--lux-foreground-10)] text-[color:var(--lux-foreground)]'
                  }`}
                >
                  {(extractedData.confidence * 100).toFixed(0)}% Confidence
                </span>
              </div>

              <div className="space-y-4">
                {[
                  { key: 'grossSalary', label: 'Gross Salary' },
                  { key: 'tds', label: 'TDS Deducted' },
                  { key: 'standardDeduction', label: 'Standard Deduction' },
                  { key: 'deductions80C', label: '80C Deductions' },
                ].map(({ key, label }) => (
                  <div key={key} className="flex items-center gap-4">
                    <label className="w-48 text-[color:var(--lux-foreground-60)]">{label}</label>
                    <input
                      type="number"
                      value={fields[key] || 0}
                      onChange={(e) => handleFieldChange(key, parseInt(e.target.value) || 0)}
                      className="flex-1 bg-[var(--lux-background)] border border-[color:var(--lux-foreground-10)] rounded px-4 py-2 text-[color:var(--lux-foreground)] focus:outline-none focus:ring-1 focus:ring-[color:var(--lux-accent)]"
                    />
                  </div>
                ))}
              </div>

              <p className="text-sm text-[color:var(--lux-foreground-60)] mt-4">ℹ️ Please verify these values before proceeding</p>
            </div>

            <button
              onClick={calculateTax}
              className="w-full bg-[color:var(--lux-foreground)] text-[color:var(--lux-background)] px-8 py-3 rounded-lg font-semibold hover:opacity-90 transition"
            >
              Calculate Tax →
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
