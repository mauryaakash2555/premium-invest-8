"use client";

import { useEffect, useMemo, useRef, useState } from "react";

import { Slider } from "@/components/ui/slider";
import { Switch } from "@/components/ui/switch";

import { LeadCaptureModal } from "@/components/shared/LeadCaptureModal";
import { PremiumUnlockButton } from "@/components/shared/PremiumUnlockButton";
import { ExitIntentModal } from "@/components/shared/ExitIntentModal";

import { BaseCalculatorLayout } from "@/components/calculators/BaseCalculatorLayout";
import { CalculatorHeader } from "@/components/calculators/CalculatorHeader";
import { ResultSummary } from "@/components/calculators/ResultSummary";
import { Breakdown as BreakdownPanel } from "@/components/calculators/Breakdown";
import { ZeroTaxBadge } from "@/components/calculators/ZeroTaxBadge";
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

export function TaxCalculator() {
  const { track } = useCalculatorTracking("tax_optimization");

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
  const [hasCalculated, setHasCalculated] = useState(false);
  const [emphasizeWinner, setEmphasizeWinner] = useState(false);
  const [calcTick, setCalcTick] = useState(0);

  const resultsRef = useRef(null);

  const startedRef = useRef(false);
  const purchaseRef = useRef(false);
  const calcCompleteRef = useRef(false);
  const armedRef = useRef(false);

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
  const zeroTaxNew = showResults && Boolean(comparison) && newTax === 0;
  const zeroTaxOld = showResults && Boolean(comparison) && oldTax === 0;
  const hasZeroTax = zeroTaxNew || zeroTaxOld;
  const leakRegime = winner === "old" ? "New Regime" : winner === "new" ? "Old Regime" : null;

  const maxTax = Math.max(oldTax, newTax, 1);
  const oldRatio = oldTax / maxTax;
  const newRatio = newTax / maxTax;

  useEffect(() => {
    track("calculator_view");
  }, []);

  useEffect(() => {
    // initialize purchase flag from localStorage
    try {
      purchaseRef.current = Boolean(localStorage.getItem("tax_premium_bought"));
    } catch {}
  }, []);

  // Arm exit-intent only after first successful calculation result exists
  useEffect(() => {
    if (startedRef.current && !calcCompleteRef.current) {
      calcCompleteRef.current = true;
      armedRef.current = true;
      track("calculator_complete");
    }
  }, [inputs]);

  function markStarted() {
    if (startedRef.current) return;
    startedRef.current = true;
    track("calculator_start");
  }

  async function handleFree(payload) {
    track("lead_submit_free");
    setStatusNote("");

    const res = await fetch("/api/leads/capture", {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ ...payload, source: "tax_optimization" }),
    });
    const json = await res.json().catch(() => null);
    if (!res.ok || !json?.ok) {
      setStatusNote("Could not save your details. Please try again.");
      return;
    }

    track("lead_captured", { mode: "free" });
    setLeadOpen(false);
    setStatusNote("Thanks! We'll email you a summary shortly.");
  }

  async function handlePay(payload) {
    track("lead_submit_pay");
    setStatusNote("");

    if (!inputs) {
      setStatusNote("Please calculate first, then unlock premium.");
      return;
    }

    // 1) Capture lead
    const leadRes = await fetch("/api/leads/capture", {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ ...payload, source: "tax_optimization" }),
    });
    const leadJson = await leadRes.json().catch(() => null);
    if (!leadRes.ok || !leadJson?.ok) {
      setStatusNote("Could not save your details. Please try again.");
      return;
    }

    const leadId = leadJson?.leadId || null;

    // 2) Create Razorpay order
    setStatusNote("Starting payment...");
    track("payment_start");

    const orderRes = await fetch("/api/razorpay/create-order", {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ amountPaise: 29900, leadId }),
    });
    const orderJson = await orderRes.json().catch(() => null);
    if (!orderRes.ok || !orderJson?.ok) {
      track("payment_failed", { stage: "create_order" });
      setStatusNote("Payment could not be started. Please try again.");
      return;
    }

    const sdkOk = await loadRazorpaySdk();
    if (!sdkOk) {
      track("payment_failed", { stage: "sdk_load_failed" });
      setStatusNote("Payment system could not be loaded. Please disable blockers or try again.");
      return;
    }

    const options = {
      key: orderJson.keyId,
      amount: orderJson.amount,
      currency: orderJson.currency || "INR",
      name: "BM Wealth",
      description: "Personalized Tax Optimization Roadmap (FY 2025–26)",
      order_id: orderJson.orderId,
      prefill: {
        name: payload?.name || "",
        email: payload?.email || "",
        contact: payload?.phone || "",
      },
      theme: { color: "#C0A062" },
      handler: async (response) => {
        try {
          // 3) Verify payment (server)
          const verifyRes = await fetch("/api/razorpay/verify", {
            method: "POST",
            headers: { "Content-Type": "application/json" },
            body: JSON.stringify({
              ...response,
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

          track("payment_success");
          track("purchase", { product: "personal_tax_execution_blueprint", amount: 299, currency: "INR" });
          if (emailStatus === "sent") {
            setStatusNote("Payment successful. Email sent. Preparing your PDF...");
          } else {
            setStatusNote("Payment successful. Preparing your PDF...");
          }
          try {
            localStorage.setItem("tax_premium_bought", "1");
            purchaseRef.current = true;
          } catch {}

          // 4) Download PDF (client)
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

    rz.open();
    setLeadOpen(false);
  }

  // Exit-intent triggers (desktop + mobile)
  useEffect(() => {
    const shownKey = "exit_intent_shown";
    const suppressKey = "exit_intent_suppress";
    function alreadyShown() {
      try { return sessionStorage.getItem(shownKey) === "1"; } catch { return false; }
    }
    function suppressed() {
      try { return sessionStorage.getItem(suppressKey) === "1"; } catch { return false; }
    }
    function markShown() {
      try { sessionStorage.setItem(shownKey, "1"); } catch {}
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

    // Desktop: mouse leaves viewport top
    function onMouseLeave(e) {
      if (window.innerWidth < 900) return; // desktop only
      if (e.clientY <= 0) showExit();
    }

    // Mobile: back intent interception using history state
    let pushed = false;
    function pushStateOnce() {
      try { history.pushState({ x: Date.now() }, ""); pushed = true; } catch {}
    }
    function onPopState() {
      if (window.innerWidth >= 900) return; // mobile only
      showExit();
      // try to keep user on page softly
      try { history.pushState({ x: Date.now() }, ""); } catch {}
    }

    // Mobile: scroll-up to top after result seen (priority after back intent)
    let lastScrollY = window.scrollY;
    function onScroll() {
      if (window.innerWidth >= 900) return;
      const y = window.scrollY;
      const goingUp = y < lastScrollY;
      lastScrollY = y;
      if (armedRef.current && goingUp && y < 90) showExit();
    }

    // Mobile: inactivity trigger only once result is calculated
    let lastActive = Date.now();
    const INACTIVE_MS = 30000;
    function markActive() { lastActive = Date.now(); }
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

  async function handleCalculate() {
    markStarted();
    setBusy(true);
    try {
      // Ensure UI has time to update button state smoothly.
      await new Promise((r) => setTimeout(r, 60));
      setInputs(draftInputs);
      track("calculator_calculate");
      setShowResults(true);
      setHasCalculated(true);
      setEmphasizeWinner(true);
      setShowPremium(true);
      setCalcTick((t) => t + 1);
      // Fade winner emphasis after ~800ms
      setTimeout(() => setEmphasizeWinner(false), 800);
      // Smooth-scroll results into view; respect sticky nav offset
      setTimeout(() => {
        try {
          const el = resultsRef.current;
          if (el) {
            const y = el.getBoundingClientRect().top + window.scrollY - 96; // approx sticky nav height
            window.scrollTo({ top: Math.max(0, y), behavior: "smooth" });
          }
        } catch {}
      }, 90);
    } finally {
      setBusy(false);
    }
  }

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

  // Lightweight count-up for result numbers (300–500ms)
  function useCountUp(value, durationMs, key) {
    const [display, setDisplay] = useState(value);
    useEffect(() => {
      let raf;
      const start = performance.now();
      const from = display;
      const to = value;
      const dur = Math.max(300, Math.min(500, durationMs || 400));
      function step(t) {
        const p = Math.min(1, (t - start) / dur);
        const eased = 1 - Math.pow(1 - p, 3); // ease-out cubic
        const val = Math.round(from + (to - from) * eased);
        setDisplay(val);
        if (p < 1) raf = requestAnimationFrame(step);
      }
      raf = requestAnimationFrame(step);
      return () => raf && cancelAnimationFrame(raf);
      // eslint-disable-next-line react-hooks/exhaustive-deps
    }, [key]);
    return display;
  }

  const oldTaxDisplay = useCountUp(oldTax, 400, hasCalculated ? `old-${calcTick}-${oldTax}` : "old-init");
  const newTaxDisplay = useCountUp(newTax, 400, hasCalculated ? `new-${calcTick}-${newTax}` : "new-init");

  return (
    <>
      <BaseCalculatorLayout
        header={
          <CalculatorHeader
            meta={
              <>
                <img src="/logo.webp" alt="BM Wealth" className="h-5 w-auto" />
                <span>BM Wealth</span>
                <span className="text-white/25">•</span>
                <span>BM Wealth Calculator</span>
                <span className="text-white/25">•</span>
                <span className="text-white/45">ARN 90008 | IRDAI 277925</span>
              </>
            }
            title={
              <>
                Tax Optimization Intelligence — <span className="whitespace-nowrap">FY 2025–26</span>
              </>
            }
            pill={
              <>
                <span className="text-[color:var(--color-matte-gold)] font-semibold">Stop the invisible leak.</span>
                <span>See if the 2026 “Zero Tax” rule applies to you.</span>
              </>
            }
            subtitle="Compare Old vs New regime, then unlock a 10-point optimization blueprint."
          />
        }
        disclaimer={
          "ARN 90008 | IRDAI 277925. For education and information only; calculations depend on your inputs and prevailing tax rules. For personalised investment advice, consult a SEBI-registered investment adviser."
        }
      >
        <div className="px-6 pb-6 lg:px-10 lg:pb-10">
            <div className="space-y-8 lg:space-y-0 lg:grid lg:grid-cols-2 lg:gap-10">
              {/* Left: Inputs */}
              <div className="space-y-6">
                {[
                  {
                    label: "Annual Salary",
                    value: salary,
                    setValue: (v) => setSalary(v),
                    min: 0,
                    max: 10_00_00_000,
                    step: 50_000,
                    maxLabel: "10Cr",
                  },
                  {
                    label: "80C Investments",
                    value: i80c,
                    setValue: (v) => setI80c(v),
                    min: 0,
                    max: 1_50_000,
                    step: 1_000,
                    maxLabel: "1.5L",
                  },
                  {
                    label: "80D Health Insurance",
                    value: i80d,
                    setValue: (v) => setI80d(v),
                    min: 0,
                    max: 1_00_000,
                    step: 1_000,
                    maxLabel: "1L",
                  },
                  {
                    label: "Home Loan Interest (Section 24)",
                    value: homeLoanInterest,
                    setValue: (v) => setHomeLoanInterest(v),
                    min: 0,
                    max: 2_00_000,
                    step: 1_000,
                    maxLabel: "2L",
                  },
                  {
                    label: "NPS (80CCD(1B))",
                    value: nps80ccd1b,
                    setValue: (v) => setNps80ccd1b(v),
                    min: 0,
                    max: 50_000,
                    step: 500,
                    maxLabel: "50K",
                  },
                ].map((row) => (
                  <div key={row.label} className="space-y-2">
                    <div className="flex justify-between text-sm text-slate-200/80">
                      <span>{row.label}</span>
                      <span className="text-[color:var(--color-matte-gold)]">{formatINR(row.value)}</span>
                    </div>
                    <Slider
                      value={[row.value]}
                      min={row.min}
                      max={row.max}
                      step={row.step}
                      onValueChange={(v) => {
                        markStarted();
                        row.setValue(v?.[0] ?? 0);
                      }}
                    />
                    <div className="flex justify-between text-xs text-slate-200/50">
                      <span className="opacity-80 text-[color:var(--color-vscode-gold)]">0</span>
                      <span className="opacity-80 text-[color:var(--color-vscode-gold)]">{row.maxLabel}</span>
                    </div>
                  </div>
                ))}

                {/* HRA Inputs */}
                <div className="space-y-2">
                  <div className="text-sm text-slate-200/80">HRA details (for accurate exemption)</div>
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

                <p className="text-[11px] text-slate-200/60">Results are shown after calculation.</p>

                <button
                  type="button"
                  onClick={handleCalculate}
                  disabled={busy}
                  className="bm-btn bm-btn-secondary w-full px-4 py-3 text-sm"
                >
                  {busy ? "Calculating..." : "Calculate"}
                </button>
              </div>

              {/* Right: Results + Winner + Premium + Chart + Breakdown */}
              <div ref={resultsRef} className="space-y-6" style={{ scrollMarginTop: "96px" }}>
                {showResults && comparison && hasZeroTax ? (
                  <div className="bm-zero-tax-banner rounded-2xl border border-white/10 bg-white/5 px-4 py-3">
                    <div className="flex items-center justify-between gap-3">
                      <div className="text-sm font-semibold text-white">
                        Zero Tax Badge
                      </div>
                      <ZeroTaxBadge label={zeroTaxNew ? "NEW REGIME: ₹0" : "OLD REGIME: ₹0"} />
                    </div>
                    <div className="mt-1 text-[11px] text-slate-200/70">
                      If your taxable income is within the rebate threshold (New: ₹12L, Old: ₹5L), the 87A rebate can reduce tax to ₹0 (cess included).
                    </div>
                  </div>
                ) : null}

                {showResults && comparison && winner !== "tie" && savings > 0 ? (
                  <div className="rounded-2xl border border-[color:color-mix(in oklab, var(--color-matte-gold) 35%, transparent)] bg-[color:color-mix(in oklab, var(--color-matte-gold) 10%, transparent)] px-4 py-3">
                    <div className="flex items-center justify-between gap-3">
                      <div className="text-sm font-semibold text-white">Wealth Leak Alert</div>
                      <div className="text-[11px] font-semibold text-[color:var(--color-matte-gold)]">Potential leak: {formatINR(savings)}</div>
                    </div>
                    <div className="mt-1 text-[11px] text-slate-200/70">
                      Choosing the wrong regime can cost you {formatINR(savings)} this year. Based on your inputs, avoid {leakRegime}.
                    </div>
                  </div>
                ) : null}
                {showResults && comparison ? (
                  <ResultSummary
                    winnerKey={winner === "tie" ? null : winner}
                    emphasizeWinner={emphasizeWinner}
                    options={[
                      {
                        key: "old",
                        label: "Old Regime",
                        amount: formatINR(oldTaxDisplay),
                        amountNote: oldTax === 0 ? "₹0 due to Section 87A rebate (threshold-based)." : null,
                        statusText:
                          winner === "old"
                            ? "You pay LESS tax"
                            : winner === "new"
                              ? "You pay MORE tax"
                              : "You pay the SAME tax",
                        statusTone: winner === "old" ? "good" : winner === "new" ? "bad" : "neutral",
                        metaLines: [
                          `Effective Rate: ${(comparison.old.effectiveRate * 100).toFixed(1)}%`,
                          `Money Saved: ${formatINR(winner === "old" ? comparison.savings : 0)}`,
                        ],
                      },
                      {
                        key: "new",
                        label: "New Regime",
                        labelAccent: true,
                        amount: formatINR(newTaxDisplay),
                        amountNote: newTax === 0 ? "₹0 due to Section 87A rebate (threshold-based)." : null,
                        statusText:
                          winner === "new"
                            ? "You pay LESS tax"
                            : winner === "old"
                              ? "You pay MORE tax"
                              : "You pay the SAME tax",
                        statusTone: winner === "new" ? "good" : winner === "old" ? "bad" : "neutral",
                        metaLines: [
                          `Effective Rate: ${(comparison.new.effectiveRate * 100).toFixed(1)}%`,
                          `Money Saved: ${formatINR(winner === "new" ? comparison.savings : 0)}`,
                        ],
                      },
                    ]}
                  />
                ) : null}

                {showResults && comparison ? (
                  <div className="text-center text-sm text-white/90">
                    Winner: <span className="text-[color:var(--color-matte-gold)] font-semibold">{winner === "tie" ? "Tie" : winner === "old" ? "Old Regime" : "New Regime"}</span>
                  </div>
                ) : null}

                {showResults && comparison ? (
                  <div className="text-center text-[11px] text-slate-200/60">
                    87A rebate applies only up to taxable income thresholds (Old: ₹5,00,000; New: ₹12,00,000). For New regime incomes just above ₹12L, marginal relief limits the tax jump.
                  </div>
                ) : null}

                {showResults && (
                  <div className="rounded-xl border border-white/10 bg-white/5 p-4 animate-in fade-in slide-in-from-bottom-2 transition-colors hover:bg-white/10 hover:border-white/20">
                    <div className="space-y-2">
                      <h3 className="text-base font-semibold text-white">High-income mistakes don’t happen in calculation. They happen in execution.</h3>
                      <p className="text-[11px] text-slate-200/65">Designed to be acted on before key FY deadlines — not read later.</p>
                      <p className="text-[11px] text-slate-200/65">Generated using your inputs. Not a generic template.</p>
                      <p className="text-xs text-slate-200/70">You already know the numbers. This plan shows what to do, when to do it, and what most people miss.</p>
                    </div>
                    <div className="mt-3 grid gap-2">
                      <div className="rounded-lg border border-white/10 bg-black/30 p-3 transition-colors hover:border-white/20 hover:bg-black/40">
                        <div className="text-xs font-semibold text-white">🔓 What You See Free</div>
                        <div className="text-[11px] text-slate-200/75">Your tax number • Old vs New comparison</div>
                      </div>
                      <div className="rounded-lg border border-white/10 bg-black/30 p-3 transition-colors hover:border-white/20 hover:bg-black/40">
                        <div className="text-xs font-semibold text-white">🔒 What Professionals Actually Need (₹299)</div>
                        <div className="text-[11px] text-slate-200/75">EXECUTION, NOT CALCULATION</div>
                        <div className="text-[11px] text-slate-200/60">Your exact tax-saving potential ({formatINR(comparison?.savings || 0)}) • Why this regime works for you</div>
                      </div>
                      <div className="rounded-lg border border-white/10 bg-black/30 p-3 transition-colors hover:border-white/20 hover:bg-black/40">
                        <div className="text-xs font-semibold text-white">MONTH-BY-MONTH ACTION</div>
                        <div className="text-[11px] text-slate-200/60">What to fix in April • What not to miss before December • What must be done before March 31</div>
                      </div>
                      <div className="rounded-lg border border-white/10 bg-black/30 p-3 transition-colors hover:border-white/20 hover:bg-black/40">
                        <div className="text-xs font-semibold text-white">HIDDEN OPTIMIZATION</div>
                        <div className="text-[11px] text-slate-200/60">Mumbai-specific HRA structuring • 80C allocation mistakes • 80D family split strategy • NPS top-up positioning</div>
                      </div>
                      <div className="rounded-lg border border-white/10 bg-black/30 p-3 transition-colors hover:border-white/20 hover:bg-black/40">
                        <div className="text-xs font-semibold text-white">FORWARD STRATEGY</div>
                        <div className="text-[11px] text-slate-200/60">3-year tax outlook • Salary hike breakpoints • When regime switching actually makes sense</div>
                      </div>
                      <div className="rounded-lg border border-white/10 bg-black/30 p-3">
                        <div className="text-xs font-semibold text-white">PROFESSIONAL CHECKLIST</div>
                        <div className="text-[11px] text-slate-200/60">Audit-ready documentation • What your CA will ask for • What most people fail to keep</div>
                      </div>
                      <div className="rounded-lg border border-white/10 bg-black/30 p-3">
                        <div className="text-xs font-semibold text-white">WEALTH TRANSITION</div>
                        <div className="text-[11px] text-slate-200/60">Where your tax savings should go next • Tax-efficient investment buckets • No product pushing. Only structure.</div>
                      </div>
                    </div>
                    <p className="mt-3 text-[11px] text-slate-200/55">One-time • Personalised • No calls • No spam</p>
                  </div>
                )}

                {showPremium ? (
                  <PremiumUnlockButton
                    onClick={() => {
                      track("premium_click");
                      setLeadOpen(true);
                    }}
                  />
                ) : null}

                {/* SEO Content Block (Visible, no accordions/tabs) */}
                <section className="rounded-2xl border border-white/10 bg-white/5 p-5">
                  <h2 className="text-base font-semibold text-white">Tax Planning for the Sophisticated Mumbai Investor</h2>

                  <h3 className="mt-4 text-sm font-semibold text-white/90">Introduction: The New Era of Mumbai Wealth</h3>
                  <p className="mt-2 text-sm text-slate-200/75">
                    For the high-earning professional in Mumbai—from the CXOs in BKC to the tech leaders in Powai—tax planning for FY 2025-26 has fundamentally shifted.
                    With the new tax regime now serving as the default, the "leakage" of wealth into inefficient tax brackets has become a silent profit killer for HNIs.
                    A salary of ₹50 Lakhs in Mumbai is no longer just about gross earnings; it’s about the "Net Spendable Surplus" after accounting for the city's high cost of living and the 30% tax ceiling.
                  </p>

                  <h3 className="mt-4 text-sm font-semibold text-white/90">The ₹12 Lakh "Zero Tax" Phenomenon</h3>
                  <p className="mt-2 text-sm text-slate-200/75">
                    The latest budget has introduced a critical psychological and financial milestone: the ₹12,00,000 Zero-Tax threshold.
                    For professionals climbing the corporate ladder, staying within this limit (after the ₹75,000 standard deduction and rebates) can result in a total tax liability of zero.
                    However, once you cross this threshold even by a small margin, "Marginal Relief" logic becomes your most important financial shield.
                    Our detector identifies exactly where this cliff exists, ensuring you don’t pay ₹50,000 in tax just because you earned ₹10,000 extra.
                  </p>

                  <h3 className="mt-4 text-sm font-semibold text-white/90">Mumbai-Specific Optimization: HRA &amp; The Metro Rule</h3>
                  <p className="mt-2 text-sm text-slate-200/75">
                    While the New Regime is aggressive, many Mumbai residents still find the Old Regime superior due to House Rent Allowance (HRA).
                    Since Mumbai is classified as a 'Metro' city, you are eligible for an HRA deduction of up to 50% of your Basic salary.
                    In a city where luxury rentals in Worli or Bandra can exceed ₹1.5 Lakhs per month, failing to optimize this specific deduction can lead to a "tax leak" of over ₹3 Lakhs annually.
                    BM Wealth’s optimization logic compares your actual rent against the 50% metro rule to see if the Old Regime’s deductions still outweigh the New Regime’s lower slabs.
                  </p>

                  <h3 className="mt-4 text-sm font-semibold text-white/90">Beyond the Basics: Surcharge &amp; Cess</h3>
                  <p className="mt-2 text-sm text-slate-200/75">
                    For higher taxable incomes, surcharge can apply above ₹50L (as per FY 2025–26 rules), and 4% Health &amp; Education Cess applies on top of tax plus surcharge.
                    This calculator includes surcharge and marginal relief (where applicable) based on your inputs.
                  </p>

                  <h3 className="mt-4 text-sm font-semibold text-white/90">Investment Harvesting in FY 2026</h3>
                  <p className="mt-2 text-sm text-slate-200/75">
                    Tax planning is no longer a March-only activity. With the new 12.5% Long-Term Capital Gains (LTCG) tax on equity, Mumbai investors must practice "Tax Harvesting."
                    By realizing gains up to the ₹1.25 Lakh tax-free limit each financial year, you can reset your cost basis and save thousands in future liabilities.
                    This "Roadmap" approach—moving from compliance to strategy—is what separates a standard taxpayer from a BM Wealth client.
                  </p>

                  <h3 className="mt-4 text-sm font-semibold text-white/90">Conclusion: Reclaim Your Liquidity</h3>
                  <p className="mt-2 text-sm text-slate-200/75">
                    Tax is your largest recurring expense. By using the BM Wealth Tax Leak Detector, you aren't just calculating numbers; you are performing an audit of your financial efficiency.
                    Whether it is leveraging Section 24(b) for your Mumbai home loan or optimizing your family's 80D health coverage, every rupee saved is a rupee invested back into your legacy.
                  </p>
                </section>

                {showResults && comparison ? (
                  <div className="h-28 rounded-xl bg-white/5 border border-white/10 flex items-end justify-around p-4">
                    <div className="flex flex-col items-center gap-2">
                      <div
                        className="w-10 bg-gradient-to-t from-white/10 to-[color:var(--color-matte-gold)] rounded transition-[height] duration-700 ease-out will-change-[height]"
                        style={{ height: Math.max(6, Math.min(78, Math.round(oldRatio * 88))) }}
                      />
                      <div className="text-[11px] text-slate-200/70">Old</div>
                    </div>
                    <div className="flex flex-col items-center gap-2">
                      <div
                        className="w-10 bg-gradient-to-t from-white/10 to-[color:var(--color-matte-gold)] rounded transition-[height] duration-700 ease-out will-change-[height]"
                        style={{ height: Math.max(6, Math.min(78, Math.round(newRatio * 88))) }}
                      />
                      <div className="text-[11px] text-slate-200/70">New</div>
                    </div>
                  </div>
                ) : null}

                {showResults && comparison ? (
                  <div className="flex items-center justify-between rounded-xl border border-white/10 bg-white/5 px-4 py-3">
                    <div>
                      <div className="text-sm text-white">Calculation Breakdown (Audit View)</div>
                      <div className="text-xs text-slate-200/60">Slabs, deductions, cess & marginal relief</div>
                    </div>
                    <Switch
                      checked={showBreakdown}
                      onCheckedChange={(v) => {
                        setShowBreakdown(Boolean(v));
                        track("breakdown_toggle", { open: Boolean(v) });
                      }}
                    />
                  </div>
                ) : null}

                {showResults && comparison && showBreakdown ? (
                  <div className="grid gap-4 lg:grid-cols-2">
                    <BreakdownPanel {...getBreakdownModel("Old regime", comparison.old)} />
                    <BreakdownPanel {...getBreakdownModel("New regime", comparison.new)} />
                  </div>
                ) : null}

                {statusNote ? (
                  <p className="pt-1 text-xs text-center text-slate-200/70 animate-in fade-in duration-300">
                    {statusNote}
                  </p>
                ) : null}
              </div>
            </div>
          </div>
      </BaseCalculatorLayout>

      <LeadCaptureModal
        open={leadOpen}
        onOpenChange={setLeadOpen}
        onFree={handleFree}
        onPay={handlePay}
      />

      <ExitIntentModal
        open={exitOpen}
        onOpenChange={setExitOpen}
        onPrimary={() => {
          track("exit_intent_premium_click");
          setExitOpen(false);
          track("exit_intent_lead_capture");
          setLeadOpen(true);
        }}
        onSecondary={() => {
          setExitOpen(false);
          track("exit_intent_lead_capture");
          setLeadOpen(true);
        }}
      />
    </>
  );
}
