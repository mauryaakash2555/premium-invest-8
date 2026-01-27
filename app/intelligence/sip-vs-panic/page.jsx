import { buildMetadata } from "@/lib/seo/metadata";
import SIPPanicPage from "@/intelligence/ui/sip-panic/SIPPanicPage";
import Link from "next/link";
import CrisisModeBanner from "@/components/intelligence/CrisisModeBanner";

const PATH = "/intelligence/sip-vs-panic";

export async function generateMetadata({ searchParams }) {
  const sp = await searchParams;
  const share = String(sp?.share || "") === "1";

  const monthly = Number(sp?.m || 0);
  const years = Number(sp?.y || 0);
  const cost = Number(sp?.cost || 0);
  const disc = Number(sp?.disc || 0);
  const panic = Number(sp?.panic || 0);
  const tax = String(sp?.tax || "");
  const rc = String(sp?.rc || "");
  const crash = String(sp?.crash || "");
  const partner = String(sp?.partner || "");

  const title = share
    ? `SIP vs Panic: Potential cost ${Number.isFinite(cost) ? `₹${(Math.max(0, cost) / 100_000).toFixed(2)}L` : ""} | BM Wealth`
    : "SIP vs Panic Selling Simulator | BM Wealth";

  const description = share
    ? `Education-only result: ₹${Number.isFinite(monthly) ? monthly.toLocaleString("en-IN") : "10,000"}/month for ${Number.isFinite(years) ? years : 10} years. See the post-tax behavioral cost of stopping SIP during drawdowns.${crash ? ` Crash preset: ${crash}.` : ""}${rc ? ` Risk comfort: ${rc}.` : ""}`
    : "What happens if you stop your SIP during a market crash? Compare disciplined investing vs panic-selling and see the post-tax cost of fear.";

  const og = share
    ? `/api/og/sip-vs-panic?m=${encodeURIComponent(String(monthly || 0))}&y=${encodeURIComponent(String(years || 0))}&cost=${encodeURIComponent(String(cost || 0))}&disc=${encodeURIComponent(String(disc || 0))}&panic=${encodeURIComponent(String(panic || 0))}&tax=${encodeURIComponent(tax)}&rc=${encodeURIComponent(rc)}&crash=${encodeURIComponent(crash)}&partner=${encodeURIComponent(partner)}`
    : "/logo.png";

  return {
    ...buildMetadata({
      title,
      description,
      path: PATH,
      type: "website",
      image: og,
    }),
    keywords:
      "SIP vs panic selling, SIP crash simulator, behavioral finance, stop SIP during crash, rupee cost averaging, investor behavior cost, BM Wealth intelligence",
  };
}

export default function SIPPanicRoutePage() {
  const faqs = [
    {
      q: "Is stopping SIP during a crash a good idea?",
      a: "In many long-horizon cases, stopping during drawdowns can reduce your final corpus because you miss lower purchase prices and the recovery compounding. This simulator illustrates that behavior trade-off; it’s not a recommendation.",
    },
    {
      q: "What does “behavioral cost” mean here?",
      a: "It’s the difference between the post-tax outcome of staying disciplined vs the selected panic behavior, under the same education-only market path and simplified tax model.",
    },
    {
      q: "Does this use real historical market data?",
      a: "No. It uses a deterministic educational market path (with optional crash-style presets) to teach behavior under stress. It is not a forecast.",
    },
    {
      q: "How is tax calculated?",
      a: "The simulator applies simplified India-style equity capital gains tax logic (including an annual LTCG exemption concept and optional surcharge/cess assumptions). Actual taxes depend on your holdings, period, and rules.",
    },
    {
      q: "Why does the 2-year simulation look calmer?",
      a: "The core simulator intentionally avoids the “Year-3 crash” pattern for very short horizons so the educational story matches the timeframe. Use 3+ years for crash-and-recovery behavior lessons.",
    },
    {
      q: "Can I share or embed this calculator?",
      a: "Yes. You can share a result via WhatsApp, and you can embed the calculator using the /embed/sip-vs-panic route. Embedded views are for distribution and education.",
    },
  ];

  const schema = {
    "@context": "https://schema.org",
    "@type": "WebApplication",
    name: "SIP vs Panic Selling",
    applicationCategory: "FinanceApplication",
    operatingSystem: "Web",
    url: `https://bmwealth.co.in${PATH}`,
    description:
      "An education-only simulator showing the post-tax behavioral cost of stopping a SIP during market drawdowns.",
    publisher: {
      "@type": "Organization",
      name: "BM Wealth",
      url: "https://bmwealth.co.in",
    },
  };

  const faqSchema = {
    "@context": "https://schema.org",
    "@type": "FAQPage",
    mainEntity: faqs.map((f) => ({
      "@type": "Question",
      name: f.q,
      acceptedAnswer: { "@type": "Answer", text: f.a },
    })),
  };

  return (
    <>
      <CrisisModeBanner placement="sip_vs_panic" />

      <script
        type="application/ld+json"
        dangerouslySetInnerHTML={{ __html: JSON.stringify(schema) }}
      />
      <script
        type="application/ld+json"
        dangerouslySetInnerHTML={{ __html: JSON.stringify(faqSchema) }}
      />

      {/*
        Server-rendered explainer (SEO + comprehension):
        Keeps the simulator powerful while making the “what/why/how” obvious for first-time users.
      */}
      <section className="px-6 lg:px-10 pt-10 pb-6">
        <div className="max-w-5xl mx-auto">
          <h1 className="text-2xl sm:text-3xl font-semibold gold-gradient-text">SIP vs Panic Selling</h1>
          <p className="mt-2 text-sm sm:text-base text-white/75 max-w-3xl">
            Education-only simulator to visualize the post-tax cost of stopping SIPs during drawdowns. It’s not a forecast.
          </p>

          <div className="mt-4 grid grid-cols-1 md:grid-cols-3 gap-3">
            {[
              { t: "1) Set your plan", d: "Monthly SIP + time horizon" },
              { t: "2) Pick a crash", d: "2008 / 2020 / 2022-style preset" },
              { t: "3) Compare behavior", d: "Discipline vs panic rules (post-tax)" },
            ].map((x) => (
              <div key={x.t} className="rounded-2xl border border-white/10 bg-black/25 p-4">
                <div className="text-xs font-semibold text-white/85">{x.t}</div>
                <div className="mt-1 text-[12px] text-white/65">{x.d}</div>
              </div>
            ))}
          </div>

          <div className="mt-4 flex flex-wrap items-center gap-3 text-sm">
            <Link
              href="/sip"
              className="text-[oklch(0.78_0.08_65)] hover:opacity-90"
              data-ga-event="tool_internal_link"
              data-ga-label="sip_vs_panic_to_sip"
            >
              What is SIP? →
            </Link>
            <span className="text-white/25">•</span>
            <Link
              href="/intelligence/sip-vs-panic/guide"
              className="text-[oklch(0.78_0.08_65)] hover:opacity-90"
              data-ga-event="tool_internal_link"
              data-ga-label="sip_vs_panic_to_guide"
            >
              Read the crash guide →
            </Link>
            <span className="text-white/25">•</span>
            <Link
              href="/blog"
              className="text-[oklch(0.78_0.08_65)] hover:opacity-90"
              data-ga-event="tool_internal_link"
              data-ga-label="sip_vs_panic_to_blog"
            >
              Read investing guides →
            </Link>
            <span className="text-white/25">•</span>
            <Link
              href="/intelligence"
              className="text-[oklch(0.78_0.08_65)] hover:opacity-90"
              data-ga-event="tool_internal_link"
              data-ga-label="sip_vs_panic_to_intelligence"
            >
              Explore more simulators →
            </Link>
          </div>
        </div>
      </section>

      <SIPPanicPage faqs={faqs} />

      <noscript>
        <section className="px-6 lg:px-10 py-10">
          <div className="max-w-5xl mx-auto rounded-2xl border border-white/10 bg-black/25 p-5">
            <h2 className="text-base font-semibold text-white/90">JavaScript is required</h2>
            <p className="mt-2 text-sm text-white/70">
              This simulator is interactive and needs JavaScript to run calculations and charts.
              You can still bookmark the page and try again with JS enabled.
            </p>
            <div className="mt-3 text-sm">
              <a
                href="/embed/sip-vs-panic"
                className="text-[oklch(0.78_0.08_65)] underline"
              >
                Open embed version →
              </a>
            </div>
          </div>
        </section>
      </noscript>
    </>
  );
}
