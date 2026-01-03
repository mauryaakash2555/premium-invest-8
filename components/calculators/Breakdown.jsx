"use client";

/**
 * Generic breakdown panel for calculators.
 * Caller provides already-formatted strings.
 */
export function Breakdown({
  label,
  fiscalYear = null,
  context = null,
  sections = [],
}) {
  return (
    <div className="rounded-xl border border-white/10 bg-white/5 p-4">
      <div className="flex items-center justify-between">
        <div className="text-sm font-semibold text-white">Calculation Breakdown (Audit View)</div>
        {fiscalYear ? <div className="text-xs text-slate-200/60">{fiscalYear}</div> : null}
      </div>
      {label ? <div className="mt-1 text-[11px] text-slate-200/60">{label}</div> : null}
      {context ? <div className="mt-1 text-[11px] text-slate-200/60">{context}</div> : null}

      <div className="mt-3 grid gap-4 text-xs text-slate-100">
        {sections.map((section) => (
          <div key={section.title} className="border-t border-white/10 pt-2">
            <div className="text-[11px] uppercase tracking-[0.18em] text-slate-200/60">{section.title}</div>
            <div className="mt-2 space-y-1">
              {section.rows.map((row) => (
                <div
                  key={row.label}
                  className={
                    "flex justify-between " +
                    (row.emphasis ? "font-semibold text-white" : "text-slate-200/70")
                  }
                >
                  <span>{row.label}</span>
                  <span className={row.accent ? "text-[color:var(--color-matte-gold)]" : undefined}>{row.value}</span>
                </div>
              ))}
            </div>
          </div>
        ))}
      </div>
    </div>
  );
}
