export default function TaxCalculator({ result }) {
  return (
    <div className="grid md:grid-cols-2 gap-6">
      {/* Old Regime */}
      <div
        className={`bg-[color:var(--lux-card)]/70 border-2 rounded-lg p-6 ${
          result.recommended === 'old' ? 'border-[color:var(--lux-accent)]/60' : 'border-[color:var(--lux-foreground-10)]'
        }`}
      >
        <h3 className="text-xl font-bold mb-4">Old Tax Regime</h3>
        <div className="space-y-2 text-[color:var(--lux-foreground-60)]">
          <div className="flex justify-between">
            <span>Gross Income:</span>
            <span className="text-[color:var(--lux-foreground)]">₹{result.income.toLocaleString('en-IN')}</span>
          </div>
          <div className="flex justify-between">
            <span>Deductions:</span>
            <span className="text-[color:var(--lux-foreground)]">₹{result.deductions.toLocaleString('en-IN')}</span>
          </div>
          <div className="flex justify-between font-bold text-[color:var(--lux-foreground)] border-t border-[color:var(--lux-foreground-10)] pt-2 mt-2">
            <span>Tax Payable:</span>
            <span className="text-2xl text-[color:var(--lux-accent)]">₹{result.oldRegime.tax.toLocaleString('en-IN')}</span>
          </div>
        </div>
        {result.recommended === 'old' && (
          <div className="mt-4 bg-[color:var(--lux-accent)]/10 border border-[color:var(--lux-accent)]/35 rounded px-3 py-2 text-sm text-[color:var(--lux-accent)]">
            ✓ Recommended
          </div>
        )}
      </div>

      {/* New Regime */}
      <div
        className={`bg-[color:var(--lux-card)]/70 border-2 rounded-lg p-6 ${
          result.recommended === 'new' ? 'border-[color:var(--lux-accent)]/60' : 'border-[color:var(--lux-foreground-10)]'
        }`}
      >
        <h3 className="text-xl font-bold mb-4">New Tax Regime</h3>
        <div className="space-y-2 text-[color:var(--lux-foreground-60)]">
          <div className="flex justify-between">
            <span>Gross Income:</span>
            <span className="text-[color:var(--lux-foreground)]">₹{result.income.toLocaleString('en-IN')}</span>
          </div>
          <div className="flex justify-between">
            <span>Deductions:</span>
            <span className="text-[color:var(--lux-foreground)]">₹0</span>
          </div>
          <div className="flex justify-between font-bold text-[color:var(--lux-foreground)] border-t border-[color:var(--lux-foreground-10)] pt-2 mt-2">
            <span>Tax Payable:</span>
            <span className="text-2xl text-[color:var(--lux-accent)]">₹{result.newRegime.tax.toLocaleString('en-IN')}</span>
          </div>
        </div>
        {result.recommended === 'new' && (
          <div className="mt-4 bg-[color:var(--lux-accent)]/10 border border-[color:var(--lux-accent)]/35 rounded px-3 py-2 text-sm text-[color:var(--lux-accent)]">
            ✓ Recommended
          </div>
        )}
      </div>

      {/* Savings */}
      <div className="md:col-span-2 bg-[color:var(--lux-accent)]/10 border border-[color:var(--lux-accent)]/35 rounded-lg p-6 text-center">
        <p className="text-[color:var(--lux-foreground-60)] mb-2">Potential Savings</p>
        <p className="text-3xl font-bold text-[color:var(--lux-accent)]">₹{result.savings.toLocaleString('en-IN')}</p>
        <p className="text-sm text-[color:var(--lux-foreground-60)] mt-2">
          by choosing {result.recommended === 'old' ? 'Old' : 'New'} Regime
        </p>
      </div>
    </div>
  );
}
