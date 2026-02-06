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
    <div className="bg-[#1a1a1a] border border-[#333333] rounded-lg p-6">
      <div className="flex justify-between items-center mb-6">
        <h3 className="text-xl font-bold text-[#d4af37]">Extracted Fields</h3>
        <span
          className={`px-3 py-1 rounded text-sm ${
            isHigh ? 'bg-[#10b981] text-white' : 'bg-[#ef4444] text-white'
          }`}
        >
          {(Number(confidence || 0) * 100).toFixed(0)}% Confidence
        </span>
      </div>

      <div className="space-y-4">
        {Object.entries(fields || {}).map(([key, value]) => (
          <div key={key} className="flex items-center gap-4">
            <label className="w-48 text-[#9ca3af]">{fieldLabels[key] || key}</label>
            <input
              type="number"
              value={Number(value) || 0}
              onChange={(e) => onEdit(key, parseInt(e.target.value, 10) || 0)}
              className="flex-1 bg-[#0a0a0a] border border-[#333333] rounded px-4 py-2 text-white focus:border-[#d4af37] focus:outline-none"
            />
          </div>
        ))}
      </div>

      <p className="text-sm text-[#9ca3af] mt-4">ℹ️ Please verify these values before proceeding</p>
    </div>
  );
}
