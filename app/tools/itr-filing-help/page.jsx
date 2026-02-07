'use client';
import { useState } from 'react';

export default function ITRFilingHelp() {
  const [step, setStep] = useState('upload');
  const [extractedData, setExtractedData] = useState(null);
  const [fields, setFields] = useState({});
  const [taxResult, setTaxResult] = useState(null);

  async function handleUpload(file) {
    setStep('extracting');

    const formData = new FormData();
    formData.append('file', file);

    try {
      const res = await fetch('/api/itr/extract', {
        method: 'POST',
        body: formData,
      });

      const data = await res.json();

      if (data.success) {
        setExtractedData(data);
        setFields(data.fields);
        setStep('review');
      } else {
        alert('Extraction failed: ' + data.error);
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
    <div className="min-h-screen bg-[#0a0a0a] pt-24 pb-16 px-4">
      <div className="max-w-5xl mx-auto">
        <div className="mb-8">
          <h1 className="text-4xl font-bold mb-2 text-[#d4af37]">Free ITR Filing Help</h1>
          <p className="text-[#9ca3af]">Upload Form 16, AIS, or Bank Statement</p>
        </div>

        {/* Progress */}
        <div className="flex gap-4 mb-8">
          <div className={`flex-1 h-2 rounded ${step !== 'upload' ? 'bg-[#d4af37]' : 'bg-[#333333]'}`} />
          <div className={`flex-1 h-2 rounded ${step === 'payment' || step === 'complete' ? 'bg-[#d4af37]' : 'bg-[#333333]'}`} />
          <div className={`flex-1 h-2 rounded ${step === 'complete' ? 'bg-[#d4af37]' : 'bg-[#333333]'}`} />
        </div>

        {/* Upload */}
        {step === 'upload' && (
          <div className="bg-[#1a1a1a] border-2 border-dashed border-[#333333] rounded-lg p-16 text-center hover:border-[#d4af37] transition">
            <input
              type="file"
              accept=".pdf"
              onChange={(e) => e.target.files[0] && handleUpload(e.target.files[0])}
              className="hidden"
              id="file-upload"
            />
            <label htmlFor="file-upload" className="cursor-pointer block">
              <div className="text-6xl mb-4">📄</div>
              <p className="text-xl font-semibold text-[#d4af37] mb-2">Click to upload PDF</p>
              <p className="text-[#9ca3af]">Form 16, AIS, or Bank Statement</p>
            </label>
          </div>
        )}

        {/* Extracting */}
        {step === 'extracting' && (
          <div className="bg-[#1a1a1a] border border-[#333333] rounded-lg p-12 text-center">
            <div className="animate-spin w-12 h-12 border-4 border-[#d4af37] border-t-transparent rounded-full mx-auto mb-4" />
            <p className="text-[#d4af37]">Extracting data from your PDF...</p>
          </div>
        )}

        {/* Review */}
        {step === 'review' && extractedData && (
          <>
            <div className="bg-[#1a1a1a] border border-[#333333] rounded-lg p-6 mb-6">
              <div className="flex justify-between items-center mb-6">
                <h3 className="text-xl font-bold text-[#d4af37]">Extracted Fields</h3>
                <span
                  className={`px-3 py-1 rounded text-sm ${
                    extractedData.confidence > 0.9 ? 'bg-[#10b981] text-[#ffffff]' : 'bg-[#ef4444] text-[#ffffff]'
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
                    <label className="w-48 text-[#9ca3af]">{label}</label>
                    <input
                      type="number"
                      value={fields[key] || 0}
                      onChange={(e) => handleFieldChange(key, parseInt(e.target.value) || 0)}
                      className="flex-1 bg-[#0a0a0a] border border-[#333333] rounded px-4 py-2 text-[#ffffff] focus:border-[#d4af37] focus:outline-none"
                    />
                  </div>
                ))}
              </div>

              <p className="text-sm text-[#9ca3af] mt-4">ℹ️ Please verify these values before proceeding</p>
            </div>

            <button
              onClick={calculateTax}
              className="w-full bg-[#d4af37] text-[#0a0a0a] px-8 py-3 rounded-lg font-semibold hover:opacity-90 transition"
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
                className={`bg-[#1a1a1a] border-2 rounded-lg p-6 ${
                  taxResult.recommended === 'old' ? 'border-[#d4af37]' : 'border-[#333333]'
                }`}
              >
                <h3 className="text-xl font-bold mb-4 text-[#ffffff]">Old Tax Regime</h3>
                <div className="space-y-2 text-[#9ca3af]">
                  <div className="flex justify-between">
                    <span>Gross Income:</span>
                    <span className="text-[#ffffff]">₹{taxResult.income.toLocaleString('en-IN')}</span>
                  </div>
                  <div className="flex justify-between">
                    <span>Deductions:</span>
                    <span className="text-[#ffffff]">₹{taxResult.deductions.toLocaleString('en-IN')}</span>
                  </div>
                  <div className="flex justify-between font-bold text-[#ffffff] border-t border-[#333333] pt-2 mt-2">
                    <span>Tax Payable:</span>
                    <span className="text-2xl text-[#d4af37]">₹{taxResult.oldRegime.tax.toLocaleString('en-IN')}</span>
                  </div>
                </div>
                {taxResult.recommended === 'old' && (
                  <div className="mt-4 bg-[#1a1a1a] border border-[#10b981] rounded px-3 py-2 text-sm text-[#10b981]">
                    ✓ Recommended
                  </div>
                )}
              </div>

              {/* New Regime */}
              <div
                className={`bg-[#1a1a1a] border-2 rounded-lg p-6 ${
                  taxResult.recommended === 'new' ? 'border-[#d4af37]' : 'border-[#333333]'
                }`}
              >
                <h3 className="text-xl font-bold mb-4 text-[#ffffff]">New Tax Regime</h3>
                <div className="space-y-2 text-[#9ca3af]">
                  <div className="flex justify-between">
                    <span>Gross Income:</span>
                    <span className="text-[#ffffff]">₹{taxResult.income.toLocaleString('en-IN')}</span>
                  </div>
                  <div className="flex justify-between">
                    <span>Deductions:</span>
                    <span className="text-[#ffffff]">₹0</span>
                  </div>
                  <div className="flex justify-between font-bold text-[#ffffff] border-t border-[#333333] pt-2 mt-2">
                    <span>Tax Payable:</span>
                    <span className="text-2xl text-[#d4af37]">₹{taxResult.newRegime.tax.toLocaleString('en-IN')}</span>
                  </div>
                </div>
                {taxResult.recommended === 'new' && (
                  <div className="mt-4 bg-[#1a1a1a] border border-[#10b981] rounded px-3 py-2 text-sm text-[#10b981]">
                    ✓ Recommended
                  </div>
                )}
              </div>
            </div>

            {/* Savings */}
            <div className="bg-[#1a1a1a] border border-[#d4af37] rounded-lg p-6 text-center mb-6">
              <p className="text-[#9ca3af] mb-2">Potential Savings</p>
              <p className="text-3xl font-bold text-[#d4af37]">₹{taxResult.savings.toLocaleString('en-IN')}</p>
              <p className="text-sm text-[#9ca3af] mt-2">by choosing {taxResult.recommended === 'old' ? 'Old' : 'New'} Regime</p>
            </div>

            {/* Payment CTA */}
            <div className="bg-[#1a1a1a] border border-[#333333] rounded-lg p-8 text-center">
              <h3 className="text-xl font-bold mb-2 text-[#ffffff]">Get Your Full ITR Summary</h3>
              <p className="text-[#9ca3af] mb-6">Download detailed PDF report with both tax regimes</p>
              <div className="text-4xl font-bold text-[#d4af37] mb-6">₹299</div>
              <button
                onClick={() => setStep('complete')}
                className="bg-[#d4af37] text-[#0a0a0a] px-12 py-4 rounded-lg font-bold text-lg hover:opacity-90 transition"
              >
                Pay & Download Report
              </button>
              <p className="text-xs text-[#9ca3af] mt-4">Secure payment via Razorpay</p>
            </div>
          </>
        )}

        {/* Complete */}
        {step === 'complete' && (
          <div className="bg-[#1a1a1a] border border-[#10b981] rounded-lg p-8 text-center">
            <div className="text-6xl mb-4 text-[#10b981]">✓</div>
            <h2 className="text-2xl font-bold text-[#10b981] mb-2">Payment Successful!</h2>
            <p className="text-[#9ca3af] mb-6">Your ITR summary has been generated</p>
            <button className="bg-[#d4af37] text-[#0a0a0a] px-6 py-3 rounded-lg font-semibold hover:opacity-90 transition">
              Download Summary PDF
            </button>
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
