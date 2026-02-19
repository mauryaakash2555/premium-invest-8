"use client";

/**
 * Public Onboarding Page — SEO optimised, no login required, lead capture enabled.
 * Uses OnboardingEngine in "public" mode with showSeo=true.
 * Design: dark theme matching client-portal (#0A0B0D). NO gold/yellow/muddy colours.
 */

import { useState } from "react";
import OnboardingEngine from "@/components/onboarding/OnboardingEngine";
import {
  onboardingSteps,
  onboardingFaqs,
} from "@/components/onboarding/onboardingSteps";
import LaserFooter from "@/components/user/LaserFooter";

/* ───────── Detect ?mode=staff ───────── */
function useStaffMode() {
  if (typeof window === "undefined") return false;
  try { return new URLSearchParams(window.location.search).get("mode") === "staff"; } catch { return false; }
}

/* ───────── Lead capture bar ───────── */
function LeadCapture() {
  const [name, setName] = useState("");
  const [phone, setPhone] = useState("");
  const [email, setEmail] = useState("");
  const [submitted, setSubmitted] = useState(false);
  const [loading, setLoading] = useState(false);

  const handleSubmit = async (e) => {
    e.preventDefault();
    if (!email.trim() && !phone.trim()) return;
    setLoading(true);
    try {
      /* Store in onboarding_leads table */
      await fetch("/api/onboarding/lead", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          name: name.trim() || null,
          phone: phone.trim() || null,
          email: email.trim() || null,
          source: "onboarding_public",
        }),
      });
      /* Also capture in main leads for followup sequences */
      if (email.trim()) {
        await fetch("/api/leads/capture", {
          method: "POST",
          headers: { "Content-Type": "application/json" },
          body: JSON.stringify({
            email: email.trim(),
            name: name.trim() || undefined,
            phone: phone.trim() || undefined,
            source: "onboarding_public",
            page: "/onboarding",
          }),
        });
      }
    } catch {
      /* non-blocking */
    }
    setSubmitted(true);
    setLoading(false);
  };

  if (submitted) {
    return (
      <div
        className="rounded-xl p-5 text-center"
        style={{
          background: "rgba(255,255,255,0.03)",
          border: "1px solid rgba(255,255,255,0.08)",
        }}
      >
        <p className="text-[14px] text-white/70">
          Thank you! We will send you a step-by-step onboarding checklist.
        </p>
      </div>
    );
  }

  return (
    <form
      onSubmit={handleSubmit}
      className="rounded-xl p-5 space-y-3"
      style={{
        background: "rgba(255,255,255,0.03)",
        border: "1px solid rgba(255,255,255,0.08)",
      }}
    >
      <div>
        <p className="text-[14px] font-semibold text-white/80 mb-1">
          Need help with onboarding? Leave your details.
        </p>
        <p className="text-[12px] text-white/40">
          Our advisor will guide you through the process — no spam, ever.
        </p>
      </div>
      <div className="flex flex-col sm:flex-row gap-3">
        <input
          type="text"
          value={name}
          onChange={(e) => setName(e.target.value)}
          placeholder="Name"
          className="px-4 py-2.5 rounded-lg text-[13px] text-white/90 placeholder:text-white/30 outline-none flex-1"
          style={{
            background: "rgba(255,255,255,0.06)",
            border: "1px solid rgba(255,255,255,0.1)",
          }}
        />
        <input
          type="tel"
          value={phone}
          onChange={(e) => setPhone(e.target.value)}
          placeholder="Phone"
          className="px-4 py-2.5 rounded-lg text-[13px] text-white/90 placeholder:text-white/30 outline-none flex-1"
          style={{
            background: "rgba(255,255,255,0.06)",
            border: "1px solid rgba(255,255,255,0.1)",
          }}
        />
        <input
          type="email"
          value={email}
          onChange={(e) => setEmail(e.target.value)}
          placeholder="Email"
          className="px-4 py-2.5 rounded-lg text-[13px] text-white/90 placeholder:text-white/30 outline-none flex-1"
          style={{
            background: "rgba(255,255,255,0.06)",
            border: "1px solid rgba(255,255,255,0.1)",
          }}
        />
      </div>
      <button
        type="submit"
        disabled={loading}
        className="w-full sm:w-auto px-5 py-2.5 rounded-lg text-[13px] font-semibold text-white transition-colors hover:bg-white/15 disabled:opacity-50"
        style={{
          background: "rgba(255,255,255,0.10)",
          border: "1px solid rgba(255,255,255,0.15)",
        }}
      >
        {loading ? "Sending…" : "Get Assistance"}
      </button>
    </form>
  );
}

/* ───────── FAQ schema (JSON-LD) ───────── */
function FaqSchema({ faqs }) {
  const schema = {
    "@context": "https://schema.org",
    "@type": "FAQPage",
    mainEntity: faqs.map((f) => ({
      "@type": "Question",
      name: f.question,
      acceptedAnswer: { "@type": "Answer", text: f.answer },
    })),
  };
  return (
    <script
      type="application/ld+json"
      dangerouslySetInnerHTML={{ __html: JSON.stringify(schema) }}
    />
  );
}

/* ───────── Main page ───────── */
export default function PublicOnboardingPage() {
  const staffMode = useStaffMode();

  return (
    <main
      className="min-h-screen"
      style={{
        background: `
          radial-gradient(ellipse 80% 50% at 50% -20%, rgba(100, 150, 255, 0.06) 0%, transparent 50%),
          linear-gradient(180deg, #0A0B0D 0%, #0D0E12 100%)
        `,
        paddingTop: "100px",
        paddingBottom: "80px",
      }}
    >
      <FaqSchema faqs={onboardingFaqs} />

      <div className="max-w-[760px] mx-auto px-4">
        {/* H1 — SEO target */}
        <h1 className="text-[28px] sm:text-[34px] font-bold text-white/95 leading-tight mb-3">
          Check Mutual Fund KYC Status, PAN Aadhaar Link &amp; KRA Verification Online
        </h1>
        <p className="text-[15px] text-white/50 leading-relaxed mb-8 max-w-[600px]">
          Before starting SIP or investing in mutual funds in India, investors must
          complete PAN–Aadhaar linking, KYC registration, and verification across KRAs.
          This onboarding guide helps you check your status, validate KYC, and proceed
          to investment in a structured step-by-step process.
        </p>

        {/* Lead capture */}
        <div className="mb-8">
          <LeadCapture />
        </div>

        {/* Onboarding engine */}
        <OnboardingEngine
          steps={onboardingSteps}
          mode="public"
          showSeo={true}
          staffMode={staffMode}
        />

        {/* FAQ section (visible for SEO) */}
        <section className="mt-16">
          <h2 className="text-[22px] font-bold text-white/90 mb-6">
            Frequently Asked Questions
          </h2>
          <div className="space-y-4">
            {onboardingFaqs.map((f) => (
              <details
                key={f.question}
                className="rounded-xl border group"
                style={{
                  background: "rgba(255,255,255,0.02)",
                  borderColor: "rgba(255,255,255,0.06)",
                }}
              >
                <summary className="px-5 py-4 cursor-pointer text-[14px] font-medium text-white/80 list-none flex items-center justify-between">
                  <span>{f.question}</span>
                  <ChevronIcon />
                </summary>
                <div className="px-5 pb-4 text-[13px] text-white/50 leading-relaxed">
                  {f.answer}
                </div>
              </details>
            ))}
          </div>
        </section>

        {/* Compliance footer */}
        <p className="mt-16 text-[11px] text-white/25 text-center leading-relaxed">
          BM Wealth (AMFI ARN 90008 · IRDAI 277925 · PMS 2430447816). External
          links open government and KRA portals — BM Wealth does not control
          their availability. Educational content only — not investment advice.
        </p>
      </div>

      <LaserFooter />
    </main>
  );
}

function ChevronIcon() {
  return (
    <svg
      className="w-4 h-4 shrink-0 text-white/30 transition-transform group-open:rotate-180"
      fill="none"
      viewBox="0 0 24 24"
      stroke="currentColor"
      strokeWidth={2}
    >
      <path strokeLinecap="round" strokeLinejoin="round" d="M19 9l-7 7-7-7" />
    </svg>
  );
}
