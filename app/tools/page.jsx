import Link from "next/link";
import { Card, CardContent } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import BackRow from "@/components/shared/BackRow";
import FAQSection from "@/components/shared/FAQSection";
import { buildMetadata } from "@/lib/seo/metadata";
import { getBodyTextPaletteStyles } from "@/lib/ui/bodyTextPaletteStyles";
import { LaserBeam } from "@/components/ui/laser-beam";

/*
  LAYOUT-LOCKED: /tools hub page
  Spec:
  - Hero + tools grid
  - All visible tools are active and navigable
  Edit only with explicit instruction.
*/

export const metadata = buildMetadata({
  title: "BM Wealth Intelligence Tools | BM Wealth",
  description:
    "Professional-grade calculators built for Mumbai’s high-income professionals.",
  path: "/tools",
});

function ToolCard({ title, subtitle, href, laser = false, className = "" }) {
  return (
    <Link href={href} className="block" aria-label={title}>
    <Card
      className={`border border-white/10 ultra-luxury-glass premium-hover-glow relative overflow-hidden rounded-none h-full ${laser ? "overflow-visible" : ""} ${className}`}
    >
      {laser ? (
        <div className="absolute inset-0 pointer-events-none overflow-visible" aria-hidden="true" style={{ borderRadius: 0 }}>
          <LaserBeam
            width="100%"
            height="100%"
            color="var(--lux-accent)"
            borderRadius={0}
            duration={12}
            glowIntensity={20}
            beamLength={0.12}
            borderWidth={1}
            baseBorderWidth={0}
            backgroundColor="transparent"
            normalizeToSize
            normalizeBaseWidth={350}
            normalizeBaseHeight={220}
            normalizeBaseBorderRadius={0}
          />
        </div>
      ) : null}
      <CardContent className="p-5 relative z-10 flex flex-col h-full">
        <div className="flex items-start justify-between gap-4 flex-1">
          <div className="min-w-0">
            <h2 className="text-base font-semibold gold-gradient-text truncate">{title}</h2>
            {subtitle ? <p className="mt-1 text-sm text-white/70">{subtitle}</p> : null}
          </div>
        </div>

        <div className="mt-5 mt-auto">
          <div className="inline-flex">
            <Button className="calculator-premium-cta">
              Open Tool
            </Button>
          </div>
        </div>
      </CardContent>
    </Card>
    </Link>
  );
}

export default function ToolsHubPage() {
  const BODY_TEXT_STYLES = getBodyTextPaletteStyles({ scopeSelector: ".bp-body" });

  const faqs = [
    {
      question: "Are these tools free to use?",
      answer:
        "Yes. Core calculators are free to use. Some tools may offer optional premium reports, but you can use the calculators without buying anything.",
    },
    {
      question: "Do these calculators give personalised advice?",
      answer:
        "The outputs are estimates based on your inputs and published rules/assumptions. Please verify with official sources for final outcomes.",
    },
    {
      question: "Which tool should I start with?",
      answer:
        "If your goal is tax clarity, start with Tax Optimization Intelligence. If you're comparing real estate vs investing discipline, use the Mumbai Property vs SIP Analyzer.",
    },
    {
      question: "Will you call me if I use the tools?",
      answer:
        "No. If you want to speak with us, you can reach us from the Contact page.",
    },
  ];

  return (
    <>
      <BackRow />
      <style dangerouslySetInnerHTML={{ __html: BODY_TEXT_STYLES }} />
      <section className="px-6 lg:px-10 py-14 lg:py-20">
        <div className="max-w-6xl mx-auto">
          <div className="text-center">
            <h1 className="text-3xl sm:text-4xl font-semibold gold-gradient-text">
              BM Wealth Intelligence Tools
            </h1>
            <p className="mt-3 text-sm sm:text-base text-white/75 max-w-2xl mx-auto">
              Professional-grade calculators built for Mumbai’s high-income professionals.
            </p>            <p className="mt-3 text-xs sm:text-sm text-white/55 max-w-xl mx-auto">
              Need deeper checklists and templates?{' '}
              <a
                href="https://store.bmwealth.co.in"
                target="_blank"
                rel="noopener noreferrer"
                className="underline underline-offset-4 gold-gradient-text"
              >
                Visit BM Digital Store →
              </a>
            </p>          </div>

          <div className="bp-body">
              <div className="mt-8 rounded-none border border-white/10 ultra-luxury-glass gold-grain-texture p-5">
                <h2 className="text-lg font-semibold gold-gradient-text">How to use these tools</h2>
                <p className="mt-2 text-sm text-white/75">
                  These calculators are designed to turn a vague goal into an actionable decision. Start by entering conservative inputs
                  (realistic salary growth, expected returns, and buffers). Then read the output as a range, not a guarantee — the goal is
                  to make trade-offs visible so you can execute with confidence.
                </p>
                <p className="mt-3 text-sm text-white/75">
                  A simple workflow: (1) pick the tool closest to your immediate decision, (2) run one conservative and one optimistic
                  scenario, (3) note the delta and what variables drive it, and (4) convert that into an execution checklist (SIP amount,
                  asset allocation, regime choice, coverage target, or timeline). If you want help validating assumptions or mapping the
                  result into a portfolio, you can reach us via the Contact page.
                </p>
              </div>

            <div className="mt-10 grid grid-cols-1 lg:grid-cols-2 gap-4 auto-rows-fr">
              <ToolCard
                title="Free ITR Filing Help"
                subtitle="Upload Form 16, AIS, or Bank Statement • OCR extraction • Educational estimate"
                href="/tools/itr-filing-help"
                laser
              />
              <ToolCard
                title="Tax Optimization Intelligence — FY 2025–26"
                subtitle="Old vs New regime • Zero-tax threshold • Execution-first"
                href="/tools/tax-optimization"
              />
              <ToolCard
                title="Mumbai Property vs SIP Analyzer"
                href="/tools/property-vs-sip"
                subtitle="Wealth gap • Opportunity cost • Premium report"
              />
              <ToolCard
                title="Retirement Gap Stress Test"
                href="/tools/retirement-gap"
                subtitle="Corpus gap • Inflation-adjusted • SIP to close gap"
              />
              <ToolCard
                title="Lumpsum Growth Planner"
                href="/tools/lumpsum-planner"
                subtitle="Maturity projection • SIP comparison • Wealth multiplier"
              />
              <ToolCard
                title="Human Life Value Shield"
                href="/tools/insurance-value"
                subtitle="Coverage gap • Income replacement • Term insurance estimate"
              />
              <ToolCard
                title="All in One Financial Calculator"
                subtitle="SIP • Lumpsum • EMI • Tax • PPF • NPS • Goal Planning + more"
                href="/tools/all-calculators"
                className="min-h-[130px]"
              />
            </div>

            <div className="mt-10 rounded-none border border-white/10 ultra-luxury-glass gold-grain-texture p-5">
              <p className="text-sm text-white/75">
                Each tool is built using real regulatory rules, Mumbai-specific assumptions, and BM Wealth’s internal advisory frameworks. Tools are released individually after audit-level validation.
              </p>
              <p className="mt-4 text-[11px] text-white/55">
                PMS Certification 2430447816 | ARN 90008 | IRDAI 277925
              </p>
              <p className="mt-3 text-[11px] text-white/55">
                Explore: <Link href="/blog" className="underline underline-offset-4">Blogs</Link> ·{' '}
                <Link href="/services" className="underline underline-offset-4">Services</Link> ·{' '}
                <Link href="/onboarding" className="underline underline-offset-4">Get Started</Link> ·{' '}
                <Link href="/contact" className="underline underline-offset-4">Contact</Link>
              </p>
            </div>

            <FAQSection faqs={faqs} pageUrl="https://bmwealth.co.in/tools" />
          </div>
        </div>
      </section>
    </>
  );
}
