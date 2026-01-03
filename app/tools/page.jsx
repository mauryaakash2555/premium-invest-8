import Link from "next/link";
import { Card, CardContent } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import BackRow from "@/components/shared/BackRow";

/*
  LAYOUT-LOCKED: /tools hub page
  Spec:
  - Hero + exactly 5 cards
  - Only Tax tool is active
  - Others show "Coming Soon" and appear disabled
  Edit only with explicit instruction.
*/

export const metadata = {
  title: "BM Wealth Intelligence Tools | BM Wealth",
  description:
    "Professional-grade calculators built for Mumbai’s high-income professionals.",
};

function ToolCard({ title, subtitle, href, active }) {
  const content = (
    <Card className="bg-white/5 border-white/10 glass-effect">
      <CardContent className="p-5">
        <div className="flex items-start justify-between gap-4">
          <div className="min-w-0">
            <h2 className="text-base font-semibold text-[color:var(--color-matte-gold)] truncate">
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
              <Button className="bg-[color:var(--color-matte-gold)] text-black hover:bg-[color:var(--color-matte-gold)]/90">
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
  return (
    <>
      <BackRow />
      <section className="px-6 lg:px-10 py-14 lg:py-20">
        <div className="max-w-6xl mx-auto">
          <div className="text-center">
            <h1 className="text-3xl sm:text-4xl font-semibold text-[color:var(--color-matte-gold)]">
              BM Wealth Intelligence Tools
            </h1>
            <p className="mt-3 text-sm sm:text-base text-white/75 max-w-2xl mx-auto">
              Professional-grade calculators built for Mumbai’s high-income professionals.
            </p>
          </div>

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
              active={false}
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
          </div>

          <div className="mt-10 rounded-2xl border border-white/10 bg-white/5 p-5">
            <p className="text-sm text-white/75">
              Each tool is built using real regulatory rules, Mumbai-specific assumptions, and BM Wealth’s internal advisory frameworks. Tools are released individually after audit-level validation.
            </p>
            <p className="mt-4 text-[11px] text-white/55">
              AMFI Registered ARN 90008 | Educational tools only | No investment advice
            </p>
          </div>
        </div>
      </section>
    </>
  );
}
