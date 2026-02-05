"use client";

import { useMemo, useState } from "react";

const formatCurrency = (value) =>
  value.toLocaleString("en-IN", {
    style: "currency",
    currency: "INR",
    maximumFractionDigits: 0,
  });

function calculateSipValue(monthly, rate, years) {
  const monthlyRate = rate / 12 / 100;
  const months = years * 12;

  if (monthlyRate === 0) {
    return monthly * months;
  }

  return monthly * (((1 + monthlyRate) ** months - 1) / monthlyRate) * (1 + monthlyRate);
}

export default function SipCalculatorWidget({
  title = "SIP Calculator",
  subtitle,
  defaultMonthly = 5000,
  defaultRate = 12,
  defaultYears = 10,
  plans,
}) {
  const [monthly, setMonthly] = useState(defaultMonthly);
  const [rate, setRate] = useState(defaultRate);
  const [years, setYears] = useState(defaultYears);

  const estimatedValue = useMemo(() => calculateSipValue(monthly, rate, years), [monthly, rate, years]);
  const invested = monthly * 12 * years;
  const gain = estimatedValue - invested;

  return (
    <div className="space-y-6">
      <div>
        <p className="text-xs uppercase tracking-[0.2em] text-[--lux-foreground-60]">Planner</p>
        <h2 className="text-2xl font-semibold text-[--lux-foreground]">{title}</h2>
        {subtitle ? <p className="text-sm text-slate-200/80">{subtitle}</p> : null}
      </div>

      <div className="grid gap-4 lg:grid-cols-3">
        <section className="card p-4 lg:col-span-2">
          <h3 className="text-lg font-semibold text-white">Inputs</h3>
          <div className="mt-4 grid gap-4 md:grid-cols-3">
            <label className="flex flex-col gap-2 text-sm text-slate-100">
              Monthly investment
              <input
                type="number"
                min="1000"
                step="500"
                value={monthly}
                onChange={(e) => setMonthly(Number(e.target.value))}
                className="rounded-lg border border-white/10 bg-white/5 px-3 py-2 text-sm text-slate-100 outline-none transition focus:border-white/40 focus:bg-white/10"
              />
            </label>

            <label className="flex flex-col gap-2 text-sm text-slate-100">
              Expected return (p.a %)
              <input
                type="number"
                min="1"
                step="0.5"
                value={rate}
                onChange={(e) => setRate(Number(e.target.value))}
                className="rounded-lg border border-white/10 bg-white/5 px-3 py-2 text-sm text-slate-100 outline-none transition focus:border-white/40 focus:bg-white/10"
              />
            </label>

            <label className="flex flex-col gap-2 text-sm text-slate-100">
              Tenure (years)
              <input
                type="number"
                min="1"
                step="1"
                value={years}
                onChange={(e) => setYears(Number(e.target.value))}
                className="rounded-lg border border-white/10 bg-white/5 px-3 py-2 text-sm text-slate-100 outline-none transition focus:border-white/40 focus:bg-white/10"
              />
            </label>
          </div>
        </section>

        <section className="card flex flex-col gap-3 p-4">
          <h3 className="text-lg font-semibold text-white">Results</h3>
          <div className="rounded-lg border border-white/10 bg-white/5 p-3">
            <p className="text-xs text-slate-300/80">Invested amount</p>
            <p className="text-2xl font-semibold text-white">{formatCurrency(invested)}</p>
          </div>
          <div className="rounded-lg border border-white/10 bg-white/5 p-3">
            <p className="text-xs text-slate-300/80">Estimated value</p>
            <p className="text-2xl font-semibold text-emerald-200">{formatCurrency(Math.max(estimatedValue, 0))}</p>
          </div>
          <div className="rounded-lg border border-white/10 bg-white/5 p-3">
            <p className="text-xs text-slate-300/80">Estimated gain</p>
            <p className="text-2xl font-semibold text-[--lux-accent]">{formatCurrency(Math.max(gain, 0))}</p>
          </div>
        </section>
      </div>

      {Array.isArray(plans) && plans.length ? (
        <section className="card p-4">
          <div className="flex items-center justify-between">
            <h3 className="text-lg font-semibold text-white">Suggested plans</h3>
            <span className="text-xs text-slate-300/70">{plans.length} presets</span>
          </div>
          <div className="mt-3 grid gap-3 sm:grid-cols-2 lg:grid-cols-3">
            {plans.map((plan) => (
              <button
                key={plan.id}
                type="button"
                onClick={() => {
                  setMonthly(plan.monthly);
                  setRate(plan.rate);
                  setYears(plan.years);
                }}
                className="card flex flex-col gap-1 border border-white/5 bg-white/5 p-3 text-left transition hover:border-white/30 hover:bg-white/10"
              >
                <div className="text-sm font-semibold text-white">{plan.label}</div>
                <div className="text-xs text-slate-300">
                  ₹{plan.monthly.toLocaleString("en-IN")} · {plan.rate}% · {plan.years}y
                </div>
              </button>
            ))}
          </div>
        </section>
      ) : null}
    </div>
  );
}
