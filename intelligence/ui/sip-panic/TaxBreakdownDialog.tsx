"use client";

import { Dialog, DialogContent, DialogHeader, DialogTitle } from "@/components/ui/dialog";

import type { SIPSimulationResult } from "@/intelligence/simulations/sip-vs-panic";

const inr0 = new Intl.NumberFormat("en-IN", {
  style: "currency",
  currency: "INR",
  maximumFractionDigits: 0,
});

function formatInr0(amount: number): string {
  const v = Number.isFinite(amount) ? amount : 0;
  return inr0.format(Math.max(0, v));
}

export function TaxBreakdownDialog(props: {
  open: boolean;
  onClose: () => void;
  row: SIPSimulationResult;
}) {
  const { open, onClose, row } = props;

  const breakdown = row.taxBreakdown;
  const method = breakdown?.method ?? "engine_default";
  const category = breakdown?.category ?? "ltcg";
  const capitalGain = breakdown?.capitalGain ?? row.absoluteGains ?? 0;

  const proceeds = breakdown?.proceeds ?? row.finalCorpus;
  const costBasis = breakdown?.costBasis ?? row.totalInvested;

  const exemptionApplied = breakdown?.ltcgExemptionApplied ?? 0;
  const taxableGains = breakdown?.taxableGains ?? Math.max(0, capitalGain - exemptionApplied);

  const baseRate = typeof breakdown?.baseRate === "number" ? Math.max(0, breakdown.baseRate) : 0;
  const baseTax = breakdown?.baseTax ?? taxableGains * baseRate;

  const surchargeRate = breakdown?.surchargeRate ?? 0;
  const surcharge = breakdown?.surcharge ?? baseTax * surchargeRate;

  const cessRate = breakdown?.cessRate ?? 0;
  const cess = breakdown?.cess ?? (baseTax + surcharge) * cessRate;

  const totalTax = breakdown?.totalTax ?? row.taxPaid ?? 0;
  const afterTaxCorpus = row.postTaxCorpus;

  const headline =
    method === "stcg_30_flat"
      ? "STCG (30% flat)"
      : method === "ltcg_20_indexation"
        ? "LTCG (20% with indexation)"
        : category === "stcg"
          ? "STCG"
          : category === "slab"
            ? "Slab"
            : "LTCG";

  return (
    <Dialog open={open} onOpenChange={(v: boolean) => (!v ? onClose() : undefined)}>
      <DialogContent className="max-w-lg border border-white/10 bg-black/95 text-white">
        <DialogHeader>
          <DialogTitle className="text-base font-semibold gold-gradient-text">Tax breakdown</DialogTitle>
        </DialogHeader>

        <div className="text-xs text-white/70">
          <div className="font-semibold text-white/85">{headline} calculation (education-only)</div>
          <div className="mt-1">This explains how the simulator arrived at the tax paid figure.</div>
        </div>

        <div className="mt-4 rounded-xl border border-white/10 bg-black/35 p-3 text-sm">
          <div className="flex items-center justify-between gap-4">
            <span className="text-white/65">Scenario</span>
            <span className="font-semibold text-white/90">{row.scenario.name}</span>
          </div>
          <div className="mt-2 grid grid-cols-1 gap-2 text-[13px]">
            <div className="flex items-center justify-between gap-4">
              <span className="text-white/65">Proceeds</span>
              <span className="font-semibold tabular-nums">{formatInr0(proceeds)}</span>
            </div>
            <div className="flex items-center justify-between gap-4">
              <span className="text-white/65">Cost basis</span>
              <span className="font-semibold tabular-nums">{formatInr0(costBasis)}</span>
            </div>
            <div className="flex items-center justify-between gap-4">
              <span className="text-white/65">Capital gain</span>
              <span className="font-semibold tabular-nums">{formatInr0(Math.max(0, capitalGain))}</span>
            </div>

            {category === "ltcg" && exemptionApplied > 0 ? (
              <div className="flex items-center justify-between gap-4">
                <span className="text-white/65">Less LTCG exemption</span>
                <span className="font-semibold tabular-nums">{formatInr0(exemptionApplied)}</span>
              </div>
            ) : null}

            <div className="my-1 h-px bg-white/10" />

            <div className="flex items-center justify-between gap-4">
              <span className="text-white/65">Taxable gains</span>
              <span className="font-semibold tabular-nums">{formatInr0(taxableGains)}</span>
            </div>
            {Number.isFinite(baseRate) && baseRate > 0 ? (
              <div className="flex items-center justify-between gap-4">
                <span className="text-white/65">Base tax @ {(baseRate * 100).toFixed(1)}%</span>
                <span className="font-semibold tabular-nums">{formatInr0(baseTax)}</span>
              </div>
            ) : null}
            {surchargeRate > 0 ? (
              <div className="flex items-center justify-between gap-4">
                <span className="text-white/65">Surcharge ({(surchargeRate * 100).toFixed(0)}%)</span>
                <span className="font-semibold tabular-nums">{formatInr0(surcharge)}</span>
              </div>
            ) : null}
            {cessRate > 0 ? (
              <div className="flex items-center justify-between gap-4">
                <span className="text-white/65">Cess ({(cessRate * 100).toFixed(0)}%)</span>
                <span className="font-semibold tabular-nums">{formatInr0(cess)}</span>
              </div>
            ) : null}

            <div className="my-1 h-px bg-white/10" />

            <div className="flex items-center justify-between gap-4">
              <span className="text-white/65">Total tax (simulated)</span>
              <span className="font-semibold tabular-nums">{formatInr0(totalTax)}</span>
            </div>
            <div className="flex items-center justify-between gap-4">
              <span className="text-white/65">After-tax corpus</span>
              <span className="font-semibold tabular-nums">{formatInr0(afterTaxCorpus)}</span>
            </div>
          </div>
        </div>

        <div className="text-[11px] text-white/65">
          Education-only math: tax rules vary by instrument, holding period, exemptions, and law changes.
        </div>
      </DialogContent>
    </Dialog>
  );
}
