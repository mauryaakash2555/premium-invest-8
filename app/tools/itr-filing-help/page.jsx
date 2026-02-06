'use client';
import { useMemo, useState } from 'react';
import UploadZone from '@/components/ITR/UploadZone';
import ExtractedFields from '@/components/ITR/ExtractedFields';
import TaxCalculator from '@/components/ITR/TaxCalculator';
import PaymentButton from '@/components/ITR/PaymentButton';
import { jsPDF } from 'jspdf';

export default function ITRFilingHelp() {
  const [step, setStep] = useState('upload'); // upload, review, payment, complete
  const [extractedData, setExtractedData] = useState(null);
  const [editedFields, setEditedFields] = useState({});
  const [taxResult, setTaxResult] = useState(null);
  const [downloadReady, setDownloadReady] = useState(false);

  const amountPaise = 29900;

  async function handleUpload(file) {
    setStep('extracting');

    const formData = new FormData();
    formData.append('file', file);

    const res = await fetch('/api/itr/extract', {
      method: 'POST',
      body: formData,
    });

    const data = await res.json();

    if (data.success) {
      setExtractedData(data);
      setEditedFields(data.fields);
      setStep('review');
    } else {
      alert('Extraction failed: ' + data.error);
      setStep('upload');
    }
  }

  function handleFieldEdit(fieldName, value) {
    setEditedFields((prev) => ({
      ...prev,
      [fieldName]: value,
    }));
  }

  function handleCalculate() {
    const result = calculateTax(editedFields);
    setTaxResult(result);
    setStep('payment');
  }

  function calculateTax(fields) {
    // Old regime vs new regime calculation
    const income = Number(fields.grossSalary || 0);
    const deductions = Number(fields.deductions || fields.deductions80C || 0);

    // Old regime
    const oldTaxableIncome = income - deductions;
    const oldTax = calculateOldRegimeTax(oldTaxableIncome);

    // New regime (no deductions, lower rates)
    const newTax = calculateNewRegimeTax(income);

    const oldRounded = Math.round(oldTax);
    const newRounded = Math.round(newTax);

    return {
      income,
      deductions,
      oldRegime: { taxableIncome: oldTaxableIncome, tax: oldRounded },
      newRegime: { taxableIncome: income, tax: newRounded },
      recommended: oldRounded < newRounded ? 'old' : 'new',
      savings: Math.abs(oldRounded - newRounded),
    };
  }

  function calculateOldRegimeTax(income) {
    // FY 2025-26 slabs
    let tax = 0;
    if (income <= 250000) tax = 0;
    else if (income <= 500000) tax = (income - 250000) * 0.05;
    else if (income <= 1000000) tax = 12500 + (income - 500000) * 0.2;
    else tax = 112500 + (income - 1000000) * 0.3;

    return tax * 1.04;
  }

  function calculateNewRegimeTax(income) {
    // FY 2025-26 new regime slabs
    let tax = 0;
    if (income <= 300000) tax = 0;
    else if (income <= 600000) tax = (income - 300000) * 0.05;
    else if (income <= 900000) tax = 15000 + (income - 600000) * 0.1;
    else if (income <= 1200000) tax = 45000 + (income - 900000) * 0.15;
    else if (income <= 1500000) tax = 90000 + (income - 1200000) * 0.2;
    else tax = 150000 + (income - 1500000) * 0.3;

    return tax * 1.04;
  }

  const pdfFilename = useMemo(() => {
    const ts = new Date().toISOString().slice(0, 10);
    return `BM_Wealth_ITR_Summary_${ts}.pdf`;
  }, []);

  function generateSummaryPdf() {
    if (!taxResult) return null;
    const doc = new jsPDF({ unit: 'pt', format: 'a4' });

    const left = 48;
    let y = 64;

    doc.setFont('helvetica', 'bold');
    doc.setFontSize(18);
    doc.text('BM Wealth — ITR Summary (Draft)', left, y);
    y += 22;

    doc.setFont('helvetica', 'normal');
    doc.setFontSize(11);
    doc.text('This is a draft summary based on your uploaded document and edits.', left, y);
    y += 18;
    doc.text('Final filing is your responsibility.', left, y);
    y += 26;

    doc.setFont('helvetica', 'bold');
    doc.text('Inputs', left, y);
    y += 18;
    doc.setFont('helvetica', 'normal');
    doc.text(`Gross Income: ₹${taxResult.income.toLocaleString('en-IN')}`, left, y);
    y += 16;
    doc.text(`Deductions: ₹${taxResult.deductions.toLocaleString('en-IN')}`, left, y);
    y += 26;

    doc.setFont('helvetica', 'bold');
    doc.text('Comparison', left, y);
    y += 18;
    doc.setFont('helvetica', 'normal');
    doc.text(
      `Old Regime Tax: ₹${taxResult.oldRegime.tax.toLocaleString('en-IN')} (Taxable: ₹${Math.max(
        0,
        Math.round(taxResult.oldRegime.taxableIncome)
      ).toLocaleString('en-IN')})`,
      left,
      y
    );
    y += 16;
    doc.text(
      `New Regime Tax: ₹${taxResult.newRegime.tax.toLocaleString('en-IN')} (Taxable: ₹${Math.max(
        0,
        Math.round(taxResult.newRegime.taxableIncome)
      ).toLocaleString('en-IN')})`,
      left,
      y
    );
    y += 18;
    doc.text(
      `Recommended: ${taxResult.recommended === 'old' ? 'Old Regime' : 'New Regime'} (Savings: ₹${taxResult.savings.toLocaleString(
        'en-IN'
      )})`,
      left,
      y
    );

    return doc;
  }

  async function handlePaymentSuccess(paymentId) {
    try {
      const doc = generateSummaryPdf();
      if (!doc) throw new Error('Failed to generate PDF');
      doc.save(pdfFilename);
      setDownloadReady(true);
      setStep('complete');
    } catch (e) {
      console.error(e);
      alert('Payment success, but PDF generation failed. Please contact support.');
      setStep('complete');
    }
  }

  return (
    <div className="min-h-screen bg-[#0a0a0a] pt-24 pb-16 px-4 text-[#ffffff]">
      <div className="max-w-6xl mx-auto">
        {/* Header */}
        <div className="mb-8">
          <h1 className="text-4xl font-bold mb-2 text-[#d4af37]">Free ITR Filing Help</h1>
          <p className="text-[#9ca3af]">Upload Form 16, AIS, or Bank Statement - Get instant tax calculation</p>
        </div>

        {/* Progress */}
        <div className="flex gap-4 mb-8">
          <div className={`flex-1 h-2 rounded ${step !== 'upload' ? 'bg-[#d4af37]' : 'bg-[#333333]'}`} />
          <div
            className={`flex-1 h-2 rounded ${
              step === 'payment' || step === 'complete' ? 'bg-[#d4af37]' : 'bg-[#333333]'
            }`}
          />
          <div className={`flex-1 h-2 rounded ${step === 'complete' ? 'bg-[#d4af37]' : 'bg-[#333333]'}`} />
        </div>

        {/* Steps */}
        {step === 'upload' && <UploadZone onUpload={handleUpload} />}

        {step === 'extracting' && (
          <div className="bg-[#1a1a1a] border border-[#333333] rounded-lg p-12 text-center">
            <div className="animate-spin w-12 h-12 border-4 border-[#d4af37] border-t-transparent rounded-full mx-auto mb-4" />
            <p className="text-[#d4af37]">Extracting data from your PDF...</p>
          </div>
        )}

        {step === 'review' && extractedData && (
          <>
            <ExtractedFields fields={editedFields} confidence={extractedData.confidence} onEdit={handleFieldEdit} />
            <button
              onClick={handleCalculate}
              className="mt-6 bg-[#d4af37] text-black px-8 py-3 rounded-lg font-semibold hover:bg-[#c4a137] transition"
            >
              Calculate Tax →
            </button>
          </>
        )}

        {step === 'payment' && taxResult && (
          <>
            <TaxCalculator result={taxResult} />
            <PaymentButton amount={amountPaise} onSuccess={handlePaymentSuccess} />
          </>
        )}

        {step === 'complete' && (
          <div className="bg-[#1a1a1a] border border-[#10b981] rounded-lg p-8 text-center">
            <div className="text-6xl mb-4">✓</div>
            <h2 className="text-2xl font-bold text-[#10b981] mb-2">Payment Successful!</h2>
            <p className="text-[#9ca3af] mb-6">Your ITR summary has been generated</p>
            <button
              onClick={() => {
                const doc = generateSummaryPdf();
                if (doc) doc.save(pdfFilename);
              }}
              className="bg-[#d4af37] text-black px-6 py-3 rounded-lg font-semibold"
            >
              Download Summary PDF
            </button>
            {!downloadReady ? null : null}
          </div>
        )}

        {/* Disclaimer */}
        <div className="mt-12 p-4 bg-[#1a1a1a] border border-[#333333] rounded-lg text-sm text-[#9ca3af]">
          ⚠️ This tool prepares a draft. BM Wealth is not a CA or ERI. Final filing is your responsibility.
        </div>
      </div>
    </div>
  );
}
