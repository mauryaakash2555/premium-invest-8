"use client";

import Link from "next/link";
import { useState } from "react";

const INTEREST_OPTIONS = [
  "Getting started with SIP",
  "Understanding PMS (₹50L+ portfolio)",
  "General wealth planning",
];

export default function BlueprintClient() {
  const [form, setForm] = useState({ name: "", email: "", phone: "", interest: "" });
  const [submitting, setSubmitting] = useState(false);
  const [result, setResult] = useState(null); // { ok, name } or { ok:false, error }

  function handleChange(e) {
    setForm((prev) => ({ ...prev, [e.target.name]: e.target.value }));
  }

  async function handleSubmit(e) {
    e.preventDefault();
    setSubmitting(true);
    setResult(null);

    try {
      const res = await fetch("/api/leads", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          name: form.name.trim(),
          email: form.email.trim(),
          phone: form.phone.trim(),
          interest: form.interest,
          source: "blueprint",
        }),
      });

      const json = await res.json().catch(() => ({}));

      if (res.ok && json.ok) {
        setResult({ ok: true, name: form.name.trim().split(" ")[0] || "there" });
      } else {
        setResult({ ok: false, error: json.error || "Something went wrong. Please try again or WhatsApp us directly." });
      }
    } catch {
      setResult({ ok: false, error: "Something went wrong. Please try again or WhatsApp us directly." });
    } finally {
      setSubmitting(false);
    }
  }

  const phoneValid = /^\d{10}$/.test(form.phone.replace(/\s/g, ""));

  return (
    <main className="min-h-screen bg-black text-white">
      <section className="px-6 lg:px-10 py-12 lg:py-20">
        <div className="max-w-5xl mx-auto">

          {/* BACK BUTTON */}
          <Link
            href="/"
            className="inline-flex items-center gap-2 text-white/50 hover:text-white/80 transition-colors duration-300 text-[13px] tracking-wide no-underline mb-10"
          >
            <span aria-hidden>←</span>
            <span>Back to Home</span>
          </Link>

          {/* PAGE HEADER */}
          <div className="mb-12 lg:mb-16">
            <p className="text-[11px] tracking-[0.18em] uppercase text-white/50 mb-4">
              BM Wealth &bull; Wealth Planning
            </p>
            <h1
              className="text-3xl lg:text-5xl font-light leading-tight mb-4"
              style={{ color: "var(--lux-accent)", fontFamily: "'Playfair Display', serif" }}
            >
              Your Wealth Planning Blueprint
            </h1>
            <p className="text-base lg:text-lg text-white/60 leading-relaxed max-w-2xl">
              A structured starting point for serious investors — understand your options clearly before making any decision.
            </p>
          </div>

          {/* TWO COLUMN LAYOUT */}
          <div className="grid lg:grid-cols-2 gap-10 lg:gap-14 mb-16">

            {/* LEFT COLUMN — What's Inside */}
            <div>
              <h2
                className="text-xl lg:text-2xl font-light mb-6"
                style={{ color: "var(--lux-accent)", fontFamily: "'Playfair Display', serif" }}
              >
                What you&apos;ll receive
              </h2>

              <ul className="space-y-4 mb-8">
                {[
                  "Understanding SIP and how it builds wealth over time",
                  "Key differences between Mutual Funds and Portfolio Management Services (PMS)",
                  "Common mistakes Indian investors make and how to avoid them",
                  "A simple framework to evaluate your investment readiness",
                ].map((item, i) => (
                  <li key={i} className="flex items-start gap-3">
                    <span
                      className="mt-1 inline-flex items-center justify-center w-5 h-5 rounded-full text-[11px] font-semibold shrink-0"
                      style={{ backgroundColor: "var(--lux-accent)", color: "#000" }}
                    >
                      {i + 1}
                    </span>
                    <span className="text-[15px] lg:text-base text-white/75 leading-relaxed">{item}</span>
                  </li>
                ))}
              </ul>

              <p className="text-[12px] text-white/40 leading-relaxed">
                Educational content only. Not investment advice.
              </p>
            </div>

            {/* RIGHT COLUMN — Lead Capture Form */}
            <div
              className="rounded-2xl border p-6 lg:p-8"
              style={{
                borderColor: "rgba(255,255,255,0.10)",
                background: "linear-gradient(135deg, rgba(255,255,255,0.04) 0%, rgba(255,255,255,0.01) 100%)",
              }}
            >
              {result?.ok ? (
                /* SUCCESS STATE */
                <div className="flex flex-col items-center justify-center text-center py-8">
                  <div
                    className="w-14 h-14 rounded-full flex items-center justify-center mb-5"
                    style={{ backgroundColor: "var(--lux-accent)" }}
                  >
                    <svg width="28" height="28" viewBox="0 0 24 24" fill="none" stroke="#000" strokeWidth="2.5" strokeLinecap="round" strokeLinejoin="round">
                      <polyline points="20 6 9 17 4 12" />
                    </svg>
                  </div>
                  <p className="text-lg font-light mb-2" style={{ color: "var(--lux-accent)" }}>
                    Thank you {result.name}!
                  </p>
                  <p className="text-[14px] text-white/60 leading-relaxed">
                    Your guide request has been noted. We&apos;ll reach out shortly.
                  </p>
                </div>
              ) : (
                /* FORM */
                <>
                  <h2
                    className="text-xl lg:text-2xl font-light mb-6"
                    style={{ color: "var(--lux-accent)", fontFamily: "'Playfair Display', serif" }}
                  >
                    Get Your Free Guide
                  </h2>

                  {result && !result.ok && (
                    <p className="text-[13px] text-red-400 mb-4">{result.error}</p>
                  )}

                  <form onSubmit={handleSubmit} className="space-y-4">
                    <div>
                      <label className="block text-[12px] text-white/50 tracking-wide uppercase mb-1.5">Full Name</label>
                      <input
                        name="name"
                        type="text"
                        required
                        value={form.name}
                        onChange={handleChange}
                        placeholder="Your full name"
                        className="w-full px-4 py-3 rounded-lg text-[14px] text-white/90 placeholder-white/30 outline-none transition-colors duration-300 focus:border-[color:var(--lux-accent)]"
                        style={{ background: "rgba(255,255,255,0.05)", border: "1px solid rgba(255,255,255,0.12)" }}
                      />
                    </div>

                    <div>
                      <label className="block text-[12px] text-white/50 tracking-wide uppercase mb-1.5">Email Address</label>
                      <input
                        name="email"
                        type="email"
                        required
                        value={form.email}
                        onChange={handleChange}
                        placeholder="you@example.com"
                        className="w-full px-4 py-3 rounded-lg text-[14px] text-white/90 placeholder-white/30 outline-none transition-colors duration-300 focus:border-[color:var(--lux-accent)]"
                        style={{ background: "rgba(255,255,255,0.05)", border: "1px solid rgba(255,255,255,0.12)" }}
                      />
                    </div>

                    <div>
                      <label className="block text-[12px] text-white/50 tracking-wide uppercase mb-1.5">Phone Number</label>
                      <input
                        name="phone"
                        type="tel"
                        required
                        inputMode="numeric"
                        pattern="\d{10}"
                        maxLength={10}
                        value={form.phone}
                        onChange={(e) => {
                          const v = e.target.value.replace(/\D/g, "").slice(0, 10);
                          setForm((prev) => ({ ...prev, phone: v }));
                        }}
                        placeholder="10-digit mobile number"
                        className="w-full px-4 py-3 rounded-lg text-[14px] text-white/90 placeholder-white/30 outline-none transition-colors duration-300 focus:border-[color:var(--lux-accent)]"
                        style={{ background: "rgba(255,255,255,0.05)", border: "1px solid rgba(255,255,255,0.12)" }}
                      />
                    </div>

                    <div>
                      <label className="block text-[12px] text-white/50 tracking-wide uppercase mb-1.5">I am interested in</label>
                      <select
                        name="interest"
                        required
                        value={form.interest}
                        onChange={handleChange}
                        className="w-full px-4 py-3 rounded-lg text-[14px] text-white/90 outline-none transition-colors duration-300 focus:border-[color:var(--lux-accent)] appearance-none"
                        style={{
                          background: "rgba(255,255,255,0.05)",
                          border: "1px solid rgba(255,255,255,0.12)",
                          color: form.interest ? undefined : "rgba(255,255,255,0.30)",
                        }}
                      >
                        <option value="" disabled>Select an option</option>
                        {INTEREST_OPTIONS.map((opt) => (
                          <option key={opt} value={opt} style={{ background: "#111", color: "#eee" }}>
                            {opt}
                          </option>
                        ))}
                      </select>
                    </div>

                    <button
                      type="submit"
                      disabled={submitting || !form.name || !form.email || !phoneValid || !form.interest}
                      className="group relative w-full overflow-hidden py-3.5 md:py-4 transition-[color,opacity,transform] duration-500 disabled:opacity-40"
                      style={{ backgroundColor: "oklch(0.95 0.01 85)", color: "oklch(0.06 0.005 280)" }}
                    >
                      <span className="relative z-10 flex items-center justify-center gap-3 font-sans text-[11px] tracking-[0.22em] uppercase font-semibold">
                        {submitting ? "Sending…" : "Send Me the Guide"}
                        {!submitting && (
                          <svg className="h-3.5 w-3.5 transition-transform duration-500 group-hover:translate-x-1.5" xmlns="http://www.w3.org/2000/svg" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"><line x1="5" y1="12" x2="19" y2="12"/><polyline points="12 5 19 12 12 19"/></svg>
                        )}
                      </span>
                      <span
                        aria-hidden="true"
                        className="absolute inset-0 -translate-x-[101%] group-hover:translate-x-0 transition-transform duration-500"
                        style={{ backgroundColor: "var(--lux-accent)" }}
                      />
                    </button>
                  </form>

                  <p className="mt-4 text-[11px] text-white/35 leading-relaxed text-center">
                    We&apos;ll send your guide once it&apos;s ready. No spam, no cold calls.
                  </p>
                </>
              )}
            </div>
          </div>

          {/* DISCLAIMER */}
          <div className="text-center">
            <p className="text-[11px] text-white/30 leading-relaxed max-w-3xl mx-auto">
              BM Wealth is a PMS distributor (Cert. 2430447816), AMFI-registered mutual fund distributor
              (ARN 90008), and IRDAI-licensed insurance distributor (277925). This page is for educational
              purposes only and does not constitute investment advice. Mutual fund investments are subject
              to market risks.
            </p>
          </div>

        </div>
      </section>
    </main>
  );
}
