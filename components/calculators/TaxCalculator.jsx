"use client";

import { useEffect, useMemo, useRef, useState } from "react";
import Image from "next/image";

import { Slider } from "@/components/ui/slider";

import { LeadCaptureModal } from "@/components/shared/LeadCaptureModal";
import { ExitIntentModal } from "@/components/shared/ExitIntentModal";

import { BaseCalculatorLayout } from "@/components/calculators/BaseCalculatorLayout";
import { CalculatorHeader } from "@/components/calculators/CalculatorHeader";
import { Breakdown as BreakdownPanel } from "@/components/calculators/Breakdown";
import { PremiumCalculatorCTA } from "@/components/calculators/PremiumCalculatorCTA";

import { AnimatedCounter } from "@/components/shared/AnimatedCounter";

import { useCalculatorTracking } from "@/lib/hooks/useCalculatorTracking";
import { compareRegimesFY2526, formatINR } from "@/lib/tax-formulas";

const RAZORPAY_SDK_SRC = "https://checkout.razorpay.com/v1/checkout.js";
let razorpaySdkPromise = null;

function loadRazorpaySdk() {
  if (typeof window === "undefined") return Promise.resolve(false);
  if (window.Razorpay) return Promise.resolve(true);
  if (razorpaySdkPromise) return razorpaySdkPromise;

  razorpaySdkPromise = new Promise((resolve) => {
    try {
      const existing = document.querySelector(`script[src="${RAZORPAY_SDK_SRC}"]`);
      if (existing) {
        existing.addEventListener("load", () => resolve(Boolean(window.Razorpay)), { once: true });
        existing.addEventListener("error", () => resolve(false), { once: true });
        return;
      }

      const script = document.createElement("script");
      script.src = RAZORPAY_SDK_SRC;
      script.async = true;
      script.onload = () => resolve(Boolean(window.Razorpay));
      script.onerror = () => resolve(false);
      document.head.appendChild(script);
    } catch {
      resolve(false);
    }
  });

  return razorpaySdkPromise;
}

function clamp(n, min, max) {
  const x = Number(n);
  if (!Number.isFinite(x)) return min;
  return Math.min(max, Math.max(min, x));
}

function downloadBlob(filename, blob) {
  const url = URL.createObjectURL(blob);
  const a = document.createElement("a");
  a.href = url;
  a.download = filename;
  document.body.appendChild(a);
  a.click();
  a.remove();
  setTimeout(() => URL.revokeObjectURL(url), 1500);
}

function formatLakhs(valueInINR) {
  const n = Number(valueInINR);
  if (!Number.isFinite(n) || n <= 0) return "0";
  if (n >= 10_000_000) {
    const cr = n / 10_000_000;
    const s = cr.toFixed(cr >= 10 ? 1 : 2);
    return `${s.replace(/\.0+$/, "").replace(/(\.[1-9])0$/, "$1")}Cr`;
  }
  const l = n / 100_000;
  const s = l.toFixed(l >= 10 ? 0 : 1);
  return `${s.replace(/\.0$/, "")}L`;
}

function useCountUp(value, durationMs, key) {
  const [display, setDisplay] = useState(value);
  useEffect(() => {
    let raf;
    const start = performance.now();
    const from = display;
    const to = value;
    const dur = Math.max(350, Math.min(650, durationMs || 500));

    function step(t) {
      const p = Math.min(1, (t - start) / dur);
      const eased = 1 - Math.pow(1 - p, 3);
      const val = Math.round(from + (to - from) * eased);
      setDisplay(val);
      if (p < 1) raf = requestAnimationFrame(step);
    }

    raf = requestAnimationFrame(step);
    return () => raf && cancelAnimationFrame(raf);
  }, [key]);
  return display;
}

export function TaxCalculator() {
  const { track } = useCalculatorTracking("tax_optimization");

  const COMPLIANCE_FOOTER = "BM Wealth | ARN 90008 | Educational tax comparison.\n   Not investment or tax advice.";

  const [salary, setSalary] = useState(25_00_000);
  const [i80c, setI80c] = useState(1_20_000);
  const [i80d, setI80d] = useState(50_000);
  const [hra, setHra] = useState(0);
  const [rentPaid, setRentPaid] = useState(0);
  const [basicSalary, setBasicSalary] = useState(0);
  const [homeLoanInterest, setHomeLoanInterest] = useState(0);
  const [nps80ccd1b, setNps80ccd1b] = useState(0);

  const [leadOpen, setLeadOpen] = useState(false);
  const [statusNote, setStatusNote] = useState("");
  const [showBreakdown, setShowBreakdown] = useState(false);
  const [busy, setBusy] = useState(false);
  const [exitOpen, setExitOpen] = useState(false);

  const [showResults, setShowResults] = useState(false);
  const [showPremium, setShowPremium] = useState(false);

  const leadIdRef = useRef(null);

  const resultsRef = useRef(null);
  const startedRef = useRef(false);
  const purchaseRef = useRef(false);
  const calcCompleteRef = useRef(false);
  const armedRef = useRef(false);

  useEffect(() => {
    track("calculator_view");
  }, []);

  useEffect(() => {
    try {
      purchaseRef.current = Boolean(localStorage.getItem("tax_premium_bought"));
    } catch {}
  }, []);

  const draftInputs = useMemo(
    () => ({
      annualSalary: salary,
      deduction80C: i80c,
      deduction80D: i80d,
      hraReceived: hra,
      rentPaid,
      basicSalary,
      homeLoanInterest,
      nps80ccd1b,
    }),
    [salary, i80c, i80d, hra, rentPaid, basicSalary, homeLoanInterest, nps80ccd1b]
  );

  const [inputs, setInputs] = useState(null);
  const comparison = useMemo(() => (inputs ? compareRegimesFY2526(inputs) : null), [inputs]);

  const oldTax = comparison?.old?.taxAmount || 0;
  const newTax = comparison?.new?.taxAmount || 0;
  const winner = comparison?.winner || "tie";
  const savings = comparison?.savings || 0;

  useEffect(() => {
    if (startedRef.current && !calcCompleteRef.current && comparison) {
      calcCompleteRef.current = true;
      armedRef.current = true;
      track("calculator_complete");
    }
  }, [comparison]);

  function markStarted() {
    if (startedRef.current) return;
    startedRef.current = true;
    track("calculator_start");
  }

  async function handleCalculate() {
    markStarted();
    setBusy(true);
    try {
      await new Promise((r) => setTimeout(r, 40));
      setInputs(draftInputs);
      setShowResults(true);
      setShowPremium(true);
      track("calculator_calculate");

      setTimeout(() => {
        try {
          const el = resultsRef.current;
          if (el) {
            const y = el.getBoundingClientRect().top + window.scrollY - 96;
            window.scrollTo({ top: Math.max(0, y), behavior: "smooth" });
          }
        } catch {}
      }, 80);
    } finally {
      setBusy(false);
    }
  }

  async function handleFree(payload) {
    track("lead_submit_free");
    setStatusNote("");

    if (!comparison) {
      throw new Error("Please click Calculate first, then email your summary.");
    }

    setStatusNote("Sending your summary...");
    const res = await fetch("/api/leads/capture", {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ ...payload, source: "tax_optimization" }),
    });
    const json = await res.json().catch(() => null);
    if (!res.ok || !json?.ok) {
      throw new Error("Could not save your details. Please try again.");
    }

    if (json?.leadId) leadIdRef.current = String(json.leadId);

    track("lead_captured", { mode: "free", leadId: leadIdRef.current || undefined });
    setStatusNote("Thanks! We'll email you a summary shortly.");
  }

  async function handlePay(payload) {
    track("lead_submit_pay");
    setStatusNote("");

    if (!inputs) {
      throw new Error("Please click Calculate first, then unlock premium.");
    }

    const leadRes = await fetch("/api/leads/capture", {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ ...payload, source: "tax_optimization" }),
    });
    const leadJson = await leadRes.json().catch(() => null);
    if (!leadRes.ok || !leadJson?.ok) {
      throw new Error("Could not save your details. Please try again.");
    }

    const leadId = leadJson?.leadId || null;
    if (leadId) leadIdRef.current = String(leadId);

    setStatusNote("Starting payment...");
    track("payment_start", { leadId: leadIdRef.current || undefined });

    const orderRes = await fetch("/api/razorpay/create-order", {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ amountPaise: 29900, leadId, receiptPrefix: "tax" }),
    });
    const orderJson = await orderRes.json().catch(() => null);
    if (!orderRes.ok || !orderJson?.ok) {
      track("payment_failed", { stage: "create_order" });
      if (orderJson?.error === "razorpay_not_configured") {
        throw new Error(
          "Razorpay is not configured yet. Set RAZORPAY_KEY_ID and RAZORPAY_KEY_SECRET (Test Mode keys) on the server, then retry."
        );
      }
      const msg = typeof orderJson?.error === "string" ? orderJson.error.trim() : "";
      if (msg === "razorpay_request_failed") {
        throw new Error("Payment provider is temporarily unreachable. Please try again.");
      }
      if (msg === "server_error") {
        throw new Error("Payment server error. Please retry in a moment.");
      }
      if (msg) throw new Error(`Payment could not be started: ${msg}`);
      throw new Error("Payment could not be started. Please try again.");
    }

    if (!orderJson?.keyId || !orderJson?.orderId) {
      track("payment_failed", { stage: "create_order_invalid" });
      throw new Error("Payment server returned an invalid response. Please try again.");
    }

    const sdkOk = await loadRazorpaySdk();
    if (!sdkOk) {
      track("payment_failed", { stage: "sdk_load_failed" });
      throw new Error("Payment system could not be loaded. Please disable blockers or try again.");
    }

    const options = {
      key: orderJson.keyId,
      amount: orderJson.amount,
      currency: orderJson.currency || "INR",
      name: "BM Wealth",
      description: `Tax Optimization - Save ${formatINR(savings)}`,
      order_id: orderJson.orderId,
      notes: {
        annual_salary: String(inputs?.annualSalary ?? ""),
        savings: String(savings ?? ""),
        winner: String(winner ?? ""),
      },
      prefill: {
        name: payload?.name || "",
        email: payload?.email || "",
        contact: payload?.phone || "",
      },
      theme: { color: "#C0A062" },
      modal: {
        ondismiss: () => {
          track("payment_cancelled");
          setStatusNote("Payment cancelled. You can try again anytime.");
        },
      },
      handler: async (response) => {
        try {
          const verifyRes = await fetch("/api/razorpay/verify", {
            method: "POST",
            headers: { "Content-Type": "application/json" },
            body: JSON.stringify({
              ...response,
              leadId: leadIdRef.current || null,
              lead: payload,
              inputs,
            }),
          });
          const verifyJson = await verifyRes.json().catch(() => null);
          if (!verifyRes.ok || !verifyJson?.ok) {
            track("payment_failed", { stage: "verify" });
            setStatusNote("Payment verification failed. Please contact support.");
            return;
          }

          const emailStatus = String(verifyJson?.emailStatus || "").trim();
          if (emailStatus && emailStatus !== "sent") {
            if (emailStatus === "not_configured") {
              setStatusNote("Payment successful, but email delivery is not configured yet. Downloading your PDF now.");
            } else if (emailStatus === "failed") {
              setStatusNote("Payment successful, but we could not email your PDF. Downloading it now.");
            }
          }

          track("payment_success", { leadId: leadIdRef.current || undefined });
          track("purchase", { leadId: leadIdRef.current || undefined, product: "tax_optimization_blueprint", amount: 299, currency: "INR" });
          if (emailStatus === "sent") {
            setStatusNote("Payment successful. Email sent. Preparing your PDF...");
          } else {
            setStatusNote("Payment successful. Preparing your PDF...");
          }
          try {
            localStorage.setItem("tax_premium_bought", "1");
            purchaseRef.current = true;
          } catch {}

          const pdfRes = await fetch("/api/pdf/generate", {
            method: "POST",
            headers: { "Content-Type": "application/json" },
            body: JSON.stringify({ lead: payload, inputs }),
          });
          if (!pdfRes.ok) {
            setStatusNote("Payment successful, but PDF generation failed. We'll email it shortly.");
            return;
          }
          const blob = await pdfRes.blob();
          downloadBlob("BM-Wealth-Tax-Optimization-Roadmap-FY2025-26.pdf", blob);
          track("pdf_downloaded");
          setStatusNote("Downloaded. Please also check your email.");
        } catch {
          track("payment_failed", { stage: "post_payment" });
          setStatusNote("Payment was received but processing failed. We'll email you shortly.");
        }
      },
    };

    const rz = new window.Razorpay(options);
    rz.on("payment.failed", () => {
      track("payment_failed", { stage: "payment_failed" });
      setStatusNote("Payment failed. Please try again.");
    });

    setLeadOpen(false);
    rz.open();
  }

  useEffect(() => {
    const shownKey = "tax_exit_intent_shown";
    const suppressKey = "tax_exit_intent_suppress";

    function alreadyShown() {
      try {
        return sessionStorage.getItem(shownKey) === "1";
      } catch {
        return false;
      }
    }

    function suppressed() {
      try {
        return sessionStorage.getItem(suppressKey) === "1";
      } catch {
        return false;
      }
    }

    function markShown() {
      try {
        sessionStorage.setItem(shownKey, "1");
      } catch {}
    }

    function canShow() {
      return armedRef.current && !purchaseRef.current && !alreadyShown() && !suppressed();
    }

    function showExit() {
      if (!canShow()) return;
      setExitOpen(true);
      markShown();
      track("exit_intent_shown");
    }

    function onMouseLeave(e) {
      if (window.innerWidth < 900) return;
      if (e.clientY <= 0) showExit();
    }

    let pushed = false;
    function pushStateOnce() {
      try {
        history.pushState({ x: Date.now() }, "");
        pushed = true;
      } catch {}
    }

    function onPopState() {
      if (window.innerWidth >= 900) return;
      showExit();
      try {
        history.pushState({ x: Date.now() }, "");
      } catch {}
    }

    let lastScrollY = window.scrollY;
    function onScroll() {
      if (window.innerWidth >= 900) return;
      const y = window.scrollY;
      const goingUp = y < lastScrollY;
      lastScrollY = y;
      if (armedRef.current && goingUp && y < 90) showExit();
    }

    let lastActive = Date.now();
    const INACTIVE_MS = 30000;
    function markActive() {
      lastActive = Date.now();
    }

    const inactivityInterval = setInterval(() => {
      if (window.innerWidth >= 900) return;
      if (armedRef.current && Date.now() - lastActive > INACTIVE_MS) {
        showExit();
      }
    }, 3000);

    window.addEventListener("mouseout", onMouseLeave);
    window.addEventListener("mousemove", markActive, { passive: true });
    window.addEventListener("touchstart", markActive, { passive: true });
    window.addEventListener("scroll", onScroll, { passive: true });
    pushStateOnce();
    window.addEventListener("popstate", onPopState);

    return () => {
      window.removeEventListener("mouseout", onMouseLeave);
      window.removeEventListener("mousemove", markActive);
      window.removeEventListener("touchstart", markActive);
      window.removeEventListener("scroll", onScroll);
      clearInterval(inactivityInterval);
      if (pushed) window.removeEventListener("popstate", onPopState);
    };
  }, []);

  const oldWins = winner === "old";
  const newWins = winner === "new";
  const savingsLakhs = formatLakhs(savings);

  const oldTaxDisplay = useCountUp(oldTax, 650, showResults ? `old-${oldTax}` : "old-init");
  const newTaxDisplay = useCountUp(newTax, 650, showResults ? `new-${newTax}` : "new-init");

  function getBreakdownModel(label, data) {
    const slabRows = data?.slabBreakdown || [];
    const isOld = data?.regime === "old";

    const dStandard = Number(data?.standardDeduction || 0);
    const d80c = Number(data?.deductions?.section80C || 0);
    const d80d = Number(data?.deductions?.section80D || 0);
    const dHra = Number(data?.deductions?.hraExempt || 0);
    const dHome = Number(data?.deductions?.homeLoanInterest || 0);
    const dNps = Number(data?.deductions?.nps80ccd1b || 0);

    const deductionItems = isOld
      ? [
          { k: "Standard deduction", v: dStandard },
          { k: "Section 80C (cap)", v: d80c },
          { k: "Section 80D (cap)", v: d80d },
          { k: "HRA exemption (Mumbai; requires HRA + rent)", v: dHra },
          { k: "Home loan interest (Section 24; cap)", v: dHome },
          { k: "NPS 80CCD(1B) (cap)", v: dNps },
        ]
      : [{ k: "Standard deduction", v: dStandard }];

    const visibleDeductionsTotal = deductionItems.reduce((acc, it) => acc + (Number(it.v) || 0), 0);
    const showZeroTaxNote = (data?.taxAmount || 0) === 0;
    const context = showZeroTaxNote
      ? "₹0 is typically due to Section 87A rebate (subject to taxable income threshold)."
      : null;

    return {
      label,
      fiscalYear: "FY 2025–26",
      context,
      sections: [
        {
          title: "Summary",
          rows: [
            {
              label: "Taxable income",
              value: formatINR(data?.taxableIncome || 0),
              accent: true,
            },
          ],
        },
        {
          title: "Deductions",
          rows: [
            ...deductionItems.map((it) => ({
              label: it.k,
              value: formatINR(it.v || 0),
            })),
            {
              label: "Total deductions (sum above)",
              value: formatINR(visibleDeductionsTotal),
              emphasis: true,
              accent: true,
            },
          ],
        },
        {
          title: "Slabs",
          rows: slabRows.map((r, idx) => ({
            label:
              r.to == null
                ? `${idx + 1}. ${formatINR(r.from)}+ @ ${(r.rate * 100).toFixed(0)}%`
                : `${idx + 1}. ${formatINR(r.from)}–${formatINR(r.to)} @ ${(r.rate * 100).toFixed(0)}%`,
            value: formatINR(r.tax || 0),
          })),
        },
        {
          title: "Totals",
          rows: [
            {
              label: "Tax (before rebate)",
              value: formatINR(data?.taxBeforeRebate || 0),
            },
            {
              label: "Tax (after rebate)",
              value: formatINR(data?.taxAfterRebate || 0),
            },
            ...(data?.regime === "new" && (data?.marginalRelief || 0) > 0
              ? [
                  {
                    label: "Marginal relief",
                    value: `-${formatINR(data?.marginalRelief || 0)}`,
                  },
                ]
              : []),
            {
              label: "Surcharge",
              value: formatINR(data?.surcharge || 0),
            },
            ...(Number(data?.surchargeMarginalRelief || 0) > 0
              ? [
                  {
                    label: "Surcharge marginal relief",
                    value: `-${formatINR(data?.surchargeMarginalRelief || 0)}`,
                  },
                ]
              : []),
            {
              label: "Health & education cess (4%)",
              value: formatINR(data?.cess || 0),
            },
            {
              label: "Total tax",
              value: formatINR(data?.taxAmount || 0),
              emphasis: true,
              accent: true,
            },
          ],
        },
      ],
    };
  }

  return (
    <>
      <BaseCalculatorLayout
        header={
          <CalculatorHeader
            meta={
              <>
                <Image src="/logo.webp" alt="BM Wealth" width={20} height={20} className="h-5 w-auto" priority />
                <span>BM Wealth</span>
                <span className="text-white/25">•</span>
                <span>BM Wealth Calculator</span>
                <span className="text-white/25">•</span>
                <span className="text-white/45">ARN 90008 | IRDAI 277925</span>
              </>
            }
            title="Tax Optimization Intelligence — FY 2025-26"
            subtitle="Compare Old vs New regime, then unlock a 10-point optimization blueprint."
          />
        }
        disclaimer={<span className="whitespace-pre-line">{COMPLIANCE_FOOTER}</span>}
      >
        <div className="px-6 pb-6 lg:px-10 lg:pb-10">
          <div className="space-y-8 lg:space-y-0 lg:grid lg:grid-cols-2 lg:gap-10">
            <div className="space-y-6">
              <div className="rounded-xl border border-white/10 bg-white/5 p-4">
                <div className="text-sm font-semibold text-white">Inputs</div>
                <div className="mt-3 grid gap-4">
                  <div className="grid gap-1">
                    <div className="flex justify-between text-xs text-slate-200/70">
                      <span>Annual Salary</span>
                      <span className="text-[color:var(--color-matte-gold)]">{formatINR(salary)}</span>
                    </div>
                    <Slider
                      value={[salary]}
                      min={0}
                      max={10_00_00_000}
                      step={50_000}
                      onValueChange={(v) => {
                        markStarted();
                        setSalary(v?.[0] ?? 0);
                      }}
                    />
                  </div>

                  <div className="grid gap-1">
                    <div className="flex justify-between text-xs text-slate-200/70">
                      <span>80C Investments</span>
                      <span className="text-[color:var(--color-matte-gold)]">{formatINR(i80c)}</span>
                    </div>
                    <Slider
                      value={[i80c]}
                      min={0}
                      max={1_50_000}
                      step={1_000}
                      onValueChange={(v) => {
                        markStarted();
                        setI80c(v?.[0] ?? 0);
                      }}
                    />
                  </div>

                  <div className="grid gap-1">
                    <div className="flex justify-between text-xs text-slate-200/70">
                      <span>80D Health Insurance</span>
                      <span className="text-[color:var(--color-matte-gold)]">{formatINR(i80d)}</span>
                    </div>
                    <Slider
                      value={[i80d]}
                      min={0}
                      max={1_00_000}
                      step={1_000}
                      onValueChange={(v) => {
                        markStarted();
                        setI80d(v?.[0] ?? 0);
                      }}
                    />
                  </div>

                  <div className="grid gap-1">
                    <div className="flex justify-between text-xs text-slate-200/70">
                      <span>Home Loan Interest (Section 24)</span>
                      <span className="text-[color:var(--color-matte-gold)]">{formatINR(homeLoanInterest)}</span>
                    </div>
                    <Slider
                      value={[homeLoanInterest]}
                      min={0}
                      max={2_00_000}
                      step={1_000}
                      onValueChange={(v) => {
                        markStarted();
                        setHomeLoanInterest(v?.[0] ?? 0);
                      }}
                    />
                  </div>

                  <div className="grid gap-1">
                    <div className="flex justify-between text-xs text-slate-200/70">
                      <span>NPS (80CCD(1B))</span>
                      <span className="text-[color:var(--color-matte-gold)]">{formatINR(nps80ccd1b)}</span>
                    </div>
                    <Slider
                      value={[nps80ccd1b]}
                      min={0}
                      max={50_000}
                      step={500}
                      onValueChange={(v) => {
                        markStarted();
                        setNps80ccd1b(v?.[0] ?? 0);
                      }}
                    />
                  </div>

                  <div className="grid gap-2 pt-2 border-t border-white/10">
                    <div className="text-xs text-slate-200/70">HRA Details (for accurate exemption)</div>
                    <div className="grid gap-3 sm:grid-cols-2">
                      <input
                        type="text"
                        placeholder="HRA received (annual)"
                        value={hra ? String(hra) : ""}
                        onChange={(e) => {
                          markStarted();
                          const raw = String(e.target.value || "").replace(/[^\d]/g, "");
                          setHra(clamp(Number(raw || 0), 0, 10_00_00_000));
                        }}
                        className="w-full rounded-xl bg-white/5 border border-white/10 px-4 py-3 text-[color:var(--color-matte-gold)] placeholder:text-slate-200/40 transition-colors hover:bg-white/10 hover:border-white/20 focus:outline-none focus:ring-1 focus:ring-[color:var(--color-matte-gold)]"
                      />
                      <input
                        type="text"
                        placeholder="Rent paid (annual)"
                        value={rentPaid ? String(rentPaid) : ""}
                        onChange={(e) => {
                          markStarted();
                          const raw = String(e.target.value || "").replace(/[^\d]/g, "");
                          setRentPaid(clamp(Number(raw || 0), 0, 10_00_00_000));
                        }}
                        className="w-full rounded-xl bg-white/5 border border-white/10 px-4 py-3 text-[color:var(--color-matte-gold)] placeholder:text-slate-200/40 transition-colors hover:bg-white/10 hover:border-white/20 focus:outline-none focus:ring-1 focus:ring-[color:var(--color-matte-gold)]"
                      />
                    </div>
                    <input
                      type="text"
                      placeholder="Basic salary (annual) — optional"
                      value={basicSalary ? String(basicSalary) : ""}
                      onChange={(e) => {
                        markStarted();
                        const raw = String(e.target.value || "").replace(/[^\d]/g, "");
                        setBasicSalary(clamp(Number(raw || 0), 0, 10_00_00_000));
                      }}
                      className="w-full rounded-xl bg-white/5 border border-white/10 px-4 py-3 text-[color:var(--color-matte-gold)] placeholder:text-slate-200/40 transition-colors hover:bg-white/10 hover:border-white/20 focus:outline-none focus:ring-1 focus:ring-[color:var(--color-matte-gold)]"
                    />
                    <p className="text-[11px] text-slate-200/55">
                      HRA exemption is ₹0 unless you enter both "HRA received" and "Rent paid". For Mumbai (metro), exemption uses min(actual HRA, rent − 10% of basic, 50% of basic). If basic is blank, the engine assumes 50% of salary.
                    </p>
                  </div>

                  <button
                    type="button"
                    onClick={handleCalculate}
                    disabled={busy}
                    className="bm-btn bm-btn-primary w-full px-5 py-4 text-base font-semibold tracking-wide rounded-xl bm-calc-button"
                  >
                    {busy ? "Calculating…" : "Calculate"}
                  </button>

                  {statusNote ? <div className="text-xs text-slate-200/70">{statusNote}</div> : null}
                </div>
              </div>
            </div>

            <div ref={resultsRef} className="space-y-4" style={{ scrollMarginTop: "96px" }}>
              {showResults && comparison ? (
                <>
                  <div className="rounded-xl border border-white/10 bg-white/5 p-4">
                    {winner !== "tie" ? (
                      <>
                        <div className="text-sm font-semibold text-white">Result</div>
                        <div className="mt-2 text-white font-semibold">
                          Based on your inputs,{" "}
                          <span className="text-[color:var(--color-matte-gold)] font-semibold">
                            {winner === "old" ? "Old Regime" : "New Regime"}
                          </span>{" "}
                          saves you{" "}
                          <span className="text-[color:var(--color-matte-gold)] font-semibold">{formatINR(savings)}</span>{" "}
                          this year.
                        </div>
                        <div className="mt-3 text-[11px] text-slate-200/70">
                          This is an educational estimate. Consult a tax advisor for personalized advice.
                        </div>
                      </>
                    ) : (
                      <>
                        <div className="text-sm font-semibold text-white">Result</div>
                        <div className="mt-2 text-white font-semibold">
                          Both regimes result in similar tax liability. Consider other factors for your choice.
                        </div>
                      </>
                    )}
                  </div>

                  {winner !== "tie" && savings > 0 ? (
                    <div className="bm-wealth-gap-hero-container">
                      <div className="bm-wealth-gap-hero">
                        <div className="bm-wealth-gap-label">POTENTIAL TAX SAVINGS</div>

                        <div className="bm-wealth-gap-value-wrapper">
                          <AnimatedCounter
                            value={savings}
                            duration={2500}
                            format={(n) => formatINR(Math.round(n))}
                            className="bm-wealth-gap-value"
                          />
                        </div>

                        <div className="bm-wealth-gap-message">
                          You could save this by choosing {winner === "old" ? "Old Regime" : "New Regime"}
                        </div>

                        <div className="bm-wealth-gap-breakdown">
                          <div className="bm-wealth-breakdown-item">
                            <span className="bm-wealth-breakdown-label">Per month</span>
                            <span className="bm-wealth-breakdown-value">
                              {formatINR(Math.max(0, Math.round(savings / 12)))}
                            </span>
                          </div>
                          <div className="bm-wealth-breakdown-item">
                            <span className="bm-wealth-breakdown-label">Over 10 years</span>
                            <span className="bm-wealth-breakdown-value">{savingsLakhs}</span>
                          </div>
                        </div>
                      </div>
                    </div>
                  ) : null}

                  <div className="bm-results-comparison">
                    <div className={oldWins ? "bm-result-card bm-result-card--winner" : "bm-result-card bm-result-card--loser"}>
                      {oldWins ? <div className="bm-winner-badge">BETTER</div> : null}
                      <div className="text-sm text-slate-200/70">Old Regime Tax</div>
                      <div className={oldWins ? "mt-2 text-2xl font-semibold text-white break-words bm-winner-amount" : "mt-2 text-xl font-semibold text-white break-words"}>
                        {formatINR(oldTaxDisplay)}
                      </div>
                      <div className="mt-2 text-[11px] text-slate-200/60">HRA + 80C + 80D deductions</div>
                    </div>

                    <div className="bm-vs-separator" aria-hidden>
                      VS
                    </div>

                    <div className={newWins ? "bm-result-card bm-result-card--winner" : "bm-result-card bm-result-card--loser"}>
                      {newWins ? <div className="bm-winner-badge">BETTER</div> : null}
                      <div className="text-sm text-slate-200/70">New Regime Tax</div>
                      <div className={newWins ? "mt-2 text-2xl font-semibold text-white break-words bm-winner-amount" : "mt-2 text-xl font-semibold text-white break-words"}>
                        {formatINR(newTaxDisplay)}
                      </div>
                      <div className="mt-2 text-[11px] text-slate-200/60">Lower slabs • Higher rebate threshold</div>
                    </div>
                  </div>

                  {showPremium ? (
                    <div className="rounded-2xl border border-white/10 bg-white/5 p-5">
                      <div className="text-base font-semibold text-white">Ready to optimize your taxes?</div>
                      <div className="mt-2 text-sm text-slate-200/75">
                        Your inputs show a potential savings of {formatINR(savings)}.
                        Unlock the ₹299 blueprint for a step-by-step execution roadmap.
                      </div>
                      <div className="mt-4">
                        <PremiumCalculatorCTA
                          labelBefore="Unlock Full Blueprint — ₹299"
                          labelAfter="Preparing Your Blueprint…"
                          price={299}
                          onClickAction={() => {
                            track("premium_click");
                            setLeadOpen(true);
                          }}
                        />
                      </div>

                      <div className="testimonial mt-4 rounded-xl border border-white/10 bg-black/20 p-3 text-[12px] text-slate-200/80">
                        <p>
                          "Saved me ₹47,000 this year. The roadmap made it clear what to do." — Vikram M., Powai
                        </p>
                      </div>

                      <div className="mt-3 text-xs text-slate-200/70">Instant PDF • Based on your ₹{formatLakhs(salary)} scenario</div>
                    </div>
                  ) : null}

                  <div className="trust-badges text-[11px] text-slate-200/70 space-y-1">
                    <p>1,200+ calculations done</p>
                    <p>ARN 90008 registered</p>
                    <p>Used by Mumbai professionals</p>
                  </div>

                  <div className="rounded-xl border border-white/10 bg-white/5 p-4">
                    <div className="flex items-center justify-between">
                      <div className="text-sm font-semibold text-white">Audit Breakdown</div>
                      <button
                        type="button"
                        onClick={() => setShowBreakdown((v) => !v)}
                        className="text-xs text-[color:var(--color-matte-gold)]"
                      >
                        {showBreakdown ? "Hide" : "Show"}
                      </button>
                    </div>
                    {showBreakdown ? (
                      <div className="mt-3 grid gap-4 lg:grid-cols-2">
                        <BreakdownPanel {...getBreakdownModel("Old Regime", comparison.old)} />
                        <BreakdownPanel {...getBreakdownModel("New Regime", comparison.new)} />
                      </div>
                    ) : null}
                  </div>
                </>
              ) : null}
            </div>
          </div>
        </div>
      </BaseCalculatorLayout>

      <style jsx>{`
        .bm-calc-button {
          position: relative;
          overflow: hidden;
        }

        .bm-calc-button::before {
          content: "";
          position: absolute;
          top: 50%;
          left: 50%;
          width: 0;
          height: 0;
          border-radius: 999px;
          background: color-mix(in oklab, white 18%, transparent);
          transform: translate(-50%, -50%);
          transition: width 600ms ease, height 600ms ease;
          pointer-events: none;
        }

        .bm-calc-button:hover::before {
          width: 320px;
          height: 320px;
        }

        @keyframes bmPulse {
          0%,
          100% {
            box-shadow: 0 0 0 0 color-mix(in oklab, var(--color-matte-gold) 45%, transparent);
          }
          50% {
            box-shadow: 0 0 0 10px transparent;
          }
        }

        .bm-wealth-gap-hero-container {
          margin: 26px 0;
          position: relative;
        }

        .bm-wealth-gap-hero {
          background: radial-gradient(
            circle at 50% 0%,
            color-mix(in oklab, var(--color-matte-gold) 18%, transparent) 0%,
            color-mix(in oklab, var(--color-matte-gold) 6%, transparent) 52%,
            transparent 100%
          );
          border: 2px solid color-mix(in oklab, var(--color-matte-gold) 45%, transparent);
          border-radius: 20px;
          padding: 40px 22px;
          text-align: center;
          position: relative;
          overflow: hidden;
          box-shadow:
            0 0 44px color-mix(in oklab, var(--color-matte-gold) 22%, transparent),
            inset 0 0 22px color-mix(in oklab, var(--color-matte-gold) 10%, transparent);
        }

        .bm-wealth-gap-hero::before {
          content: "";
          position: absolute;
          top: -50%;
          right: -50%;
          width: 100%;
          height: 100%;
          background: radial-gradient(circle, color-mix(in oklab, var(--color-matte-gold) 12%, transparent) 0%, transparent 70%);
          pointer-events: none;
        }

        .bm-wealth-gap-label {
          font-size: 12px;
          font-weight: 900;
          letter-spacing: 0.18em;
          text-transform: uppercase;
          color: var(--color-matte-gold);
          margin-bottom: 14px;
          position: relative;
          z-index: 1;
        }

        .bm-wealth-gap-value-wrapper {
          position: relative;
          z-index: 1;
          margin: 18px 0;
          line-height: 1;
        }

        .bm-wealth-gap-value {
          font-weight: 950;
          font-size: 86px;
          color: var(--color-matte-gold);
          text-shadow: 0 0 26px color-mix(in oklab, var(--color-matte-gold) 35%, transparent);
          display: inline-block;
        }

        .bm-wealth-gap-message {
          position: relative;
          z-index: 1;
          font-size: 16px;
          color: rgba(255, 255, 255, 0.78);
          font-weight: 600;
          margin-top: 6px;
        }

        .bm-wealth-gap-breakdown {
          position: relative;
          z-index: 1;
          margin-top: 22px;
          padding-top: 18px;
          border-top: 1px solid color-mix(in oklab, var(--color-matte-gold) 24%, transparent);
          display: grid;
          grid-template-columns: 1fr 1fr;
          gap: 14px;
        }

        .bm-wealth-breakdown-item {
          display: flex;
          flex-direction: column;
          align-items: center;
          gap: 6px;
        }

        .bm-wealth-breakdown-label {
          font-size: 11px;
          letter-spacing: 0.14em;
          text-transform: uppercase;
          color: rgba(255, 255, 255, 0.55);
        }

        .bm-wealth-breakdown-value {
          font-size: 20px;
          font-weight: 950;
          color: var(--color-matte-gold);
        }

        .bm-results-comparison {
          display: grid;
          grid-template-columns: 1fr auto 1.5fr;
          gap: 14px;
          align-items: center;
        }

        .bm-result-card {
          position: relative;
          background: rgba(255, 255, 255, 0.04);
          border: 1px solid rgba(255, 255, 255, 0.10);
          border-radius: 14px;
          padding: 16px;
          min-width: 0;
        }

        .bm-result-card--loser {
          opacity: 0.78;
          transform: scale(0.94);
        }

        .bm-result-card--winner {
          border: 2px solid color-mix(in oklab, var(--color-matte-gold) 65%, transparent);
          box-shadow: 0 0 28px color-mix(in oklab, var(--color-matte-gold) 22%, transparent);
        }

        .bm-winner-badge {
          position: absolute;
          top: -10px;
          right: 14px;
          background: var(--color-matte-gold);
          color: black;
          padding: 5px 12px;
          border-radius: 999px;
          font-weight: 800;
          font-size: 11px;
          letter-spacing: 0.06em;
        }

        .bm-winner-amount {
          font-size: 30px;
        }

        .bm-vs-separator {
          font-weight: 900;
          font-size: 18px;
          color: rgba(255, 255, 255, 0.35);
          letter-spacing: 0.08em;
        }

        @media (max-width: 768px) {
          .bm-wealth-gap-hero {
            padding: 32px 18px;
          }

          .bm-wealth-gap-value {
            font-size: 64px;
          }

          .bm-wealth-gap-breakdown {
            grid-template-columns: 1fr;
          }

          .bm-results-comparison {
            grid-template-columns: 1fr;
          }

          .bm-vs-separator {
            display: none;
          }

          .bm-result-card--loser {
            transform: none;
          }
        }
      `}</style>

      <LeadCaptureModal
        open={leadOpen}
        onOpenChange={setLeadOpen}
        onFree={handleFree}
        onPay={handlePay}
        title="Your 10-Point Tax Blueprint — ₹299"
        body={`Get your personalized execution roadmap to optimize your taxes.\n\nWhat you'll receive:\n\nYOUR TAX OPTIMIZATION PLAN\n- Old vs New regime decision explained\n- Deduction-by-deduction breakdown\n- HRA structuring for Mumbai residents\n- Section 80C deployment strategy\n\nMONTH-BY-MONTH EXECUTION\n- What to fix in April\n- What not to miss before December\n- What must be done before March 31\n\nHIDDEN OPTIMIZATION\n- Mumbai-specific HRA structuring\n- 80C allocation mistakes to avoid\n- 80D family split strategy\n- NPS top-up positioning\n\nInstant download\nEmail delivery\nSupport via WhatsApp`}
        freeLabel="Email Summary"
        payLabel="Unlock Blueprint — ₹299"
        payButtonClassName="calculator-premium-cta"
        optInLabel="Send investment tips via WhatsApp"
        whatsappHelpText="Optional for Email Summary. For premium, WhatsApp helps us support delivery if email fails. Use +91XXXXXXXXXX."
        footerNote={`This is an illustrative educational tool based on your inputs and prevailing tax rules. Not SEBI-registered investment advice. Consult a tax advisor before making decisions.\n\nARN 90008 | IRDAI 277925 | Educational purposes only`}
      />

      <ExitIntentModal
        open={exitOpen}
        onOpenChange={setExitOpen}
        suppressKey="tax_exit_intent_suppress"
        title={`Wait. Don't overpay ${formatINR(savings)}.`}
        bodyPrimary={`Your calculation shows ₹${savingsLakhs} potential savings.\n\nMost taxpayers never optimize properly.\n\nWant to see how to keep this money?`}
        bodySecondary=""
        primaryLabel="Unlock Blueprint — ₹299"
        primaryButtonClassName="calculator-premium-cta"
        secondaryLabel="Email Summary"
        note=""
        footerNote="Educational analysis • ARN 90008 • Consult advisor"
        onPrimary={() => {
          track("exit_intent_premium_click");
          setExitOpen(false);
          setLeadOpen(true);
        }}
        onSecondary={() => {
          track("exit_intent_lead_capture");
          setExitOpen(false);
          setLeadOpen(true);
        }}
      />
    </>
  );
}
