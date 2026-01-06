import BackRow from "@/components/shared/BackRow";
import { buildMetadata } from "@/lib/seo/metadata";
import Image from "next/image";

import { BaseCalculatorLayout } from "@/components/calculators/BaseCalculatorLayout";
import { CalculatorHeader } from "@/components/calculators/CalculatorHeader";

const PATH = "/tools/insurance-value";

export const metadata = {
  ...buildMetadata({
    title: "Insurance Value — Coming Soon | BM Wealth",
    description: "Insurance value/coverage sanity checker (Coming Soon).",
    path: PATH,
  }),
};

export default function InsuranceValueToolPage() {
  return (
    <>
      <BackRow href="/tools" label="← Back to Tools" />
      <section className="px-6 lg:px-10 py-14 lg:py-20">
        <BaseCalculatorLayout
          header={
            <CalculatorHeader
              meta={
                <>
                  <Image src="/logo.webp" alt="BM Wealth" width={20} height={20} className="h-5 w-auto" priority />
                  <span>BM Wealth</span>
                  <span className="text-white/25">•</span>
                  <span>BM Wealth Calculator</span>
                  <span className="text-white/25">•</span>
                  <span className="text-white/45">ARN 90008 | IRDAI 277925</span>
                </>
              }
              title="Insurance Value"
              subtitle="Coming Soon"
            />
          }
          disclaimer={
            "ARN 90008 | IRDAI 277925. For informational purposes; calculations depend on your inputs and prevailing rules. Please verify with official sources for final outcomes."
          }
        >
          <div className="px-6 pb-6 lg:px-10 lg:pb-10">
            <div className="rounded-xl border border-white/10 bg-white/5 p-5 text-center">
              <div className="text-sm font-semibold text-white">This tool is under development.</div>
              <div className="mt-1 text-xs text-slate-200/70">Check back soon.</div>
            </div>
          </div>
        </BaseCalculatorLayout>
      </section>
    </>
  );
}
