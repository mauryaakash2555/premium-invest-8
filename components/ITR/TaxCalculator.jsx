export default function TaxCalculator({ result }) {
  return (
    <div className="grid md:grid-cols-2 gap-6">
      {/* Old Regime */}
      <div
        className={`bg-[#1a1a1a] border-2 rounded-lg p-6 ${
          result.recommended === 'old' ? 'border-[#d4af37]' : 'border-[#333333]'
        }`}
      >
        <h3 className="text-xl font-bold mb-4">Old Tax Regime</h3>
        <div className="space-y-2 text-[#9ca3af]">
          <div className="flex justify-between">
            <span>Gross Income:</span>
            <span className="text-white">₹{result.income.toLocaleString('en-IN')}</span>
          </div>
          <div className="flex justify-between">
            <span>Deductions:</span>
            <span className="text-white">₹{result.deductions.toLocaleString('en-IN')}</span>
          </div>
          <div className="flex justify-between font-bold text-white border-t border-[#333333] pt-2 mt-2">
            <span>Tax Payable:</span>
            <span className="text-2xl text-[#d4af37]">₹{result.oldRegime.tax.toLocaleString('en-IN')}</span>
          </div>
        </div>
        {result.recommended === 'old' && (
          <div className="mt-4 bg-[#10b981] bg-opacity-20 border border-[#10b981] rounded px-3 py-2 text-sm text-[#10b981]">
            ✓ Recommended
          </div>
        )}
      </div>

      {/* New Regime */}
      <div
        className={`bg-[#1a1a1a] border-2 rounded-lg p-6 ${
          result.recommended === 'new' ? 'border-[#d4af37]' : 'border-[#333333]'
        }`}
      >
        <h3 className="text-xl font-bold mb-4">New Tax Regime</h3>
        <div className="space-y-2 text-[#9ca3af]">
          <div className="flex justify-between">
            <span>Gross Income:</span>
            <span className="text-white">₹{result.income.toLocaleString('en-IN')}</span>
          </div>
          <div className="flex justify-between">
            <span>Deductions:</span>
            <span className="text-white">₹0</span>
          </div>
          <div className="flex justify-between font-bold text-white border-t border-[#333333] pt-2 mt-2">
            <span>Tax Payable:</span>
            <span className="text-2xl text-[#d4af37]">₹{result.newRegime.tax.toLocaleString('en-IN')}</span>
          </div>
        </div>
        {result.recommended === 'new' && (
          <div className="mt-4 bg-[#10b981] bg-opacity-20 border border-[#10b981] rounded px-3 py-2 text-sm text-[#10b981]">
            ✓ Recommended
          </div>
        )}
      </div>

      {/* Savings */}
      <div className="md:col-span-2 bg-[#d4af37] bg-opacity-10 border border-[#d4af37] rounded-lg p-6 text-center">
        <p className="text-[#9ca3af] mb-2">Potential Savings</p>
        <p className="text-3xl font-bold text-[#d4af37]">₹{result.savings.toLocaleString('en-IN')}</p>
        <p className="text-sm text-[#9ca3af] mt-2">
          by choosing {result.recommended === 'old' ? 'Old' : 'New'} Regime
        </p>
      </div>
    </div>
  );
}
