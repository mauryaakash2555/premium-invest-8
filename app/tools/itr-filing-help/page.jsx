'use client';
import { useState, useRef } from 'react';

export default function ITRFilingHelp() {
  const [pdfUrl, setPdfUrl] = useState(null);
  const [fileName, setFileName] = useState('');
  const fileInputRef = useRef(null);
  
  // Manual input fields
  const [grossSalary, setGrossSalary] = useState('');
  const [tds, setTds] = useState('');
  const [otherIncome, setOtherIncome] = useState('');
  const [deductions, setDeductions] = useState('');
  
  // Calculated values
  const [calculation, setCalculation] = useState(null);

  function handleFileChange(e) {
    const file = e.target.files?.[0];
    if (!file) return;
    
    // Create blob URL for PDF viewer
    const url = URL.createObjectURL(file);
    setPdfUrl(url);
    setFileName(file.name);
    setCalculation(null);
  }

  function formatNumber(num) {
    return num.toLocaleString('en-IN');
  }

  function parseAmount(str) {
    if (!str) return 0;
    return parseInt(str.replace(/,/g, '')) || 0;
  }

  function calculateTax() {
    const gross = parseAmount(grossSalary);
    const tdsAmount = parseAmount(tds);
    const other = parseAmount(otherIncome);
    const ded = parseAmount(deductions);
    
    const totalIncome = gross + other;
    const taxableIncome = Math.max(0, totalIncome - ded - 50000); // Standard deduction
    
    // New tax regime (simplified)
    let tax = 0;
    if (taxableIncome > 1500000) {
      tax = 150000 + (taxableIncome - 1500000) * 0.30;
    } else if (taxableIncome > 1200000) {
      tax = 60000 + (taxableIncome - 1200000) * 0.20;
    } else if (taxableIncome > 900000) {
      tax = 30000 + (taxableIncome - 900000) * 0.15;
    } else if (taxableIncome > 600000) {
      tax = 15000 + (taxableIncome - 600000) * 0.10;
    } else if (taxableIncome > 300000) {
      tax = (taxableIncome - 300000) * 0.05;
    }
    
    const cess = tax * 0.04;
    const totalTax = Math.round(tax + cess);
    const refund = tdsAmount > totalTax ? tdsAmount - totalTax : 0;
    const due = totalTax > tdsAmount ? totalTax - tdsAmount : 0;
    
    setCalculation({
      totalIncome,
      taxableIncome,
      tax: Math.round(tax),
      cess: Math.round(cess),
      totalTax,
      tds: tdsAmount,
      refund,
      due
    });
  }

  return (
    <div className="min-h-screen bg-[color:var(--lux-background)] text-[color:var(--lux-foreground)] pt-32 px-6 md:px-12 pb-16">
      <div className="max-w-6xl mx-auto">
        
        {/* Header */}
        <div className="mb-10">
          <h1 className="text-4xl md:text-5xl font-bold mb-3">Free ITR Filing Help</h1>
          <p className="text-[color:var(--lux-foreground-60)]">Upload Form 16, AIS, or Bank Interest Statement</p>
        </div>
        
        {/* Upload Zone */}
        <div className="border border-[color:var(--lux-foreground-10)] bg-[color:var(--lux-card)]/70 backdrop-blur-xl p-8 mb-8">
          <label className="block cursor-pointer">
            <div className="border-2 border-dashed border-[color:var(--lux-foreground-10)] p-10 text-center transition-colors duration-300 hover:border-[color:var(--lux-accent)]">
              <input 
                ref={fileInputRef}
                type="file" 
                accept=".pdf"
                onChange={handleFileChange}
                className="hidden"
              />
              <p className="text-lg mb-2">Click to upload PDF</p>
              <p className="text-sm text-[color:var(--lux-foreground-40)]">Form 16, AIS, or Bank Statement</p>
            </div>
          </label>
          
          {fileName && (
            <p className="mt-4 text-[color:var(--lux-accent)]">Uploaded: {fileName}</p>
          )}
        </div>

        {/* PDF Viewer + Manual Form (side by side on desktop) */}
        {pdfUrl && (
          <>
            {/* Message for scanned PDFs */}
            <div className="border border-[color:var(--lux-accent)]/30 bg-[color:var(--lux-accent)]/5 p-6 mb-8">
              <p className="text-[color:var(--lux-foreground-80)]">
                This PDF may be scanned/image-based. Please enter values manually while viewing the PDF below.
              </p>
            </div>

            <div className="grid grid-cols-1 lg:grid-cols-2 gap-8 mb-8">
              
              {/* PDF Viewer */}
              <div className="border border-[color:var(--lux-foreground-10)] bg-[color:var(--lux-card)]/70 p-4">
                <h3 className="text-xl font-semibold mb-4 text-[color:var(--lux-accent)]">Your PDF</h3>
                <object
                  data={pdfUrl}
                  type="application/pdf"
                  className="w-full h-[600px]"
                >
                  <p className="text-[color:var(--lux-foreground-60)]">
                    PDF preview not supported. 
                    <a href={pdfUrl} target="_blank" rel="noopener noreferrer" className="text-[color:var(--lux-accent)] underline ml-2">
                      Open in new tab
                    </a>
                  </p>
                </object>
              </div>

              {/* Manual Input Form */}
              <div className="border border-[color:var(--lux-foreground-10)] bg-[color:var(--lux-card)]/70 p-6">
                <h3 className="text-xl font-semibold mb-6 text-[color:var(--lux-accent)]">Enter Values Manually</h3>
                
                <div className="space-y-5">
                  <div>
                    <label className="block text-sm text-[color:var(--lux-foreground-60)] mb-2">Gross Salary (from Form 16)</label>
                    <input
                      type="text"
                      value={grossSalary}
                      onChange={(e) => setGrossSalary(e.target.value)}
                      placeholder="e.g. 12,00,000"
                      className="w-full bg-[color:var(--lux-background)] border border-[color:var(--lux-foreground-10)] p-3 text-[color:var(--lux-foreground)] placeholder:text-[color:var(--lux-foreground-40)] focus:border-[color:var(--lux-accent)] focus:outline-none transition-colors"
                    />
                  </div>
                  
                  <div>
                    <label className="block text-sm text-[color:var(--lux-foreground-60)] mb-2">TDS Deducted</label>
                    <input
                      type="text"
                      value={tds}
                      onChange={(e) => setTds(e.target.value)}
                      placeholder="e.g. 1,20,000"
                      className="w-full bg-[color:var(--lux-background)] border border-[color:var(--lux-foreground-10)] p-3 text-[color:var(--lux-foreground)] placeholder:text-[color:var(--lux-foreground-40)] focus:border-[color:var(--lux-accent)] focus:outline-none transition-colors"
                    />
                  </div>
                  
                  <div>
                    <label className="block text-sm text-[color:var(--lux-foreground-60)] mb-2">Other Income (Bank Interest, FD, etc.)</label>
                    <input
                      type="text"
                      value={otherIncome}
                      onChange={(e) => setOtherIncome(e.target.value)}
                      placeholder="e.g. 50,000"
                      className="w-full bg-[color:var(--lux-background)] border border-[color:var(--lux-foreground-10)] p-3 text-[color:var(--lux-foreground)] placeholder:text-[color:var(--lux-foreground-40)] focus:border-[color:var(--lux-accent)] focus:outline-none transition-colors"
                    />
                  </div>
                  
                  <div>
                    <label className="block text-sm text-[color:var(--lux-foreground-60)] mb-2">Deductions (80C, 80D, etc.)</label>
                    <input
                      type="text"
                      value={deductions}
                      onChange={(e) => setDeductions(e.target.value)}
                      placeholder="e.g. 1,50,000"
                      className="w-full bg-[color:var(--lux-background)] border border-[color:var(--lux-foreground-10)] p-3 text-[color:var(--lux-foreground)] placeholder:text-[color:var(--lux-foreground-40)] focus:border-[color:var(--lux-accent)] focus:outline-none transition-colors"
                    />
                  </div>
                  
                  <button
                    onClick={calculateTax}
                    className="w-full bg-[color:var(--lux-accent)] text-[color:var(--lux-background)] font-semibold py-3 mt-4 hover:opacity-90 transition-opacity"
                  >
                    Calculate Tax
                  </button>
                </div>
              </div>
            </div>
          </>
        )}

        {/* Calculation Results */}
        {calculation && (
          <div className="border border-[color:var(--lux-foreground-10)] bg-[color:var(--lux-card)]/70 p-8 mb-8">
            <h3 className="text-2xl font-semibold mb-6 text-[color:var(--lux-accent)]">Tax Calculation (New Regime)</h3>
            
            <div className="space-y-4 text-lg">
              <div className="flex justify-between border-b border-[color:var(--lux-foreground-05)] pb-3">
                <span className="text-[color:var(--lux-foreground-60)]">Total Income</span>
                <span>₹{formatNumber(calculation.totalIncome)}</span>
              </div>
              <div className="flex justify-between border-b border-[color:var(--lux-foreground-05)] pb-3">
                <span className="text-[color:var(--lux-foreground-60)]">Taxable Income (after std. deduction)</span>
                <span>₹{formatNumber(calculation.taxableIncome)}</span>
              </div>
              <div className="flex justify-between border-b border-[color:var(--lux-foreground-05)] pb-3">
                <span className="text-[color:var(--lux-foreground-60)]">Tax</span>
                <span>₹{formatNumber(calculation.tax)}</span>
              </div>
              <div className="flex justify-between border-b border-[color:var(--lux-foreground-05)] pb-3">
                <span className="text-[color:var(--lux-foreground-60)]">Cess (4%)</span>
                <span>₹{formatNumber(calculation.cess)}</span>
              </div>
              <div className="flex justify-between border-b border-[color:var(--lux-foreground-05)] pb-3">
                <span className="text-[color:var(--lux-foreground-60)]">Total Tax Liability</span>
                <span className="font-semibold">₹{formatNumber(calculation.totalTax)}</span>
              </div>
              <div className="flex justify-between border-b border-[color:var(--lux-foreground-05)] pb-3">
                <span className="text-[color:var(--lux-foreground-60)]">TDS Already Paid</span>
                <span>₹{formatNumber(calculation.tds)}</span>
              </div>
              
              {calculation.refund > 0 && (
                <div className="flex justify-between pt-3 text-green-400 text-xl font-bold">
                  <span>Expected Refund</span>
                  <span>₹{formatNumber(calculation.refund)}</span>
                </div>
              )}
              
              {calculation.due > 0 && (
                <div className="flex justify-between pt-3 text-red-400 text-xl font-bold">
                  <span>Tax Due</span>
                  <span>₹{formatNumber(calculation.due)}</span>
                </div>
              )}
            </div>
          </div>
        )}

        {/* Disclaimer */}
        <div className="border border-[color:var(--lux-foreground-10)] bg-[color:var(--lux-card)]/50 p-5 text-sm text-[color:var(--lux-foreground-40)]">
          <p>This tool provides estimates only. BM Wealth is not a CA or ERI. Final filing is your responsibility. Consult a tax professional for accurate advice.</p>
        </div>
        
      </div>
    </div>
  );
}
