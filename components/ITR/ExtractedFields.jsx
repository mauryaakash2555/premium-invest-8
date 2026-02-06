export default function ExtractedFields({ fields, confidence, onEdit }) {
  const fieldLabels = {
    grossSalary: 'Gross Salary',
    tds: 'TDS',
    standardDeduction: 'Standard Deduction',
    deductions80C: '80C Deductions',
    deductions: 'Deductions',
  };

  const isHigh = Number(confidence) > 0.9;

  return (
    <div className="bg-[color:var(--lux-card)]/70 border border-[color:var(--lux-foreground-10)] rounded-lg p-6">
      <div className="flex justify-between items-center mb-6">
        <h3 className="text-xl font-bold text-[color:var(--lux-accent)]">Extracted Fields</h3>
        <span
          className={`px-3 py-1 rounded text-sm border ${
            isHigh
              ? 'bg-[color:var(--lux-accent)]/15 text-[color:var(--lux-accent)] border-[color:var(--lux-accent)]/35'
              : 'bg-[color:var(--lux-foreground-10)] text-[color:var(--lux-foreground-60)] border-[color:var(--lux-foreground-10)]'
          }`}
        >
          {(Number(confidence || 0) * 100).toFixed(0)}% Confidence
        </span>
      </div>

      <div className="space-y-4">
        {Object.entries(fields || {}).map(([key, value]) => (
          <div key={key} className="flex items-center gap-4">
            <label className="w-48 text-[color:var(--lux-foreground-60)]">{fieldLabels[key] || key}</label>
            <input
              type="number"
              value={Number(value) || 0}
              onChange={(e) => onEdit(key, parseInt(e.target.value, 10) || 0)}
              className="flex-1 bg-[var(--lux-background)] border border-[color:var(--lux-foreground-10)] rounded px-4 py-2 text-[color:var(--lux-foreground)] focus:border-[color:var(--lux-accent)] focus:outline-none"
            />
          </div>
        ))}
      </div>

      <p className="text-sm text-[color:var(--lux-foreground-60)] mt-4">ℹ️ Please verify these values before proceeding</p>
    </div>
  );
}
