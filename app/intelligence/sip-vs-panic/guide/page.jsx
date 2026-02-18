import Link from "next/link";

import { buildMetadata } from "@/lib/seo/metadata";
import FAQSection from "@/components/shared/FAQSection";

const PATH = "/intelligence/sip-vs-panic/guide";

export const metadata = buildMetadata({
  title: "Should you stop SIP during a crash? (Guide + Simulator) | BM Wealth",
  description:
    "A practical, education-only guide to stopping SIPs during market drawdowns — what it can cost, what to check before acting, and how to use the SIP vs Panic simulator.",
  path: PATH,
  type: "article",
});

export default function SipVsPanicGuidePage() {
  const articleSchema = {
    "@context": "https://schema.org",
    "@type": "Article",
    headline: "Should you stop SIP during a crash? (Guide + Simulator)",
    description:
      "Education-only guide to the common mistake of stopping SIPs during market drawdowns, with a simulator to visualize behavior cost.",
    mainEntityOfPage: {
      "@type": "WebPage",
      "@id": `https://www.bmwealth.co.in${PATH}`,
    },
    author: {
      "@type": "Organization",
      name: "BM Wealth",
      url: "https://www.bmwealth.co.in",
    },
    publisher: {
      "@type": "Organization",
      name: "BM Wealth",
      url: "https://www.bmwealth.co.in",
    },
  };

  const faqs = [
    {
      question: "Is it ever rational to pause a SIP during a crash?",
      answer:
        "It can be rational if the SIP amount is no longer sustainable for your cashflow, your emergency fund is insufficient, or the original risk level no longer matches your goals. It is usually not rational purely because prices are down.",
    },
    {
      question: "Why does stopping SIP during a crash often hurt outcomes?",
      answer:
        "Because you stop buying when prices are lower and often restart after prices recover, which can reduce long-term accumulation. The simulator visualizes this behavior gap as an education-only example.",
    },
    {
      question: "Does the simulator predict the market?",
      answer:
        "No. It uses a deterministic educational market path (with crash-style presets) to teach behavior trade-offs, not to forecast returns.",
    },
  ];

  return (
    <main className="px-6 lg:px-10 py-14 lg:py-20">
      <script
        type="application/ld+json"
        dangerouslySetInnerHTML={{ __html: JSON.stringify(articleSchema) }}
      />

      <div className="max-w-4xl mx-auto">
        <h1 className="text-3xl sm:text-4xl font-semibold gold-gradient-text">
          Should you stop SIP during a crash?
        </h1>
        <p className="mt-4 text-sm sm:text-base text-white/75">
          Most investors don’t fail because they pick the “wrong fund” — they fail because
          they change behavior at the worst time. This page is education-only (not advice)
          and helps you sanity-check the decision.
        </p>

        <div className="mt-6 rounded-2xl border border-white/10 bg-black/25 p-5">
          <div className="text-xs font-semibold text-white/85">Quick answer</div>
          <p className="mt-2 text-sm text-white/70 leading-relaxed">
            If you are stopping SIP purely because markets are down, that decision often
            hurts long-term outcomes. If you are stopping because your cashflow can’t
            support it or your risk level is genuinely mis-matched, that’s a different
            conversation.
          </p>

          <div className="mt-4 flex flex-wrap items-center gap-3 text-sm">
            <Link
              href="/intelligence/sip-vs-panic"
              className="text-[oklch(0.78_0.08_65)] hover:opacity-90"
              data-ga-event="tool_open"
              data-ga-label="guide_open_simulator"
            >
              Open the simulator →
            </Link>
            <span className="text-white/25">•</span>
            <Link
              href="/sip"
              className="text-[oklch(0.78_0.08_65)] hover:opacity-90"
              data-ga-event="tool_internal_link"
              data-ga-label="guide_to_sip"
            >
              SIP basics →
            </Link>
            <span className="text-white/25">•</span>
            <Link
              href="/mutual-funds"
              className="text-[oklch(0.78_0.08_65)] hover:opacity-90"
              data-ga-event="tool_internal_link"
              data-ga-label="guide_to_mutual_funds"
            >
              Mutual funds →
            </Link>
          </div>
        </div>

        <section className="mt-10">
          <h2 className="text-xl font-semibold text-white/90">
            A simple decision checklist
          </h2>
          <div className="mt-4 grid grid-cols-1 gap-3">
            {[
              {
                t: "1) Cashflow first",
                d: "If you don’t have an emergency buffer, pausing may be about survival—not fear.",
              },
              {
                t: "2) Horizon check",
                d: "If your goal horizon is long, drawdowns are expected. Short horizons should not take equity-like volatility.",
              },
              {
                t: "3) Risk comfort",
                d: "If your risk comfort is lower than your allocation, fix the plan—don’t rage-quit at the bottom.",
              },
              {
                t: "4) Behavior cost",
                d: "Before acting, quantify the trade-off. Use the simulator to visualize a disciplined vs panic rule under the same path.",
              },
            ].map((x) => (
              <div key={x.t} className="rounded-2xl border border-white/10 bg-black/20 p-4">
                <div className="text-sm font-semibold text-white/85">{x.t}</div>
                <div className="mt-1 text-sm text-white/70 leading-relaxed">{x.d}</div>
              </div>
            ))}
          </div>
        </section>

        <section className="mt-10">
          <FAQSection faqs={faqs} pageUrl={`https://www.bmwealth.co.in${PATH}`} />
        </section>

        <section className="mt-10">
          <h2 className="text-xl font-semibold text-white/90">
            Use the simulator the right way
          </h2>
          <ol className="mt-3 list-decimal list-inside text-sm text-white/70 space-y-2">
            <li>Set a realistic monthly SIP amount and horizon (3+ years shows crash+recovery best).</li>
            <li>Pick a crash preset and a panic behavior (stop SIP, reduce, delay restart).</li>
            <li>
              Compare post-tax outcomes and note the behavioral gap. Treat the number as
              education-only, not a prediction.
            </li>
          </ol>
        </section>

        <section className="mt-10">
          <h2 className="text-xl font-semibold text-white/90">Next steps</h2>
          <p className="mt-3 text-sm text-white/70 leading-relaxed">
            If you want more tools like this, explore the Intelligence hub.
          </p>
          <div className="mt-3">
            <Link
              href="/intelligence"
              className="text-[oklch(0.78_0.08_65)] hover:opacity-90"
              data-ga-event="tool_internal_link"
              data-ga-label="guide_to_intelligence"
            >
              Explore Intelligence →
            </Link>
          </div>
        </section>

        <p className="mt-10 text-xs text-white/50 leading-relaxed">
          Disclosure: This page and simulator are for education only and do not constitute
          investment advice or a recommendation.
        </p>
      </div>
    </main>
  );
}
