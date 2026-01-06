/**
 * FILE: app\sip-calculator\page.js
 * PURPOSE: (auto-added) Explain what this file does.
 * CATEGORY: app
 *
 * DEPENDENCIES:
 * - react
 * - @/data/sipPlans.json
 *
 * USED BY:
 * - (search the repo for this filename)
 *
 * SIMPLE EXPLANATION:
 * This file is part of the app.
 * It helps one specific feature work correctly.
 *
 * TO MODIFY:
 * - 🔧 Search for "TO MODIFY" notes inside the file.
 */

"use client";

import { useRouter } from "next/navigation";
import Link from "next/link";
import sipPlans from "@/data/sipPlans.json";
import SipCalculatorWidget from "@/components/calculators/SipCalculatorWidget";

export default function SipCalculatorPage() {
  const router = useRouter();

  return (
    <div className="space-y-6">
      {/* Minimal header: back/close controls; brand hidden via Navigation.jsx */}
      <div className="flex items-center justify-between">
        <button
          type="button"
          onClick={() => router.back()}
          className="rounded-md border border-white/15 bg-white/5 px-3 py-2 text-xs tracking-wider hover:bg-white/10"
          aria-label="Go back"
        >
          ← Back
        </button>
        <Link
          href="/"
          className="rounded-md border border-white/15 bg-white/5 px-3 py-2 text-xs tracking-wider hover:bg-white/10"
          aria-label="Close calculator"
        >
          Close
        </Link>
      </div>
      <div>
        <p className="text-xs uppercase tracking-[0.2em] text-blue-200/70">Planner</p>
        <h1 className="text-3xl font-semibold text-white">SIP Calculator</h1>
        <p className="text-sm text-slate-200/80">Estimate outcomes for a monthly SIP over time.</p>
      </div>

      <SipCalculatorWidget title="SIP Calculator" subtitle="Adjust the inputs to estimate your invested amount and potential growth." plans={sipPlans} />
    </div>
  );
}

