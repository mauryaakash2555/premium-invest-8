"use client";

export function CalculatorHeader({ meta, title, subtitle, pill }) {
  return (
    <div className="text-center px-6 pt-6 pb-5 lg:px-10 lg:pt-8 lg:pb-6">
      {meta ? (
        <div className="flex flex-wrap items-center justify-center gap-x-2 gap-y-1 text-[10px] tracking-[0.16em] uppercase text-white/55">
          {meta}
        </div>
      ) : null}

      <h1 className="mt-4 text-2xl lg:text-3xl font-semibold tracking-wide leading-tight text-[color:var(--color-matte-gold)]">
        {title}
      </h1>

      {pill ? (
        <div className="mt-3 inline-flex items-center gap-2 rounded-full border border-white/10 bg-white/5 px-3 py-1.5 text-[10px] text-white/75">
          {pill}
        </div>
      ) : null}

      {subtitle ? <p className="mt-3 text-sm text-white/70">{subtitle}</p> : null}
    </div>
  );
}
