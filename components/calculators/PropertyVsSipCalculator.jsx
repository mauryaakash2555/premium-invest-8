"use client";

import { useEffect, useMemo, useRef, useState } from "react";

import { Slider } from "@/components/ui/slider";

import { LeadCaptureModal } from "@/components/shared/LeadCaptureModal";
import { ExitIntentModal } from "@/components/shared/ExitIntentModal";

import { BaseCalculatorLayout } from "@/components/calculators/BaseCalculatorLayout";
import { CalculatorHeader } from "@/components/calculators/CalculatorHeader";
import { Breakdown as BreakdownPanel } from "@/components/calculators/Breakdown";
import { PremiumCalculatorCTA } from "@/components/calculators/PremiumCalculatorCTA";

import { useCalculatorTracking } from "@/lib/hooks/useCalculatorTracking";
import { formatINR } from "@/lib/tax-formulas";

import {
  computeMumbaiPropertyVsSip,
  formatMumbaiPropertyVsSipResults,
  buildMumbaiPropertyVsSipPdfPayload,
  MUMBAI_PROPERTY_VS_SIP_ASSUMPTIONS,
} from "@/lib/property-vs-sip";

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

function parseNumericInput(raw) {
  const cleaned = String(raw ?? "").replace(/[^\d]/g, "");
  const n = Number(cleaned);
  return Number.isFinite(n) ? n : 0;
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

function formatCroreNumber(valueInINR) {
  const n = Number(valueInINR);
  if (!Number.isFinite(n)) return "0";
  const cr = Math.abs(n) / 10_000_000;
  const s = cr.toFixed(cr >= 10 ? 1 : 2);
  return s.replace(/\.0+$/, "").replace(/(\.[1-9])0$/, "$1");
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

function digitsOnlyPhone(v) {
  const digits = String(v || "").replace(/\D+/g, "");
  return digits.length >= 10 ? digits.slice(-10) : digits;
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
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [key]);
  return display;
}

export function PropertyVsSipCalculator() {
  const { track } = useCalculatorTracking("property_vs_sip");

  const a = MUMBAI_PROPERTY_VS_SIP_ASSUMPTIONS;

  const COMPLIANCE_FOOTER = "BM Wealth | ARN 90008 | Educational mathematical projection.\n   Not investment advice.";
  const ASSUMPTIONS_LINE =
    "Locked assumptions: Property 4% CAGR, Equity 14.5% CAGR. Equity path invests the SAME upfront capital + monthly SIP.";

  const [propertyPriceRaw, setPropertyPriceRaw] = useState("20000000");
  const [monthlySipRaw, setMonthlySipRaw] = useState("50000");
  const [years, setYears] = useState(a.defaultYears);

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
      purchaseRef.current = Boolean(localStorage.getItem("pvs_premium_bought"));
    } catch {}
  }, []);

  const draftInputs = useMemo(
    () => ({
      propertyPrice: clamp(parseNumericInput(propertyPriceRaw), 0, 1_000_000_000),
      monthlySip: clamp(parseNumericInput(monthlySipRaw), 0, 10_000_000),
      years: clamp(years, 1, a.maxYears),
    }),
    [propertyPriceRaw, monthlySipRaw, years, a.maxYears]
  );

  const [model, setModel] = useState(null);
  const formatted = useMemo(() => (model ? formatMumbaiPropertyVsSipResults(model) : null), [model]);

  useEffect(() => {
    if (startedRef.current && !calcCompleteRef.current && model) {
      calcCompleteRef.current = true;
      armedRef.current = true;
      track("calculator_complete");
    }
  }, [model]);

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
      const computed = computeMumbaiPropertyVsSip(draftInputs);
      setModel(computed);
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

    if (!model || !formatted) {
      throw new Error("Please click Calculate first, then email your summary.");
    }

    setStatusNote("Sending your summary...");
    const res = await fetch("/api/property-vs-sip/email-summary", {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({
        lead: payload,
        inputs: {
          propertyPrice: formatINR(model.inputs.propertyPrice),
          monthlySip: formatINR(model.inputs.monthlySip),
          years: yearsFinal,
        },
        results: {
          propertyFutureValue: formatted.values.propertyFutureValue,
          sipFutureValue: formatted.values.sipFutureValue,
          wealthGap: formatted.values.wealthGap,
          gapCr,
        },
      }),
    });
    const json = await res.json().catch(() => null);
    if (!res.ok || !json?.ok) {
      if (json?.error === "email_not_configured") {
        throw new Error("Email delivery is not configured yet. Please contact support.");
      }
      throw new Error("Could not send your email right now. Please try again.");
    }

    if (json?.leadId) leadIdRef.current = String(json.leadId);

    track("lead_captured", { mode: "free", leadId: leadIdRef.current || undefined });
    setStatusNote("Email sent. Please check your inbox (and Promotions/Spam). ");
  }

  async function handlePay(payload) {
    track("lead_submit_pay");
    setStatusNote("");

    if (!model) {
      throw new Error("Please click Calculate first, then unlock premium.");
    }

    const leadRes = await fetch("/api/leads/capture", {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ ...payload, source: "property_vs_sip" }),
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
      body: JSON.stringify({ amountPaise: 39900, leadId, receiptPrefix: "pvs" }),
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

    const computedInputs = model?.inputs || draftInputs;
    const pdfPayload = buildMumbaiPropertyVsSipPdfPayload({ lead: payload, model });

    const options = {
      key: orderJson.keyId,
      amount: orderJson.amount,
      currency: orderJson.currency || "INR",
      name: "BM Wealth",
      description: `Property Analysis - ₹${gapCr}Cr Opportunity`,
      order_id: orderJson.orderId,
      notes: {
        property_value: String(computedInputs?.propertyPrice ?? ""),
        sip_amount: String(computedInputs?.monthlySip ?? ""),
        timeline_years: String(computedInputs?.years ?? ""),
        wealth_gap_inr: String(Number(model?.wealthGap || 0)),
      },
      prefill: {
        name: payload?.name || "",
        email: payload?.email || "",
        contact: digitsOnlyPhone(payload?.phone) || "",
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
              inputs: computedInputs,
              pdfPayload,
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

          const downloadToken = verifyJson?.downloadToken;
          const tokenPayload = verifyJson?.tokenPayload;

          track("payment_success", { leadId: leadIdRef.current || undefined });
          track("purchase", { leadId: leadIdRef.current || undefined, product: "mumbai_property_vs_sip_report", amount: 399, currency: "INR" });
          if (emailStatus === "sent") {
            setStatusNote("Payment successful. Email sent. Preparing your PDF...");
          } else {
            setStatusNote("Payment successful. Preparing your PDF...");
          }
          try {
            localStorage.setItem("pvs_premium_bought", "1");
            purchaseRef.current = true;
          } catch {}

          try {
            const qs = new URLSearchParams();
            if (downloadToken) qs.set("downloadToken", String(downloadToken));
            if (tokenPayload) qs.set("tokenPayload", String(tokenPayload));
            if (leadIdRef.current) qs.set("leadId", String(leadIdRef.current));
            qs.set("filename", String(pdfPayload?.meta?.filename || "Mumbai-Property-vs-SIP-Wealth-Gap-Report.pdf"));
            if (emailStatus) qs.set("emailStatus", String(emailStatus));
            if (payload?.name) qs.set("name", String(payload.name));
            if (payload?.email) qs.set("email", String(payload.email));
            if (gapCr) qs.set("gap", String(gapCr));
            window.location.assign(`/payment-success?${qs.toString()}`);
            return;
          } catch {
            setStatusNote("Payment successful. Please check your email for the PDF.");
          }
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

    // Close the lead modal before opening Razorpay.
    setLeadOpen(false);
    rz.open();
  }

  useEffect(() => {
    const shownKey = "pvs_exit_intent_shown";
    const suppressKey = "pvs_exit_intent_suppress";

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

  const wealthGap = model ? Number(model.wealthGap || 0) : 0;
  const yearsFinal = model?.inputs?.years || a.defaultYears;
  const sipValueNum = model ? Number(model.sipFutureValue || 0) : 0;
  const propertyWealthNum = model ? Number(model.propertyFutureValue || 0) : 0;
  const propertyWins = model ? propertyWealthNum > sipValueNum : false;
  const sipWins = model ? sipValueNum > propertyWealthNum : false;
  const advantageNum = sipWins ? wealthGap : 0;

  const gapCr = formatCroreNumber(wealthGap);
  const propertyCr = model ? formatCroreNumber(model.inputs.propertyPrice) : "0";

  const draftPropertyCr = formatCroreNumber(draftInputs.propertyPrice);
  const draftPropertyPretty = formatLakhs(draftInputs.propertyPrice);

  const sipTotalInvestedNum = model ? Number(model.sipTotalInvested || 0) : 0;
  const sipWealthCreatedNum = model ? Number(model.sipWealthCreated || 0) : 0;

  const wealthGapDisplay = useCountUp(wealthGap, 650, showResults ? `gap-${yearsFinal}-${wealthGap}` : "gap-init");
  const propertyFutureDisplay = useCountUp(propertyWealthNum, 650, showResults ? `prop-${yearsFinal}-${propertyWealthNum}` : "prop-init");
  const sipFutureDisplay = useCountUp(sipValueNum, 650, showResults ? `sip-${yearsFinal}-${sipValueNum}` : "sip-init");

  const breakdownModel = useMemo(() => {
    if (!model || !formatted) return null;
    const y = model.inputs.years;
    const months = y * 12;

    const propertyStartCr = formatCroreNumber(model.inputs.propertyPrice);
    const propertyEndCr = formatCroreNumber(model.propertyFutureValue);

    return {
      label: `₹${propertyStartCr}Cr property grows to ₹${propertyEndCr}Cr at 4% over ${y} years. Years clamped to max ${a.maxYears}.`,
      fiscalYear: null,
      context: "No EMI/loan, taxes, stamp duty, or transaction costs included.",
      sections: [
        {
          title: "Inputs",
          rows: [
            { label: "Property price", value: formatINR(model.inputs.propertyPrice), accent: true },
            { label: "Monthly SIP", value: formatINR(model.inputs.monthlySip) },
            { label: "Investment Period", value: `${String(y)} years (max ${a.maxYears})` },
          ],
        },
        {
          title: "Property",
          rows: [
            { label: `Property value after ${y} years`, value: formatted.values.propertyFutureValue, emphasis: true, accent: true },
          ],
        },
        {
          title: "SIP",
          rows: [
            { label: "Same upfront capital invested in equity", value: formatINR(model.inputs.propertyPrice), accent: true },
            { label: `Lump-sum calc`, value: `${formatINR(model.inputs.propertyPrice)} × (1 + 14.5%)^${y}` },
            { label: `Lump-sum value after ${y} years`, value: formatINR(model.sipLumpSumFutureValue || 0), accent: true },
            { label: "Monthly investment", value: formatINR(model.inputs.monthlySip), accent: true },
            { label: `Monthly calc`, value: `${formatINR(model.inputs.monthlySip)} SIP @ 14.5% for ${months} months` },
            { label: "× Number of months", value: String(months) },
            { label: "= Total invested (lump-sum + SIP)", value: formatINR(model.sipTotalInvested || 0) },
            { label: "Compounded @ 14.5% CAGR", value: "(monthly compounding)" },
            { label: "Monthly SIP future value", value: formatINR(model.sipMonthlyFutureValue || 0) },
            { label: "Total equity future value (lump-sum + SIP)", value: formatted.values.sipFutureValue, emphasis: true, accent: true },
            { label: "= Wealth created", value: formatINR(model.sipWealthCreated || 0), emphasis: true, accent: true },
          ],
        },
        {
          title: "Outcome",
          rows: [
            { label: "Wealth gap (SIP − property)", value: formatted.values.wealthGap, emphasis: true, accent: true },
            { label: "Winner", value: sipWins ? "SIP" : propertyWins ? "Property" : "Tie", accent: true },
          ],
        },
      ],
    };
  }, [model, formatted, a.maxYears, propertyWins, sipWins]);

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
            title="Mumbai Property vs SIP Calculator"
            subtitle="Should you buy property or invest in SIP? See the math."
          />
        }
        disclaimer={<span className="whitespace-pre-line">{COMPLIANCE_FOOTER}</span>}
      >
        <div className="px-6 pb-6 lg:px-10 lg:pb-10">
          <div className="space-y-8 lg:space-y-0 lg:grid lg:grid-cols-2 lg:gap-10">
            <div className="space-y-6">
              <div className="rounded-xl border border-white/10 bg-white/5 p-4">
                <div className="text-sm font-semibold text-white">Inputs</div>
                <div className="mt-3 grid gap-3">
                  <div className="grid gap-1">
                    <div className="text-xs text-slate-200/70">Property Price (₹)</div>
                    <input
                      type="text"
                      inputMode="numeric"
                      autoComplete="off"
                      value={propertyPriceRaw}
                      onChange={(e) => {
                        markStarted();
                        const raw = String(e.target.value || "").replace(/[^\d]/g, "");
                        setPropertyPriceRaw(raw);
                      }}
                      className="w-full rounded-xl bg-white/5 border border-white/10 px-4 py-3 text-[color:var(--color-matte-gold)] placeholder:text-slate-200/40 transition-colors hover:bg-white/10 hover:border-white/20 focus:outline-none focus:ring-1 focus:ring-[color:var(--color-matte-gold)]"
                    />
                  </div>

                  <div className="grid gap-1">
                    <div className="text-xs text-slate-200/70">Additional Monthly Investment (₹)</div>
                    <div className="text-[11px] text-slate-200/55">(Beyond your ₹{draftPropertyPretty} capital)</div>
                    <input
                      type="text"
                      inputMode="numeric"
                      autoComplete="off"
                      value={monthlySipRaw}
                      onChange={(e) => {
                        markStarted();
                        const raw = String(e.target.value || "").replace(/[^\d]/g, "");
                        setMonthlySipRaw(raw);
                      }}
                      className="w-full rounded-xl bg-white/5 border border-white/10 px-4 py-3 text-[color:var(--color-matte-gold)] placeholder:text-slate-200/40 transition-colors hover:bg-white/10 hover:border-white/20 focus:outline-none focus:ring-1 focus:ring-[color:var(--color-matte-gold)]"
                    />
                  </div>

                  <div className="grid gap-2">
                    <div className="flex items-center justify-between">
                      <div className="text-xs text-slate-200/70">Years</div>
                      <div className="text-xs text-slate-200/60">{clamp(years, 1, a.maxYears)} (max {a.maxYears})</div>
                    </div>
                    <Slider
                      value={[clamp(years, 1, a.maxYears)]}
                      min={1}
                      max={a.maxYears}
                      step={1}
                      onValueChange={(v) => {
                        markStarted();
                        setYears(v?.[0] ?? a.defaultYears);
                      }}
                    />
                  </div>

                  <button
                    type="button"
                    onClick={handleCalculate}
                    disabled={busy}
                    className="bm-btn bm-btn-primary w-full py-3 rounded-xl bm-calc-button"
                  >
                    {busy ? "Calculating…" : "Calculate"}
                  </button>

                  {statusNote ? <div className="text-xs text-slate-200/70">{statusNote}</div> : null}
                </div>
              </div>
            </div>

            <div ref={resultsRef} className="space-y-4" style={{ scrollMarginTop: "96px" }}>
              {showResults && model && formatted ? (
                <>
                  <div className="rounded-xl border border-white/10 bg-white/5 p-4">
                    {sipWins ? (
                      <>
                        <div className="text-sm font-semibold text-white">Result</div>
                        <div className="mt-2 text-white font-semibold">
                          Based on your inputs, investing the same {formatINR(model.inputs.propertyPrice)} into equity (instead of property) results in an estimated
                          <span className="text-[color:var(--color-matte-gold)] font-semibold"> {formatINR(advantageNum)}</span>
                          {" "}higher value over {yearsFinal} years.
                        </div>
                        <div className="mt-3 text-[11px] text-slate-200/70 whitespace-pre-line">{ASSUMPTIONS_LINE}</div>
                      </>
                    ) : propertyWins ? (
                      <>
                        <div className="text-sm font-semibold text-white">Result</div>
                        <div className="mt-2 text-white font-semibold">Your inputs show property outperforming SIP.</div>
                        <div className="mt-3 text-[11px] text-slate-200/70 whitespace-pre-line">{ASSUMPTIONS_LINE}</div>
                      </>
                    ) : (
                      <>
                        <div className="text-sm font-semibold text-white">Result</div>
                        <div className="mt-2 text-white font-semibold">Tie scenario detected. Please adjust inputs.</div>
                        <div className="mt-3 text-[11px] text-slate-200/70 whitespace-pre-line">{ASSUMPTIONS_LINE}</div>
                      </>
                    )}
                  </div>

                  <div className="bm-wealth-gap-showcase">
                    <div className="bm-gap-label">Estimated opportunity cost</div>
                    <div className="bm-gap-amount">₹{formatCroreNumber(wealthGapDisplay)}Cr</div>
                    <div className="bm-gap-impact">
                      That’s about {formatINR(Math.max(0, Math.round(wealthGapDisplay / Math.max(1, yearsFinal * 12))))} per month over {yearsFinal} years.
                    </div>
                  </div>

                  <div className="bm-results-comparison">
                    <div className="bm-result-card bm-result-card--loser">
                      <div className="text-sm text-slate-200/70">Property Value</div>
                      <div className="mt-2 text-xl font-semibold text-white break-words">₹{formatCroreNumber(propertyFutureDisplay)}Cr</div>
                      <div className="mt-2 text-[11px] text-slate-200/60">Illiquid • Slow compounding • High friction</div>
                    </div>

                    <div className="bm-vs-separator" aria-hidden>
                      VS
                    </div>

                    <div className={sipWins ? "bm-result-card bm-result-card--winner" : "bm-result-card"}>
                      {sipWins ? <div className="bm-winner-badge">WINNER</div> : null}
                      <div className="text-sm text-slate-200/70">Equity Future Value</div>
                      <div className={sipWins ? "mt-2 text-2xl font-semibold text-white break-words bm-winner-amount" : "mt-2 text-xl font-semibold text-white break-words"}>
                        ₹{formatCroreNumber(sipFutureDisplay)}Cr
                      </div>
                      <div className="mt-2 text-[11px] text-slate-200/60">
                        Total invested: {formatINR(sipTotalInvestedNum)} • Wealth created: {formatINR(sipWealthCreatedNum)}
                      </div>
                      {sipWins ? (
                        <div className="mt-2 text-sm font-semibold text-[color:var(--color-matte-gold)] break-words whitespace-normal">
                          +₹{formatCroreNumber(wealthGapDisplay)}Cr advantage
                        </div>
                      ) : null}
                    </div>
                  </div>

                  {showPremium ? (
                    <div className="rounded-2xl border border-white/10 bg-white/5 p-5">
                      <div className="text-base font-semibold text-white">🏠 Ready to act on this?</div>
                      <div className="mt-2 text-sm text-slate-200/75">
                        Your {formatINR(model.inputs.propertyPrice)} scenario shows an estimated gap of ₹{gapCr}Cr.
                        Unlock the ₹399 report for the step-by-step roadmap.
                      </div>
                      <div className="mt-4">
                        <PremiumCalculatorCTA
                          labelBefore="Show Me How — ₹399"
                          labelAfter="Preparing Your Report…"
                          price={399}
                          onClickAction={() => {
                            track("premium_click");
                            setLeadOpen(true);
                          }}
                        />
                      </div>

                      <div className="testimonial mt-4 rounded-xl border border-white/10 bg-black/20 p-3 text-[12px] text-slate-200/80">
                        <p>
                          "This calculator made the gap obvious. The report helped me plan the next steps." — Rahul S., Andheri
                        </p>
                      </div>

                      <div className="mt-3 text-xs text-slate-200/70">Instant PDF • Based on your ₹{propertyCr}Cr scenario</div>
                    </div>
                  ) : null}

                  <div className="trust-badges text-[11px] text-slate-200/70 space-y-1">
                    <p>✓ 1,200+ calculations done</p>
                    <p>✓ ARN 90008 registered</p>
                    <p>✓ Used by Mumbai professionals</p>
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
                    {showBreakdown && breakdownModel ? (
                      <div className="mt-3">
                        <BreakdownPanel {...breakdownModel} />
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
          animation: bmPulse 2.2s ease-in-out infinite;
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

        .bm-wealth-gap-showcase {
          text-align: center;
          padding: 36px 18px;
          background: radial-gradient(
            circle at center,
            color-mix(in oklab, var(--color-matte-gold) 16%, transparent) 0%,
            transparent 70%
          );
          border: 1px solid color-mix(in oklab, var(--color-matte-gold) 25%, transparent);
          border-radius: 16px;
        }

        .bm-gap-label {
          font-size: 12px;
          letter-spacing: 0.16em;
          text-transform: uppercase;
          color: color-mix(in oklab, var(--color-matte-gold) 88%, white 12%);
          margin-bottom: 10px;
        }

        .bm-gap-amount {
          font-weight: 900;
          line-height: 1;
          font-size: 64px;
          color: var(--color-matte-gold);
          text-shadow: 0 0 28px color-mix(in oklab, var(--color-matte-gold) 35%, transparent);
          margin-bottom: 10px;
        }

        .bm-gap-impact {
          font-size: 13px;
          color: color-mix(in oklab, white 75%, transparent);
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
          .bm-gap-amount {
            font-size: 44px;
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
        title="What Do I Do Now? — ₹399"
        body={`Get your personalized roadmap to move from property to wealth-compounding equity.\n\nWhat you'll receive:\n\n📋 YOUR COMPLETE EXIT PLAN\n- Month-by-month transition timeline\n- Capital gains tax minimization\n- Equity allocation strategy\n- Risk management framework\n\n💰 WEALTH RECOVERY ROADMAP\n- How to recover ₹${gapCr}Cr opportunity cost\n- Mumbai property exit timing guide\n- Hybrid allocation options\n- Family conversation script\n\n📊 MUMBAI MARKET INTELLIGENCE\n- Locality-wise data (2015–2025)\n- Price trend reality check\n- Where smart money is moving\n- When property makes sense (rare)\n\n✓ Instant download\n✓ Email delivery\n✓ Support via WhatsApp`}
        freeLabel="Email Summary"
        payLabel="Send It Now — ₹399"
        payButtonClassName="calculator-premium-cta"
        optInLabel="Send investment tips via WhatsApp"
        whatsappHelpText="Optional for Email Summary. For premium, WhatsApp helps us support delivery if email fails. Use +91XXXXXXXXXX."
        footerNote={`This is an illustrative educational tool based on your inputs and locked assumptions. Not SEBI-registered investment advice. Consult a financial advisor before making decisions.\n\nARN 90008 | IRDAI 277925 | Educational purposes only`}
      />

      <ExitIntentModal
        open={exitOpen}
        onOpenChange={setExitOpen}
        suppressKey="pvs_exit_intent_suppress"
        title={`Wait. Don't lose ₹${gapCr}Cr.`}
        bodyPrimary={`Your calculation shows ₹${gapCr}Cr opportunity cost over ${yearsFinal} years.\n\nMost Mumbai property owners never see this clearly.\n\nWant to understand your options?`}
        bodySecondary=""
        primaryLabel="Show Me How — ₹399"
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
