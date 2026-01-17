import Link from "next/link";
import { Card, CardContent } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import BackRow from "@/components/shared/BackRow";
import FAQSection from "@/components/shared/FAQSection";
import { buildMetadata } from "@/lib/seo/metadata";
import { getBodyTextPaletteStyles } from "@/lib/ui/bodyTextPaletteStyles";
import { LaserBeam } from "@/components/LaserBeamCanvas";

/*
  LAYOUT-LOCKED: /tools hub page
  Spec:
  - Hero + exactly 6 cards (updated with All-in-One Calculator)
  - Tax tool and Property vs SIP are active
  - Others show "Coming Soon" and appear disabled
  Edit only with explicit instruction.
*/

export const metadata = buildMetadata({
  title: "BM Wealth Intelligence Tools | BM Wealth",
  description:
    "Professional-grade calculators built for Mumbai’s high-income professionals.",
  path: "/tools",
});

function ToolCard({ title, subtitle, href, active, laser = false }) {
  const content = (
    <Card className="border border-white/10 ultra-luxury-glass gold-grain-texture premium-hover-glow relative overflow-hidden rounded-xl h-full">
      {laser ? (
        <div className="absolute inset-0 pointer-events-none z-10" aria-hidden="true">
          <LaserBeam
            width="100%"
            height="100%"
            color="#c0a062"
            borderRadius={12}
            duration={16}
            glowIntensity={12}
            beamLength={0.08}
            borderWidth={0}
            backgroundColor="transparent"
          />
        </div>
      ) : null}
      <CardContent className="p-5 relative z-20 h-full flex flex-col">
        <div className="flex items-start justify-between gap-4 flex-1">
          <div className="min-w-0">
            <h2 className="text-base font-semibold gold-gradient-text truncate">
              {title}
            </h2>
            {subtitle ? (
              <p className="mt-1 text-sm text-white/70">{subtitle}</p>
            ) : null}
          </div>
          {!active ? (
            <Badge className="shrink-0 bg-white/10 text-white/80 border border-white/10">
              Coming Soon
            </Badge>
          ) : null}
        </div>

        <div className="mt-5">
          {active ? (
            <Link href={href} className="inline-flex">
              <Button className="calculator-premium-cta">
                Open Tool
              </Button>
            </Link>
          ) : (
            <Button
              disabled
              className="bg-white/5 text-white/50 border border-white/10"
            >
              Launching Soon
            </Button>
          )}
        </div>
      </CardContent>
    </Card>
  );

  // Keep "Coming Soon" visuals locked, but allow navigation to internal
  // Coming Soon pages (still no logic exposed).
  if (!active && href && href !== "#") {
    return (
      <Link href={href} className="block" aria-label={title}>
        {content}
      </Link>
    );
  }

  return content;
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

  const faqSchema = {
    "@context": "https://schema.org",
    "@type": "FAQPage",
    mainEntity: faqs.map((f) => ({
      "@type": "Question",
      name: f.question,
      acceptedAnswer: {
        "@type": "Answer",
        text: f.answer,
      },
    })),
  };

  return (
    <>
      <BackRow />
      <style dangerouslySetInnerHTML={{ __html: BODY_TEXT_STYLES }} />
      <script
        id="tools-faq-schema"
        type="application/ld+json"
        dangerouslySetInnerHTML={{ __html: JSON.stringify(faqSchema) }}
      />
      <section className="px-6 lg:px-10 py-14 lg:py-20">
        <div className="max-w-6xl mx-auto">
          <div className="text-center">
            <h1 className="text-3xl sm:text-4xl font-semibold gold-gradient-text">
              BM Wealth Intelligence Tools
            </h1>
            <p className="mt-3 text-sm sm:text-base text-white/75 max-w-2xl mx-auto">
              Professional-grade calculators built for Mumbai’s high-income professionals.
            </p>
          </div>

          <div className="bp-body">
            <div className="mt-10 grid grid-cols-1 lg:grid-cols-2 gap-4">
              <ToolCard
                active
                title="Tax Optimization Intelligence — FY 2025–26"
                subtitle="Old vs New regime • Zero-tax threshold • Execution-first"
                href="/tools/tax-optimization"
              />
              <ToolCard
                title="Mumbai Property vs SIP Analyzer"
                href="/tools/property-vs-sip"
                subtitle="Wealth gap • Opportunity cost • Premium report"
                active
              />
              <ToolCard
                title="Retirement Gap Stress Test"
                href="/tools/retirement-gap"
                active={false}
              />
              <ToolCard
                title="Lumpsum Growth Planner"
                href="/tools/lumpsum-planner"
                active={false}
              />
              <ToolCard
                title="Human Life Value Shield"
                href="/tools/insurance-value"
                active={false}
              />
              <ToolCard
                active
                title="All in One Financial Calculator"
                subtitle="SIP • Lumpsum • EMI • Tax • PPF • NPS • Goal Planning + more"
                href="/tools/all-calculators"
                laser
              />
            </div>

            <div className="mt-10 rounded-2xl border border-white/10 ultra-luxury-glass gold-grain-texture p-5">
              <p className="text-sm text-white/75">
                Each tool is built using real regulatory rules, Mumbai-specific assumptions, and BM Wealth’s internal advisory frameworks. Tools are released individually after audit-level validation.
              </p>
              <p className="mt-4 text-[11px] text-white/55">
                PMS Certification 2430447816 | ARN 90008 | IRDAI 277925
              </p>
              <p className="mt-3 text-[11px] text-white/55">
                Explore: <Link href="/blog" className="underline underline-offset-4">Blogs</Link> ·{' '}
                <Link href="/services" className="underline underline-offset-4">Services</Link> ·{' '}
                <Link href="/contact" className="underline underline-offset-4">Contact</Link>
              </p>
            </div>

            <FAQSection faqs={faqs} />
          </div>
        </div>
      </section>
    </>
  );
}
